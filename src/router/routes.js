export const ROUTES = {
    HOME: '/',

    PLAN: '/plans/:planId',
    PLAN_ITINERARIES: '/plans/:planId/itineraries',
    STEP_CREATE: '/plans/:planId/itineraries/:itineraryId/steps/create',
    STEP_EDIT: '/plans/:planId/itineraries/:itineraryId/steps/:stepId/edit',
    PLAN_TIMES: '/plans/:planId/times',
    PLAN_PARTICIPANTS: '/plans/:planId/participants',
    PLAN_LOCATIONS: '/plans/:planId/locations',

    LOGIN: '/login',
    REGISTER: '/register',

    NOT_FOUND: '*',
};

export default ROUTES;
