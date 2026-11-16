import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import html from '../../index.html?raw';
import theme, { COLOR_SCHEME_SELECTOR, DEFAULT_MODE, MODE_STORAGE_KEY } from './theme';

const parseColor = (value) => {
    const short = value.match(/^#([0-9a-f])([0-9a-f])([0-9a-f])$/i);
    const hex = short ? [value, short.slice(1).map((c) => c + c).join('')] : value.match(/^#([0-9a-f]{6})$/i);
    if (hex) {
        const n = parseInt(hex[1], 16);
        return { r: (n >> 16) & 255, g: (n >> 8) & 255, b: n & 255, a: 1 };
    }
    const rgba = value.match(/^rgba?\(([^)]+)\)$/);
    const [r, g, b, a = 1] = rgba[1].split(',').map(Number);
    return { r, g, b, a };
};

const over = (fg, bg) => ({
    r: fg.r * fg.a + bg.r * (1 - fg.a),
    g: fg.g * fg.a + bg.g * (1 - fg.a),
    b: fg.b * fg.a + bg.b * (1 - fg.a),
});

const luminance = ({ r, g, b }) => {
    const [lr, lg, lb] = [r, g, b].map((c) => {
        const v = c / 255;
        return v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4;
    });
    return 0.2126 * lr + 0.7152 * lg + 0.0722 * lb;
};

const contrast = (fgValue, bgValue) => {
    const bg = parseColor(bgValue);
    const fg = over(parseColor(fgValue), bg);
    const [hi, lo] = [luminance(fg), luminance(bg)].sort((x, y) => y - x);
    return (hi + 0.05) / (lo + 0.05);
};

const AA = 4.5;
const SCHEMES = ['light', 'dark'];
const INTENTS = ['primary', 'secondary', 'error', 'warning', 'info', 'success'];

describe('theme color schemes', () => {
    it('defines light and dark schemes switched by a class on <html>', () => {
        expect(Object.keys(theme.colorSchemes).sort()).toEqual(['dark', 'light']);
        expect(theme.colorSchemes.light.palette.mode).toBe('light');
        expect(theme.colorSchemes.dark.palette.mode).toBe('dark');
        expect(COLOR_SCHEME_SELECTOR).toBe('class');
        expect(DEFAULT_MODE).toBe('system');
    });

    it('keeps the brand green as the light primary color', () => {
        expect(theme.colorSchemes.light.palette.primary.main).toBe('#2e7d32');
    });

    describe.each(SCHEMES)('%s scheme text contrast (WCAG AA)', (scheme) => {
        const { palette } = theme.colorSchemes[scheme];
        const backgrounds = [palette.background.default, palette.background.paper];

        it.each(['primary', 'secondary'])('text.%s is readable on default and paper backgrounds', (key) => {
            backgrounds.forEach((bg) => expect(contrast(palette.text[key], bg)).toBeGreaterThanOrEqual(AA));
        });

        it.each(INTENTS)('%s.main is readable as text on default and paper backgrounds', (intent) => {
            backgrounds.forEach((bg) => expect(contrast(palette[intent].main, bg)).toBeGreaterThanOrEqual(AA));
        });

        it.each(INTENTS)('%s.contrastText is readable on %s.main', (intent) => {
            expect(contrast(palette[intent].contrastText, palette[intent].main)).toBeGreaterThanOrEqual(AA);
        });

        it('loading scrim text is readable on the scrim', () => {
            const scrimOverPaper = over(parseColor(palette.scrim.main), parseColor(palette.background.default));
            const scrimHex = `rgb(${scrimOverPaper.r}, ${scrimOverPaper.g}, ${scrimOverPaper.b})`;
            expect(contrast(palette.scrim.contrastText, scrimHex)).toBeGreaterThanOrEqual(AA);
        });
    });
});

describe('index.html pre-paint color scheme script', () => {
    const script = html.match(/<script id="pland-color-scheme-init">([\s\S]*?)<\/script>/)[1];
    let prefersDark;

    const run = () => {
        document.documentElement.className = '';
        new Function(script)();
        return document.documentElement.className;
    };

    beforeEach(() => {
        prefersDark = false;
        vi.stubGlobal('matchMedia', (query) => ({ matches: query === '(prefers-color-scheme: dark)' && prefersDark }));
        localStorage.clear();
    });

    afterEach(() => {
        vi.unstubAllGlobals();
        vi.restoreAllMocks();
        localStorage.clear();
        document.documentElement.className = '';
    });

    it('reads the same storage key the ThemeProvider writes', () => {
        expect(script).toContain(`'${MODE_STORAGE_KEY}'`);
    });

    it('follows the operating system when no mode is stored', () => {
        expect(run()).toBe('light');
        prefersDark = true;
        expect(run()).toBe('dark');
    });

    it('uses a stored light or dark choice over the operating system', () => {
        prefersDark = true;
        localStorage.setItem(MODE_STORAGE_KEY, 'light');
        expect(run()).toBe('light');
        prefersDark = false;
        localStorage.setItem(MODE_STORAGE_KEY, 'dark');
        expect(run()).toBe('dark');
    });

    it('follows the operating system for a stored system choice', () => {
        prefersDark = true;
        localStorage.setItem(MODE_STORAGE_KEY, 'system');
        expect(run()).toBe('dark');
    });

    it('falls back to the operating system when storage throws', () => {
        prefersDark = true;
        vi.spyOn(window.Storage.prototype, 'getItem').mockImplementation(() => {
            throw new Error('blocked');
        });
        expect(run()).toBe('dark');
    });

    it.each(SCHEMES)('paints the %s page background from the theme before React mounts', (scheme) => {
        const rule = html.match(new RegExp(`html\\.${scheme} \\{[^}]*background-color: (#[0-9a-f]{6})`, 'i'));
        expect(rule[1].toLowerCase()).toBe(theme.colorSchemes[scheme].palette.background.default.toLowerCase());
    });
});
