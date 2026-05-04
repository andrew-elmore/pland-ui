import { useEffect } from 'react';
import { useMap } from '@vis.gl/react-google-maps';

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

export default FitBounds;
