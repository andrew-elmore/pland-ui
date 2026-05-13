import { test, expect } from '@playwright/test';
import { loginAndCreatePlan, navigateToSection } from '../flows/plan.js';
import { addDefaultParticipants } from '../flows/participant.js';
import { addDefaultLocations } from '../flows/location.js';
import { addAbsoluteTime } from '../flows/time.js';
import { createItinerary } from '../flows/itinerary.js';
import TextFieldComponent from '../components/input/TextField.component.js';
import LocationPickerComponent from '../components/input/LocationPicker.component.js';
import TimeSelectorComponent from '../components/input/TimeSelector.component.js';
import ParticipantPickerComponent from '../components/input/ParticipantPicker.component.js';
import ToggleButtonGroupComponent from '../components/input/ToggleButtonGroup.component.js';
import RouteFormComponent from '../components/form/RouteForm.component.js';
import pause from '../utils/pause.js';

test.describe('Routes', () => {
    async function setupForRoutes(page) {
        await loginAndCreatePlan(page);
        await navigateToSection(page, 'Participants');
        await addDefaultParticipants(page);
        await navigateToSection(page, 'Locations');
        await addDefaultLocations(page);
        await navigateToSection(page, 'Times');
        await addAbsoluteTime(page, { label: 'Morning', datetime: '2026-06-15T09:00' });
        await navigateToSection(page, 'Itineraries');
        await createItinerary(page, 'Day 1');
    }

    async function createRouteStep(page, { name, participant, origin, destination, travelMode, timeName }) {
        await page.getByRole('button', { name: 'Add Step' }).click();
        await pause(500);
        await TextFieldComponent(page, 'Name').setValue(name);
        await ParticipantPickerComponent(page).addByName(participant);
        await LocationPickerComponent(page, 'Location').setValue(origin);
        await page.getByRole('button', { name: 'Add Destination' }).click();
        await pause(500);
        await LocationPickerComponent(page, 'Destination').setValue(destination);
        if (travelMode) {
            const tmSection = page.locator('text=Travel Mode').locator('..');
            await ToggleButtonGroupComponent(page, tmSection).setValue(travelMode);
        }
        await TimeSelectorComponent(page, /Departure Time|Arrival Time/).setValue(timeName);
        await page.getByRole('button', { name: /Preview Routes/ }).click();
        await expect(page.getByText(/Route \d/)).toBeVisible({ timeout: 15000 });
        await page.getByText(/Route \d/).first().click();
        await pause(300);
        await page.getByRole('button', { name: 'Create' }).click();
        await pause(1000);
    }

    test('TC-49: list view and recalculate all', async ({ page }) => {
        await setupForRoutes(page);
        await createRouteStep(page, {
            name: 'Commute',
            participant: 'Alice Smith',
            origin: 'Home',
            destination: 'Office',
            travelMode: 'Drive',
            timeName: 'Morning',
        });

        await navigateToSection(page, 'Routes');

        await expect(page.getByText('Home')).toBeVisible({ timeout: 5000 });
        await expect(page.getByText('Office')).toBeVisible({ timeout: 5000 });

        await expect(page.locator('text=/\\d+\\s*(min|hr)/i').first()).toBeVisible({ timeout: 5000 });

        await page.getByRole('button', { name: 'Recalculate All' }).click();
        await expect(page.getByRole('button', { name: /Recalculating/ })).toBeVisible({ timeout: 5000 });
        await expect(page.getByRole('button', { name: 'Recalculate All' })).toBeVisible({ timeout: 30000 });
    });

    test('TC-50: empty state', async ({ page }) => {
        await loginAndCreatePlan(page);
        await navigateToSection(page, 'Routes');

        await expect(page.getByText('No routes yet. Routes are created when you add a destination to a step.')).toBeVisible({ timeout: 5000 });
    });

    test('TC-51: drive mode form', async ({ page }) => {
        await setupForRoutes(page);

        await page.getByRole('button', { name: 'Add Step' }).click();
        await pause(500);
        await TextFieldComponent(page, 'Name').setValue('Drive Test');
        await ParticipantPickerComponent(page).addByName('Alice Smith');
        await LocationPickerComponent(page, 'Location').setValue('Home');
        await page.getByRole('button', { name: 'Add Destination' }).click();
        await pause(500);
        await LocationPickerComponent(page, 'Destination').setValue('Office');

        const tmSection = page.locator('text=Travel Mode').locator('..');
        await ToggleButtonGroupComponent(page, tmSection).setValue('Drive');

        await expect(page.getByRole('button', { name: 'Bus' })).not.toBeVisible();
        await expect(page.getByRole('button', { name: 'Subway' })).not.toBeVisible();

        await TimeSelectorComponent(page, /Departure Time|Arrival Time/).setValue('Morning');
        await page.getByRole('button', { name: /Preview Routes/ }).click();
        await expect(page.getByText(/Route \d/)).toBeVisible({ timeout: 15000 });
    });

    test('TC-52: walk mode form', async ({ page }) => {
        await setupForRoutes(page);

        await page.getByRole('button', { name: 'Add Step' }).click();
        await pause(500);
        await TextFieldComponent(page, 'Name').setValue('Walk Test');
        await ParticipantPickerComponent(page).addByName('Alice Smith');
        await LocationPickerComponent(page, 'Location').setValue('Home');
        await page.getByRole('button', { name: 'Add Destination' }).click();
        await pause(500);
        await LocationPickerComponent(page, 'Destination').setValue('Office');

        const tmSection = page.locator('text=Travel Mode').locator('..');
        await ToggleButtonGroupComponent(page, tmSection).setValue('Walk');

        await expect(page.getByRole('button', { name: 'Bus' })).not.toBeVisible();
        await expect(page.getByRole('button', { name: 'Subway' })).not.toBeVisible();

        await TimeSelectorComponent(page, /Departure Time|Arrival Time/).setValue('Morning');
        await page.getByRole('button', { name: /Preview Routes/ }).click();
        await expect(page.getByText(/Route \d/)).toBeVisible({ timeout: 15000 });
    });

    test('TC-53: transit with sub-modes', async ({ page }) => {
        await setupForRoutes(page);

        await page.getByRole('button', { name: 'Add Step' }).click();
        await pause(500);
        await TextFieldComponent(page, 'Name').setValue('Transit Test');
        await ParticipantPickerComponent(page).addByName('Alice Smith');
        await LocationPickerComponent(page, 'Location').setValue('Home');
        await page.getByRole('button', { name: 'Add Destination' }).click();
        await pause(500);
        await LocationPickerComponent(page, 'Destination').setValue('Office');

        const tmSection = page.locator('text=Travel Mode').locator('..');
        await ToggleButtonGroupComponent(page, tmSection).setValue('Transit');

        await expect(page.getByRole('button', { name: 'Bus' })).toBeVisible({ timeout: 5000 });
        await expect(page.getByRole('button', { name: 'Subway' })).toBeVisible({ timeout: 5000 });
        await expect(page.getByRole('button', { name: 'Train' })).toBeVisible({ timeout: 5000 });
        await expect(page.getByRole('button', { name: 'Tram' })).toBeVisible({ timeout: 5000 });
        await expect(page.getByRole('button', { name: 'Ferry' })).toBeVisible({ timeout: 5000 });

        await page.getByRole('button', { name: 'Bus' }).click();
        await pause(300);
        await expect(page.getByRole('button', { name: 'Bus' })).toHaveAttribute('aria-pressed', 'true');

        await page.getByRole('button', { name: 'Subway' }).click();
        await pause(300);
        await expect(page.getByRole('button', { name: 'Bus' })).toHaveAttribute('aria-pressed', 'true');
        await expect(page.getByRole('button', { name: 'Subway' })).toHaveAttribute('aria-pressed', 'true');

        await TimeSelectorComponent(page, /Departure Time|Arrival Time/).setValue('Morning');
        await page.getByRole('button', { name: /Preview Routes/ }).click();
        await expect(page.getByText(/Route \d/)).toBeVisible({ timeout: 15000 });
    });

    test('TC-54: arrive by mode', async ({ page }) => {
        await setupForRoutes(page);

        await page.getByRole('button', { name: 'Add Step' }).click();
        await pause(500);
        await TextFieldComponent(page, 'Name').setValue('Arrive By Test');
        await ParticipantPickerComponent(page).addByName('Alice Smith');
        await LocationPickerComponent(page, 'Location').setValue('Home');
        await page.getByRole('button', { name: 'Add Destination' }).click();
        await pause(500);
        await LocationPickerComponent(page, 'Destination').setValue('Office');

        const routeForm = RouteFormComponent(page);
        await routeForm.fields.timeMode.setValue('Arrive By');

        await expect(page.getByLabel('Arrival Time')).toBeVisible({ timeout: 5000 });

        await TimeSelectorComponent(page, 'Arrival Time').setValue('Morning');
        await page.getByRole('button', { name: /Preview Routes/ }).click();
        await expect(page.getByText(/Route \d/)).toBeVisible({ timeout: 15000 });
    });

    test('TC-55: route options panel — select a route', async ({ page }) => {
        await setupForRoutes(page);

        await page.getByRole('button', { name: 'Add Step' }).click();
        await pause(500);
        await TextFieldComponent(page, 'Name').setValue('Panel Test');
        await ParticipantPickerComponent(page).addByName('Alice Smith');
        await LocationPickerComponent(page, 'Location').setValue('Home');
        await page.getByRole('button', { name: 'Add Destination' }).click();
        await pause(500);
        await LocationPickerComponent(page, 'Destination').setValue('Office');
        await TimeSelectorComponent(page, /Departure Time|Arrival Time/).setValue('Morning');
        await page.getByRole('button', { name: /Preview Routes/ }).click();

        await expect(page.getByText(/Route \d/)).toBeVisible({ timeout: 15000 });
        await expect(page.getByText('Select a route')).toBeVisible({ timeout: 5000 });

        await page.getByText(/Route \d/).first().click();
        await pause(500);

        await expect(page.getByText('Select a route')).not.toBeVisible({ timeout: 5000 });
    });

    test('TC-56: refresh routes after mode change', async ({ page }) => {
        await setupForRoutes(page);

        await page.getByRole('button', { name: 'Add Step' }).click();
        await pause(500);
        await TextFieldComponent(page, 'Name').setValue('Refresh Test');
        await ParticipantPickerComponent(page).addByName('Alice Smith');
        await LocationPickerComponent(page, 'Location').setValue('Home');
        await page.getByRole('button', { name: 'Add Destination' }).click();
        await pause(500);
        await LocationPickerComponent(page, 'Destination').setValue('Office');
        await TimeSelectorComponent(page, /Departure Time|Arrival Time/).setValue('Morning');
        await page.getByRole('button', { name: /Preview Routes/ }).click();
        await expect(page.getByText(/Route \d/)).toBeVisible({ timeout: 15000 });

        const tmSection = page.locator('text=Travel Mode').locator('..');
        await ToggleButtonGroupComponent(page, tmSection).setValue('Walk');

        await expect(page.getByRole('button', { name: 'Refresh Routes' })).toBeVisible({ timeout: 5000 });
        await page.getByRole('button', { name: 'Refresh Routes' }).click();
        await expect(page.getByText(/Route \d/)).toBeVisible({ timeout: 15000 });
    });

    test('TC-74: route options panel — responsive layout', async ({ page }) => {
        await setupForRoutes(page);

        await page.getByRole('button', { name: 'Add Step' }).click();
        await pause(500);
        await TextFieldComponent(page, 'Name').setValue('Responsive Test');
        await ParticipantPickerComponent(page).addByName('Alice Smith');
        await LocationPickerComponent(page, 'Location').setValue('Home');
        await page.getByRole('button', { name: 'Add Destination' }).click();
        await pause(500);
        await LocationPickerComponent(page, 'Destination').setValue('Office');
        await TimeSelectorComponent(page, /Departure Time|Arrival Time/).setValue('Morning');
        await page.getByRole('button', { name: /Preview Routes/ }).click();
        await expect(page.getByText(/Route \d/)).toBeVisible({ timeout: 15000 });

        await page.setViewportSize({ width: 375, height: 812 });
        await pause(500);

        await expect(page.getByText(/Route \d/)).toBeVisible({ timeout: 5000 });
    });
});
