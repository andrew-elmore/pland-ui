import React, { useState, useRef } from 'react';
import { Box, Typography } from '@mui/material';
import formatTime from '../../utils/formatTime';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import ArrowUpwardIcon from '@mui/icons-material/ArrowUpward';
import ArrowDownwardIcon from '@mui/icons-material/ArrowDownward';
import DirectionsIcon from '@mui/icons-material/Directions';

const SNAP_SECONDS = 60;
const SNAP_MS = SNAP_SECONDS * 1000;
const NODE_SIZE = 28;
const TRACK_WIDTH = 6;

const getTimeIcon = (time) => {
    if (time.isRouteDependent) return DirectionsIcon;
    if (time.isDependent) return time.offsetSeconds >= 0 ? ArrowDownwardIcon : ArrowUpwardIcon;
    return AccessTimeIcon;
};

const getRouteEndMs = (dirSteps) => {
    let lastTransitEnd = null;
    let lastTransitIdx = -1;
    for (let i = 0; i < dirSteps.length; i++) {
        if (dirSteps[i].travelMode === 'TRANSIT' && dirSteps[i].transitDetails?.arrivalTime) {
            lastTransitEnd = new Date(dirSteps[i].transitDetails.arrivalTime).getTime();
            lastTransitIdx = i;
        }
    }
    if (lastTransitEnd == null) return null;
    let endMs = lastTransitEnd;
    for (let i = lastTransitIdx + 1; i < dirSteps.length; i++) {
        endMs += (dirSteps[i].durationSeconds || 0) * 1000;
    }
    return endMs;
};

const getRouteStartMs = (dirSteps) => {
    for (let i = 0; i < dirSteps.length; i++) {
        if (dirSteps[i].travelMode === 'TRANSIT' && dirSteps[i].transitDetails?.departureTime) {
            let startMs = new Date(dirSteps[i].transitDetails.departureTime).getTime();
            for (let j = i - 1; j >= 0; j--) {
                startMs -= (dirSteps[j].durationSeconds || 0) * 1000;
            }
            return startMs;
        }
    }
    return null;
};

