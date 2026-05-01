# Store Standards

Conventions for all code in `src/store/`. See `README.md` for the full template and architecture.

## One service call per action

An action's `payload` must resolve to the result of a **single** service call. Do **not** chain a follow-up call via `.then(() => otherCall)`.

```javascript
update: (organization) => ({
    type: UPDATE,
    meta: { organization },
    payload: organizationService.update(organization.toJSON()),
}),
```

The right place for "save then refresh" is the UI's `useMutateEffect` `onSuccess` callback:

```javascript
const submit = useMutateEffect(isMutating, error, {
    onSuccess: () => {
        dispatch(actions.list());
        onClose();
    },
});
```

## Action type naming

`VERB_NOUN` in all caps. Verb first. Noun singular for single-record operations, plural for list operations.

```javascript
const LIST = 'LIST_ORGANIZATIONS';
const GET = 'GET_ORGANIZATION';
const CREATE = 'CREATE_ORGANIZATION';
const UPDATE = 'UPDATE_ORGANIZATION';
const DELETE = 'DELETE_ORGANIZATION';
const SET = 'SET_ORGANIZATION';
```

Specialized verbs: `LOAD_MORE_`, `CLEAR_`, `SET_`, `IMPORT_`, `EXPORT_`, `CHECK_`.

## Action creator structure

Every action creator returns `{ type, payload, meta }`. `payload` is always a Promise (from a service call or `Promise.resolve()` for local actions). `meta` carries all arguments for debugging and reducer fallback reconstruction. The only exception is synchronous filter actions, which omit `payload` entirely and bypass promise middleware.

```javascript
export const actions = {
    list: (skipCount = 0, maxResultCount = 50) => ({
        type: LIST,
        meta: { skipCount, maxResultCount },
        payload: organizationService.list(skipCount, maxResultCount),
    }),

    get: (id) => ({
        type: GET,
        meta: { id },
        payload: organizationService.get(id),
    }),

    create: (data) => ({
        type: CREATE,
        meta: { data },
        payload: organizationService.create(data),
    }),

    update: (id, data) => ({
        type: UPDATE,
        meta: { id, data },
        payload: organizationService.update(id, data),
    }),

    remove: (id) => ({
        type: DELETE,
        meta: { id },
        payload: organizationService.remove(id),
    }),

    set: (id) => ({
        type: SET,
        meta: { id },
        payload: Promise.resolve(id),
    }),
};
```

Local/synchronous actions use `Promise.resolve()`:

```javascript
clear: () => ({
    type: CLEAR,
    payload: Promise.resolve(null),
}),
```

Synchronous filter actions are the only actions that omit `payload`. They skip promise middleware entirely and do not produce `_PENDING`/`_FULFILLED`/`_REJECTED` suffixes:

```javascript
setFilters: (filters) => ({
    type: SET_FILTERS,
    meta: { filters },
}),
```

## Initial state shape

### Standard list + current

```javascript
const initialState = {
    list: {
        data: new OrganizationArray(),
        isLoading: false,
        isLoaded: false,
    },
    current: {
        data: new Organization(),
        isLoading: false,
        isLoaded: false,
        isMutating: false,
    },
    error: null,
};
```

### List with totalCount (for paginated endpoints)

```javascript
list: {
    data: new OrganizationArray(),
    totalCount: 0,
    isLoading: false,
    isLoaded: false,
},
```

### Current-only (no list)

```javascript
const initialState = {
    current: {
        data: new Team(),
        isLoading: false,
        isLoaded: false,
        isMutating: false,
    },
    error: null,
};
```

## isMutating

Every store with create, update, or delete actions **must** expose `isMutating`. Set `true` on mutation `_PENDING`, `false` on mutation `_FULFILLED` and `_REJECTED`. GET operations must NOT clear `isMutating` -- use `...state.current` spread to preserve it:

