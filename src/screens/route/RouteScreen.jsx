import React, { useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import {
    Box,
    Typography,
    List,
    ListItemButton,
    ListItemText,
    CircularProgress,
    Alert,
    Chip,
    Button,
} from '@mui/material';
import RefreshIcon from '@mui/icons-material/Refresh';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import { actions as routeActions, selectors as routeSelectors } from '../../store/route';
import Route from '../../domain/Route';
import ROUTES from '../../router/routes';

const RouteScreen = () => {
    const { planId } = useParams();
    const dispatch = useDispatch();
    const navigate = useNavigate();

    const routes = useSelector(routeSelectors.list);
    const { isLoading, isLoaded } = useSelector(routeSelectors.listMeta);
    const isMutating = useSelector(routeSelectors.isMutating);
    const error = useSelector(routeSelectors.error);

    useEffect(() => {
        if (planId) {
            dispatch(routeActions.list(planId));
        }
    }, [dispatch, planId]);

    const handleRecalculateAll = () => {
        dispatch(routeActions.recalculateAll(planId));
    };

    if (isLoading && !isLoaded) {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
                <CircularProgress size={28} />
            </Box>
        );
    }

    return (
        <>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
                <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>Routes</Typography>
                {routes.length > 0 && (
                    <Button
                        size="small"
                        variant="outlined"
                        startIcon={isMutating ? <CircularProgress size={16} /> : <RefreshIcon />}
                        onClick={handleRecalculateAll}
                        disabled={isMutating}
                    >
                        {isMutating ? 'Recalculating...' : 'Recalculate All'}
                    </Button>
                )}
            </Box>

            {error && <Alert severity="error" sx={{ mb: 1 }}>{error}</Alert>}

            {isLoaded && routes.length === 0 && (
                <Box sx={{ textAlign: 'center', py: 4 }}>
                    <Typography variant="body2" color="text.secondary">No routes yet. Routes are created when you add a destination to a step.</Typography>
                </Box>
            )}

            {routes.length > 0 && (
                <List disablePadding>
                    {[...routes].map((route) => (
                        <ListItemButton
                            key={route.id}
                            onClick={() => navigate(ROUTES.PLAN_ROUTE_DETAILS.replace(':planId', planId).replace(':routeId', route.id))}
                            sx={{ borderBottom: '1px solid', borderColor: 'divider', py: 1.5, px: 0 }}
                        >
                            <ListItemText
                                primary={
                                    <Typography variant="body2" sx={{ fontWeight: 600 }}>
                                        {route.originName || 'Unknown'} → {route.destinationName || 'Unknown'}
                                    </Typography>
                                }
                                secondary={
                                    <Box sx={{ display: 'flex', gap: 1, mt: 0.5, flexWrap: 'wrap' }}>
                                        <Chip label={Route.TRAVEL_MODE_LABELS[route.travelMode]} size="small" variant="outlined" sx={{ height: 20, fontSize: '0.7rem' }} />
                                        <Chip label={`${route.durationMinutes} min`} size="small" variant="outlined" sx={{ height: 20, fontSize: '0.7rem' }} />
                                        {route.distanceDisplay && (
                                            <Chip label={route.distanceDisplay} size="small" variant="outlined" sx={{ height: 20, fontSize: '0.7rem' }} />
                                        )}
                                        <Chip label={Route.TIME_MODE_LABELS[route.timeMode]} size="small" variant="outlined" sx={{ height: 20, fontSize: '0.7rem' }} />
                                        {route.transitModes?.length > 0 && route.transitModes.map((tm) => (
                                            <Chip key={tm} label={Route.TRANSIT_MODE_LABELS[tm]} size="small" variant="outlined" color="primary" sx={{ height: 20, fontSize: '0.7rem' }} />
                                        ))}
                                    </Box>
                                }
                            />
                            <ChevronRightIcon color="action" />
                        </ListItemButton>
                    ))}
                </List>
            )}
        </>
    );
};

export default RouteScreen;
