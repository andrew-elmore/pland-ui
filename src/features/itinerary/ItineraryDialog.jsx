import React from 'react';
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    TextField,
    Button,
    IconButton,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';

const ItineraryDialog = ({ open, onClose, working, setWorking, onCreate, isMutating }) => (
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

export default ItineraryDialog;
