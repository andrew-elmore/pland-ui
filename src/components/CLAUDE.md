# Component Standards

Conventions for all code in `src/components/`.

## Directory structure

```
components/
    AppContent.jsx           -- App shell, top-level layout
    common/                  -- Reusable cross-cutting primitives
        ConfirmDialog.jsx
        DetailRow.jsx
        LoadingOverlay.jsx
        LoadingSpinner.jsx
    cards/                   -- Card surface components
        DashboardCard.jsx
        LoadingCard.jsx
        StatCard.jsx
    inputs/                  -- Complex input controls
        SearchInput.jsx
        PredictiveSearchInput.jsx
    layout/                  -- App chrome and navigation
        AppBar.jsx
        SectionNav.jsx
    system/                  -- Infrastructure / auth / data loading
        AuthGuard.jsx
        DataLoaderEffect.jsx
        NotConnectedNotice.jsx
        NotificationSnackbar.jsx
    table/                   -- Table component system
        DataTable.jsx
        Table.jsx
        TableBody.jsx
        TableHead.jsx
        TableHeaderCell.jsx
```

Place new components in the subdirectory that matches their purpose. If a component does not fit any existing subdirectory, place it in `common/`. Do not create new subdirectories.

## Component declaration

Always use `const` arrow function. Destructure props in the function signature with defaults:

```javascript
const LoadingCard = ({ message = 'Loading...', compact = false, sx = {} }) => {
    return ( ... );
};

export default LoadingCard;
```

Default export at the bottom of the file, never inline with the declaration. Named exports are only allowed when the component is re-exported through a barrel file (e.g., `cards/index.js`). All other components use default export:

```javascript
export const StatCard = ({ title, value, subtitle }) => { ... };
```

## Styling -- sx prop only

Use MUI's `sx` prop exclusively. No `styled()`, no `className` for custom styling.

```javascript
<Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
```

Theme values via string token paths:

```javascript
color: 'primary.main'
color: 'text.secondary'
backgroundColor: 'background.paper'
borderColor: 'divider'
```

Theme function only when the value requires theme object access:

```javascript
zIndex: (theme) => theme.zIndex.drawer + 1,
```

Direct theme access via `useTheme()` only for breakpoints/responsive logic:

```javascript
const theme = useTheme();
const isMobile = useMediaQuery(theme.breakpoints.down('md'));
```

## MUI usage

Layout components (use these exclusively, not raw HTML elements):
- `Box` -- universal layout container (flex, padding, margins)
- `Paper` -- card/surface container with elevation
- `Container` -- max-width page wrapper
- `Stack` -- one-dimensional flex layout
- `Grid` -- two-dimensional responsive layout (for screen-level layouts)

MUI slot props pattern (not deprecated `InputProps`):

```javascript
<TextField
    slotProps={{
        input: {
            startAdornment: <InputAdornment position="start"><SearchIcon /></InputAdornment>,
        },
    }}
/>
```

## Layout patterns

Flex row header (title + actions):

```javascript
<Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
    <Typography variant="h2">Title</Typography>
    <Button variant="contained">Action</Button>
</Box>
```

Centered loading/empty state:

```javascript
<Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '400px' }}>
    <CircularProgress size={60} />
    <Typography sx={{ mt: 2 }}>Loading...</Typography>
</Box>
```

## Loading state components

Three loading components for different contexts:

```javascript
// Full-screen blocking overlay
<LoadingOverlay open={isLoading} message="Processing..." />

// Card-shaped placeholder
<LoadingCard message="Loading data..." compact />

// Inline centered spinner
<LoadingSpinner size={40} />
```

## Dialog pattern

