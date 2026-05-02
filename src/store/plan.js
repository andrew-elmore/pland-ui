import { createSelector } from '@reduxjs/toolkit';
import * as planService from '../services/plan';
import { Plan, PlanArray } from '../domain';

const LIST = 'LIST_PLANS';
const GET = 'GET_PLAN';
const CREATE = 'CREATE_PLAN';

const initialState = {
    list: {
        data: new PlanArray(),
        totalCount: 0,
        isLoading: false,
        isLoaded: false,
    },
    current: {
        data: new Plan(),
        isLoading: false,
        isLoaded: false,
        isMutating: false,
    },
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
                data: new PlanArray(payload?.items ?? []),
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
            error: payload?.message ?? 'Failed to load plans',
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
                ...state.current,
                data: new Plan(payload),
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
            error: payload?.message ?? 'Failed to load plan',
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
                data: new Plan(data),
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
            error: payload?.message ?? 'Failed to create plan',
        };
    }

    default: {
        return state;
    }
    }
}

export const actions = {
    list: (skip = 0, limit = 50) => ({
        type: LIST,
        meta: { skip, limit },
        payload: planService.list(skip, limit),
    }),

    get: (id) => ({
        type: GET,
        meta: { id },
        payload: planService.get(id),
    }),

    create: (data) => ({
        type: CREATE,
        meta: { data },
        payload: planService.create(data),
    }),
};

export const selectors = {
    list: (state) => state.plan.list.data,
    listMeta: createSelector(
        [
            (state) => state.plan.list.isLoading,
            (state) => state.plan.list.isLoaded,
            (state) => state.plan.list.totalCount,
        ],
        (isLoading, isLoaded, totalCount) => ({ isLoading, isLoaded, totalCount }),
    ),
    current: (state) => state.plan.current.data,
    currentMeta: createSelector(
        [
            (state) => state.plan.current.isLoading,
            (state) => state.plan.current.isLoaded,
            (state) => state.plan.current.isMutating,
        ],
        (isLoading, isLoaded, isMutating) => ({ isLoading, isLoaded, isMutating }),
    ),
    isMutating: (state) => state.plan.current.isMutating,
    error: (state) => state.plan.error,
};

export default reducer;
