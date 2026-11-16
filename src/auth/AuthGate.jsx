import React from 'react';
import { SignInButton, SignUpButton, useUser } from '@clerk/react';
import { Box, Button, Container, Typography } from '@mui/material';
import { LoadingOverlay } from '../components/common/LoadingOverlay';
import { isDevAuth } from './authMode';

const SignInWall = () => (
    <Container maxWidth="sm">
        <Box sx={{ minHeight: '60vh', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', gap: 2 }}>
            <Typography variant="h4" sx={{ fontWeight: 600 }}>Welcome to Pland</Typography>
            <Typography variant="body1" color="text.secondary">Sign in to start creating plans.</Typography>
            <Box sx={{ display: 'flex', gap: 2, mt: 1 }}>
                <SignInButton mode="modal">
                    <Button variant="contained" sx={{ borderRadius: '20px', textTransform: 'none', fontWeight: 600 }}>
                        Sign in
                    </Button>
                </SignInButton>
                <SignUpButton mode="modal">
                    <Button variant="outlined" sx={{ borderRadius: '20px', textTransform: 'none', fontWeight: 600 }}>
                        Create account
                    </Button>
                </SignUpButton>
            </Box>
        </Box>
    </Container>
);

const ClerkAuthGate = ({ children }) => {
    const { isLoaded, isSignedIn, user } = useUser();
    if (!isLoaded) return <LoadingOverlay open message="Loading..." />;
    if (!isSignedIn) return <SignInWall />;
    return <React.Fragment key={user.id}>{children}</React.Fragment>;
};

export default function AuthGate({ children }) {
    if (isDevAuth()) return children;
    return <ClerkAuthGate>{children}</ClerkAuthGate>;
}
