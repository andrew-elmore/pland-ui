import React, { useEffect, useState } from 'react';
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
    Chip,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import CloseIcon from '@mui/icons-material/Close';
import DeleteIcon from '@mui/icons-material/Delete';
import { actions as participantActions, selectors as participantSelectors } from '../../store/participant';
import Participant from '../../domain/Participant';

const ROLE_OPTIONS = Participant.ROLES.map((role) => ({
    value: role,
    label: Participant.ROLE_LABELS[role],
}));

const PlanParticipantsScreen = () => {
    const { planId } = useParams();
    const dispatch = useDispatch();

    const participants = useSelector(participantSelectors.list);
    const { isLoading, isLoaded } = useSelector(participantSelectors.listMeta);
    const isMutating = useSelector(participantSelectors.isMutating);
    const error = useSelector(participantSelectors.error);

    const [dialogOpen, setDialogOpen] = useState(false);
    const [working, setWorking] = useState(() => new Participant());

    useEffect(() => {
        if (planId) {
            dispatch(participantActions.list(planId));
        }
    }, [dispatch, planId]);

    const handleOpenDialog = () => {
        setWorking(new Participant());
        setDialogOpen(true);
    };

    const handleCloseDialog = () => {
        setDialogOpen(false);
        setWorking(new Participant());
    };

    const handleChange = (field, value) => {
        setWorking(working.clone().set(field, value));
    };

    const handleCreate = () => {
        dispatch(participantActions.create({
            planId,
            firstName: working.firstName,
            lastName: working.lastName,
            email: working.email,
            role: working.role,
        }));
        setDialogOpen(false);
        setWorking(new Participant());
    };

    const handleRemove = (participantId) => {
        dispatch(participantActions.remove(participantId));
    };

    const selectedRoleOption = ROLE_OPTIONS.find((o) => o.value === working.role) || null;

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
                <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>Participants</Typography>
                <Button variant="outlined" size="small" startIcon={<AddIcon />} onClick={handleOpenDialog} sx={{ borderRadius: '20px', textTransform: 'none', fontWeight: 600 }}>
                    Add
                </Button>
            </Box>

            {error && <Alert severity="error" sx={{ mb: 1 }}>{error}</Alert>}

            {isLoaded && participants.length === 0 && (
                <Box sx={{ textAlign: 'center', py: 4 }}>
                    <Typography variant="body2" color="text.secondary">No participants yet.</Typography>
                </Box>
            )}

            {participants.length > 0 && (
                <List disablePadding>
                    {participants.map((p) => (
                        <ListItem
                            key={p.id}
                            sx={{ borderBottom: '1px solid', borderColor: 'divider', py: 1, px: 0 }}
                            secondaryAction={
                                <IconButton edge="end" size="small" onClick={() => handleRemove(p.id)}>
                                    <DeleteIcon fontSize="small" />
                                </IconButton>
                            }
                        >
                            <ListItemText
                                primary={
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                        <Typography variant="body2" sx={{ fontWeight: 600 }}>{p.fullName}</Typography>
                                        <Chip label={p.roleLabel} size="small" variant="outlined" sx={{ height: 20, fontSize: '0.7rem' }} />
                                        {p.isLinked && <Chip label="Linked" size="small" color="success" variant="outlined" sx={{ height: 20, fontSize: '0.7rem' }} />}
                                    </Box>
                                }
                                secondary={p.email}
                                slotProps={{ secondary: { sx: { fontSize: '0.75rem' } } }}
                            />
                        </ListItem>
                    ))}
                </List>
            )}

            <Dialog open={dialogOpen} onClose={handleCloseDialog} maxWidth="xs" fullWidth disableRestoreFocus>
                <DialogTitle sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', pb: 1 }}>
                    Add Participant
                    <IconButton onClick={handleCloseDialog} edge="end" size="small">
                        <CloseIcon fontSize="small" />
                    </IconButton>
                </DialogTitle>
                <DialogContent sx={{ pt: 1 }}>
                    <TextField autoFocus label="First Name" fullWidth size="small" value={working.firstName} onChange={(e) => handleChange('firstName', e.target.value)} sx={{ mt: 1, mb: 1.5 }} />
                    <TextField label="Last Name" fullWidth size="small" value={working.lastName} onChange={(e) => handleChange('lastName', e.target.value)} sx={{ mb: 1.5 }} />
                    <TextField label="Email" fullWidth size="small" type="email" value={working.email} onChange={(e) => handleChange('email', e.target.value)} sx={{ mb: 1.5 }} />
                    <Autocomplete
                        options={ROLE_OPTIONS}
                        getOptionLabel={(option) => option.label}
                        value={selectedRoleOption}
                        onChange={(_, option) => handleChange('role', option?.value ?? Participant.ROLE_ATTENDEE)}
                        isOptionEqualToValue={(option, val) => option.value === val.value}
                        disableClearable
                        size="small"
                        renderInput={(params) => <TextField {...params} label="Role" />}
                    />
                </DialogContent>
                <DialogActions sx={{ px: 2, pb: 1.5 }}>
                    <Button variant="outlined" size="small" onClick={handleCloseDialog} sx={{ borderRadius: '20px', textTransform: 'none' }}>Cancel</Button>
                    <Button variant="contained" size="small" onClick={handleCreate} disabled={isMutating || !working.isSavable()} sx={{ borderRadius: '20px', textTransform: 'none', fontWeight: 600 }}>Add</Button>
                </DialogActions>
            </Dialog>
        </>
    );
};

export default PlanParticipantsScreen;
