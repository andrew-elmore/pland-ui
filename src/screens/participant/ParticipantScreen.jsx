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
    CircularProgress,
    Alert,
    Chip,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import { actions as participantActions, selectors as participantSelectors } from '../../store/participant';
import { actions as uiActions } from '../../store/ui';
import Participant from '../../domain/Participant';
import ParticipantForm from '../../features/participant/ParticipantDialog';
import Form from '../../components/common/Form';

const ParticipantScreen = () => {
    const { planId } = useParams();
    const dispatch = useDispatch();

    const participants = useSelector(participantSelectors.list);
    const { isLoading, isLoaded } = useSelector(participantSelectors.listMeta);
    const isMutating = useSelector(participantSelectors.isMutating);
    const error = useSelector(participantSelectors.error);

    const [working, setWorking] = useState(() => new Participant());

    useEffect(() => {
        if (planId) {
            dispatch(participantActions.list(planId));
        }
    }, [dispatch, planId]);

    const handleOpenCreate = () => {
        setWorking(new Participant());
        dispatch(uiActions.openDialog('participant-new'));
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
    };

    const handleRemove = (participantId) => {
        dispatch(participantActions.remove(participantId));
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
                <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>Participants</Typography>
                <Button variant="outlined" size="small" startIcon={<AddIcon />} onClick={handleOpenCreate} sx={{ borderRadius: '20px', textTransform: 'none', fontWeight: 600 }}>
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

            <Form
                formType="participant"
                title="Add Participant"
                maxWidth="xs"
                actions={({ onClose }) => (
                    <>
                        <Button variant="outlined" size="small" onClick={onClose} sx={{ borderRadius: '20px', textTransform: 'none' }}>Cancel</Button>
                        <Button variant="contained" size="small" onClick={() => { handleCreate(); onClose(); }} disabled={isMutating || !working.isSavable()} sx={{ borderRadius: '20px', textTransform: 'none', fontWeight: 600 }}>Add</Button>
                    </>
                )}
                onClose={() => setWorking(new Participant())}
            >
                <ParticipantForm working={working} onChange={handleChange} />
            </Form>
        </>
    );
};

export default ParticipantScreen;
