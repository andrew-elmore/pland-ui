import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link, useNavigate } from 'react-router-dom';
import {
    AppBar as MuiAppBar,
    Box,
    Container,
    Button,
    Typography,
    Toolbar,
} from '@mui/material';
import { actions as authActions, selectors as authSelectors } from '../../store/auth';
import { selectors as profileSelectors } from '../../store/profile';
import ROUTES from '../../router/routes';

const AppBar = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();

    const isAuthenticated = useSelector(authSelectors.isAuthenticated);
    const user = useSelector(authSelectors.me);
    const profileFirstName = useSelector(profileSelectors.firstName);
    const profileLastName = useSelector(profileSelectors.lastName);

    const displayName = profileFirstName
        ? `${profileFirstName} ${profileLastName}`.trim()
        : user?.email ?? '';

    const handleLogout = () => {
        dispatch(authActions.logout());
    };

    const handleLoginClick = () => {
        navigate(ROUTES.LOGIN);
    };

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
                        {isAuthenticated ? (
                            <>
                                <Typography
                                    sx={{
                                        fontSize: '0.875rem',
                                        fontWeight: 600,
                                        color: 'text.primary',
                                    }}
                                >
                                    {displayName}
                                </Typography>
                                <Button
                                    variant="outlined"
                                    size="small"
                                    onClick={handleLogout}
                                    sx={{
                                        borderRadius: '20px',
                                        textTransform: 'none',
                                        fontWeight: 600,
                                    }}
                                >
                                    Logout
                                </Button>
                            </>
                        ) : (
                            <Button
                                variant="outlined"
                                size="small"
                                onClick={handleLoginClick}
                                sx={{
                                    borderRadius: '20px',
                                    textTransform: 'none',
                                    fontWeight: 600,
                                }}
                            >
                                Login
                            </Button>
                        )}
                    </Box>
                </Toolbar>
            </Container>
        </MuiAppBar>
    );
};

export default AppBar;
