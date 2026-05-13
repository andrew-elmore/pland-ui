import { expect } from '@playwright/test';
import ItineraryFormComponent from '../components/form/ItineraryForm.component.js';
import pause from '../utils/pause.js';

export async function createItinerary(page, name = 'Day 1') {
    const createBtn = page.getByRole('button', { name: 'Create itinerary' });
    const plusTab = page.getByRole('tab').last();
    const trigger = await createBtn.isVisible().catch(() => false) ? createBtn : plusTab;
    await trigger.click();
    await pause(500);
    const form = ItineraryFormComponent(page);
    await form.fillAndSubmit({ name });
    await expect(page.getByRole('tab', { name })).toBeVisible({ timeout: 5000 });
}
