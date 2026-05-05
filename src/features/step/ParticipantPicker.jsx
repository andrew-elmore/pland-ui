import React, { useState, useRef, useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { Autocomplete, TextField, Checkbox, Chip, Box, IconButton, Button } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import { actions as participantActions } from '../../store/participant';

const ParticipantPicker = ({ participantIds, onChange, participants, groups, planId }) => {
    const dispatch = useDispatch();
    const [creating, setCreating] = useState(false);
    const [newFirstName, setNewFirstName] = useState('');
    const [newLastName, setNewLastName] = useState('');
    const [newEmail, setNewEmail] = useState('');
    const preCreateIds = useRef(null);

    const participantList = [...participants];
    const groupList = [...groups];

    useEffect(() => {
        if (!preCreateIds.current) return;
        const newParticipant = participantList.find(p => !preCreateIds.current.has(p.id));
        if (newParticipant) {
            onChange([...new Set([...participantIds, newParticipant.id])]);
            preCreateIds.current = null;
        }
    }, [participants, participantIds, onChange]);

    const handleCreate = () => {
        if (!newFirstName.trim() || !newEmail.trim()) return;
        preCreateIds.current = new Set(participantList.map(p => p.id));
        dispatch(participantActions.create({
            planId,
            firstName: newFirstName.trim(),
            lastName: newLastName.trim(),
            email: newEmail.trim(),
            role: 'attendee',
        }));
        setCreating(false);
        setNewFirstName('');
        setNewLastName('');
        setNewEmail('');
    };

    const groupedOptions = [];
    groupList.forEach((g) => {
        const memberIds = g.participantIds || [];
        const members = participantList.filter(p => memberIds.includes(p.id));
        if (members.length > 0) {
            groupedOptions.push({ type: 'group', group: g, id: `group-${g.id}` });
            members.forEach(p => groupedOptions.push({ type: 'participant', participant: p, groupName: g.name, id: p.id }));
        }
    });
    const groupedIds = new Set(groupList.flatMap(g => g.participantIds || []));
    const ungrouped = participantList.filter(p => !groupedIds.has(p.id));
    if (ungrouped.length > 0) {
        ungrouped.forEach(p => groupedOptions.push({ type: 'participant', participant: p, groupName: 'All', id: p.id }));
    }

    return (
        <>
            <Box sx={{ display: 'flex', alignItems: 'flex-start', mt: 2, gap: 0.5 }}>
                <Autocomplete
                    multiple
                    options={groupedOptions}
                    getOptionLabel={(option) => {
                        if (option.type === 'group') return option.group.name;
                        return option.participant.fullName || `${option.participant.firstName} ${option.participant.lastName}`.trim();
                    }}
                    value={groupedOptions.filter(o => o.type === 'participant' && participantIds.includes(o.id))}
                    onChange={(_, value, reason, details) => {
                        if (details?.option?.type === 'group') {
                            const memberIds = (details.option.group.participantIds || []).filter(id => participantList.some(p => p.id === id));
                            if (reason === 'selectOption') {
                                onChange([...new Set([...participantIds, ...memberIds])]);
                            } else if (reason === 'removeOption') {
                                onChange(participantIds.filter(id => !memberIds.includes(id)));
                            }
                        } else {
                            onChange(value.filter(o => o.type === 'participant').map(o => o.id));
                        }
                    }}
                    isOptionEqualToValue={(a, b) => a.id === b.id}
                    disableCloseOnSelect
                    renderOption={(props, option, { selected }) => {
                        if (option.type === 'group') {
                            const memberIds = (option.group.participantIds || []).filter(id => participantList.some(p => p.id === id));
                            const allSelected = memberIds.length > 0 && memberIds.every(id => participantIds.includes(id));
                            const someSelected = memberIds.some(id => participantIds.includes(id));
                            return (
                                <li {...props} key={option.id} style={{ fontWeight: 700 }}>
                                    <Checkbox size="small" checked={allSelected} indeterminate={someSelected && !allSelected} sx={{ mr: 0.5, p: 0.25 }} />
                                    {option.group.name}
                                </li>
                            );
                        }
                        return (
                            <li {...props} key={option.id} style={{ paddingLeft: 32 }}>
                                <Checkbox size="small" checked={selected} sx={{ mr: 0.5, p: 0.25 }} />
                                {option.participant.fullName || `${option.participant.firstName} ${option.participant.lastName}`.trim()}
                            </li>
                        );
                    }}
                    renderTags={(value, getTagProps) =>
                        value.filter(o => o.type === 'participant').map((option, index) => (
                            <Chip
                                {...getTagProps({ index })}
                                key={option.id}
                                label={option.participant.fullName || `${option.participant.firstName} ${option.participant.lastName}`.trim()}
                                size="small"
                            />
                        ))
                    }
                    renderInput={(params) => (
                        <TextField {...params} label="Participants" size="small" />
                    )}
                    size="small"
                    sx={{ flex: 1 }}
                />
                <IconButton size="small" onClick={() => setCreating(true)} sx={{ mt: 0.5 }}>
                    <AddIcon fontSize="small" />
                </IconButton>
            </Box>

            {creating && (
                <Box sx={{ mt: 1, p: 1.5, border: '1px solid', borderColor: 'divider', borderRadius: 1 }}>
                    <Box sx={{ display: 'flex', gap: 1 }}>
                        <TextField autoFocus label="First Name" size="small" value={newFirstName} onChange={(e) => setNewFirstName(e.target.value)} sx={{ flex: 1 }} />
                        <TextField label="Last Name" size="small" value={newLastName} onChange={(e) => setNewLastName(e.target.value)} sx={{ flex: 1 }} />
                    </Box>
                    <TextField label="Email" size="small" type="email" fullWidth value={newEmail} onChange={(e) => setNewEmail(e.target.value)} sx={{ mt: 1 }} />
                    <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1, mt: 1 }}>
                        <Button size="small" onClick={() => { setCreating(false); setNewFirstName(''); setNewLastName(''); setNewEmail(''); }} sx={{ textTransform: 'none' }}>
                            Cancel
                        </Button>
                        <Button size="small" variant="contained" onClick={handleCreate} disabled={!newFirstName.trim() || !newEmail.trim()} sx={{ textTransform: 'none', fontWeight: 600 }}>
                            Add
                        </Button>
                    </Box>
                </Box>
            )}
        </>
    );
};

export default ParticipantPicker;
