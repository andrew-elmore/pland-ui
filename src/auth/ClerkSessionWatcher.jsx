import { useEffect, useRef } from 'react';
import { useAuth } from '@clerk/react';
import { useDispatch } from 'react-redux';
import { actions as authActions } from '../store/auth';

/**
 * Clears every Redux store when the Clerk user changes (sign-out, or a different
 * account signing in) so one account's plans never show for another.
 */
export default function ClerkSessionWatcher() {
    const dispatch = useDispatch();
    const { isLoaded, userId } = useAuth();
    const userIdRef = useRef(undefined);

    useEffect(() => {
        if (!isLoaded) return;
        if (userIdRef.current !== undefined && userIdRef.current !== userId) {
            dispatch(authActions.logout());
        }
        userIdRef.current = userId;
    }, [dispatch, isLoaded, userId]);

    return null;
}
