import React, { useEffect } from 'react';
import { useParams, useNavigate, useLocation, Outlet } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import {
    Box,
    Typography,
    Alert,
    IconButton,
    List,
    ListItemButton,
    ListItemIcon,
    ListItemText,
    CircularProgress,
    BottomNavigation,
    BottomNavigationAction,
    useMediaQuery,
} from '@mui/material';
import { useTheme } from '@mui/material/styles';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import MapIcon from '@mui/icons-material/Map';
import PeopleIcon from '@mui/icons-material/People';
import PlaceIcon from '@mui/icons-material/Place';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import DirectionsIcon from '@mui/icons-material/Directions';
import GroupsIcon from '@mui/icons-material/Groups';
import { actions as planActions, selectors as planSelectors } from '../../store/plan';
import ROUTES from '../../router/routes';

const NAV_WIDTH = 200;

const navItems = [
    { label: 'Itineraries', icon: <MapIcon fontSize="small" />, path: 'itineraries' },
    { label: 'Times', icon: <AccessTimeIcon fontSize="small" />, path: 'times' },
    { label: 'Routes', icon: <DirectionsIcon fontSize="small" />, path: 'routes' },
    { label: 'Locations', icon: <PlaceIcon fontSize="small" />, path: 'locations' },
    { label: 'Groups', icon: <GroupsIcon fontSize="small" />, path: 'groups' },
    { label: 'Participants', icon: <PeopleIcon fontSize="small" />, path: 'participants' },
];

const PlanLayout = () => {
    const { planId } = useParams();
    const navigate = useNavigate();
    const location = useLocation();
    const dispatch = useDispatch();
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('md'));

    const plan = useSelector(planSelectors.current);
    const { isLoading, isLoaded } = useSelector(planSelectors.currentMeta);
    const error = useSelector(planSelectors.error);

    useEffect(() => {
        if (planId && plan.id !== planId) {
            dispatch(planActions.get(planId));
        }
    }, [dispatch, planId, plan.id]);

    const activePath = location.pathname.split('/').pop();
    const activeIndex = navItems.findIndex((item) => item.path === activePath);

    if (isLoaded && !plan.id) {
        return (
            <Box sx={{ p: 2 }}>
                <Alert severity="warning">Plan not found</Alert>
            </Box>
        );
    }

    if (isMobile) {
        return (
            <Box sx={{ display: 'flex', flexDirection: 'column', height: 'calc(100dvh - 64px)' }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, px: 1, py: 1, borderBottom: '1px solid', borderColor: 'divider', flexShrink: 0 }}>
                    <IconButton onClick={() => navigate(ROUTES.HOME)} size="small">
                        <ArrowBackIcon fontSize="small" />
                    </IconButton>
                    {isLoading && !isLoaded ? (
                        <CircularProgress size={16} />
                    ) : (
                        <Typography variant="subtitle2" sx={{ fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                            {plan.name}
                        </Typography>
                    )}
                </Box>

                <Box sx={{ flex: 1, overflow: 'auto', p: 2, minHeight: 0 }}>
                    {error && <Alert severity="error" sx={{ mb: 1 }}>{error}</Alert>}
                    <Outlet />
                </Box>

                <BottomNavigation
                    value={activeIndex >= 0 ? activeIndex : false}
                    onChange={(_, newValue) => navigate(navItems[newValue].path)}
                    showLabels
                    sx={{ borderTop: '1px solid', borderColor: 'divider', flexShrink: 0, minHeight: 56 }}
                >
                    {navItems.map((item) => (
                        <BottomNavigationAction
                            key={item.path}
                            label={item.label}
                            icon={item.icon}
                            sx={{ minWidth: 0, px: 0.5, '& .MuiBottomNavigationAction-label': { fontSize: '0.6rem' } }}
                        />
                    ))}
                </BottomNavigation>
            </Box>
        );
    }

    return (
        <Box sx={{ display: 'flex', height: 'calc(100dvh - 64px)' }}>
            <Box sx={{ width: NAV_WIDTH, flexShrink: 0, borderRight: '1px solid', borderColor: 'divider', display: 'flex', flexDirection: 'column' }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, px: 1, py: 1.5, borderBottom: '1px solid', borderColor: 'divider' }}>
                    <IconButton onClick={() => navigate(ROUTES.HOME)} size="small">
                        <ArrowBackIcon fontSize="small" />
                    </IconButton>
                    {isLoading && !isLoaded ? (
                        <CircularProgress size={16} />
                    ) : (
                        <Typography variant="subtitle2" sx={{ fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                            {plan.name}
                        </Typography>
                    )}
                </Box>
                <List disablePadding sx={{ pt: 0.5 }}>
                    {navItems.map((item) => (
                        <ListItemButton
                            key={item.path}
                            selected={activePath === item.path}
                            onClick={() => navigate(item.path)}
                            sx={{ py: 0.75, px: 2 }}
                        >
                            <ListItemIcon sx={{ minWidth: 32 }}>{item.icon}</ListItemIcon>
                            <ListItemText primary={item.label} slotProps={{ primary: { sx: { fontSize: '0.875rem' } } }} />
                        </ListItemButton>
                    ))}
                </List>
            </Box>

            <Box sx={{ flex: 1, overflow: 'auto', p: 2 }}>
                {error && <Alert severity="error" sx={{ mb: 1 }}>{error}</Alert>}
                <Outlet />
            </Box>
        </Box>
    );
};

export default PlanLayout;
