# Screen Standards

Conventions for all code in `src/screens/`.

## Directory structure

Screens are organized by domain in subdirectories. Each domain typically has four screen types:

```
screens/
    HomeScreen.jsx              -- Top-level screens at root
    GetHelpScreen.jsx
    contacts/
        ContactScreen.jsx       -- List screen
        ContactCreateScreen.jsx -- Create screen
        ContactEditScreen.jsx   -- Edit screen
        ContactDetailsScreen.jsx -- Details/view screen
    properties/
        PropertyScreen.jsx
        PropertyCreateScreen.jsx
        PropertyEditScreen.jsx
        PropertyDetailsScreen.jsx
        PropertyGeneralScreen.jsx  -- Tab/sub-section screens
```

## Naming convention

`{Domain}{Purpose}Screen.jsx`. Purpose is one of: `Create`, `Edit`, `Details`, or a tab name. List screens omit the purpose suffix (e.g., `ContactScreen.jsx`).

## List screen pattern

```javascript
import React, { useEffect, useState, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Box, Container, Typography, Paper, Alert } from '@mui/material';
import { actions, selectors } from '../../store/contact';
import ContactTable from '../../features/contact/ContactTable';
import SearchInput from '../../components/inputs/SearchInput';

const PAGE_SIZE = 20;

const ContactScreen = () => {
    const dispatch = useDispatch();
    const contacts = useSelector(selectors.list);
    const { isLoading, totalCount } = useSelector(selectors.listMeta);
    const error = useSelector(selectors.error);

    const [searchText, setSearchText] = useState('');
    const [sorting, setSorting] = useState('name asc');
    const [hasMore, setHasMore] = useState(true);

    useEffect(() => {
        dispatch(actions.list(0, PAGE_SIZE, sorting, searchText));
    }, [dispatch, searchText, sorting]);

    useEffect(() => {
        setHasMore(contacts.length < totalCount);
    }, [contacts.length, totalCount]);

    const handleSearch = (value) => setSearchText(value);

    const handleSortChange = (newSorting) => setSorting(newSorting);

    const handleLoadMore = useCallback(() => {
        if (!isLoading && hasMore) {
            dispatch(actions.loadMore(contacts.length, PAGE_SIZE, sorting, searchText));
        }
    }, [dispatch, contacts.length, isLoading, hasMore, sorting, searchText]);

    return (
        <Container maxWidth={false}>
            <Box py={4}>
                <Paper elevation={3} sx={{ p: 4 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2, gap: 2 }}>
                        <Typography variant="h2">Contacts</Typography>
                        <Box sx={{ minWidth: 300, maxWidth: 400 }}>
                            <SearchInput onSearch={handleSearch} placeholder="Search contacts..." />
                        </Box>
                    </Box>

                    {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

                    <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                        {totalCount} {totalCount === 1 ? 'contact' : 'contacts'} found
                    </Typography>

                    <ContactTable
                        contacts={contacts}
                        hasMore={hasMore}
                        isLoading={isLoading}
                        onLoadMore={handleLoadMore}
                        sorting={sorting}
                        onSortChange={handleSortChange}
                    />
                </Paper>
            </Box>
        </Container>
    );
};

export default ContactScreen;
```

## Create screen pattern

```javascript
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { Box, Container, Typography, Paper, Alert } from '@mui/material';
import { actions, selectors } from '../../store/contact';
import ContactForm from '../../features/contact/ContactForm';
import useMutateEffect from '../../hooks/useMutateEffect';
import { parseValidationErrors } from '../../utils/formUtils';
import Contact from '../../domain/Contact';
import ROUTES from '../../router/routes';

const ContactCreateScreen = () => {
    const navigate = useNavigate();

    const { isMutating } = useSelector(selectors.currentMeta);
    const error = useSelector(selectors.error);
    const selectedId = useSelector(selectors.selectedId);

    const [working, setWorking] = useState(() => new Contact());
    const [errors, setErrors] = useState({});

    const submit = useMutateEffect(isMutating, error, {
        onSuccess: () => {
            if (!selectedId) return;
            navigate(ROUTES.CONTACT_DETAILS.replace(':id', selectedId));
        },
    });

    const handleChange = (field, value) => {
        setWorking(working.clone().set(field, value));
        if (errors[field]) {
            setErrors((prev) => ({ ...prev, [field]: null }));
        }
    };

    const handleSubmit = async () => {
        try {
            await working.validate();
            submit(actions.create(working));
        } catch (err) {
            setErrors(parseValidationErrors(err));
        }
    };

    const handleCancel = () => navigate(ROUTES.CONTACT_LIST);

    return (
        <Container maxWidth={false}>
            <Box py={4}>
                <Paper elevation={3} sx={{ p: 4 }}>
                    <Box mb={4}>
                        <Typography variant="h1" gutterBottom>Create New Contact</Typography>
                    </Box>
                    {error && <Box mb={3}><Alert severity="error">{error}</Alert></Box>}
                    <ContactForm
                        working={working}
                        onChange={handleChange}
                        errors={errors}
                        onSubmit={handleSubmit}
                        onCancel={handleCancel}
                        isLoading={isMutating}
                        submitButtonText="CREATE"
                    />
                </Paper>
            </Box>
        </Container>
    );
};

export default ContactCreateScreen;
```

## Edit screen pattern

