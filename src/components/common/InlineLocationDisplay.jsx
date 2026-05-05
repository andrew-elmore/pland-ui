import React from 'react';
import { Box, Typography } from '@mui/material';
import LocationMap from './LocationMap';

const InlineLocationDisplay = ({ location, size = 120 }) => {
    if (!location) return null;

    return (
        <Box sx={{ display: 'flex', gap: 2, mt: 1.5 }}>
            {location.latitude != null && location.longitude != null && (
                <Box sx={{ width: size, height: size, flexShrink: 0 }}>
                    <LocationMap latitude={location.latitude} longitude={location.longitude} height={size} zoomControl={false} />
                </Box>
            )}
            <Box sx={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', minWidth: 0 }}>
                {location.name && (
                    <Typography variant="body2" sx={{ fontWeight: 500 }}>
                        {location.name}
                    </Typography>
                )}
                {location.address && (
                    <Typography variant="caption" color="text.secondary">
                        {location.address}
                    </Typography>
                )}
            </Box>
        </Box>
    );
};

export default InlineLocationDisplay;
