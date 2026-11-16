import pause from '../../utils/pause.js';

/**
 * Playwright component for MUI `<Autocomplete>`. Locates the inner text input
 * by its accessible label. Typing a value opens the dropdown, then the matching
 * option is clicked. Use `selectIndex` when the option text doesn't exactly
 * match the typed value (e.g. grouped options, custom renderOption).
 *
 * @param {import('@playwright/test').Page} page
 * @param {string} label - The input's label text (from the `renderInput` TextField).
 * @returns {{
 *   setValue: (value: string) => Promise<void>,
 *   selectIndex: (index: number) => Promise<void>,
 *   getValue: () => Promise<string>,
 *   clear: () => Promise<void>,
 *   locator: import('@playwright/test').Locator
 * }}
 */
export default function AutocompleteComponent(page, label) {
    const input = page.getByRole('combobox', { name: label });

    return {
        async setValue(value) {
            await input.click();
            await input.fill(value);
            await pause(400);
            await page.getByRole('option', { name: value }).first().click();
            await pause(300);
        },

        async selectIndex(index) {
            await input.click();
            await pause(300);
            const option = page.getByRole('option').nth(index);
            await option.click();
            await pause(300);
        },

        async getValue() {
            return input.inputValue();
        },

        async clear() {
            await input.fill('');
            await pause(200);
            await page.keyboard.press('Escape');
            await pause(200);
        },

        locator: input,
    };
}
