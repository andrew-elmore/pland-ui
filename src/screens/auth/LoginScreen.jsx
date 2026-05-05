import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { Link } from 'react-router-dom';
import {
    Box,
    Button,
    Container,
    TextField,
    Typography,
    Alert,
} from '@mui/material';
import { actions, selectors } from '../../store/auth';
import ROUTES from '../../router/routes';

const LoginScreen = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const isAuthenticated = useSelector(selectors.isAuthenticated);
    const isLoading = useSelector(selectors.isLoading);
    const storeError = useSelector(selectors.error);

    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [errors, setErrors] = useState({});

    useEffect(() => {
        if (isAuthenticated) {
            navigate(ROUTES.HOME);
        }
    }, [isAuthenticated, navigate]);

    useEffect(() => {
        return () => {
            dispatch(actions.clearError());
        };
    }, [dispatch]);

    const validate = () => {
        const newErrors = {};
        if (!email.trim()) {
            newErrors.email = 'Email is required';
        }
        if (!password) {
            newErrors.password = 'Password is required';
        }
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!validate()) return;
        dispatch(actions.login({ email, password }));
    };

    return (
        <Container maxWidth="sm">
            <Box sx={{ py: 8 }}>
                <Typography variant="h4" sx={{ mb: 3 }}>
                        Login
                </Typography>
                {storeError && (
                    <Alert severity="error" sx={{ mb: 2 }}>
                        {storeError}
                    </Alert>
                )}
                <Box component="form" onSubmit={handleSubmit}>
                    <TextField
                        fullWidth
                        label="Email"
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        error={!!errors.email}
                        helperText={errors.email}
                        sx={{ mb: 2 }}
                    />
                    <TextField
                        fullWidth
                        label="Password"
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        error={!!errors.password}
                        helperText={errors.password}
                        sx={{ mb: 3 }}
                    />
                    <Button
                        fullWidth
                        variant="contained"
                        size="large"
                        type="submit"
                        disabled={isLoading}
                    >
                        {isLoading ? 'Logging in...' : 'Login'}
                    </Button>
                    <Box sx={{ mt: 2, textAlign: 'center' }}>
                        <Typography variant="body2">
                                Don't have an account?{' '}
                            <Typography
                                component={Link}
                                to={ROUTES.REGISTER}
                                variant="body2"
                                sx={{ color: 'primary.main' }}
                            >
                                    Register
                            </Typography>
                        </Typography>
                    </Box>
                </Box>
            </Box>
        </Container>
    );
};

export default LoginScreen;
