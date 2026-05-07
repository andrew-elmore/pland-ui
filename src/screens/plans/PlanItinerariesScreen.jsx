import React, { useEffect, useState, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import {
    Box,
    Tabs,
    Tab,
    Button,
    Typography,
    CircularProgress,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import StepBlock from '../../features/itinerary/StepBlock';
import TimelineTrack from '../../features/itinerary/TimelineTrack';
import ItineraryForm from '../../features/itinerary/ItineraryDialog';
import Form from '../../components/common/Form';
import TimeForm from '../../components/common/TimeFormDialog';
import { actions as itineraryActions, selectors as itinerarySelectors } from '../../store/itinerary';
import { actions as stepActions, selectors as stepSelectors } from '../../store/step';
import { actions as participantActions, selectors as participantSelectors } from '../../store/participant';
import { actions as locationActions } from '../../store/location';
import { actions as timeActions, selectors as timeSelectors } from '../../store/time';
import { actions as uiActions } from '../../store/ui';
import Itinerary from '../../domain/Itinerary';
import ROUTES from '../../router/routes';
import formatTime from '../../utils/formatTime';

const HOUR_HEIGHT = 80;
const TIME_COL_WIDTH = 100;

const PlanItinerariesScreen = () => {
    const { planId } = useParams();
    const navigate = useNavigate();
    const dispatch = useDispatch();

    const itineraries = useSelector(itinerarySelectors.list);
    const { isLoading: itinLoading, isLoaded: itinLoaded } = useSelector(itinerarySelectors.listMeta);
    const itinMutating = useSelector(itinerarySelectors.isMutating);

    const steps = useSelector(stepSelectors.list);
    const participants = useSelector(participantSelectors.list);
    const times = useSelector(timeSelectors.list);
    const timeMutating = useSelector(timeSelectors.isMutating);
    const [selectedTab, setSelectedTab] = useState(0);
    const [working, setWorking] = useState(() => new Itinerary());
    const [hoveredStepId, setHoveredStepId] = useState(null);
    const [editingTime, setEditingTime] = useState(null);

    useEffect(() => {
        if (planId) {
            dispatch(itineraryActions.list(planId));
            dispatch(participantActions.list(planId));
            dispatch(locationActions.list(planId));
            dispatch(timeActions.list(planId));
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
                label: formatTime(time),
            });
        }
        return markers;
    }, [rangeStart, totalHours]);

    const stepTimes = useMemo(() => {
        const timeIds = new Set();
        for (const step of steps) {
            if (step.startTimeId) timeIds.add(step.startTimeId);
            if (step.endTimeId) timeIds.add(step.endTimeId);
        }
        const timeList = [...times];
        return [...timeIds].map(id => timeList.find(t => t.id === id)).filter(Boolean);
    }, [steps, times]);

    const handleTabChange = (_, newValue) => {
        if (newValue === itineraries.length) {
            setWorking(new Itinerary());
            dispatch(uiActions.openDialog('itinerary-new'));
            return;
        }
        setSelectedTab(newValue);
    };

    const handleCreateItinerary = () => {
        dispatch(itineraryActions.create({ name: working.name, planId }));
        setSelectedTab(itineraries.length);
    };

    const handleAddStep = () => {
        if (!selectedItinerary?.id) return;
        navigate(ROUTES.STEP_CREATE.replace(':planId', planId).replace(':itineraryId', selectedItinerary.id));
    };

    const handleViewStep = (step) => {
        if (!selectedItinerary?.id) return;
        navigate(ROUTES.STEP_DETAILS.replace(':planId', planId).replace(':itineraryId', selectedItinerary.id).replace(':stepId', step.id));
    };

    const handleEditTime = (time) => {
        setEditingTime(time);
        dispatch(uiActions.openDialog(`time-${time.id}`));
    };

    const handleTimeUpdate = (timeId, data) => {
        console.log(':~: handleTimeUpdate', JSON.stringify({ timeId, data }));
        dispatch(timeActions.update(timeId, data)).then((result) => {
            console.log(':~: time update fulfilled', JSON.stringify(result));
            dispatch(timeActions.list(planId));
            if (selectedItinerary?.id) {
                dispatch(stepActions.list(selectedItinerary.id));
            }
        }).catch((err) => {
            console.error(':~: time update rejected', JSON.stringify(err, Object.getOwnPropertyNames(err)));
        });
    };

    const handleSubmitTime = (data) => {
        if (!editingTime) return;
        dispatch(timeActions.update(editingTime.id, data)).then(() => {
            dispatch(timeActions.list(planId));
            if (selectedItinerary?.id) {
                dispatch(stepActions.list(selectedItinerary.id));
            }
        });
    };

    if (itinLoading && !itinLoaded) {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
                <CircularProgress size={28} />
            </Box>
        );
    }

    const participantList = [...participants];

    const itineraryForm = (
        <Form
            formType="itinerary"
            title="New Itinerary"
            maxWidth="xs"
            actions={({ onClose }) => (
                <>
                    <Button variant="outlined" size="small" onClick={onClose} sx={{ borderRadius: '20px', textTransform: 'none' }}>Cancel</Button>
                    <Button variant="contained" size="small" onClick={() => { handleCreateItinerary(); onClose(); }} disabled={itinMutating || !working.isSavable()} sx={{ borderRadius: '20px', textTransform: 'none', fontWeight: 600 }}>Create</Button>
                </>
            )}
            onClose={() => setWorking(new Itinerary())}
        >
            <ItineraryForm working={working} setWorking={setWorking} />
        </Form>
    );

    if (itinLoaded && itineraries.length === 0) {
        return (
            <>
                <Box sx={{ textAlign: 'center', py: 4 }}>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>No itineraries yet.</Typography>
                    <Button variant="outlined" size="small" startIcon={<AddIcon />} onClick={() => { setWorking(new Itinerary()); dispatch(uiActions.openDialog('itinerary-new')); }} sx={{ borderRadius: '20px', textTransform: 'none', fontWeight: 600 }}>
                        Create itinerary
                    </Button>
                </Box>
                {itineraryForm}
            </>
        );
    }

    return (
        <Box sx={{ display: 'flex', flexDirection: 'column', m: -2, height: 'calc(100vh - 64px)' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: 1, borderColor: 'divider', flexShrink: 0 }}>
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
                <Box sx={{ flex: 1, overflow: 'auto', minHeight: 0 }}>
                    <Box sx={{ display: 'flex', minWidth: TIME_COL_WIDTH + participantList.length * 180 }}>
                        <Box sx={{ width: TIME_COL_WIDTH, flexShrink: 0, pt: '36px' }}>
                            <TimelineTrack
                                times={stepTimes}
                                timeToY={timeToY}
                                totalHeight={totalHeight}
                                rangeStart={rangeStart}
                                rangeEnd={rangeEnd}
                                onEditTime={handleEditTime}
                                onTimeUpdate={handleTimeUpdate}
                            />
                        </Box>

                        {participantList.map((p) => {
                            const pSteps = [...steps].filter((s) => (s.participantIds ?? []).includes(p.id));
                            const pEndTimeIds = new Set(pSteps.map((s) => s.endTimeId).filter(Boolean));
                            const pStartTimeIds = new Set(pSteps.map((s) => s.startTimeId).filter(Boolean));
                            const createUrl = ROUTES.STEP_CREATE.replace(':planId', planId).replace(':itineraryId', selectedItinerary.id);
                            return (
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

                                        {pSteps.sort((a, b) => new Date(a.startTime) - new Date(b.startTime)).map((step) => (
                                            <StepBlock
                                                key={step.id}
                                                step={step}
                                                top={timeToY(step.startTime)}
                                                actualHeight={timeToY(step.endTime) - timeToY(step.startTime)}
                                                hasAbove={pEndTimeIds.has(step.startTimeId)}
                                                hasBelow={pStartTimeIds.has(step.endTimeId)}
                                                isHovered={hoveredStepId === step.id}
                                                onHover={setHoveredStepId}
                                                onClick={handleViewStep}
                                                createUrl={createUrl}
                                                navigate={navigate}
                                            />
                                        ))}
                                    </Box>
                                </Box>
                            );
                        })}
                    </Box>
                </Box>
            )}

            {selectedItinerary && participantList.length === 0 && (
                <Box sx={{ textAlign: 'center', py: 4 }}>
                    <Typography variant="body2" color="text.secondary">Add participants to see the timeline.</Typography>
                </Box>
            )}

            {itineraryForm}

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
        </Box>
    );
};

export default PlanItinerariesScreen;
