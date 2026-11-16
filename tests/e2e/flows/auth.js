import { expect } from '@playwright/test';

const DEV_USER_STORAGE_KEY = 'pland_dev_user';

/** @type {{ firstName: string, lastName: string, email: string }} */
const defaultUser = {
    firstName: 'Test',
    lastName: 'User',
    email: 'test@e2e.local',
};

/**
 * Signs the page in as a dev-auth user and lands on home. E2E runs use
 * `VITE_AUTH_MODE=dev` (UI) and `AUTH_MODE=dev` (API), so the identity is the
 * `pland_dev_user` localStorage entry sent to the API in the `X-Dev-User`
 * header. The user id is derived from the email, so the same email is the same
 * account across calls. Asserts that "My Plans" is visible before returning.
 *
 * @param {import('@playwright/test').Page} page
 * @param {{ firstName?: string, lastName?: string, email?: string }} [user=defaultUser]
 */
export async function loginOrRegister(page, user = defaultUser) {
    const identity = {
        id: `dev_${user.email}`,
        email: user.email,
        firstName: user.firstName ?? '',
        lastName: user.lastName ?? '',
    };
    await page.addInitScript(
        ([key, value]) => window.localStorage.setItem(key, value),
        [DEV_USER_STORAGE_KEY, JSON.stringify(identity)],
    );
    await page.goto('/');
    await expect(page.getByText('My Plans')).toBeVisible({ timeout: 10000 });
}
