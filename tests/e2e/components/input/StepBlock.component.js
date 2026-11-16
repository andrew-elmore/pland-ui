import pause from '../../utils/pause.js';

/**
 * Playwright component for StepBlock — a positioned block in the itinerary
 * timeline that represents a single step. Steps span a vertical region
 * proportional to their time duration.
 *
 * Visual structure:
 *   - Left edge: colored bar showing route segments (transit lines, walking
 *     hatching, wait patterns). Drive is solid color, walk is diagonal stripes,
 *     wait is reverse-diagonal stripes.
 *   - Center: step name text (only visible if the block is tall enough or hovered)
 *   - On hover: "+" icon buttons appear above and/or below the block, allowing
 *     creation of adjacent steps. These only appear when there is an available
 *     time slot (no existing step fills that gap).
 *
 * Interactions:
 *   - Click the block to navigate to the step detail/edit screen
 *   - Hover to reveal add buttons and expand label if block is too short
 *   - Click "+" above to create a step ending at this step's start time
 *   - Click "+" below to create a step starting at this step's end time
 *
 * @param {import('@playwright/test').Page} page
 * @returns {{
 *   click: (stepName: string) => Promise<void>,
 *   hover: (stepName: string) => Promise<void>,
 *   addAbove: (stepName: string) => Promise<void>,
 *   addBelow: (stepName: string) => Promise<void>,
 *   isVisible: (stepName: string) => Promise<boolean>,
 *   getVisibleStepNames: () => Promise<string[]>,
 *   locator: (stepName: string) => import('@playwright/test').Locator
 * }}
 */
export default function StepBlockComponent(page) {
    const getBlock = (stepName) =>
        page.locator(`[data-step-name="${stepName}"]`).first();

    return {
        async click(stepName) {
            await getBlock(stepName).click();
            await pause(400);
        },

        async hover(stepName) {
            await getBlock(stepName).hover();
            await pause(300);
        },

        async addAbove(stepName) {
            const block = getBlock(stepName);
            await block.hover();
            await pause(300);
            await block.getByRole('button').first().click();
            await pause(400);
        },

        async addBelow(stepName) {
            const block = getBlock(stepName);
            await block.hover();
            await pause(300);
            await block.getByRole('button').last().click();
            await pause(400);
        },

        async isVisible(stepName) {
            return getBlock(stepName).isVisible();
        },

        async getVisibleStepNames() {
            const blocks = page.locator('[data-step-name]');
            const count = await blocks.count();
            const names = [];
            for (let i = 0; i < count; i++) {
                const name = await blocks.nth(i).getAttribute('data-step-name');
                if (name) names.push(name);
            }
            return names;
        },

        locator: (stepName) => getBlock(stepName),
    };
}
