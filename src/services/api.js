import axios from "axios";
import { AUTH_TOKEN_KEY } from "./auth.constants";

const API_BASE = import.meta.env.DEV ? "" : (import.meta.env.VITE_API_BASE || "");

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
        const token = localStorage.getItem(AUTH_TOKEN_KEY) || import.meta.env.VITE_DEV_AUTH_TOKEN;
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }

        const savedUser = localStorage.getItem('auth_user');
        let tenant = null;

        if (savedUser) {
            try {
                const parsed = JSON.parse(savedUser);
                tenant = parsed.tenant || parsed.tenantDb;
            } catch (e) { }
        }

        // Fallback: If tenant still missing, decode the token manually
        if (!tenant && token) {
            try {
                const base64Url = token.split('.')[1];
                const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
                const decoded = JSON.parse(atob(base64));
                const extracted = decoded.tenantDb || decoded.tenant || (decoded.sub && decoded.sub.split('@')[1]?.split('.')[0]);
                
                // If extracted is 'gmail', it's likely a generic admin login, use default
                tenant = (extracted === 'gmail') ? (import.meta.env.VITE_DEFAULT_TENANT || 'classx360') : extracted;
            } catch (e) { }
        }

        // Final safety fallback
        if (!tenant) tenant = import.meta.env.VITE_DEFAULT_TENANT || 'classx360';

        if (tenant) {
            config.headers["X-Tenant-DB"] = tenant;
        }

        // --- CRITICAL FIX FOR MULTIPART FORM DATA ---
        // Axios merges default headers with request headers. 
        // If we don't delete it here, the default "application/json" destroys the browser boundary.
        if (config.data instanceof FormData) {
            delete config.headers["Content-Type"];
        }

        return config;
    },
    (error) => Promise.reject(error)
);

import { toast } from "react-toastify";

// Response Interceptor
api.interceptors.response.use(
    (response) => response.data,
    (error) => {
        const { response } = error;
        let errorMsg = "An error occurred";

        if (response) {
            if (response.status === 401) {
                console.warn("API 401: Session expired or invalid token.");
                errorMsg = "Unauthorized: Please log in again.";
            } else if (response.data) {
                if (typeof response.data === 'string') {
                    errorMsg = response.data;
                } else {
                    errorMsg = response.data.message || response.data.error || JSON.stringify(response.data);
                }
            }
        } else {
            errorMsg = error.message || "Network Error: Backend might be unreachable.";
        }

        // Only show toast if it's not a background fetch or if we specifically want it
        if (!error.config?.hideToast) {
            toast.error(errorMsg);
        }

        console.error("API Error Trace:", {
            url: error.config?.url,
            method: error.config?.method,
            status: response?.status,
            message: errorMsg
        });

        return Promise.reject(new Error(errorMsg));
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

    // Important: if sending FormData, do NOT stringify and do NOT use application/json
    let reqHeaders = { ...options.headers };
    if (data instanceof FormData) {
        // Remove Application/JSON explicitly so Axios generates the boundary
        delete reqHeaders['Content-Type'];
    }

    try {
        const response = await api({
            url,
            method,
            data,
            headers: Object.keys(reqHeaders).length > 0 ? reqHeaders : undefined,
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

    return `/api/v1/fee-management${cleanPath}`;
}

export default api;
