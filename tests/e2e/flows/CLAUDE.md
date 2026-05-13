# Flow Standards

Reusable multi-step user journeys that compose components into common sequences.

## Purpose

Flows extract repeated test setup and common user paths so specs stay focused on what they're actually testing. A flow is the right abstraction when multiple specs need the same multi-step sequence (e.g., every test that requires an authenticated user should call `loginOrRegister`, not duplicate the login steps).

## Pattern

```javascript
import { expect } from '@playwright/test';
import LoginFormComponent from '../components/LoginForm.component.js';
import RegisterFormComponent from '../components/RegisterForm.component.js';

const defaultUser = {
    firstName: 'Test',
    lastName: 'User',
    email: 'test@e2e.local',
    password: 'Password123!',
};

export async function loginOrRegister(page, user = defaultUser) {
    await page.goto('/login');
    const loginForm = LoginFormComponent(page);
    await loginForm.fillAndSubmit({ email: user.email, password: user.password });

    const loggedIn = await page.getByText('My Plans').isVisible({ timeout: 3000 }).catch(() => false);

    if (!loggedIn) {
        await page.goto('/register');
        const registerForm = RegisterFormComponent(page);
        await registerForm.fillAndSubmit(user);
    }

    await expect(page.getByText('My Plans')).toBeVisible({ timeout: 10000 });
}
```

## Rules

- Named exports, not default exports — a flow file can export multiple related flows
- Every flow takes `page` as its first argument
- Provide sensible defaults for data arguments so callers can use the flow with zero config
- Flows own their navigation (`page.goto`) — the caller should not need to navigate before calling a flow
- Flows assert their own completion state — the caller should be able to trust that the flow succeeded without adding their own assertions for the flow's outcome
- Flows compose components from `../components/` and may import `expect` from Playwright
- Flows never import from `../specs/` or other flows
- A flow file is organized by domain: `auth.js`, `plan.js`, `step.js`

## When to Create a Flow

Create a flow when:

- Two or more specs need the same multi-step sequence
- A sequence involves conditional logic (e.g., login, fall back to register)
- A setup sequence is long enough that inlining it obscures the spec's intent

Do not create a flow for:

- A single action (that's a component method)
- Logic only one spec uses (inline it in the spec)

## Naming

Files are named by domain: `auth.js`, `plan.js`, `step.js`.

Functions are named by what they accomplish: `loginOrRegister`, `createPlan`, `addStepToPlan`. The name should make the spec read like a sentence:

```javascript
await loginOrRegister(page);
await createPlan(page, { name: 'Weekend Trip' });
```
