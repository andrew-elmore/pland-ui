import { test, expect } from '@playwright/test';
import { loginOrRegister } from '../flows/auth.js';
import { createPlan } from '../flows/plan.js';

const timestamp = () => Date.now();

test.describe('Home', () => {
    test('TC-11: empty plan list and first plan creation', async ({ page }) => {
        const ts = timestamp();
        await loginOrRegister(page, {
            firstName: 'Empty',
            lastName: 'Plans',
            email: `empty-plans-${ts}@e2e.local`,
            password: 'Password123!',
        });

        await expect(page.getByText('My Plans')).toBeVisible({ timeout: 5000 });
        await expect(page.getByRole('button', { name: 'New Plan' })).toBeVisible({ timeout: 5000 });
        await expect(page.getByText("You don't have any plans yet.")).toBeVisible({ timeout: 5000 });
        await expect(page.getByRole('button', { name: 'Create your first plan' })).toBeVisible({ timeout: 5000 });

        await createPlan(page, { name: 'Weekend Trip', description: 'Beach weekend' });

        await expect(page.getByText('Weekend Trip')).toBeVisible({ timeout: 5000 });
    });

    test('TC-12: plan list and navigation', async ({ page }) => {
        const ts = timestamp();
        await loginOrRegister(page, {
            firstName: 'List',
            lastName: 'Nav',
            email: `list-nav-${ts}@e2e.local`,
            password: 'Password123!',
        });

        await createPlan(page, { name: `Alpha Trip ${ts}`, description: 'First plan' });
        await createPlan(page, { name: `Beta Trip ${ts}`, description: 'Second plan' });

        await expect(page.getByText(`Alpha Trip ${ts}`)).toBeVisible({ timeout: 5000 });
        await expect(page.getByText(`Beta Trip ${ts}`)).toBeVisible({ timeout: 5000 });

        await page.getByText(`Alpha Trip ${ts}`).click();
        await expect(page).toHaveURL(/\/plans\//, { timeout: 5000 });
        await expect(page.getByText(`Alpha Trip ${ts}`)).toBeVisible({ timeout: 5000 });
    });
});
