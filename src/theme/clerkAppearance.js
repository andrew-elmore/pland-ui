import theme from './theme';

const { palette, typography, shape } = theme;

/**
 * Clerk appearance built from the MUI theme so Clerk's sign-in, sign-up and user
 * profile components match the app. Uses Clerk's appearance variables only.
 */
const clerkAppearance = {
    variables: {
        colorPrimary: palette.primary.main,
        colorPrimaryForeground: palette.primary.contrastText,
        colorDanger: palette.error.main,
        colorSuccess: palette.success.main,
        colorWarning: palette.warning.main,
        colorBackground: palette.background.paper,
        colorForeground: palette.text.primary,
        colorMutedForeground: palette.text.secondary,
        colorNeutral: palette.common.white,
        colorInput: palette.background.default,
        colorInputForeground: palette.text.primary,
        colorBorder: 'rgba(255, 255, 255, 0.23)',
        colorModalBackdrop: 'rgba(0, 0, 0, 0.8)',
        fontFamily: typography.fontFamily,
        borderRadius: `${shape.borderRadius}px`,
    },
};

export default clerkAppearance;
