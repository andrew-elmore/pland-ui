import { test, expect } from '@playwright/test';
import { loginAndCreatePlan, navigateToSection } from '../flows/plan.js';
import { addDefaultParticipants } from '../flows/participant.js';
import { addAbsoluteTime } from '../flows/time.js';
import { createItinerary } from '../flows/itinerary.js';
import { addDefaultLocations } from '../flows/location.js';
import ParticipantPickerComponent from '../components/input/ParticipantPicker.component.js';
import LocationPickerComponent from '../components/input/LocationPicker.component.js';
import TimeSelectorComponent from '../components/input/TimeSelector.component.js';
import StepBlockComponent from '../components/input/StepBlock.component.js';
import ToggleButtonGroupComponent from '../components/input/ToggleButtonGroup.component.js';
import TextFieldComponent from '../components/input/TextField.component.js';
import SwitchComponent from '../components/input/Switch.component.js';
import RouteFormComponent from '../components/form/RouteForm.component.js';
import pause from '../utils/pause.js';

test.describe('Steps', () => {
    async function setupPlanForSteps(page) {
        await loginAndCreatePlan(page);
        await navigateToSection(page, 'Participants');
        await addDefaultParticipants(page);
        await navigateToSection(page, 'Locations');
        await addDefaultLocations(page);
        await navigateToSection(page, 'Times');
        await addAbsoluteTime(page, { label: 'Morning', datetime: '2026-06-15T09:00' });
        await addAbsoluteTime(page, { label: 'Noon', datetime: '2026-06-15T12:00' });
        await addAbsoluteTime(page, { label: 'Evening', datetime: '2026-06-15T18:00' });
        await navigateToSection(page, 'Itineraries');
        await createItinerary(page, 'Day 1');
    }

    test('TC-36: create from-till mode with route', async ({ page }) => {
        await setupPlanForSteps(page);

        await page.getByRole('button', { name: 'Add Step' }).click();
        await pause(500);

        const nameField = TextFieldComponent(page, 'Name');
        await nameField.setValue('Commute');

        const participantPicker = ParticipantPickerComponent(page);
        await participantPicker.addByName('Alice Smith');

        const locationPicker = LocationPickerComponent(page, 'Location');
        await locationPicker.setValue('Home');

        await page.getByRole('button', { name: /Add Destination/ }).click();
        await pause(500);

        const destinationPicker = LocationPickerComponent(page, 'Destination');
        await destinationPicker.setValue('Office');

        const travelModeSection = page.locator('text=Travel Mode').locator('..');
        const travelMode = ToggleButtonGroupComponent(page, travelModeSection);
        await travelMode.setValue('Drive');

        const departureTime = TimeSelectorComponent(page, 'Departure Time');
        await departureTime.setValue('Morning');

        await page.getByRole('button', { name: /Preview Routes/ }).click();
        await pause(500);

        await expect(page.getByText(/\d+ min/).first()).toBeVisible({ timeout: 15000 });

        await page.getByText(/\d+ min/).first().click();
        await pause(300);

        await page.getByRole('button', { name: 'Create' }).click();
        await pause(500);

        const stepBlock = StepBlockComponent(page);
        await expect(stepBlock.locator('Commute')).toBeVisible({ timeout: 5000 });
    });

    test('TC-37: step block hover and click', async ({ page }) => {
        await setupPlanForSteps(page);

        await page.getByRole('button', { name: 'Add Step' }).click();
        await pause(500);

        const nameField = TextFieldComponent(page, 'Name');
        await nameField.setValue('Commute');

        const participantPicker = ParticipantPickerComponent(page);
        await participantPicker.addByName('Alice Smith');

        const locationPicker = LocationPickerComponent(page, 'Location');
        await locationPicker.setValue('Home');

        await page.getByRole('button', { name: /Add Destination/ }).click();
        await pause(500);

        const destinationPicker = LocationPickerComponent(page, 'Destination');
        await destinationPicker.setValue('Office');

        const travelModeSection = page.locator('text=Travel Mode').locator('..');
        const travelMode = ToggleButtonGroupComponent(page, travelModeSection);
        await travelMode.setValue('Drive');

        const departureTime = TimeSelectorComponent(page, 'Departure Time');
        await departureTime.setValue('Morning');

        await page.getByRole('button', { name: /Preview Routes/ }).click();
        await pause(500);
        await expect(page.getByText(/\d+ min/).first()).toBeVisible({ timeout: 15000 });
        await page.getByText(/\d+ min/).first().click();
        await pause(300);

        await page.getByRole('button', { name: 'Create' }).click();
        await pause(500);

        const stepBlock = StepBlockComponent(page);
        await expect(stepBlock.locator('Commute')).toBeVisible({ timeout: 5000 });

        await stepBlock.hover('Commute');

        await stepBlock.click('Commute');
        await expect(page).toHaveURL(/\/steps\//, { timeout: 5000 });
    });

    test('TC-38: step details — route step view', async ({ page }) => {
        await setupPlanForSteps(page);

        await page.getByRole('button', { name: 'Add Step' }).click();
        await pause(500);

        const nameField = TextFieldComponent(page, 'Name');
        await nameField.setValue('Commute');

        const participantPicker = ParticipantPickerComponent(page);
        await participantPicker.addByName('Alice Smith');

        const locationPicker = LocationPickerComponent(page, 'Location');
        await locationPicker.setValue('Home');

        await page.getByRole('button', { name: /Add Destination/ }).click();
        await pause(500);

        const destinationPicker = LocationPickerComponent(page, 'Destination');
        await destinationPicker.setValue('Office');

        const travelModeSection = page.locator('text=Travel Mode').locator('..');
        const travelMode = ToggleButtonGroupComponent(page, travelModeSection);
        await travelMode.setValue('Drive');

        const departureTime = TimeSelectorComponent(page, 'Departure Time');
        await departureTime.setValue('Morning');

        await page.getByRole('button', { name: /Preview Routes/ }).click();
        await pause(500);
        await expect(page.getByText(/\d+ min/).first()).toBeVisible({ timeout: 15000 });
        await page.getByText(/\d+ min/).first().click();
        await pause(300);

        await page.getByRole('button', { name: 'Create' }).click();
        await pause(500);

        const stepBlock = StepBlockComponent(page);
        await expect(stepBlock.locator('Commute')).toBeVisible({ timeout: 5000 });

        await stepBlock.click('Commute');
        await expect(page).toHaveURL(/\/steps\//, { timeout: 5000 });

        await expect(page.getByText('Commute')).toBeVisible({ timeout: 5000 });
        await expect(page.getByText('Alice Smith')).toBeVisible({ timeout: 5000 });
        await expect(page.getByText('Directions')).toBeVisible({ timeout: 5000 });

        await page.getByRole('button', { name: /back/i }).click();
        await pause(500);
    });

    test('TC-39: step edit and delete', async ({ page }) => {
        await setupPlanForSteps(page);

        await page.getByRole('button', { name: 'Add Step' }).click();
        await pause(500);

        const nameField = TextFieldComponent(page, 'Name');
        await nameField.setValue('Commute');

        const participantPicker = ParticipantPickerComponent(page);
        await participantPicker.addByName('Alice Smith');

        const locationPicker = LocationPickerComponent(page, 'Location');
        await locationPicker.setValue('Home');

        await page.getByRole('button', { name: /Add Destination/ }).click();
        await pause(500);

        const destinationPicker = LocationPickerComponent(page, 'Destination');
        await destinationPicker.setValue('Office');

        const travelModeSection = page.locator('text=Travel Mode').locator('..');
        const travelMode = ToggleButtonGroupComponent(page, travelModeSection);
        await travelMode.setValue('Drive');

        const departureTime = TimeSelectorComponent(page, 'Departure Time');
        await departureTime.setValue('Morning');

        await page.getByRole('button', { name: /Preview Routes/ }).click();
        await pause(500);
        await expect(page.getByText(/\d+ min/).first()).toBeVisible({ timeout: 15000 });
        await page.getByText(/\d+ min/).first().click();
        await pause(300);

        await page.getByRole('button', { name: 'Create' }).click();
        await pause(500);

        const stepBlock = StepBlockComponent(page);
        await expect(stepBlock.locator('Commute')).toBeVisible({ timeout: 5000 });

        await stepBlock.click('Commute');
        await expect(page).toHaveURL(/\/steps\//, { timeout: 5000 });

        await page.getByRole('button', { name: /edit/i }).click();
        await pause(500);

        const editNameField = TextFieldComponent(page, 'Name');
        await editNameField.clear();
        await editNameField.setValue('Morning Commute');

        await page.getByRole('button', { name: 'Save' }).click();
        await pause(500);

        await expect(stepBlock.locator('Morning Commute')).toBeVisible({ timeout: 5000 });

        await stepBlock.click('Morning Commute');
        await expect(page).toHaveURL(/\/steps\//, { timeout: 5000 });

        await page.getByRole('button', { name: /edit/i }).click();
        await pause(500);

        await page.getByRole('button', { name: /Delete/ }).click();
        await pause(500);

        await expect(page).toHaveURL(/\/itineraries/, { timeout: 5000 });
    });

    test('TC-40: create after mode (add below)', async ({ page }) => {
        await setupPlanForSteps(page);

        await page.getByRole('button', { name: 'Add Step' }).click();
        await pause(500);

        const nameField = TextFieldComponent(page, 'Name');
        await nameField.setValue('Breakfast');

        const participantPicker = ParticipantPickerComponent(page);
        await participantPicker.addByName('Alice Smith');

        const locationPicker = LocationPickerComponent(page, 'Location');
        await locationPicker.setValue('Home');

        const startTime = TimeSelectorComponent(page, 'Start Time');
        await startTime.setValue('Morning');

        const endTime = TimeSelectorComponent(page, 'End Time');
        await endTime.setValue('Noon');

        await page.getByRole('button', { name: 'Create' }).click();
        await pause(500);

        const stepBlock = StepBlockComponent(page);
        await expect(stepBlock.locator('Breakfast')).toBeVisible({ timeout: 5000 });

        await stepBlock.addBelow('Breakfast');
        await pause(500);

        const modeToggle = ToggleButtonGroupComponent(page, null);
        await expect(modeToggle.locator.getByRole('button', { name: 'After' })).toHaveAttribute('aria-pressed', 'true', { timeout: 5000 });

        const meetingName = TextFieldComponent(page, 'Name');
        await meetingName.setValue('Meeting');

        const durationHours = TextFieldComponent(page, 'Hours');
        await durationHours.setValue('1');
        const durationMin = TextFieldComponent(page, 'Min');
        await durationMin.setValue('30');

        const meetingParticipants = ParticipantPickerComponent(page);
        await meetingParticipants.addByName('Bob Jones');

        await page.getByRole('button', { name: 'Create' }).click();
        await pause(500);

        await expect(stepBlock.locator('Meeting')).toBeVisible({ timeout: 5000 });
    });

    test('TC-41: create before mode (add above)', async ({ page }) => {
        await setupPlanForSteps(page);

        await page.getByRole('button', { name: 'Add Step' }).click();
        await pause(500);

        const nameField = TextFieldComponent(page, 'Name');
        await nameField.setValue('Dinner');

        const participantPicker = ParticipantPickerComponent(page);
        await participantPicker.addByName('Alice Smith');

        const locationPicker = LocationPickerComponent(page, 'Location');
        await locationPicker.setValue('Home');

        const startTime = TimeSelectorComponent(page, 'Start Time');
        await startTime.setValue('Noon');

        const endTime = TimeSelectorComponent(page, 'End Time');
        await endTime.setValue('Evening');

        await page.getByRole('button', { name: 'Create' }).click();
        await pause(500);

        const stepBlock = StepBlockComponent(page);
        await expect(stepBlock.locator('Dinner')).toBeVisible({ timeout: 5000 });

        await stepBlock.addAbove('Dinner');
        await pause(500);

        const modeToggle = ToggleButtonGroupComponent(page, null);
        await expect(modeToggle.locator.getByRole('button', { name: 'Before' })).toHaveAttribute('aria-pressed', 'true', { timeout: 5000 });

        const travelName = TextFieldComponent(page, 'Name');
        await travelName.setValue('Travel');

        const durationHours = TextFieldComponent(page, 'Hours');
        await durationHours.setValue('0');
        const durationMin = TextFieldComponent(page, 'Min');
        await durationMin.setValue('45');

        const travelParticipants = ParticipantPickerComponent(page);
        await travelParticipants.addByName('Bob Jones');

        await page.getByRole('button', { name: 'Create' }).click();
        await pause(500);

        await expect(stepBlock.locator('Travel')).toBeVisible({ timeout: 5000 });
    });

    test('TC-42: create with travel (compound)', async ({ page }) => {
        await setupPlanForSteps(page);

        await page.getByRole('button', { name: 'Add Step' }).click();
        await pause(500);

        const nameField = TextFieldComponent(page, 'Name');
        await nameField.setValue('Breakfast');

        const participantPicker = ParticipantPickerComponent(page);
        await participantPicker.addByName('Alice Smith');

        const locationPicker = LocationPickerComponent(page, 'Location');
        await locationPicker.setValue('Home');

        const startTime = TimeSelectorComponent(page, 'Start Time');
        await startTime.setValue('Morning');

        const endTime = TimeSelectorComponent(page, 'End Time');
        await endTime.setValue('Noon');

        await page.getByRole('button', { name: 'Create' }).click();
        await pause(500);

        const stepBlock = StepBlockComponent(page);
        await expect(stepBlock.locator('Breakfast')).toBeVisible({ timeout: 5000 });

        await stepBlock.addBelow('Breakfast');
        await pause(500);

        const meetingName = TextFieldComponent(page, 'Name');
        await meetingName.setValue('Meeting');

        const meetingLocation = LocationPickerComponent(page, 'Location');
        await meetingLocation.setValue('Office');

        const travelSwitch = SwitchComponent(page, 'Include travel time');
        await expect(travelSwitch.locator).toBeVisible({ timeout: 5000 });
        await travelSwitch.toggle();
        await pause(500);

        const travelModeSection = page.locator('text=Travel Mode').locator('..');
        const travelMode = ToggleButtonGroupComponent(page, travelModeSection);
        await travelMode.setValue('Drive');

        await page.getByRole('button', { name: /Preview Routes/ }).click();
        await pause(500);
        await expect(page.getByText(/\d+ min/).first()).toBeVisible({ timeout: 15000 });
        await page.getByText(/\d+ min/).first().click();
        await pause(300);

        const durationHours = page.getByLabel('Hours', { exact: true }).last();
        await durationHours.click();
        await durationHours.fill('1');
        await pause(400);
        const durationMin = page.getByLabel('Min', { exact: true }).last();
        await durationMin.click();
        await durationMin.fill('0');
        await pause(400);

        await page.getByRole('button', { name: 'Create' }).click();
        await expect(stepBlock.locator('Meeting')).toBeVisible({ timeout: 15000 });

        const visibleNames = await stepBlock.getVisibleStepNames();
        expect(visibleNames.length).toBeGreaterThanOrEqual(3);
    });

    test('TC-43: create from-till without route (non-route step)', async ({ page }) => {
        await setupPlanForSteps(page);

        await page.getByRole('button', { name: 'Add Step' }).click();
        await pause(500);

        const nameField = TextFieldComponent(page, 'Name');
        await nameField.setValue('Free Time');

        const participantPicker = ParticipantPickerComponent(page);
        await participantPicker.addByName('Alice Smith');

        const locationPicker = LocationPickerComponent(page, 'Location');
        await locationPicker.setValue('Home');

        const startTime = TimeSelectorComponent(page, 'Start Time');
        await startTime.setValue('Morning');

        const endTime = TimeSelectorComponent(page, 'End Time');
        await endTime.setValue('Noon');

        await page.getByRole('button', { name: 'Create' }).click();
        await pause(500);

        const stepBlock = StepBlockComponent(page);
        await expect(stepBlock.locator('Free Time')).toBeVisible({ timeout: 5000 });

        await stepBlock.click('Free Time');
        await expect(page).toHaveURL(/\/steps\//, { timeout: 5000 });

        await expect(page.getByText('Home')).toBeVisible({ timeout: 5000 });
        await expect(page.getByText('Directions')).not.toBeVisible({ timeout: 3000 });
    });

    test('TC-44: remove destination toggle', async ({ page }) => {
        await setupPlanForSteps(page);

        await page.getByRole('button', { name: 'Add Step' }).click();
        await pause(500);

        const nameField = TextFieldComponent(page, 'Name');
        await nameField.setValue('Test Step');

        const locationPicker = LocationPickerComponent(page, 'Location');
        await locationPicker.setValue('Home');

        await page.getByRole('button', { name: /Add Destination/ }).click();
        await pause(500);

        await expect(page.locator('text=Travel Mode')).toBeVisible({ timeout: 5000 });

        await expect(page.getByRole('button', { name: /Remove Destination/ })).toBeVisible({ timeout: 5000 });

        await page.getByRole('button', { name: /Remove Destination/ }).click();
        await pause(500);

        await expect(page.locator('text=Travel Mode')).not.toBeVisible({ timeout: 5000 });
        await expect(page.getByLabel('Start Time').or(page.getByLabel('End Time')).first()).toBeVisible({ timeout: 5000 });
    });

    test('TC-59: add above not shown when chained', async ({ page }) => {
        await setupPlanForSteps(page);

        await page.getByRole('button', { name: 'Add Step' }).click();
        await pause(500);

        const nameA = TextFieldComponent(page, 'Name');
        await nameA.setValue('Step A');

        const participantsA = ParticipantPickerComponent(page);
        await participantsA.addByName('Alice Smith');

        const locationA = LocationPickerComponent(page, 'Location');
        await locationA.setValue('Home');

        const startTimeA = TimeSelectorComponent(page, 'Start Time');
        await startTimeA.setValue('Morning');

        const endTimeA = TimeSelectorComponent(page, 'End Time');
        await endTimeA.setValue('Noon');

        await page.getByRole('button', { name: 'Create' }).click();
        await pause(500);

        const stepBlock = StepBlockComponent(page);
        await expect(stepBlock.locator('Step A')).toBeVisible({ timeout: 5000 });

        await page.getByRole('button', { name: 'Add Step' }).click();
        await pause(500);

        const nameB = TextFieldComponent(page, 'Name');
        await nameB.setValue('Step B');

        const participantsB = ParticipantPickerComponent(page);
        await participantsB.addByName('Alice Smith');

        const locationB = LocationPickerComponent(page, 'Location');
        await locationB.setValue('Home');

        const startTimeB = TimeSelectorComponent(page, 'Start Time');
        await startTimeB.setValue('Noon');

        const endTimeB = TimeSelectorComponent(page, 'End Time');
        await endTimeB.setValue('Evening');

        await page.getByRole('button', { name: 'Create' }).click();
        await pause(500);

        await expect(stepBlock.locator('Step B')).toBeVisible({ timeout: 5000 });

        await stepBlock.hover('Step B');

        const blockB = stepBlock.locator('Step B');
        const buttonsAboveB = blockB.getByRole('button');
        const buttonCount = await buttonsAboveB.count();
        if (buttonCount > 0) {
            const firstButtonY = await buttonsAboveB.first().boundingBox();
            const blockBBox = await blockB.boundingBox();
            expect(firstButtonY.y).toBeGreaterThanOrEqual(blockBBox.y);
        }
    });

    test('TC-60: add below not shown when chained', async ({ page }) => {
        await setupPlanForSteps(page);

        await page.getByRole('button', { name: 'Add Step' }).click();
        await pause(500);

        const nameA = TextFieldComponent(page, 'Name');
        await nameA.setValue('Step A');

        const participantsA = ParticipantPickerComponent(page);
        await participantsA.addByName('Alice Smith');

        const locationA = LocationPickerComponent(page, 'Location');
        await locationA.setValue('Home');

        const startTimeA = TimeSelectorComponent(page, 'Start Time');
        await startTimeA.setValue('Morning');

        const endTimeA = TimeSelectorComponent(page, 'End Time');
        await endTimeA.setValue('Noon');

        await page.getByRole('button', { name: 'Create' }).click();
        await pause(500);

        const stepBlock = StepBlockComponent(page);
        await expect(stepBlock.locator('Step A')).toBeVisible({ timeout: 5000 });

        await page.getByRole('button', { name: 'Add Step' }).click();
        await pause(500);

        const nameB = TextFieldComponent(page, 'Name');
        await nameB.setValue('Step B');

        const participantsB = ParticipantPickerComponent(page);
        await participantsB.addByName('Alice Smith');

        const locationB = LocationPickerComponent(page, 'Location');
        await locationB.setValue('Home');

        const startTimeB = TimeSelectorComponent(page, 'Start Time');
        await startTimeB.setValue('Noon');

        const endTimeB = TimeSelectorComponent(page, 'End Time');
        await endTimeB.setValue('Evening');

        await page.getByRole('button', { name: 'Create' }).click();
        await pause(500);

        await expect(stepBlock.locator('Step B')).toBeVisible({ timeout: 5000 });

        await stepBlock.hover('Step A');

        const blockA = stepBlock.locator('Step A');
        const buttonsOnA = blockA.getByRole('button');
        const buttonCount = await buttonsOnA.count();
        if (buttonCount > 0) {
            const lastButtonBox = await buttonsOnA.last().boundingBox();
            const blockABox = await blockA.boundingBox();
            expect(lastButtonBox.y + lastButtonBox.height).toBeLessThanOrEqual(blockABox.y + blockABox.height);
        }
    });

    test('TC-72: travel mode color bar and name visibility', async ({ page }) => {
        await setupPlanForSteps(page);

        await page.getByRole('button', { name: 'Add Step' }).click();
        await pause(500);

        const nameField = TextFieldComponent(page, 'Name');
        await nameField.setValue('Drive to Office');

        const participantPicker = ParticipantPickerComponent(page);
        await participantPicker.addByName('Alice Smith');

        const locationPicker = LocationPickerComponent(page, 'Location');
        await locationPicker.setValue('Home');

        await page.getByRole('button', { name: /Add Destination/ }).click();
        await pause(500);

        const destinationPicker = LocationPickerComponent(page, 'Destination');
        await destinationPicker.setValue('Office');

        const travelModeSection = page.locator('text=Travel Mode').locator('..');
        const travelMode = ToggleButtonGroupComponent(page, travelModeSection);
        await travelMode.setValue('Drive');

        const departureTime = TimeSelectorComponent(page, 'Departure Time');
        await departureTime.setValue('Morning');

        await page.getByRole('button', { name: /Preview Routes/ }).click();
        await pause(500);
        await expect(page.getByText(/\d+ min/).first()).toBeVisible({ timeout: 15000 });
        await page.getByText(/\d+ min/).first().click();
        await pause(300);

        await page.getByRole('button', { name: 'Create' }).click();
        await pause(500);

        const stepBlock = StepBlockComponent(page);
        await expect(stepBlock.locator('Drive to Office')).toBeVisible({ timeout: 5000 });

        await page.getByRole('button', { name: 'Add Step' }).click();
        await pause(500);

        const shortName = TextFieldComponent(page, 'Name');
        await shortName.setValue('Quick Break');

        const shortParticipants = ParticipantPickerComponent(page);
        await shortParticipants.addByName('Alice Smith');

        const shortLocation = LocationPickerComponent(page, 'Location');
        await shortLocation.setValue('Office');

        const shortStart = TimeSelectorComponent(page, 'Start Time');
        await shortStart.setValue('Morning');

        const shortEnd = TimeSelectorComponent(page, 'End Time');
        await shortEnd.setValue('Noon');

        await page.getByRole('button', { name: 'Create' }).click();
        await pause(500);

        await page.getByRole('button', { name: 'Add Step' }).click();
        await pause(500);

        const longName = TextFieldComponent(page, 'Name');
        await longName.setValue('Work Session');

        const longParticipants = ParticipantPickerComponent(page);
        await longParticipants.addByName('Alice Smith');

        const longLocation = LocationPickerComponent(page, 'Location');
        await longLocation.setValue('Office');

        const longStart = TimeSelectorComponent(page, 'Start Time');
        await longStart.setValue('Noon');

        const longEnd = TimeSelectorComponent(page, 'End Time');
        await longEnd.setValue('Evening');

        await page.getByRole('button', { name: 'Create' }).click();
        await pause(500);

        await expect(stepBlock.locator('Work Session')).toBeVisible({ timeout: 5000 });

        const visibleNames = await stepBlock.getVisibleStepNames();
        expect(visibleNames).toContain('Work Session');
    });
});
