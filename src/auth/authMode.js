const AUTH_MODES = new Set(['clerk', 'dev']);

export function authMode() {
    const mode = import.meta.env.VITE_AUTH_MODE || 'clerk';
    if (!AUTH_MODES.has(mode)) {
        throw new Error(`Invalid VITE_AUTH_MODE "${mode}". Expected "clerk" or "dev".`);
    }
    if (import.meta.env.PROD && mode === 'dev') {
        throw new Error('VITE_AUTH_MODE=dev is forbidden in production builds.');
    }
    return mode;
}

export function isDevAuth() {
    return authMode() === 'dev';
}
