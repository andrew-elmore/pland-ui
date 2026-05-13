# Input Component Standards

One component per input type. Wraps Playwright interactions so tests never deal with implementation details. Covers both MUI primitives and custom app inputs.

## Pattern

```javascript
import pause from '../../utils/pause.js';

export default function TextFieldComponent(page, label) {
    const input = page.getByLabel(label);

    return {
        async setValue(value) {
            await input.click();
            await input.fill(String(value));
            await pause(400);
        },

        async getValue() {
            return input.inputValue();
        },

        async clear() {
            await input.clear();
            await pause(300);
        },

        locator: input,
    };
}
```

## Required Interface

Every input component must expose:

- `setValue(value)` — set the input to a value, with pause
- `getValue()` — return the current value
- `locator` — the raw Playwright locator for custom assertions

Optional methods depending on input type:

- `clear()` — for text-based inputs (TextField, Autocomplete)
- `toggle()` — for boolean inputs (Checkbox, Switch)
- `selectIndex(n)` — for list-based inputs (Autocomplete)

## Naming

`{ComponentName}.component.js` — matches the MUI component name for primitives, or the React component name for custom inputs.

## Constructor Signature

Most: `(page, label)` — locates the input via `page.getByLabel(label)`.

Exception: `ToggleButtonGroup` takes `(page, parentLocator)` and locates via `[role="group"]` since toggle groups don't have a single label.

## Existing Components

### MUI Primitives

| File | MUI Component | Constructor | Locator strategy |
|---|---|---|---|
| `TextField.component.js` | `<TextField>` | `(page, label)` | `page.getByLabel(label)` |
| `Autocomplete.component.js` | `<Autocomplete>` | `(page, label)` | `page.getByLabel(label)` on the inner input |
| `ToggleButtonGroup.component.js` | `<ToggleButtonGroup>` | `(page, parentLocator)` | `[role="group"]` scoped to parent |
| `Checkbox.component.js` | `<Checkbox>` | `(page, label)` | `page.getByLabel(label)` |
| `Switch.component.js` | `<Switch>` | `(page, label)` | `page.getByLabel(label)` |

### Custom App Inputs

Custom inputs from `src/features/` that combine MUI primitives with app-specific behavior (inline create, multi-select with groups, etc.).

| File | App Component | Constructor | Extra methods |
|---|---|---|---|
| `LocationPicker.component.js` | `<LocationPicker>` | `(page, label)` | `createAndSelect({ name, search })` |
| `ParticipantPicker.component.js` | `<ParticipantPicker>` | `(page)` | `addByName(name)`, `addMultiple(names)`, `selectGroup(name)`, `createAndSelect({ firstName, lastName, email })` |
| `TimeSelector.component.js` | `<TimeSelector>` | `(page, label)` | `createAndSelect({ label, datetime })`, `swap()` |
| `TimelineTrack.component.js` | `<TimelineTrack>` | `(page)` | `dragNodeByLabel(label, deltaY)`, `clickLabel(label)`, `getNodeLabels()`, `getNodeCount()` |
| `StepBlock.component.js` | `<StepBlock>` | `(page)` | `click(name)`, `hover(name)`, `addAbove(name)`, `addBelow(name)`, `isVisible(name)`, `getVisibleStepNames()` |

Custom input components follow the same factory pattern but may expose additional methods for multi-step interactions.

### Itinerary Visual Components

Components that interact with the itinerary timeline view. These do not follow the standard `setValue`/`getValue` interface because they are pointer-driven or navigation-driven rather than value-driven.

| File | App Component | Constructor | Interaction model |
|---|---|---|---|
| `TimelineTrack.component.js` | `<TimelineTrack>` | `(page)` | Drag time nodes vertically to adjust values. Nodes snap to 60s intervals. |
| `StepBlock.component.js` | `<StepBlock>` | `(page)` | Click to navigate to step. Hover to reveal "+" buttons for adding adjacent steps. |

## Inline Create Pattern

Some custom inputs have a "+" button that opens an inline create form (e.g., create a new location without leaving the step form). When this is the case:

- The **input component** owns `createAndSelect(data)` as the public API. It clicks the "+" button, then instantiates and delegates to the corresponding **form component** in `../form/`.
- The **form component** (e.g., `LocationCreateForm`) lives in `../form/` and handles filling and submitting the inline create form.
- Callers only interact with the input component — the form delegation is internal.

```javascript
import LocationCreateFormComponent from '../form/LocationCreateForm.component.js';

async createAndSelect(data) {
    await addButton.click();
    await pause(300);
    const form = LocationCreateFormComponent(page);
    await form.fillAndSubmit(data);
},
```

This keeps input components as the single interface for all interactions with that input, while the form components remain independently usable and testable.

## Adding a New Input Component

1. Create `{ComponentName}.component.js` in this directory
2. Default export a factory function
3. Expose `setValue`, `getValue`, and `locator` at minimum
4. Call `pause()` after every user-visible action
5. Use semantic locators (`getByLabel`, `getByRole`), never MUI class selectors
6. If the input has an inline create form, create a corresponding form component in `../form/` and add a `createAndSelect(data)` method that clicks the "+" button and delegates to it

## Rules

- Default export, factory function (not a class)
- Import `pause` from `../../utils/pause.js`
- Call `pause()` after every action that changes the UI — this is what makes headed mode watchable
- Never use MUI CSS class selectors (`.MuiTextField-root`, etc.) — they break across versions
- The component must work regardless of where the input appears on the page — the `label` parameter is the only coupling to a specific instance
