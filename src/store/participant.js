import { createSelector } from '@reduxjs/toolkit';
import * as participantService from '../services/participant';
import { Participant, ParticipantArray } from '../domain';

const LIST = 'LIST_PARTICIPANTS';
const CREATE = 'CREATE_PARTICIPANT';
const DELETE = 'DELETE_PARTICIPANT';

const initialState = {
    list: {
        data: new ParticipantArray(),
        totalCount: 0,
        isLoading: false,
        isLoaded: false,
    },
    current: {
        data: new Participant(),
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
                data: new ParticipantArray(payload?.items ?? []),
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
            error: payload?.message ?? 'Failed to load participants',
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
                data: new Participant(data),
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
            error: payload?.message ?? 'Failed to add participant',
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
            error: payload?.message ?? 'Failed to remove participant',
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
        payload: participantService.list(planId),
    }),

    create: (data) => ({
        type: CREATE,
        meta: { data },
        payload: participantService.create(data),
    }),

    remove: (id) => ({
        type: DELETE,
        meta: { id },
        payload: participantService.remove(id),
    }),
};

export const selectors = {
    list: (state) => state.participant.list.data,
    listMeta: createSelector(
        [
            (state) => state.participant.list.isLoading,
            (state) => state.participant.list.isLoaded,
            (state) => state.participant.list.totalCount,
        ],
        (isLoading, isLoaded, totalCount) => ({ isLoading, isLoaded, totalCount }),
    ),
    isMutating: (state) => state.participant.current.isMutating,
    error: (state) => state.participant.error,
};

export default reducer;
