import { test, expect } from '@playwright/test';
import { loginOrRegister } from '../flows/auth.js';
import { loginAndCreatePlan, navigateToSection, createPlan, enterPlan } from '../flows/plan.js';
import { addDefaultParticipants } from '../flows/participant.js';
import { addDefaultLocations, addLocation } from '../flows/location.js';
import { addAbsoluteTime } from '../flows/time.js';
import { createItinerary } from '../flows/itinerary.js';
import TextFieldComponent from '../components/input/TextField.component.js';
import LocationPickerComponent from '../components/input/LocationPicker.component.js';
import TimeSelectorComponent from '../components/input/TimeSelector.component.js';
import ParticipantPickerComponent from '../components/input/ParticipantPicker.component.js';
import ToggleButtonGroupComponent from '../components/input/ToggleButtonGroup.component.js';
import ParticipantFormComponent from '../components/form/ParticipantForm.component.js';
import GroupFormComponent from '../components/form/GroupForm.component.js';
import LocationFormComponent from '../components/form/LocationForm.component.js';
import TimeFormComponent from '../components/form/TimeForm.component.js';
import StepBlockComponent from '../components/input/StepBlock.component.js';
import pause from '../utils/pause.js';

const timestamp = () => Date.now();

test.describe('Cross-Cutting', () => {
    test('TC-62: form validation — disabled submit buttons', async ({ page }) => {
        const planName = await loginAndCreatePlan(page);

        await page.getByRole('link', { name: 'Pland' }).click();
        await expect(page.getByText('My Plans')).toBeVisible({ timeout: 5000 });

        await page.getByRole('button', { name: 'New Plan' }).click();
        await pause(500);
        await expect(page.getByRole('button', { name: 'Create' })).toBeDisabled();
        await TextFieldComponent(page, 'Plan Name').setValue('Validation Test');
        await expect(page.getByRole('button', { name: 'Create' })).toBeEnabled();
        await page.keyboard.press('Escape');
        await expect(page.locator('[role="dialog"]')).not.toBeVisible({ timeout: 5000 });

        await page.getByText(planName).first().click();
        await pause(500);

        await navigateToSection(page, 'Participants');
        await page.getByRole('button', { name: 'Add', exact: true }).click();
        await pause(500);
        await expect(page.locator('[role="dialog"]').getByRole('button', { name: 'Add' })).toBeDisabled();
        const participantForm = ParticipantFormComponent(page);
        await participantForm.fields.firstName.setValue('Val');
        await participantForm.fields.email.setValue('val@test.com');
        await expect(page.locator('[role="dialog"]').getByRole('button', { name: 'Add' })).toBeEnabled();
        await page.keyboard.press('Escape');
        await expect(page.locator('[role="dialog"]')).not.toBeVisible({ timeout: 5000 });

        await navigateToSection(page, 'Groups');
        await page.getByRole('button', { name: 'Add', exact: true }).click();
        await pause(500);
        await expect(page.locator('[role="dialog"]').getByRole('button', { name: 'Add' })).toBeDisabled();
        const groupForm = GroupFormComponent(page);
        await groupForm.fields.name.setValue('Test Group');
        await expect(page.locator('[role="dialog"]').getByRole('button', { name: 'Add' })).toBeEnabled();
        await page.keyboard.press('Escape');
        await expect(page.locator('[role="dialog"]')).not.toBeVisible({ timeout: 5000 });

        await navigateToSection(page, 'Locations');
        await page.getByRole('button', { name: 'Add', exact: true }).click();
        await pause(500);
        await expect(page.locator('[role="dialog"]').getByRole('button', { name: 'Add' })).toBeDisabled();
        const locationForm = LocationFormComponent(page);
        await locationForm.fields.name.setValue('Test Location');
        await expect(page.locator('[role="dialog"]').getByRole('button', { name: 'Add' })).toBeEnabled();
        await page.keyboard.press('Escape');
        await expect(page.locator('[role="dialog"]')).not.toBeVisible({ timeout: 5000 });

        await navigateToSection(page, 'Times');
        await page.getByRole('button', { name: 'Add', exact: true }).click();
        await pause(500);
        await expect(page.getByRole('button', { name: 'Create' })).toBeDisabled();
        const timeForm = TimeFormComponent(page);
        await timeForm.fields.datetime.setValue('2026-06-15T09:00');
        await expect(page.getByRole('button', { name: 'Create' })).toBeEnabled();
        await page.keyboard.press('Escape');
        await expect(page.locator('[role="dialog"]')).not.toBeVisible({ timeout: 5000 });
    });

    test('TC-63: single dialog slot', async ({ page }) => {
        await loginAndCreatePlan(page);
        await navigateToSection(page, 'Participants');

        await page.getByRole('button', { name: 'Add' }).click();
        await pause(500);
        await expect(page.getByText('Add Participant')).toBeVisible({ timeout: 5000 });

        await page.locator('[role="presentation"]').first().click({ position: { x: 10, y: 10 } });
        await pause(500);

        await expect(page.getByText('Add Participant')).not.toBeVisible({ timeout: 5000 });
    });

    test('TC-64: full user journey — plan a day trip', async ({ page }) => {
        const ts = timestamp();
        await loginOrRegister(page, {
            firstName: 'Journey',
            lastName: 'Tester',
            email: `journey-${ts}@e2e.local`,
            password: 'Password123!',
        });

        await createPlan(page, { name: 'Beach Day' });
        await enterPlan(page, 'Beach Day');

        await navigateToSection(page, 'Participants');
        await page.getByRole('button', { name: 'Add' }).click();
        await pause(500);
        const pForm1 = ParticipantFormComponent(page);
        await pForm1.fillAndSubmit({ firstName: 'Alice', lastName: 'Smith', email: 'alice@test.com' });
        await expect(page.getByText('Alice Smith')).toBeVisible({ timeout: 5000 });

        await page.getByRole('button', { name: 'Add' }).click();
        await pause(500);
        const pForm2 = ParticipantFormComponent(page);
        await pForm2.fillAndSubmit({ firstName: 'Bob', lastName: 'Jones', email: 'bob@test.com' });
        await expect(page.getByText('Bob Jones')).toBeVisible({ timeout: 5000 });

        await navigateToSection(page, 'Locations');
        await addLocation(page, { name: 'Home', search: '123 Main St' });
        await addLocation(page, { name: 'Beach', search: 'Coney Island Beach' });

        await navigateToSection(page, 'Times');
        await addAbsoluteTime(page, { label: 'Departure', datetime: '2026-06-15T08:00' });
        await addAbsoluteTime(page, {
            label: 'Arrival Buffer',
            datetime: '2026-06-15T09:00',
        });

        await navigateToSection(page, 'Itineraries');
        await createItinerary(page, 'Beach Trip');

        await page.getByRole('button', { name: 'Add Step' }).click();
        await pause(500);
        await TextFieldComponent(page, 'Name').setValue('Morning at Beach');
        await ParticipantPickerComponent(page).addByName('Alice Smith');
        await LocationPickerComponent(page, 'Location').setValue('Beach');
        const startTime = TimeSelectorComponent(page, 'Start Time');
        await startTime.setValue('Departure');
        const endTime = TimeSelectorComponent(page, 'End Time');
        await endTime.setValue('Arrival Buffer');
        await page.getByRole('button', { name: 'Create' }).last().click();
        await expect(page.getByRole('button', { name: 'Add Step' })).toBeVisible({ timeout: 10000 });

        const stepBlocks = StepBlockComponent(page);
        await expect(stepBlocks.locator('Morning at Beach')).toBeVisible({ timeout: 5000 });

        await page.getByRole('button', { name: 'Add Step' }).click();
        await pause(500);
        await TextFieldComponent(page, 'Name').setValue('Drive to Beach');
        await ParticipantPickerComponent(page).addByName('Alice Smith');
        await LocationPickerComponent(page, 'Location').setValue('Home');
        await page.getByRole('button', { name: 'Add Destination' }).click();
        await pause(500);
        await LocationPickerComponent(page, 'Destination').setValue('Beach');
        await TimeSelectorComponent(page, /Departure Time|Arrival Time/).setValue('Departure');
        await page.getByRole('button', { name: /Preview Routes/ }).click();
        await expect(page.getByText(/\d+ min/).first()).toBeVisible({ timeout: 15000 });
        await page.getByText(/\d+ min/).first().click();
        await pause(500);
        await page.getByRole('button', { name: 'Create' }).click();
        await pause(1000);
        await expect(page.getByRole('tab', { name: 'Beach Trip' })).toBeVisible({ timeout: 15000 });

        const stepNames = await stepBlocks.getVisibleStepNames();
        expect(stepNames.length).toBeGreaterThanOrEqual(2);

        await stepBlocks.click('Morning at Beach');
        await expect(page).toHaveURL(/\/steps\//, { timeout: 5000 });
        await expect(page.getByText('Morning at Beach')).toBeVisible({ timeout: 5000 });

        await page.getByRole('button', { name: /edit/i }).click();
        await pause(500);

        const nameField = TextFieldComponent(page, 'Name');
        await nameField.clear();
        await nameField.setValue('Beach Morning');
        await page.getByRole('button', { name: 'Save' }).click();
        await pause(500);

        await expect(stepBlocks.locator('Beach Morning')).toBeVisible({ timeout: 5000 });

        const sections = ['Participants', 'Locations', 'Groups', 'Times', 'Routes', 'Itineraries'];
        for (const section of sections) {
            await navigateToSection(page, section);
            await expect(page.getByText(section).first()).toBeVisible({ timeout: 5000 });
        }
    });
});
