export const DEV_USER_STORAGE_KEY = 'pland_dev_user';

const DEFAULT_DEV_USER = {
    id: 'dev_user_1',
    email: 'dev@pland.local',
    firstName: 'Dev',
    lastName: 'User',
};

/**
 * The identity used when VITE_AUTH_MODE=dev. Local QA and e2e tests can switch
 * users by writing a `{ id, email, firstName, lastName }` object to localStorage.
 * @returns {{ id: string, email: string, firstName: string, lastName: string }}
 */
export function devUser() {
    const stored = localStorage.getItem(DEV_USER_STORAGE_KEY);
    return stored ? JSON.parse(stored) : DEFAULT_DEV_USER;
}
