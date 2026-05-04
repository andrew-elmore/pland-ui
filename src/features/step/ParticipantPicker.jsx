import React from 'react';
import { Autocomplete, TextField, Checkbox, Chip } from '@mui/material';

const ParticipantPicker = ({ participantIds, onChange, participants, groups }) => {
    const participantList = [...participants];
    const groupList = [...groups];

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
            sx={{ mt: 2 }}
        />
    );
};

export default ParticipantPicker;
