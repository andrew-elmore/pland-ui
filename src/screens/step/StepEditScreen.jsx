import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import {
    Box,
    Container,
    Typography,
    Paper,
    TextField,
    Button,
    Autocomplete,
    Alert,
    Chip,
} from '@mui/material';
import DirectionsIcon from '@mui/icons-material/Directions';
import { actions as stepActions, selectors as stepSelectors } from '../../store/step';
import { actions as participantActions, selectors as participantSelectors } from '../../store/participant';
import { actions as groupActions, selectors as groupSelectors } from '../../store/group';
import { actions as locationActions, selectors as locationSelectors } from '../../store/location';
import { actions as timeActions, selectors as timeSelectors } from '../../store/time';
import useMutateEffect from '../../hooks/useMutateEffect';
import ROUTES from '../../router/routes';
import Route from '../../domain/Route';
import * as routeService from '../../services/route';
import TimeFormDialog from '../../components/common/TimeFormDialog';
import ParticipantPicker from '../../features/step/ParticipantPicker';
import TimeSelector from '../../features/step/TimeSelector';
import RouteForm from '../../features/step/RouteForm';

const StepEditScreen = () => {
    const { planId, stepId } = useParams();
    const navigate = useNavigate();
    const dispatch = useDispatch();

    const step = useSelector(stepSelectors.current);
    const { isLoading, isLoaded, isMutating } = useSelector(stepSelectors.currentMeta);
    const error = useSelector(stepSelectors.error);
    const participants = useSelector(participantSelectors.list);
    const groups = useSelector(groupSelectors.list);
    const locations = useSelector(locationSelectors.list);
    const times = useSelector(timeSelectors.list);

    const [stepName, setStepName] = useState('');
    const [stepStartTimeId, setStepStartTimeId] = useState(null);
    const [stepEndTimeId, setStepEndTimeId] = useState(null);
    const [stepParticipantIds, setStepParticipantIds] = useState([]);
    const [stepLocationId, setStepLocationId] = useState(null);
    const [initialized, setInitialized] = useState(false);

    const [isRouteStep, setIsRouteStep] = useState(false);
    const [originLocationId, setOriginLocationId] = useState(null);
    const [destinationLocationId, setDestinationLocationId] = useState(null);
    const [travelMode, setTravelMode] = useState(Route.TRAVEL_MODE_DRIVE);
    const [transitModes, setTransitModes] = useState([]);
    const [routeTimeId, setRouteTimeId] = useState(null);
    const [timeMode, setTimeMode] = useState(Route.TIME_MODE_DEPART_AT);
    const [paddingHours, setPaddingHours] = useState('');
    const [paddingMinutes, setPaddingMinutes] = useState('');
    const [routeOptions, setRouteOptions] = useState([]);
    const [selectedRouteIdx, setSelectedRouteIdx] = useState(null);
    const [previewLoading, setPreviewLoading] = useState(false);
    const [initialRouteFields, setInitialRouteFields] = useState(null);

    const [timeDialogOpen, setTimeDialogOpen] = useState(false);
    const [editingTime, setEditingTime] = useState(null);

    useEffect(() => {
        if (planId) {
            dispatch(participantActions.list(planId));
            dispatch(groupActions.list(planId));
            dispatch(locationActions.list(planId));
            dispatch(timeActions.list(planId));
        }
    }, [dispatch, planId]);

    useEffect(() => {
        if (stepId && (!step || step.id !== stepId)) {
            dispatch(stepActions.get(stepId));
        }
    }, [dispatch, stepId, step?.id]);

    useEffect(() => {
        if (step?.id && step.id === stepId && !initialized) {
            setStepName(step.name);
            setStepStartTimeId(step.startTimeId ?? null);
            setStepEndTimeId(step.endTimeId ?? null);
            setStepParticipantIds(step.participantIds ?? []);
            setStepLocationId(step.locationId ?? null);
            if (step.isRouteStep && step.route) {
                setIsRouteStep(true);
                setOriginLocationId(step.route.originLocationId);
                setDestinationLocationId(step.route.destinationLocationId);
                setTravelMode(step.route.travelMode);
                setTransitModes(step.route.transitModes || []);
                setTimeMode(step.route.timeMode);
                setRouteTimeId(step.route.timeMode === 'depart_at' ? step.startTimeId : step.endTimeId);
                setInitialRouteFields({
                    originLocationId: step.route.originLocationId,
                    destinationLocationId: step.route.destinationLocationId,
                    travelMode: step.route.travelMode,
                    transitModesKey: (step.route.transitModes || []).join(','),
                    timeMode: step.route.timeMode,
                    routeTimeId: step.route.timeMode === 'depart_at' ? step.startTimeId : step.endTimeId,
                });
                const computedTimeId = step.route.timeMode === 'depart_at' ? step.endTimeId : step.startTimeId;
                const computedTime = [...times].find(t => t.id === computedTimeId);
                if (!computedTime) return;
                if (computedTime.offsetSeconds) {
                    const abs = Math.abs(computedTime.offsetSeconds);
                    setPaddingHours(String(Math.floor(abs / 3600) || ''));
                    setPaddingMinutes(String(Math.round((abs % 3600) / 60) || ''));
                }
            }
            setInitialized(true);
        }
    }, [step, stepId, initialized, times]);

    const transitModesKey = transitModes.join(',');
    useEffect(() => {
        if (!initialized) return;
        setRouteOptions([]);
        setSelectedRouteIdx(null);
    }, [initialized, originLocationId, destinationLocationId, travelMode, transitModesKey, timeMode, routeTimeId]);

    const submit = useMutateEffect(isMutating, error, {
        onSuccess: () => {
            navigate(ROUTES.PLAN_ITINERARIES.replace(':planId', planId));
        },
    });

    const handleSubmit = () => {
        if (!stepName.trim()) return;

        if (isRouteStep) {
            if (!originLocationId || !destinationLocationId || !routeTimeId) return;
            if (routeChanged && selectedRouteIdx === null) return;
            const payload = {
                name: stepName.trim(),
                participantIds: stepParticipantIds,
                originLocationId,
                destinationLocationId,
                travelMode,
                transitModes,
                timeId: routeTimeId,
                timeMode,
                paddingSeconds: (parseInt(paddingHours, 10) || 0) * 3600 + (parseInt(paddingMinutes, 10) || 0) * 60,
            };
            if (routeChanged) payload.routeData = routeOptions[selectedRouteIdx];
            submit(stepActions.update(stepId, payload));
        } else {
            if (!stepStartTimeId || !stepEndTimeId) return;
            submit(stepActions.update(stepId, {
                name: stepName.trim(),
                startTimeId: stepStartTimeId,
                endTimeId: stepEndTimeId,
                participantIds: stepParticipantIds,
                locationId: stepLocationId,
            }));
        }
    };

    const handleDelete = () => {
        dispatch(stepActions.remove(stepId));
        navigate(ROUTES.PLAN_ITINERARIES.replace(':planId', planId));
    };

    const handleCancel = () => {
        navigate(ROUTES.PLAN_ITINERARIES.replace(':planId', planId));
    };

    const handleToggleRoute = () => {
        if (!isRouteStep) {
            setOriginLocationId(stepLocationId);
            setStepLocationId(null);
        } else {
            setStepLocationId(originLocationId);
            setOriginLocationId(null);
            setDestinationLocationId(null);
            setTransitModes([]);
            setRouteTimeId(null);
            setTimeMode(Route.TIME_MODE_DEPART_AT);
            setPaddingHours('');
            setPaddingMinutes('');
        }
        setIsRouteStep(!isRouteStep);
    };

    const handlePreview = async () => {
        if (!originLocationId || !destinationLocationId || !routeTimeId) return;
        setPreviewLoading(true);
        try {
            const timeList = [...times];
            const routes = await routeService.preview({
                originLocationId,
                destinationLocationId,
                travelMode,
                transitModes,
                datetime: timeList.find(t => t.id === routeTimeId)?.datetime,
                timeMode,
            });
            setRouteOptions(routes);
            if (routes.length === 1) setSelectedRouteIdx(0);
        } catch (err) {
            console.error(err);
        }
        setPreviewLoading(false);
    };

    const handleEditTime = (timeId) => {
        const time = [...times].find(t => t.id === timeId);
        if (time) {
            setEditingTime(time);
            setTimeDialogOpen(true);
        }
    };

    const handleSubmitTime = (data) => {
        if (editingTime) {
            dispatch(timeActions.update(editingTime.id, data));
        }
        setTimeDialogOpen(false);
        setEditingTime(null);
    };

    if (isLoading && !isLoaded) {
        return null;
    }

    if (isLoaded && !step?.id) {
        return (
            <Container maxWidth="sm">
                <Box py={4}><Alert severity="warning">Step not found</Alert></Box>
            </Container>
        );
    }

    const timeList = [...times];
    const locationList = [...locations];

    const routeChanged = initialized && isRouteStep && (
        initialRouteFields === null || (
            originLocationId !== initialRouteFields.originLocationId ||
            destinationLocationId !== initialRouteFields.destinationLocationId ||
            travelMode !== initialRouteFields.travelMode ||
            transitModes.join(',') !== initialRouteFields.transitModesKey ||
            timeMode !== initialRouteFields.timeMode ||
            routeTimeId !== initialRouteFields.routeTimeId
        )
    );

    const isSubmitDisabled = isMutating
        || !stepName.trim()
        || stepParticipantIds.length === 0
        || (isRouteStep ? (!originLocationId || !destinationLocationId || !routeTimeId || (routeChanged && selectedRouteIdx === null)) : (!stepStartTimeId || !stepEndTimeId));

    return (
        <Container maxWidth="sm">
            <Box py={4}>
                <Paper elevation={3} sx={{ p: 4 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 3 }}>
                        <Typography variant="h5">Edit Step</Typography>
                        {isRouteStep && step.route && (
                            <Chip
                                label={`${Route.TRAVEL_MODE_LABELS[step.route.travelMode]} · ${Math.round(step.route.durationSeconds / 60)} min`}
                                size="small"
                                variant="outlined"
                            />
                        )}
                    </Box>

                    {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

                    <TextField
                        autoFocus
                        label="Name"
                        fullWidth
                        value={stepName}
                        onChange={(e) => setStepName(e.target.value)}
                        size="small"
                    />

                    <ParticipantPicker
                        participantIds={stepParticipantIds}
                        onChange={setStepParticipantIds}
                        participants={participants}
                        groups={groups}
                    />

                    {isRouteStep ? (
                        <RouteForm
                            originLocationId={originLocationId}
                            onOriginChange={setOriginLocationId}
                            showOrigin={true}
                            destinationLocationId={destinationLocationId}
                            onDestinationChange={setDestinationLocationId}
                            travelMode={travelMode}
                            onTravelModeChange={setTravelMode}
                            transitModes={transitModes}
                            onTransitModesChange={setTransitModes}
                            timeMode={timeMode}
                            onTimeModeChange={setTimeMode}
                            routeTimeId={routeTimeId}
                            onRouteTimeChange={setRouteTimeId}
                            paddingHours={paddingHours}
                            onPaddingHoursChange={setPaddingHours}
                            paddingMinutes={paddingMinutes}
                            onPaddingMinutesChange={setPaddingMinutes}
                            routeOptions={routeOptions}
                            selectedRouteIdx={selectedRouteIdx}
                            onRouteSelect={setSelectedRouteIdx}
                            previewLoading={previewLoading}
                            onPreview={handlePreview}
                            showPreview={routeChanged}
                            onRemoveDestination={handleToggleRoute}
                            locationList={locationList}
                            timeList={timeList}
                            onEditTime={handleEditTime}
                        />
                    ) : (
                        <>
                            <Autocomplete
                                options={locationList}
                                getOptionLabel={(option) => option.name || ''}
                                value={locationList.find(l => l.id === stepLocationId) ?? null}
                                onChange={(_, value) => setStepLocationId(value?.id ?? null)}
                                isOptionEqualToValue={(a, b) => a.id === b.id}
                                renderInput={(params) => (
                                    <TextField {...params} label="Location (optional)" size="small" />
                                )}
                                size="small"
                                sx={{ mt: 2 }}
                            />

                            <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 1 }}>
                                <Button
                                    size="small"
                                    startIcon={<DirectionsIcon />}
                                    onClick={handleToggleRoute}
                                    sx={{ textTransform: 'none', fontSize: '0.75rem' }}
                                >
                                    Add Destination
                                </Button>
                            </Box>

                            <TimeSelector
                                value={stepStartTimeId}
                                onChange={setStepStartTimeId}
                                onEdit={handleEditTime}
                                timeList={timeList}
                                label="Start Time"
                            />

                            <TimeSelector
                                value={stepEndTimeId}
                                onChange={setStepEndTimeId}
                                onEdit={handleEditTime}
                                timeList={timeList}
                                label="End Time"
                            />
                        </>
                    )}

                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 3 }}>
                        <Button variant="outlined" color="error" size="small" onClick={handleDelete} disabled={isMutating} sx={{ borderRadius: '20px', textTransform: 'none' }}>
                            Delete
                        </Button>
                        <Box sx={{ display: 'flex', gap: 1 }}>
                            <Button variant="outlined" size="small" onClick={handleCancel} sx={{ borderRadius: '20px', textTransform: 'none' }}>
                                Cancel
                            </Button>
                            <Button
                                variant="contained"
                                size="small"
                                onClick={handleSubmit}
                                disabled={isSubmitDisabled}
                                sx={{ borderRadius: '20px', textTransform: 'none', fontWeight: 600 }}
                            >
                                Save
                            </Button>
                        </Box>
                    </Box>
                </Paper>
            </Box>

            <TimeFormDialog
                open={timeDialogOpen}
                onClose={() => { setTimeDialogOpen(false); setEditingTime(null); }}
                planId={planId}
                times={times}
                editingTime={editingTime}
                onSubmit={handleSubmitTime}
            />
        </Container>
    );
};

export default StepEditScreen;
