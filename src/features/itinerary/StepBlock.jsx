import React, { useMemo } from 'react';
import { Box, Typography, IconButton } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import { getStepColor, DRIVE_COLOR } from '../route/routeColors';

const BAR_WIDTH = 10;
const WALK_PATTERN = 'repeating-linear-gradient(45deg, #42a5f5, #42a5f5 2px, #fff 2px, #fff 4px)';
const WAIT_PATTERN = 'repeating-linear-gradient(-45deg, #4caf50, #4caf50 2px, #fff 2px, #fff 4px)';

const buildSegments = (step) => {
    if (!step.route || !step.route.steps?.length) {
        const travelMode = step.route?.travelMode;
        if (travelMode === 'drive') return [{ fraction: 1, bg: DRIVE_COLOR }];
        if (travelMode === 'walk') return [{ fraction: 1, bg: WALK_PATTERN }];
        return [{ fraction: 1, bg: WAIT_PATTERN }];
    }

    const totalMs = new Date(step.endTime) - new Date(step.startTime);
    if (totalMs <= 0) return [{ fraction: 1, bg: WAIT_PATTERN }];

    const dirSteps = step.route.steps;
    const times = new Array(dirSteps.length);

    for (let i = 0; i < dirSteps.length; i++) {
        const td = dirSteps[i].transitDetails;
        if (dirSteps[i].travelMode === 'TRANSIT' && td?.departureTime && td?.arrivalTime) {
            times[i] = { start: new Date(td.departureTime).getTime(), end: new Date(td.arrivalTime).getTime() };
        }
    }
    for (let i = 0; i < dirSteps.length; i++) {
        if (times[i]) continue;
        const ms = dirSteps[i].durationSeconds * 1000;
        const prev = i > 0 ? times[i - 1] : null;
        if (prev) {
            times[i] = { start: prev.end, end: prev.end + ms };
        }
    }
    for (let i = dirSteps.length - 1; i >= 0; i--) {
        if (times[i]) continue;
        const ms = dirSteps[i].durationSeconds * 1000;
        const next = i < dirSteps.length - 1 ? times[i + 1] : null;
        if (next) {
            times[i] = { start: next.start - ms, end: next.start };
        }
    }
    const stepStartMs = new Date(step.startTime).getTime();
    for (let i = 0; i < dirSteps.length; i++) {
        if (times[i]) continue;
        const ms = dirSteps[i].durationSeconds * 1000;
        const prev = i > 0 ? times[i - 1] : null;
        const s = prev ? prev.end : stepStartMs;
        times[i] = { start: s, end: s + ms };
    }

    const stepEndMs = stepStartMs + totalMs;
    const segments = [];
    let cursor = stepStartMs;

    for (let i = 0; i < dirSteps.length; i++) {
        const t = times[i];
        const cStart = Math.max(t.start, stepStartMs);
        const cEnd = Math.min(t.end, stepEndMs);
        if (cStart >= stepEndMs || cEnd <= stepStartMs) continue;

        if (cStart > cursor) {
            segments.push({ fraction: (cStart - cursor) / totalMs, bg: WAIT_PATTERN });
        }
        const dur = cEnd - Math.max(cStart, cursor);
        if (dur > 0) {
            const isWalk = dirSteps[i].travelMode === 'WALKING';
            segments.push({ fraction: dur / totalMs, bg: isWalk ? WALK_PATTERN : getStepColor(dirSteps[i]) });
        }
        cursor = Math.max(cursor, cEnd);
    }

    if (cursor < stepEndMs) {
        segments.push({ fraction: (stepEndMs - cursor) / totalMs, bg: WAIT_PATTERN });
    }

    return segments;
};

const StepBlock = ({ step, top, actualHeight, hasAbove, hasBelow, isHovered, onHover, onClick, createUrl, navigate }) => {
    const labelFits = actualHeight >= 18;
    const needsExpansion = isHovered && !labelFits;
    const height = needsExpansion ? 24 : actualHeight;
    const aboveLocationId = step.route ? step.route.originLocationId : step.locationId;
    const belowLocationId = step.route ? step.route.destinationLocationId : step.locationId;
    const pIds = (step.participantIds || []).join(',');
    const segments = useMemo(() => step.route ? buildSegments(step) : null, [step]);

    return (
        <Box
            onClick={() => onClick(step)}
            onMouseEnter={() => onHover(step.id)}
            onMouseLeave={() => onHover(null)}
            sx={{
                position: 'absolute',
                top,
                left: 4,
                right: 4,
                height,
                borderRadius: 0,
                border: '1px solid',
                zIndex: isHovered ? 2 : 1,
                borderColor: isHovered ? 'primary.main' : 'divider',
                backgroundColor: needsExpansion ? 'background.paper' : isHovered ? 'action.selected' : 'action.hover',
                boxShadow: isHovered ? '0 0 8px 2px rgba(144,202,249,0.4)' : 'none',
                cursor: 'pointer',
                px: 1,
                transition: 'border-color 0.15s, background-color 0.15s, box-shadow 0.15s, height 0.15s',
                display: 'flex',
                alignItems: 'center',
                overflow: 'hidden',
            }}
        >
            {segments && (
                <Box sx={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: BAR_WIDTH, display: 'flex', flexDirection: 'column' }}>
                    {segments.map((seg, i) => (
                        <Box key={i} sx={{ flex: `${seg.fraction} 0 0%`, background: seg.bg, minHeight: '1px' }} />
                    ))}
                </Box>
            )}
            {(labelFits || needsExpansion) && (
                <Typography sx={{ fontWeight: 700, fontSize: '0.75rem', lineHeight: 1.2, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', ml: segments ? `${BAR_WIDTH + 4}px` : 0 }}>
                    {step.name}
                </Typography>
            )}
            {isHovered && !hasAbove && step.startTimeId && (
                <IconButton
                    size="small"
                    onClick={(e) => { e.stopPropagation(); navigate(`${createUrl}?endTimeId=${step.startTimeId}${aboveLocationId ? `&locationId=${aboveLocationId}` : ''}${pIds ? `&participantIds=${pIds}` : ''}`); }}
                    sx={{ position: 'absolute', top: -12, left: '50%', transform: 'translateX(-50%)', width: 24, height: 24, backgroundColor: 'background.paper', border: '1px solid', borderColor: 'divider', zIndex: 1, '&:hover': { backgroundColor: 'action.hover' } }}
                >
                    <AddIcon sx={{ fontSize: 16 }} />
                </IconButton>
            )}
            {isHovered && !hasBelow && step.endTimeId && (
                <IconButton
                    size="small"
                    onClick={(e) => { e.stopPropagation(); navigate(`${createUrl}?startTimeId=${step.endTimeId}${belowLocationId ? `&locationId=${belowLocationId}` : ''}${pIds ? `&participantIds=${pIds}` : ''}`); }}
                    sx={{ position: 'absolute', bottom: -12, left: '50%', transform: 'translateX(-50%)', width: 24, height: 24, backgroundColor: 'background.paper', border: '1px solid', borderColor: 'divider', zIndex: 1, '&:hover': { backgroundColor: 'action.hover' } }}
                >
                    <AddIcon sx={{ fontSize: 16 }} />
                </IconButton>
            )}
        </Box>
    );
};

export default StepBlock;
