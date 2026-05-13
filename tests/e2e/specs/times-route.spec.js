import { test, expect } from '@playwright/test';
import { loginAndCreatePlan, navigateToSection } from '../flows/plan.js';
import { addDefaultParticipants } from '../flows/participant.js';
import { addAbsoluteTime } from '../flows/time.js';
import { createItinerary } from '../flows/itinerary.js';
import { addDefaultLocations } from '../flows/location.js';
import TextFieldComponent from '../components/input/TextField.component.js';
import ParticipantPickerComponent from '../components/input/ParticipantPicker.component.js';
import LocationPickerComponent from '../components/input/LocationPicker.component.js';
import TimeSelectorComponent from '../components/input/TimeSelector.component.js';
import TimeFormComponent from '../components/form/TimeForm.component.js';
import pause from '../utils/pause.js';

async function setupWithRouteStep(page) {
    await loginAndCreatePlan(page);
    await navigateToSection(page, 'Participants');
    await addDefaultParticipants(page);
    await navigateToSection(page, 'Locations');
    await addDefaultLocations(page);
    await navigateToSection(page, 'Times');
    await addAbsoluteTime(page, { label: 'Morning', datetime: '2026-06-15T09:00' });
    await navigateToSection(page, 'Itineraries');
    await createItinerary(page, 'Day 1');

    await page.getByRole('button', { name: 'Add Step' }).click();
    await pause(500);
    await TextFieldComponent(page, 'Name').setValue('Commute');
    await ParticipantPickerComponent(page).addByName('Alice Smith');
    await LocationPickerComponent(page, 'Location').setValue('Home');
    await page.getByRole('button', { name: 'Add Destination' }).click();
    await pause(500);
    await LocationPickerComponent(page, 'Destination').setValue('Office');
    await TimeSelectorComponent(page, /Departure Time|Arrival Time/).setValue('Morning');
    await page.getByRole('button', { name: /Preview Routes/ }).click();
    await page.getByText(/Route \d/).first().waitFor({ timeout: 15000 });
    await page.getByText(/Route \d/).first().click();
    await pause(300);
    await page.getByRole('button', { name: 'Create' }).click();
    await pause(1000);

    await navigateToSection(page, 'Times');
    await pause(500);
}

test.describe('Times — Route-Dependent', () => {
    test('TC-27: delete hidden for route-dependent times', async ({ page }) => {
        await setupWithRouteStep(page);

        const routeTime = page.locator('li', { hasText: '(via route)' }).first();
        await expect(routeTime).toBeVisible({ timeout: 5000 });
        await expect(routeTime.getByRole('button')).not.toBeVisible();

        const morningTime = page.locator('li', { hasText: 'Morning' });
        await expect(morningTime).toBeVisible({ timeout: 5000 });
        await expect(morningTime.getByRole('button')).toBeVisible();
    });

    test('TC-28: edit route-dependent time', async ({ page }) => {
        await setupWithRouteStep(page);

        const routeTime = page.locator('li', { hasText: '(via route)' }).first();
        await expect(routeTime).toBeVisible({ timeout: 5000 });
        await routeTime.getByRole('button', { name: /edit/i }).click();
        await pause(500);

        await expect(page.getByText('This time is computed from a route')).toBeVisible({ timeout: 5000 });

        const form = TimeFormComponent(page);
        await expect(form.fields.hours.locator).toBeVisible();
        await expect(form.fields.min.locator).toBeVisible();

        await expect(page.locator('input[type="datetime-local"]')).not.toBeVisible();
        await expect(form.fields.relativeTo.locator).not.toBeVisible();

        await form.fields.min.clear();
        await form.fields.min.setValue('5');
        await form.submit();

        await expect(page.getByText('(via route)')).toBeVisible({ timeout: 5000 });
    });
});
