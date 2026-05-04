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
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import SubdirectoryArrowRightIcon from '@mui/icons-material/SubdirectoryArrowRight';
import { actions as timeActions, selectors as timeSelectors } from '../../store/time';
import TimeFormDialog from '../../components/common/TimeFormDialog';

const TimeScreen = () => {
    const { planId } = useParams();
    const dispatch = useDispatch();

    const times = useSelector(timeSelectors.list);
    const { isLoading, isLoaded } = useSelector(timeSelectors.listMeta);
    const isMutating = useSelector(timeSelectors.isMutating);
    const error = useSelector(timeSelectors.error);

    const [dialogOpen, setDialogOpen] = useState(false);
    const [editingTime, setEditingTime] = useState(null);
    const [defaultParentTimeId, setDefaultParentTimeId] = useState(null);

    useEffect(() => {
        if (planId) {
            dispatch(timeActions.list(planId));
        }
    }, [dispatch, planId]);

    const handleOpenCreate = (parent) => {
        setEditingTime(null);
        setDefaultParentTimeId(parent?.id ?? null);
        setDialogOpen(true);
    };

    const handleOpenEdit = (time) => {
        setEditingTime(time);
        setDefaultParentTimeId(null);
        setDialogOpen(true);
    };

    const handleClose = () => {
        setDialogOpen(false);
        setEditingTime(null);
        setDefaultParentTimeId(null);
    };

    const handleSubmitTime = (data) => {
        if (editingTime) {
            dispatch(timeActions.update(editingTime.id, data));
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

    const timeList = [...times];
    const rootTimes = timeList.filter(t => !t.parentTimeId);
    const childrenOf = (id) => timeList.filter(t => t.parentTimeId === id);

    const renderTimeTree = (t, depth = 0) => (
        <React.Fragment key={t.id}>
            {renderTimeItem(t, depth)}
            {childrenOf(t.id).map((child) => renderTimeTree(child, depth + 1))}
        </React.Fragment>
    );

    const renderTimeItem = (t, depth = 0) => {
        const isRoute = t.routeId != null;
        return (
            <ListItem
                key={t.id}
                sx={{ borderBottom: '1px solid', borderColor: 'divider', py: 1, px: 0, pl: depth * 4 }}
                secondaryAction={
                    <Box sx={{ display: 'flex', gap: 0.5 }}>
                        {!isRoute && (
                            <IconButton size="small" onClick={() => handleOpenCreate(t)} title="Add dependent">
                                <AddIcon fontSize="small" />
                            </IconButton>
                        )}
                        <IconButton size="small" onClick={() => handleOpenEdit(t)}>
                            <EditIcon fontSize="small" />
                        </IconButton>
                        {!isRoute && (
                            <IconButton size="small" onClick={() => handleRemove(t.id)}>
                                <DeleteIcon fontSize="small" />
                            </IconButton>
                        )}
                    </Box>
                }
            >
                {depth > 0 && <SubdirectoryArrowRightIcon fontSize="small" sx={{ mr: 1, color: 'text.disabled' }} />}
                <ListItemText
                    primary={
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <span>{t.displayLabel}</span>
                            {t.parentTimeId && t.offsetDisplay && (
                                <Typography variant="caption" color="text.secondary">({t.offsetDisplay})</Typography>
                            )}
                        </Box>
                    }
                    secondary={new Date(t.datetime).toLocaleString([], { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric', hour: 'numeric', minute: '2-digit' })}
                    slotProps={{ secondary: { sx: { fontSize: '0.75rem' } } }}
                />
            </ListItem>
        );
    };

    return (
        <>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
                <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>Times</Typography>
                <Button variant="outlined" size="small" startIcon={<AddIcon />} onClick={() => handleOpenCreate(null)} sx={{ borderRadius: '20px', textTransform: 'none', fontWeight: 600 }}>
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
                    {rootTimes.map((t) => renderTimeTree(t, 0))}
                </List>
            )}

            <TimeFormDialog
                open={dialogOpen}
                onClose={handleClose}
                planId={planId}
                times={times}
                editingTime={editingTime}
                defaultParentTimeId={defaultParentTimeId}
                onSubmit={handleSubmitTime}
                isSaving={isMutating}
            />
        </>
    );
};

export default TimeScreen;
