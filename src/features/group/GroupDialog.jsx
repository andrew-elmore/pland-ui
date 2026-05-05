import React from 'react';
import { TextField, Autocomplete, Checkbox } from '@mui/material';

const GroupForm = ({ working, onChange, participants }) => {
    const participantList = [...participants];
    const selectedParticipants = participantList.filter(p => working.participantIds.includes(p.id));

    return (
        <>
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
        </>
    );
};

export default GroupForm;
