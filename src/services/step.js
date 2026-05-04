import { request } from './client';

export const list = (itineraryId) => request('/steps', { params: { itineraryId } });

export const get = (id) => request(`/steps/${id}`);

export const create = (data) => request('/steps', { method: 'POST', data });

export const createWithDuration = (data) => request('/steps/create-with-duration', { method: 'POST', data });

export const update = (id, data) => request(`/steps/${id}`, { method: 'PUT', data });

export const remove = (id) => request(`/steps/${id}`, { method: 'DELETE' });
