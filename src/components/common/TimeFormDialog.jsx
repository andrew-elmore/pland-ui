import React, { useState } from 'react';
import {
    Box,
    Typography,
    Button,
    TextField,
    Alert,
    Autocomplete,
    ToggleButtonGroup,
    ToggleButton,
} from '@mui/material';
import SubdirectoryArrowRightIcon from '@mui/icons-material/SubdirectoryArrowRight';
import { hmToSeconds, secondsToHM } from '../../utils/duration';

const buildParentTree = (items) => {
    const ordered = [];
    const depths = new Map();
    const itemIds = new Set(items.map(t => t.id));
    const childrenOf = (parentId) => items.filter(t => t.parentTimeId === parentId);
    const walk = (parentId, depth) => {
        for (const child of childrenOf(parentId)) {
            ordered.push(child);
            depths.set(child.id, depth);
            walk(child.id, depth + 1);
        }
    };
    const roots = items.filter(t => !t.parentTimeId || !itemIds.has(t.parentTimeId));
    for (const root of roots) {
        ordered.push(root);
        depths.set(root.id, 0);
        walk(root.id, 1);
    }
    return { ordered, depths };
};

const toLocalDatetime = (iso) => {
    if (!iso) return '';
    const d = new Date(iso);
    const pad = (n) => String(n).padStart(2, '0');
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
};

