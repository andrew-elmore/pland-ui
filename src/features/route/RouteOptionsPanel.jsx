import React, { useMemo } from 'react';
import {
    Box,
    Typography,
    List,
    ListItemText,
    ListItemButton,
} from '@mui/material';
import { APIProvider, Map, Polyline, Marker } from '@vis.gl/react-google-maps';
import FitBounds from './FitBounds';
import Route from '../../domain/Route';
import DirectionStepItem from './DirectionStepItem';
import { getStepColor } from './routeColors';

const GOOGLE_MAPS_API_KEY = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;

const RouteOptionsPanel = ({ options, selectedIdx, onSelect, departureTime }) => {
    const selected = selectedIdx != null ? options[selectedIdx] : null;

    const steps = useMemo(() => {
        if (!selected) return [];
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
                            {steps.map((step, i) => step.polyline && (
                                <Polyline
                                    key={i}
                                    encodedPath={step.polyline}
                                    strokeColor={getStepColor(step)}
                                    strokeOpacity={step.travelMode === 'WALKING' ? 0 : 0.9}
                                    strokeWeight={step.travelMode === 'WALKING' ? 0 : 7}
                                    geodesic
                                />
                            ))}
                            {steps.map((step, i) => step.polyline && step.travelMode === 'WALKING' && (
                                <Polyline
                                    key={`walk-${i}`}
                                    encodedPath={step.polyline}
                                    strokeColor={getStepColor(step)}
                                    strokeOpacity={0.7}
                                    strokeWeight={4}
                                    icons={[{ icon: { path: 'M 0,-0.5 0,0.5', strokeOpacity: 1, scale: 3 }, offset: '0', repeat: '10px' }]}
                                />
                            ))}
                            <Marker position={{ lat: first.startLat, lng: first.startLng }} />
                            <Marker position={{ lat: last.endLat, lng: last.endLng }} />
                        </Map>
                    </Box>

                    <Box sx={{ width: '45%', flexShrink: 0, p: 1.5, overflow: 'auto' }}>
                        <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 0.5 }}>Directions</Typography>
                        <List disablePadding dense>
                            {steps.map((step, i) => (
                                <DirectionStepItem key={i} step={step} index={i} times={stepTimes[i]} fare={selected.fare} />
                            ))}
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
