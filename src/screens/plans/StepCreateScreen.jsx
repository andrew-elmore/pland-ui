import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import {
    Box,
    Container,
    Typography,
    Paper,
    TextField,
    Button,
    Autocomplete,
    Checkbox,
    Chip,
    ToggleButtonGroup,
    ToggleButton,
    IconButton,
    CircularProgress,
} from '@mui/material';
import DirectionsIcon from '@mui/icons-material/Directions';
import SwapHorizIcon from '@mui/icons-material/SwapHoriz';
import EditIcon from '@mui/icons-material/Edit';
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
    const [timeMode, setTimeMode] = useState('depart_at');
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
        setIsRouteStep(!isRouteStep);
        setDestinationLocationId(null);
        setTransitModes([]);
        setRouteTimeId(null);
        setTimeMode('depart_at');
        setPaddingHours('');
        setPaddingMinutes('');
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

    const participantList = [...participants];
    const groupList = [...groups];
    const timeList = [...times];
    const locationList = [...locations];

    const groupedOptions = [];
    groupList.forEach((g) => {
        const memberIds = g.participantIds || [];
        const members = participantList.filter(p => memberIds.includes(p.id));
        if (members.length > 0) {
            groupedOptions.push({ type: 'group', group: g, id: `group-${g.id}` });
            members.forEach(p => groupedOptions.push({ type: 'participant', participant: p, groupName: g.name, id: p.id }));
        }
    });
    const groupedIds = new Set(groupList.flatMap(g => g.participantIds || []));
    const ungrouped = participantList.filter(p => !groupedIds.has(p.id));
    if (ungrouped.length > 0) {
        ungrouped.forEach(p => groupedOptions.push({ type: 'participant', participant: p, groupName: 'All', id: p.id }));
    }

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
        <Container maxWidth="sm">
            <Box py={4}>
                <Paper elevation={3} sx={{ p: 4 }}>
                    <Box mb={3}>
                        <Typography variant="h5" gutterBottom>Add Step</Typography>
                    </Box>

                    <TextField
                        autoFocus
                        label="Name"
                        fullWidth
                        value={stepName}
                        onChange={(e) => setStepName(e.target.value)}
                        size="small"
                    />

                    <Autocomplete
                        multiple
                        options={groupedOptions}
                        getOptionLabel={(option) => {
                            if (option.type === 'group') return option.group.name;
                            return option.participant.fullName || `${option.participant.firstName} ${option.participant.lastName}`.trim();
                        }}
                        value={groupedOptions.filter(o => o.type === 'participant' && stepParticipantIds.includes(o.id))}
                        onChange={(_, value, reason, details) => {
                            if (details?.option?.type === 'group') {
                                const memberIds = (details.option.group.participantIds || []).filter(id => participantList.some(p => p.id === id));
                                if (reason === 'selectOption') {
                                    setStepParticipantIds((prev) => [...new Set([...prev, ...memberIds])]);
                                } else if (reason === 'removeOption') {
                                    setStepParticipantIds((prev) => prev.filter(id => !memberIds.includes(id)));
                                }
                            } else {
                                setStepParticipantIds(value.filter(o => o.type === 'participant').map(o => o.id));
                            }
                        }}
                        isOptionEqualToValue={(a, b) => a.id === b.id}
                        disableCloseOnSelect
                        renderOption={(props, option, { selected }) => {
                            if (option.type === 'group') {
                                const memberIds = (option.group.participantIds || []).filter(id => participantList.some(p => p.id === id));
                                const allSelected = memberIds.length > 0 && memberIds.every(id => stepParticipantIds.includes(id));
                                const someSelected = memberIds.some(id => stepParticipantIds.includes(id));
                                return (
                                    <li {...props} key={option.id} style={{ fontWeight: 700 }}>
                                        <Checkbox size="small" checked={allSelected} indeterminate={someSelected && !allSelected} sx={{ mr: 0.5, p: 0.25 }} />
                                        {option.group.name}
                                    </li>
                                );
                            }
                            return (
                                <li {...props} key={option.id} style={{ paddingLeft: 32 }}>
                                    <Checkbox size="small" checked={selected} sx={{ mr: 0.5, p: 0.25 }} />
                                    {option.participant.fullName || `${option.participant.firstName} ${option.participant.lastName}`.trim()}
                                </li>
                            );
                        }}
                        renderTags={(value, getTagProps) =>
                            value.filter(o => o.type === 'participant').map((option, index) => (
                                <Chip
                                    {...getTagProps({ index })}
                                    key={option.id}
                                    label={option.participant.fullName || `${option.participant.firstName} ${option.participant.lastName}`.trim()}
                                    size="small"
                                />
                            ))
                        }
                        renderInput={(params) => (
                            <TextField {...params} label="Participants" size="small" />
                        )}
                        size="small"
                        sx={{ mt: 2 }}
                    />

                    <Autocomplete
                        options={locationList}
                        getOptionLabel={(option) => option.name || ''}
                        value={locationList.find(l => l.id === stepLocationId) ?? null}
                        onChange={(_, value) => setStepLocationId(value?.id ?? null)}
                        isOptionEqualToValue={(a, b) => a.id === b.id}
                        renderInput={(params) => (
                            <TextField {...params} label={isRouteStep ? 'Origin' : 'Location (optional)'} size="small" />
                        )}
                        size="small"
                        sx={{ mt: 2 }}
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
                        <>
                            <Autocomplete
                                options={locationList}
                                getOptionLabel={(option) => option.name || ''}
                                value={locationList.find(l => l.id === destinationLocationId) ?? null}
                                onChange={(_, value) => setDestinationLocationId(value?.id ?? null)}
                                isOptionEqualToValue={(a, b) => a.id === b.id}
                                renderInput={(params) => (
                                    <TextField {...params} label="Destination" size="small" />
                                )}
                                size="small"
                                sx={{ mt: 2 }}
                            />

                            <Box sx={{ mt: 2 }}>
                                <Typography variant="caption" color="text.secondary" sx={{ mb: 0.5, display: 'block' }}>
                                    Travel Mode
                                </Typography>
                                <ToggleButtonGroup
                                    value={travelMode}
                                    exclusive
                                    onChange={(_, value) => { if (value) setTravelMode(value); }}
                                    size="small"
                                    fullWidth
                                >
                                    {Route.TRAVEL_MODES.map((mode) => (
                                        <ToggleButton key={mode} value={mode} sx={{ textTransform: 'none', fontWeight: 600 }}>
                                            {Route.TRAVEL_MODE_LABELS[mode]}
                                        </ToggleButton>
                                    ))}
                                </ToggleButtonGroup>
                            </Box>

                            {travelMode === Route.TRAVEL_MODE_TRANSIT && (
                                <Box sx={{ display: 'flex', gap: 0.5, mt: 1.5, flexWrap: 'wrap' }}>
                                    {Route.TRANSIT_MODES.map((mode) => (
                                        <Chip
                                            key={mode}
                                            label={Route.TRANSIT_MODE_LABELS[mode]}
                                            size="small"
                                            variant={transitModes.includes(mode) ? 'filled' : 'outlined'}
                                            color={transitModes.includes(mode) ? 'primary' : 'default'}
                                            onClick={() => setTransitModes((prev) =>
                                                prev.includes(mode) ? prev.filter((m) => m !== mode) : [...prev, mode],
                                            )}
                                            sx={{ cursor: 'pointer' }}
                                        />
                                    ))}
                                </Box>
                            )}

                            <Box sx={{ mt: 2 }}>
                                <Typography variant="caption" color="text.secondary" sx={{ mb: 0.5, display: 'block' }}>
                                    Time Mode
                                </Typography>
                                <ToggleButtonGroup
                                    value={timeMode}
                                    exclusive
                                    onChange={(_, value) => { if (value) setTimeMode(value); }}
                                    size="small"
                                    fullWidth
                                >
                                    <ToggleButton value="depart_at" sx={{ textTransform: 'none', fontWeight: 600 }}>
                                        Leave At
                                    </ToggleButton>
                                    <ToggleButton value="arrive_by" sx={{ textTransform: 'none', fontWeight: 600 }}>
                                        Arrive By
                                    </ToggleButton>
                                </ToggleButtonGroup>
                            </Box>

                            {routeTimeId ? (
                                <Box sx={{ display: 'flex', alignItems: 'center', mt: 2, gap: 0.5 }}>
                                    <Typography variant="body2" sx={{ flex: 1 }}>
                                        {timeList.find(t => t.id === routeTimeId)?.displayLabel || ''}
                                    </Typography>
                                    <IconButton size="small" onClick={() => setRouteTimeId(null)}>
                                        <SwapHorizIcon fontSize="small" />
                                    </IconButton>
                                    <IconButton size="small" onClick={() => handleEditTime(routeTimeId)}>
                                        <EditIcon fontSize="small" />
                                    </IconButton>
                                </Box>
                            ) : (
                                <Autocomplete
                                    options={timeList}
                                    getOptionLabel={(option) => option.displayLabel || ''}
                                    value={null}
                                    onChange={(_, value) => setRouteTimeId(value?.id ?? null)}
                                    isOptionEqualToValue={(a, b) => a.id === b.id}
                                    renderInput={(params) => (
                                        <TextField {...params} label={timeMode === 'depart_at' ? 'Departure Time' : 'Arrival Time'} size="small" />
                                    )}
                                    size="small"
                                    sx={{ mt: 2 }}
                                />
                            )}

                            <Box sx={{ display: 'flex', gap: 1, mt: 2, alignItems: 'center' }}>
                                <Typography variant="caption" color="text.secondary" sx={{ whiteSpace: 'nowrap' }}>
                                    Padding
                                </Typography>
                                <TextField
                                    label="Hours"
                                    type="number"
                                    size="small"
                                    value={paddingHours}
                                    onChange={(e) => setPaddingHours(e.target.value)}
                                    slotProps={{ htmlInput: { min: 0 } }}
                                    sx={{ width: 80 }}
                                />
                                <TextField
                                    label="Min"
                                    type="number"
                                    size="small"
                                    value={paddingMinutes}
                                    onChange={(e) => setPaddingMinutes(e.target.value)}
                                    slotProps={{ htmlInput: { min: 0, max: 59 } }}
                                    sx={{ width: 80 }}
                                />
                            </Box>

                            {stepLocationId && destinationLocationId && routeTimeId && (
                                <Button
                                    variant="outlined"
                                    size="small"
                                    onClick={handlePreview}
                                    disabled={previewLoading}
                                    startIcon={previewLoading ? <CircularProgress size={16} /> : null}
                                    sx={{ mt: 2, borderRadius: '20px', textTransform: 'none', fontWeight: 600 }}
                                    fullWidth
                                >
                                    {previewLoading ? 'Loading...' : routeOptions.length > 0 ? 'Refresh Routes' : 'Preview Routes'}
                                </Button>
                            )}

                            {routeOptions.length > 0 && (
                                <Box sx={{ mt: 2, display: 'flex', flexDirection: 'column', gap: 1 }}>
                                    {routeOptions.map((option, idx) => (
                                        <Box
                                            key={idx}
                                            onClick={() => setSelectedRouteIdx(idx)}
                                            sx={{
                                                p: 1.5,
                                                border: '2px solid',
                                                borderColor: selectedRouteIdx === idx ? 'primary.main' : 'divider',
                                                borderRadius: '8px',
                                                cursor: 'pointer',
                                                backgroundColor: selectedRouteIdx === idx ? 'action.selected' : 'transparent',
                                                '&:hover': { backgroundColor: selectedRouteIdx === idx ? 'action.selected' : 'action.hover' },
                                            }}
                                        >
                                            <Typography variant="body2" sx={{ fontWeight: 600 }}>
                                                {option.summary || `Route ${idx + 1}`}
                                            </Typography>
                                            <Typography variant="caption" color="text.secondary">
                                                {Math.round(option.durationSeconds / 60)} min · {(option.distanceMeters / 1000).toFixed(1)} km
                                            </Typography>
                                        </Box>
                                    ))}
                                </Box>
                            )}

                            <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 1 }}>
                                <Button
                                    size="small"
                                    color="error"
                                    onClick={handleToggleRoute}
                                    sx={{ textTransform: 'none', fontSize: '0.75rem' }}
                                >
                                    Remove Destination
                                </Button>
                            </Box>
                        </>
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
                                    {stepStartTimeId ? (
                                        <Box sx={{ display: 'flex', alignItems: 'center', mt: 2, gap: 0.5 }}>
                                            <Typography variant="body2" sx={{ flex: 1 }}>
                                                {timeList.find(t => t.id === stepStartTimeId)?.displayLabel || ''}
                                            </Typography>
                                            <IconButton size="small" onClick={() => setStepStartTimeId(null)}>
                                                <SwapHorizIcon fontSize="small" />
                                            </IconButton>
                                            <IconButton size="small" onClick={() => handleEditTime(stepStartTimeId)}>
                                                <EditIcon fontSize="small" />
                                            </IconButton>
                                        </Box>
                                    ) : (
                                        <Autocomplete
                                            options={timeList}
                                            getOptionLabel={(option) => option.displayLabel || ''}
                                            value={null}
                                            onChange={(_, value) => setStepStartTimeId(value?.id ?? null)}
                                            isOptionEqualToValue={(a, b) => a.id === b.id}
                                            renderInput={(params) => (
                                                <TextField {...params} label="Start Time" size="small" />
                                            )}
                                            size="small"
                                            sx={{ mt: 2 }}
                                        />
                                    )}
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
                                    {stepStartTimeId ? (
                                        <Box sx={{ display: 'flex', alignItems: 'center', mt: 2, gap: 0.5 }}>
                                            <Typography variant="body2" sx={{ flex: 1 }}>
                                                {timeList.find(t => t.id === stepStartTimeId)?.displayLabel || ''}
                                            </Typography>
                                            <IconButton size="small" onClick={() => setStepStartTimeId(null)}>
                                                <SwapHorizIcon fontSize="small" />
                                            </IconButton>
                                            <IconButton size="small" onClick={() => handleEditTime(stepStartTimeId)}>
                                                <EditIcon fontSize="small" />
                                            </IconButton>
                                        </Box>
                                    ) : (
                                        <Autocomplete
                                            options={timeList}
                                            getOptionLabel={(option) => option.displayLabel || ''}
                                            value={null}
                                            onChange={(_, value) => setStepStartTimeId(value?.id ?? null)}
                                            isOptionEqualToValue={(a, b) => a.id === b.id}
                                            renderInput={(params) => (
                                                <TextField {...params} label="Start Time" size="small" />
                                            )}
                                            size="small"
                                            sx={{ mt: 2 }}
                                        />
                                    )}
                                    {stepEndTimeId ? (
                                        <Box sx={{ display: 'flex', alignItems: 'center', mt: 2, gap: 0.5 }}>
                                            <Typography variant="body2" sx={{ flex: 1 }}>
                                                {timeList.find(t => t.id === stepEndTimeId)?.displayLabel || ''}
                                            </Typography>
                                            <IconButton size="small" onClick={() => setStepEndTimeId(null)}>
                                                <SwapHorizIcon fontSize="small" />
                                            </IconButton>
                                            <IconButton size="small" onClick={() => handleEditTime(stepEndTimeId)}>
                                                <EditIcon fontSize="small" />
                                            </IconButton>
                                        </Box>
                                    ) : (
                                        <Autocomplete
                                            options={timeList}
                                            getOptionLabel={(option) => option.displayLabel || ''}
                                            value={null}
                                            onChange={(_, value) => setStepEndTimeId(value?.id ?? null)}
                                            isOptionEqualToValue={(a, b) => a.id === b.id}
                                            renderInput={(params) => (
                                                <TextField {...params} label="End Time" size="small" />
                                            )}
                                            size="small"
                                            sx={{ mt: 2 }}
                                        />
                                    )}
                                </>
                            )}

                            {timeEntryMode === 'before' && (
                                <>
                                    {stepEndTimeId ? (
                                        <Box sx={{ display: 'flex', alignItems: 'center', mt: 2, gap: 0.5 }}>
                                            <Typography variant="body2" sx={{ flex: 1 }}>
                                                {timeList.find(t => t.id === stepEndTimeId)?.displayLabel || ''}
                                            </Typography>
                                            <IconButton size="small" onClick={() => setStepEndTimeId(null)}>
                                                <SwapHorizIcon fontSize="small" />
                                            </IconButton>
                                            <IconButton size="small" onClick={() => handleEditTime(stepEndTimeId)}>
                                                <EditIcon fontSize="small" />
                                            </IconButton>
                                        </Box>
                                    ) : (
                                        <Autocomplete
                                            options={timeList}
                                            getOptionLabel={(option) => option.displayLabel || ''}
                                            value={null}
                                            onChange={(_, value) => setStepEndTimeId(value?.id ?? null)}
                                            isOptionEqualToValue={(a, b) => a.id === b.id}
                                            renderInput={(params) => (
                                                <TextField {...params} label="End Time" size="small" />
                                            )}
                                            size="small"
                                            sx={{ mt: 2 }}
                                        />
                                    )}
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

export default StepCreateScreen;
