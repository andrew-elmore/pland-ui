import { createSelector } from '@reduxjs/toolkit';
import * as itineraryService from '../services/itinerary';
import { Itinerary, ItineraryArray } from '../domain';

const LIST = 'LIST_ITINERARIES';
const CREATE = 'CREATE_ITINERARY';

const initialState = {
    list: {
        data: new ItineraryArray(),
        totalCount: 0,
        isLoading: false,
        isLoaded: false,
    },
    current: {
        data: new Itinerary(),
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
                data: new ItineraryArray(payload?.items ?? []),
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
            error: payload?.message ?? 'Failed to load itineraries',
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
                data: new Itinerary(data),
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
            error: payload?.message ?? 'Failed to create itinerary',
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
        payload: itineraryService.list(planId),
    }),

    create: (data) => ({
        type: CREATE,
        meta: { data },
        payload: itineraryService.create(data),
    }),
};

export const selectors = {
    list: (state) => state.itinerary.list.data,
    listMeta: createSelector(
        [
            (state) => state.itinerary.list.isLoading,
            (state) => state.itinerary.list.isLoaded,
            (state) => state.itinerary.list.totalCount,
        ],
        (isLoading, isLoaded, totalCount) => ({ isLoading, isLoaded, totalCount }),
    ),
    current: (state) => state.itinerary.current.data,
    isMutating: (state) => state.itinerary.current.isMutating,
    error: (state) => state.itinerary.error,
};

export default reducer;
