# Redux Store Standards

This document defines our Redux patterns and coding standards for all reducer files in the `src/store` directory.

## File Structure & Naming

Store files should be named after their domain (e.g., `workspace.js`, `project.js`, `cars.js`) and placed in the `src/store` directory.

## Export Pattern

All store files must follow this export pattern:

```javascript
// Named exports for actions and selectors
export const actions = { /* ... */ };
export const selectors = { /* ... */ };

// Reducer as default export
export default reducer;
```

## Core Principles

### 1. Action Type Constants
Always define constants for action types to prevent typos and mismatches:

```javascript
// Action type constants
const LIST = 'LIST_PROEJCT';
const ADD = 'ADD_PROEJCT';
const UPDATE = 'UPDATE_PROEJCT';
const DELETE = 'DELETE_PROEJCT';
const SET = 'SET_PROEJCT';
```

### 2. Domain Objects Only
All objects in the Redux store must be domain objects that extend `BasicDomain` or `BasicArray`:
- Individual items: Extend `BasicDomain`
- Collections: Extend `BasicArray` (e.g., `ProjectArray`, `ProfileArray`)

### 3. BasicArray Methods
When working with collections, always use these `BasicArray` methods:
- `clone()` - Creates a deep copy of the array
- `add(item)` - Adds an item to the array
- `update(item)` - Updates an existing item
- `updateAt(index, item)` - Updates item at specific index
- `addUpdate(item)` - Adds if new, updates if exists
- `sort(compareFn)` - Sorts the array
- `remove(id)` - Removes item by ID
- `removeAt(index)` - Removes item at index
- `get(id)` - Gets item by ID
- `getAt(index)` - Gets item at index
- `contains(id)` - Checks if item exists

### 4. BasicDomain Methods
Domain objects inherit from `BasicDomain` which provides:
- `clone()` - Creates a deep copy
- `set(field, value)` - Sets a field and returns `this`
- `toJSON()` - Serializes the object

## Standard Template

Every reducer file should follow this example template:

```javascript
import { createSelector } from '@reduxjs/toolkit';
import * as organizationService from '../services/organization';
import { Organization, OrganizationArray } from '../../domain';

// Action type constants
const LIST = 'LIST_ORGANIZATIONS';
const CREATE = 'CREATE_ORGANIZATION';
const UPDATE = 'UPDATE_ORGANIZATION';
const DELETE = 'DELETE_ORGANIZATION';
const SET = 'SET_ORGANIZATION';

const initialState = {
    list: {
        data: new OrganizationArray(),
        isLoading: false,
        isLoaded: false,
    },
    selected: null,
    error: null,
};

export function reducer(state = initialState, action) {
    const { type, payload, meta } = action;

    switch (type) {
        case 'LOGOUT_USER_PENDING': {
            return initialState;
        }

        case `${LIST}_PENDING`: {
            return {
                ...state,
                list: {
                    ...state.list,
                    isLoading: true,
                },
                error: null,
            };
        }

        case `${LIST}_FULFILLED`: {
            return {
                ...state,
                list: {
                    data: new OrganizationArray(payload),
                    isLoading: false,
                    isLoaded: true,
                },
                error: null,
            };
        }

        case `${LIST}_REJECTED`: {
            return {
                ...state,
                list: {
                    data: new OrganizationArray(),
                    isLoading: false,
                    isLoaded: true,
                },
                error: payload?.message || 'Failed to fetch organizations',
            };
        }

        case `${CREATE}_PENDING`:
        case `${UPDATE}_PENDING`:
        case `${DELETE}_PENDING`: {
            return {
                ...state,
                error: null,
            };
        }

        case `${CREATE}_REJECTED`:
        case `${UPDATE}_REJECTED`: {
            return {
                ...state,
                error: payload?.message ?? 'Failed to create/update organization',
            };
        }

        case `${CREATE}_FULFILLED`:
        case `${UPDATE}_FULFILLED`: {
            return {
                ...state,
                list: {
                    ...state.list,
                    data: state.list.data.clone().addUpdate(payload),
                },
                selected: payload.id ? payload.id : state.selected,
            };
        }

        case `${DELETE}_FULFILLED`: {
            return {
                ...state,
                list: {
                    ...state.list,
                    data: state.list.data.clone().remove(meta?.organization?.id),
                },
                selected: state.selected === meta?.organization?.id ? null : state.selected,
            };
        }

        case `${DELETE}_REJECTED`: {
            return {
                ...state,
                error: payload?.message ?? 'Failed to delete organization',
            };
        }

        case `${SET}_FULFILLED`: {
            return {
                ...state,
                selected: payload,
            };
        }

        default: {
            return state;
        }
    }
}

export const actions = {
    list: (skipCount = 0, maxResultCount = 50) => ({
        type: LIST,
        meta: { skipCount, maxResultCount },
        payload: organizationService.list({ skipCount, maxResultCount }),
    }),
    create: (organization) => ({
        type: CREATE,
        meta: { organization },
        payload: organizationService.create(organization.toJSON()),
    }),
    update: (organization) => ({
        type: UPDATE,
        meta: { organization },
        payload: organizationService.update(organization.toJSON()),
    }),
    remove: (organization) => ({
        type: DELETE,
        meta: { organization },
        payload: organizationService.remove(organization.id),
    }),
    set: (id) => ({
        type: SET,
        meta: { id },
        payload: Promise.resolve(id),
    }),
}

export const selectors = {
    list: (state) => state.organizations.list.data,
    listMeta: createSelector(
        [(state) => state.organizations.list.isLoading, (state) => state.organizations.list.isLoaded],
        (isLoading, isLoaded) => ({
            isLoading,
            isLoaded,
        })
    ),
    current: createSelector(
        [(state) => state.organizations.list.data, (state) => state.organizations.selected],
        (organizationsData, selectedId) => {
            if (!selectedId) return null;
            return organizationsData.find(org => org.id === selectedId) || null;
        }
    ),
    currentId: (state) => state.organizations.selected,
    error: (state) => state.organizations.error,
}

export default reducer;
```

