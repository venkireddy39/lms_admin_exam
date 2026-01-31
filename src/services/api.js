import { AUTH_TOKEN_KEY } from "./auth.constants";

const API_BASE = import.meta.env.VITE_API_BASE || "";

export async function apiFetch(url, options = {}) {
    const token = localStorage.getItem(AUTH_TOKEN_KEY);

    const headers = {
        "Content-Type": "application/json",
        ...(options.headers || {}),
    };

    if (token) {
        headers.Authorization = `Bearer ${token}`;
    }

    if (options.headers && options.headers["Content-Type"] === null) {
        delete headers["Content-Type"];
    }

    const fullUrl = url.startsWith('http') ? url : (API_BASE + url);

    const res = await fetch(fullUrl, {
        ...options,
        headers,
    });

    if (res.status === 401) {
        // If we're in guest mode/dev mode, don't kick the user out to the login page
        if (token === "dev-mock-token") {
            console.warn("Unauthorized API call in Guest Mode. Bypassing redirect.");
            throw new Error("Unauthorized (Guest Mode)");
        }

        localStorage.removeItem(AUTH_TOKEN_KEY);
        localStorage.removeItem("auth_user");
        if (typeof window !== 'undefined') {
            window.location.href = "/login";
        }
        throw new Error("Unauthorized");
    }

    if (res.status === 403) {
        throw new Error("Access Denied: You do not have permission to perform this action.");
    }

    if (!res.ok) {
        const text = await res.text();
        throw new Error(text || "API error");
    }

    if (res.status === 204) return null;

    const contentType = res.headers.get("content-type");
    if (contentType && contentType.includes("application/json")) {
        return res.json();
    }
    return res.text();
}
