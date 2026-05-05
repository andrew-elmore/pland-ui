import React from 'react';
import { Box, Typography, ListItem } from '@mui/material';
import DirectionsWalkIcon from '@mui/icons-material/DirectionsWalk';
import formatTime from '../../utils/formatTime';
import { WALK_COLOR } from './routeColors';

const DirectionStepItem = ({ step, index, times, fare }) => {
    const td = step.transitDetails;
    const isTransit = step.travelMode === 'TRANSIT' && td;
    const lineColor = isTransit ? td.lineColor : WALK_COLOR;

    const primaryText = isTransit
        ? `Take ${td.lineShortName || td.lineName} from ${td.departureStop} to ${td.arrivalStop}`
        : step.htmlInstructions;

    const distanceDisplay = (() => {
        if (!step.distanceMeters) return '';
        const miles = step.distanceMeters * 0.000621371;
        if (miles >= 0.1) return `${miles.toFixed(1)} mi`;
        return `${Math.round(step.distanceMeters * 3.28084)} ft`;
    })();

    return (
        <ListItem sx={{ py: 0.5, px: 0, alignItems: 'flex-start' }}>
            <Box sx={{ minWidth: 28, pt: 0.25, display: 'flex', justifyContent: 'center' }}>
                {isTransit ? (
                    <Box sx={{
                        width: 22,
                        height: 22,
                        borderRadius: '4px',
                        backgroundColor: lineColor,
                        color: td.lineTextColor || '#fff',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '0.65rem',
                        fontWeight: 700,
                        lineHeight: 1,
                    }}>
                        {td.lineShortName?.replace(/\s*Line$/i, '') || index + 1}
                    </Box>
                ) : (
                    <DirectionsWalkIcon sx={{ fontSize: 18, color: WALK_COLOR }} />
                )}
            </Box>

            <Box sx={{ flex: 1, ml: 0.5 }}>
                {isTransit ? (
                    <Typography variant="body2" sx={{ fontWeight: 600 }}>{primaryText}</Typography>
                ) : (
                    <Typography variant="body2" sx={{ '& b': { fontWeight: 600 } }} dangerouslySetInnerHTML={{ __html: primaryText }} />
                )}

                {isTransit ? (
                    <Box sx={{
                        mt: 0.5,
                        px: 1,
                        py: 0.5,
                        borderLeft: `3px solid ${lineColor}`,
                        backgroundColor: 'action.hover',
                        borderRadius: '0 4px 4px 0',
                    }}>
                        <Box sx={{ display: 'flex', gap: 1.5, flexWrap: 'wrap', alignItems: 'center' }}>
                            {td.departureTime && td.arrivalTime && (
                                <Typography variant="caption" color="text.secondary">
                                    {formatTime(td.departureTime)} – {formatTime(td.arrivalTime)}
                                </Typography>
                            )}
                            {td.numStops != null && (
                                <Typography variant="caption" color="text.secondary">
                                    {td.numStops} {td.numStops === 1 ? 'stop' : 'stops'}
                                </Typography>
                            )}
                            {step.durationSeconds > 0 && (
                                <Typography variant="caption" color="text.secondary">
                                    {Math.round(step.durationSeconds / 60)} min
                                </Typography>
                            )}
                            {fare?.text && (
                                <Typography variant="caption" color="text.secondary">
                                    {fare.text}
                                </Typography>
                            )}
                            {td.headway && (
                                <Typography variant="caption" color="text.secondary">
                                    every {Math.round(td.headway / 60)} min
                                </Typography>
                            )}
                        </Box>
                    </Box>
                ) : (
                    <Box sx={{ display: 'flex', gap: 1.5, mt: 0.25 }}>
                        {times && (
                            <Typography variant="caption" color="text.secondary">
                                {formatTime(times.startTime)} – {formatTime(times.endTime)}
                            </Typography>
                        )}
                        <Typography variant="caption" color="text.secondary">
                            {distanceDisplay}{distanceDisplay && step.durationSeconds > 0 ? ' · ' : ''}{step.durationSeconds > 0 ? `${Math.round(step.durationSeconds / 60)} min` : ''}
                        </Typography>
                    </Box>
                )}
            </Box>
        </ListItem>
    );
};

export default DirectionStepItem;
