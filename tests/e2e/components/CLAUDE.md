# Component Standards

Page Object components that wrap UI elements for Playwright interaction.

## Structure

```
components/
├── input/     # One wrapper per MUI input type (TextField, Autocomplete, etc.)
└── form/      # One wrapper per app form, composes input components
```

See each subdirectory's CLAUDE.md for its specific pattern and rules.

## Dependency Direction

```
form → input → ../../utils/pause.js
```

Form components import input components from `../input/`. Input components never import from form. Neither imports from flows or specs.
