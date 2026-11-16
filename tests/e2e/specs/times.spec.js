import { test, expect } from '@playwright/test';
import { loginAndCreatePlan, navigateToSection } from '../flows/plan.js';
import { addAbsoluteTime, addDependentTime } from '../flows/time.js';
import { addParticipant } from '../flows/participant.js';
import { createItinerary } from '../flows/itinerary.js';
import TimeFormComponent from '../components/form/TimeForm.component.js';
import TimeSelectorComponent from '../components/input/TimeSelector.component.js';
import AutocompleteComponent from '../components/input/Autocomplete.component.js';

test.describe('Times', () => {
    test('TC-21: empty state and create absolute time', async ({ page }) => {
        await loginAndCreatePlan(page);
        await navigateToSection(page, 'Times');

        await expect(page.getByText('No times yet.')).toBeVisible({ timeout: 5000 });

        await page.getByRole('button', { name: 'Add' }).click();
        const form = TimeFormComponent(page);
        await form.fill({ label: 'Trip Start', datetime: '2026-06-15T09:00' });
        await form.submit();

        await expect(page.getByText('Trip Start')).toBeVisible({ timeout: 5000 });
    });

    test('TC-22: create dependent time', async ({ page }) => {
        await loginAndCreatePlan(page);
        await navigateToSection(page, 'Times');
        await addAbsoluteTime(page, { label: 'Trip Start', datetime: '2026-06-15T09:00' });

        await page.getByRole('button', { name: 'Add', exact: true }).click();
        const form = TimeFormComponent(page);
        await form.fields.label.setValue('Lunch');
        await form.fields.relativeTo.setValue('Trip Start');

        await expect(form.fields.datetime.locator).not.toBeVisible({ timeout: 3000 });
        await expect(page.locator('[role="group"]')).toBeVisible({ timeout: 3000 });

        const afterButton = page.locator('[role="group"]').getByRole('button', { name: 'After' });
        await expect(afterButton).toHaveAttribute('aria-pressed', 'true');

        await form.fields.hours.setValue('3');
        await form.fields.min.setValue('0');
        await form.submit();

        await expect(page.getByText('Lunch')).toBeVisible({ timeout: 5000 });
        await expect(page.getByText('(+3h)')).toBeVisible({ timeout: 5000 });
    });

    test('TC-23: before dependent and add dependent button', async ({ page }) => {
        await loginAndCreatePlan(page);
        await navigateToSection(page, 'Times');
        await addAbsoluteTime(page, { label: 'Trip Start', datetime: '2026-06-15T09:00' });

        const tripStartRow = page.locator('li', { hasText: 'Trip Start' });
        await tripStartRow.getByRole('button', { name: 'Add dependent' }).click();

        const form = TimeFormComponent(page);

        const relativeToValue = await form.fields.relativeTo.getValue();
        expect(relativeToValue).toContain('Trip Start');

        await form.fields.label.setValue('Wake Up');

        const toggleGroup = page.locator('[role="group"]');
        await toggleGroup.getByRole('button', { name: 'Before' }).click();

        await form.fields.hours.setValue('1');
        await form.fields.min.setValue('30');
        await form.submit();

        await expect(page.getByText('Wake Up')).toBeVisible({ timeout: 5000 });
        await expect(page.getByText('(-1h 30m)')).toBeVisible({ timeout: 5000 });
    });

    test('TC-24: edit absolute time', async ({ page }) => {
        await loginAndCreatePlan(page);
        await navigateToSection(page, 'Times');
        await addAbsoluteTime(page, { label: 'Trip Start', datetime: '2026-06-15T09:00' });

        const tripStartRow = page.locator('li', { hasText: 'Trip Start' });
        await tripStartRow.getByRole('button').filter({ has: page.locator('[data-testid="EditIcon"]') }).click();

        const form = TimeFormComponent(page);
        const currentLabel = await form.fields.label.getValue();
        expect(currentLabel).toBe('Trip Start');

        await form.fields.datetime.clear();
        await form.fields.datetime.setValue('2026-06-15T10:00');
        await form.submit();

        await expect(page.getByText('Trip Start')).toBeVisible({ timeout: 5000 });
    });

    test('TC-25: merge times', async ({ page }) => {
        await loginAndCreatePlan(page);
        await navigateToSection(page, 'Times');
        await addAbsoluteTime(page, { label: 'Event A', datetime: '2026-06-15T09:00' });
        await addAbsoluteTime(page, { label: 'Event B', datetime: '2026-06-15T14:00' });

        const eventARow = page.locator('li', { hasText: 'Event A' });
        await eventARow.getByRole('button').filter({ has: page.locator('[data-testid="CallMergeIcon"]') }).click();

        await expect(page.getByText('Merge: Event A')).toBeVisible({ timeout: 5000 });

        const mergeAutocomplete = AutocompleteComponent(page, 'Merge with');
        await mergeAutocomplete.setValue('Event B');

        await page.getByRole('button', { name: 'Merge' }).click();
    });

    test('TC-26: delete time', async ({ page }) => {
        await loginAndCreatePlan(page);
        await navigateToSection(page, 'Times');
        await addAbsoluteTime(page, { label: 'Temp Time', datetime: '2026-06-15T09:00' });

        await expect(page.getByText('Temp Time')).toBeVisible({ timeout: 5000 });

        const timeRow = page.locator('li', { hasText: 'Temp Time' });
        await timeRow.getByRole('button').filter({ has: page.locator('[data-testid="DeleteIcon"]') }).click();

        await expect(page.getByText('Temp Time')).not.toBeVisible({ timeout: 5000 });
        await expect(page.getByText('No times yet.')).toBeVisible({ timeout: 5000 });
    });

    test('TC-45: inline time creation via TimeSelector', async ({ page }) => {
        await loginAndCreatePlan(page);

        await navigateToSection(page, 'Participants');
        await addParticipant(page, { firstName: 'Alice', lastName: 'Smith', email: 'alice@test.com' });

        await navigateToSection(page, 'Itineraries');
        await createItinerary(page);

        await page.getByRole('button', { name: 'Add Step' }).click();
        await expect(page.getByText('Add Step')).toBeVisible({ timeout: 5000 });

        const timeSelector = TimeSelectorComponent(page, 'Start Time');
        await timeSelector.createAndSelect({ label: 'Start', datetime: '2026-06-15T09:00' });

        await expect(page.getByText(/Start.*9:00/)).toBeVisible({ timeout: 5000 });
    });

    test('TC-73: inline time creation — absolute only', async ({ page }) => {
        await loginAndCreatePlan(page);

        await navigateToSection(page, 'Participants');
        await addParticipant(page, { firstName: 'Alice', lastName: 'Smith', email: 'alice@test.com' });

        await navigateToSection(page, 'Itineraries');
        await createItinerary(page);

        await page.getByRole('button', { name: 'Add Step' }).click();
        await expect(page.getByText('Add Step')).toBeVisible({ timeout: 5000 });

        const startTimeInput = page.getByRole('combobox', { name: 'Start Time' });
        const addButton = startTimeInput.locator('..').locator('..').locator('..').locator('..').getByRole('button').last();
        await addButton.click();

        await expect(page.getByLabel('Label')).toBeVisible({ timeout: 5000 });
        await expect(page.getByLabel('Date & Time')).toBeVisible({ timeout: 5000 });
        await expect(page.getByLabel('Relative to (optional)')).not.toBeVisible();

        const labelField = page.getByLabel('Label');
        await labelField.fill('Departure');
        const datetimeField = page.getByLabel('Date & Time');
        await datetimeField.fill('2026-06-15T09:00');

        await page.getByRole('button', { name: 'Add', exact: true }).click();
        await expect(page.getByText('Departure')).toBeVisible({ timeout: 5000 });
    });
});
