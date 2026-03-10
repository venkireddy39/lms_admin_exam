import axios from 'axios';
import { AUTH_TOKEN_KEY } from './auth.constants';

const apiClient = axios.create({
    baseURL: '', // Handled by Vite proxy
    headers: {
        'Content-Type': 'application/json',
    },
});

apiClient.interceptors.request.use((config) => {
    const isValid = (val) => val && val !== 'null' && val !== 'undefined';

    const token = localStorage.getItem(AUTH_TOKEN_KEY);
    const url = config.url || '';
    const isAffiliateRequest = url.includes('/api/affiliate') ||
        url.includes('/api/admin/affiliate') ||
        url.includes('/api/admin/leads') ||
        url.includes('/api/admin/sales');

    if (isValid(token) && !isAffiliateRequest) {
        config.headers.Authorization = `Bearer ${token}`;
    }

    const savedUser = localStorage.getItem('auth_user');
    if (isValid(savedUser)) {
        try {
            const parsed = JSON.parse(savedUser);
            const tenant = parsed.tenant || parsed.tenantDb;
            if (isValid(tenant)) {
                config.headers["X-Tenant-DB"] = tenant;
            }
        } catch (e) { }
    }

    return config;
}, (error) => Promise.reject(error));

export default apiClient;
