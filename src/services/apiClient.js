import axios from 'axios';
import { AUTH_TOKEN_KEY } from './auth.constants';

const apiClient = axios.create({
    baseURL: '', // Handled by Vite proxy
    headers: {
        'Content-Type': 'application/json',
    },
});

apiClient.interceptors.request.use((config) => {
    const token = localStorage.getItem(AUTH_TOKEN_KEY);
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
}, (error) => Promise.reject(error));

export default apiClient;
