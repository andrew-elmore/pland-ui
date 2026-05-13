import TextFieldComponent from '../input/TextField.component.js';
import pause from '../../utils/pause.js';

/**
 * Playwright form component for `<LoginForm>` (`src/features/auth/LoginForm.jsx`).
 *
 * Standalone form on the login screen with email and password fields.
 * Submit button is scoped to `form` to avoid ambiguity with the "Login"
 * link in the app bar.
 *
 * @param {import('@playwright/test').Page} page
 * @returns {{
 *   fields: { email: object, password: object },
 *   fill: (data: { email?: string, password?: string }) => Promise<void>,
 *   submit: () => Promise<void>,
 *   fillAndSubmit: (data: { email?: string, password?: string }) => Promise<void>
 * }}
 */
export default function LoginFormComponent(page) {
    const fields = {
        email: TextFieldComponent(page, 'Email'),
        password: TextFieldComponent(page, 'Password'),
    };

    return {
        fields,

        async fill(data) {
            if (data.email) await fields.email.setValue(data.email);
            if (data.password) await fields.password.setValue(data.password);
        },

        async submit() {
            await page.locator('form').getByRole('button', { name: 'Login' }).click();
            await pause(500);
        },

        async fillAndSubmit(data) {
            await this.fill(data);
            await this.submit();
        },
    };
}
