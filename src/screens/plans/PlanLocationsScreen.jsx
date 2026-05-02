import React, { useEffect, useState, useRef } from 'react';
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
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    TextField,
    Autocomplete,
    CircularProgress,
    Alert,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import CloseIcon from '@mui/icons-material/Close';
import DeleteIcon from '@mui/icons-material/Delete';
import PlaceIcon from '@mui/icons-material/Place';
import { actions as locationActions, selectors as locationSelectors } from '../../store/location';

const PlanLocationsScreen = () => {
    const { planId } = useParams();
    const dispatch = useDispatch();

    const locations = useSelector(locationSelectors.list);
    const { isLoading, isLoaded } = useSelector(locationSelectors.listMeta);
    const isMutating = useSelector(locationSelectors.isMutating);
    const error = useSelector(locationSelectors.error);

    const [dialogOpen, setDialogOpen] = useState(false);
    const [locationName, setLocationName] = useState('');
    const [inputValue, setInputValue] = useState('');
    const [options, setOptions] = useState([]);
    const [selectedPlace, setSelectedPlace] = useState(null);
    const [placesLoaded, setPlacesLoaded] = useState(false);

    const autocompleteService = useRef(null);
    const placesService = useRef(null);
    const sessionToken = useRef(null);
    const dummyDiv = useRef(null);

    useEffect(() => {
        if (planId) {
            dispatch(locationActions.list(planId));
        }
    }, [dispatch, planId]);

    useEffect(() => {
        if (window.google?.maps?.places) {
            const places = window.google.maps.places;
            autocompleteService.current = new places.AutocompleteService();
            if (!dummyDiv.current) dummyDiv.current = document.createElement('div');
            placesService.current = new places.PlacesService(dummyDiv.current);
            sessionToken.current = new places.AutocompleteSessionToken();
            setPlacesLoaded(true);
            return;
        }

        const existing = document.querySelector('script[src*="maps.googleapis.com"]');
        if (existing) return;

        const script = document.createElement('script');
        script.src = `https://maps.googleapis.com/maps/api/js?key=${import.meta.env.VITE_GOOGLE_MAPS_API_KEY}&libraries=places`;
        script.async = true;
        script.onload = () => {
            const places = window.google.maps.places;
            autocompleteService.current = new places.AutocompleteService();
            if (!dummyDiv.current) dummyDiv.current = document.createElement('div');
            placesService.current = new places.PlacesService(dummyDiv.current);
            sessionToken.current = new places.AutocompleteSessionToken();
            setPlacesLoaded(true);
        };
        document.head.appendChild(script);
    }, []);

    useEffect(() => {
        if (!autocompleteService.current || inputValue.length < 2) {
            setOptions([]);
            return;
        }

        const request = {
            input: inputValue,
            sessionToken: sessionToken.current,
        };

        autocompleteService.current.getPlacePredictions(request, (predictions) => {
            setOptions(predictions || []);
        });
    }, [inputValue]);

    const handleOpenDialog = () => {
        setLocationName('');
        setSelectedPlace(null);
        setInputValue('');
        setOptions([]);
        setDialogOpen(true);
    };

    const handleCloseDialog = () => {
        setDialogOpen(false);
        setLocationName('');
        setSelectedPlace(null);
        setInputValue('');
        setOptions([]);
    };

    const handlePlaceSelect = (_, prediction) => {
        if (!prediction || !placesService.current) {
            setSelectedPlace(null);
            return;
        }

        placesService.current.getDetails(
            {
                placeId: prediction.place_id,
                fields: ['name', 'formatted_address', 'geometry', 'place_id'],
                sessionToken: sessionToken.current,
            },
            (place) => {
                if (!place) return;
                if (!locationName) setLocationName(place.name);
                setSelectedPlace({
                    address: place.formatted_address,
                    googlePlaceId: place.place_id,
                    latitude: place.geometry?.location?.lat() ?? null,
                    longitude: place.geometry?.location?.lng() ?? null,
                });
                if (window.google?.maps?.places) {
                    sessionToken.current = new window.google.maps.places.AutocompleteSessionToken();
                }
            },
        );
    };

    const handleCreate = () => {
        if (!locationName.trim()) return;
        dispatch(locationActions.create({ planId, name: locationName.trim(), ...selectedPlace }));
        handleCloseDialog();
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
                <Button variant="outlined" size="small" startIcon={<AddIcon />} onClick={handleOpenDialog} sx={{ borderRadius: '20px', textTransform: 'none', fontWeight: 600 }}>
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

            <Dialog open={dialogOpen} onClose={handleCloseDialog} maxWidth="sm" fullWidth disableRestoreFocus>
                <DialogTitle sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', pb: 1 }}>
                    Add Location
                    <IconButton onClick={handleCloseDialog} edge="end" size="small">
                        <CloseIcon fontSize="small" />
                    </IconButton>
                </DialogTitle>
                <DialogContent sx={{ pt: 1 }}>
                    <TextField
                        label="Name"
                        value={locationName}
                        onChange={(e) => setLocationName(e.target.value)}
                        size="small"
                        fullWidth
                        autoFocus
                        sx={{ mt: 1 }}
                    />
                    <Autocomplete
                        freeSolo
                        options={options}
                        getOptionLabel={(option) =>
                            typeof option === 'string' ? option : option.description
                        }
                        filterOptions={(x) => x}
                        inputValue={inputValue}
                        onInputChange={(_, value) => setInputValue(value)}
                        onChange={handlePlaceSelect}
                        noOptionsText={inputValue.length < 2 ? 'Type to search...' : 'No results'}
                        size="small"
                        renderInput={(params) => (
                            <TextField
                                {...params}
                                label="Search places"
                                sx={{ mt: 1.5 }}
                            />
                        )}
                        renderOption={(props, option) => (
                            <li {...props} key={option.place_id}>
                                <Box>
                                    <Typography variant="body2">{option.structured_formatting?.main_text}</Typography>
                                    <Typography variant="caption" color="text.secondary">{option.structured_formatting?.secondary_text}</Typography>
                                </Box>
                            </li>
                        )}
                    />
                    {selectedPlace && (
                        <Box sx={{ mt: 2, p: 1.5, borderRadius: 1, backgroundColor: 'action.hover' }}>
                            <Typography variant="caption" color="text.secondary">{selectedPlace.address}</Typography>
                        </Box>
                    )}
                </DialogContent>
                <DialogActions sx={{ px: 2, pb: 1.5 }}>
                    <Button variant="outlined" size="small" onClick={handleCloseDialog} sx={{ borderRadius: '20px', textTransform: 'none' }}>Cancel</Button>
                    <Button variant="contained" size="small" onClick={handleCreate} disabled={isMutating || !locationName.trim()} sx={{ borderRadius: '20px', textTransform: 'none', fontWeight: 600 }}>Add</Button>
                </DialogActions>
            </Dialog>
        </>
    );
};

export default PlanLocationsScreen;
