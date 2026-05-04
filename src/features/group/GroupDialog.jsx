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
    Checkbox,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';

const GroupDialog = ({ open, onClose, working, onChange, onSave, editingGroup, isMutating, participants }) => {
    const participantList = [...participants];
    const selectedParticipants = participantList.filter(p => working.participantIds.includes(p.id));

    return (
        <Dialog open={open} onClose={onClose} maxWidth="xs" fullWidth disableRestoreFocus>
            <DialogTitle sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', pb: 1 }}>
                {editingGroup ? 'Edit Group' : 'Add Group'}
                <IconButton onClick={onClose} edge="end" size="small">
                    <CloseIcon fontSize="small" />
                </IconButton>
            </DialogTitle>
            <DialogContent sx={{ pt: 1 }}>
                <TextField
                    autoFocus
                    label="Group Name"
                    fullWidth
                    size="small"
                    value={working.name}
                    onChange={(e) => onChange('name', e.target.value)}
                    sx={{ mt: 1, mb: 1.5 }}
                />
                <Autocomplete
                    multiple
                    options={participantList}
                    getOptionLabel={(option) => option.fullName || `${option.firstName} ${option.lastName}`.trim()}
                    value={selectedParticipants}
                    onChange={(_, value) => onChange('participantIds', value.map(p => p.id))}
                    isOptionEqualToValue={(a, b) => a.id === b.id}
                    disableCloseOnSelect
                    renderOption={(props, option, { selected }) => (
                        <li {...props} key={option.id}>
                            <Checkbox size="small" checked={selected} sx={{ mr: 0.5, p: 0.25 }} />
                            {option.fullName || `${option.firstName} ${option.lastName}`.trim()}
                        </li>
                    )}
                    renderInput={(params) => <TextField {...params} label="Members" size="small" />}
                    size="small"
                />
            </DialogContent>
            <DialogActions sx={{ px: 2, pb: 1.5 }}>
                <Button variant="outlined" size="small" onClick={onClose} sx={{ borderRadius: '20px', textTransform: 'none' }}>Cancel</Button>
                <Button variant="contained" size="small" onClick={onSave} disabled={isMutating || !working.isSavable()} sx={{ borderRadius: '20px', textTransform: 'none', fontWeight: 600 }}>
                    {editingGroup ? 'Save' : 'Add'}
                </Button>
            </DialogActions>
        </Dialog>
    );
};

export default GroupDialog;
