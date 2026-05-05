import React, { useRef, useEffect } from 'react';
import { Box } from '@mui/material';

const LocationMap = ({ latitude, longitude, height = 200, zoomControl = true }) => {
    const mapRef = useRef(null);
    const mapInstance = useRef(null);
    const marker = useRef(null);
    const mountedNode = useRef(null);

    useEffect(() => {
        if (!mapRef.current || !window.google?.maps) return;
        if (latitude == null || longitude == null) return;

        const center = { lat: latitude, lng: longitude };

        if (!mapInstance.current || mountedNode.current !== mapRef.current) {
            mapInstance.current = new window.google.maps.Map(mapRef.current, {
                center,
                zoom: 15,
                disableDefaultUI: true,
                zoomControl,
                gestureHandling: 'cooperative',
            });
            marker.current = new window.google.maps.Marker({
                position: center,
                map: mapInstance.current,
            });
            mountedNode.current = mapRef.current;
        } else {
            mapInstance.current.setCenter(center);
            marker.current.setPosition(center);
        }
    }, [latitude, longitude, zoomControl]);

    useEffect(() => {
        return () => {
            mapInstance.current = null;
            marker.current = null;
            mountedNode.current = null;
        };
    }, []);

    if (latitude == null || longitude == null) return null;

    return (
        <Box
            ref={mapRef}
            sx={{
                width: '100%',
                height,
                borderRadius: 1,
                overflow: 'hidden',
                mt: 1.5,
            }}
        />
    );
};

export default LocationMap;
