import { request } from './client';

export const list = (planId) => request('/times', { params: { planId } });

export const get = (id) => request(`/times/${id}`);

export const create = (data) => request('/times', { method: 'POST', data });

export const update = (id, data) => request(`/times/${id}`, { method: 'PUT', data });

export const remove = (id) => request(`/times/${id}`, { method: 'DELETE' });

export const merge = (id, sourceTimeId) => request(`/times/${id}/merge`, { method: 'POST', data: { sourceTimeId } });
