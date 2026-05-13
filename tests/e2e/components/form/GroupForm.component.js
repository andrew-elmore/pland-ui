import TextFieldComponent from '../input/TextField.component.js';
import AutocompleteComponent from '../input/Autocomplete.component.js';
import pause from '../../utils/pause.js';

/**
 * Playwright form component for `<GroupForm>` (`src/features/group/GroupDialog.jsx`).
 *
 * Dialog form for creating or editing a participant group within a plan.
 * Contains a "Group Name" text field and a "Members" multi-select
 * autocomplete with checkboxes. When `data.members` is an array of
 * participant names, `fill()` iterates and selects each one via the
 * autocomplete. Submit button text is "Create".
 *
 * @param {import('@playwright/test').Page} page
 * @returns {{
 *   fields: { name: object, members: object },
 *   fill: (data: { name?: string, members?: string[] }) => Promise<void>,
 *   submit: () => Promise<void>,
 *   fillAndSubmit: (data: { name?: string, members?: string[] }) => Promise<void>
 * }}
 */
export default function GroupFormComponent(page) {
    const fields = {
        name: TextFieldComponent(page, 'Group Name'),
        members: AutocompleteComponent(page, 'Members'),
    };

    return {
        fields,

        async fill(data) {
            if (data.name) await fields.name.setValue(data.name);
            if (data.members) {
                for (const member of data.members) {
                    await fields.members.setValue(member);
                }
            }
        },

        async submit() {
            await page.getByRole('button', { name: 'Create' }).click();
            await pause(500);
        },

        async fillAndSubmit(data) {
            await this.fill(data);
            await this.submit();
        },
    };
}
