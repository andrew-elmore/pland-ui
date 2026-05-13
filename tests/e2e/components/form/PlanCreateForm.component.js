import TextFieldComponent from '../input/TextField.component.js';
import pause from '../../utils/pause.js';

/**
 * Playwright form component for the plan creation dialog on the home screen
 * (`src/screens/HomeScreen.jsx`).
 *
 * Dialog form opened by the "New Plan" button. Contains "Plan Name" and
 * "Description" (multiline) text fields. Submit button text is "Create".
 *
 * @param {import('@playwright/test').Page} page
 * @returns {{
 *   fields: { name: object, description: object },
 *   fill: (data: { name?: string, description?: string }) => Promise<void>,
 *   submit: () => Promise<void>,
 *   fillAndSubmit: (data: { name?: string, description?: string }) => Promise<void>
 * }}
 */
export default function PlanCreateFormComponent(page) {
    const fields = {
        name: TextFieldComponent(page, 'Plan Name'),
        description: TextFieldComponent(page, 'Description'),
    };

    return {
        fields,

        async fill(data) {
            if (data.name) await fields.name.setValue(data.name);
            if (data.description) await fields.description.setValue(data.description);
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
