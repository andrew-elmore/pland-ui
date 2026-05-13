import TextFieldComponent from '../input/TextField.component.js';
import pause from '../../utils/pause.js';

/**
 * Playwright form component for `<LocationForm>` (`src/features/location/LocationDialog.jsx`).
 *
 * Standalone dialog form for creating a location within a plan. Contains
 * a "Name" text field and a "Search places" freeSolo autocomplete backed
 * by Google Places. When `data.search` is provided, `fill()` types the
 * query, waits 1s for Google Places predictions, then clicks the first
 * result. Submit button text is "Add".
 *
 * This is the standalone dialog version. For the inline creation form
 * used inside LocationPicker, see `LocationCreateForm.component.js`
 * (same fields, same behavior — separated for clarity of which context
 * each is used in).
 *
 * @param {import('@playwright/test').Page} page
 * @returns {{
 *   fields: { name: object, search: object },
 *   fill: (data: { name?: string, search?: string }) => Promise<void>,
 *   submit: () => Promise<void>,
 *   fillAndSubmit: (data: { name?: string, search?: string }) => Promise<void>
 * }}
 */
export default function LocationFormComponent(page) {
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
