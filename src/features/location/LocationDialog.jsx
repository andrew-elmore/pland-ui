import React, { useEffect, useState, useRef } from 'react';
import {
    TextField,
    Button,
    Autocomplete,
    Box,
    Typography,
} from '@mui/material';
import LocationMap from '../../components/common/LocationMap';

const LocationForm = ({ onClose, onCreate, isMutating }) => {
    const [locationName, setLocationName] = useState('');
    const [inputValue, setInputValue] = useState('');
    const [options, setOptions] = useState([]);
    const [selectedPlace, setSelectedPlace] = useState(null);

    const autocompleteService = useRef(null);
    const placesService = useRef(null);
    const sessionToken = useRef(null);
    const dummyDiv = useRef(null);

    useEffect(() => {
        if (window.google?.maps?.places) {
            const places = window.google.maps.places;
            autocompleteService.current = new places.AutocompleteService();
            if (!dummyDiv.current) dummyDiv.current = document.createElement('div');
            placesService.current = new places.PlacesService(dummyDiv.current);
            sessionToken.current = new places.AutocompleteSessionToken();
        }
    }, []);

    useEffect(() => {
        if (!autocompleteService.current || inputValue.length < 2) {
            setOptions([]);
            return;
        }

        autocompleteService.current.getPlacePredictions({
            input: inputValue,
            sessionToken: sessionToken.current,
        }, (predictions) => {
            setOptions(predictions || []);
        });
    }, [inputValue]);

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
        onCreate(locationName.trim(), selectedPlace);
        onClose();
    };

    return (
        <>
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
                <>
                    <Box sx={{ mt: 2, p: 1.5, borderRadius: 1, backgroundColor: 'action.hover' }}>
                        <Typography variant="caption" color="text.secondary">{selectedPlace.address}</Typography>
                    </Box>
                    <LocationMap latitude={selectedPlace.latitude} longitude={selectedPlace.longitude} />
                </>
            )}
            <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1, mt: 2 }}>
                <Button variant="outlined" size="small" onClick={onClose} sx={{ borderRadius: '20px', textTransform: 'none' }}>Cancel</Button>
                <Button variant="contained" size="small" onClick={handleCreate} disabled={isMutating || !locationName.trim()} sx={{ borderRadius: '20px', textTransform: 'none', fontWeight: 600 }}>Add</Button>
            </Box>
        </>
    );
};

export default LocationForm;
