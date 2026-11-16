# E2E Testing Standards

Playwright-based end-to-end tests using the Page Object Model pattern.

## Architecture

```
tests/e2e/
├── components/
│   ├── input/     # One wrapper per MUI input type (TextField, Autocomplete, etc.)
│   └── form/      # One wrapper per app form, composes input components
├── flows/         # Reusable multi-step user journeys (sign in, create plan, etc.)
├── specs/         # Test files — the only place test() blocks live
└── utils/         # Shared infrastructure (pause, config helpers)
```

Flows compose form and input components into reusable multi-step journeys that specs can call as setup or as the test itself.

## Running Tests

All tests run through `e2e.sh` in the repo root, which manages MongoDB, the API, and the UI:

```bash
./e2e.sh                    # headless, 1x delay
./e2e.sh headed             # headed, 1x delay
./e2e.sh headed 3           # headed, 3x delay (slow for watching)
./e2e.sh headed 1 report    # headed, open HTML report after
```

Never run `npx playwright test` directly — it won't have the database or services running.

## Environment Variables

| Variable | Set by | Purpose |
|---|---|---|
| `E2E_HEADED` | `e2e.sh` | `"true"` when running headed — components add visual pauses |
| `E2E_DELAY_MULTIPLIER` | `e2e.sh` | Scales all headed pauses (default `1`) |

## Headed Mode Pauses

Every user-visible interaction (fill, click, toggle) must call `pause()` from `utils/pause.js` after the action. This does nothing in headless mode. In headed mode it pauses so a human can follow along. The multiplier scales all pauses globally.

Pause values are base milliseconds passed to `pause()`. Choose values that feel right at 1x:

- **200ms** — minor transitions (clear, escape)
- **300ms** — secondary actions (dropdown open, option select)
- **400ms** — primary actions (fill, toggle, check)
- **500ms** — form submissions (button click)

## Locator Strategy

Prefer Playwright's semantic locators in this order:

1. `page.getByLabel('Email')` — for labeled inputs
2. `page.getByRole('button', { name: 'New Plan' })` — for buttons and interactive elements
3. `page.getByText('My Plans')` — for assertions on visible text
4. `page.locator('form')` — scoping to resolve ambiguity (e.g., two "Create" buttons)

Never use CSS class selectors from MUI (`.MuiButton-root`). They are implementation details and break across versions.

## File Naming

| Directory | Pattern | Example |
|---|---|---|
| `components/` | `{Name}.component.js` | `TextField.component.js` |
| `flows/` | `{domain}.js` | `auth.js` |
| `specs/` | `{domain}.spec.js` | `auth.spec.js` |
| `utils/` | `{name}.js` | `pause.js` |

## Dependency Direction

```
specs → flows → components → utils
specs → components → utils
specs → utils
```

Components never import from flows or specs. Flows never import from specs. Utils never import from anything in this tree.

## Adding a New Form

When a new form is created in `src/features/`:

1. Identify its inputs — check which MUI components it uses
2. If an input component doesn't exist yet, create it in `components/`
3. Create a `{FormName}Form.component.js` that composes the input components
4. If the form is part of a common journey, add or extend a flow in `flows/`
5. Write the spec in `specs/`
