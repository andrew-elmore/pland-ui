import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import AppRouter from '../router/AppRouter';
import AppBar from './layout/AppBar';
import { LoadingOverlay } from './common/LoadingOverlay';
import { actions, selectors } from '../store/auth';

const AppContent = () => {
    const dispatch = useDispatch();
    const isLoading = useSelector(selectors.isLoading);
    const isLoaded = useSelector(selectors.isLoaded);

    useEffect(() => {
        const token = localStorage.getItem('pland_token');
        if (token) {
            dispatch(actions.restore());
        }
    }, [dispatch]);

    return (
        <>
            <LoadingOverlay open={isLoading && !isLoaded} />
            <AppBar />
            <AppRouter />
        </>
    );
};

export default AppContent;
