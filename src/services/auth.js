import { request } from './client';

export const register = (data) => request('/auth/register', { method: 'POST', data });

export const login = (data) => request('/auth/login', { method: 'POST', data });

export const me = () => request('/auth/me');
