import axios from 'axios';
import { AUTH_TOKEN_KEY } from './auth.constants';

// Use relative URL in development to let Vite proxy handle it, otherwise use direct IP
const API_BASE_URL = import.meta.env.DEV ? "" : (import.meta.env.VITE_API_BASE || 'http://100.96.210.91:5151');

const apiClient = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Request Interceptor
apiClient.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem(AUTH_TOKEN_KEY);
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

export default apiClient;
