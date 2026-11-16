import { dark } from '@clerk/ui/themes';
import { getOverlayAlpha, lighten } from '@mui/material/styles';
import theme from './theme';

const { colorSchemes, typography, shape } = theme;

const SCHEME_EXTRAS = {
    light: {
        colorBackground: colorSchemes.light.palette.background.paper,
        colorNeutral: colorSchemes.light.palette.common.black,
        colorBorder: colorSchemes.light.palette.grey[400],
        colorModalBackdrop: colorSchemes.light.palette.backdrop.main,
    },
    dark: {
        theme: dark,
        colorBackground: lighten(colorSchemes.dark.palette.background.paper, getOverlayAlpha(1)),
        colorNeutral: colorSchemes.dark.palette.common.white,
        colorBorder: colorSchemes.dark.palette.grey[700],
        colorModalBackdrop: colorSchemes.dark.palette.backdrop.main,
    },
};

const buildAppearance = (scheme) => {
    const { palette } = colorSchemes[scheme];
    const extras = SCHEME_EXTRAS[scheme];
    return {
        ...(extras.theme && { theme: extras.theme }),
        variables: {
            colorPrimary: palette.primary.main,
            colorPrimaryForeground: palette.primary.contrastText,
            colorDanger: palette.error.main,
            colorSuccess: palette.success.main,
            colorWarning: palette.warning.main,
            colorBackground: extras.colorBackground,
            colorForeground: palette.text.primary,
            colorMutedForeground: palette.text.secondary,
            colorNeutral: extras.colorNeutral,
            colorInput: palette.background.default,
            colorInputForeground: palette.text.primary,
            colorBorder: extras.colorBorder,
            colorModalBackdrop: extras.colorModalBackdrop,
            fontFamily: typography.fontFamily,
            borderRadius: `${shape.borderRadius}px`,
        },
    };
};

const APPEARANCES = {
    light: buildAppearance('light'),
    dark: buildAppearance('dark'),
};

/**
 * Clerk appearance for the active MUI color scheme, built from that scheme's palette so Clerk's
 * sign-in, sign-up, UserButton and account components match the app. Dark adds Clerk's prebuilt
 * dark theme (`appearance.theme`, Core 3) under the palette variables, and raises Clerk's card one
 * MUI elevation step above the page so inputs (page background) stand out from the card.
 * @param {'light'|'dark'|undefined} colorScheme The resolved MUI color scheme; anything else is light.
 * @returns {object} A stable appearance object for ClerkProvider.
 */
export default function clerkAppearanceFor(colorScheme) {
    return APPEARANCES[colorScheme === 'dark' ? 'dark' : 'light'];
}
