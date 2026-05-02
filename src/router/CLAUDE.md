# Router Standards

Conventions for all code in `src/router/`.

## Route constants

All route paths are defined in `routes.js` as a single `ROUTES` object. Path pattern: `/:resource/:resourceId/:sub-section`.

```javascript
export const ROUTES = {
    HOME: '/',

    CONTACT_LIST: '/contacts',
    CONTACT_CREATE: '/contacts/create',
    CONTACT_DETAILS: '/contacts/:contactId',
    CONTACT_EDIT: '/contacts/:contactId/edit',

    NOT_FOUND: '*',
};

export default ROUTES;
```

Naming convention: `RESOURCE_ACTION` in SCREAMING_SNAKE_CASE. List routes omit the action suffix. Sub-section routes use the tab name: `PROPERTY_GENERAL`, `PROPERTY_UNIT_MIX`.

## Route parameter naming

Never use generic `:id` in route params. Always prefix with the entity name: `:contactId`, `:planId`, `:itineraryId`. This applies to route definitions, `useParams()` destructuring, and `.replace()` calls.

```javascript
PLAN: '/plans/:planId',
PLAN_ITINERARIES: '/plans/:planId/itineraries',

const { planId } = useParams();

navigate(ROUTES.PLAN.replace(':planId', plan.id));
```

## Using routes in components

Always use the `ROUTES` constant for navigation. Never hardcode path strings. Use `.replace()` for parameterized paths:

```javascript
import ROUTES from '../../router/routes';

navigate(ROUTES.CONTACT_DETAILS.replace(':contactId', contact.id));

<Link to={ROUTES.CONTACT_EDIT.replace(':contactId', contact.id)}>Edit</Link>
```

## AppRouter structure

All screen components are eagerly imported (no lazy loading). Authentication is handled by `AuthGuard` wrapping the router, not by per-route guards.

```javascript
import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import ROUTES from './routes';

import HomeScreen from '../screens/HomeScreen';
import ContactScreen from '../screens/contacts/ContactScreen';

export const AppRouter = () => (
    <Routes>
        <Route path={ROUTES.HOME} element={<HomeScreen />} />
        <Route path={ROUTES.CONTACT_LIST} element={<ContactScreen />} />
        <Route path={ROUTES.NOT_FOUND} element={<Navigate to={ROUTES.HOME} replace />} />
    </Routes>
);

export default AppRouter;
```

## Layout routes

For sections with shared navigation (sidebar), use React Router layout routes:

```javascript
<Route element={<PropertyNav />}>
    <Route path={ROUTES.PROPERTY_GENERAL} element={<PropertyGeneralScreen />} />
    <Route path={ROUTES.PROPERTY_UNIT_MIX} element={<PropertyUnitMixScreen />} />
</Route>
```

The layout component renders an `<Outlet />` for child routes.

## Base route redirects

For resources with tabs, redirect the base route to the default tab:

```javascript
<Route path="/plans/:planId" element={<Navigate to="itineraries" replace />} />
```

## Catch-all

Always include a catch-all that redirects to home:

```javascript
<Route path="*" element={<Navigate to={ROUTES.HOME} replace />} />
```
