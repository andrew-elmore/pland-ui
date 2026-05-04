import { request } from './client';

export const list = (planId) => request('/routes', { params: { planId } });

export const get = (id) => request(`/routes/${id}`);

export const create = (data) => request('/routes', { method: 'POST', data });

export const update = (id, data) => request(`/routes/${id}`, { method: 'PUT', data });

export const remove = (id) => request(`/routes/${id}`, { method: 'DELETE' });

export const calculate = (data) => request('/routes/calculate', { method: 'POST', data });

export const preview = (data) => request('/routes/preview', { method: 'POST', data });

export const recalculateAll = (planId) => request('/routes/recalculate-all', { method: 'POST', data: { planId } });
