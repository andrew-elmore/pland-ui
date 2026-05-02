import { request } from './client';

export const list = (planId) => request('/locations', { params: { planId } });

export const get = (id) => request(`/locations/${id}`);

export const create = (data) => request('/locations', { method: 'POST', data });

export const update = (id, data) => request(`/locations/${id}`, { method: 'PUT', data });

export const remove = (id) => request(`/locations/${id}`, { method: 'DELETE' });
