import React from 'react';
import { TextField } from '@mui/material';

const ItineraryForm = ({ working, setWorking }) => (
    <TextField
        autoFocus
        label="Itinerary Name"
        fullWidth
        value={working.name}
        onChange={(e) => setWorking(working.clone().set('name', e.target.value))}
        size="small"
        sx={{ mt: 1 }}
    />
);

export default ItineraryForm;
