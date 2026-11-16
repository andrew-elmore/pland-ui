import React from 'react';
import { Provider } from 'react-redux';
import { ThemeProvider, CssBaseline } from '@mui/material';
import { BrowserRouter } from 'react-router-dom';
import AppContent from './components/AppContent';
import AppProviders from './auth/AppProviders';
import { store } from './store';
import theme from './theme/theme';

function App() {
    return (
        <AppProviders>
            <Provider store={store}>
                <ThemeProvider theme={theme}>
                    <CssBaseline />
                    <BrowserRouter>
                        <AppContent />
                    </BrowserRouter>
                </ThemeProvider>
            </Provider>
        </AppProviders>
    );
}

export default App;
