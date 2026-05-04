import React, { useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import {
    Box,
    Typography,
    CircularProgress,
    Alert,
    IconButton,
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { actions as routeActions, selectors as routeSelectors } from '../../store/route';
import RouteDisplay from '../../features/route/RouteDisplay';
import ROUTES from '../../router/routes';

const RouteDetailsScreen = () => {
    const { planId, routeId } = useParams();
    const navigate = useNavigate();
    const dispatch = useDispatch();

    const route = useSelector(routeSelectors.current);
    const { isLoading, isLoaded } = useSelector(routeSelectors.currentMeta);
    const error = useSelector(routeSelectors.error);

    useEffect(() => {
        if (routeId && route.id !== routeId) {
            dispatch(routeActions.get(routeId));
        }
    }, [dispatch, routeId, route.id]);

    if (isLoading && !isLoaded) {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
                <CircularProgress size={28} />
            </Box>
        );
    }

    if (error) {
        return <Alert severity="error">{error}</Alert>;
    }

    if (isLoaded && !route.id) {
        return <Alert severity="warning">Route not found</Alert>;
    }

    return (
        <>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                <IconButton
                    size="small"
                    onClick={() => navigate(ROUTES.PLAN_ROUTES.replace(':planId', planId))}
                >
                    <ArrowBackIcon fontSize="small" />
                </IconButton>
                <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                    {route.originName || 'Unknown'} → {route.destinationName || 'Unknown'}
                </Typography>
            </Box>

            <RouteDisplay route={route} />
        </>
    );
};

export default RouteDetailsScreen;
