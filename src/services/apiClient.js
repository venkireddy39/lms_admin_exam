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
        console.log(`[apiClient] Sending request to ${config.url} with token (first 20 chars): ${token.substring(0, 20)}...`);
    } else {
        console.warn(`[apiClient] No token found in localStorage under key: ${AUTH_TOKEN_KEY}`);
    }
    return config;
}, (error) => Promise.reject(error));

export default apiClient;
