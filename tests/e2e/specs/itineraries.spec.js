import { test, expect } from '@playwright/test';
import { loginAndCreatePlan, navigateToSection } from '../flows/plan.js';
import { addDefaultParticipants, addParticipant } from '../flows/participant.js';
import { addAbsoluteTime, addDependentTime } from '../flows/time.js';
import { createItinerary } from '../flows/itinerary.js';
import TimelineTrackComponent from '../components/input/TimelineTrack.component.js';
import StepBlockComponent from '../components/input/StepBlock.component.js';
import TextFieldComponent from '../components/input/TextField.component.js';
import TimeSelectorComponent from '../components/input/TimeSelector.component.js';
import ParticipantPickerComponent from '../components/input/ParticipantPicker.component.js';

async function createStep(page, { name, participants, startTime, endTime }) {
    await page.getByRole('button', { name: 'Add Step' }).click();
    await expect(page.getByText('Add Step')).toBeVisible({ timeout: 5000 });

    const nameField = TextFieldComponent(page, 'Name');
    await nameField.setValue(name);

    const picker = ParticipantPickerComponent(page);
    for (const p of participants) {
        await picker.addByName(p);
    }

    const startSelector = TimeSelectorComponent(page, 'Start Time');
    await startSelector.setValue(startTime);

    const endSelector = TimeSelectorComponent(page, 'End Time');
    await endSelector.setValue(endTime);

    await page.getByRole('button', { name: 'Create' }).last().click();
    await expect(page.getByRole('tab', { name: /Day/ })).toBeVisible({ timeout: 5000 });
}

async function setupParticipantsTimesItinerary(page, { times = [], itineraryName = 'Day 1' } = {}) {
    await loginAndCreatePlan(page);

    await navigateToSection(page, 'Participants');
    await addDefaultParticipants(page);

    if (times.length > 0) {
        await navigateToSection(page, 'Times');
        for (const t of times) {
            if (t.relativeTo) {
                await addDependentTime(page, t);
            } else {
                await addAbsoluteTime(page, t);
            }
        }
    }

    await navigateToSection(page, 'Itineraries');
    await createItinerary(page, itineraryName);
}

