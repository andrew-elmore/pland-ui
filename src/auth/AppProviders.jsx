import React from 'react';
import { ClerkProvider } from '@clerk/react';
import clerkAppearance from '../theme/clerkAppearance';
import { isDevAuth } from './authMode';

const CLERK_KEY = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY;

export default function AppProviders({ children }) {
    if (isDevAuth()) return children;

    if (!CLERK_KEY) {
        throw new Error(
            'Missing VITE_CLERK_PUBLISHABLE_KEY. Set a Clerk key, or use '
            + 'VITE_AUTH_MODE=dev for local development and e2e tests.',
        );
    }

    return (
        <ClerkProvider
            publishableKey={CLERK_KEY}
            afterSignOutUrl="/"
            appearance={clerkAppearance}
        >
            {children}
        </ClerkProvider>
    );
}
