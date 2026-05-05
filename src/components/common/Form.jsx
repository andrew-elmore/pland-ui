import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Box } from '@mui/material';
import { actions as uiActions, selectors as uiSelectors } from '../../store/ui';
import AppDialog from './AppDialog';

const Form = ({ formType, formData, children, title, activator, actions, alwaysInline, alwaysOpen, maxWidth, onClose }) => {
    const dispatch = useDispatch();
    const openDialog = useSelector(uiSelectors.openDialog);
    const [inlineOpen, setInlineOpen] = useState(false);

    const formId = `${formType}-${formData?.id ?? 'new'}`;
    const isDialogOpen = openDialog === formId;

    const handleOpen = () => {
        if (alwaysInline || openDialog) {
            setInlineOpen(true);
        } else {
            dispatch(uiActions.openDialog(formId));
        }
    };

    const handleClose = () => {
        setInlineOpen(false);
        if (isDialogOpen) dispatch(uiActions.closeDialog());
        if (onClose) onClose();
    };

    const content = typeof children === 'function' ? children({ onClose: handleClose }) : children;
    const resolvedActions = typeof actions === 'function' ? actions({ onClose: handleClose }) : actions;

    if (alwaysOpen) {
        return <>{content}</>;
    }

    const isActive = isDialogOpen || inlineOpen;

    const activatorEl = activator
        ? React.cloneElement(activator, {
            onClick: (...args) => {
                activator.props.onClick?.(...args);
                handleOpen();
            },
        })
        : null;

    if (!alwaysInline && isDialogOpen) {
        return (
            <>
                {activatorEl}
                <AppDialog id={formId} title={title} maxWidth={maxWidth} actions={resolvedActions} onClose={onClose}>
                    {content}
                </AppDialog>
            </>
        );
    }

    return (
        <>
            {activatorEl}
            {isActive && (
                <Box sx={{ mt: 1, p: 1.5, border: '1px solid', borderColor: 'divider', borderRadius: 1 }}>
                    {content}
                    {resolvedActions && (
                        <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1, mt: 1 }}>
                            {resolvedActions}
                        </Box>
                    )}
                </Box>
            )}
        </>
    );
};

export default Form;
