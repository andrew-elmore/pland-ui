import React from 'react';
import {
    Box,
    Typography,
    Button,
    Autocomplete,
    TextField,
    ToggleButtonGroup,
    ToggleButton,
    Chip,
    CircularProgress,
} from '@mui/material';
import Route from '../../domain/Route';
import TimeSelector from './TimeSelector';

const RouteForm = ({
    originLocationId, onOriginChange, showOrigin,
    destinationLocationId, onDestinationChange,
    travelMode, onTravelModeChange,
    transitModes, onTransitModesChange,
    timeMode, onTimeModeChange,
    routeTimeId, onRouteTimeChange,
    paddingHours, onPaddingHoursChange,
    paddingMinutes, onPaddingMinutesChange,
    routeOptions, selectedRouteIdx, onRouteSelect,
    previewLoading, onPreview, showPreview,
    onRemoveDestination,
    locationList, timeList, onEditTime,
}) => (
    <>
        {showOrigin && (
            <Autocomplete
                options={locationList}
                getOptionLabel={(option) => option.name || ''}
                value={locationList.find(l => l.id === originLocationId) ?? null}
                onChange={(_, value) => onOriginChange(value?.id ?? null)}
                isOptionEqualToValue={(a, b) => a.id === b.id}
                renderInput={(params) => <TextField {...params} label="Origin" size="small" />}
                size="small"
                sx={{ mt: 2 }}
            />
        )}

        <Autocomplete
            options={locationList}
            getOptionLabel={(option) => option.name || ''}
            value={locationList.find(l => l.id === destinationLocationId) ?? null}
            onChange={(_, value) => onDestinationChange(value?.id ?? null)}
            isOptionEqualToValue={(a, b) => a.id === b.id}
            renderInput={(params) => <TextField {...params} label="Destination" size="small" />}
            size="small"
            sx={{ mt: 2 }}
        />

        <Box sx={{ mt: 2 }}>
            <Typography variant="caption" color="text.secondary" sx={{ mb: 0.5, display: 'block' }}>
                Travel Mode
            </Typography>
            <ToggleButtonGroup
                value={travelMode}
                exclusive
                onChange={(_, value) => { if (value) onTravelModeChange(value); }}
                size="small"
                fullWidth
            >
                {Route.TRAVEL_MODES.map((mode) => (
                    <ToggleButton key={mode} value={mode} sx={{ textTransform: 'none', fontWeight: 600 }}>
                        {Route.TRAVEL_MODE_LABELS[mode]}
                    </ToggleButton>
                ))}
            </ToggleButtonGroup>
        </Box>

        {travelMode === Route.TRAVEL_MODE_TRANSIT && (
            <Box sx={{ display: 'flex', gap: 0.5, mt: 1.5, flexWrap: 'wrap' }}>
                {Route.TRANSIT_MODES.map((mode) => (
                    <Chip
                        key={mode}
                        label={Route.TRANSIT_MODE_LABELS[mode]}
                        size="small"
                        variant={transitModes.includes(mode) ? 'filled' : 'outlined'}
                        color={transitModes.includes(mode) ? 'primary' : 'default'}
                        onClick={() => onTransitModesChange(
                            transitModes.includes(mode) ? transitModes.filter((m) => m !== mode) : [...transitModes, mode],
                        )}
                        sx={{ cursor: 'pointer' }}
                    />
                ))}
            </Box>
        )}

        <Box sx={{ mt: 2 }}>
            <Typography variant="caption" color="text.secondary" sx={{ mb: 0.5, display: 'block' }}>
                Time Mode
            </Typography>
            <ToggleButtonGroup
                value={timeMode}
                exclusive
                onChange={(_, value) => { if (value) onTimeModeChange(value); }}
                size="small"
                fullWidth
            >
                <ToggleButton value="depart_at" sx={{ textTransform: 'none', fontWeight: 600 }}>Leave At</ToggleButton>
                <ToggleButton value="arrive_by" sx={{ textTransform: 'none', fontWeight: 600 }}>Arrive By</ToggleButton>
            </ToggleButtonGroup>
        </Box>

        <TimeSelector
            value={routeTimeId}
            onChange={onRouteTimeChange}
            onEdit={onEditTime}
            timeList={timeList}
            label={timeMode === 'depart_at' ? 'Departure Time' : 'Arrival Time'}
        />

        <Box sx={{ display: 'flex', gap: 1, mt: 2, alignItems: 'center' }}>
            <Typography variant="caption" color="text.secondary" sx={{ whiteSpace: 'nowrap' }}>Padding</Typography>
            <TextField label="Hours" type="number" size="small" value={paddingHours} onChange={(e) => onPaddingHoursChange(e.target.value)} slotProps={{ htmlInput: { min: 0 } }} sx={{ width: 80 }} />
            <TextField label="Min" type="number" size="small" value={paddingMinutes} onChange={(e) => onPaddingMinutesChange(e.target.value)} slotProps={{ htmlInput: { min: 0, max: 59 } }} sx={{ width: 80 }} />
        </Box>

        {showPreview && originLocationId && destinationLocationId && routeTimeId && (
            <Button
                variant="outlined"
                size="small"
                onClick={onPreview}
                disabled={previewLoading}
                startIcon={previewLoading ? <CircularProgress size={16} /> : null}
                sx={{ mt: 2, borderRadius: '20px', textTransform: 'none', fontWeight: 600 }}
                fullWidth
            >
                {previewLoading ? 'Loading...' : routeOptions.length > 0 ? 'Refresh Routes' : 'Preview Routes'}
            </Button>
        )}

        {routeOptions.length > 0 && (
            <Box sx={{ mt: 2, display: 'flex', flexDirection: 'column', gap: 1 }}>
                {routeOptions.map((option, idx) => (
                    <Box
                        key={idx}
                        onClick={() => onRouteSelect(idx)}
                        sx={{
                            p: 1.5,
                            border: '2px solid',
                            borderColor: selectedRouteIdx === idx ? 'primary.main' : 'divider',
                            borderRadius: '8px',
                            cursor: 'pointer',
                            backgroundColor: selectedRouteIdx === idx ? 'action.selected' : 'transparent',
                            '&:hover': { backgroundColor: selectedRouteIdx === idx ? 'action.selected' : 'action.hover' },
                        }}
                    >
                        <Typography variant="body2" sx={{ fontWeight: 600 }}>
                            {option.summary || `Route ${idx + 1}`}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                            {Math.round(option.durationSeconds / 60)} min · {(option.distanceMeters / 1000).toFixed(1)} km
                        </Typography>
                    </Box>
                ))}
            </Box>
        )}

        <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 1 }}>
            <Button size="small" color="error" onClick={onRemoveDestination} sx={{ textTransform: 'none', fontSize: '0.75rem' }}>
                Remove Destination
            </Button>
        </Box>
    </>
);

export default RouteForm;
