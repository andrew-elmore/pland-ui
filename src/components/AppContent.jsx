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

    useEffect(() => {
        if (window.google?.maps?.places) return;
        if (document.querySelector('script[src*="maps.googleapis.com"]')) return;
        const script = document.createElement('script');
        script.src = `https://maps.googleapis.com/maps/api/js?key=${import.meta.env.VITE_GOOGLE_MAPS_API_KEY}&libraries=places`;
        script.async = true;
        document.head.appendChild(script);
    }, []);

    return (
        <>
            <LoadingOverlay open={isLoading && !isLoaded} />
            <AppBar />
            <AppRouter />
        </>
    );
};

export default AppContent;
