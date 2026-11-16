import pause from '../../utils/pause.js';
import ParticipantCreateFormComponent from '../form/ParticipantCreateForm.component.js';

/**
 * Playwright component for `<ParticipantPicker>` — a multi-select Autocomplete
 * that lets users add participants by name, select predefined groups, or create
 * new participants inline.
 *
 * The label is hardcoded to "Participants" (the picker always uses that label).
 * Selected participants appear as MUI Chips below the input.
 *
 * `addByName` types a name, clicks the matching option, then closes the
 * dropdown with Escape. `addMultiple` chains `addByName` for each entry.
 * `selectGroup` clicks a group option (e.g. "Everyone") which adds all its
 * members at once. `createAndSelect` clicks the "+" button and delegates to
 * `ParticipantCreateFormComponent` in `../form/`.
 *
 * @param {import('@playwright/test').Page} page
 * @returns {{
 *   addByName: (name: string) => Promise<void>,
 *   addMultiple: (names: string[]) => Promise<void>,
 *   selectGroup: (groupName: string) => Promise<void>,
 *   createAndSelect: (data: { firstName: string, lastName: string, email?: string }) => Promise<void>,
 *   getValue: () => Promise<string[]>,
 *   locator: import('@playwright/test').Locator
 * }}
 */
export default function ParticipantPickerComponent(page) {
    const input = page.getByRole('combobox', { name: 'Participants' });
    const addButton = input.locator('..').locator('..').locator('..').locator('..').getByRole('button').last();

    return {
        async addByName(name) {
            await input.click();
            await pause(300);
            await page.getByRole('option', { name }).first().click();
            await pause(300);
            await page.keyboard.press('Escape');
            await pause(200);
        },

        async addMultiple(names) {
            for (const name of names) {
                await this.addByName(name);
            }
        },

        async selectGroup(groupName) {
            await input.click();
            await pause(300);
            await page.getByRole('option', { name: groupName }).first().click();
            await pause(300);
            await page.keyboard.press('Escape');
            await pause(200);
        },

        async createAndSelect(data) {
            await addButton.click();
            await pause(300);
            const form = ParticipantCreateFormComponent(page);
            await form.fillAndSubmit(data);
        },

        async getValue() {
            const chips = input.locator('..').locator('.MuiChip-label');
            return chips.allTextContents();
        },

        locator: input,
    };
}
