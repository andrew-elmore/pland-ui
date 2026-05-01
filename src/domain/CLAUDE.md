# Domain Standards

Conventions for all code in `src/domain/`. See `README.md` for architecture and base class documentation.

## Class structure

Every domain class extends `BasicDomain`. Constructor always calls `super('ClassName', props, ClassName.DEFAULTS)`:

```javascript
import BasicDomain from './BasicDomain';

export default class Organization extends BasicDomain {

    static STATUS_ACTIVE = 'ACTIVE';
    static STATUS_INACTIVE = 'INACTIVE';

    static STATUSES = [
        Organization.STATUS_ACTIVE,
        Organization.STATUS_INACTIVE,
    ];

    static STATUS_LABELS = {
        [Organization.STATUS_ACTIVE]: 'Active',
        [Organization.STATUS_INACTIVE]: 'Inactive',
    };

    static DEFAULTS = {
        name: '',
        status: Organization.STATUS_ACTIVE,
        email: '',
        phone: '',
        address: null,
    };

    static FIELDS = Object.keys(Organization.DEFAULTS);

    constructor(props) {
        super('Organization', props, Organization.DEFAULTS);
    }

    get statusLabel() {
        return Organization.STATUS_LABELS[this.status] || 'Unknown';
    }

    isSavable = () => (
        this.name != null
        && this.name.trim() !== ''
        && Organization.STATUSES.includes(this.status)
    );

    toString = () => this.name || `Organization ${this.id}`;
}
```

## DEFAULTS

Every field the class uses must appear in `DEFAULTS` with its zero-value. Never include `id` in DEFAULTS -- it is managed automatically by BasicDomain.

Primitive defaults: `null` for optional IDs/dates/objects, `''` for strings, `false` for booleans, `0` for numeric counts, `[]` for collections.

## FIELDS

Always derived from DEFAULTS:

```javascript
static FIELDS = Object.keys(Organization.DEFAULTS);
```

## Static enums

For any field with a fixed set of valid values:

```javascript
static STATUS_ACTIVE = 'ACTIVE';
static STATUS_INACTIVE = 'INACTIVE';

static STATUSES = [Organization.STATUS_ACTIVE, Organization.STATUS_INACTIVE];

static STATUS_LABELS = {
    [Organization.STATUS_ACTIVE]: 'Active',
    [Organization.STATUS_INACTIVE]: 'Inactive',
};
```

## Validation with Yup

Two-method pattern: `isSavable()` is a quick synchronous boolean gate (for save button state). `validate()` is async with full error detail.

```javascript
import * as yup from 'yup';
import { emptyStringToNull } from '../utils/formUtils';

static VALIDATION_SCHEMA = yup.object({
    name: yup.string().required('Name is required'),
    email: yup.string().email('Invalid email').required('Email is required'),
    phone: yup.string().nullable(),
    unitCount: yup.number()
        .transform(emptyStringToNull)
        .nullable()
        .min(0, 'Must be 0 or greater'),
    status: yup.string()
        .oneOf(Organization.STATUSES, 'Invalid status')
        .required('Status is required'),
});

isSavable = () => (
    this.name != null
    && this.name.trim() !== ''
    && this.email != null
    && this.email.trim() !== ''
    && Organization.STATUSES.includes(this.status)
);

validate = () => Organization.VALIDATION_SCHEMA.validate(
    this.toJSON(),
    { abortEarly: false },
);
```

Always use `{ abortEarly: false }` so all errors are collected. Use `emptyStringToNull` transform for numeric fields that come from text inputs.

## Computed getters

Use ES `get` keyword for derived values:

```javascript
get fullName() {
    return `${this.firstName} ${this.lastName}`.trim();
}

get statusLabel() {
    return Organization.STATUS_LABELS[this.status] || 'Unknown';
}

get picUrl() {
    if (!this.pic) return null;
    if (typeof this.pic.url === 'function') return this.pic.url();
    return this.pic.url ?? null;
}
```

## Clone and set

`clone()` is inherited from BasicDomain. `set()` mutates in-place and returns `this`. In UI code, always clone before setting:

```javascript
const updated = working.clone().set('name', 'New Name');
const multi = working.clone().set({ name: 'New', status: 'ACTIVE' });
```

## Nested domain objects

When a domain class contains nested domain objects or arrays, re-wrap them in the constructor since BasicDomain's shallow merge strips class identity:

```javascript
constructor(props) {
    super('Project', props, Project.DEFAULTS);
    this.members = new MemberArray(this.members ?? []);
    this.address = this.address ? new Address(this.address) : null;
}
```

## Serialization

The default `toJSON()` from BasicDomain returns `{ id, ...attributes }`. Override only when the wire format differs from the instance shape:

```javascript
toJSON() {
    return JSON.parse(JSON.stringify({ ...this }));
}
```

## Array classes

Every domain class that appears in a collection must have a paired array class:

```javascript
import BasicArray from './BasicArray';
import Organization from './Organization';

export default class OrganizationArray extends BasicArray {
    get myClass() { return OrganizationArray; }

    get myItemClass() { return Organization; }

    constructor(items = []) {
        super(items);
    }
}
```

Both `myClass` and `myItemClass` getters are required. Custom methods (filtering, custom sorting) go on the array class.

## Barrel exports

Every domain class and its array class must be exported from `index.js`:

```javascript
export { default as Organization } from './Organization';
export { default as OrganizationArray } from './OrganizationArray';
```

## Test pattern

Tests use vitest. Structure by method. Use `parseValidationErrors` for validation tests:

```javascript
import { describe, it, expect } from 'vitest';
import Organization from './Organization';

describe('Organization Domain Model', () => {
    describe('constructor', () => {
        it('should have correct default values', () => {
            const org = new Organization();
            expect(org.name).toBe('');
            expect(org.status).toBe(Organization.STATUS_ACTIVE);
        });

        it('should initialize with provided props', () => {
            const org = new Organization({ name: 'Acme', email: 'a@b.com' });
            expect(org.name).toBe('Acme');
        });
    });

    describe('isSavable', () => {
        it('should be savable with valid data', () => {
            const org = new Organization({ name: 'Acme', email: 'a@b.com' });
            expect(org.isSavable()).toBe(true);
        });

        it('should not be savable without name', () => {
            const org = new Organization({ email: 'a@b.com' });
            expect(org.isSavable()).toBe(false);
        });
    });

    describe('validate', () => {
        it('should reject missing required fields', async () => {
            const org = new Organization();
            try {
                await org.validate();
                throw new Error('Expected validation to reject');
            } catch (err) {
                expect(err.inner.length).toBeGreaterThan(0);
            }
        });
    });
});
```