```javascript
const ContactEditScreen = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const dispatch = useDispatch();

    const contact = useSelector(selectors.current);
    const { isLoading, isLoaded, isMutating } = useSelector(selectors.currentMeta);
    const error = useSelector(selectors.error);

    const [working, setWorking] = useState(() => new Contact());
    const [errors, setErrors] = useState({});

    const submit = useMutateEffect(isMutating, error, {
        onSuccess: () => navigate(ROUTES.CONTACT_DETAILS.replace(':id', id)),
    });

    useEffect(() => {
        const numericId = Number(id);
        if (id && (!contact || contact.id !== numericId)) {
            dispatch(actions.get(numericId));
        }
    }, [id, contact?.id, dispatch]);

    useEffect(() => {
        if (contact?.id) {
            setWorking(new Contact(contact));
            setErrors({});
        }
    }, [contact]);

    const handleChange = (field, value) => {
        setWorking(working.clone().set(field, value));
        if (errors[field]) {
            setErrors((prev) => ({ ...prev, [field]: null }));
        }
    };

    const handleSubmit = async () => {
        try {
            await working.validate();
            submit(actions.update(working));
        } catch (err) {
            setErrors(parseValidationErrors(err));
        }
    };

    const showLoading = isLoading && !isLoaded;

    if (error && isLoaded) {
        return (
            <Container maxWidth={false}>
                <Box py={4}><Alert severity="error">{error}</Alert></Box>
            </Container>
        );
    }

    if (isLoaded && !contact.id) {
        return (
            <Container maxWidth={false}>
                <Box py={4}><Alert severity="warning">Contact not found</Alert></Box>
            </Container>
        );
    }

    return (
        <Container maxWidth={false}>
            <LoadingOverlay open={showLoading} message="Loading contact..." />
            <Box py={4}>
                <Paper elevation={3} sx={{ p: 4 }}>
                    <Box mb={4}>
                        <Typography variant="h1" gutterBottom>{contact.name}</Typography>
                        <Typography variant="subtitle1" color="text.secondary">Edit Contact</Typography>
                    </Box>
                    <ContactForm
                        working={working}
                        onChange={handleChange}
                        errors={errors}
                        onSubmit={handleSubmit}
                        onCancel={() => navigate(ROUTES.CONTACT_DETAILS.replace(':id', id))}
                        isLoading={isLoading || isMutating}
                        submitButtonText="SAVE"
                    />
                </Paper>
            </Box>
        </Container>
    );
};
```

## Details screen pattern

```javascript
const ContactDetailsScreen = () => {
    const { id } = useParams();
    const dispatch = useDispatch();

    const contact = useSelector(selectors.current);
    const { isLoading, isLoaded } = useSelector(selectors.currentMeta);
    const error = useSelector(selectors.error);

    useEffect(() => {
        if (id && (!contact || contact.id !== Number(id))) {
            dispatch(actions.get(Number(id)));
        }
    }, [id, contact?.id, dispatch]);

    if (error) {
        return <Container maxWidth={false}><Box py={4}><Alert severity="error">{error}</Alert></Box></Container>;
    }

    if (isLoaded && !contact.id) {
        return <Container maxWidth={false}><Box py={4}><Alert severity="warning">Not found</Alert></Box></Container>;
    }

    return (
        <Container maxWidth={false}>
            <LoadingOverlay open={isLoading} message="Loading..." />
            <Box py={4}>
                <Paper elevation={3} sx={{ p: 4 }}>
                    <Box display="flex" justifyContent="space-between" alignItems="center" mb={4}>
                        <Typography variant="h2">{contact.name}</Typography>
                        <Box display="flex" gap={2}>
                            <Button variant="outlined" startIcon={<HistoryIcon />}
                                onClick={() => setHistoryOpen(true)}>View History</Button>
                            <Button variant="contained" startIcon={<EditIcon />}
                                component={Link} to={ROUTES.CONTACT_EDIT.replace(':id', contact.id)}>Edit</Button>
                        </Box>
                    </Box>
                    <Grid container spacing={3}>
                        <Grid size={{ xs: 12, md: 6 }}>
                            <DetailRow label="Name" value={contact.name} />
                            <DetailRow label="Email" value={contact.email} isEmail />
                        </Grid>
                    </Grid>
                </Paper>
            </Box>
        </Container>
    );
};
```

## Screen layout rules

Every screen must follow this wrapper structure:

- Outermost: `<Container maxWidth={false}>` (or a specific max width for landing pages)
- Content: `<Box py={4}>`
- Data content: `<Paper elevation={3} sx={{ p: 4 }}>`
- Error state: early return with `<Alert severity="error">`
- Not found state: early return with `<Alert severity="warning">`
- Loading state: `<LoadingOverlay open={isLoading} />`

## Data fetching

- Fetch in `useEffect` on mount, guarded by current data check
- Use `useParams()` for route parameters
- Always convert string params to numbers: `Number(id)`

## Navigation

- Use `useNavigate()` for programmatic navigation
- Always use `ROUTES` constants with `.replace(':id', id)` for paths — never hardcode path strings
- Use `Link` component from `react-router-dom` for declarative navigation

## useMutateEffect

Used in create and edit screens for post-save actions (redirect, close dialog):

```javascript
const submit = useMutateEffect(isMutating, error, {
    onSuccess: () => navigate(ROUTES.CONTACT_DETAILS.replace(':id', id)),
});
```

## Default export

Every screen is a default export:

```javascript
export default ContactScreen;
```