## Action Patterns

### Local Functions
For actions that resolve locally without API calls:

```javascript
export const actions = {
    clear: () => ({ 
        type: 'CLEAR_SOMETHING', 
        payload: Promise.resolve(null) 
    }),
    set: (id) => ({
        type: SET,
        meta: { id },
        payload: Promise.resolve(id),
    }),
};
```

### Service-Based Actions
Actions call service functions that wrap axios requests:

```javascript
import * as carService from '../services/car';

export const actions = {
    get: (id) => ({
        type: 'GET_CAR',
        meta: { id },
        payload: carService.get(id),
    }),

    list: (skipCount = 0, maxResultCount = 50) => ({
        type: 'LIST_CARS',
        meta: { skipCount, maxResultCount },
        payload: carService.list({ skipCount, maxResultCount }),
    }),

    create: (data) => ({
        type: 'CREATE_CAR',
        meta: { data },
        payload: carService.create(data),
    }),

    update: (data) => ({
        type: 'UPDATE_CAR',
        meta: { data },
        payload: carService.update(data),
    }),

    remove: (id) => ({
        type: 'DELETE_CAR',
        meta: { id },
        payload: carService.remove(id),
    }),
};
```

## Important Rules

### ✅ DO:
- **ALWAYS** return a Promise as the payload
- Pass all parameters to `meta` for debugging
- Use shorter action names (`get` not `getOrganization`)
- Use template literals for async action states (`${LIST}_PENDING`)
- Use `??` (not `||`) for payload fallbacks

### ❌ DON'T:
- Never use `await` inside action creators
- Never use async functions in the payload
- Never store plain JavaScript objects - always use domain objects
- Never manually construct arrays - use domain array classes
- Never chain multiple service calls in a single action payload

**❌ WRONG:**
```javascript
export const list = () => ({
    type: 'FETCH_ORGANIZATIONS',
    payload: (async () => {
        const orgs = await organizationService.list();
        return new OrganizationArray(orgs);
    })(),
});
```

**✅ CORRECT:**
```javascript
export const list = (skipCount = 0, maxResultCount = 50) => ({
    type: 'LIST_ORGANIZATIONS',
    meta: { skipCount, maxResultCount },
    payload: organizationService.list({ skipCount, maxResultCount }),
});
```

## UI Usage Examples

### In React Components

```javascript
import { useDispatch, useSelector } from 'react-redux';
import { actions, selectors } from '../store/organizations';

function OrganizationList() {
    const dispatch = useDispatch();
    const organizations = useSelector(selectors.list);
    const { isLoading, isLoaded } = useSelector(selectors.listMeta);
    const currentOrg = useSelector(selectors.current);
    const error = useSelector(selectors.error);

    // Fetch organizations on mount
    useEffect(() => {
        dispatch(actions.list());
    }, [dispatch]);

    // Select an organization
    const handleSelect = (orgId) => {
        dispatch(actions.set(orgId));
    };

    // Create new organization
    const handleCreate = (orgData) => {
        const newOrg = new Organization(orgData);
        dispatch(actions.create(newOrg));
    };

    // Update organization
    const handleUpdate = (org) => {
        const updated = org.clone().set('name', 'New Name');
        dispatch(actions.update(updated));
    };

    // Delete organization
    const handleDelete = (org) => {
        dispatch(actions.remove(org));
    };

    if (isLoading) return <Spinner />;
    if (error) return <Error message={error} />;
    
    return (
        <div>
            {organizations.map(org => (
                <OrganizationCard 
                    key={org.id}
                    organization={org}
                    isSelected={org.id === currentOrg?.id}
                    onSelect={() => handleSelect(org.id)}
                    onUpdate={() => handleUpdate(org)}
                    onDelete={() => handleDelete(org)}
                />
            ))}
        </div>
    );
}
```

### With Redux Hooks

```javascript
import { useDispatch, useSelector } from 'react-redux';
import { actions, selectors } from '../store/users';

function UserProfile({ userId }) {
    const dispatch = useDispatch();
    const users = useSelector(selectors.list);
    const user = users.get(userId);  // Using BasicArray's get method

    const handleSave = () => {
        const updated = user.clone().set({ firstName: 'John', lastName: 'Doe' });
        dispatch(actions.update(updated));
    };

    return (
        <form onSubmit={handleSave}>
            {/* Form fields */}
        </form>
    );
}
```

## Middleware Requirements

This pattern assumes you're using `redux-promise-middleware` which automatically appends:
- `_PENDING` when the promise is initiated
- `_FULFILLED` when the promise resolves successfully
- `_REJECTED` when the promise fails

Configure in your store setup:
```javascript
import promiseMiddleware from 'redux-promise-middleware';

const store = configureStore({
    reducer: rootReducer,
    middleware: [promiseMiddleware],
});
```
