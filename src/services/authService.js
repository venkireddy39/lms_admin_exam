import { AUTH_TOKEN_KEY } from './auth.constants';

export const authService = {
    login: async (email, password) => {
        const res = await fetch('/auth/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ email, password })
        });

        if (!res.ok) {
            const error = await res.text();
            throw new Error(error || 'Login failed');
        }

        // Backend returns the raw token string, not JSON
        const text = await res.text();
        try {
            return JSON.parse(text); // Try parsing just in case it IS json
        } catch (e) {
            return { token: text }; // If not json, it's the raw token string
        }
    },

    logout: () => {
        localStorage.removeItem(AUTH_TOKEN_KEY);
        localStorage.removeItem('auth_user');
        window.location.href = '/login';
    }
};
