import React from 'react';
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    TextField,
    Button,
    IconButton,
    Autocomplete,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import Participant from '../../domain/Participant';

const ROLE_OPTIONS = Participant.ROLES.map((role) => ({
    value: role,
    label: Participant.ROLE_LABELS[role],
}));

const ParticipantDialog = ({ open, onClose, working, onChange, onCreate, isMutating }) => {
    const selectedRoleOption = ROLE_OPTIONS.find((o) => o.value === working.role) || null;

    return (
        <Dialog open={open} onClose={onClose} maxWidth="xs" fullWidth disableRestoreFocus>
            <DialogTitle sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', pb: 1 }}>
                Add Participant
                <IconButton onClick={onClose} edge="end" size="small">
                    <CloseIcon fontSize="small" />
                </IconButton>
            </DialogTitle>
            <DialogContent sx={{ pt: 1 }}>
                <TextField autoFocus label="First Name" fullWidth size="small" value={working.firstName} onChange={(e) => onChange('firstName', e.target.value)} sx={{ mt: 1, mb: 1.5 }} />
                <TextField label="Last Name" fullWidth size="small" value={working.lastName} onChange={(e) => onChange('lastName', e.target.value)} sx={{ mb: 1.5 }} />
                <TextField label="Email" fullWidth size="small" type="email" value={working.email} onChange={(e) => onChange('email', e.target.value)} sx={{ mb: 1.5 }} />
                <Autocomplete
                    options={ROLE_OPTIONS}
                    getOptionLabel={(option) => option.label}
                    value={selectedRoleOption}
                    onChange={(_, option) => onChange('role', option?.value ?? Participant.ROLE_ATTENDEE)}
                    isOptionEqualToValue={(option, val) => option.value === val.value}
                    disableClearable
                    size="small"
                    renderInput={(params) => <TextField {...params} label="Role" />}
                />
            </DialogContent>
            <DialogActions sx={{ px: 2, pb: 1.5 }}>
                <Button variant="outlined" size="small" onClick={onClose} sx={{ borderRadius: '20px', textTransform: 'none' }}>Cancel</Button>
                <Button variant="contained" size="small" onClick={onCreate} disabled={isMutating || !working.isSavable()} sx={{ borderRadius: '20px', textTransform: 'none', fontWeight: 600 }}>Add</Button>
            </DialogActions>
        </Dialog>
    );
};

export default ParticipantDialog;
