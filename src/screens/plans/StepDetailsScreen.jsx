import React, { useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import {
    Box,
    Typography,
    CircularProgress,
    Alert,
    IconButton,
    Chip,
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import EditIcon from '@mui/icons-material/Edit';
import { actions as stepActions, selectors as stepSelectors } from '../../store/step';
import { actions as routeActions, selectors as routeSelectors } from '../../store/route';
import { actions as participantActions, selectors as participantSelectors } from '../../store/participant';
import { actions as locationActions, selectors as locationSelectors } from '../../store/location';
import RouteDisplay from '../../features/route/RouteDisplay';
import ROUTES from '../../router/routes';

const formatTime = (date) => {
    if (!date) return '';
    return new Date(date).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
};

const StepDetailsScreen = () => {
    const { planId, itineraryId, stepId } = useParams();
    const navigate = useNavigate();
    const dispatch = useDispatch();

    const step = useSelector(stepSelectors.current);
    const { isLoading, isLoaded } = useSelector(stepSelectors.currentMeta);
    const error = useSelector(stepSelectors.error);

    const route = useSelector(routeSelectors.current);
    const { isLoading: routeLoading } = useSelector(routeSelectors.currentMeta);

    const participants = useSelector(participantSelectors.list);
    const locations = useSelector(locationSelectors.list);

    useEffect(() => {
        if (planId) {
            dispatch(participantActions.list(planId));
            dispatch(locationActions.list(planId));
        }
    }, [dispatch, planId]);

    useEffect(() => {
        if (stepId && step.id !== stepId) {
            dispatch(stepActions.get(stepId));
        }
    }, [dispatch, stepId, step.id]);

    useEffect(() => {
        if (step.routeId && route.id !== step.routeId) {
            dispatch(routeActions.get(step.routeId));
        }
    }, [dispatch, step.routeId, route.id]);

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

    if (isLoaded && !step.id) {
        return <Alert severity="warning">Step not found</Alert>;
    }

    const participantList = [...participants];
    const stepParticipants = participantList.filter((p) => (step.participantIds ?? []).includes(p.id));
    const location = [...locations].find((l) => l.id === step.locationId);

    return (
        <>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <IconButton
                        size="small"
                        onClick={() => navigate(ROUTES.PLAN_ITINERARIES.replace(':planId', planId))}
                    >
                        <ArrowBackIcon fontSize="small" />
                    </IconButton>
                    <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                        {step.name}
                    </Typography>
                </Box>
                <IconButton
                    size="small"
                    onClick={() => navigate(ROUTES.STEP_EDIT.replace(':planId', planId).replace(':itineraryId', itineraryId).replace(':stepId', stepId))}
                >
                    <EditIcon fontSize="small" />
                </IconButton>
            </Box>

            {step.startTime && step.endTime && (
                <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                    {formatTime(step.startTime)} – {formatTime(step.endTime)}
                </Typography>
            )}

            {stepParticipants.length > 0 && (
                <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap', mb: 1 }}>
                    {stepParticipants.map((p) => (
                        <Chip
                            key={p.id}
                            label={p.fullName || `${p.firstName} ${p.lastName}`.trim()}
                            size="small"
                            variant="outlined"
                            sx={{ height: 22, fontSize: '0.7rem' }}
                        />
                    ))}
                </Box>
            )}

            {!step.isRouteStep && location && (
                <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                    {location.name}
                </Typography>
            )}

            {step.isRouteStep && (
                <Box sx={{ mt: 2 }}>
                    {routeLoading && !route.id ? (
                        <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
                            <CircularProgress size={24} />
                        </Box>
                    ) : route.id ? (
                        <RouteDisplay route={route} />
                    ) : null}
                </Box>
            )}
        </>
    );
};

export default StepDetailsScreen;
