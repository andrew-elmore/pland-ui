# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development Commands

```bash
# Install dependencies (requires Node >= 22.18.0)
npm install

# Start development server
npm start

# Build for production
npm build

# Preview production build
npm preview

# Run tests
npm test

# Run tests in watch mode
npm test:watch

# Run tests with UI
npm test:ui

# Run tests with coverage
npm test:coverage

# Lint and fix code
npm run lint
```

### Project Structure

```
src/
├── domain/              # Domain models extending BasicDomain
├── store/               # Redux reducers, actions, and selectors
├── hooks/               # Custom React hooks
├── components/          # Reusable UI components
├── features/            # Feature-specific components
├── screens/             # Full page components/views
├── utils/               # Utility functions
├── theme/               # Global styles and themes
├── config/              # Configuration files
└── router/              # Routing configuration
```

## Architecture

### Technology Stack
- **React 19.1.1** - UI framework
- **Material-UI (MUI) v7** - Component library
- **React Router v7** - Routing
- **Vite** - Build tool and dev server
- **Vitest** - Testing framework

### Data Management Philosophy
See `src/store/README.md`

The app follows a **layered architecture** with a service layer wrapping axios for API communication and Redux for state management:

```
API Server
    ↓
Service Layer (axios via request() wrapper)
    ↓
Redux Store (actions call services, middleware handles async)
    ↓
React Components (UI layer)
```

**Key Pattern**: Action functions return Redux action objects with `type`, `payload` (Promise from service call), and `meta`. The Redux Promise Middleware handles async actions automatically.

### Environment Configuration
Create `.env` file from `.env.example`:

## Other Notes
- All domain objects extend `./src/domain/BasicDomain.js`
- ALWAYS run `/test` (`npm run lint` and `npm run test`) after all code changes and resolve any issues. For larger changes also run `npm run test:e2e`
- ALWAYS use domain-developer agent when editing any code in `/src/domain`.
- ALWAYS use redux-store-owner agent when editing any code in `/src/store`.
- ALWAYS use ui-developer-mui agent when editing any UI components (any code in `/src/screens`, `/src/features`, or `/src/components`).
