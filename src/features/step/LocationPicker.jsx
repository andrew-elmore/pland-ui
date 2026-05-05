import React, { useState, useRef, useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { Autocomplete, TextField, Box, IconButton, Button, Typography } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import { actions as locationActions } from '../../store/location';
import LocationMap from '../../components/common/LocationMap';

const LocationPicker = ({ value, onChange, locationList, label, planId }) => {
    const dispatch = useDispatch();
    const [creating, setCreating] = useState(false);
    const [newName, setNewName] = useState('');
    const [searchInput, setSearchInput] = useState('');
    const [searchOptions, setSearchOptions] = useState([]);
    const [selectedPlace, setSelectedPlace] = useState(null);
    const preCreateIds = useRef(null);
    const autocompleteService = useRef(null);
    const placesService = useRef(null);
    const sessionToken = useRef(null);
    const dummyDiv = useRef(null);

    useEffect(() => {
        if (!preCreateIds.current) return;
        const newLocation = locationList.find(l => !preCreateIds.current.has(l.id));
        if (newLocation) {
            onChange(newLocation.id);
            preCreateIds.current = null;
        }
    }, [locationList, onChange]);

    useEffect(() => {
        if (!creating) return;
        if (window.google?.maps?.places) {
            const places = window.google.maps.places;
            autocompleteService.current = new places.AutocompleteService();
            if (!dummyDiv.current) dummyDiv.current = document.createElement('div');
            placesService.current = new places.PlacesService(dummyDiv.current);
            sessionToken.current = new places.AutocompleteSessionToken();
        }
    }, [creating]);

    useEffect(() => {
        if (!autocompleteService.current || searchInput.length < 2) {
            setSearchOptions([]);
            return;
        }
        autocompleteService.current.getPlacePredictions({
            input: searchInput,
            sessionToken: sessionToken.current,
        }, (predictions) => {
            setSearchOptions(predictions || []);
        });
    }, [searchInput]);

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
                if (!newName) setNewName(place.name);
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
        if (!newName.trim()) return;
        preCreateIds.current = new Set(locationList.map(l => l.id));
        dispatch(locationActions.create({
            planId,
            name: newName.trim(),
            ...(selectedPlace || {}),
        }));
        setCreating(false);
        setNewName('');
        setSearchInput('');
        setSearchOptions([]);
        setSelectedPlace(null);
    };

    const handleCancel = () => {
        setCreating(false);
        setNewName('');
        setSearchInput('');
        setSearchOptions([]);
        setSelectedPlace(null);
    };

    if (creating) {
        return (
            <Box sx={{ mt: 2, p: 1.5, border: '1px solid', borderColor: 'divider', borderRadius: 1 }}>
                <TextField
                    autoFocus
                    label="Name"
                    size="small"
                    fullWidth
                    value={newName}
                    onChange={(e) => setNewName(e.target.value)}
                />
                <Autocomplete
                    freeSolo
                    options={searchOptions}
                    getOptionLabel={(option) => typeof option === 'string' ? option : option.description}
                    filterOptions={(x) => x}
                    inputValue={searchInput}
                    onInputChange={(_, v) => setSearchInput(v)}
                    onChange={handlePlaceSelect}
                    noOptionsText={searchInput.length < 2 ? 'Type to search...' : 'No results'}
                    size="small"
                    renderInput={(params) => <TextField {...params} label="Search places" sx={{ mt: 1 }} />}
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
                    <>
                        <Box sx={{ mt: 1, p: 1, borderRadius: 1, backgroundColor: 'action.hover' }}>
                            <Typography variant="caption" color="text.secondary">{selectedPlace.address}</Typography>
                        </Box>
                        <LocationMap latitude={selectedPlace.latitude} longitude={selectedPlace.longitude} height={150} />
                    </>
                )}
                <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1, mt: 1 }}>
                    <Button size="small" onClick={handleCancel} sx={{ textTransform: 'none' }}>Cancel</Button>
                    <Button size="small" variant="contained" onClick={handleCreate} disabled={!newName.trim()} sx={{ textTransform: 'none', fontWeight: 600 }}>Add</Button>
                </Box>
            </Box>
        );
    }

    const selectedLocation = locationList.find(l => l.id === value);

    return (
        <>
            <Box sx={{ display: 'flex', alignItems: 'center', mt: 2, gap: 0.5 }}>
                <Autocomplete
                    options={locationList}
                    getOptionLabel={(option) => option.name || ''}
                    value={selectedLocation ?? null}
                    onChange={(_, v) => onChange(v?.id ?? null)}
                    isOptionEqualToValue={(a, b) => a.id === b.id}
                    renderInput={(params) => <TextField {...params} label={label} size="small" />}
                    size="small"
                    sx={{ flex: 1 }}
                />
                <IconButton size="small" onClick={() => setCreating(true)}>
                    <AddIcon fontSize="small" />
                </IconButton>
            </Box>
            {selectedLocation && (
                <LocationMap latitude={selectedLocation.latitude} longitude={selectedLocation.longitude} height={150} />
            )}
        </>
    );
};

export default LocationPicker;
