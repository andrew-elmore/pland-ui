import pause from '../../utils/pause.js';

/**
 * Playwright component for MUI `<ToggleButtonGroup>`. Unlike other input
 * components, this locates by `[role="group"]` within an optional parent
 * locator, since toggle groups don't have a single accessible label.
 *
 * `setValue` clicks the button whose accessible name matches the given value
 * (e.g. "Drive", "Before", "Leave At"). `getValue` returns the text of the
 * currently pressed button (`aria-pressed="true"`).
 *
 * @param {import('@playwright/test').Page} page
 * @param {import('@playwright/test').Locator|null} parentLocator - A locator
 *   scoping which toggle group to target. Pass `null` to match the first
 *   `[role="group"]` on the page.
 * @returns {{
 *   setValue: (value: string) => Promise<void>,
 *   getValue: () => Promise<string>,
 *   locator: import('@playwright/test').Locator
 * }}
 */
export default function ToggleButtonGroupComponent(page, parentLocator) {
    const group = parentLocator
        ? parentLocator.locator('[role="group"]')
        : page.locator('[role="group"]');

    return {
        async setValue(value) {
            await group.getByRole('button', { name: value }).click();
            await pause(400);
        },

        async getValue() {
            const pressed = group.locator('button[aria-pressed="true"]');
            return pressed.textContent();
        },

        locator: group,
    };
}
