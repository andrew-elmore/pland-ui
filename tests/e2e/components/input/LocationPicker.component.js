import pause from '../../utils/pause.js';
import LocationCreateFormComponent from '../form/LocationCreateForm.component.js';

/**
 * Playwright component for `<LocationPicker>` — an Autocomplete-based input
 * that lets users select an existing location or create a new one inline.
 *
 * `setValue` types a location name and picks the matching dropdown option.
 * `createAndSelect` clicks the "+" button next to the input, which opens
 * an inline creation form. It delegates to `LocationCreateFormComponent` in
 * `../form/` to fill and submit that form.
 *
 * Used in RouteForm for Origin and Destination fields.
 *
 * @param {import('@playwright/test').Page} page
 * @param {string} label - The picker's label text (e.g. "Origin", "Destination").
 * @returns {{
 *   setValue: (name: string) => Promise<void>,
 *   createAndSelect: (data: { name: string, search?: string }) => Promise<void>,
 *   getValue: () => Promise<string>,
 *   clear: () => Promise<void>,
 *   locator: import('@playwright/test').Locator
 * }}
 */
export default function LocationPickerComponent(page, label) {
    const input = page.getByLabel(label);
    const addButton = input.locator('..').locator('..').getByRole('button').last();

    return {
        async setValue(name) {
            await input.click();
            await input.fill(name);
            await pause(400);
            await page.getByRole('option', { name }).first().click();
            await pause(300);
        },

        async createAndSelect(data) {
            await addButton.click();
            await pause(300);
            const form = LocationCreateFormComponent(page);
            await form.fillAndSubmit(data);
        },

        async getValue() {
            return input.inputValue();
        },

        async clear() {
            await input.fill('');
            await pause(200);
            await page.keyboard.press('Escape');
            await pause(200);
        },

        locator: input,
    };
}
