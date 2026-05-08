import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Dialog, DialogTitle, DialogContent, DialogActions, IconButton, useMediaQuery } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import CloseIcon from '@mui/icons-material/Close';
import { actions as uiActions, selectors as uiSelectors } from '../../store/ui';

const AppDialog = ({ id, title, maxWidth = 'sm', children, actions, onClose }) => {
    const dispatch = useDispatch();
    const openDialog = useSelector(uiSelectors.openDialog);
    const isOpen = openDialog === id;
    const theme = useTheme();
    const isPhone = useMediaQuery(theme.breakpoints.down('sm'));

    const handleClose = () => {
        dispatch(uiActions.closeDialog());
        if (onClose) onClose();
    };

    return (
        <Dialog open={isOpen} onClose={handleClose} maxWidth={maxWidth} fullWidth fullScreen={isPhone} disableRestoreFocus>
            <DialogTitle sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', pb: 1 }}>
                {title}
                <IconButton onClick={handleClose} edge="end" size="small">
                    <CloseIcon fontSize="small" />
                </IconButton>
            </DialogTitle>
            <DialogContent sx={{ pt: 1 }}>
                {children}
            </DialogContent>
            {actions && (
                <DialogActions sx={{ px: 2, pb: 1.5 }}>
                    {actions}
                </DialogActions>
            )}
        </Dialog>
    );
};

export default AppDialog;
