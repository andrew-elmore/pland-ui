import pause from '../../utils/pause.js';

/**
 * Playwright component for the TimelineTrack — a vertical timeline with
 * draggable time nodes. Each node represents a time in the plan and can be
 * dragged up or down to adjust its value.
 *
 * The track renders inside the itinerary view. Time nodes are circular icons
 * with labels positioned to their left. The label text shows the formatted
 * time (e.g. "2:30 PM") and is clickable to open the time edit dialog.
 *
 * Node types (identified by icon, but interacted with the same way):
 *   - Absolute: fixed datetime, draggable anywhere on the track
 *   - Dependent: relative to a parent time, constrained to one side of parent
 *   - Route-dependent: tied to route duration, constrained by route bounds
 *
 * Drag behavior:
 *   - Pointer down on a node circle starts capture
 *   - Pointer move while captured updates position (visual + state)
 *   - Pointer up commits the change via onTimeUpdate callback
 *   - Movements under 30 seconds are ignored (dead zone)
 *   - Values snap to 60-second intervals
 *
 * @param {import('@playwright/test').Page} page
 * @returns {{
 *   dragNodeByLabel: (label: string, deltaY: number) => Promise<void>,
 *   clickLabel: (label: string) => Promise<void>,
 *   getNodeLabels: () => Promise<string[]>,
 *   getNodeCount: () => Promise<number>,
 *   locator: import('@playwright/test').Locator
 * }}
 */
export default function TimelineTrackComponent(page) {
    const track = page.locator('[style*="touch-action: none"]').first();

    const getNodeByLabel = (label) =>
        track.locator('span', { hasText: label }).first();

    const getNodeCircle = (label) =>
        getNodeByLabel(label).locator('..').locator('[style*="cursor"]').last();

    return {
        async dragNodeByLabel(label, deltaY) {
            const circle = getNodeCircle(label);
            const box = await circle.boundingBox();
            const startX = box.x + box.width / 2;
            const startY = box.y + box.height / 2;
            await page.mouse.move(startX, startY);
            await page.mouse.down();
            await pause(200);
            const steps = 5;
            for (let i = 1; i <= steps; i++) {
                await page.mouse.move(startX, startY + (deltaY * i) / steps);
                await pause(50);
            }
            await page.mouse.up();
            await pause(400);
        },

        async clickLabel(label) {
            await getNodeByLabel(label).click();
            await pause(300);
        },

        async getNodeLabels() {
            const nodes = track.locator('span[style*="cursor: pointer"]');
            return nodes.allTextContents();
        },

        async getNodeCount() {
            const circles = track.locator('[style*="cursor: grab"], [style*="cursor: grabbing"]');
            return circles.count();
        },

        locator: track,
    };
}
