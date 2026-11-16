import React from 'react';
import { Link } from 'react-router-dom';
import { Show, SignInButton, UserButton } from '@clerk/react';
import {
    AppBar as MuiAppBar,
    Box,
    Container,
    Button,
    Typography,
    Toolbar,
} from '@mui/material';
import { isDevAuth } from '../../auth/authMode';
import { devUser } from '../../auth/devUser';

const DevAccount = () => {
    const { firstName, lastName, email } = devUser();
    return (
        <Typography sx={{ fontSize: '0.875rem', fontWeight: 600, color: 'text.primary' }}>
            {`${firstName} ${lastName}`.trim() || email}
        </Typography>
    );
};

const ClerkAccount = () => (
    <>
        <Show when="signed-in">
            <UserButton showName />
        </Show>
        <Show when="signed-out">
            <SignInButton mode="modal">
                <Button
                    variant="outlined"
                    size="small"
                    sx={{
                        borderRadius: '20px',
                        textTransform: 'none',
                        fontWeight: 600,
                    }}
                >
                    Login
                </Button>
            </SignInButton>
        </Show>
    </>
);

const AppBar = () => {
    return (
        <MuiAppBar
            position="sticky"
            sx={{
                backgroundColor: 'background.paper',
                borderBottom: '1px solid',
                borderColor: 'divider',
                boxShadow: 0,
            }}
        >
            <Container maxWidth="lg">
                <Toolbar
                    sx={{
                        px: { xs: 0, md: 2 },
                        justifyContent: 'space-between',
                        minHeight: { xs: 64, sm: 70 },
                    }}
                >
                    <Box
                        component={Link}
                        to="/"
                        sx={{
                            display: 'flex',
                            alignItems: 'center',
                            textDecoration: 'none',
                            py: 1,
                        }}
                    >
                        <Typography variant="h6" sx={{ fontWeight: 700, color: 'text.primary' }}>
                            Pland
                        </Typography>
                    </Box>

                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                        {isDevAuth() ? <DevAccount /> : <ClerkAccount />}
                    </Box>
                </Toolbar>
            </Container>
        </MuiAppBar>
    );
};

export default AppBar;
