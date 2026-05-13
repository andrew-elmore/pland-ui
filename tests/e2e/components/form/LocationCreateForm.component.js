import TextFieldComponent from '../input/TextField.component.js';
import pause from '../../utils/pause.js';

/**
 * Playwright form component for the inline location creation form that
 * appears inside `<LocationPicker>` when the user clicks "+".
 *
 * Mirrors `<LocationForm>` (`src/features/location/LocationDialog.jsx`) but
 * is used exclusively through `LocationPickerComponent.createAndSelect()`.
 * The "Search places" field triggers Google Places autocomplete — after
 * typing, fill() waits 1s for predictions then clicks the first option.
 * Submit button text is "Add".
 *
 * @param {import('@playwright/test').Page} page
 * @returns {{
 *   fields: { name: object, search: object },
 *   fill: (data: { name?: string, search?: string }) => Promise<void>,
 *   submit: () => Promise<void>,
 *   fillAndSubmit: (data: { name?: string, search?: string }) => Promise<void>
 * }}
 */
export default function LocationCreateFormComponent(page) {
    const fields = {
        name: TextFieldComponent(page, 'Name'),
        search: TextFieldComponent(page, 'Search places'),
    };

    return {
        fields,

        async fill(data) {
            if (data.name) await fields.name.setValue(data.name);
            if (data.search) {
                await fields.search.setValue(data.search);
                await pause(1000);
                await page.getByRole('option').first().click();
                await pause(500);
            }
        },

        async submit() {
            await page.getByRole('button', { name: 'Add' }).click();
            await pause(500);
        },

        async fillAndSubmit(data) {
            await this.fill(data);
            await this.submit();
        },
    };
}
