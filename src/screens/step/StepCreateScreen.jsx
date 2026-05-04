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
import TimeForm from '../../components/common/TimeFormDialog';
import Form from '../../components/common/Form';
import { actions as uiActions } from '../../store/ui';
import ParticipantPicker from '../../features/step/ParticipantPicker';
import TimeSelector from '../../features/step/TimeSelector';
import RouteForm from '../../features/step/RouteForm';
import LocationPicker from '../../features/step/LocationPicker';

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
    const timeMutating = useSelector(timeSelectors.isMutating);

    const [stepName, setStepName] = useState('');
    const [stepStartTimeId, setStepStartTimeId] = useState(searchParams.get('startTimeId'));
    const [stepEndTimeId, setStepEndTimeId] = useState(searchParams.get('endTimeId'));
    const [stepParticipantIds, setStepParticipantIds] = useState(() => {
        const ids = searchParams.get('participantIds');
        return ids ? ids.split(',') : [];
    });
    const [stepLocationId, setStepLocationId] = useState(searchParams.get('locationId') || null);

    const [isRouteStep, setIsRouteStep] = useState(false);
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

    const [editingTime, setEditingTime] = useState(null);

    useEffect(() => {
        if (planId) {
            dispatch(participantActions.list(planId));
            dispatch(groupActions.list(planId));
            dispatch(locationActions.list(planId));
            dispatch(timeActions.list(planId));
        }
    }, [dispatch, planId]);

    const transitModesKey = transitModes.join(',');
    useEffect(() => {
        setRouteOptions([]);
        setSelectedRouteIdx(null);
    }, [stepLocationId, destinationLocationId, travelMode, transitModesKey, timeMode, routeTimeId]);

    const submit = useMutateEffect(isMutating, error, {
        onSuccess: () => {
            navigate(ROUTES.PLAN_ITINERARIES.replace(':planId', planId));
        },
    });

    const handleSubmit = () => {
        if (!stepName.trim()) return;

        if (isRouteStep) {
            if (!stepLocationId || !destinationLocationId || !routeTimeId || selectedRouteIdx === null) return;
            submit(stepActions.create({
                itineraryId,
                name: stepName.trim(),
                participantIds: stepParticipantIds,
                originLocationId: stepLocationId,
                destinationLocationId,
                travelMode,
                transitModes,
                timeId: routeTimeId,
                timeMode,
                paddingSeconds: (parseInt(paddingHours, 10) || 0) * 3600 + (parseInt(paddingMinutes, 10) || 0) * 60,
                routeData: routeOptions[selectedRouteIdx],
            }));
        } else if (timeEntryMode === 'from-till') {
            if (!stepStartTimeId || !stepEndTimeId) return;
            submit(stepActions.create({
                itineraryId,
                name: stepName.trim(),
                startTimeId: stepStartTimeId,
                endTimeId: stepEndTimeId,
                participantIds: stepParticipantIds,
                locationId: stepLocationId,
            }));
        } else if (timeEntryMode === 'after') {
            if (!stepStartTimeId) return;
            const ds = (parseInt(durationHours, 10) || 0) * 3600 + (parseInt(durationMinutes, 10) || 0) * 60;
            if (!ds) return;
            submit(stepActions.createWithDuration({
                itineraryId,
                name: stepName.trim(),
                startTimeId: stepStartTimeId,
                durationSeconds: ds,
                endTimeLabel: derivedTimeLabel.trim() || undefined,
                participantIds: stepParticipantIds,
                locationId: stepLocationId,
            }));
        } else {
            if (!stepEndTimeId) return;
            const ds = (parseInt(durationHours, 10) || 0) * 3600 + (parseInt(durationMinutes, 10) || 0) * 60;
            if (!ds) return;
            submit(stepActions.createWithDuration({
                itineraryId,
                name: stepName.trim(),
                endTimeId: stepEndTimeId,
                durationSeconds: ds,
                startTimeLabel: derivedTimeLabel.trim() || undefined,
                participantIds: stepParticipantIds,
                locationId: stepLocationId,
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
            setRouteTimeId(stepStartTimeId);
        } else if (enteringRouteMode && hasEndParam) {
            setDestinationLocationId(stepLocationId);
            setStepLocationId(null);
            setTimeMode(Route.TIME_MODE_ARRIVE_BY);
            setRouteTimeId(stepEndTimeId);
        } else {
            setDestinationLocationId(null);
            setTimeMode(Route.TIME_MODE_DEPART_AT);
            setRouteTimeId(null);
        }
    };

    const handlePreview = async () => {
        if (!stepLocationId || !destinationLocationId || !routeTimeId) return;
        setPreviewLoading(true);
        try {
            const timeList = [...times];
            const routes = await routeService.preview({
                originLocationId: stepLocationId,
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
            dispatch(uiActions.openDialog(`time-${time.id}`));
        }
    };

    const handleSubmitTime = (data) => {
        if (editingTime) {
            dispatch(timeActions.update(editingTime.id, data));
        }
    };

    const timeList = [...times];
    const locationList = [...locations];

    const hasDuration = (parseInt(durationHours, 10) || 0) > 0 || (parseInt(durationMinutes, 10) || 0) > 0;
    const isTimeValid = isRouteStep
        ? (stepLocationId && destinationLocationId && routeTimeId && selectedRouteIdx !== null)
        : timeEntryMode === 'from-till'
            ? (stepStartTimeId && stepEndTimeId)
            : timeEntryMode === 'after'
                ? (stepStartTimeId && hasDuration)
                : (stepEndTimeId && hasDuration);
    const isSubmitDisabled = isMutating || !stepName.trim() || stepParticipantIds.length === 0 || !isTimeValid;

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
                    value={stepName}
                    onChange={(e) => setStepName(e.target.value)}
                    size="small"
                />

                <ParticipantPicker
                    participantIds={stepParticipantIds}
                    onChange={setStepParticipantIds}
                    participants={participants}
                    groups={groups}
                    planId={planId}
                />

                <LocationPicker
                    value={stepLocationId}
                    onChange={setStepLocationId}
                    locationList={locationList}
                    label={isRouteStep ? 'Origin' : 'Location (optional)'}
                    planId={planId}
                />
                {!isRouteStep && (
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
                        originLocationId={stepLocationId}
                        onOriginChange={setStepLocationId}
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

                {!isRouteStep && (
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
                                    value={stepStartTimeId}
                                    onChange={setStepStartTimeId}
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
                                <TextField label="End Time Label (optional)" fullWidth size="small" value={derivedTimeLabel} onChange={(e) => setDerivedTimeLabel(e.target.value)} placeholder={`${stepName || 'Event'} End`} sx={{ mt: 2 }} />
                            </>
                        )}

                        {timeEntryMode === 'from-till' && (
                            <>
                                <TimeSelector
                                    value={stepStartTimeId}
                                    onChange={setStepStartTimeId}
                                    onEdit={handleEditTime}
                                    timeList={timeList}
                                    label="Start Time"
                                    planId={planId}
                                />
                                <TimeSelector
                                    value={stepEndTimeId}
                                    onChange={setStepEndTimeId}
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
                                    value={stepEndTimeId}
                                    onChange={setStepEndTimeId}
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
                                <TextField label="Start Time Label (optional)" fullWidth size="small" value={derivedTimeLabel} onChange={(e) => setDerivedTimeLabel(e.target.value)} placeholder={`${stepName || 'Event'} Start`} sx={{ mt: 2 }} />
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
                onClose={() => setEditingTime(null)}
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
