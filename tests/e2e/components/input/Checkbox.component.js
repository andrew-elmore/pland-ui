import pause from '../../utils/pause.js';

/**
 * Playwright component for MUI `<Checkbox>`. Locates the checkbox by its
 * accessible label. `setValue` is idempotent — it checks or unchecks to match
 * the desired state without toggling if already correct.
 *
 * @param {import('@playwright/test').Page} page
 * @param {string} label - The checkbox's label text.
 * @returns {{
 *   setValue: (checked: boolean) => Promise<void>,
 *   getValue: () => Promise<boolean>,
 *   toggle: () => Promise<void>,
 *   locator: import('@playwright/test').Locator
 * }}
 */
export default function CheckboxComponent(page, label) {
    const checkbox = page.getByLabel(label);

    return {
        async setValue(checked) {
            if (checked) {
                await checkbox.check();
            } else {
                await checkbox.uncheck();
            }
            await pause(400);
        },

        async getValue() {
            return checkbox.isChecked();
        },

        async toggle() {
            await checkbox.click();
            await pause(400);
        },

        locator: checkbox,
    };
}
