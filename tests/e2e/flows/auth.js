import { expect } from '@playwright/test';
import LoginFormComponent from '../components/form/LoginForm.component.js';
import RegisterFormComponent from '../components/form/RegisterForm.component.js';

/** @type {{ firstName: string, lastName: string, email: string, password: string }} */
const defaultUser = {
    firstName: 'Test',
    lastName: 'User',
    email: 'test@e2e.local',
    password: 'Password123!',
};

/**
 * Authenticates a user by attempting login first, then falling back to
 * registration if the account doesn't exist. Asserts that "My Plans" is
 * visible before returning, confirming a successful auth state.
 *
 * Uses a fresh e2e database per run, so the first call in a test suite
 * will always register. Subsequent calls with the same credentials will
 * log in directly.
 *
 * @param {import('@playwright/test').Page} page
 * @param {{ firstName?: string, lastName?: string, email?: string, password?: string }} [user=defaultUser]
 */
export async function loginOrRegister(page, user = defaultUser) {
    await page.goto('/login');
    const loginForm = LoginFormComponent(page);
    await loginForm.fillAndSubmit({ email: user.email, password: user.password });

    const loggedIn = await page.getByText('My Plans').isVisible({ timeout: 3000 }).catch(() => false);

    if (!loggedIn) {
        await page.goto('/register');
        const registerForm = RegisterFormComponent(page);
        await registerForm.fillAndSubmit(user);
    }

    await expect(page.getByText('My Plans')).toBeVisible({ timeout: 10000 });
}
