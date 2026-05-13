import TextFieldComponent from '../input/TextField.component.js';
import pause from '../../utils/pause.js';

/**
 * Playwright form component for the inline time creation form that appears
 * inside `<TimeSelector>` when the user clicks "+".
 *
 * Used exclusively through `TimeSelectorComponent.createAndSelect()`.
 * Contains a label field and a datetime-local field. This is the simplified
 * inline version — it only creates absolute times (no parent/offset support).
 * Submit button text is "Add".
 *
 * For the full time form with dependent times and offsets, see
 * `TimeForm.component.js`.
 *
 * @param {import('@playwright/test').Page} page
 * @returns {{
 *   fields: { label: object, datetime: object },
 *   fill: (data: { label?: string, datetime?: string }) => Promise<void>,
 *   submit: () => Promise<void>,
 *   fillAndSubmit: (data: { label?: string, datetime?: string }) => Promise<void>
 * }}
 */
export default function TimeCreateFormComponent(page) {
    const fields = {
        label: TextFieldComponent(page, 'Label'),
        datetime: TextFieldComponent(page, 'Date & Time'),
    };

    return {
        fields,

        async fill(data) {
            if (data.label) await fields.label.setValue(data.label);
            if (data.datetime) await fields.datetime.setValue(data.datetime);
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
