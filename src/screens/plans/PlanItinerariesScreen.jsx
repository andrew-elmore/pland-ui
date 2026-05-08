import React, { useEffect, useState, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import {
    Box,
    Tabs,
    Tab,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    TextField,
    Button,
    IconButton,
    Typography,
    CircularProgress,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import CloseIcon from '@mui/icons-material/Close';
import { actions as itineraryActions, selectors as itinerarySelectors } from '../../store/itinerary';
import { actions as stepActions, selectors as stepSelectors } from '../../store/step';
import { actions as participantActions, selectors as participantSelectors } from '../../store/participant';
import { actions as locationActions, selectors as locationSelectors } from '../../store/location';
import Itinerary from '../../domain/Itinerary';
import ROUTES from '../../router/routes';

const HOUR_HEIGHT = 80;
const TIME_COL_WIDTH = 56;

const PlanItinerariesScreen = () => {
    const { planId } = useParams();
    const navigate = useNavigate();
    const dispatch = useDispatch();

    const itineraries = useSelector(itinerarySelectors.list);
    const { isLoading: itinLoading, isLoaded: itinLoaded } = useSelector(itinerarySelectors.listMeta);
    const itinMutating = useSelector(itinerarySelectors.isMutating);

    const steps = useSelector(stepSelectors.list);
    const participants = useSelector(participantSelectors.list);
    const locations = useSelector(locationSelectors.list);

    const [selectedTab, setSelectedTab] = useState(0);
    const [itinDialogOpen, setItinDialogOpen] = useState(false);
    const [working, setWorking] = useState(() => new Itinerary());
    const [hoveredStepId, setHoveredStepId] = useState(null);

    useEffect(() => {
        if (planId) {
            dispatch(itineraryActions.list(planId));
            dispatch(participantActions.list(planId));
            dispatch(locationActions.list(planId));
        }
    }, [dispatch, planId]);

    const selectedItinerary = itineraries[selectedTab] ?? null;

    useEffect(() => {
        if (selectedItinerary?.id) {
            dispatch(stepActions.list(selectedItinerary.id));
        }
    }, [dispatch, selectedItinerary?.id]);

    const { rangeStart, rangeEnd, totalHours } = useMemo(() => {
        if (steps.length === 0) {
            const today = new Date();
            today.setHours(8, 0, 0, 0);
            const start = today.getTime();
            const end = start + 12 * 60 * 60 * 1000;
            return { rangeStart: start, rangeEnd: end, totalHours: 12 };
        }
        let min = Infinity;
        let max = -Infinity;
        for (let i = 0; i < steps.length; i++) {
            const s = new Date(steps[i].startTime).getTime();
            const e = new Date(steps[i].endTime).getTime();
            if (s < min) min = s;
            if (e > max) max = e;
        }
        const start = new Date(min);
        start.setMinutes(0, 0, 0);
        start.setHours(start.getHours() - 4);
        const end = new Date(max);
        end.setMinutes(0, 0, 0);
        end.setHours(end.getHours() + 5);
        const hours = (end.getTime() - start.getTime()) / (60 * 60 * 1000);
        return { rangeStart: start.getTime(), rangeEnd: end.getTime(), totalHours: hours };
    }, [steps]);

    const totalHeight = totalHours * HOUR_HEIGHT;

    const timeToY = (time) => {
        const t = new Date(time).getTime();
        return ((t - rangeStart) / (rangeEnd - rangeStart)) * totalHeight;
    };

    const hourMarkers = useMemo(() => {
        const markers = [];
        for (let i = 0; i <= totalHours; i++) {
            const time = new Date(rangeStart + i * 60 * 60 * 1000);
            markers.push({
                y: i * HOUR_HEIGHT,
                label: time.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' }),
            });
        }
        return markers;
    }, [rangeStart, totalHours]);

    const handleTabChange = (_, newValue) => {
        if (newValue === itineraries.length) {
            setWorking(new Itinerary());
            setItinDialogOpen(true);
            return;
        }
        setSelectedTab(newValue);
    };

    const handleCreateItinerary = () => {
        dispatch(itineraryActions.create({ name: working.name, planId }));
        setItinDialogOpen(false);
        setWorking(new Itinerary());
        setSelectedTab(itineraries.length);
    };

    const handleAddStep = () => {
        if (!selectedItinerary?.id) return;
        navigate(ROUTES.STEP_CREATE.replace(':planId', planId).replace(':itineraryId', selectedItinerary.id));
    };

    const handleEditStep = (step) => {
        if (!selectedItinerary?.id) return;
        navigate(ROUTES.STEP_EDIT.replace(':planId', planId).replace(':itineraryId', selectedItinerary.id).replace(':stepId', step.id));
    };

    if (itinLoading && !itinLoaded) {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
                <CircularProgress size={28} />
            </Box>
        );
    }

    if (itinLoaded && itineraries.length === 0) {
        return (
            <>
                <Box sx={{ textAlign: 'center', py: 4 }}>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>No itineraries yet.</Typography>
                    <Button variant="outlined" size="small" startIcon={<AddIcon />} onClick={() => { setWorking(new Itinerary()); setItinDialogOpen(true); }} sx={{ borderRadius: '20px', textTransform: 'none', fontWeight: 600 }}>
                        Create itinerary
                    </Button>
                </Box>
                <ItineraryDialog open={itinDialogOpen} onClose={() => setItinDialogOpen(false)} working={working} setWorking={setWorking} onCreate={handleCreateItinerary} isMutating={itinMutating} />
            </>
        );
    }

    const participantList = [...participants];

    return (
        <>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: 1, borderColor: 'divider' }}>
                <Tabs value={selectedTab < itineraries.length ? selectedTab : false} onChange={handleTabChange} variant="scrollable" scrollButtons="auto">
                    {itineraries.map((itinerary) => (
                        <Tab key={itinerary.id} label={itinerary.name} />
                    ))}
                    <Tab icon={<AddIcon fontSize="small" />} sx={{ minWidth: 48 }} />
                </Tabs>
                {selectedItinerary && (
                    <Button variant="outlined" size="small" startIcon={<AddIcon />} onClick={handleAddStep} sx={{ borderRadius: '20px', textTransform: 'none', fontWeight: 600, mr: 1, flexShrink: 0 }}>
                        Add Step
                    </Button>
                )}
            </Box>

            {selectedItinerary && participantList.length > 0 && (
                <Box sx={{ overflow: 'auto', mt: 1, flex: 1 }}>
                    <Box sx={{ display: 'flex', minWidth: TIME_COL_WIDTH + participantList.length * 180 }}>
                        <Box sx={{ width: TIME_COL_WIDTH, flexShrink: 0, pt: '36px' }}>
                            <Box sx={{ position: 'relative', height: totalHeight }}>
                                {hourMarkers.map((m, i) => (
                                    <Typography key={i} variant="caption" sx={{ position: 'absolute', top: m.y - 8, right: 8, color: 'text.secondary', fontSize: '0.65rem', userSelect: 'none' }}>
                                        {m.label}
                                    </Typography>
                                ))}
                            </Box>
                        </Box>

                        {participantList.map((p) => (
                            <Box key={p.id} sx={{ flex: 1, minWidth: 150, borderLeft: '1px solid', borderColor: 'divider' }}>
                                <Box sx={{ height: 36, display: 'flex', alignItems: 'center', justifyContent: 'center', borderBottom: '1px solid', borderColor: 'divider' }}>
                                    <Typography variant="caption" sx={{ fontWeight: 600, fontSize: '0.7rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', px: 1 }}>
                                        {p.fullName || `${p.firstName} ${p.lastName}`.trim()}
                                    </Typography>
                                </Box>
                                <Box sx={{ position: 'relative', height: totalHeight }}>
                                    {hourMarkers.map((m, i) => (
                                        <Box key={i} sx={{ position: 'absolute', top: m.y, left: 0, right: 0, borderTop: '1px solid', borderColor: 'divider', opacity: 0.3 }} />
                                    ))}

                                    {[...steps]
                                        .filter((step) => (step.participantIds ?? []).includes(p.id))
                                        .map((step) => {
                                            const top = timeToY(step.startTime);
                                            const bottom = Math.max(timeToY(step.endTime), top + 32);
                                            const height = bottom - top;
                                            const stepLocation = [...locations].find(l => l.id === step.locationId);
                                            return (
                                                <Box
                                                    key={step.id}
                                                    onClick={() => handleEditStep(step)}
                                                    onMouseEnter={() => setHoveredStepId(step.id)}
                                                    onMouseLeave={() => setHoveredStepId(null)}
                                                    sx={{
                                                        position: 'absolute',
                                                        top,
                                                        left: 4,
                                                        right: 4,
                                                        height,
                                                        borderRadius: '6px',
                                                        border: '1px solid',
                                                        borderColor: hoveredStepId === step.id ? 'primary.main' : 'divider',
                                                        backgroundColor: hoveredStepId === step.id ? 'action.selected' : 'action.hover',
                                                        boxShadow: hoveredStepId === step.id ? '0 0 8px 2px rgba(144,202,249,0.4)' : 'none',
                                                        cursor: 'pointer',
                                                        px: 1,
                                                        py: 0.5,
                                                        overflow: 'hidden',
                                                        transition: 'border-color 0.15s, background-color 0.15s, box-shadow 0.15s',
                                                    }}
                                                >
                                                    <Typography sx={{ fontWeight: 700, fontSize: '0.75rem', lineHeight: 1.2 }}>
                                                        {step.name}
                                                    </Typography>
                                                    <Typography variant="caption" sx={{ color: 'text.secondary', fontSize: '0.6rem' }}>
                                                        {new Date(step.startTime).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })}
                                                        {' – '}
                                                        {new Date(step.endTime).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })}
                                                    </Typography>
                                                    {stepLocation && height > 40 && (
                                                        <Typography variant="caption" sx={{ display: 'block', color: 'text.secondary', fontSize: '0.55rem' }}>
                                                            {stepLocation.name}
                                                        </Typography>
                                                    )}
                                                </Box>
                                            );
                                        })}
                                </Box>
                            </Box>
                        ))}
                    </Box>
                </Box>
            )}

            {selectedItinerary && participantList.length === 0 && (
                <Box sx={{ textAlign: 'center', py: 4 }}>
                    <Typography variant="body2" color="text.secondary">Add participants to see the timeline.</Typography>
                </Box>
            )}

            <ItineraryDialog open={itinDialogOpen} onClose={() => setItinDialogOpen(false)} working={working} setWorking={setWorking} onCreate={handleCreateItinerary} isMutating={itinMutating} />
        </>
    );
};

const ItineraryDialog = ({ open, onClose, working, setWorking, onCreate, isMutating }) => (
    <Dialog open={open} onClose={onClose} maxWidth="xs" fullWidth disableRestoreFocus>
        <DialogTitle sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', pb: 1 }}>
            New Itinerary
            <IconButton onClick={onClose} edge="end" size="small">
                <CloseIcon fontSize="small" />
            </IconButton>
        </DialogTitle>
        <DialogContent sx={{ pt: 1 }}>
            <TextField
                autoFocus
                label="Itinerary Name"
                fullWidth
                value={working.name}
                onChange={(e) => setWorking(working.clone().set('name', e.target.value))}
                size="small"
                sx={{ mt: 1 }}
            />
        </DialogContent>
        <DialogActions sx={{ px: 2, pb: 1.5 }}>
            <Button variant="outlined" size="small" onClick={onClose} sx={{ borderRadius: '20px', textTransform: 'none' }}>Cancel</Button>
            <Button variant="contained" size="small" onClick={onCreate} disabled={isMutating || !working.isSavable()} sx={{ borderRadius: '20px', textTransform: 'none', fontWeight: 600 }}>Create</Button>
        </DialogActions>
    </Dialog>
);

export default PlanItinerariesScreen;
