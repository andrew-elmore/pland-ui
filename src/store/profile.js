import { createSelector } from '@reduxjs/toolkit';

const GET = 'GET_PROFILE';
const UPDATE = 'UPDATE_PROFILE';
const CLEAR = 'CLEAR_PROFILE';

const LOGIN_USER_FULFILLED = 'LOGIN_USER_FULFILLED';
const ADD_USER_FULFILLED = 'ADD_USER_FULFILLED';

const initialState = {
    data: null,
    isLoading: false,
    isLoaded: false,
    error: null,
};

export function reducer(state = initialState, action) {
    const { type, payload } = action;

    switch (type) {
    case 'LOGOUT_USER_PENDING':
    case `${CLEAR}_PENDING`: {
        return initialState;
    }

    case LOGIN_USER_FULFILLED:
    case ADD_USER_FULFILLED: {
        if (!payload?.profile) {
            return state;
        }
        return {
            ...state,
            data: payload.profile,
            isLoading: false,
            isLoaded: true,
            error: null,
        };
    }

    case `${GET}_PENDING`: {
        return {
            ...state,
            isLoading: true,
            error: null,
        };
    }

    case `${GET}_FULFILLED`: {
        return {
            ...state,
            data: payload,
            isLoading: false,
            isLoaded: true,
            error: null,
        };
    }

    case `${GET}_REJECTED`: {
        return {
            ...state,
            data: null,
            isLoading: false,
            isLoaded: true,
            error: payload?.message ?? 'Failed to fetch profile',
        };
    }

    case `${UPDATE}_PENDING`: {
        return {
            ...state,
            isLoading: true,
            error: null,
        };
    }

    case `${UPDATE}_FULFILLED`: {
        return {
            ...state,
            data: payload,
            isLoading: false,
            error: null,
        };
    }

    case `${UPDATE}_REJECTED`: {
        return {
            ...state,
            isLoading: false,
            error: payload?.message ?? 'Failed to update profile',
        };
    }

    case `${CLEAR}_FULFILLED`: {
        return {
            ...state,
            data: null,
            error: null,
        };
    }

    default: {
        return state;
    }
    }
}

export const actions = {
    get: () => ({
        type: GET,
        payload: Promise.resolve(null),
    }),
    update: (profile) => ({
        type: UPDATE,
        meta: { profile },
        payload: Promise.resolve(null),
    }),
    clear: () => ({
        type: CLEAR,
        payload: Promise.resolve(null),
    }),
};

export const selectors = {
    me: (state) => state.profile.data,
    meta: createSelector(
        [(state) => state.profile.isLoading, (state) => state.profile.isLoaded],
        (isLoading, isLoaded) => ({
            isLoading,
            isLoaded,
        }),
    ),
    isLoading: (state) => state.profile.isLoading,
    isLoaded: (state) => state.profile.isLoaded,
    error: (state) => state.profile.error,
    firstName: createSelector(
        [(state) => state.profile.data],
        (profile) => profile?.firstName ?? '',
    ),
    lastName: createSelector(
        [(state) => state.profile.data],
        (profile) => profile?.lastName ?? '',
    ),
    phone: createSelector(
        [(state) => state.profile.data],
        (profile) => profile?.phone ?? '',
    ),
    initials: createSelector(
        [(state) => state.profile.data],
        (profile) => {
            const first = profile?.firstName?.charAt(0)?.toUpperCase() ?? '';
            const last = profile?.lastName?.charAt(0)?.toUpperCase() ?? '';
            return `${first}${last}`.trim();
        },
    ),
};

export default reducer;
