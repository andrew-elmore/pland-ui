import React, { useState, useRef, useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { Box, Typography, IconButton, Autocomplete, TextField, Button } from '@mui/material';
import SwapHorizIcon from '@mui/icons-material/SwapHoriz';
import EditIcon from '@mui/icons-material/Edit';
import AddIcon from '@mui/icons-material/Add';
import { actions as timeActions } from '../../store/time';

const TimeSelector = ({ value, onChange, onEdit, timeList, label, planId }) => {
    const dispatch = useDispatch();
    const [creating, setCreating] = useState(false);
    const [newLabel, setNewLabel] = useState('');
    const [newDatetime, setNewDatetime] = useState('');
    const preCreateIds = useRef(null);

    useEffect(() => {
        if (!preCreateIds.current) return;
        const newTime = timeList.find(t => !preCreateIds.current.has(t.id));
        if (newTime) {
            onChange(newTime.id);
            preCreateIds.current = null;
        }
    }, [timeList, onChange]);

    const handleCreate = () => {
        if (!newDatetime) return;
        preCreateIds.current = new Set(timeList.map(t => t.id));
        dispatch(timeActions.create({
            planId,
            label: newLabel.trim(),
            datetime: new Date(newDatetime).toISOString(),
        }));
        setCreating(false);
        setNewLabel('');
        setNewDatetime('');
    };

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

    if (creating) {
        return (
            <Box sx={{ mt: 2, p: 1.5, border: '1px solid', borderColor: 'divider', borderRadius: 1 }}>
                <TextField
                    autoFocus
                    label="Label"
                    size="small"
                    fullWidth
                    value={newLabel}
                    onChange={(e) => setNewLabel(e.target.value)}
                    placeholder="e.g. Party Starts"
                />
                <TextField
                    label="Date & Time"
                    type="datetime-local"
                    size="small"
                    fullWidth
                    value={newDatetime}
                    onChange={(e) => setNewDatetime(e.target.value)}
                    slotProps={{ inputLabel: { shrink: true } }}
                    sx={{ mt: 1 }}
                />
                <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1, mt: 1 }}>
                    <Button size="small" onClick={() => { setCreating(false); setNewLabel(''); setNewDatetime(''); }} sx={{ textTransform: 'none' }}>
                        Cancel
                    </Button>
                    <Button size="small" variant="contained" onClick={handleCreate} disabled={!newDatetime} sx={{ textTransform: 'none', fontWeight: 600 }}>
                        Add
                    </Button>
                </Box>
            </Box>
        );
    }

    return (
        <Box sx={{ display: 'flex', alignItems: 'center', mt: 2, gap: 0.5 }}>
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
                sx={{ flex: 1 }}
            />
            <IconButton size="small" onClick={() => setCreating(true)}>
                <AddIcon fontSize="small" />
            </IconButton>
        </Box>
    );
};

export default TimeSelector;