const TimeForm = ({
    onClose,
    planId,
    times = [],
    editingTime = null,
    defaultParentTimeId = null,
    onSubmit,
    isSaving = false,
}) => {
    const isEditing = editingTime != null;
    const isEditingRouteDependent = editingTime?.routeId != null;

    const [label, setLabel] = useState(() => editingTime?.label || '');
    const [datetime, setDatetime] = useState(() => editingTime ? toLocalDatetime(editingTime.datetime) : '');
    const [parentTimeId, setParentTimeId] = useState(() => {
        if (editingTime) {
            if (editingTime.routeId || editingTime.parentTimeId) return editingTime.parentTimeId;
            return null;
        }
        return defaultParentTimeId;
    });
    const [offsetSign, setOffsetSign] = useState(() => {
        if (editingTime && !editingTime.routeId && editingTime.parentTimeId) {
            return editingTime.offsetSeconds >= 0 ? 1 : -1;
        }
        return 1;
    });
    const [offsetHours, setOffsetHours] = useState(() => {
        if (editingTime && (editingTime.routeId || editingTime.parentTimeId)) {
            return String(secondsToHM(editingTime.offsetSeconds).hours || '');
        }
        return '';
    });
    const [offsetMinutes, setOffsetMinutes] = useState(() => {
        if (editingTime && (editingTime.routeId || editingTime.parentTimeId)) {
            return String(secondsToHM(editingTime.offsetSeconds).minutes || '');
        }
        return '';
    });

    const handleSave = () => {
        if (isEditingRouteDependent) {
            onSubmit({ label: label.trim(), offsetSeconds: hmToSeconds(offsetHours, offsetMinutes) });
            onClose();
            return;
        }

        const isDependent = parentTimeId != null;
        if (!isDependent && !datetime) return;

        const offsetSeconds = isDependent
            ? offsetSign * hmToSeconds(offsetHours, offsetMinutes)
            : 0;

        const data = {
            planId,
            label: label.trim(),
            parentTimeId: isDependent ? parentTimeId : null,
            offsetSeconds,
        };

        if (!isDependent) {
            data.datetime = new Date(datetime).toISOString();
        }

        onSubmit(data);
        onClose();
    };

    const timeList = [...times];
    const { ordered: parentOptions, depths: parentDepths } = buildParentTree(
        timeList.filter(t => t.id !== editingTime?.id),
    );
    const isDependent = parentTimeId != null;

    const canSave = isEditingRouteDependent
        || (isDependent ? parentTimeId != null : datetime !== '');

    return (
        <>
            <TextField
                autoFocus
                label="Label"
                fullWidth
                size="small"
                value={label}
                onChange={(e) => setLabel(e.target.value)}
                placeholder="e.g. Party Starts"
                sx={{ mt: 1, mb: 1.5 }}
            />

            {!isEditingRouteDependent && (
                <Autocomplete
                    options={parentOptions}
                    getOptionLabel={(option) => option.displayLabel || ''}
                    value={parentOptions.find(t => t.id === parentTimeId) ?? null}
                    onChange={(_, value) => setParentTimeId(value?.id ?? null)}
                    isOptionEqualToValue={(a, b) => a.id === b.id}
                    renderOption={(props, option) => {
                        const depth = parentDepths.get(option.id) || 0;
                        return (
                            <li {...props} key={option.id} style={{ paddingLeft: 16 + depth * 24 }}>
                                {depth > 0 && <SubdirectoryArrowRightIcon sx={{ fontSize: 14, mr: 0.5, color: 'text.disabled' }} />}
                                {option.displayLabel}
                            </li>
                        );
                    }}
                    renderInput={(params) => (
                        <TextField {...params} label="Relative to (optional)" size="small" />
                    )}
                    size="small"
                    sx={{ mb: 1.5 }}
                />
            )}

            {isEditingRouteDependent ? (
                <>
                    <Alert severity="info" sx={{ fontSize: '0.8rem', mb: 1.5 }}>
                        This time is computed from a route. The route duration is set on the step.
                    </Alert>
                    <Box sx={{ display: 'flex', gap: 1, alignItems: 'center', flexWrap: 'wrap' }}>
                        <Typography variant="caption" color="text.secondary" sx={{ whiteSpace: 'nowrap' }}>
                            Buffer
                        </Typography>
                        <TextField
                            label="Hours"
                            type="number"
                            size="small"
                            value={offsetHours}
                            onChange={(e) => setOffsetHours(e.target.value)}
                            slotProps={{ htmlInput: { min: 0 } }}
                            sx={{ width: { xs: 'calc(50% - 16px)', md: 80 } }}
                        />
                        <TextField
                            label="Min"
                            type="number"
                            size="small"
                            value={offsetMinutes}
                            onChange={(e) => setOffsetMinutes(e.target.value)}
                            slotProps={{ htmlInput: { min: 0, max: 59 } }}
                            sx={{ width: { xs: 'calc(50% - 16px)', md: 80 } }}
                        />
                    </Box>
                </>
            ) : isDependent ? (
                <Box sx={{ display: 'flex', gap: 1, alignItems: 'center', flexWrap: 'wrap' }}>
                    <ToggleButtonGroup
                        value={offsetSign}
                        exclusive
                        onChange={(_, v) => { if (v !== null) setOffsetSign(v); }}
                        size="small"
                    >
                        <ToggleButton value={-1} sx={{ textTransform: 'none', fontWeight: 600, px: 1.5 }}>Before</ToggleButton>
                        <ToggleButton value={1} sx={{ textTransform: 'none', fontWeight: 600, px: 1.5 }}>After</ToggleButton>
                    </ToggleButtonGroup>
                    <TextField
                        label="Hours"
                        type="number"
                        size="small"
                        value={offsetHours}
                        onChange={(e) => setOffsetHours(e.target.value)}
                        slotProps={{ htmlInput: { min: 0 } }}
                        sx={{ width: { xs: 'calc(50% - 16px)', md: 80 } }}
                    />
                    <TextField
                        label="Min"
                        type="number"
                        size="small"
                        value={offsetMinutes}
                        onChange={(e) => setOffsetMinutes(e.target.value)}
                        slotProps={{ htmlInput: { min: 0, max: 59 } }}
                        sx={{ width: { xs: 'calc(50% - 16px)', md: 80 } }}
                    />
                </Box>
            ) : (
                <TextField
                    label="Date & Time"
                    type="datetime-local"
                    fullWidth
                    size="small"
                    value={datetime}
                    onChange={(e) => setDatetime(e.target.value)}
                    slotProps={{ inputLabel: { shrink: true } }}
                />
            )}

            <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1, mt: 2 }}>
                <Button variant="outlined" size="small" onClick={onClose} sx={{ borderRadius: '20px', textTransform: 'none' }}>Cancel</Button>
                <Button variant="contained" size="small" onClick={handleSave} disabled={isSaving || !canSave} sx={{ borderRadius: '20px', textTransform: 'none', fontWeight: 600 }}>
                    {isEditing ? 'Save' : 'Create'}
                </Button>
            </Box>
        </>
    );
};

export default TimeForm;
