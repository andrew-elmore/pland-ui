import { createSelector } from '@reduxjs/toolkit';
import * as timeService from '../services/time';
import { Time, TimeArray } from '../domain';

const LIST = 'LIST_TIMES';
const CREATE = 'CREATE_TIME';
const UPDATE = 'UPDATE_TIME';
const DELETE = 'DELETE_TIME';
const MERGE = 'MERGE_TIME';

const initialState = {
    list: {
        data: new TimeArray(),
        totalCount: 0,
        isLoading: false,
        isLoaded: false,
    },
    current: {
        data: new Time(),
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
                data: new TimeArray(payload?.items ?? []),
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
            error: payload?.message ?? 'Failed to load times',
        };
    }

    case `${CREATE}_PENDING`:
    case `${UPDATE}_PENDING`:
    case `${DELETE}_PENDING`:
    case `${MERGE}_PENDING`: {
        return {
            ...state,
            current: {
                ...state.current,
                isMutating: true,
            },
            error: null,
        };
    }

    case `${CREATE}_FULFILLED`:
    case `${UPDATE}_FULFILLED`: {
        const data = payload ?? { id: meta?.id, ...meta?.data };
        return {
            ...state,
            list: {
                ...state.list,
                data: state.list.data.clone().addUpdate(data),
                totalCount: type === `${CREATE}_FULFILLED` ? state.list.totalCount + 1 : state.list.totalCount,
            },
            current: {
                data: new Time(data),
                isLoading: false,
                isLoaded: true,
                isMutating: false,
            },
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

    case `${MERGE}_FULFILLED`: {
        return {
            ...state,
            current: {
                ...initialState.current,
            },
        };
    }

    case `${CREATE}_REJECTED`:
    case `${UPDATE}_REJECTED`:
    case `${DELETE}_REJECTED`:
    case `${MERGE}_REJECTED`: {
        return {
            ...state,
            current: {
                ...state.current,
                isMutating: false,
            },
            error: payload?.message ?? 'Operation failed',
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
        payload: timeService.list(planId),
    }),

    create: (data) => ({
        type: CREATE,
        meta: { data },
        payload: timeService.create(data),
    }),

    update: (id, data) => ({
        type: UPDATE,
        meta: { id, data },
        payload: timeService.update(id, data),
    }),

    remove: (id) => ({
        type: DELETE,
        meta: { id },
        payload: timeService.remove(id),
    }),

    merge: (recipientId, sourceTimeId) => ({
        type: MERGE,
        meta: { recipientId, sourceTimeId },
        payload: timeService.merge(recipientId, sourceTimeId),
    }),
};

export const selectors = {
    list: (state) => state.time.list.data,
    listMeta: createSelector(
        [
            (state) => state.time.list.isLoading,
            (state) => state.time.list.isLoaded,
        ],
        (isLoading, isLoaded) => ({ isLoading, isLoaded }),
    ),
    isMutating: (state) => state.time.current.isMutating,
    error: (state) => state.time.error,
};

export default reducer;
