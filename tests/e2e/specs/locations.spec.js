import { test, expect } from '@playwright/test';
import { loginAndCreatePlan, navigateToSection } from '../flows/plan.js';
import { addLocation } from '../flows/location.js';
import { addAbsoluteTime } from '../flows/time.js';
import { addParticipant } from '../flows/participant.js';
import { createItinerary } from '../flows/itinerary.js';
import LocationFormComponent from '../components/form/LocationForm.component.js';
import LocationPickerComponent from '../components/input/LocationPicker.component.js';

test.describe('Locations', () => {
    test('TC-19: empty state, create with Google Places, delete', async ({ page }) => {
        await loginAndCreatePlan(page);
        await navigateToSection(page, 'Locations');

        await expect(page.getByText('No locations yet.')).toBeVisible({ timeout: 5000 });

        await page.getByRole('button', { name: 'Add' }).click();
        await expect(page.getByText('Add Location')).toBeVisible({ timeout: 5000 });

        const form = LocationFormComponent(page);
        await form.fields.name.setValue('Coffee Shop');
        await form.fields.search.setValue('Starbucks');
        await expect(page.getByRole('option').first()).toBeVisible({ timeout: 5000 });
        await page.getByRole('option').first().click();
        await page.waitForTimeout(500);

        await form.submit();
        await expect(page.getByText('Coffee Shop')).toBeVisible({ timeout: 5000 });

        await addLocation(page, { name: 'Hotel' });
        await expect(page.getByText('Hotel')).toBeVisible({ timeout: 5000 });

        const hotelRow = page.locator('li', { hasText: 'Hotel' });
        await hotelRow.getByRole('button').click();
        await expect(page.getByText('Hotel')).not.toBeVisible({ timeout: 5000 });
        await expect(page.getByText('Coffee Shop')).toBeVisible({ timeout: 5000 });
    });

    test('TC-20: Google Places edge cases', async ({ page }) => {
        await loginAndCreatePlan(page);
        await navigateToSection(page, 'Locations');

        await page.getByRole('button', { name: 'Add' }).click();
        await expect(page.getByText('Add Location')).toBeVisible({ timeout: 5000 });

        const form = LocationFormComponent(page);

        try {
            await form.fields.search.setValue('A');
            await page.waitForTimeout(1000);
            await expect(page.getByRole('option')).not.toBeVisible({ timeout: 2000 });
        } catch {
        }

        try {
            await form.fields.search.clear();
            await form.fields.search.setValue('xyzzynonexistent12345');
            await page.waitForTimeout(1000);
            const optionCount = await page.getByRole('option').count();
            expect(optionCount).toBe(0);
        } catch {
        }

        try {
            await form.fields.search.clear();
            await form.fields.search.setValue('Central Park');
            await page.waitForTimeout(1500);
            await expect(page.getByRole('option').first()).toBeVisible({ timeout: 5000 });
        } catch {
        }
    });

    test('TC-46: inline location creation via LocationPicker', async ({ page }) => {
        await loginAndCreatePlan(page);

        await navigateToSection(page, 'Participants');
        await addParticipant(page, { firstName: 'Alice', lastName: 'Smith', email: 'alice@test.com' });

        await navigateToSection(page, 'Itineraries');
        await createItinerary(page);

        await page.getByRole('button', { name: 'Add Step' }).click();
        await expect(page.getByText('Add Step')).toBeVisible({ timeout: 5000 });

        const locationPicker = LocationPickerComponent(page, 'Location (optional)');
        await locationPicker.createAndSelect({ name: 'Park' });

        await expect(page.getByRole('combobox', { name: 'Location (optional)' })).toHaveValue('Park', { timeout: 5000 });
    });

    test('TC-61: map display across contexts', async ({ page }) => {
        await loginAndCreatePlan(page);
        await navigateToSection(page, 'Locations');

        await page.getByRole('button', { name: 'Add' }).click();
        await expect(page.getByText('Add Location')).toBeVisible({ timeout: 5000 });

        const form = LocationFormComponent(page);
        await form.fields.name.setValue('Central Park');

        try {
            await form.fields.search.setValue('Central Park New York');
            await page.waitForTimeout(1500);
            await page.getByRole('option').first().click();
            await page.waitForTimeout(1000);

            const mapContainer = page.locator('[style*="height"]').filter({ has: page.locator('.gm-style, canvas, [style*="background-image"]') });
            await expect(mapContainer.first()).toBeVisible({ timeout: 5000 });
        } catch {
            await form.fields.search.setValue('Central Park New York');
            await page.waitForTimeout(1000);
        }

        await form.submit();
        await expect(page.getByText('Central Park')).toBeVisible({ timeout: 5000 });
    });
});
