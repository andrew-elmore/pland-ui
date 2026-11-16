import React, { useState } from 'react';
import { IconButton, ListItemIcon, ListItemText, Menu, MenuItem, Tooltip } from '@mui/material';
import { useColorScheme } from '@mui/material/styles';
import CheckIcon from '@mui/icons-material/Check';
import DarkModeIcon from '@mui/icons-material/DarkModeOutlined';
import LightModeIcon from '@mui/icons-material/LightModeOutlined';
import SystemModeIcon from '@mui/icons-material/SettingsBrightnessOutlined';

const MODES = [
    { value: 'light', label: 'Light', Icon: LightModeIcon },
    { value: 'dark', label: 'Dark', Icon: DarkModeIcon },
    { value: 'system', label: 'System', Icon: SystemModeIcon },
];

const ColorModeMenu = () => {
    const { mode, setMode } = useColorScheme();
    const [anchorEl, setAnchorEl] = useState(null);
    const current = MODES.find((m) => m.value === mode) ?? MODES[2];
    const CurrentIcon = current.Icon;

    const handleSelect = (value) => {
        setMode(value);
        setAnchorEl(null);
    };

    return (
        <>
            <Tooltip title={`Theme: ${current.label}`}>
                <IconButton
                    aria-label={`Theme: ${current.label}`}
                    aria-haspopup="menu"
                    aria-controls={anchorEl ? 'color-mode-menu' : undefined}
                    aria-expanded={anchorEl ? 'true' : undefined}
                    onClick={(e) => setAnchorEl(e.currentTarget)}
                    sx={{ color: 'text.primary', border: '1px solid', borderColor: 'divider' }}
                    size="small"
                >
                    <CurrentIcon fontSize="small" />
                </IconButton>
            </Tooltip>
            <Menu
                id="color-mode-menu"
                anchorEl={anchorEl}
                open={Boolean(anchorEl)}
                onClose={() => setAnchorEl(null)}
                anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
                transformOrigin={{ vertical: 'top', horizontal: 'right' }}
            >
                {MODES.map(({ value, label, Icon }) => (
                    <MenuItem
                        key={value}
                        selected={value === current.value}
                        onClick={() => handleSelect(value)}
                        role="menuitemradio"
                        aria-checked={value === current.value}
                    >
                        <ListItemIcon><Icon fontSize="small" /></ListItemIcon>
                        <ListItemText>{label}</ListItemText>
                        {value === current.value && <CheckIcon fontSize="small" sx={{ ml: 2, color: 'primary.main' }} />}
                    </MenuItem>
                ))}
            </Menu>
        </>
    );
};

export default ColorModeMenu;
