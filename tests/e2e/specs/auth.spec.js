import { test, expect } from '@playwright/test';
import { loginOrRegister } from '../flows/auth.js';
import { createPlan } from '../flows/plan.js';

const timestamp = () => Date.now();

test.describe('Auth', () => {
    test('TC-07: dev auth identity in home and app bar', async ({ page }) => {
        await loginOrRegister(page);

        await expect(page.getByRole('link', { name: 'Pland' })).toBeVisible({ timeout: 5000 });
        await expect(page.getByText('Test User')).toBeVisible({ timeout: 5000 });
        await expect(page.getByText('My Plans')).toBeVisible({ timeout: 5000 });
        await expect(page.getByText('Welcome to Pland')).not.toBeVisible();
    });

    test('TC-08: session restore', async ({ page }) => {
        await loginOrRegister(page);
        await expect(page.getByText('My Plans')).toBeVisible({ timeout: 5000 });

        await page.reload();
        await expect(page.getByText('My Plans')).toBeVisible({ timeout: 10000 });
    });

    test('TC-09: plans are scoped to the signed-in user', async ({ page }) => {
        const ts = timestamp();
        const userA = { firstName: 'Owner', lastName: 'A', email: `owner-a-${ts}@e2e.local` };
        const userB = { firstName: 'Owner', lastName: 'B', email: `owner-b-${ts}@e2e.local` };
        const planName = `Scoped Plan ${ts}`;

        await loginOrRegister(page, userA);
        await createPlan(page, { name: planName, description: 'Owned by A' });
        await expect(page.getByText(planName)).toBeVisible({ timeout: 5000 });

        await loginOrRegister(page, userB);
        await expect(page.getByText('Owner B')).toBeVisible({ timeout: 5000 });
        await expect(page.getByText('You don\'t have any plans yet.')).toBeVisible({ timeout: 5000 });
        await expect(page.getByText(planName)).not.toBeVisible();

        await loginOrRegister(page, userA);
        await expect(page.getByText(planName)).toBeVisible({ timeout: 5000 });
    });

    test('TC-10: old auth routes redirect home', async ({ page }) => {
        await loginOrRegister(page);

        await page.goto('/login');
        await expect(page).toHaveURL(/\/$/, { timeout: 5000 });
        await expect(page.getByText('My Plans')).toBeVisible({ timeout: 5000 });

        await page.goto('/register');
        await expect(page).toHaveURL(/\/$/, { timeout: 5000 });
        await expect(page.getByText('My Plans')).toBeVisible({ timeout: 5000 });
    });
});
