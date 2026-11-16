import pause from '../../utils/pause.js';

/**
 * Playwright component for MUI `<TextField>`. Locates the input by its
 * accessible label and provides fill, read, and clear operations.
 *
 * @param {import('@playwright/test').Page} page
 * @param {string} label - The input's label text (matches the MUI `label` prop).
 * @returns {{
 *   setValue: (value: string|number) => Promise<void>,
 *   getValue: () => Promise<string>,
 *   clear: () => Promise<void>,
 *   locator: import('@playwright/test').Locator
 * }}
 */
export default function TextFieldComponent(page, label) {
    const input = page.getByLabel(label, { exact: true });

    return {
        async setValue(value) {
            await input.click();
            await input.fill(String(value));
            await pause(400);
        },

        async getValue() {
            return input.inputValue();
        },

        async clear() {
            await input.clear();
            await pause(300);
        },

        locator: input,
    };
}