```javascript
case `${GET}_FULFILLED`: {
    return {
        ...state,
        current: {
            ...state.current,
            data: new Organization(payload),
            isLoading: false,
            isLoaded: true,
        },
    };
}

case `${CREATE}_PENDING`:
case `${UPDATE}_PENDING`:
case `${DELETE}_PENDING`: {
    return {
        ...state,
        current: {
            ...state.current,
            isMutating: true,
        },
        error: null,
    };
}

case `${CREATE}_FULFILLED`:
case `${UPDATE}_FULFILLED`: {
    const data = payload ?? { id: meta?.id, ...meta?.data };
    return {
        ...state,
        list: {
            ...state.list,
            data: state.list.data.clone().addUpdate(data),
        },
        current: {
            data: new Organization(data),
            isLoading: false,
            isLoaded: true,
            isMutating: false,
        },
    };
}

case `${DELETE}_FULFILLED`: {
    return {
        ...state,
        list: {
            ...state.list,
            data: state.list.data.clone().remove({ id: meta?.organization?.id }),
        },
        current: {
            ...initialState.current,
        },
    };
}

case `${CREATE}_REJECTED`:
case `${UPDATE}_REJECTED`:
case `${DELETE}_REJECTED`: {
    return {
        ...state,
        current: {
            ...state.current,
            isMutating: false,
        },
        error: payload?.message ?? 'Operation failed',
    };
}
```

## Selector patterns

Simple selectors for direct state access. `createSelector` for meta objects (prevents unnecessary re-renders from object literal creation):

```javascript
export const selectors = {
    list: (state) => state.organizations.list.data,
    listMeta: createSelector(
        [
            (state) => state.organizations.list.isLoading,
            (state) => state.organizations.list.isLoaded,
        ],
        (isLoading, isLoaded) => ({ isLoading, isLoaded }),
    ),
    current: (state) => state.organizations.current.data,
    currentMeta: createSelector(
        [
            (state) => state.organizations.current.isLoading,
            (state) => state.organizations.current.isLoaded,
            (state) => state.organizations.current.isMutating,
        ],
        (isLoading, isLoaded, isMutating) => ({ isLoading, isLoaded, isMutating }),
    ),
    isMutating: (state) => state.organizations.current.isMutating,
    error: (state) => state.organizations.error,
    selectedId: (state) => state.organizations.selected,
};
```

Parameterized selectors for keyed sets:

```javascript
uploadIsMutating: (typeId) => (state) =>
    state.documents.uploads[typeId]?.isMutating ?? false,
```

## Domain arrays in reducers

Always use domain array classes. Always clone before mutation:

```javascript
data: state.list.data.clone().addUpdate(payload)
data: state.list.data.clone().remove({ id: meta?.id })
```

## LOAD_MORE pattern

Append to existing list using `.clone()` + `.add()`:

```javascript
case `${LOAD_MORE}_FULFILLED`: {
    const items = payload?.items ?? [];
    const existingData = state.list.data.clone();
    items.forEach((item) => { existingData.add(item); });
    return {
        ...state,
        list: {
            data: existingData,
            totalCount: payload?.totalCount ?? state.list.totalCount,
            isLoading: false,
            isLoaded: true,
        },
    };
}
```

## Working copies for in-flight edits

Forms use `useState` with a domain instance, not store state. The store's `current` represents the *persisted* record.

```javascript
const current = useSelector(selectors.current);
const [working, setWorking] = useState(() => new Organization(current));
const [errors, setErrors] = useState({});

const onFieldChange = (field, value) => {
    setWorking(working.clone().set(field, value));
    setErrors({});
};

const onSave = async () => {
    try {
        await working.validate();
        submit(actions.update(working));
    } catch (err) {
        setErrors(parseValidationErrors(err));
    }
};
```

## LOGOUT_USER_PENDING

Every store must handle `LOGOUT_USER_PENDING` by returning `initialState`:

```javascript
case 'LOGOUT_USER_PENDING': {
    return initialState;
}
```

## Error handling

- Clear `error: null` on every `_PENDING` case
- Set `error: payload?.message ?? 'Fallback message'` on every `_REJECTED` case (use `??` not `||`)
- Expose `error` via a selector

## Nullish coalescing

Use `??` (not `||`) for payload fallbacks:

```javascript
data: payload?.items ?? []
```

## Export pattern

```javascript
export function reducer(state = initialState, action) { ... }
export const actions = { ... };
export const selectors = { ... };
export default reducer;
```

## Keyed set pattern

When a store tracks multiple independently-loaded items:

```javascript
const SET_ITEM_SHAPE = {
    data: new Thing(),
    isLoading: false,
    isLoaded: false,
    isMutating: false,
};

const initialState = {
    list: { ... },
    current: { ... },
    set: {},
    error: null,
};

// Selectors
setItem: (id) => (state) => state.mySlice.set[id]?.data ?? new Thing(),
setItemMeta: (id) => (state) => {
    const entry = state.mySlice.set[id];
    return {
        isLoading: entry?.isLoading ?? false,
        isLoaded: entry?.isLoaded ?? false,
        isMutating: entry?.isMutating ?? false,
    };
},
```
