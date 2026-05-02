import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import {
    Box,
    Tabs,
    Tab,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    TextField,
    Button,
    IconButton,
    Typography,
    CircularProgress,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import CloseIcon from '@mui/icons-material/Close';
import { actions as itineraryActions, selectors as itinerarySelectors } from '../../store/itinerary';
import Itinerary from '../../domain/Itinerary';

const PlanItinerariesScreen = () => {
    const { planId } = useParams();
    const dispatch = useDispatch();

    const itineraries = useSelector(itinerarySelectors.list);
    const { isLoading, isLoaded } = useSelector(itinerarySelectors.listMeta);
    const isMutating = useSelector(itinerarySelectors.isMutating);

    const [selectedTab, setSelectedTab] = useState(0);
    const [dialogOpen, setDialogOpen] = useState(false);
    const [working, setWorking] = useState(() => new Itinerary());

    useEffect(() => {
        if (planId) {
            dispatch(itineraryActions.list(planId));
        }
    }, [dispatch, planId]);

    const handleTabChange = (_, newValue) => {
        if (newValue === itineraries.length) {
            handleOpenDialog();
            return;
        }
        setSelectedTab(newValue);
    };

    const handleOpenDialog = () => {
        setWorking(new Itinerary());
        setDialogOpen(true);
    };

    const handleCloseDialog = () => {
        setDialogOpen(false);
        setWorking(new Itinerary());
    };

    const handleCreate = () => {
        dispatch(itineraryActions.create({ name: working.name, planId }));
        setDialogOpen(false);
        setWorking(new Itinerary());
        setSelectedTab(itineraries.length);
    };

    if (isLoading && !isLoaded) {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
                <CircularProgress size={28} />
            </Box>
        );
    }

    if (isLoaded && itineraries.length === 0) {
        return (
            <>
                <Box sx={{ textAlign: 'center', py: 4 }}>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>No itineraries yet.</Typography>
                    <Button variant="outlined" size="small" startIcon={<AddIcon />} onClick={handleOpenDialog} sx={{ borderRadius: '20px', textTransform: 'none', fontWeight: 600 }}>
                        Create itinerary
                    </Button>
                </Box>
                <CreateDialog open={dialogOpen} onClose={handleCloseDialog} working={working} setWorking={setWorking} onCreate={handleCreate} isMutating={isMutating} />
            </>
        );
    }

    return (
        <>
            <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
                <Tabs value={selectedTab < itineraries.length ? selectedTab : false} onChange={handleTabChange} variant="scrollable" scrollButtons="auto">
                    {itineraries.map((itinerary) => (
                        <Tab key={itinerary.id} label={itinerary.name} />
                    ))}
                    <Tab icon={<AddIcon fontSize="small" />} sx={{ minWidth: 48 }} />
                </Tabs>
            </Box>
            <CreateDialog open={dialogOpen} onClose={handleCloseDialog} working={working} setWorking={setWorking} onCreate={handleCreate} isMutating={isMutating} />
        </>
    );
};

const CreateDialog = ({ open, onClose, working, setWorking, onCreate, isMutating }) => (
    <Dialog open={open} onClose={onClose} maxWidth="xs" fullWidth disableRestoreFocus>
        <DialogTitle sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', pb: 1 }}>
            New Itinerary
            <IconButton onClick={onClose} edge="end" size="small">
                <CloseIcon fontSize="small" />
            </IconButton>
        </DialogTitle>
        <DialogContent sx={{ pt: 1 }}>
            <TextField
                autoFocus
                label="Itinerary Name"
                fullWidth
                value={working.name}
                onChange={(e) => setWorking(working.clone().set('name', e.target.value))}
                size="small"
                sx={{ mt: 1 }}
            />
        </DialogContent>
        <DialogActions sx={{ px: 2, pb: 1.5 }}>
            <Button variant="outlined" size="small" onClick={onClose} sx={{ borderRadius: '20px', textTransform: 'none' }}>Cancel</Button>
            <Button variant="contained" size="small" onClick={onCreate} disabled={isMutating || !working.isSavable()} sx={{ borderRadius: '20px', textTransform: 'none', fontWeight: 600 }}>Create</Button>
        </DialogActions>
    </Dialog>
);

export default PlanItinerariesScreen;
