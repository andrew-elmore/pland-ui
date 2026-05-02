import { request } from './client';

export const list = (skip, limit) => request('/plans', { params: { skip, limit } });

export const get = (id) => request(`/plans/${id}`);

export const create = (data) => request('/plans', { method: 'POST', data });

export const update = (id, data) => request(`/plans/${id}`, { method: 'PUT', data });

export const remove = (id) => request(`/plans/${id}`, { method: 'DELETE' });
