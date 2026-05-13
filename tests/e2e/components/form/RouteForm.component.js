import LocationPickerComponent from '../input/LocationPicker.component.js';
import TimeSelectorComponent from '../input/TimeSelector.component.js';
import TextFieldComponent from '../input/TextField.component.js';
import ToggleButtonGroupComponent from '../input/ToggleButtonGroup.component.js';
import pause from '../../utils/pause.js';

/**
 * Playwright form component for `<RouteForm>` (`src/features/step/RouteForm.jsx`).
 *
 * Complex form for configuring a route between two locations within a step.
 * Contains:
 *   - Origin / Destination: `LocationPicker` inputs for selecting locations
 *   - Travel Mode: `ToggleButtonGroup` with Drive, Walk, Transit options
 *   - Time Mode: `ToggleButtonGroup` with Leave At / Arrive By options
 *   - Departure/Arrival Time: `TimeSelector` inputs (label changes with time mode)
 *   - Padding: Hours and Min text fields for buffer time
 *
 * This form does not have a traditional submit button. The primary action
 * is "Preview Routes" / "Refresh Routes" which fetches route options from
 * the API. `submit()` calls `previewRoutes()`.
 *
 * Additional methods beyond the standard form interface:
 *   - `selectTransitMode(name)` — toggles a transit sub-mode chip (Bus,
 *     Subway, Train, Tram, Ferry) when Travel Mode is Transit
 *   - `previewRoutes()` — clicks the Preview/Refresh Routes button
 *
 * @param {import('@playwright/test').Page} page
 * @returns {{
 *   fields: { origin: object, destination: object, travelMode: object, timeMode: object, departureTime: object, arrivalTime: object, paddingHours: object, paddingMin: object },
 *   fill: (data: { origin?: string, destination?: string, travelMode?: string, timeMode?: string, departureTime?: string, arrivalTime?: string, paddingHours?: string, paddingMin?: string }) => Promise<void>,
 *   selectTransitMode: (modeName: string) => Promise<void>,
 *   previewRoutes: () => Promise<void>,
 *   submit: () => Promise<void>,
 *   fillAndSubmit: (data: object) => Promise<void>
 * }}
 */
export default function RouteFormComponent(page) {
    const travelModeSection = page.locator('text=Travel Mode').locator('..');
    const timeModeSection = page.locator('text=Time Mode').locator('..');

    const fields = {
        origin: LocationPickerComponent(page, 'Origin'),
        destination: LocationPickerComponent(page, 'Destination'),
        travelMode: ToggleButtonGroupComponent(page, travelModeSection),
        timeMode: ToggleButtonGroupComponent(page, timeModeSection),
        departureTime: TimeSelectorComponent(page, 'Departure Time'),
        arrivalTime: TimeSelectorComponent(page, 'Arrival Time'),
        paddingHours: TextFieldComponent(page, 'Hours'),
        paddingMin: TextFieldComponent(page, 'Min'),
    };

    return {
        fields,

        async fill(data) {
            if (data.origin) await fields.origin.setValue(data.origin);
            if (data.destination) await fields.destination.setValue(data.destination);
            if (data.travelMode) await fields.travelMode.setValue(data.travelMode);
            if (data.timeMode) await fields.timeMode.setValue(data.timeMode);
            if (data.departureTime) await fields.departureTime.setValue(data.departureTime);
            if (data.arrivalTime) await fields.arrivalTime.setValue(data.arrivalTime);
            if (data.paddingHours) await fields.paddingHours.setValue(data.paddingHours);
            if (data.paddingMin) await fields.paddingMin.setValue(data.paddingMin);
        },

        async selectTransitMode(modeName) {
            await page.getByRole('button', { name: modeName }).click();
            await pause(300);
        },

        async previewRoutes() {
            await page.getByRole('button', { name: /Preview Routes|Refresh Routes/ }).click();
            await pause(500);
        },

        async submit() {
            await this.previewRoutes();
        },

        async fillAndSubmit(data) {
            await this.fill(data);
            await this.submit();
        },
    };
}
