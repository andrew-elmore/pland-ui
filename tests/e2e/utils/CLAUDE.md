# Utils Standards

Shared infrastructure that components, flows, and specs depend on.

## Current Utils

### `pause.js`

Headed-mode delay function used by all components.

```javascript
const headed = process.env.E2E_HEADED === 'true';
const multiplier = parseFloat(process.env.E2E_DELAY_MULTIPLIER) || 1;

const pause = (ms) => headed ? new Promise(r => setTimeout(r, ms * multiplier)) : Promise.resolve();

export default pause;
```

- In headless mode: resolves immediately (zero overhead)
- In headed mode: pauses for `ms * multiplier` milliseconds
- The multiplier is set via `E2E_DELAY_MULTIPLIER` env var (default 1)

## Rules

- Utils are leaf dependencies — they never import from components, flows, or specs
- Default export for single-purpose files (`pause.js`)
- Named exports for files with multiple related functions
- Utils handle infrastructure concerns (timing, config, environment) — not domain logic or page interaction
- If it takes `page` as an argument, it's not a util — it belongs in components or flows

## When to Add a Util

Add a util when:

- Multiple components or flows need the same non-domain logic
- The logic is about test infrastructure, not user interaction

Do not add a util for:

- Domain-specific helpers (those are flows)
- One-off functions used by a single file (keep it local)
