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
    Checkbox,
    Chip,
    ToggleButtonGroup,
    ToggleButton,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import DirectionsIcon from '@mui/icons-material/Directions';
import { actions as stepActions, selectors as stepSelectors } from '../../store/step';
import { actions as participantActions, selectors as participantSelectors } from '../../store/participant';
import { actions as locationActions, selectors as locationSelectors } from '../../store/location';
import { actions as timeActions, selectors as timeSelectors } from '../../store/time';
import useMutateEffect from '../../hooks/useMutateEffect';
import ROUTES from '../../router/routes';
import Route from '../../domain/Route';
import TimeFormDialog from '../../components/common/TimeFormDialog';

const StepCreateScreen = () => {
    const { planId, itineraryId } = useParams();
    const navigate = useNavigate();
    const dispatch = useDispatch();

    const { isMutating } = useSelector(stepSelectors.currentMeta);
    const error = useSelector(stepSelectors.error);
    const participants = useSelector(participantSelectors.list);
    const locations = useSelector(locationSelectors.list);
    const times = useSelector(timeSelectors.list);

    const [stepName, setStepName] = useState('');
    const [stepStartTimeId, setStepStartTimeId] = useState(null);
    const [stepEndTimeId, setStepEndTimeId] = useState(null);
    const [stepParticipantIds, setStepParticipantIds] = useState([]);
    const [stepLocationId, setStepLocationId] = useState(null);

    const [isRouteStep, setIsRouteStep] = useState(false);
    const [destinationLocationId, setDestinationLocationId] = useState(null);
    const [travelMode, setTravelMode] = useState(Route.TRAVEL_MODE_DRIVE);
    const [transitModes, setTransitModes] = useState([]);
    const [routeTimeId, setRouteTimeId] = useState(null);
    const [timeMode, setTimeMode] = useState('depart_at');
    const [paddingHours, setPaddingHours] = useState('');
    const [paddingMinutes, setPaddingMinutes] = useState('');

    const [timeDialogOpen, setTimeDialogOpen] = useState(false);
    const [timeDialogTarget, setTimeDialogTarget] = useState(null);

    useEffect(() => {
        if (planId) {
            dispatch(participantActions.list(planId));
            dispatch(locationActions.list(planId));
            dispatch(timeActions.list(planId));
        }
    }, [dispatch, planId]);

    const submit = useMutateEffect(isMutating, error, {
        onSuccess: () => {
            navigate(ROUTES.PLAN_ITINERARIES.replace(':planId', planId));
        },
    });

    const handleSubmit = () => {
        if (!stepName.trim()) return;

        if (isRouteStep) {
            if (!stepLocationId || !destinationLocationId || !routeTimeId) return;
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
            }));
        } else {
            if (!stepStartTimeId || !stepEndTimeId) return;
            submit(stepActions.create({
                itineraryId,
                name: stepName.trim(),
                startTimeId: stepStartTimeId,
                endTimeId: stepEndTimeId,
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

    const handleOpenTimeDialog = (target) => {
        setTimeDialogTarget(target);
        setTimeDialogOpen(true);
    };

    const handleSubmitTime = (data) => {
        dispatch(timeActions.create(data)).then((action) => {
            if (action.type.endsWith('_FULFILLED')) {
                const newId = action.payload.id;
                if (timeDialogTarget === 'start') setStepStartTimeId(newId);
                if (timeDialogTarget === 'end') setStepEndTimeId(newId);
                if (timeDialogTarget === 'route') setRouteTimeId(newId);
            }
        });
        setTimeDialogOpen(false);
    };

    const participantList = [...participants];
    const timeList = [...times];
    const locationList = [...locations];

    const isSubmitDisabled = isMutating
        || !stepName.trim()
        || stepParticipantIds.length === 0
        || (isRouteStep ? (!stepLocationId || !destinationLocationId || !routeTimeId) : (!stepStartTimeId || !stepEndTimeId));

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
                        options={participantList}
                        getOptionLabel={(option) => option.fullName || `${option.firstName} ${option.lastName}`.trim()}
                        value={participantList.filter(p => stepParticipantIds.includes(p.id))}
                        onChange={(_, value) => setStepParticipantIds(value.map(p => p.id))}
                        isOptionEqualToValue={(a, b) => a.id === b.id}
                        disableCloseOnSelect
                        renderOption={(props, option, { selected }) => (
                            <li {...props} key={option.id}>
                                <Checkbox size="small" checked={selected} sx={{ mr: 0.5, p: 0.25 }} />
                                {option.fullName || `${option.firstName} ${option.lastName}`.trim()}
                            </li>
                        )}
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

                            <Box sx={{ display: 'flex', gap: 1, mt: 2, alignItems: 'flex-end' }}>
                                <Autocomplete
                                    options={timeList}
                                    getOptionLabel={(option) => option.displayLabel || ''}
                                    value={timeList.find(t => t.id === routeTimeId) ?? null}
                                    onChange={(_, value) => setRouteTimeId(value?.id ?? null)}
                                    isOptionEqualToValue={(a, b) => a.id === b.id}
                                    renderInput={(params) => (
                                        <TextField {...params} label={timeMode === 'depart_at' ? 'Departure Time' : 'Arrival Time'} size="small" />
                                    )}
                                    size="small"
                                    sx={{ flex: 1 }}
                                />
                                <Button
                                    variant="outlined"
                                    size="small"
                                    onClick={() => handleOpenTimeDialog('route')}
                                    sx={{ minWidth: 36, px: 1, height: 40 }}
                                >
                                    <AddIcon fontSize="small" />
                                </Button>
                            </Box>

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
                            <Box sx={{ display: 'flex', gap: 1, mt: 2, alignItems: 'flex-end' }}>
                                <Autocomplete
                                    options={timeList}
                                    getOptionLabel={(option) => option.displayLabel || ''}
                                    value={timeList.find(t => t.id === stepStartTimeId) ?? null}
                                    onChange={(_, value) => setStepStartTimeId(value?.id ?? null)}
                                    isOptionEqualToValue={(a, b) => a.id === b.id}
                                    renderInput={(params) => (
                                        <TextField {...params} label="Start Time" size="small" />
                                    )}
                                    size="small"
                                    sx={{ flex: 1 }}
                                />
                                <Button
                                    variant="outlined"
                                    size="small"
                                    onClick={() => handleOpenTimeDialog('start')}
                                    sx={{ minWidth: 36, px: 1, height: 40 }}
                                >
                                    <AddIcon fontSize="small" />
                                </Button>
                            </Box>

                            <Box sx={{ display: 'flex', gap: 1, mt: 2, alignItems: 'flex-end' }}>
                                <Autocomplete
                                    options={timeList}
                                    getOptionLabel={(option) => option.displayLabel || ''}
                                    value={timeList.find(t => t.id === stepEndTimeId) ?? null}
                                    onChange={(_, value) => setStepEndTimeId(value?.id ?? null)}
                                    isOptionEqualToValue={(a, b) => a.id === b.id}
                                    renderInput={(params) => (
                                        <TextField {...params} label="End Time" size="small" />
                                    )}
                                    size="small"
                                    sx={{ flex: 1 }}
                                />
                                <Button
                                    variant="outlined"
                                    size="small"
                                    onClick={() => handleOpenTimeDialog('end')}
                                    sx={{ minWidth: 36, px: 1, height: 40 }}
                                >
                                    <AddIcon fontSize="small" />
                                </Button>
                            </Box>
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
                onClose={() => setTimeDialogOpen(false)}
                planId={planId}
                times={times}
                onSubmit={handleSubmitTime}
            />
        </Container>
    );
};

export default StepCreateScreen;
