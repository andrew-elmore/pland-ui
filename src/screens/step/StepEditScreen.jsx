import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import {
    Box,
    Container,
    Typography,
    TextField,
    Button,
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
import useTimeEditor from '../../hooks/useTimeEditor';
import ROUTES from '../../router/routes';
import Route from '../../domain/Route';
import Step from '../../domain/Step';
import * as routeService from '../../services/route';
import TimeForm from '../../components/common/TimeFormDialog';
import Form from '../../components/common/Form';
import ParticipantPicker from '../../features/step/ParticipantPicker';
import TimeSelector from '../../features/step/TimeSelector';
import RouteForm from '../../features/step/RouteForm';
import LocationPicker from '../../features/step/LocationPicker';
import { hmToSeconds, secondsToHM } from '../../utils/duration';

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

    const [working, setWorking] = useState(() => new Step());
    const [initialized, setInitialized] = useState(false);

    const { editingTime, timeMutating, handleEditTime, handleSubmitTime, clearEditingTime } = useTimeEditor(times, planId);

    const handleChange = (field, value) => {
        setWorking(prev => prev.clone().set(field, value));
    };

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
            setWorking(new Step({
                name: step.name,
                startTimeId: step.startTimeId,
                endTimeId: step.endTimeId,
                participantIds: step.participantIds ?? [],
                locationId: step.locationId,
            }));
            if (step.isRouteStep && step.route) {
                setIsRouteStep(true);
                setOriginLocationId(step.route.originLocationId);
                setDestinationLocationId(step.route.destinationLocationId);
                setTravelMode(step.route.travelMode);
                setTransitModes(step.route.transitModes || []);
                setTimeMode(step.route.timeMode);
                setRouteTimeId(step.route.timeMode === Route.TIME_MODE_DEPART_AT ? step.startTimeId : step.endTimeId);
                const computedTimeId = step.route.timeMode === Route.TIME_MODE_DEPART_AT ? step.endTimeId : step.startTimeId;
                const computedTime = [...times].find(t => t.id === computedTimeId);
                if (computedTime?.offsetSeconds) {
                    const { hours, minutes } = secondsToHM(computedTime.offsetSeconds);
                    setPaddingHours(hours > 0 ? String(hours) : '');
                    setPaddingMinutes(minutes > 0 ? String(minutes) : '');
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
        if (!working.name.trim()) return;

        if (isRouteStep) {
            if (!originLocationId || !destinationLocationId || !routeTimeId) return;
            if (routeOptions.length > 0 && selectedRouteIdx === null) return;
            const payload = {
                name: working.name.trim(),
                participantIds: working.participantIds,
                originLocationId,
                destinationLocationId,
                travelMode,
                transitModes,
                timeId: routeTimeId,
                timeMode,
                paddingSeconds: hmToSeconds(paddingHours, paddingMinutes),
            };
            if (selectedRouteIdx !== null) payload.routeData = routeOptions[selectedRouteIdx];
            submit(stepActions.update(stepId, payload));
        } else {
            if (!working.startTimeId || !working.endTimeId) return;
            submit(stepActions.update(stepId, {
                name: working.name.trim(),
                startTimeId: working.startTimeId,
                endTimeId: working.endTimeId,
                participantIds: working.participantIds,
                locationId: working.locationId,
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
            setOriginLocationId(working.locationId);
            handleChange('locationId', null);
        } else {
            handleChange('locationId', originLocationId);
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

    if (isLoading && !isLoaded) {
        return null;
    }

    if (isLoaded && !step?.id) {
        return (
            <Container maxWidth={false}>
                <Box py={4}><Alert severity="warning">Step not found</Alert></Box>
            </Container>
        );
    }

    const timeList = [...times];
    const locationList = [...locations];

    const isSubmitDisabled = isMutating
        || !working.name.trim()
        || working.participantIds.length === 0
        || (isRouteStep ? (!originLocationId || !destinationLocationId || !routeTimeId || (routeOptions.length > 0 && selectedRouteIdx === null)) : (!working.startTimeId || !working.endTimeId));

    return (
        <Container maxWidth={false}>
            <Box py={4}>
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
                    value={working.name}
                    onChange={(e) => handleChange('name', e.target.value)}
                    size="small"
                />

                <ParticipantPicker
                    participantIds={working.participantIds}
                    onChange={(ids) => handleChange('participantIds', ids)}
                    participants={participants}
                    groups={groups}
                    planId={planId}
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
                        onRemoveDestination={handleToggleRoute}
                        locationList={locationList}
                        timeList={timeList}
                        onEditTime={handleEditTime}
                        planId={planId}
                        departureTime={timeMode === Route.TIME_MODE_DEPART_AT ? timeList.find(t => t.id === routeTimeId)?.datetime : undefined}
                    />
                ) : (
                    <>
                        <LocationPicker
                            value={working.locationId}
                            onChange={(id) => handleChange('locationId', id)}
                            locationList={locationList}
                            label="Location (optional)"
                            planId={planId}
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
                            value={working.startTimeId}
                            onChange={(id) => handleChange('startTimeId', id)}
                            onEdit={handleEditTime}
                            timeList={timeList}
                            label="Start Time"
                            planId={planId}
                        />

                        <TimeSelector
                            value={working.endTimeId}
                            onChange={(id) => handleChange('endTimeId', id)}
                            onEdit={handleEditTime}
                            timeList={timeList}
                            label="End Time"
                            planId={planId}
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
            </Box>

            <Form
                formType="time"
                formData={editingTime}
                title="Edit Time"
                maxWidth="xs"
                onClose={clearEditingTime}
            >
                {({ onClose }) => (
                    <TimeForm
                        onClose={onClose}
                        planId={planId}
                        times={times}
                        editingTime={editingTime}
                        onSubmit={handleSubmitTime}
                        isSaving={timeMutating}
                    />
                )}
            </Form>
        </Container>
    );
};

export default StepEditScreen;
