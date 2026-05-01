# Theme Standards

Conventions for all code in `src/theme/`.

## Theme structure

The theme is defined using MUI's `createTheme` with a `themeOptions` object:

```javascript
import { createTheme } from '@mui/material/styles';

export const themeOptions = {
    palette: { ... },
    typography: { ... },
    shape: { ... },
    spacing: ...,
    components: { ... },
};

const theme = createTheme(themeOptions);
export default theme;
```

Export both `themeOptions` (for Storybook and testing) and the compiled `theme` as default.

## Palette definition

Define all palette entries with `light`, `main`, `dark`, and `contrastText`:

```javascript
palette: {
    mode: 'dark',
    primary: {
        light: '#c34cd7',
        main: '#9c27b0',
        dark: '#641971',
        contrastText: '#ffffff',
    },
    secondary: { ... },
    error: { ... },
    warning: { ... },
    info: { ... },
    success: { ... },
},
```

Custom palette keys (e.g., `tertiary`, `accent`) are added at the same level as standard keys:

```javascript
palette: {
    primary: { ... },
    tertiary: {
        main: '#2B3E1D',
        dark: '#1A2611',
        contrastText: '#FEFAD6',
    },
},
```

Custom action tokens for table styling:

```javascript
action: {
    tableRowAlternate: 'rgba(145,172,102, 0.12)',
},
```

## Typography

Define `fontFamily` and `fontSize` at the root. Override individual variants for heading vs body font families:

```javascript
typography: {
    fontSize: 16,
    fontFamily: "'Poppins', sans-serif",
    h1: { fontFamily: "'Serif Font', serif", fontSize: '2.5rem', fontWeight: 600 },
    h2: { fontFamily: "'Serif Font', serif", fontSize: '2rem' },
    button: { textTransform: 'capitalize' },
},
```

## Component overrides

Use the `components` key for global MUI overrides:

```javascript
components: {
    MuiButton: {
        styleOverrides: {
            root: { borderRadius: 8 },
            contained: { boxShadow: 'none' },
        },
    },
    MuiPaper: {
        defaultProps: { elevation: 0 },
    },
    MuiTextField: {
        styleOverrides: {
            root: { '& .MuiOutlinedInput-root': { ... } },
        },
    },
},
```

## Accessing theme in components

Always use string token paths in `sx` instead of direct `theme` access:

```javascript
<Box sx={{ color: 'primary.main', backgroundColor: 'background.paper' }}>
```

Use `useTheme()` only for breakpoints or transitions — never for colors or spacing:

```javascript
const theme = useTheme();
const isMobile = useMediaQuery(theme.breakpoints.down('md'));
```

## Charts theme

If using charts (Recharts, etc.), create a separate `chartsTheme.js` that mirrors the MUI palette:

```javascript
export const chartColors = {
    primary: '#9c27b0',
    secondary: '#64c064',
};

export const chartColorPalette = ['#9c27b0', '#64c064', '#d2504b', '#eead51'];

export const getChartColor = (index) => chartColorPalette[index % chartColorPalette.length];

export const chartStyles = {
    fontFamily: "'Poppins', sans-serif",
    fontSize: 12,
};
```
