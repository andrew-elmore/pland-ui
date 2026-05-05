import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import {
    Box,
    Container,
    Typography,
    Alert,
    Button,
    List,
    ListItem,
    ListItemButton,
    ListItemText,
    TextField,
    CircularProgress,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import { actions as planActions, selectors as planSelectors } from '../store/plan';
import { actions as uiActions } from '../store/ui';
import { selectors as authSelectors } from '../store/auth';
import Plan from '../domain/Plan';
import ROUTES from '../router/routes';
import Form from '../components/common/Form';

const HomeScreen = () => {
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const isAuthenticated = useSelector(authSelectors.isAuthenticated);
    const plans = useSelector(planSelectors.list);
    const { isLoading, isLoaded } = useSelector(planSelectors.listMeta);
    const isMutating = useSelector(planSelectors.isMutating);
    const error = useSelector(planSelectors.error);

    const [working, setWorking] = useState(() => new Plan());

    useEffect(() => {
        if (isAuthenticated) {
            dispatch(planActions.list());
        }
    }, [dispatch, isAuthenticated]);

    const handleOpenCreate = () => {
        setWorking(new Plan());
        dispatch(uiActions.openDialog('plan-new'));
    };

    const handleChange = (field, value) => {
        setWorking(working.clone().set(field, value));
    };

    const handleCreate = () => {
        dispatch(planActions.create({ name: working.name, description: working.description }));
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
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 3 }}>
                    <Typography variant="h4" sx={{ fontWeight: 600 }}>My Plans</Typography>
                    <Button variant="contained" startIcon={<AddIcon />} onClick={handleOpenCreate} sx={{ borderRadius: '20px', textTransform: 'none', fontWeight: 600 }}>
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
                        <Button variant="outlined" startIcon={<AddIcon />} onClick={handleOpenCreate} sx={{ borderRadius: '20px', textTransform: 'none', fontWeight: 600 }}>
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
            </Box>

            <Form
                formType="plan"
                title="New Plan"
                maxWidth="sm"
                actions={({ onClose }) => (
                    <>
                        <Button variant="outlined" onClick={onClose} sx={{ borderRadius: '20px', textTransform: 'none' }}>Cancel</Button>
                        <Button variant="contained" onClick={() => { handleCreate(); onClose(); }} disabled={isMutating || !working.isSavable()} sx={{ borderRadius: '20px', textTransform: 'none', fontWeight: 600 }}>Create</Button>
                    </>
                )}
                onClose={() => setWorking(new Plan())}
            >
                <>
                    <TextField autoFocus label="Plan Name" fullWidth value={working.name} onChange={(e) => handleChange('name', e.target.value)} sx={{ mt: 1, mb: 2 }} />
                    <TextField label="Description" fullWidth multiline rows={3} value={working.description} onChange={(e) => handleChange('description', e.target.value)} />
                </>
            </Form>
        </Container>
    );
};

export default HomeScreen;
