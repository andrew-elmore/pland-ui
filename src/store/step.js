import { createSelector } from '@reduxjs/toolkit';
import * as stepService from '../services/step';
import { Step, StepArray } from '../domain';

const LIST = 'LIST_STEPS';
const GET = 'GET_STEP';
const CREATE = 'CREATE_STEP';
const CREATE_WITH_TRAVEL = 'CREATE_WITH_TRAVEL_STEP';
const UPDATE = 'UPDATE_STEP';
const DELETE = 'DELETE_STEP';

const initialState = {
    list: {
        data: new StepArray(),
        totalCount: 0,
        isLoading: false,
        isLoaded: false,
    },
    current: {
        data: new Step(),
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
                data: new StepArray(payload?.items ?? []),
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
            error: payload?.message ?? 'Failed to load steps',
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
                data: new Step(payload),
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
            error: payload?.message ?? 'Step not found',
        };
    }

    case `${CREATE_WITH_TRAVEL}_PENDING`:
    case `${CREATE}_PENDING`:
    case `${UPDATE}_PENDING`: {
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
                data: new Step(data),
                isLoading: false,
                isLoaded: true,
                isMutating: false,
            },
        };
    }

    case `${UPDATE}_FULFILLED`: {
        const data = payload ?? { id: meta?.id, ...meta?.data };
        return {
            ...state,
            list: {
                ...state.list,
                data: state.list.data.clone().addUpdate(data),
            },
            current: {
                data: new Step(data),
                isLoading: false,
                isLoaded: true,
                isMutating: false,
            },
        };
    }

    case `${CREATE_WITH_TRAVEL}_FULFILLED`: {
        return {
            ...state,
            current: {
                ...state.current,
                isMutating: false,
            },
        };
    }

    case `${CREATE_WITH_TRAVEL}_REJECTED`:
    case `${CREATE}_REJECTED`:
    case `${UPDATE}_REJECTED`: {
        return {
            ...state,
            current: {
                ...state.current,
                isMutating: false,
            },
            error: payload?.message ?? 'Failed to save step',
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
            error: payload?.message ?? 'Failed to remove step',
        };
    }

    default: {
        return state;
    }
    }
}

export const actions = {
    list: (itineraryId) => ({
        type: LIST,
        meta: { itineraryId },
        payload: stepService.list(itineraryId),
    }),

    get: (id) => ({
        type: GET,
        meta: { id },
        payload: stepService.get(id),
    }),

    create: (data) => ({
        type: CREATE,
        meta: { data },
        payload: stepService.create(data),
    }),

    createWithDuration: (data) => ({
        type: CREATE,
        meta: { data },
        payload: stepService.createWithDuration(data),
    }),

    createWithTravel: (data) => ({
        type: CREATE_WITH_TRAVEL,
        meta: { data },
        payload: stepService.createWithTravel(data),
    }),

    update: (id, data) => ({
        type: UPDATE,
        meta: { id, data },
        payload: stepService.update(id, data),
    }),

    remove: (id) => ({
        type: DELETE,
        meta: { id },
        payload: stepService.remove(id),
    }),
};

export const selectors = {
    list: (state) => state.step.list.data,
    listMeta: createSelector(
        [
            (state) => state.step.list.isLoading,
            (state) => state.step.list.isLoaded,
            (state) => state.step.list.totalCount,
        ],
        (isLoading, isLoaded, totalCount) => ({ isLoading, isLoaded, totalCount }),
    ),
    current: (state) => state.step.current.data,
    currentMeta: createSelector(
        [
            (state) => state.step.current.isLoading,
            (state) => state.step.current.isLoaded,
            (state) => state.step.current.isMutating,
        ],
        (isLoading, isLoaded, isMutating) => ({ isLoading, isLoaded, isMutating }),
    ),
    isMutating: (state) => state.step.current.isMutating,
    error: (state) => state.step.error,
};

export default reducer;
