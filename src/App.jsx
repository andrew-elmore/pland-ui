import React from 'react';
import { Provider } from 'react-redux';
import { ThemeProvider, CssBaseline } from '@mui/material';
import { BrowserRouter } from 'react-router-dom';
import AppContent from './components/AppContent';
import AppProviders from './auth/AppProviders';
import { store } from './store';
import theme, { COLOR_SCHEME_STORAGE_KEY, DEFAULT_MODE, MODE_STORAGE_KEY } from './theme/theme';

function App() {
    return (
        <ThemeProvider
            theme={theme}
            defaultMode={DEFAULT_MODE}
            modeStorageKey={MODE_STORAGE_KEY}
            colorSchemeStorageKey={COLOR_SCHEME_STORAGE_KEY}
            noSsr
        >
            <CssBaseline enableColorScheme />
            <AppProviders>
                <Provider store={store}>
                    <BrowserRouter>
                        <AppContent />
                    </BrowserRouter>
                </Provider>
            </AppProviders>
        </ThemeProvider>
    );
}

export default App;
