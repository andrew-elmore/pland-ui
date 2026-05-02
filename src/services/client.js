import axios from 'axios';

const client = axios.create({
    baseURL: import.meta.env.VITE_API_URL ?? 'http://localhost:3001/api',
});

client.interceptors.request.use((config) => {
    const token = localStorage.getItem('pland_token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

client.interceptors.response.use(
    (response) => response.data,
    (error) => {
        if (error.response?.status === 401) {
            localStorage.removeItem('pland_token');
        }
        return Promise.reject(error);
    },
);

export const request = (endpoint, options) => client(endpoint, options);

export default client;
