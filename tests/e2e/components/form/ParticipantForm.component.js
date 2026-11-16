import TextFieldComponent from '../input/TextField.component.js';
import AutocompleteComponent from '../input/Autocomplete.component.js';
import pause from '../../utils/pause.js';

/**
 * Playwright form component for `<ParticipantForm>` (`src/features/participant/ParticipantDialog.jsx`).
 *
 * Dialog form for creating or editing a participant within a plan.
 * Contains first name, last name, and email text fields plus a Role
 * autocomplete (options: Admin, Organizer, Attendee, Vendor). Submit
 * button text is "Create".
 *
 * This is the full standalone dialog form. For the simplified inline
 * creation form (no role field), see `ParticipantCreateForm.component.js`.
 *
 * @param {import('@playwright/test').Page} page
 * @returns {{
 *   fields: { firstName: object, lastName: object, email: object, role: object },
 *   fill: (data: { firstName?: string, lastName?: string, email?: string, role?: string }) => Promise<void>,
 *   submit: () => Promise<void>,
 *   fillAndSubmit: (data: { firstName?: string, lastName?: string, email?: string, role?: string }) => Promise<void>
 * }}
 */
export default function ParticipantFormComponent(page) {
    const fields = {
        firstName: TextFieldComponent(page, 'First Name'),
        lastName: TextFieldComponent(page, 'Last Name'),
        email: TextFieldComponent(page, 'Email'),
        role: AutocompleteComponent(page, 'Role'),
    };

    return {
        fields,

        async fill(data) {
            if (data.firstName) await fields.firstName.setValue(data.firstName);
            if (data.lastName) await fields.lastName.setValue(data.lastName);
            if (data.email) await fields.email.setValue(data.email);
            if (data.role) await fields.role.setValue(data.role);
        },

        async submit() {
            await page.locator('[role="dialog"]').getByRole('button', { name: 'Add' }).click();
            await pause(500);
        },

        async fillAndSubmit(data) {
            await this.fill(data);
            await this.submit();
        },
    };
}
