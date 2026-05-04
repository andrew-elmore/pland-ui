import { createSelector } from '@reduxjs/toolkit';
import * as groupService from '../services/group';
import { Group, GroupArray } from '../domain';

const LIST = 'LIST_GROUPS';
const GET = 'GET_GROUP';
const CREATE = 'CREATE_GROUP';
const UPDATE = 'UPDATE_GROUP';
const DELETE = 'DELETE_GROUP';

const initialState = {
    list: {
        data: new GroupArray(),
        totalCount: 0,
        isLoading: false,
        isLoaded: false,
    },
    current: {
        data: new Group(),
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
                data: new GroupArray(payload?.items ?? []),
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
            error: payload?.message ?? 'Failed to load groups',
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
                data: new Group(payload),
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
            error: payload?.message ?? 'Group not found',
        };
    }

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
                data: new Group(data),
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
                data: new Group(data),
                isLoading: false,
                isLoaded: true,
                isMutating: false,
            },
        };
    }

    case `${CREATE}_REJECTED`:
    case `${UPDATE}_REJECTED`: {
        return {
            ...state,
            current: {
                ...state.current,
                isMutating: false,
            },
            error: payload?.message ?? 'Failed to save group',
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
            error: payload?.message ?? 'Failed to remove group',
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
        payload: groupService.list(planId),
    }),

    get: (id) => ({
        type: GET,
        meta: { id },
        payload: groupService.get(id),
    }),

    create: (data) => ({
        type: CREATE,
        meta: { data },
        payload: groupService.create(data),
    }),

    update: (id, data) => ({
        type: UPDATE,
        meta: { id, data },
        payload: groupService.update(id, data),
    }),

    remove: (id) => ({
        type: DELETE,
        meta: { id },
        payload: groupService.remove(id),
    }),
};

export const selectors = {
    list: (state) => state.group.list.data,
    listMeta: createSelector(
        [
            (state) => state.group.list.isLoading,
            (state) => state.group.list.isLoaded,
            (state) => state.group.list.totalCount,
        ],
        (isLoading, isLoaded, totalCount) => ({ isLoading, isLoaded, totalCount }),
    ),
    current: (state) => state.group.current.data,
    currentMeta: createSelector(
        [
            (state) => state.group.current.isLoading,
            (state) => state.group.current.isLoaded,
            (state) => state.group.current.isMutating,
        ],
        (isLoading, isLoaded, isMutating) => ({ isLoading, isLoaded, isMutating }),
    ),
    isMutating: (state) => state.group.current.isMutating,
    error: (state) => state.group.error,
};

export default reducer;
