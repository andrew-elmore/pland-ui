import { expect } from '@playwright/test';
import LocationFormComponent from '../components/form/LocationForm.component.js';
import pause from '../utils/pause.js';

export async function addLocation(page, data) {
    await page.getByRole('button', { name: 'Add' }).click();
    await pause(500);
    const form = LocationFormComponent(page);
    await form.fillAndSubmit(data);
    await expect(page.getByText(data.name)).toBeVisible({ timeout: 5000 });
}

export async function addDefaultLocations(page) {
    await addLocation(page, { name: 'Home', search: '123 Main St' });
    await addLocation(page, { name: 'Office', search: '456 Broadway' });
}
