import { configureStore, combineReducers } from '@reduxjs/toolkit';
import promiseMiddleware from 'redux-promise-middleware';
import auth from './auth';
import itinerary from './itinerary';
import location from './location';
import participant from './participant';
import plan from './plan';
import profile from './profile';
import ui from './ui';

const rootReducer = combineReducers({
    auth,
    itinerary,
    location,
    participant,
    plan,
    profile,
    ui,
});

export const store = configureStore({
    reducer: rootReducer,
    middleware: (getDefaultMiddleware) =>
        getDefaultMiddleware({
            serializableCheck: false,
        })
            .concat(promiseMiddleware),
    devTools: import.meta.env.DEV,
});
