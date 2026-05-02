import { createSelector } from '@reduxjs/toolkit';

const SHOW_NOTIFICATION = 'SHOW_NOTIFICATION';
const REMOVE_NOTIFICATION = 'REMOVE_NOTIFICATION';
const CLEAR_ALL_NOTIFICATIONS = 'CLEAR_ALL_NOTIFICATIONS';

const initialState = {
    notifications: [],
    error: null,
};

const generateNotificationId = () => {
    return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
};

export function reducer(inboundState = initialState, action) {
    const { type, payload } = action;
    let state = inboundState;

    switch (type) {
    case 'LOGOUT_USER_PENDING':
    case 'DELETE_USER_PENDING': {
        return initialState;
    }

    case `${SHOW_NOTIFICATION}_PENDING`: {
        return {
            ...state,
            error: null,
        };
    }

    case `${SHOW_NOTIFICATION}_FULFILLED`: {
        const notification = {
            id: generateNotificationId(),
            message: payload.message,
            severity: payload.severity || 'info',
            autoHideDuration: payload.autoHideDuration !== undefined ? payload.autoHideDuration : 6000,
            ...payload,
        };

        return {
            ...state,
            notifications: [...state.notifications, notification],
            error: null,
        };
    }

    case `${SHOW_NOTIFICATION}_REJECTED`: {
        return {
            ...state,
            error: payload?.message || 'Failed to show notification',
        };
    }

    case `${REMOVE_NOTIFICATION}_PENDING`: {
        return {
            ...state,
            error: null,
        };
    }

    case `${REMOVE_NOTIFICATION}_FULFILLED`: {
        return {
            ...state,
            notifications: state.notifications.filter(notification => notification.id !== payload),
            error: null,
        };
    }

    case `${REMOVE_NOTIFICATION}_REJECTED`: {
        return {
            ...state,
            error: payload?.message || 'Failed to remove notification',
        };
    }

    case `${CLEAR_ALL_NOTIFICATIONS}_PENDING`: {
        return {
            ...state,
            error: null,
        };
    }

    case `${CLEAR_ALL_NOTIFICATIONS}_FULFILLED`: {
        return {
            ...state,
            notifications: [],
            error: null,
        };
    }

    case `${CLEAR_ALL_NOTIFICATIONS}_REJECTED`: {
        return {
            ...state,
            error: payload?.message || 'Failed to clear notifications',
        };
    }

    default: {
        return state;
    }
    }
}

export const actions = {
    showSuccess: (options) => ({
        type: SHOW_NOTIFICATION,
        meta: { severity: 'success', ...options },
        payload: Promise.resolve({ severity: 'success', ...options }),
    }),

    showError: (options) => ({
        type: SHOW_NOTIFICATION,
        meta: { severity: 'error', ...options },
        payload: Promise.resolve({ severity: 'error', ...options }),
    }),

    showWarning: (options) => ({
        type: SHOW_NOTIFICATION,
        meta: { severity: 'warning', ...options },
        payload: Promise.resolve({ severity: 'warning', ...options }),
    }),

    showInfo: (options) => ({
        type: SHOW_NOTIFICATION,
        meta: { severity: 'info', ...options },
        payload: Promise.resolve({ severity: 'info', ...options }),
    }),

    removeNotification: (id) => ({
        type: REMOVE_NOTIFICATION,
        meta: { id },
        payload: Promise.resolve(id),
    }),

    clearAll: () => ({
        type: CLEAR_ALL_NOTIFICATIONS,
        payload: Promise.resolve(null),
    }),
};

export const selectors = {
    activeNotifications: (state) => state.ui.notifications,

    notificationCount: createSelector(
        [(state) => state.ui.notifications],
        (notifications) => notifications.length,
    ),

    error: (state) => state.ui.error,
};

export default reducer;
