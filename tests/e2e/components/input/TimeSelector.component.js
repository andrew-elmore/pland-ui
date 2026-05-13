import pause from '../../utils/pause.js';
import TimeCreateFormComponent from '../form/TimeCreateForm.component.js';

/**
 * Playwright component for `<TimeSelector>` — an Autocomplete-based input
 * for selecting or creating times within a plan.
 *
 * The component has three states in the React source:
 *   1. Selected — displays the time label with swap and edit icon buttons
 *   2. Creating — inline form with Label and Date & Time fields plus Add button
 *   3. Selecting — Autocomplete dropdown with existing times and a "+" button
 *
 * `setValue` types a time name into the Autocomplete and clicks the match.
 * `selectIndex` opens the dropdown and clicks the nth option.
 * `createAndSelect` clicks the "+" button and delegates to
 * `TimeCreateFormComponent` in `../form/`. `swap` clicks the SwapHoriz icon
 * to deselect the current time and return to the selecting state.
 *
 * Used in RouteForm for Departure Time / Arrival Time fields.
 *
 * @param {import('@playwright/test').Page} page
 * @param {string} label - The selector's label (e.g. "Departure Time", "Arrival Time").
 * @returns {{
 *   setValue: (name: string) => Promise<void>,
 *   selectIndex: (index: number) => Promise<void>,
 *   createAndSelect: (data: { label?: string, datetime: string }) => Promise<void>,
 *   swap: () => Promise<void>,
 *   getValue: () => Promise<string>,
 *   locator: import('@playwright/test').Locator
 * }}
 */
export default function TimeSelectorComponent(page, label) {
    const input = page.getByLabel(label);
    const addButton = input.locator('..').locator('..').getByRole('button').last();

    return {
        async setValue(name) {
            await input.click();
            await input.fill(name);
            await pause(400);
            await page.getByRole('option', { name }).first().click();
            await pause(300);
        },

        async selectIndex(index) {
            await input.click();
            await pause(300);
            await page.getByRole('option').nth(index).click();
            await pause(300);
        },

        async createAndSelect(data) {
            await addButton.click();
            await pause(300);
            const form = TimeCreateFormComponent(page);
            await form.fillAndSubmit(data);
        },

        async swap() {
            await page.locator('[data-testid="SwapHorizIcon"]').first().click();
            await pause(300);
        },

        async getValue() {
            return input.inputValue();
        },

        locator: input,
    };
}
