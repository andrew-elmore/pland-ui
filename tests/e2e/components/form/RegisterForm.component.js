import TextFieldComponent from '../input/TextField.component.js';
import pause from '../../utils/pause.js';

/**
 * Playwright form component for `<RegisterForm>` (`src/features/auth/RegisterForm.jsx`).
 *
 * Standalone form on the registration screen with first name, last name,
 * email, and password fields.
 *
 * @param {import('@playwright/test').Page} page
 * @returns {{
 *   fields: { firstName: object, lastName: object, email: object, password: object },
 *   fill: (data: { firstName?: string, lastName?: string, email?: string, password?: string }) => Promise<void>,
 *   submit: () => Promise<void>,
 *   fillAndSubmit: (data: { firstName?: string, lastName?: string, email?: string, password?: string }) => Promise<void>
 * }}
 */
export default function RegisterFormComponent(page) {
    const fields = {
        firstName: TextFieldComponent(page, 'First Name'),
        lastName: TextFieldComponent(page, 'Last Name'),
        email: TextFieldComponent(page, 'Email'),
        password: TextFieldComponent(page, 'Password'),
    };

    return {
        fields,

        async fill(data) {
            if (data.firstName) await fields.firstName.setValue(data.firstName);
            if (data.lastName) await fields.lastName.setValue(data.lastName);
            if (data.email) await fields.email.setValue(data.email);
            if (data.password) await fields.password.setValue(data.password);
        },

        async submit() {
            await page.getByRole('button', { name: 'Register' }).click();
            await pause(500);
        },

        async fillAndSubmit(data) {
            await this.fill(data);
            await this.submit();
        },
    };
}
