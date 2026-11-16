# Form Component Standards

One component per app form. Composes input components into a data-driven interface so tests can fill and submit a form with a single object.

## Pattern

```javascript
import TextFieldComponent from '../input/TextField.component.js';
import pause from '../../utils/pause.js';

export default function PlanCreateFormComponent(page) {
    const fields = {
        name: TextFieldComponent(page, 'Plan Name'),
        description: TextFieldComponent(page, 'Description'),
    };

    return {
        fields,

        async fill(data) {
            if (data.name) await fields.name.setValue(data.name);
            if (data.description) await fields.description.setValue(data.description);
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
```

## Required Interface

Every form component must expose:

- `fields` — object of input components, keyed by field name
- `fill(data)` — fill fields from a data object, only setting fields present in data
- `submit()` — click the form's submit button, with pause
- `fillAndSubmit(data)` — fill then submit

## Two Types of Form Components

### Standalone Forms

Full-page or dialog forms like `PlanCreateForm`, `ParticipantForm`. Called directly by flows and specs.

### Inline Create Forms

Small forms that appear inside a custom input when the user clicks "+". Named `{Entity}CreateForm.component.js` (e.g., `LocationCreateForm`, `ParticipantCreateForm`, `TimeCreateForm`). These are not called directly by specs — they are instantiated by the parent input component's `createAndSelect(data)` method. They exist here so the form-filling logic is separated from the input's selection logic.

## Naming

- `{FormName}Form.component.js` — standalone forms, matches the React component in `src/features/`
- `{Entity}CreateForm.component.js` — inline create forms, matches the entity being created

## Constructor Signature

Always `(page)` — label strings are hardcoded inside the component to match the form's actual labels.

## Rules

- Default export, factory function (not a class)
- Import input components from `../input/` and `pause` from `../../utils/pause.js`
- `fill()` must guard each field with `if (data.fieldName)` — callers may pass partial data
- `submit()` must scope the button locator to avoid ambiguity when the same button label exists elsewhere on the page (e.g., `page.locator('form').getByRole(...)`)
- `data` object keys must match the field names used in the React component's `onChange(field, value)` contract
- A form component mirrors a single React form component in `src/features/` — one-to-one mapping

## Adding a New Form Component

When a new form is created in `src/features/`:

1. Check which MUI input types the form uses
2. Create any missing input components in `../input/` first
3. Create `{FormName}Form.component.js` in this directory
4. Wire up `fields` using input components with the labels from the React form
5. Implement `fill`, `submit`, `fillAndSubmit`
6. Test the submit button locator — if the button text appears elsewhere on the page, scope it to `page.locator('form')`
