import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import {
    Box,
    Container,
    Typography,
    TextField,
    Button,
    ToggleButtonGroup,
    ToggleButton,
    Alert,
    FormControlLabel,
    Switch,
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
import { hmToSeconds } from '../../utils/duration';

const StepCreateScreen = () => {
    const { planId, itineraryId } = useParams();
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const dispatch = useDispatch();

    const { isMutating } = useSelector(stepSelectors.currentMeta);
    const error = useSelector(stepSelectors.error);
    const participants = useSelector(participantSelectors.list);
    const groups = useSelector(groupSelectors.list);
    const locations = useSelector(locationSelectors.list);
    const times = useSelector(timeSelectors.list);

    const [working, setWorking] = useState(() => new Step({
        startTimeId: searchParams.get('startTimeId'),
        endTimeId: searchParams.get('endTimeId'),
        participantIds: searchParams.get('participantIds')?.split(',') || [],
        locationId: searchParams.get('locationId') || null,
    }));
    const originalLocationId = searchParams.get('locationId') || null;

    const { editingTime, timeMutating, handleEditTime, handleSubmitTime, clearEditingTime } = useTimeEditor(times, planId);

    const handleChange = (field, value) => {
        setWorking(prev => prev.clone().set(field, value));
    };

    const [isRouteStep, setIsRouteStep] = useState(false);
    const [includeTravelTime, setIncludeTravelTime] = useState(false);
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

    const hasStartParam = searchParams.has('startTimeId');
    const hasEndParam = searchParams.has('endTimeId');
    const [timeEntryMode, setTimeEntryMode] = useState(() => {
        if (hasStartParam) return 'after';
        if (hasEndParam) return 'before';
        return 'from-till';
    });
    const [durationHours, setDurationHours] = useState('');
    const [durationMinutes, setDurationMinutes] = useState('');
    const [derivedTimeLabel, setDerivedTimeLabel] = useState('');

    useEffect(() => {
        if (planId) {
            dispatch(participantActions.list(planId));
            dispatch(groupActions.list(planId));
            dispatch(locationActions.list(planId));
            dispatch(timeActions.list(planId));
        }
    }, [dispatch, planId]);

    useEffect(() => {
        if (includeTravelTime && originalLocationId && working.locationId === originalLocationId) {
            setIncludeTravelTime(false);
            setRouteOptions([]);
            setSelectedRouteIdx(null);
            setTravelMode(Route.TRAVEL_MODE_DRIVE);
            setTransitModes([]);
            setPaddingHours('');
            setPaddingMinutes('');
            setRouteTimeId(null);
            setTimeMode(Route.TIME_MODE_DEPART_AT);
        }
    }, [working.locationId, originalLocationId, includeTravelTime]);

    const transitModesKey = transitModes.join(',');
    useEffect(() => {
        setRouteOptions([]);
        setSelectedRouteIdx(null);
    }, [working.locationId, destinationLocationId, travelMode, transitModesKey, timeMode, routeTimeId]);

    const submit = useMutateEffect(isMutating, error, {
        onSuccess: () => {
            navigate(ROUTES.PLAN_ITINERARIES.replace(':planId', planId));
        },
    });

    const handleSubmit = () => {
        if (!working.name.trim()) return;

        if (includeTravelTime) {
            if (selectedRouteIdx === null) return;
            const ds = hmToSeconds(durationHours, durationMinutes);
            if (!ds) return;
            const isAfter = hasStartParam;
            submit(stepActions.createWithTravel({
                itineraryId,
                direction: isAfter ? 'after' : 'before',
                routeStep: {
                    originLocationId: isAfter ? originalLocationId : working.locationId,
                    destinationLocationId: isAfter ? working.locationId : originalLocationId,
                    travelMode,
                    transitModes,
                    timeId: isAfter ? working.startTimeId : working.endTimeId,
                    timeMode: isAfter ? Route.TIME_MODE_DEPART_AT : Route.TIME_MODE_ARRIVE_BY,
                    paddingSeconds: hmToSeconds(paddingHours, paddingMinutes),
                    routeData: routeOptions[selectedRouteIdx],
                    participantIds: working.participantIds,
                },
                normalStep: {
                    name: working.name.trim(),
                    locationId: working.locationId,
                    durationSeconds: ds,
                    durationTimeLabel: derivedTimeLabel.trim() || undefined,
                    participantIds: working.participantIds,
                },
            }));
        } else if (isRouteStep) {
            if (!working.locationId || !destinationLocationId || !routeTimeId || selectedRouteIdx === null) return;
            submit(stepActions.create({
                itineraryId,
                name: working.name.trim(),
                participantIds: working.participantIds,
                originLocationId: working.locationId,
                destinationLocationId,
                travelMode,
                transitModes,
                timeId: routeTimeId,
                timeMode,
                paddingSeconds: hmToSeconds(paddingHours, paddingMinutes),
                routeData: routeOptions[selectedRouteIdx],
            }));
        } else if (timeEntryMode === 'from-till') {
            if (!working.startTimeId || !working.endTimeId) return;
            submit(stepActions.create({
                itineraryId,
                name: working.name.trim(),
                startTimeId: working.startTimeId,
                endTimeId: working.endTimeId,
                participantIds: working.participantIds,
                locationId: working.locationId,
            }));
        } else if (timeEntryMode === 'after') {
            if (!working.startTimeId) return;
            const ds = hmToSeconds(durationHours, durationMinutes);
            if (!ds) return;
            submit(stepActions.createWithDuration({
                itineraryId,
                name: working.name.trim(),
                startTimeId: working.startTimeId,
                durationSeconds: ds,
                endTimeLabel: derivedTimeLabel.trim() || undefined,
                participantIds: working.participantIds,
                locationId: working.locationId,
            }));
        } else {
            if (!working.endTimeId) return;
            const ds = hmToSeconds(durationHours, durationMinutes);
            if (!ds) return;
            submit(stepActions.createWithDuration({
                itineraryId,
                name: working.name.trim(),
                endTimeId: working.endTimeId,
                durationSeconds: ds,
                startTimeLabel: derivedTimeLabel.trim() || undefined,
                participantIds: working.participantIds,
                locationId: working.locationId,
            }));
        }
    };

    const handleCancel = () => {
        navigate(ROUTES.PLAN_ITINERARIES.replace(':planId', planId));
    };

    const handleToggleRoute = () => {
        const enteringRouteMode = !isRouteStep;
        setIsRouteStep(enteringRouteMode);
        setTransitModes([]);
        setPaddingHours('');
        setPaddingMinutes('');
        if (enteringRouteMode && hasStartParam) {
            setDestinationLocationId(null);
            setTimeMode(Route.TIME_MODE_DEPART_AT);
            setRouteTimeId(working.startTimeId);
        } else if (enteringRouteMode && hasEndParam) {
            setDestinationLocationId(working.locationId);
            handleChange('locationId', null);
            setTimeMode(Route.TIME_MODE_ARRIVE_BY);
            setRouteTimeId(working.endTimeId);
        } else {
            setDestinationLocationId(null);
            setTimeMode(Route.TIME_MODE_DEPART_AT);
            setRouteTimeId(null);
        }
    };

    const handleTravelToggle = () => {
        const turning = !includeTravelTime;
        setIncludeTravelTime(turning);
        setRouteOptions([]);
        setSelectedRouteIdx(null);
        setTransitModes([]);
        setPaddingHours('');
        setPaddingMinutes('');
        if (turning) {
            setTravelMode(Route.TRAVEL_MODE_DRIVE);
            if (hasStartParam) {
                setTimeMode(Route.TIME_MODE_DEPART_AT);
                setRouteTimeId(working.startTimeId);
            } else {
                setTimeMode(Route.TIME_MODE_ARRIVE_BY);
                setRouteTimeId(working.endTimeId);
            }
        } else {
            setRouteTimeId(null);
            setTimeMode(Route.TIME_MODE_DEPART_AT);
        }
    };

    const handlePreview = async () => {
        let origin, destination, rTimeId;
        if (includeTravelTime) {
            origin = hasStartParam ? originalLocationId : working.locationId;
            destination = hasStartParam ? working.locationId : originalLocationId;
            rTimeId = hasStartParam ? working.startTimeId : working.endTimeId;
        } else {
            origin = working.locationId;
            destination = destinationLocationId;
            rTimeId = routeTimeId;
        }
        if (!origin || !destination || !rTimeId) return;
        setPreviewLoading(true);
        try {
            const timeList = [...times];
            const routes = await routeService.preview({
                originLocationId: origin,
                destinationLocationId: destination,
                travelMode,
                transitModes,
                datetime: timeList.find(t => t.id === rTimeId)?.datetime,
                timeMode,
            });
            setRouteOptions(routes);
            if (routes.length === 1) setSelectedRouteIdx(0);
        } catch (err) {
            console.error(err);
        }
        setPreviewLoading(false);
    };

    const timeList = [...times];
    const locationList = [...locations];

    const hasDuration = hmToSeconds(durationHours, durationMinutes) > 0;
    const isTimeValid = includeTravelTime
        ? (selectedRouteIdx !== null && hasDuration)
        : isRouteStep
            ? (working.locationId && destinationLocationId && routeTimeId && selectedRouteIdx !== null)
            : timeEntryMode === 'from-till'
                ? (working.startTimeId && working.endTimeId)
                : timeEntryMode === 'after'
                    ? (working.startTimeId && hasDuration)
                    : (working.endTimeId && hasDuration);
    const isSubmitDisabled = isMutating || !working.name.trim() || working.participantIds.length === 0 || !isTimeValid;

    return (
        <Container maxWidth={false}>
            <Box py={4}>
                <Box mb={3}>
                    <Typography variant="h5" gutterBottom>Add Step</Typography>
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

                <LocationPicker
                    value={working.locationId}
                    onChange={(id) => handleChange('locationId', id)}
                    locationList={locationList}
                    label={isRouteStep ? 'Origin' : 'Location (optional)'}
                    planId={planId}
                />

                {!isRouteStep && originalLocationId && (hasStartParam || hasEndParam) && working.locationId && working.locationId !== originalLocationId && (
                    <FormControlLabel
                        control={<Switch checked={includeTravelTime} onChange={handleTravelToggle} size="small" />}
                        label="Include travel time"
                        slotProps={{ typography: { variant: 'body2' } }}
                        sx={{ mt: 1 }}
                    />
                )}

                {!isRouteStep && !includeTravelTime && (
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
                )}

                {isRouteStep && (
                    <RouteForm
                        originLocationId={working.locationId}
                        onOriginChange={(id) => handleChange('locationId', id)}
                        showOrigin={false}
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
                )}

                {includeTravelTime && (
                    <>
                        <RouteForm
                            travelTimeMode
                            originLocationId={hasStartParam ? originalLocationId : working.locationId}
                            onOriginChange={() => {}}
                            showOrigin={false}
                            destinationLocationId={hasStartParam ? working.locationId : originalLocationId}
                            onDestinationChange={() => {}}
                            travelMode={travelMode}
                            onTravelModeChange={setTravelMode}
                            transitModes={transitModes}
                            onTransitModesChange={setTransitModes}
                            timeMode={timeMode}
                            onTimeModeChange={() => {}}
                            routeTimeId={routeTimeId}
                            onRouteTimeChange={() => {}}
                            paddingHours={paddingHours}
                            onPaddingHoursChange={setPaddingHours}
                            paddingMinutes={paddingMinutes}
                            onPaddingMinutesChange={setPaddingMinutes}
                            routeOptions={routeOptions}
                            selectedRouteIdx={selectedRouteIdx}
                            onRouteSelect={setSelectedRouteIdx}
                            previewLoading={previewLoading}
                            onPreview={handlePreview}
                            onRemoveDestination={() => {}}
                            locationList={locationList}
                            timeList={timeList}
                            onEditTime={handleEditTime}
                            planId={planId}
                            departureTime={hasStartParam ? timeList.find(t => t.id === working.startTimeId)?.datetime : undefined}
                        />
                        <Box sx={{ display: 'flex', gap: 1, mt: 2, alignItems: 'center' }}>
                            <Typography variant="caption" color="text.secondary" sx={{ whiteSpace: 'nowrap' }}>Step Duration</Typography>
                            <TextField label="Hours" type="number" size="small" value={durationHours} onChange={(e) => setDurationHours(e.target.value)} slotProps={{ htmlInput: { min: 0 } }} sx={{ width: 80 }} />
                            <TextField label="Min" type="number" size="small" value={durationMinutes} onChange={(e) => setDurationMinutes(e.target.value)} slotProps={{ htmlInput: { min: 0, max: 59 } }} sx={{ width: 80 }} />
                        </Box>
                        <TextField
                            label={hasStartParam ? 'End Time Label (optional)' : 'Start Time Label (optional)'}
                            fullWidth
                            size="small"
                            value={derivedTimeLabel}
                            onChange={(e) => setDerivedTimeLabel(e.target.value)}
                            placeholder={`${working.name || 'Event'} ${hasStartParam ? 'End' : 'Start'}`}
                            sx={{ mt: 2 }}
                        />
                    </>
                )}

                {!isRouteStep && !includeTravelTime && (
                    <>
                        <Box sx={{ mt: 2 }}>
                            <ToggleButtonGroup
                                value={timeEntryMode}
                                exclusive
                                onChange={(_, v) => { if (v) setTimeEntryMode(v); }}
                                size="small"
                                fullWidth
                            >
                                {!hasEndParam && (
                                    <ToggleButton value="after" sx={{ textTransform: 'none', fontWeight: 600 }}>After</ToggleButton>
                                )}
                                <ToggleButton value="from-till" sx={{ textTransform: 'none', fontWeight: 600 }}>From-Till</ToggleButton>
                                {!hasStartParam && (
                                    <ToggleButton value="before" sx={{ textTransform: 'none', fontWeight: 600 }}>Before</ToggleButton>
                                )}
                            </ToggleButtonGroup>
                        </Box>

                        {timeEntryMode === 'after' && (
                            <>
                                <TimeSelector
                                    value={working.startTimeId}
                                    onChange={(id) => handleChange('startTimeId', id)}
                                    onEdit={handleEditTime}
                                    timeList={timeList}
                                    label="Start Time"
                                    planId={planId}
                                />
                                <Box sx={{ display: 'flex', gap: 1, mt: 2, alignItems: 'center' }}>
                                    <Typography variant="caption" color="text.secondary" sx={{ whiteSpace: 'nowrap' }}>Duration</Typography>
                                    <TextField label="Hours" type="number" size="small" value={durationHours} onChange={(e) => setDurationHours(e.target.value)} slotProps={{ htmlInput: { min: 0 } }} sx={{ width: 80 }} />
                                    <TextField label="Min" type="number" size="small" value={durationMinutes} onChange={(e) => setDurationMinutes(e.target.value)} slotProps={{ htmlInput: { min: 0, max: 59 } }} sx={{ width: 80 }} />
                                </Box>
                                <TextField label="End Time Label (optional)" fullWidth size="small" value={derivedTimeLabel} onChange={(e) => setDerivedTimeLabel(e.target.value)} placeholder={`${working.name || 'Event'} End`} sx={{ mt: 2 }} />
                            </>
                        )}

                        {timeEntryMode === 'from-till' && (
                            <>
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

                        {timeEntryMode === 'before' && (
                            <>
                                <TimeSelector
                                    value={working.endTimeId}
                                    onChange={(id) => handleChange('endTimeId', id)}
                                    onEdit={handleEditTime}
                                    timeList={timeList}
                                    label="End Time"
                                    planId={planId}
                                />
                                <Box sx={{ display: 'flex', gap: 1, mt: 2, alignItems: 'center' }}>
                                    <Typography variant="caption" color="text.secondary" sx={{ whiteSpace: 'nowrap' }}>Duration</Typography>
                                    <TextField label="Hours" type="number" size="small" value={durationHours} onChange={(e) => setDurationHours(e.target.value)} slotProps={{ htmlInput: { min: 0 } }} sx={{ width: 80 }} />
                                    <TextField label="Min" type="number" size="small" value={durationMinutes} onChange={(e) => setDurationMinutes(e.target.value)} slotProps={{ htmlInput: { min: 0, max: 59 } }} sx={{ width: 80 }} />
                                </Box>
                                <TextField label="Start Time Label (optional)" fullWidth size="small" value={derivedTimeLabel} onChange={(e) => setDerivedTimeLabel(e.target.value)} placeholder={`${working.name || 'Event'} Start`} sx={{ mt: 2 }} />
                            </>
                        )}
                    </>
                )}

                <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1, mt: 3 }}>
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
                            Create
                    </Button>
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

export default StepCreateScreen;
