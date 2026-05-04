import React from 'react';
import {
    Box,
    Typography,
    Button,
    TextField,
    ToggleButtonGroup,
    ToggleButton,
    Chip,
    CircularProgress,
} from '@mui/material';
import Route from '../../domain/Route';
import TimeSelector from './TimeSelector';
import LocationPicker from './LocationPicker';
import RouteOptionsPanel from '../route/RouteOptionsPanel';

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
    previewLoading, onPreview,
    onRemoveDestination,
    locationList, timeList, onEditTime,
    planId, departureTime,
}) => (
    <>
        {showOrigin && (
            <LocationPicker
                value={originLocationId}
                onChange={onOriginChange}
                locationList={locationList}
                label="Origin"
                planId={planId}
            />
        )}

        <LocationPicker
            value={destinationLocationId}
            onChange={onDestinationChange}
            locationList={locationList}
            label="Destination"
            planId={planId}
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
            planId={planId}
        />

        <Box sx={{ display: 'flex', gap: 1, mt: 2, alignItems: 'center' }}>
            <Typography variant="caption" color="text.secondary" sx={{ whiteSpace: 'nowrap' }}>Padding</Typography>
            <TextField label="Hours" type="number" size="small" value={paddingHours} onChange={(e) => onPaddingHoursChange(e.target.value)} slotProps={{ htmlInput: { min: 0 } }} sx={{ width: 80 }} />
            <TextField label="Min" type="number" size="small" value={paddingMinutes} onChange={(e) => onPaddingMinutesChange(e.target.value)} slotProps={{ htmlInput: { min: 0, max: 59 } }} sx={{ width: 80 }} />
        </Box>

        {originLocationId && destinationLocationId && routeTimeId && (
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
            <Box sx={{ mt: 2 }}>
                <RouteOptionsPanel
                    options={routeOptions}
                    selectedIdx={selectedRouteIdx}
                    onSelect={onRouteSelect}
                    departureTime={departureTime}
                />
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
