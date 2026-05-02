import { createSelector } from '@reduxjs/toolkit';
import * as locationService from '../services/location';
import { Location, LocationArray } from '../domain';

const LIST = 'LIST_LOCATIONS';
const CREATE = 'CREATE_LOCATION';
const DELETE = 'DELETE_LOCATION';

const initialState = {
    list: {
        data: new LocationArray(),
        totalCount: 0,
        isLoading: false,
        isLoaded: false,
    },
    current: {
        data: new Location(),
        isLoading: false,
        isLoaded: false,
        isMutating: false,
    },
    error: null,
};

export function reducer(state = initialState, action) {
    const { type, payload, meta } = action;

    switch (type) {
    case 'LOGOUT_USER_PENDING': {
        return initialState;
    }

    case `${LIST}_PENDING`: {
        return {
            ...state,
            list: {
                ...state.list,
                isLoading: true,
            },
            error: null,
        };
    }

    case `${LIST}_FULFILLED`: {
        return {
            ...state,
            list: {
                data: new LocationArray(payload?.items ?? []),
                totalCount: payload?.totalCount ?? 0,
                isLoading: false,
                isLoaded: true,
            },
        };
    }

    case `${LIST}_REJECTED`: {
        return {
            ...state,
            list: {
                ...state.list,
                isLoading: false,
                isLoaded: true,
            },
            error: payload?.message ?? 'Failed to load locations',
        };
    }

    case `${CREATE}_PENDING`: {
        return {
            ...state,
            current: {
                ...state.current,
                isMutating: true,
            },
            error: null,
        };
    }

    case `${CREATE}_FULFILLED`: {
        const data = payload;
        return {
            ...state,
            list: {
                ...state.list,
                data: state.list.data.clone().addUpdate(data),
                totalCount: state.list.totalCount + 1,
            },
            current: {
                data: new Location(data),
                isLoading: false,
                isLoaded: true,
                isMutating: false,
            },
        };
    }

    case `${CREATE}_REJECTED`: {
        return {
            ...state,
            current: {
                ...state.current,
                isMutating: false,
            },
            error: payload?.message ?? 'Failed to add location',
        };
    }

    case `${DELETE}_PENDING`: {
        return {
            ...state,
            current: {
                ...state.current,
                isMutating: true,
            },
            error: null,
        };
    }

    case `${DELETE}_FULFILLED`: {
        return {
            ...state,
            list: {
                ...state.list,
                data: state.list.data.clone().remove({ id: meta?.id }),
                totalCount: state.list.totalCount - 1,
            },
            current: {
                ...initialState.current,
            },
        };
    }

    case `${DELETE}_REJECTED`: {
        return {
            ...state,
            current: {
                ...state.current,
                isMutating: false,
            },
            error: payload?.message ?? 'Failed to remove location',
        };
    }

    default: {
        return state;
    }
    }
}

export const actions = {
    list: (planId) => ({
        type: LIST,
        meta: { planId },
        payload: locationService.list(planId),
    }),

    create: (data) => ({
        type: CREATE,
        meta: { data },
        payload: locationService.create(data),
    }),

    remove: (id) => ({
        type: DELETE,
        meta: { id },
        payload: locationService.remove(id),
    }),
};

export const selectors = {
    list: (state) => state.location.list.data,
    listMeta: createSelector(
        [
            (state) => state.location.list.isLoading,
            (state) => state.location.list.isLoaded,
            (state) => state.location.list.totalCount,
        ],
        (isLoading, isLoaded, totalCount) => ({ isLoading, isLoaded, totalCount }),
    ),
    isMutating: (state) => state.location.current.isMutating,
    error: (state) => state.location.error,
};

export default reducer;