```javascript
<Dialog open={open} onClose={handleClose} maxWidth="md" fullWidth disableRestoreFocus>
    <DialogTitle sx={{ backgroundColor: 'primary.main', color: 'primary.contrastText' }}>
        Title
        <IconButton onClick={handleClose} sx={{ position: 'absolute', right: 8, top: 8 }}>
            <CloseIcon />
        </IconButton>
    </DialogTitle>
    <DialogContent>
        {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
        {/* form fields */}
    </DialogContent>
    <DialogActions>
        <Button variant="outlined" onClick={handleClose}>Cancel</Button>
        <Button variant="contained" onClick={handleSave} disabled={isMutating || !working.isSavable()}>
            Save
        </Button>
    </DialogActions>
</Dialog>
```

## Confirm dialog

```javascript
<ConfirmDialog
    open={confirmOpen}
    title="Delete Item"
    message="Are you sure you want to delete this item?"
    onConfirm={handleDelete}
    onCancel={() => setConfirmOpen(false)}
    severity="error"
/>
```

## DataTable (preferred table pattern)

```javascript
<DataTable
    data={items}
    renderRow={(item) => <ItemRow key={item.id} item={item} />}
    sorting={sorting}
    onSortChange={onSortChange}
    isLoading={isLoading}
    hasMore={hasMore}
    onLoadMore={onLoadMore}
    emptyMessage="No items found"
>
    <DataTable.Column field="name" sortable>Name</DataTable.Column>
    <DataTable.Column field="status" sortable>Status</DataTable.Column>
    <DataTable.Column field="email">Email</DataTable.Column>
</DataTable>
```

Table rows use compound components:

```javascript
const ItemRow = ({ item }) => (
    <DataTable.Row hover>
        <DataTable.Cell>
            <Link component={RouterLink} to={`/item/${item.id}`}>{item.name}</Link>
        </DataTable.Cell>
        <DataTable.Cell>{item.statusLabel}</DataTable.Cell>
        <DataTable.Cell>{item.email || '-'}</DataTable.Cell>
    </DataTable.Row>
);
```

Sort string format: `"fieldName asc"` or `"fieldName desc"`.

## Redux usage in components

Store modules import pattern:

```javascript
import { actions, selectors } from '../../store/organization';
import { actions as authActions, selectors as authSelectors } from '../../store/auth';
```

Components in `common/` and `cards/` must be presentational (no Redux imports, no `useSelector`, no `useDispatch`). Redux-connected components belong in `system/`, `layout/`, or `inputs/` (when data-connected).

## Navigation

Use route constants with `.replace()`:

```javascript
import ROUTES from '../../router/routes';

<Link component={RouterLink} to={ROUTES.ITEM_DETAILS.replace(':id', item.id)}>
```

Import `Link` from `react-router-dom` (not `react-router`).

## Responsive design

Breakpoint objects in sx:

```javascript
px: { xs: 0, md: 2 },
display: { xs: 'none', lg: 'table-cell' },
```

`useMediaQuery` + `useTheme` for structural layout changes:

```javascript
const theme = useTheme();
const isMobile = useMediaQuery(theme.breakpoints.down('md'));
```

## Import ordering

1. React / React hooks
2. Third-party libraries (react-redux, react-router-dom)
3. MUI components (`@mui/material`), then MUI icons (`@mui/icons-material`)
4. Internal modules (store, components, utils, routes, domain)

## Barrel files

Only create barrel `index.js` files for subdirectories with 3+ components that are frequently imported together. Use named re-exports:

```javascript
export { StatCard } from './StatCard';
export { LoadingCard } from './LoadingCard';
export { DashboardCard } from './DashboardCard';
```

## Conditional rendering

Early return for null/missing data:

```javascript
if (!item || !item.id) return null;
```

Inline `&&` for optional elements:

```javascript
{error && <Alert severity="error">{error}</Alert>}
{title && <Typography variant="h6">{title}</Typography>}
```

Ternary for either/or states:

```javascript
{items.length === 0 ? (
    <Typography color="text.secondary">No items found</Typography>
) : (
    <ItemList items={items} />
)}
```
