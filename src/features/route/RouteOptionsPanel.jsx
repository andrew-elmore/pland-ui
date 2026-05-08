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
import formatDistance from '../../utils/formatDistance';

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
        if (!steps.length) return [];
        const result = new Array(steps.length);
        for (let i = 0; i < steps.length; i++) {
            const td = steps[i].transitDetails;
            if (steps[i].travelMode === 'TRANSIT' && td?.departureTime && td?.arrivalTime) {
                result[i] = { startTime: new Date(td.departureTime), endTime: new Date(td.arrivalTime) };
            }
        }
        for (let i = 0; i < steps.length; i++) {
            if (result[i]) continue;
            const ms = steps[i].durationSeconds * 1000;
            const prev = i > 0 ? result[i - 1] : null;
            if (prev) {
                const s = prev.endTime;
                result[i] = { startTime: s, endTime: new Date(s.getTime() + ms) };
            }
        }
        for (let i = steps.length - 1; i >= 0; i--) {
            if (result[i]) continue;
            const ms = steps[i].durationSeconds * 1000;
            const next = i < steps.length - 1 ? result[i + 1] : null;
            if (next) {
                const e = next.startTime;
                result[i] = { startTime: new Date(e.getTime() - ms), endTime: e };
            }
        }
        for (let i = 0; i < steps.length; i++) {
            if (result[i]) continue;
            const ms = steps[i].durationSeconds * 1000;
            const prev = i > 0 ? result[i - 1] : null;
            const s = prev ? prev.endTime : departureTime ? new Date(departureTime) : new Date();
            result[i] = { startTime: s, endTime: new Date(s.getTime() + ms) };
        }
        return result;
    }, [departureTime, steps]);

    const routeForBounds = useMemo(() => {
        if (!selected) return null;
        return new Route({ ...selected, id: 'preview' });
    }, [selected]);

    const distanceDisplay = (option) =>
        option.distanceDisplay || formatDistance(option.distanceMeters);

    return (
        <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, border: '1px solid', borderColor: 'divider', borderRadius: '8px', overflow: 'hidden', height: { xs: 'auto', md: 450 } }}>
            <Box sx={{ width: { xs: '100%', md: '25%' }, flexShrink: 0, borderRight: { md: '1px solid' }, borderBottom: { xs: '1px solid', md: 'none' }, borderColor: 'divider', overflow: 'auto', maxHeight: { xs: 150, md: 'none' } }}>
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
                    <Box sx={{ width: { xs: '100%', md: '30%' }, height: { xs: 250, md: 'auto' }, flexShrink: 0, borderRight: { md: '1px solid' }, borderBottom: { xs: '1px solid', md: 'none' }, borderColor: 'divider' }}>
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

                    <Box sx={{ width: { xs: '100%', md: '45%' }, flexShrink: { md: 0 }, p: 1.5, overflow: 'auto' }}>
                        <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 0.5 }}>Directions</Typography>
                        <List disablePadding dense>
                            {steps.map((step, i) => (
                                <DirectionStepItem key={i} step={step} index={i} times={stepTimes[i]} fare={selected.fare} />
                            ))}
                        </List>
                    </Box>
                </APIProvider>
            ) : (
                <Box sx={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: { xs: 100, md: 0 } }}>
                    <Typography variant="body2" color="text.secondary">Select a route</Typography>
                </Box>
            )}
        </Box>
    );
};

export default RouteOptionsPanel;
