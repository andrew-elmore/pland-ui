import { test, expect } from '@playwright/test';
import { loginAndCreatePlan, navigateToSection } from '../flows/plan.js';
import { loginOrRegister } from '../flows/auth.js';

test.describe('Plan Navigation', () => {
    test('TC-13: sidebar sections cycle through all nav items and back', async ({ page }) => {
        await loginAndCreatePlan(page);

        const sections = ['Participants', 'Locations', 'Groups', 'Times', 'Routes', 'Itineraries'];

        for (const section of sections) {
            await navigateToSection(page, section);
            await expect(page).toHaveURL(new RegExp(section.toLowerCase()), { timeout: 5000 });
            await expect(page.getByText(section)).toBeVisible({ timeout: 5000 });
        }

        await page.getByRole('button', { name: /back/i }).click();
        await expect(page.getByText('My Plans')).toBeVisible({ timeout: 5000 });
    });

    test('TC-66: mobile bottom navigation switches sections', async ({ page }) => {
        await loginAndCreatePlan(page);
        await page.setViewportSize({ width: 375, height: 812 });

        await expect(page.locator('nav')).toBeVisible({ timeout: 5000 });

        await navigateToSection(page, 'Participants');
        await expect(page).toHaveURL(/participants/, { timeout: 5000 });

        await navigateToSection(page, 'Locations');
        await expect(page).toHaveURL(/locations/, { timeout: 5000 });

        await page.getByRole('button', { name: /back/i }).click();
        await expect(page.getByText('My Plans')).toBeVisible({ timeout: 5000 });
    });

    test('TC-67: invalid plan ID shows error', async ({ page }) => {
        await loginOrRegister(page);

        await page.goto('/plans/000000000000000000000000');
        await expect(page.getByText('Plan not found')).toBeVisible({ timeout: 10000 });
    });

    test('TC-68: plan loading completes and shows plan name', async ({ page }) => {
        await loginAndCreatePlan(page);

        await expect(page.getByText('Test Plan')).toBeVisible({ timeout: 10000 });
    });
});
