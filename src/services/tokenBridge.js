let tokenAccessor = null;

export function setTokenAccessor(accessor) {
    tokenAccessor = accessor;
}

export async function getToken() {
    return tokenAccessor ? tokenAccessor() : null;
}
