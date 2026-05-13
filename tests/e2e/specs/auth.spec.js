import { test, expect } from '@playwright/test';
import { loginOrRegister } from '../flows/auth.js';
import RegisterFormComponent from '../components/form/RegisterForm.component.js';
import LoginFormComponent from '../components/form/LoginForm.component.js';

const timestamp = () => Date.now();

test.describe('Auth', () => {
    test('TC-01: unauthenticated home and app bar', async ({ page }) => {
        await page.goto('/');
        await expect(page.getByText('Pland')).toBeVisible({ timeout: 5000 });
        await expect(page.getByRole('button', { name: 'Login' })).toBeVisible({ timeout: 5000 });
        await expect(page.getByRole('button', { name: 'Logout' })).not.toBeVisible();
        await expect(page.getByText('Welcome to Pland')).toBeVisible({ timeout: 5000 });
        await expect(page.getByText('Sign in to start creating plans.')).toBeVisible({ timeout: 5000 });
    });

    test('TC-02: registration — validation errors', async ({ page }) => {
        await page.goto('/register');
        const form = RegisterFormComponent(page);
        await form.submit();

        await expect(page.getByText('First name is required')).toBeVisible({ timeout: 5000 });
        await expect(page.getByText('Last name is required')).toBeVisible({ timeout: 5000 });
        await expect(page.getByText('Email is required')).toBeVisible({ timeout: 5000 });
        await expect(page.getByText('Password is required')).toBeVisible({ timeout: 5000 });

        await form.fields.firstName.setValue('Alice');
        await expect(page.getByText('First name is required')).not.toBeVisible();
    });

    test('TC-03: registration — happy path', async ({ page }) => {
        const ts = timestamp();
        await page.goto('/register');
        const form = RegisterFormComponent(page);
        await form.fill({
            firstName: 'Reg',
            lastName: 'Happy',
            email: `reg-happy-${ts}@e2e.local`,
            password: 'Password123!',
        });
        await form.submit();

        await expect(page.getByRole('button', { name: 'Creating account...' })).toBeVisible();
        await expect(page.getByText('My Plans')).toBeVisible({ timeout: 10000 });
        await expect(page.getByText('Reg Happy')).toBeVisible({ timeout: 5000 });
        await expect(page.getByRole('button', { name: 'Logout' })).toBeVisible({ timeout: 5000 });
    });

    test('TC-04: registration — duplicate email', async ({ page }) => {
        const ts = timestamp();
        const email = `dup-${ts}@e2e.local`;

        await page.goto('/register');
        const form = RegisterFormComponent(page);
        await form.fillAndSubmit({
            firstName: 'Alice',
            lastName: 'Dup',
            email,
            password: 'Password123!',
        });
        await expect(page.getByText('My Plans')).toBeVisible({ timeout: 10000 });

        await page.getByRole('button', { name: 'Logout' }).click();
        await expect(page.getByText('Welcome to Pland')).toBeVisible({ timeout: 5000 });

        await page.goto('/register');
        const form2 = RegisterFormComponent(page);
        await form2.fillAndSubmit({
            firstName: 'Alice',
            lastName: 'Dup',
            email,
            password: 'Password123!',
        });

        await expect(page.locator('[role="alert"]').filter({ hasText: /email already in use/i })).toBeVisible({ timeout: 5000 });
    });

    test('TC-05: login — validation errors', async ({ page }) => {
        await page.goto('/login');
        const form = LoginFormComponent(page);
        await form.submit();

        await expect(page.getByText('Email is required')).toBeVisible({ timeout: 5000 });
        await expect(page.getByText('Password is required')).toBeVisible({ timeout: 5000 });
    });

    test('TC-06: login — wrong credentials', async ({ page }) => {
        await page.goto('/login');
        const form = LoginFormComponent(page);
        await form.fillAndSubmit({
            email: 'nonexistent@e2e.local',
            password: 'WrongPassword123!',
        });

        await expect(page.locator('[role="alert"]')).toBeVisible({ timeout: 5000 });
    });

    test('TC-07: login — happy path', async ({ page }) => {
        const ts = timestamp();
        const user = {
            firstName: 'Login',
            lastName: 'Happy',
            email: `login-happy-${ts}@e2e.local`,
            password: 'Password123!',
        };

        await page.goto('/register');
        const regForm = RegisterFormComponent(page);
        await regForm.fillAndSubmit(user);
        await expect(page.getByText('My Plans')).toBeVisible({ timeout: 10000 });

        await page.getByRole('button', { name: 'Logout' }).click();
        await expect(page.getByText('Welcome to Pland')).toBeVisible({ timeout: 5000 });

        await page.goto('/login');
        const loginForm = LoginFormComponent(page);
        await loginForm.fillAndSubmit({ email: user.email, password: user.password });
        await expect(page.getByText('My Plans')).toBeVisible({ timeout: 10000 });
    });

    test('TC-08: session restore', async ({ page }) => {
        await loginOrRegister(page);
        await expect(page.getByText('My Plans')).toBeVisible({ timeout: 5000 });

        await page.reload();
        await expect(page.getByText('My Plans')).toBeVisible({ timeout: 10000 });
    });

    test('TC-09: logout', async ({ page }) => {
        await loginOrRegister(page);
        await expect(page.getByText('My Plans')).toBeVisible({ timeout: 5000 });

        await page.getByRole('button', { name: 'Logout' }).click();
        await expect(page.getByText('Welcome to Pland')).toBeVisible({ timeout: 5000 });
        await expect(page.getByRole('button', { name: 'Login' })).toBeVisible({ timeout: 5000 });
    });

    test('TC-10: authenticated redirect from auth pages', async ({ page }) => {
        await loginOrRegister(page);
        await expect(page.getByText('My Plans')).toBeVisible({ timeout: 5000 });

        await page.goto('/login');
        await expect(page.getByText('My Plans')).toBeVisible({ timeout: 5000 });

        await page.goto('/register');
        await expect(page.getByText('My Plans')).toBeVisible({ timeout: 5000 });
    });

    test('TC-65: session restore — expired token', async ({ page }) => {
        await page.goto('/');
        await page.evaluate(() => {
            localStorage.setItem('pland_token', 'invalid-expired-token-abc123');
        });
        await page.goto('/');
        await expect(page.getByText('Welcome to Pland')).toBeVisible({ timeout: 5000 });
    });
});
