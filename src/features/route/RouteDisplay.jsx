import React, { useEffect, useMemo } from 'react';
import {
    Box,
    Typography,
    List,
    ListItem,
    ListItemText,
    Chip,
} from '@mui/material';
import { APIProvider, Map, Polyline, Marker, useMap } from '@vis.gl/react-google-maps';
import Route from '../../domain/Route';

const GOOGLE_MAPS_API_KEY = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;

const formatTime = (date) => {
    if (!date) return '';
    return new Date(date).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
};

const FitBounds = ({ route }) => {
    const map = useMap();

    useEffect(() => {
        if (!map) return;
        const steps = [...route.steps];
        if (!steps.length) return;
        const bounds = new window.google.maps.LatLngBounds();
        steps.forEach((step) => {
            bounds.extend({ lat: step.startLat, lng: step.startLng });
            bounds.extend({ lat: step.endLat, lng: step.endLng });
        });
        map.fitBounds(bounds, 40);
    }, [map, route.id]);

    return null;
};

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

    return (
        <APIProvider apiKey={GOOGLE_MAPS_API_KEY}>
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
                <Box sx={{ mb: 2, display: 'flex', gap: 2 }}>
                    <Typography variant="body2" color="text.secondary">
                        Depart {formatTime(route.departureTime)}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                        Arrive {formatTime(route.arrivalTime)}
                    </Typography>
                </Box>
            )}

            {first && (
                <Box sx={{ height: 350, width: '100%', borderRadius: 1, overflow: 'hidden', mb: 2 }}>
                    <Map
                        defaultCenter={center}
                        defaultZoom={10}
                        gestureHandling="cooperative"
                        disableDefaultUI
                        style={{ width: '100%', height: '100%' }}
                    >
                        <FitBounds route={route} />
                        {route.overviewPolyline && (
                            <Polyline
                                encodedPath={route.overviewPolyline}
                                strokeColor="#1976d2"
                                strokeOpacity={0.8}
                                strokeWeight={4}
                            />
                        )}
                        <Marker position={{ lat: first.startLat, lng: first.startLng }} />
                        <Marker position={{ lat: last.endLat, lng: last.endLng }} />
                    </Map>
                </Box>
            )}

            {steps.length > 0 && (
                <>
                    <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1 }}>Directions</Typography>
                    <List disablePadding>
                        {steps.map((step, i) => {
                            const times = stepTimes[i];
                            return (
                                <ListItem key={i} sx={{ py: 0.75, px: 0, alignItems: 'flex-start', borderBottom: '1px solid', borderColor: 'divider' }}>
                                    <Box sx={{ minWidth: 28, pt: 0.25 }}>
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
                </>
            )}
        </APIProvider>
    );
};

export default RouteDisplay;
