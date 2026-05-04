import React, { useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import {
    Box,
    Typography,
    Button,
    List,
    ListItem,
    ListItemText,
    IconButton,
    CircularProgress,
    Alert,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import PlaceIcon from '@mui/icons-material/Place';
import { actions as locationActions, selectors as locationSelectors } from '../../store/location';
import LocationDialog from '../../features/location/LocationDialog';

const LocationScreen = () => {
    const { planId } = useParams();
    const dispatch = useDispatch();

    const locations = useSelector(locationSelectors.list);
    const { isLoading, isLoaded } = useSelector(locationSelectors.listMeta);
    const isMutating = useSelector(locationSelectors.isMutating);
    const error = useSelector(locationSelectors.error);

    const [dialogOpen, setDialogOpen] = React.useState(false);

    useEffect(() => {
        if (planId) {
            dispatch(locationActions.list(planId));
        }
    }, [dispatch, planId]);

    const handleCreate = (name, place) => {
        dispatch(locationActions.create({ planId, name, ...place }));
    };

    const handleRemove = (locationId) => {
        dispatch(locationActions.remove(locationId));
    };

    if (isLoading && !isLoaded) {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
                <CircularProgress size={28} />
            </Box>
        );
    }

    return (
        <>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
                <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>Locations</Typography>
                <Button variant="outlined" size="small" startIcon={<AddIcon />} onClick={() => setDialogOpen(true)} sx={{ borderRadius: '20px', textTransform: 'none', fontWeight: 600 }}>
                    Add
                </Button>
            </Box>

            {error && <Alert severity="error" sx={{ mb: 1 }}>{error}</Alert>}

            {isLoaded && locations.length === 0 && (
                <Box sx={{ textAlign: 'center', py: 4 }}>
                    <Typography variant="body2" color="text.secondary">No locations yet.</Typography>
                </Box>
            )}

            {locations.length > 0 && (
                <List disablePadding>
                    {locations.map((loc) => (
                        <ListItem
                            key={loc.id}
                            sx={{ borderBottom: '1px solid', borderColor: 'divider', py: 1, px: 0 }}
                            secondaryAction={
                                <IconButton edge="end" size="small" onClick={() => handleRemove(loc.id)}>
                                    <DeleteIcon fontSize="small" />
                                </IconButton>
                            }
                        >
                            <ListItemText
                                primary={
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                        <PlaceIcon sx={{ fontSize: 16, color: 'text.secondary' }} />
                                        <Typography variant="body2" sx={{ fontWeight: 600 }}>{loc.name}</Typography>
                                    </Box>
                                }
                                secondary={loc.address || null}
                                slotProps={{ secondary: { sx: { fontSize: '0.75rem', ml: 2.5 } } }}
                            />
                        </ListItem>
                    ))}
                </List>
            )}

            <LocationDialog
                open={dialogOpen}
                onClose={() => setDialogOpen(false)}
                onCreate={handleCreate}
                isMutating={isMutating}
            />
        </>
    );
};

export default LocationScreen;
