import { request } from './client';

export const list = (planId) => request('/participants', { params: { planId } });

export const get = (id) => request(`/participants/${id}`);

export const create = (data) => request('/participants', { method: 'POST', data });

export const update = (id, data) => request(`/participants/${id}`, { method: 'PUT', data });

export const remove = (id) => request(`/participants/${id}`, { method: 'DELETE' });
