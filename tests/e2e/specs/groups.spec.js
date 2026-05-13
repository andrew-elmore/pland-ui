import { test, expect } from '@playwright/test';
import { loginAndCreatePlan, navigateToSection } from '../flows/plan.js';
import { addDefaultParticipants } from '../flows/participant.js';
import GroupFormComponent from '../components/form/GroupForm.component.js';
import pause from '../utils/pause.js';

test.describe('Groups', () => {
    test('TC-17: empty state, create, edit, delete', async ({ page }) => {
        await loginAndCreatePlan(page);
        await navigateToSection(page, 'Participants');
        await addDefaultParticipants(page);
        await navigateToSection(page, 'Groups');

        await expect(page.getByText('No groups yet.')).toBeVisible({ timeout: 5000 });

        await page.getByRole('button', { name: 'Add' }).click();
        await pause(500);
        const form = GroupFormComponent(page);
        await form.fill({ name: 'VIP Guests', members: ['Alice Smith'] });
        await page.getByRole('button', { name: 'Add' }).last().click();
        await pause(500);

        await expect(page.getByText('VIP Guests')).toBeVisible({ timeout: 5000 });
        await expect(page.getByText('1 member')).toBeVisible({ timeout: 5000 });

        await page.getByText('VIP Guests').click();
        await pause(500);
        await expect(page.getByText('Alice Smith')).toBeVisible({ timeout: 5000 });

        await page.getByText('VIP Guests').locator('..').getByRole('button').first().click();
        await pause(500);
        await expect(page.getByText('Edit Group')).toBeVisible({ timeout: 5000 });

        const editForm = GroupFormComponent(page);
        await editForm.fields.name.clear();
        await editForm.fields.name.setValue('VIP');
        await page.getByRole('button', { name: 'Save' }).click();
        await pause(500);

        await expect(page.getByText('VIP')).toBeVisible({ timeout: 5000 });

        await page.getByText('VIP').locator('..').getByRole('button').last().click();
        await pause(500);

        await expect(page.getByText('No groups yet.')).toBeVisible({ timeout: 5000 });
    });

    test('TC-18: empty group', async ({ page }) => {
        await loginAndCreatePlan(page);
        await navigateToSection(page, 'Participants');
        await addDefaultParticipants(page);
        await navigateToSection(page, 'Groups');

        await page.getByRole('button', { name: 'Add' }).click();
        await pause(500);
        const form = GroupFormComponent(page);
        await form.fill({ name: 'Empty Group' });
        await page.getByRole('button', { name: 'Add' }).last().click();
        await pause(500);

        await expect(page.getByText('Empty Group')).toBeVisible({ timeout: 5000 });
        await expect(page.getByText('0 members')).toBeVisible({ timeout: 5000 });

        await page.getByText('Empty Group').click();
        await pause(500);

        await expect(page.getByText('No members')).toBeVisible({ timeout: 5000 });
    });
});
