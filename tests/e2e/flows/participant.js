import { expect } from '@playwright/test';
import ParticipantFormComponent from '../components/form/ParticipantForm.component.js';
import pause from '../utils/pause.js';

const defaults = [
    { firstName: 'Alice', lastName: 'Smith', email: 'alice@test.com', role: 'Organizer' },
    { firstName: 'Bob', lastName: 'Jones', email: 'bob@test.com' },
];

export async function addParticipant(page, data) {
    await page.getByRole('button', { name: 'Add' }).click();
    await pause(500);
    const form = ParticipantFormComponent(page);
    await form.fillAndSubmit(data);
    await expect(page.getByText(`${data.firstName} ${data.lastName}`)).toBeVisible({ timeout: 5000 });
}

export async function addDefaultParticipants(page) {
    for (const p of defaults) {
        await addParticipant(page, p);
    }
}
