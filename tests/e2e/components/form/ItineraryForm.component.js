import TextFieldComponent from '../input/TextField.component.js';
import pause from '../../utils/pause.js';

/**
 * Playwright form component for `<ItineraryForm>` (`src/features/itinerary/ItineraryDialog.jsx`).
 *
 * Dialog form for creating or editing an itinerary within a plan.
 * Contains a single "Itinerary Name" text field. Submit button text
 * is "Create".
 *
 * @param {import('@playwright/test').Page} page
 * @returns {{
 *   fields: { name: object },
 *   fill: (data: { name?: string }) => Promise<void>,
 *   submit: () => Promise<void>,
 *   fillAndSubmit: (data: { name?: string }) => Promise<void>
 * }}
 */
export default function ItineraryFormComponent(page) {
    const fields = {
        name: TextFieldComponent(page, 'Itinerary Name'),
    };

    return {
        fields,

        async fill(data) {
            if (data.name) await fields.name.setValue(data.name);
        },

        async submit() {
            await page.getByRole('button', { name: 'Create' }).click();
            await pause(500);
        },

        async fillAndSubmit(data) {
            await this.fill(data);
            await this.submit();
        },
    };
}
