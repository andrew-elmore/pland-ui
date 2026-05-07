import { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { actions as timeActions, selectors as timeSelectors } from '../store/time';
import { actions as uiActions } from '../store/ui';

const useTimeEditor = (times, planId, { onAfterUpdate } = {}) => {
    const dispatch = useDispatch();
    const timeMutating = useSelector(timeSelectors.isMutating);
    const [editingTime, setEditingTime] = useState(null);

    const handleEditTime = (timeIdOrTime) => {
        const time = typeof timeIdOrTime === 'object'
            ? timeIdOrTime
            : [...times].find(t => t.id === timeIdOrTime);
        if (time) {
            setEditingTime(time);
            dispatch(uiActions.openDialog(`time-${time.id}`));
        }
    };

    const handleSubmitTime = (data) => {
        if (!editingTime) return;
        const promise = dispatch(timeActions.update(editingTime.id, data));
        if (onAfterUpdate) promise.then(onAfterUpdate);
    };

    const clearEditingTime = () => setEditingTime(null);

    return { editingTime, timeMutating, handleEditTime, handleSubmitTime, clearEditingTime };
};

export default useTimeEditor;
