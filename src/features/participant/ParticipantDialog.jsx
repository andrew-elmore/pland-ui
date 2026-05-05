import React from 'react';
import { TextField, Autocomplete } from '@mui/material';
import Participant from '../../domain/Participant';

const ROLE_OPTIONS = Participant.ROLES.map((role) => ({
    value: role,
    label: Participant.ROLE_LABELS[role],
}));

const ParticipantForm = ({ working, onChange }) => {
    const selectedRoleOption = ROLE_OPTIONS.find((o) => o.value === working.role) || null;

    return (
        <>
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
        </>
    );
};

export default ParticipantForm;
