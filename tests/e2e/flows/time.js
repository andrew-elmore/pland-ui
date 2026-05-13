import { expect } from '@playwright/test';
import TimeFormComponent from '../components/form/TimeForm.component.js';
import pause from '../utils/pause.js';

export async function addAbsoluteTime(page, data) {
    await page.getByRole('button', { name: 'Add' }).click();
    await pause(500);
    const form = TimeFormComponent(page);
    await form.fillAndSubmit(data);
    if (data.label) {
        await expect(page.getByText(data.label)).toBeVisible({ timeout: 5000 });
    }
}

export async function addDependentTime(page, data) {
    await page.getByRole('button', { name: 'Add' }).click();
    await pause(500);
    const form = TimeFormComponent(page);
    await form.fillAndSubmit(data);
    if (data.label) {
        await expect(page.getByText(data.label)).toBeVisible({ timeout: 5000 });
    }
}
