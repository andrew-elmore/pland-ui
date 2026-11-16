import { test, expect } from '@playwright/test';
import { loginOrRegister } from '../flows/auth.js';
import pause from '../utils/pause.js';

const MODE_STORAGE_KEY = 'pland-mode';

test.describe('Theme', () => {
    test('TC-75: light, dark and system mode persist and follow the OS', async ({ page }) => {
        await page.emulateMedia({ colorScheme: 'light' });
        await loginOrRegister(page, {
            firstName: 'Theme',
            lastName: 'Mode',
            email: `theme-mode-${Date.now()}@e2e.local`,
        });

        const html = page.locator('html');
        await expect(page.getByRole('button', { name: 'Theme: System' })).toBeVisible({ timeout: 3000 });
        await expect(html).toHaveClass(/\blight\b/);

        await page.getByRole('button', { name: 'Theme: System' }).click();
        await pause(300);
        await page.getByRole('menuitemradio', { name: 'Dark' }).click();
        await pause(400);
        await expect(page.getByRole('button', { name: 'Theme: Dark' })).toBeVisible({ timeout: 3000 });
        await expect(html).toHaveClass(/\bdark\b/);
        expect(await page.evaluate((key) => window.localStorage.getItem(key), MODE_STORAGE_KEY)).toBe('dark');

        await page.reload();
        await expect(page.getByRole('button', { name: 'Theme: Dark' })).toBeVisible({ timeout: 10000 });
        await expect(html).toHaveClass(/\bdark\b/);

        await page.getByRole('button', { name: 'Theme: Dark' }).click();
        await pause(300);
        await page.getByRole('menuitemradio', { name: 'System' }).click();
        await pause(400);
        await expect(page.getByRole('button', { name: 'Theme: System' })).toBeVisible({ timeout: 3000 });
        await expect(html).toHaveClass(/\blight\b/);
        expect(await page.evaluate((key) => window.localStorage.getItem(key), MODE_STORAGE_KEY)).toBe('system');

        await page.emulateMedia({ colorScheme: 'dark' });
        await expect(html).toHaveClass(/\bdark\b/, { timeout: 3000 });

        await page.emulateMedia({ colorScheme: 'light' });
        await expect(html).toHaveClass(/\blight\b/, { timeout: 3000 });
    });
});
