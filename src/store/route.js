import { createSelector } from '@reduxjs/toolkit';
import * as routeService from '../services/route';
import { Route, RouteArray } from '../domain';

const LIST = 'LIST_ROUTES';
const GET = 'GET_ROUTE';
const RECALCULATE_ALL = 'RECALCULATE_ALL_ROUTES';

const initialState = {
    list: {
        data: new RouteArray(),
        totalCount: 0,
        isLoading: false,
        isLoaded: false,
    },
    current: {
        data: new Route(),
        isLoading: false,
        isLoaded: false,
    },
    isMutating: false,
    error: null,
};

export function reducer(state = initialState, action) {
    const { type, payload } = action;

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
                data: new RouteArray(payload?.items ?? []),
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
            error: payload?.message ?? 'Failed to load routes',
        };
    }

    case `${GET}_PENDING`: {
        return {
            ...state,
            current: {
                ...state.current,
                isLoading: true,
            },
            error: null,
        };
    }

    case `${GET}_FULFILLED`: {
        return {
            ...state,
            current: {
                data: new Route(payload),
                isLoading: false,
                isLoaded: true,
            },
        };
    }

    case `${GET}_REJECTED`: {
        return {
            ...state,
            current: {
                ...state.current,
                isLoading: false,
                isLoaded: true,
            },
            error: payload?.message ?? 'Failed to load route',
        };
    }

    case `${RECALCULATE_ALL}_PENDING`: {
        return {
            ...state,
            isMutating: true,
            error: null,
        };
    }

    case `${RECALCULATE_ALL}_FULFILLED`: {
        return {
            ...state,
            list: {
                data: new RouteArray(payload?.items ?? []),
                totalCount: payload?.totalCount ?? 0,
                isLoading: false,
                isLoaded: true,
            },
            isMutating: false,
        };
    }

    case `${RECALCULATE_ALL}_REJECTED`: {
        return {
            ...state,
            isMutating: false,
            error: payload?.message ?? 'Failed to recalculate routes',
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
        payload: routeService.list(planId),
    }),
    get: (id) => ({
        type: GET,
        meta: { id },
        payload: routeService.get(id),
    }),
    recalculateAll: (planId) => ({
        type: RECALCULATE_ALL,
        meta: { planId },
        payload: routeService.recalculateAll(planId),
    }),
};

export const selectors = {
    list: (state) => state.route.list.data,
    listMeta: createSelector(
        [
            (state) => state.route.list.isLoading,
            (state) => state.route.list.isLoaded,
        ],
        (isLoading, isLoaded) => ({ isLoading, isLoaded }),
    ),
    current: (state) => state.route.current.data,
    currentMeta: createSelector(
        [
            (state) => state.route.current.isLoading,
            (state) => state.route.current.isLoaded,
        ],
        (isLoading, isLoaded) => ({ isLoading, isLoaded }),
    ),
    isMutating: (state) => state.route.isMutating,
    error: (state) => state.route.error,
};

export default reducer;
