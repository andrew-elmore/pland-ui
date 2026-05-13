import React from 'react';
import { Box, Button, TextField } from '@mui/material';

const LoginForm = ({ email, password, onChange, errors, onSubmit, isLoading }) => {
    return (
        <Box component="form" onSubmit={onSubmit}>
            <TextField
                fullWidth
                label="Email"
                type="email"
                value={email}
                onChange={(e) => onChange('email', e.target.value)}
                error={!!errors.email}
                helperText={errors.email}
                sx={{ mb: 2 }}
            />
            <TextField
                fullWidth
                label="Password"
                type="password"
                value={password}
                onChange={(e) => onChange('password', e.target.value)}
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
        </Box>
    );
};

export default LoginForm;
