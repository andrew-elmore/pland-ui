import React, { useEffect } from 'react';
import AppRouter from '../router/AppRouter';
import AppBar from './layout/AppBar';
import AuthGate from '../auth/AuthGate';
import ClerkTokenBridge from '../auth/ClerkTokenBridge';
import ClerkSessionWatcher from '../auth/ClerkSessionWatcher';
import { isDevAuth } from '../auth/authMode';

const AppContent = () => {
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
            {!isDevAuth() && <ClerkTokenBridge />}
            {!isDevAuth() && <ClerkSessionWatcher />}
            <AppBar />
            <AuthGate>
                <AppRouter />
            </AuthGate>
        </>
    );
};

export default AppContent;
