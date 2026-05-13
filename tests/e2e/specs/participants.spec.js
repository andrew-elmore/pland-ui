import { test, expect } from '@playwright/test';
import { loginAndCreatePlan, navigateToSection } from '../flows/plan.js';
import { addParticipant, addDefaultParticipants } from '../flows/participant.js';
import { createItinerary } from '../flows/itinerary.js';
import ParticipantFormComponent from '../components/form/ParticipantForm.component.js';
import ParticipantPickerComponent from '../components/input/ParticipantPicker.component.js';
import GroupFormComponent from '../components/form/GroupForm.component.js';
import pause from '../utils/pause.js';

test.describe('Participants', () => {
    test('TC-14: empty state and create', async ({ page }) => {
        await loginAndCreatePlan(page);
        await navigateToSection(page, 'Participants');

        await expect(page.getByText('No participants yet.')).toBeVisible({ timeout: 5000 });

        await page.getByRole('button', { name: 'Add' }).click();
        await pause(500);

        await expect(page.getByText('Add Participant')).toBeVisible({ timeout: 5000 });

        const form = ParticipantFormComponent(page);
        await form.fields.firstName.setValue('Alice');
        await form.fields.lastName.setValue('Smith');
        await form.fields.email.setValue('alice@test.com');
        await form.fields.role.setValue('Organizer');

        await page.getByRole('button', { name: 'Add' }).last().click();
        await pause(500);

        await expect(page.getByText('Add Participant')).not.toBeVisible({ timeout: 5000 });
        await expect(page.getByText('Alice Smith')).toBeVisible({ timeout: 5000 });
        await expect(page.getByText('Organizer')).toBeVisible({ timeout: 5000 });
    });

    test('TC-15: multiple and deletion', async ({ page }) => {
        await loginAndCreatePlan(page);
        await navigateToSection(page, 'Participants');
        await addDefaultParticipants(page);

        await expect(page.getByText('Alice Smith')).toBeVisible({ timeout: 5000 });
        await expect(page.getByText('Bob Jones')).toBeVisible({ timeout: 5000 });

        await page.getByText('Bob Jones').locator('..').locator('..').getByRole('button').click();
        await pause(500);

        await expect(page.getByText('Bob Jones')).not.toBeVisible({ timeout: 5000 });
        await expect(page.getByText('Alice Smith')).toBeVisible({ timeout: 5000 });
    });

    test('TC-16: participant linking', async ({ page }) => {
        await loginAndCreatePlan(page);
        await navigateToSection(page, 'Participants');
        await addParticipant(page, { firstName: 'Test', lastName: 'User', email: 'test@e2e.local' });

        await expect(page.getByText('Linked')).toBeVisible({ timeout: 5000 });
    });

    test('TC-47: inline participant creation via ParticipantPicker', async ({ page }) => {
        await loginAndCreatePlan(page);
        await navigateToSection(page, 'Participants');
        await addDefaultParticipants(page);
        await navigateToSection(page, 'Itineraries');
        await createItinerary(page);

        await page.getByRole('button', { name: 'Add Step' }).click();
        await pause(500);

        const picker = ParticipantPickerComponent(page);
        await picker.createAndSelect({ firstName: 'Charlie', lastName: 'Quick', email: 'charlie@test.com' });

        await expect(page.getByText('Charlie Quick')).toBeVisible({ timeout: 5000 });
    });

    test('TC-48: group selection in ParticipantPicker', async ({ page }) => {
        await loginAndCreatePlan(page);
        await navigateToSection(page, 'Participants');
        await addDefaultParticipants(page);

        await navigateToSection(page, 'Groups');
        await page.getByRole('button', { name: 'Add' }).click();
        await pause(500);
        const groupForm = GroupFormComponent(page);
        await groupForm.fillAndSubmit({ name: 'Team', members: ['Alice Smith', 'Bob Jones'] });
        await expect(page.getByText('Team')).toBeVisible({ timeout: 5000 });

        await navigateToSection(page, 'Itineraries');
        await createItinerary(page);

        await page.getByRole('button', { name: 'Add Step' }).click();
        await pause(500);

        const picker = ParticipantPickerComponent(page);
        await picker.selectGroup('Team');

        await expect(page.getByText('Alice Smith')).toBeVisible({ timeout: 5000 });
        await expect(page.getByText('Bob Jones')).toBeVisible({ timeout: 5000 });
    });
});