test.describe('Itineraries', () => {
    test('TC-33: empty state shows message and create button; creating itinerary shows tab and Add Step', async ({ page }) => {
        await loginAndCreatePlan(page);

        await navigateToSection(page, 'Itineraries');
        await expect(page.getByText('No itineraries yet.')).toBeVisible({ timeout: 5000 });
        await expect(page.getByRole('button', { name: 'Create itinerary' })).toBeVisible({ timeout: 5000 });

        await page.getByRole('button', { name: 'Create itinerary' }).click();
        await expect(page.getByLabel('Itinerary Name')).toBeVisible({ timeout: 5000 });

        const nameField = TextFieldComponent(page, 'Itinerary Name');
        await nameField.setValue('Day 1');
        await page.getByRole('button', { name: 'Create' }).click();

        await expect(page.getByRole('tab', { name: 'Day 1' })).toBeVisible({ timeout: 5000 });
        await expect(page.getByRole('button', { name: 'Add Step' })).toBeVisible({ timeout: 5000 });
    });

    test('TC-34: multiple tabs — create two itineraries and switch between them', async ({ page }) => {
        await loginAndCreatePlan(page);
        await navigateToSection(page, 'Itineraries');

        await createItinerary(page, 'Day 1');
        await createItinerary(page, 'Day 2');

        await expect(page.getByRole('tab', { name: 'Day 1' })).toBeVisible({ timeout: 5000 });
        await expect(page.getByRole('tab', { name: 'Day 2' })).toBeVisible({ timeout: 5000 });

        await page.getByRole('tab', { name: 'Day 1' }).click();
        await expect(page.getByRole('tab', { name: 'Day 1' })).toHaveAttribute('aria-selected', 'true', { timeout: 5000 });
    });

    test('TC-35: timeline shows participant column headers with no step blocks', async ({ page }) => {
        await setupParticipantsTimesItinerary(page);

        await expect(page.getByText('Alice Smith')).toBeVisible({ timeout: 5000 });
        await expect(page.getByText('Bob Jones')).toBeVisible({ timeout: 5000 });

        const stepBlock = StepBlockComponent(page);
        const names = await stepBlock.getVisibleStepNames();
        expect(names.length).toBe(0);
    });

    test('TC-58: timeline without participants shows add message', async ({ page }) => {
        await loginAndCreatePlan(page);
        await navigateToSection(page, 'Itineraries');
        await createItinerary(page, 'Day 1');

        await expect(page.getByText('Add participants to see the timeline.')).toBeVisible({ timeout: 5000 });
    });

    test('TC-29: TimelineTrack — drag absolute time node updates label', async ({ page }) => {
        await setupParticipantsTimesItinerary(page, {
            times: [
                { label: 'Morning', datetime: '2025-06-15T09:00' },
                { label: 'Noon', datetime: '2025-06-15T12:00' },
            ],
        });

        await createStep(page, {
            name: 'Breakfast',
            participants: ['Alice Smith'],
            startTime: 'Morning',
            endTime: 'Noon',
        });

        const track = TimelineTrackComponent(page);
        const count = await track.getNodeCount();
        expect(count).toBeGreaterThan(0);

        const labelsBefore = await track.getNodeLabels();
        const morningLabel = labelsBefore.find(l => l.includes('9:00') || l.includes('9:00'));

        await track.dragNodeByLabel(morningLabel || labelsBefore[0], 80);

        const labelsAfter = await track.getNodeLabels();
        expect(labelsAfter).not.toEqual(labelsBefore);
    });

    test('TC-30: TimelineTrack — drag below threshold does not change time', async ({ page }) => {
        await setupParticipantsTimesItinerary(page, {
            times: [
                { label: 'Morning', datetime: '2025-06-15T09:00' },
                { label: 'Noon', datetime: '2025-06-15T12:00' },
            ],
        });

        await createStep(page, {
            name: 'Breakfast',
            participants: ['Alice Smith'],
            startTime: 'Morning',
            endTime: 'Noon',
        });

        const track = TimelineTrackComponent(page);
        const labelsBefore = await track.getNodeLabels();

        await track.dragNodeByLabel(labelsBefore[0], 5);

        const labelsAfter = await track.getNodeLabels();
        expect(labelsAfter).toEqual(labelsBefore);
    });

    test('TC-31: dependent time drag is constrained by parent', async ({ page }) => {
        await loginAndCreatePlan(page);

        await navigateToSection(page, 'Participants');
        await addDefaultParticipants(page);

        await navigateToSection(page, 'Times');
        await addAbsoluteTime(page, { label: 'Start', datetime: '2025-06-15T09:00' });
        await addDependentTime(page, { label: 'Lunch', relativeTo: 'Start', offsetSign: 'After', hours: '3', min: '0' });

        await navigateToSection(page, 'Itineraries');
        await createItinerary(page, 'Day 1');

        await createStep(page, {
            name: 'Morning Session',
            participants: ['Alice Smith'],
            startTime: 'Start',
            endTime: 'Lunch',
        });

        const track = TimelineTrackComponent(page);
        const labelsBefore = await track.getNodeLabels();
        const lunchLabel = labelsBefore.find(l => l.includes('12:00') || l.includes('12:00'));

        await track.dragNodeByLabel(lunchLabel || labelsBefore[labelsBefore.length - 1], -300);

        const labelsAfter = await track.getNodeLabels();
        const lunchAfter = labelsAfter.find(l => l !== labelsBefore[0]);
        const startLabel = labelsBefore.find(l => l.includes('9:00') || l.includes('9:00'));

        if (lunchAfter && startLabel) {
            const timeRegex = /(\d{1,2}):(\d{2})\s*(AM|PM)/i;
            const parseTime = (str) => {
                const m = str.match(timeRegex);
                if (!m) return null;
                let h = parseInt(m[1]);
                const min = parseInt(m[2]);
                if (m[3].toUpperCase() === 'PM' && h < 12) h += 12;
                if (m[3].toUpperCase() === 'AM' && h === 12) h = 0;
                return h * 60 + min;
            };
            const lunchMinutes = parseTime(lunchAfter);
            const startMinutes = parseTime(startLabel);
            if (lunchMinutes !== null && startMinutes !== null) {
                expect(lunchMinutes).toBeGreaterThanOrEqual(startMinutes);
            }
        }
    });

    test('TC-32: TimelineTrack — clicking label opens edit dialog', async ({ page }) => {
        await setupParticipantsTimesItinerary(page, {
            times: [
                { label: 'Morning', datetime: '2025-06-15T09:00' },
                { label: 'Noon', datetime: '2025-06-15T12:00' },
            ],
        });

        await createStep(page, {
            name: 'Breakfast',
            participants: ['Alice Smith'],
            startTime: 'Morning',
            endTime: 'Noon',
        });

        const track = TimelineTrackComponent(page);
        const labels = await track.getNodeLabels();
        await track.clickLabel(labels[0]);

        await expect(page.getByRole('button', { name: 'Save' })).toBeVisible({ timeout: 5000 });
    });

    test('TC-57: scrolling layout with many participants', async ({ page }) => {
        await loginAndCreatePlan(page);

        await navigateToSection(page, 'Participants');
        await addParticipant(page, { firstName: 'Alice', lastName: 'Smith', email: 'alice@test.com', role: 'Organizer' });
        await addParticipant(page, { firstName: 'Bob', lastName: 'Jones', email: 'bob@test.com' });
        await addParticipant(page, { firstName: 'Carol', lastName: 'Davis', email: 'carol@test.com' });
        await addParticipant(page, { firstName: 'Dave', lastName: 'Miller', email: 'dave@test.com' });

        await navigateToSection(page, 'Itineraries');
        await createItinerary(page, 'Day 1');

        await page.setViewportSize({ width: 800, height: 600 });

        await expect(page.getByText('Alice Smith')).toBeVisible({ timeout: 5000 });
        await expect(page.getByText('Bob Jones')).toBeVisible({ timeout: 5000 });
        await expect(page.getByText('Carol Davis')).toBeVisible({ timeout: 5000 });
        await expect(page.getByText('Dave Miller')).toBeVisible({ timeout: 5000 });
    });

    test('TC-69: scrollable tab bar with many itineraries', async ({ page }) => {
        await loginAndCreatePlan(page);
        await navigateToSection(page, 'Itineraries');

        const names = ['Day 1', 'Day 2', 'Day 3', 'Day 4', 'Day 5', 'Day 6'];
        for (const name of names) {
            await createItinerary(page, name);
        }

        for (const name of names) {
            await expect(page.getByRole('tab', { name })).toBeVisible({ timeout: 5000 });
        }
    });

    test('TC-70: step block height proportional to duration', async ({ page }) => {
        await setupParticipantsTimesItinerary(page, {
            times: [
                { label: 'T1', datetime: '2025-06-15T09:00' },
                { label: 'T2', datetime: '2025-06-15T10:00' },
                { label: 'T3', datetime: '2025-06-15T13:00' },
            ],
        });

        await createStep(page, {
            name: 'Short Task',
            participants: ['Alice Smith'],
            startTime: 'T1',
            endTime: 'T2',
        });

        await createStep(page, {
            name: 'Long Task',
            participants: ['Alice Smith'],
            startTime: 'T2',
            endTime: 'T3',
        });

        const stepBlock = StepBlockComponent(page);
        expect(await stepBlock.isVisible('Short Task')).toBe(true);
        expect(await stepBlock.isVisible('Long Task')).toBe(true);

        const shortBox = await stepBlock.locator('Short Task').boundingBox();
        const longBox = await stepBlock.locator('Long Task').boundingBox();

        const ratio = longBox.height / shortBox.height;
        expect(ratio).toBeGreaterThan(2.5);
        expect(ratio).toBeLessThan(3.5);
    });

    test('TC-71: dynamic time range extends around step times', async ({ page }) => {
        await setupParticipantsTimesItinerary(page, {
            times: [
                { label: 'Afternoon', datetime: '2025-06-15T14:00' },
                { label: 'Late', datetime: '2025-06-15T16:00' },
            ],
        });

        await createStep(page, {
            name: 'Afternoon Session',
            participants: ['Alice Smith'],
            startTime: 'Afternoon',
            endTime: 'Late',
        });

        const hourLabels = await page.locator('[style*="position: absolute"][style*="border-top"]')
            .evaluateAll(els => els.length);
        expect(hourLabels).toBeGreaterThan(2);

        const track = TimelineTrackComponent(page);
        const nodeCount = await track.getNodeCount();
        expect(nodeCount).toBeGreaterThan(0);
    });
});
