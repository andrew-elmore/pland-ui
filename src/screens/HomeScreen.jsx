import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import {
    Box,
    Container,
    Typography,
    Paper,
    Alert,
    Button,
    List,
    ListItem,
    ListItemButton,
    ListItemText,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    TextField,
    IconButton,
    CircularProgress,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import CloseIcon from '@mui/icons-material/Close';
import { actions as planActions, selectors as planSelectors } from '../store/plan';
import { selectors as authSelectors } from '../store/auth';
import Plan from '../domain/Plan';
import ROUTES from '../router/routes';

const HomeScreen = () => {
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const isAuthenticated = useSelector(authSelectors.isAuthenticated);
    const plans = useSelector(planSelectors.list);
    const { isLoading, isLoaded } = useSelector(planSelectors.listMeta);
    const isMutating = useSelector(planSelectors.isMutating);
    const error = useSelector(planSelectors.error);

    const [dialogOpen, setDialogOpen] = useState(false);
    const [working, setWorking] = useState(() => new Plan());

    useEffect(() => {
        if (isAuthenticated) {
            dispatch(planActions.list());
        }
    }, [dispatch, isAuthenticated]);

    const handleOpenDialog = () => {
        setWorking(new Plan());
        setDialogOpen(true);
    };

    const handleCloseDialog = () => {
        setDialogOpen(false);
        setWorking(new Plan());
    };

    const handleChange = (field, value) => {
        setWorking(working.clone().set(field, value));
    };

    const handleCreate = () => {
        dispatch(planActions.create({ name: working.name, description: working.description }));
        setDialogOpen(false);
        setWorking(new Plan());
    };

    if (!isAuthenticated) {
        return (
            <Container maxWidth="sm">
                <Box sx={{ minHeight: '60vh', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', gap: 2 }}>
                    <Typography variant="h4" sx={{ fontWeight: 600 }}>Welcome to Pland</Typography>
                    <Typography variant="body1" color="text.secondary">Sign in to start creating plans.</Typography>
                </Box>
            </Container>
        );
    }

    return (
        <Container maxWidth="md">
            <Box py={4}>
                <Paper elevation={3} sx={{ p: 4 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 3 }}>
                        <Typography variant="h4" sx={{ fontWeight: 600 }}>My Plans</Typography>
                        <Button variant="contained" startIcon={<AddIcon />} onClick={handleOpenDialog} sx={{ borderRadius: '20px', textTransform: 'none', fontWeight: 600 }}>
                            New Plan
                        </Button>
                    </Box>

                    {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

                    {isLoading && !isLoaded && (
                        <Box sx={{ display: 'flex', justifyContent: 'center', py: 6 }}>
                            <CircularProgress />
                        </Box>
                    )}

                    {isLoaded && plans.length === 0 && (
                        <Box sx={{ textAlign: 'center', py: 6 }}>
                            <Typography variant="body1" color="text.secondary" sx={{ mb: 2 }}>You don't have any plans yet.</Typography>
                            <Button variant="outlined" startIcon={<AddIcon />} onClick={handleOpenDialog} sx={{ borderRadius: '20px', textTransform: 'none', fontWeight: 600 }}>
                                Create your first plan
                            </Button>
                        </Box>
                    )}

                    {plans.length > 0 && (
                        <List disablePadding>
                            {plans.map((plan) => (
                                <ListItem key={plan.id} disablePadding sx={{ borderBottom: '1px solid', borderColor: 'divider' }}>
                                    <ListItemButton sx={{ py: 2 }} onClick={() => navigate(ROUTES.PLAN.replace(':planId', plan.id))}>
                                        <ListItemText
                                            primary={plan.name}
                                            secondary={plan.description || null}
                                            slotProps={{ primary: { sx: { fontWeight: 600 } } }}
                                        />
                                    </ListItemButton>
                                </ListItem>
                            ))}
                        </List>
                    )}
                </Paper>
            </Box>

            <Dialog open={dialogOpen} onClose={handleCloseDialog} maxWidth="sm" fullWidth disableRestoreFocus>
                <DialogTitle sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    New Plan
                    <IconButton onClick={handleCloseDialog} edge="end">
                        <CloseIcon />
                    </IconButton>
                </DialogTitle>
                <DialogContent>
                    <TextField
                        autoFocus
                        label="Plan Name"
                        fullWidth
                        value={working.name}
                        onChange={(e) => handleChange('name', e.target.value)}
                        sx={{ mt: 1, mb: 2 }}
                    />
                    <TextField
                        label="Description"
                        fullWidth
                        multiline
                        rows={3}
                        value={working.description}
                        onChange={(e) => handleChange('description', e.target.value)}
                    />
                </DialogContent>
                <DialogActions sx={{ px: 3, pb: 2 }}>
                    <Button variant="outlined" onClick={handleCloseDialog} sx={{ borderRadius: '20px', textTransform: 'none' }}>Cancel</Button>
                    <Button variant="contained" onClick={handleCreate} disabled={isMutating || !working.isSavable()} sx={{ borderRadius: '20px', textTransform: 'none', fontWeight: 600 }}>
                        Create
                    </Button>
                </DialogActions>
            </Dialog>
        </Container>
    );
};

export default HomeScreen;
