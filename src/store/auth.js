const LOGOUT = 'LOGOUT_USER';

export const actions = {
    logout: () => ({
        type: LOGOUT,
        payload: Promise.resolve(null),
    }),
};
