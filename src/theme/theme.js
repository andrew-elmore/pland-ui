import { createTheme } from '@mui/material/styles';

export const COLOR_SCHEME_SELECTOR = 'class';
export const MODE_STORAGE_KEY = 'pland-mode';
export const COLOR_SCHEME_STORAGE_KEY = 'pland-color-scheme';
export const DEFAULT_MODE = 'system';

const lightPalette = {
    primary: {
        light: '#5a8a4a',
        main: '#2e7d32',
        dark: '#1b5e20',
        contrastText: '#ffffff',
    },
    secondary: {
        light: '#64c064',
        main: '#2e7d32',
        dark: '#1b5e20',
        contrastText: '#ffffff',
    },
    error: {
        light: '#e18c88',
        main: '#c62828',
        dark: '#a72e2a',
        contrastText: '#ffffff',
    },
    warning: {
        light: '#f5ce97',
        main: '#a15c00',
        dark: '#7a4500',
        contrastText: '#ffffff',
    },
    info: {
        light: '#56cbd4',
        main: '#1d6d73',
        dark: '#134a4e',
        contrastText: '#ffffff',
    },
    success: {
        light: '#64c064',
        main: '#2e7d32',
        dark: '#1b5e20',
        contrastText: '#ffffff',
    },
    background: {
        default: '#f5f7f4',
        paper: '#ffffff',
    },
    scrim: {
        main: 'rgba(245, 247, 244, 0.88)',
        contrastText: '#1b5e20',
    },
    backdrop: {
        main: 'rgba(0, 0, 0, 0.5)',
    },
};

const darkPalette = {
    primary: {
        light: '#81c784',
        main: '#66bb6a',
        dark: '#2e7d32',
        contrastText: 'rgba(0, 0, 0, 0.87)',
    },
    secondary: {
        light: '#9ad69a',
        main: '#64c064',
        dark: '#3e993e',
        contrastText: 'rgba(0, 0, 0, 0.87)',
    },
    error: {
        light: '#ef9a9a',
        main: '#e57373',
        dark: '#d2504b',
        contrastText: 'rgba(0, 0, 0, 0.87)',
    },
    warning: {
        light: '#f5ce97',
        main: '#eead51',
        dark: '#dd8a16',
        contrastText: 'rgba(0, 0, 0, 0.87)',
    },
    info: {
        light: '#9be0e5',
        main: '#56cbd4',
        dark: '#2da7b0',
        contrastText: 'rgba(0, 0, 0, 0.87)',
    },
    success: {
        light: '#9ad69a',
        main: '#64c064',
        dark: '#3e993e',
        contrastText: 'rgba(0, 0, 0, 0.87)',
    },
    background: {
        default: '#121212',
        paper: '#121212',
    },
    scrim: {
        main: 'rgba(0, 0, 0, 0.8)',
        contrastText: '#ffffff',
    },
    backdrop: {
        main: 'rgba(0, 0, 0, 0.8)',
    },
};

export const themeOptions = {
    cssVariables: {
        colorSchemeSelector: COLOR_SCHEME_SELECTOR,
    },
    colorSchemes: {
        light: { palette: lightPalette },
        dark: { palette: darkPalette },
    },
    typography: {
        fontSize: 16,
        fontFamily: '\'Poppins\', sans-serif',
    },
    shape: {
        borderRadius: 12,
    },
    spacing: 12,
};

const theme = createTheme(themeOptions);

export default theme;