const TimelineTrack = ({ times, steps, timeToY, totalHeight, rangeStart, rangeEnd, onEditTime, onTimeUpdate }) => {
    const trackRef = useRef(null);
    const dragRef = useRef(null);
    const [dragState, setDragState] = useState(null);

    const handlePointerDown = (e, time) => {
        e.preventDefault();
        e.stopPropagation();
        trackRef.current.setPointerCapture(e.pointerId);
        const rect = trackRef.current.getBoundingClientRect();
        const y = e.clientY - rect.top;

        let minY = 0;
        let maxY = totalHeight;
        let minOffset = 0;
        const timeMs = new Date(time.datetime).getTime();
        const bufferMs = (time.offsetSeconds || 0) * 1000;

        if (time.isRouteDependent) {
            const parentTime = times.find(t => t.id === time.parentTimeId);
            const isBefore = parentTime && timeMs < new Date(parentTime.datetime).getTime();
            const step = steps.find(s => s.routeId === time.routeId);
            const dirSteps = step?.route?.steps;

            if (isBefore) {
                const routeStartMs = dirSteps?.length ? getRouteStartMs(dirSteps) : null;
                if (routeStartMs != null) {
                    maxY = timeToY(new Date(routeStartMs));
                    const parentMs = new Date(parentTime.datetime).getTime();
                    minOffset = Math.max(0, (parentMs - routeStartMs) / 1000 - (step.route?.durationSeconds || 0));
                } else {
                    maxY = timeToY(new Date(timeMs + bufferMs));
                }
            } else {
                const routeEndMs = dirSteps?.length ? getRouteEndMs(dirSteps) : null;
                if (routeEndMs != null) {
                    minY = timeToY(new Date(routeEndMs));
                    const parentMs = new Date(parentTime.datetime).getTime();
                    minOffset = Math.max(0, (routeEndMs - parentMs) / 1000 - (step.route?.durationSeconds || 0));
                } else {
                    minY = timeToY(new Date(timeMs - bufferMs));
                }
            }
        } else if (time.isDependent && time.parentTimeId) {
            const parentTime = times.find(t => t.id === time.parentTimeId);
            if (parentTime) {
                const parentY = timeToY(parentTime.datetime);
                if ((time.offsetSeconds || 0) < 0) {
                    maxY = parentY;
                } else if ((time.offsetSeconds || 0) > 0) {
                    minY = parentY;
                }
            }
        }

        dragRef.current = { timeId: time.id, startY: y, currentY: y, time, minY, maxY, minOffset };
        setDragState({ timeId: time.id, currentY: y });
    };

    const handlePointerMove = (e) => {
        if (!dragRef.current) return;
        const rect = trackRef.current.getBoundingClientRect();
        const { minY, maxY } = dragRef.current;
        const y = Math.max(minY, Math.min(maxY, e.clientY - rect.top));
        dragRef.current.currentY = y;
        setDragState({ timeId: dragRef.current.timeId, currentY: y });
    };

    const handlePointerUp = () => {
        const drag = dragRef.current;
        if (!drag) return;
        dragRef.current = null;
        setDragState(null);

        const { time, startY, currentY, minOffset } = drag;
        const deltaY = currentY - startY;
        const deltaMs = (deltaY / totalHeight) * (rangeEnd - rangeStart);

        console.log(':~: drag end', {
            timeId: time.id,
            label: time.label,
            isDependent: time.isDependent,
            isRouteDependent: time.isRouteDependent,
            parentTimeId: time.parentTimeId,
            offsetSeconds: time.offsetSeconds,
            datetime: time.datetime,
            deltaY,
            deltaMs,
            deltaSeconds: Math.round(deltaMs / 1000),
        });

        if (Math.abs(deltaMs) < 30000) {
            console.log(':~: drag ignored — deltaMs below threshold');
            return;
        }

        const deltaSeconds = Math.round(deltaMs / 1000);

        if (time.isRouteDependent) {
            const parentTime = times.find(t => t.id === time.parentTimeId);
            const isBefore = parentTime && new Date(time.datetime) < new Date(parentTime.datetime);
            const adjustedDelta = isBefore ? -deltaSeconds : deltaSeconds;
            const floor = Math.ceil((minOffset || 0) / SNAP_SECONDS) * SNAP_SECONDS;
            const newOffset = Math.max(floor, (time.offsetSeconds || 0) + adjustedDelta);
            const snapped = Math.max(floor, Math.round(newOffset / SNAP_SECONDS) * SNAP_SECONDS);
            console.log(':~: route-dependent update', JSON.stringify({ isBefore, oldOffset: time.offsetSeconds, adjustedDelta, minOffset, floor, newOffset, snapped }));
            if (snapped !== (time.offsetSeconds || 0)) {
                onTimeUpdate(time.id, { offsetSeconds: snapped, parentTimeId: time.parentTimeId, routeId: time.routeId });
            } else {
                console.log(':~: no change — snapped equals current');
            }
        } else if (time.isDependent) {
            const oldOffset = time.offsetSeconds || 0;
            const newOffset = oldOffset + deltaSeconds;
            let snapped = Math.round(newOffset / SNAP_SECONDS) * SNAP_SECONDS;
            if (oldOffset < 0) snapped = Math.min(0, snapped);
            else if (oldOffset > 0) snapped = Math.max(0, snapped);
            console.log(':~: dependent update', JSON.stringify({ oldOffset, newOffset, snapped }));
            if (snapped !== (time.offsetSeconds || 0)) {
                onTimeUpdate(time.id, { offsetSeconds: snapped, parentTimeId: time.parentTimeId });
            } else {
                console.log(':~: no change — snapped equals current');
            }
        } else {
            const startTs = new Date(time.datetime).getTime();
            const newTs = Math.round((startTs + deltaMs) / SNAP_MS) * SNAP_MS;
            const newDatetime = new Date(newTs).toISOString();
            console.log(':~: absolute update', { oldDatetime: time.datetime, newDatetime });
            if (newDatetime !== time.datetime) {
                onTimeUpdate(time.id, { datetime: newDatetime });
            } else {
                console.log(':~: no change — datetime unchanged');
            }
        }
    };

    const formatTimestamp = (ts) => formatTime(ts);

    const sortedTimes = [...times]
        .filter(t => t.datetime)
        .sort((a, b) => new Date(a.datetime) - new Date(b.datetime));

    return (
        <Box
            ref={trackRef}
            onPointerMove={handlePointerMove}
            onPointerUp={handlePointerUp}
            sx={{
                position: 'relative',
                height: totalHeight,
                width: '100%',
                touchAction: 'none',
            }}
        >
            <Box sx={{
                position: 'absolute',
                right: NODE_SIZE / 2 - TRACK_WIDTH / 2,
                top: 0,
                bottom: 0,
                width: TRACK_WIDTH,
                backgroundColor: 'action.hover',
                borderRadius: TRACK_WIDTH / 2,
            }} />

            {sortedTimes.map((time) => {
                const isDragging = dragState?.timeId === time.id;
                const y = isDragging ? dragState.currentY : timeToY(time.datetime);
                const Icon = getTimeIcon(time);
                const label = isDragging
                    ? formatTimestamp(rangeStart + (dragState.currentY / totalHeight) * (rangeEnd - rangeStart))
                    : time.formattedTime;

                return (
                    <Box
                        key={time.id}
                        sx={{
                            position: 'absolute',
                            top: y - NODE_SIZE / 2,
                            right: 0,
                            left: 0,
                            height: NODE_SIZE,
                            display: 'flex',
                            alignItems: 'center',
                            zIndex: isDragging ? 10 : 1,
                        }}
                    >
                        <Typography
                            onClick={(e) => { e.stopPropagation(); onEditTime(time); }}
                            sx={{
                                position: 'absolute',
                                right: NODE_SIZE + 6,
                                fontSize: '0.65rem',
                                color: isDragging ? 'primary.main' : 'text.secondary',
                                cursor: 'pointer',
                                userSelect: 'none',
                                whiteSpace: 'nowrap',
                                fontWeight: isDragging ? 600 : 400,
                                transition: 'color 0.15s',
                                '&:hover': { color: 'primary.light' },
                            }}
                        >
                            {label}
                        </Typography>

                        <Box
                            onPointerDown={(e) => handlePointerDown(e, time)}
                            sx={{
                                position: 'absolute',
                                right: 0,
                                width: NODE_SIZE,
                                height: NODE_SIZE,
                                borderRadius: '50%',
                                border: '2px solid',
                                borderColor: isDragging ? 'primary.main' : 'divider',
                                backgroundColor: 'background.paper',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                cursor: isDragging ? 'grabbing' : 'grab',
                                transition: isDragging ? 'none' : 'border-color 0.15s, box-shadow 0.15s',
                                boxShadow: isDragging ? '0 0 8px 2px rgba(156,39,176,0.4)' : 'none',
                                '&:hover': {
                                    borderColor: 'primary.main',
                                    boxShadow: '0 0 4px 1px rgba(156,39,176,0.2)',
                                },
                            }}
                        >
                            <Icon sx={{ fontSize: 14, color: isDragging ? 'primary.main' : 'text.secondary' }} />
                        </Box>
                    </Box>
                );
            })}
        </Box>
    );
};

export default TimelineTrack;
