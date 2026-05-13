import pause from '../../utils/pause.js';

/**
 * Playwright component for MUI `<Switch>`. Locates the switch by its
 * accessible label. `setValue` is idempotent — it only clicks if the current
 * state doesn't match the desired state.
 *
 * @param {import('@playwright/test').Page} page
 * @param {string} label - The switch's label text.
 * @returns {{
 *   setValue: (on: boolean) => Promise<void>,
 *   getValue: () => Promise<boolean>,
 *   toggle: () => Promise<void>,
 *   locator: import('@playwright/test').Locator
 * }}
 */
export default function SwitchComponent(page, label) {
    const switchInput = page.getByLabel(label);

    return {
        async setValue(on) {
            const current = await switchInput.isChecked();
            if (current !== on) {
                await switchInput.click();
                await pause(400);
            }
        },

        async getValue() {
            return switchInput.isChecked();
        },

        async toggle() {
            await switchInput.click();
            await pause(400);
        },

        locator: switchInput,
    };
}
