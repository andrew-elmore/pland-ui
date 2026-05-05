import React, { useMemo } from 'react';
import {
    Box,
    Typography,
    List,
    ListItem,
    ListItemText,
    ListItemButton,
} from '@mui/material';
import { APIProvider, Map, Polyline, Marker } from '@vis.gl/react-google-maps';
import FitBounds from './FitBounds';
import Route from '../../domain/Route';
import DirectionStepArray from '../../domain/DirectionStepArray';
import formatTime from '../../utils/formatTime';

const GOOGLE_MAPS_API_KEY = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;

const RouteOptionsPanel = ({ options, selectedIdx, onSelect, departureTime }) => {
    const selected = selectedIdx != null ? options[selectedIdx] : null;

    const steps = useMemo(() => {
        if (!selected) return [];
        if (selected.steps instanceof DirectionStepArray) return [...selected.steps];
        return selected.steps || [];
    }, [selected]);

    const first = steps[0];
    const last = steps[steps.length - 1];

    const stepTimes = useMemo(() => {
        if (!departureTime || !steps.length) return [];
        let currentTime = new Date(departureTime).getTime();
        return steps.map((step) => {
            const startTime = new Date(currentTime);
            currentTime += step.durationSeconds * 1000;
            return { startTime, endTime: new Date(currentTime) };
        });
    }, [departureTime, steps]);

    const routeForBounds = useMemo(() => {
        if (!selected) return null;
        if (selected.id && selected.steps instanceof DirectionStepArray) return selected;
        return new Route({ ...selected, id: 'preview' });
    }, [selected]);

    const distanceDisplay = (option) => {
        if (option.distanceDisplay) return option.distanceDisplay;
        if (!option.distanceMeters) return '';
        const miles = option.distanceMeters * 0.000621371;
        if (miles >= 0.1) return `${miles.toFixed(1)} mi`;
        return `${Math.round(option.distanceMeters * 3.28084)} ft`;
    };

    return (
        <Box sx={{ display: 'flex', border: '1px solid', borderColor: 'divider', borderRadius: '8px', overflow: 'hidden', height: 450 }}>
            <Box sx={{ width: '25%', flexShrink: 0, borderRight: '1px solid', borderColor: 'divider', overflow: 'auto' }}>
                <List disablePadding>
                    {options.map((option, idx) => (
                        <ListItemButton
                            key={idx}
                            selected={selectedIdx === idx}
                            onClick={() => onSelect(idx)}
                            sx={{ py: 1.5, borderBottom: '1px solid', borderColor: 'divider' }}
                        >
                            <ListItemText
                                primary={option.summary || `Route ${idx + 1}`}
                                secondary={`${Math.round(option.durationSeconds / 60)} min${distanceDisplay(option) ? ` · ${distanceDisplay(option)}` : ''}`}
                                slotProps={{ primary: { sx: { fontWeight: 600, fontSize: '0.85rem' } }, secondary: { sx: { fontSize: '0.75rem' } } }}
                            />
                        </ListItemButton>
                    ))}
                </List>
            </Box>

            {selected && first ? (
                <APIProvider apiKey={GOOGLE_MAPS_API_KEY}>
                    <Box sx={{ width: '30%', flexShrink: 0, borderRight: '1px solid', borderColor: 'divider' }}>
                        <Map
                            defaultCenter={{ lat: (first.startLat + last.endLat) / 2, lng: (first.startLng + last.endLng) / 2 }}
                            defaultZoom={10}
                            gestureHandling="cooperative"
                            disableDefaultUI
                            zoomControl
                            style={{ width: '100%', height: '100%' }}
                        >
                            <FitBounds route={routeForBounds} />
                            {selected.overviewPolyline && (
                                <Polyline
                                    encodedPath={selected.overviewPolyline}
                                    strokeColor="#1976d2"
                                    strokeOpacity={0.8}
                                    strokeWeight={4}
                                />
                            )}
                            <Marker position={{ lat: first.startLat, lng: first.startLng }} />
                            <Marker position={{ lat: last.endLat, lng: last.endLng }} />
                        </Map>
                    </Box>

                    <Box sx={{ width: '45%', flexShrink: 0, p: 1.5, overflow: 'auto' }}>
                        <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 0.5 }}>Directions</Typography>
                        <List disablePadding dense>
                            {steps.map((step, i) => {
                                const times = stepTimes[i];
                                return (
                                    <ListItem key={i} sx={{ py: 0.25, px: 0, alignItems: 'flex-start' }}>
                                        <Box sx={{ minWidth: 24, pt: 0.25 }}>
                                            <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600 }}>{i + 1}</Typography>
                                        </Box>
                                        <ListItemText
                                            primary={
                                                <Typography
                                                    variant="body2"
                                                    sx={{ '& b': { fontWeight: 600 } }}
                                                    dangerouslySetInnerHTML={{ __html: step.htmlInstructions }}
                                                />
                                            }
                                            secondary={
                                                <Box sx={{ display: 'flex', gap: 1.5, mt: 0.25 }}>
                                                    {times && (
                                                        <Typography variant="caption" color="text.secondary">
                                                            {formatTime(times.startTime)} – {formatTime(times.endTime)}
                                                        </Typography>
                                                    )}
                                                    <Typography variant="caption" color="text.secondary">
                                                        {step.distanceDisplay}{step.distanceDisplay && step.durationMinutes > 0 ? ' · ' : ''}{step.durationMinutes > 0 ? `${step.durationMinutes} min` : ''}
                                                    </Typography>
                                                </Box>
                                            }
                                        />
                                    </ListItem>
                                );
                            })}
                        </List>
                    </Box>
                </APIProvider>
            ) : (
                <Box sx={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Typography variant="body2" color="text.secondary">Select a route</Typography>
                </Box>
            )}
        </Box>
    );
};

export default RouteOptionsPanel;
