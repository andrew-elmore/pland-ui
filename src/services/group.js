import { request } from './client';

export const list = (planId) => request('/groups', { params: { planId } });

export const get = (id) => request(`/groups/${id}`);

export const create = (data) => request('/groups', { method: 'POST', data });

export const update = (id, data) => request(`/groups/${id}`, { method: 'PUT', data });

export const remove = (id) => request(`/groups/${id}`, { method: 'DELETE' });
