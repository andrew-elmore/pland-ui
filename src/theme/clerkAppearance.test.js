import { describe, it, expect } from 'vitest';
import { dark } from '@clerk/ui/themes';
import clerkAppearanceFor from './clerkAppearance';
import theme from './theme';

describe('clerkAppearanceFor', () => {
    it('uses Clerk\'s prebuilt dark theme only for the dark scheme', () => {
        expect(clerkAppearanceFor('dark').theme).toBe(dark);
        expect(clerkAppearanceFor('light')).not.toHaveProperty('theme');
    });

    it.each(['light', 'dark'])('builds %s variables from that scheme\'s palette', (scheme) => {
        const { palette } = theme.colorSchemes[scheme];
        expect(clerkAppearanceFor(scheme).variables).toMatchObject({
            colorPrimary: palette.primary.main,
            colorPrimaryForeground: palette.primary.contrastText,
            colorDanger: palette.error.main,
            colorForeground: palette.text.primary,
            colorMutedForeground: palette.text.secondary,
            colorInput: palette.background.default,
            colorInputForeground: palette.text.primary,
        });
    });

    it.each([['light', 400], ['dark', 700]])('takes %s border and backdrop from the palette', (scheme, greyShade) => {
        const { palette } = theme.colorSchemes[scheme];
        expect(clerkAppearanceFor(scheme).variables).toMatchObject({
            colorBorder: palette.grey[greyShade],
            colorModalBackdrop: palette.backdrop.main,
        });
    });

    it('keeps Clerk inputs distinct from the Clerk card in both schemes', () => {
        ['light', 'dark'].forEach((scheme) => {
            const { colorBackground, colorInput } = clerkAppearanceFor(scheme).variables;
            expect(colorBackground).not.toBe(colorInput);
        });
    });

    it('returns a stable object per scheme so ClerkProvider only updates on a real change', () => {
        expect(clerkAppearanceFor('dark')).toBe(clerkAppearanceFor('dark'));
        expect(clerkAppearanceFor('light')).not.toBe(clerkAppearanceFor('dark'));
    });

    it('falls back to light before the color scheme is known', () => {
        expect(clerkAppearanceFor(undefined)).toBe(clerkAppearanceFor('light'));
    });
});
