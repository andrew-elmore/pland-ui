import React from 'react';
import { Box, Typography, IconButton, Autocomplete, TextField } from '@mui/material';
import SwapHorizIcon from '@mui/icons-material/SwapHoriz';
import EditIcon from '@mui/icons-material/Edit';

const TimeSelector = ({ value, onChange, onEdit, timeList, label }) => {
    if (value) {
        return (
            <Box sx={{ display: 'flex', alignItems: 'center', mt: 2, gap: 0.5 }}>
                <Typography variant="body2" sx={{ flex: 1 }}>
                    {timeList.find(t => t.id === value)?.displayLabel || ''}
                </Typography>
                <IconButton size="small" onClick={() => onChange(null)}>
                    <SwapHorizIcon fontSize="small" />
                </IconButton>
                <IconButton size="small" onClick={() => onEdit(value)}>
                    <EditIcon fontSize="small" />
                </IconButton>
            </Box>
        );
    }

    return (
        <Autocomplete
            options={timeList}
            getOptionLabel={(option) => option.displayLabel || ''}
            value={null}
            onChange={(_, v) => onChange(v?.id ?? null)}
            isOptionEqualToValue={(a, b) => a.id === b.id}
            renderInput={(params) => (
                <TextField {...params} label={label} size="small" />
            )}
            size="small"
            sx={{ mt: 2 }}
        />
    );
};

export default TimeSelector;
