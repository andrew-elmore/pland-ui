import TextFieldComponent from '../input/TextField.component.js';
import AutocompleteComponent from '../input/Autocomplete.component.js';
import ToggleButtonGroupComponent from '../input/ToggleButtonGroup.component.js';
import pause from '../../utils/pause.js';

/**
 * Playwright form component for `<TimeForm>` (`src/components/common/TimeFormDialog.jsx`).
 *
 * Full dialog form for creating or editing a time within a plan. Supports
 * three modes depending on which fields are filled:
 *
 *   1. Absolute time — fill `datetime` only. Shows a datetime-local input.
 *   2. Dependent time — fill `relativeTo` to pick a parent time, then
 *      optionally `offsetSign` ("Before"/"After"), `hours`, and `min`.
 *      The datetime field is hidden when a parent is selected.
 *   3. Route-dependent time — when editing a time tied to a route, only
 *      `label`, `hours`, and `min` (buffer) are editable. The parent
 *      autocomplete is hidden.
 *
 * Submit button text is "Create" for new times or "Save" when editing.
 * `submit()` detects which button is visible and clicks it.
 *
 * For the simplified inline creation form (absolute times only), see
 * `TimeCreateForm.component.js`.
 *
 * @param {import('@playwright/test').Page} page
 * @returns {{
 *   fields: { label: object, relativeTo: object, datetime: object, hours: object, min: object },
 *   fill: (data: { label?: string, relativeTo?: string, offsetSign?: string, hours?: string, min?: string, datetime?: string }) => Promise<void>,
 *   submit: () => Promise<void>,
 *   fillAndSubmit: (data: { label?: string, relativeTo?: string, offsetSign?: string, hours?: string, min?: string, datetime?: string }) => Promise<void>
 * }}
 */
export default function TimeFormComponent(page) {
    const fields = {
        label: TextFieldComponent(page, 'Label'),
        relativeTo: AutocompleteComponent(page, 'Relative to (optional)'),
        datetime: TextFieldComponent(page, 'Date & Time'),
        hours: TextFieldComponent(page, 'Hours'),
        min: TextFieldComponent(page, 'Min'),
    };

    const offsetSignGroup = ToggleButtonGroupComponent(page, null);

    return {
        fields,

        async fill(data) {
            if (data.label) await fields.label.setValue(data.label);
            if (data.relativeTo) await fields.relativeTo.setValue(data.relativeTo);
            if (data.offsetSign) await offsetSignGroup.setValue(data.offsetSign);
            if (data.hours) await fields.hours.setValue(data.hours);
            if (data.min) await fields.min.setValue(data.min);
            if (data.datetime) await fields.datetime.setValue(data.datetime);
        },

        async submit() {
            const createButton = page.getByRole('button', { name: 'Create' });
            const saveButton = page.getByRole('button', { name: 'Save' });
            const button = await createButton.isVisible().catch(() => false)
                ? createButton
                : saveButton;
            await button.click();
            await pause(500);
        },

        async fillAndSubmit(data) {
            await this.fill(data);
            await this.submit();
        },
    };
}
