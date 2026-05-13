# Spec Standards

Test files — the only place `test()` blocks live.

## Pattern

```javascript
import { test, expect } from '@playwright/test';
import { loginOrRegister } from '../flows/auth.js';

test.describe('Auth', () => {
    test('login or register', async ({ page }) => {
        await loginOrRegister(page);
    });
});
```

## Rules

- One `test.describe` per file, named after the domain
- File named `{domain}.spec.js` — must use `.spec.js` extension (Playwright's `testMatch` is configured for `**/*.spec.js`)
- Specs import from `../flows/` and `../components/`, never from other specs
- Use flows for setup, components for direct interaction, `expect` for assertions
- Keep specs short — if a spec has more than ~15 lines of setup before the actual assertion, that setup should be a flow

## Structure

A spec should read top-to-bottom as a user story:

1. **Setup** — call flows to reach the starting state (e.g., `loginOrRegister`)
2. **Act** — interact with the page using components or direct locators
3. **Assert** — verify the outcome with `expect`

```javascript
test('create a new plan', async ({ page }) => {
    await loginOrRegister(page);

    await page.getByRole('button', { name: 'New Plan' }).click();
    const planName = TextFieldComponent(page, 'Plan Name');
    await planName.setValue('Weekend Trip');
    await page.getByRole('button', { name: 'Create' }).click();

    await expect(page.getByText('Weekend Trip')).toBeVisible();
});
```

## What to Test

Test complete user journeys and critical paths:

- Auth flows (login, register)
- CRUD operations on core entities (plans, steps, times)
- Multi-step workflows that cross entity boundaries

Do not test:

- Individual component rendering
- Static content
- Every validation permutation
- Anything that would only break in an obvious, visible way

## Assertions

- Use `expect(locator).toBeVisible()` for presence checks
- Use `expect(locator).toHaveText()` for content checks
- Always pass `{ timeout: N }` on assertions that depend on network requests or navigation
- 3000ms for fast operations (login redirect)
- 10000ms for operations involving API calls and re-renders

## Test Independence

Every spec must work in isolation against a blank database. The e2e.sh script starts a fresh MongoDB for each run. Do not assume any data exists — use flows to create prerequisite state.
