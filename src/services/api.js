import axios from "axios";
import { AUTH_TOKEN_KEY } from "./auth.constants";

const API_BASE = import.meta.env.VITE_API_BASE || "";

const api = axios.create({
    baseURL: API_BASE,
    headers: {
        "Content-Type": "application/json",
        "Accept": "application/json",
    },
});

// Request Interceptor
api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem(AUTH_TOKEN_KEY);
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }

        const savedUser = localStorage.getItem('auth_user');
        if (savedUser) {
            try {
                const parsed = JSON.parse(savedUser);
                const tenant = parsed.tenant || parsed.tenantDb;
                if (tenant) {
                    config.headers["X-Tenant-DB"] = tenant;
                }
            } catch (e) {
                // Ignore parse errors
            }
        }
        return config;
    },
    (error) => Promise.reject(error)
);

// Response Interceptor
api.interceptors.response.use(
    (response) => response.data,
    (error) => {
        const { response } = error;
        if (response) {
            if (response.status === 401) {
                console.warn("API 401: Session expired.");
            }

            let errorMsg = "An error occurred";
            if (response.data) {
                // Handle different error structures from backend
                if (typeof response.data === 'string') {
                    errorMsg = response.data;
                } else {
                    errorMsg = response.data.message || response.data.error || JSON.stringify(response.data);
                }
            }

            return Promise.reject(new Error(errorMsg));
        }
        return Promise.reject(error);
    }
);

/**
 * Backward compatibility wrapper for apiFetch using axios
 */
export async function apiFetch(url, options = {}) {
    const method = options.method || "GET";
    let data = options.body;
    if (typeof data === "string") {
        try {
            data = JSON.parse(data);
        } catch (e) {
            // Keep as string if not JSON
        }
    }

    try {
        const response = await api({
            url,
            method,
            data,
            headers: options.headers,
            params: options.params
        });
        return response;
    } catch (error) {
        throw error;
    }
}

/**
 * Utility to construct full URL path for fee-management API
 */
export function getUrl(path) {
    if (path.startsWith('http')) return path;
    const cleanPath = path.startsWith('/') ? path : `/${path}`;

    // Check if the path is explicitly for payment gateway or fee management
    if (cleanPath.startsWith('/payment-gateway')) {
        return `/api${cleanPath}`;
    }

    return `/api/fee-management${cleanPath}`;
}

export default api;
