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
    CircularProgress,
    Alert,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import CloseIcon from '@mui/icons-material/Close';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import { actions as timeActions, selectors as timeSelectors } from '../../store/time';

const PlanTimesScreen = () => {
    const { planId } = useParams();
    const dispatch = useDispatch();

    const times = useSelector(timeSelectors.list);
    const { isLoading, isLoaded } = useSelector(timeSelectors.listMeta);
    const isMutating = useSelector(timeSelectors.isMutating);
    const error = useSelector(timeSelectors.error);

    const [dialogOpen, setDialogOpen] = useState(false);
    const [editingId, setEditingId] = useState(null);
    const [label, setLabel] = useState('');
    const [datetime, setDatetime] = useState('');

    useEffect(() => {
        if (planId) {
            dispatch(timeActions.list(planId));
        }
    }, [dispatch, planId]);

    const toLocalDatetime = (iso) => {
        if (!iso) return '';
        const d = new Date(iso);
        const pad = (n) => String(n).padStart(2, '0');
        return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
    };

    const handleOpenCreate = () => {
        setEditingId(null);
        setLabel('');
        setDatetime('');
        setDialogOpen(true);
    };

    const handleOpenEdit = (time) => {
        setEditingId(time.id);
        setLabel(time.label || '');
        setDatetime(toLocalDatetime(time.datetime));
        setDialogOpen(true);
    };

    const handleClose = () => {
        setDialogOpen(false);
        setEditingId(null);
        setLabel('');
        setDatetime('');
    };

    const handleSave = () => {
        if (!datetime) return;
        const data = {
            planId,
            label: label.trim(),
            datetime: new Date(datetime).toISOString(),
        };
        if (editingId) {
            dispatch(timeActions.update(editingId, data));
        } else {
            dispatch(timeActions.create(data));
        }
        handleClose();
    };

    const handleRemove = (id) => {
        dispatch(timeActions.remove(id));
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
                <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>Times</Typography>
                <Button variant="outlined" size="small" startIcon={<AddIcon />} onClick={handleOpenCreate} sx={{ borderRadius: '20px', textTransform: 'none', fontWeight: 600 }}>
                    Add
                </Button>
            </Box>

            {error && <Alert severity="error" sx={{ mb: 1 }}>{error}</Alert>}

            {isLoaded && times.length === 0 && (
                <Box sx={{ textAlign: 'center', py: 4 }}>
                    <Typography variant="body2" color="text.secondary">No times yet.</Typography>
                </Box>
            )}

            {times.length > 0 && (
                <List disablePadding>
                    {[...times].map((t) => (
                        <ListItem
                            key={t.id}
                            sx={{ borderBottom: '1px solid', borderColor: 'divider', py: 1, px: 0 }}
                            secondaryAction={
                                <Box sx={{ display: 'flex', gap: 0.5 }}>
                                    <IconButton size="small" onClick={() => handleOpenEdit(t)}>
                                        <EditIcon fontSize="small" />
                                    </IconButton>
                                    <IconButton size="small" onClick={() => handleRemove(t.id)}>
                                        <DeleteIcon fontSize="small" />
                                    </IconButton>
                                </Box>
                            }
                        >
                            <ListItemText
                                primary={t.displayLabel}
                                secondary={new Date(t.datetime).toLocaleString([], { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric', hour: 'numeric', minute: '2-digit' })}
                                slotProps={{ secondary: { sx: { fontSize: '0.75rem' } } }}
                            />
                        </ListItem>
                    ))}
                </List>
            )}

            <Dialog open={dialogOpen} onClose={handleClose} maxWidth="xs" fullWidth disableRestoreFocus>
                <DialogTitle sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', pb: 1 }}>
                    {editingId ? 'Edit Time' : 'Add Time'}
                    <IconButton onClick={handleClose} edge="end" size="small">
                        <CloseIcon fontSize="small" />
                    </IconButton>
                </DialogTitle>
                <DialogContent sx={{ pt: 1 }}>
                    <TextField
                        autoFocus
                        label="Label"
                        fullWidth
                        size="small"
                        value={label}
                        onChange={(e) => setLabel(e.target.value)}
                        placeholder="e.g. Party Starts"
                        sx={{ mt: 1, mb: 1.5 }}
                    />
                    <TextField
                        label="Date & Time"
                        type="datetime-local"
                        fullWidth
                        size="small"
                        value={datetime}
                        onChange={(e) => setDatetime(e.target.value)}
                        slotProps={{ inputLabel: { shrink: true } }}
                    />
                </DialogContent>
                <DialogActions sx={{ px: 2, pb: 1.5 }}>
                    <Button variant="outlined" size="small" onClick={handleClose} sx={{ borderRadius: '20px', textTransform: 'none' }}>Cancel</Button>
                    <Button variant="contained" size="small" onClick={handleSave} disabled={isMutating || !datetime} sx={{ borderRadius: '20px', textTransform: 'none', fontWeight: 600 }}>
                        {editingId ? 'Save' : 'Add'}
                    </Button>
                </DialogActions>
            </Dialog>
        </>
    );
};

export default PlanTimesScreen;
