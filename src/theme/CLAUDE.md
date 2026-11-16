# Theme Standards

Conventions for all code in `src/theme/`.

## Theme structure

The theme is defined using MUI's `createTheme` with a `themeOptions` object. The app supports light and dark mode, so the palette lives under `colorSchemes`, and `cssVariables` switches schemes with a class (`.light` / `.dark`) on `<html>`:

```javascript
import { createTheme } from '@mui/material/styles';

export const COLOR_SCHEME_SELECTOR = 'class';
export const MODE_STORAGE_KEY = 'pland-mode';
export const COLOR_SCHEME_STORAGE_KEY = 'pland-color-scheme';
export const DEFAULT_MODE = 'system';

export const themeOptions = {
    cssVariables: { colorSchemeSelector: COLOR_SCHEME_SELECTOR },
    colorSchemes: {
        light: { palette: lightPalette },
        dark: { palette: darkPalette },
    },
    typography: { ... },
    shape: { ... },
    spacing: ...,
    components: { ... },
};

const theme = createTheme(themeOptions);
export default theme;
```

Export both `themeOptions` (for Storybook and testing) and the compiled `theme` as default. Never set `palette.mode`; each scheme gets its mode from its `colorSchemes` key.

## Light and dark mode

- `App.jsx` wraps everything (including `AppProviders`/Clerk) in `ThemeProvider` with `defaultMode={DEFAULT_MODE}`, `modeStorageKey`, `colorSchemeStorageKey` and `noSsr`, so the mode is read synchronously on first render. MUI persists the user's choice (`light`, `dark` or `system`) in `localStorage[MODE_STORAGE_KEY]`; `system` follows `prefers-color-scheme` live.
- `index.html` has an inline `pland-color-scheme-init` script that applies the same class to `<html>` before the bundle loads, plus `html.light` / `html.dark` background rules, so there is no wrong-theme flash. It must read `MODE_STORAGE_KEY` and its background colors must equal each scheme's `background.default`; `theme.test.js` enforces both. Update them together.
- The Light / Dark / System control is `components/layout/ColorModeMenu.jsx` in the app bar. It uses `useColorScheme()`.
- Every color a component uses must come from the palette, so it works in both schemes. Add any new color to **both** palettes. Text colors and `contrastText` must meet WCAG AA (4.5:1) against `background.default` and `background.paper`; `theme.test.js` checks this for every intent.
- Where a token path can't be used (gradients, shadows), use an `sx` callback with `theme.vars`, e.g. ``boxShadow: (theme) => `0 0 8px 2px rgba(${theme.vars.palette.primary.mainChannel} / 0.4)` ``.
- Third-party widgets that need a concrete scheme (Google Maps `colorScheme`) read `useColorScheme().colorScheme` (`'light'` or `'dark'`).

## Clerk appearance

`clerkAppearance.js` exports `clerkAppearanceFor(colorScheme)`, which returns a stable appearance object per scheme built from `theme.colorSchemes[scheme].palette`. Dark uses Clerk's prebuilt `dark` theme from `@clerk/ui/themes` via the Core 3 `appearance.theme` prop, with the palette as `variables` on top. Every Clerk color, including `colorBorder` (`grey[400]` light, `grey[700]` dark) and `colorModalBackdrop` (`backdrop.main`), comes from the scheme's palette; never put color literals in `clerkAppearance.js`. `AppProviders.jsx` passes `clerkAppearanceFor(useColorScheme().colorScheme)` to `ClerkProvider`, so Clerk switches live. Style Clerk only through appearance variables/themes, never CSS overrides.

## Palette definition

Define all palette entries with `light`, `main`, `dark`, and `contrastText`, once per scheme:

```javascript
const lightPalette = {
    primary: {
        light: '#5a8a4a',
        main: '#2e7d32',
        dark: '#1b5e20',
        contrastText: '#ffffff',
    },
    secondary: { ... },
    error: { ... },
    warning: { ... },
    info: { ... },
    success: { ... },
    background: { default: '#f5f7f4', paper: '#ffffff' },
};
```

Custom palette keys (e.g., `scrim`, `backdrop`, `tertiary`) are added at the same level as standard keys, in both palettes:

```javascript
scrim: {
    main: 'rgba(0, 0, 0, 0.8)',
    contrastText: '#ffffff',
},
backdrop: {
    main: 'rgba(0, 0, 0, 0.8)',
},
```

`scrim` is the in-page loading overlay; `backdrop` is the dimming behind modals (used for Clerk's `colorModalBackdrop`).

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

Use `useTheme()` only for breakpoints or transitions — never for colors or spacing (with CSS variables, `useTheme().palette` is always the light scheme):

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
