import axios from 'axios';
import { getToken } from './tokenBridge';
import { isDevAuth } from '../auth/authMode';
import { devUser } from '../auth/devUser';

const client = axios.create({
    baseURL: import.meta.env.VITE_API_URL ?? 'http://localhost:3001/api',
});

client.interceptors.request.use(async (config) => {
    if (isDevAuth()) {
        config.headers['X-Dev-User'] = encodeURIComponent(JSON.stringify(devUser()));
        return config;
    }
    const token = await getToken();
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

client.interceptors.response.use((response) => response.data);

export const request = (endpoint, options) => client(endpoint, options);

export default client;
