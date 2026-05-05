import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import {
    Box,
    Typography,
    Button,
    IconButton,
    CircularProgress,
    Alert,
    Accordion,
    AccordionSummary,
    AccordionDetails,
    List,
    ListItem,
    ListItemText,
    Chip,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import { actions as groupActions, selectors as groupSelectors } from '../../store/group';
import { actions as participantActions, selectors as participantSelectors } from '../../store/participant';
import { actions as uiActions } from '../../store/ui';
import Group from '../../domain/Group';
import GroupForm from '../../features/group/GroupDialog';
import Form from '../../components/common/Form';

const GroupScreen = () => {
    const { planId } = useParams();
    const dispatch = useDispatch();

    const groups = useSelector(groupSelectors.list);
    const { isLoading, isLoaded } = useSelector(groupSelectors.listMeta);
    const isMutating = useSelector(groupSelectors.isMutating);
    const error = useSelector(groupSelectors.error);
    const participants = useSelector(participantSelectors.list);

    const [editingGroup, setEditingGroup] = useState(null);
    const [working, setWorking] = useState(() => new Group());

    useEffect(() => {
        if (planId) {
            dispatch(groupActions.list(planId));
            dispatch(participantActions.list(planId));
        }
    }, [dispatch, planId]);

    const participantList = [...participants];

    const handleOpenCreate = () => {
        setEditingGroup(null);
        setWorking(new Group());
        dispatch(uiActions.openDialog('group-new'));
    };

    const handleOpenEdit = (group) => {
        setEditingGroup(group);
        setWorking(new Group(group));
        dispatch(uiActions.openDialog(`group-${group.id}`));
    };

    const handleChange = (field, value) => {
        setWorking(working.clone().set(field, value));
    };

    const handleSave = () => {
        const data = {
            planId,
            name: working.name,
            participantIds: working.participantIds,
        };
        if (editingGroup) {
            dispatch(groupActions.update(editingGroup.id, data));
        } else {
            dispatch(groupActions.create(data));
        }
    };

    const handleRemove = (groupId) => {
        dispatch(groupActions.remove(groupId));
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
                <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>Groups</Typography>
                <Button variant="outlined" size="small" startIcon={<AddIcon />} onClick={handleOpenCreate} sx={{ borderRadius: '20px', textTransform: 'none', fontWeight: 600 }}>
                    Add
                </Button>
            </Box>

            {error && <Alert severity="error" sx={{ mb: 1 }}>{error}</Alert>}

            {isLoaded && groups.length === 0 && (
                <Box sx={{ textAlign: 'center', py: 4 }}>
                    <Typography variant="body2" color="text.secondary">No groups yet.</Typography>
                </Box>
            )}

            {groups.length > 0 && (
                <Box>
                    {[...groups].map((group) => {
                        const members = participantList.filter(p => (group.participantIds || []).includes(p.id));
                        return (
                            <Accordion key={group.id} disableGutters sx={{ '&:before': { display: 'none' }, boxShadow: 'none', borderBottom: '1px solid', borderColor: 'divider' }}>
                                <AccordionSummary expandIcon={<ExpandMoreIcon />} sx={{ px: 0, minHeight: 44, '& .MuiAccordionSummary-content': { my: 0.75, alignItems: 'center', gap: 1 } }}>
                                    <Typography variant="body2" sx={{ fontWeight: 600, flex: 1 }}>{group.name}</Typography>
                                    <Chip label={`${members.length} member${members.length !== 1 ? 's' : ''}`} size="small" variant="outlined" sx={{ height: 20, fontSize: '0.7rem' }} />
                                    <IconButton size="small" onClick={(e) => { e.stopPropagation(); handleOpenEdit(group); }} sx={{ ml: 0.5 }}>
                                        <EditIcon fontSize="small" />
                                    </IconButton>
                                    <IconButton size="small" onClick={(e) => { e.stopPropagation(); handleRemove(group.id); }}>
                                        <DeleteIcon fontSize="small" />
                                    </IconButton>
                                </AccordionSummary>
                                <AccordionDetails sx={{ px: 0, pt: 0 }}>
                                    {members.length === 0 ? (
                                        <Typography variant="body2" color="text.secondary" sx={{ pl: 2 }}>No members</Typography>
                                    ) : (
                                        <List disablePadding>
                                            {members.map((p) => (
                                                <ListItem key={p.id} sx={{ py: 0.5, px: 2 }}>
                                                    <ListItemText
                                                        primary={p.fullName}
                                                        secondary={p.email}
                                                        slotProps={{ primary: { sx: { fontSize: '0.85rem' } }, secondary: { sx: { fontSize: '0.75rem' } } }}
                                                    />
                                                    <Chip label={p.roleLabel} size="small" variant="outlined" sx={{ height: 20, fontSize: '0.7rem' }} />
                                                </ListItem>
                                            ))}
                                        </List>
                                    )}
                                </AccordionDetails>
                            </Accordion>
                        );
                    })}
                </Box>
            )}

            <Form
                formType="group"
                formData={editingGroup}
                title={editingGroup ? 'Edit Group' : 'Add Group'}
                maxWidth="xs"
                actions={({ onClose }) => (
                    <>
                        <Button variant="outlined" size="small" onClick={onClose} sx={{ borderRadius: '20px', textTransform: 'none' }}>Cancel</Button>
                        <Button variant="contained" size="small" onClick={() => { handleSave(); onClose(); }} disabled={isMutating || !working.isSavable()} sx={{ borderRadius: '20px', textTransform: 'none', fontWeight: 600 }}>
                            {editingGroup ? 'Save' : 'Add'}
                        </Button>
                    </>
                )}
                onClose={() => { setEditingGroup(null); setWorking(new Group()); }}
            >
                <GroupForm working={working} onChange={handleChange} participants={participants} />
            </Form>
        </>
    );
};

export default GroupScreen;
