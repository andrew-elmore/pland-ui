import { useEffect, useRef, useCallback } from 'react';
import { useDispatch } from 'react-redux';

/**
 * Watches a save lifecycle and fires callbacks when a tracked submit resolves.
 *
 * Replaces the hand-rolled `didSubmitRef` / `prevSavingRef` pattern that
 * duplicated itself across every modal with a save flow. Dispatch via the
 * returned `submit(action)` — do not dispatch the action separately.
 *
 * ---
 * ## Contract: `isMutating` must have a single live subscriber
 *
 * The hook detects completion by watching `isMutating` transition from `true`
 * to `false`. If two components subscribe to the **same** `isMutating` boolean
 * and both have pending saves, the first one to resolve flips the flag to
 * `false` and **both** hooks will fire their callbacks — even though only
 * one save has actually completed. The second hook's real resolution
 * produces no edge and is silently lost: a failure gets swallowed, or a
 * "Saved!" toast appears for a save that hasn't actually happened yet.
 * This is the worst class of bug — the user sees success while the backend
 * holds stale data.
 *
 * The `isMutating` value you pass **must** be scoped so that exactly one live
 * hook can observe it at a time. Two valid ways to satisfy that:
 *
 * 1. **Singleton consumer.** Only one component in the app subscribes to
 *    this slice's saving flag, and that component cannot be mounted twice
 *    concurrently. Suitable for one-off admin modals.
 *
 * 2. **Per-record saving state.** The slice tracks saving state keyed by
 *    record id (e.g. `state.managementAgent.saving[id]`) and each hook
 *    subscribes only to its own slot via a per-record selector. Required
 *    for list screens, bulk edit, inline row editors, or anywhere two
 *    saves can be in flight at once. See the reducer template in
 *    `src/store/README.md`.
 *
 * If you cannot satisfy one of those conditions, do **not** use this hook.
 * Use `dispatch(action).then(...)` directly, or introduce per-record
 * saving state first.
 *
 * ---
 * ## Example (per-record case)
 *
 * ```jsx
 * const isMutating = useSelector((s) =>
 *     managementAgentSelectors.isMutatingId(s, agent.id));
 * const errorText = useSelector((s) =>
 *     managementAgentSelectors.errorForId(s, agent.id));
 *
 * const submit = useMutateEffect(isMutating, errorText, {
 *     onSuccess: () => { onClose(); showToast('Saved'); },
 *     onError: (err) => showError(err),
 * });
 *
 * const handleSubmit = (e) => {
 *     e.preventDefault();
 *     if (!validateForm()) return;
 *     submit(managementAgentActions.update(agentData));
 * };
 * ```
 *
 * @param {boolean} isMutating - Slice mutation flag, uniquely scoped to this
 *   component's mutation (see contract above).
 * @param {string|null} error - Slice error message for this mutation, or null
 *   when there is no error.
 * @param {object} options
 * @param {() => void} [options.onSuccess] - Fires once when a tracked
 *   submit resolves successfully.
 * @param {(message: string) => void} [options.onError] - Fires once when
 *   a tracked submit rejects, with the error message from the slice.
 * @returns {(action: object) => Promise<any>} submit - Dispatches `action`
 *   and marks it as tracked. Returns the dispatch promise unchanged in
 *   case the caller wants to await it for some other reason.
 */
const useMutateEffect = (isMutating, error, { onSuccess, onError } = {}) => {
    const dispatch = useDispatch();
    const didSubmitRef = useRef(false);
    const prevSavingRef = useRef(false);
    const onSuccessRef = useRef(onSuccess);
    const onErrorRef = useRef(onError);

    onSuccessRef.current = onSuccess;
    onErrorRef.current = onError;

    useEffect(() => {
        if (prevSavingRef.current && !isMutating && didSubmitRef.current) {
            didSubmitRef.current = false;
            if (error) {
                onErrorRef.current?.(error);
            } else {
                onSuccessRef.current?.();
            }
        }
        prevSavingRef.current = isMutating;
    }, [isMutating, error]);

    const submit = useCallback((action) => {
        didSubmitRef.current = true;
        return dispatch(action);
    }, [dispatch]);

    return submit;
};

export default useMutateEffect;
