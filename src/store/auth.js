import * as authService from '../services/auth';

const LOGIN = 'LOGIN_USER';
const LOGOUT = 'LOGOUT_USER';
const SIGNUP = 'ADD_USER';
const CLEAR_ERROR = 'CLEAR_AUTH_ERROR';

const initialState = {
    user: null,
    isAuthenticated: false,
    isLoading: false,
    isLoaded: false,
    error: null,
};

export function reducer(state = initialState, action) {
    const { type, payload } = action;

    switch (type) {
    case CLEAR_ERROR: {
        return {
            ...state,
            error: null,
        };
    }

    case `${LOGIN}_PENDING`: {
        return {
            ...state,
            isLoading: true,
            error: null,
        };
    }

    case `${LOGIN}_FULFILLED`: {
        if (!payload) {
            return {
                ...state,
                user: null,
                isAuthenticated: false,
                isLoading: false,
                isLoaded: true,
            };
        }

        if (payload.token) {
            localStorage.setItem('pland_token', payload.token);
        }

        return {
            ...state,
            user: payload.user ?? null,
            isAuthenticated: true,
            isLoading: false,
            isLoaded: true,
            error: null,
        };
    }

    case `${LOGIN}_REJECTED`: {
        localStorage.removeItem('pland_token');
        return {
            ...state,
            user: null,
            isAuthenticated: false,
            isLoading: false,
            isLoaded: true,
            error: payload?.message ?? 'Login failed',
        };
    }

    case `${LOGOUT}_PENDING`: {
        localStorage.removeItem('pland_token');
        return {
            ...state,
            user: null,
            isAuthenticated: false,
            isLoading: false,
            isLoaded: true,
        };
    }

    case `${LOGOUT}_FULFILLED`:
    case `${LOGOUT}_REJECTED`: {
        return initialState;
    }

    case `${SIGNUP}_PENDING`: {
        return {
            ...state,
            isLoading: true,
            error: null,
        };
    }

    case `${SIGNUP}_FULFILLED`: {
        if (payload?.token) {
            localStorage.setItem('pland_token', payload.token);
        }

        return {
            ...state,
            user: payload?.user ?? null,
            isAuthenticated: true,
            isLoading: false,
            isLoaded: true,
            error: null,
        };
    }

    case `${SIGNUP}_REJECTED`: {
        return {
            ...state,
            user: null,
            isAuthenticated: false,
            isLoading: false,
            isLoaded: true,
            error: payload?.message ?? 'Signup failed',
        };
    }

    default: {
        return state;
    }
    }
}

export const actions = {
    login: (credentials) => ({
        type: LOGIN,
        meta: { credentials },
        payload: authService.login(credentials),
    }),

    signup: (credentials) => ({
        type: SIGNUP,
        meta: { credentials },
        payload: authService.register(credentials),
    }),

    logout: () => ({
        type: LOGOUT,
        payload: Promise.resolve(null),
    }),

    restore: () => ({
        type: LOGIN,
        payload: authService.me(),
    }),

    clearError: () => ({
        type: CLEAR_ERROR,
    }),
};

export const selectors = {
    me: (state) => state.auth.user,
    isAuthenticated: (state) => state.auth.isAuthenticated,
    isLoading: (state) => state.auth.isLoading,
    isLoaded: (state) => state.auth.isLoaded,
    error: (state) => state.auth.error,
};

export default reducer;
