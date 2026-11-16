import { useEffect } from 'react';
import { useAuth } from '@clerk/react';
import { setTokenAccessor } from '../services/tokenBridge';

export default function ClerkTokenBridge() {
    const { getToken } = useAuth();

    useEffect(() => {
        setTokenAccessor(getToken);
        return () => setTokenAccessor(null);
    }, [getToken]);

    return null;
}
