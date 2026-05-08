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
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    IconButton,
    Alert,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import AddIcon from '@mui/icons-material/Add';
import { actions as stepActions, selectors as stepSelectors } from '../../store/step';
import { actions as participantActions, selectors as participantSelectors } from '../../store/participant';
import { actions as locationActions, selectors as locationSelectors } from '../../store/location';
import { actions as timeActions, selectors as timeSelectors } from '../../store/time';
import useMutateEffect from '../../hooks/useMutateEffect';
import ROUTES from '../../router/routes';

const StepEditScreen = () => {
    const { planId, itineraryId, stepId } = useParams();
    const navigate = useNavigate();
    const dispatch = useDispatch();

    const step = useSelector(stepSelectors.current);
    const { isLoading, isLoaded, isMutating } = useSelector(stepSelectors.currentMeta);
    const error = useSelector(stepSelectors.error);
    const participants = useSelector(participantSelectors.list);
    const locations = useSelector(locationSelectors.list);
    const times = useSelector(timeSelectors.list);

    const [stepName, setStepName] = useState('');
    const [stepStartTimeId, setStepStartTimeId] = useState(null);
    const [stepEndTimeId, setStepEndTimeId] = useState(null);
    const [stepParticipantIds, setStepParticipantIds] = useState([]);
    const [stepLocationId, setStepLocationId] = useState(null);
    const [initialized, setInitialized] = useState(false);

    const [timeDialogOpen, setTimeDialogOpen] = useState(false);
    const [timeDialogTarget, setTimeDialogTarget] = useState(null);
    const [newTimeLabel, setNewTimeLabel] = useState('');
    const [newTimeDatetime, setNewTimeDatetime] = useState('');

    useEffect(() => {
        if (planId) {
            dispatch(participantActions.list(planId));
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
            setInitialized(true);
        }
    }, [step, stepId, initialized]);

    const submit = useMutateEffect(isMutating, error, {
        onSuccess: () => {
            navigate(ROUTES.PLAN_ITINERARIES.replace(':planId', planId));
        },
    });

    const handleSubmit = () => {
        if (!stepName.trim() || !stepStartTimeId || !stepEndTimeId) return;
        submit(stepActions.update(stepId, {
            name: stepName.trim(),
            startTimeId: stepStartTimeId,
            endTimeId: stepEndTimeId,
            participantIds: stepParticipantIds,
            locationId: stepLocationId,
        }));
    };

    const handleDelete = () => {
        dispatch(stepActions.remove(stepId));
        navigate(ROUTES.PLAN_ITINERARIES.replace(':planId', planId));
    };

    const handleCancel = () => {
        navigate(ROUTES.PLAN_ITINERARIES.replace(':planId', planId));
    };

    const handleOpenTimeDialog = (target) => {
        setTimeDialogTarget(target);
        setNewTimeLabel('');
        setNewTimeDatetime('');
        setTimeDialogOpen(true);
    };

    const handleCreateTime = () => {
        if (!newTimeDatetime) return;
        const data = {
            planId,
            label: newTimeLabel.trim(),
            datetime: new Date(newTimeDatetime).toISOString(),
        };
        dispatch(timeActions.create(data)).then((action) => {
            if (action.type.endsWith('_FULFILLED')) {
                const newId = action.payload.id;
                if (timeDialogTarget === 'start') setStepStartTimeId(newId);
                if (timeDialogTarget === 'end') setStepEndTimeId(newId);
            }
        });
        setTimeDialogOpen(false);
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

    const participantList = [...participants];
    const timeList = [...times];

    return (
        <Container maxWidth="sm">
            <Box py={4}>
                <Paper elevation={3} sx={{ p: 4 }}>
                    <Box mb={3}>
                        <Typography variant="h5" gutterBottom>Edit Step</Typography>
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
                        options={[...locations]}
                        getOptionLabel={(option) => option.name || ''}
                        value={[...locations].find(l => l.id === stepLocationId) ?? null}
                        onChange={(_, value) => setStepLocationId(value?.id ?? null)}
                        isOptionEqualToValue={(a, b) => a.id === b.id}
                        renderInput={(params) => (
                            <TextField {...params} label="Location (optional)" size="small" />
                        )}
                        size="small"
                        sx={{ mt: 2 }}
                    />

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
                                disabled={isMutating || !stepName.trim() || !stepStartTimeId || !stepEndTimeId || stepParticipantIds.length === 0}
                                sx={{ borderRadius: '20px', textTransform: 'none', fontWeight: 600 }}
                            >
                                Save
                            </Button>
                        </Box>
                    </Box>
                </Paper>
            </Box>

            <Dialog open={timeDialogOpen} onClose={() => setTimeDialogOpen(false)} maxWidth="xs" fullWidth disableRestoreFocus>
                <DialogTitle sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', pb: 1 }}>
                    New Time
                    <IconButton onClick={() => setTimeDialogOpen(false)} edge="end" size="small">
                        <CloseIcon fontSize="small" />
                    </IconButton>
                </DialogTitle>
                <DialogContent sx={{ pt: 1 }}>
                    <TextField
                        autoFocus
                        label="Label"
                        fullWidth
                        value={newTimeLabel}
                        onChange={(e) => setNewTimeLabel(e.target.value)}
                        size="small"
                        placeholder="e.g. Party Starts"
                        sx={{ mt: 1 }}
                    />
                    <TextField
                        label="Date & Time"
                        type="datetime-local"
                        fullWidth
                        value={newTimeDatetime}
                        onChange={(e) => setNewTimeDatetime(e.target.value)}
                        size="small"
                        slotProps={{ inputLabel: { shrink: true } }}
                        sx={{ mt: 1.5 }}
                    />
                </DialogContent>
                <DialogActions sx={{ px: 2, pb: 1.5 }}>
                    <Button variant="outlined" size="small" onClick={() => setTimeDialogOpen(false)} sx={{ borderRadius: '20px', textTransform: 'none' }}>
                        Cancel
                    </Button>
                    <Button
                        variant="contained"
                        size="small"
                        onClick={handleCreateTime}
                        disabled={!newTimeDatetime}
                        sx={{ borderRadius: '20px', textTransform: 'none', fontWeight: 600 }}
                    >
                        Create
                    </Button>
                </DialogActions>
            </Dialog>
        </Container>
    );
};

export default StepEditScreen;
