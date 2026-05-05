import React, { useMemo } from 'react';
import {
    Box,
    Typography,
    Chip,
    List,
} from '@mui/material';
import { APIProvider, Map, Polyline, Marker } from '@vis.gl/react-google-maps';
import Route from '../../domain/Route';
import FitBounds from './FitBounds';
import formatTime from '../../utils/formatTime';
import DirectionStepItem from './DirectionStepItem';
import { getStepColor } from './routeColors';

const GOOGLE_MAPS_API_KEY = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;

const RouteDisplay = ({ route }) => {
    const steps = useMemo(() => [...route.steps], [route]);
    const first = steps[0];
    const last = steps[steps.length - 1];

    const stepTimes = useMemo(() => {
        if (!route.departureTime || !steps.length) return [];
        let currentTime = new Date(route.departureTime).getTime();
        return steps.map((step) => {
            const startTime = new Date(currentTime);
            currentTime += step.durationSeconds * 1000;
            return { startTime, endTime: new Date(currentTime) };
        });
    }, [route.departureTime, steps]);

    const center = first
        ? { lat: (first.startLat + last.endLat) / 2, lng: (first.startLng + last.endLng) / 2 }
        : { lat: 0, lng: 0 };

    return first ? (
        <APIProvider apiKey={GOOGLE_MAPS_API_KEY}>
            <Box sx={{ display: 'flex', border: '1px solid', borderColor: 'divider', borderRadius: '8px', overflow: 'hidden', height: 450 }}>
                <Box sx={{ width: '40%', flexShrink: 0, borderRight: '1px solid', borderColor: 'divider' }}>
                    <Map
                        defaultCenter={center}
                        defaultZoom={10}
                        gestureHandling="cooperative"
                        disableDefaultUI
                        zoomControl
                        style={{ width: '100%', height: '100%' }}
                    >
                        <FitBounds route={route} />
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

                <Box sx={{ flex: 1, p: 1.5, overflow: 'auto' }}>
                    <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', mb: 1 }}>
                        <Chip label={Route.TRAVEL_MODE_LABELS[route.travelMode]} size="small" variant="outlined" sx={{ height: 20, fontSize: '0.7rem' }} />
                        <Chip label={`${route.durationMinutes} min`} size="small" variant="outlined" sx={{ height: 20, fontSize: '0.7rem' }} />
                        {route.distanceDisplay && (
                            <Chip label={route.distanceDisplay} size="small" variant="outlined" sx={{ height: 20, fontSize: '0.7rem' }} />
                        )}
                        <Chip label={Route.TIME_MODE_LABELS[route.timeMode]} size="small" variant="outlined" sx={{ height: 20, fontSize: '0.7rem' }} />
                        {route.transitModes?.length > 0 && route.transitModes.map((tm) => (
                            <Chip key={tm} label={Route.TRANSIT_MODE_LABELS[tm]} size="small" variant="outlined" color="primary" sx={{ height: 20, fontSize: '0.7rem' }} />
                        ))}
                    </Box>
                    {route.departureTime && route.arrivalTime && (
                        <Box sx={{ mb: 1, display: 'flex', gap: 2 }}>
                            <Typography variant="body2" color="text.secondary">
                                Depart {formatTime(route.departureTime)}
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                                Arrive {formatTime(route.arrivalTime)}
                            </Typography>
                        </Box>
                    )}
                    <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 0.5 }}>Directions</Typography>
                    <List disablePadding dense>
                        {steps.map((step, i) => (
                            <DirectionStepItem key={i} step={step} index={i} times={stepTimes[i]} fare={route.fare} />
                        ))}
                    </List>
                </Box>
            </Box>
        </APIProvider>
    ) : null;
};

export default RouteDisplay;
