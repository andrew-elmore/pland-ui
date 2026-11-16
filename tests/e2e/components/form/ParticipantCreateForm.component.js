import TextFieldComponent from '../input/TextField.component.js';
import pause from '../../utils/pause.js';

/**
 * Playwright form component for the inline participant creation form that
 * appears inside `<ParticipantPicker>` when the user clicks "+".
 *
 * Used exclusively through `ParticipantPickerComponent.createAndSelect()`.
 * Contains first name, last name, and email fields. Submit button text
 * is "Add". Does not include the Role field — inline creation uses the
 * default role (Attendee).
 *
 * @param {import('@playwright/test').Page} page
 * @returns {{
 *   fields: { firstName: object, lastName: object, email: object },
 *   fill: (data: { firstName?: string, lastName?: string, email?: string }) => Promise<void>,
 *   submit: () => Promise<void>,
 *   fillAndSubmit: (data: { firstName?: string, lastName?: string, email?: string }) => Promise<void>
 * }}
 */
export default function ParticipantCreateFormComponent(page) {
    const fields = {
        firstName: TextFieldComponent(page, 'First Name'),
        lastName: TextFieldComponent(page, 'Last Name'),
        email: TextFieldComponent(page, 'Email'),
    };

    return {
        fields,

        async fill(data) {
            if (data.firstName) await fields.firstName.setValue(data.firstName);
            if (data.lastName) await fields.lastName.setValue(data.lastName);
            if (data.email) await fields.email.setValue(data.email);
        },

        async submit() {
            await page.getByRole('button', { name: 'Add', exact: true }).click();
            await pause(500);
        },

        async fillAndSubmit(data) {
            await this.fill(data);
            await this.submit();
        },
    };
}
