import { request } from './client';

export const list = (planId) => request('/itineraries', { params: { planId } });

export const get = (id) => request(`/itineraries/${id}`);

export const create = (data) => request('/itineraries', { method: 'POST', data });

export const update = (id, data) => request(`/itineraries/${id}`, { method: 'PUT', data });

export const remove = (id) => request(`/itineraries/${id}`, { method: 'DELETE' });
