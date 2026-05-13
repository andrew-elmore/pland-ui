const headed = process.env.E2E_HEADED === 'true';
const multiplier = parseFloat(process.env.E2E_DELAY_MULTIPLIER) || 1;

/**
 * Delays execution in headed mode so a human can follow the test visually.
 * Resolves immediately in headless mode (zero overhead). The actual delay
 * is `ms * E2E_DELAY_MULTIPLIER` — set the multiplier via env var or the
 * `e2e.sh` second argument (e.g. `./e2e.sh headed 3`).
 *
 * Every component method that changes the UI should call `pause()` after
 * the action completes.
 *
 * @param {number} ms - Base delay in milliseconds (before multiplier).
 * @returns {Promise<void>}
 */
const pause = (ms) => headed ? new Promise(r => setTimeout(r, ms * multiplier)) : Promise.resolve();

export default pause;
