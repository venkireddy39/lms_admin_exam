import { AUTH_TOKEN_KEY } from './auth.constants';

export const authService = {
    login: async (email, password, isRetry = false) => {
        // Pointing to /auth/login which is proxied in vite.config.js
        const res = await fetch('/auth/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ email, username: email, password })
        });

        if (!res.ok) {
            const text = await res.text();
            let errorMsg = text;
            try {
                const parsed = JSON.parse(text);
                errorMsg = parsed.message || parsed.error || text;
            } catch (e) { }

            // Auto-logout and retry if backend complains about existing session
            if (errorMsg && errorMsg.includes("active session") && !isRetry) {
                console.warn("[AuthService] Active session detected on server. Attempting force logout and retry...");
                try {
                    await fetch('/auth/logout', { method: 'POST' });
                    // Give server small delay to clear session
                    await new Promise(r => setTimeout(r, 500));
                    return authService.login(email, password, true);
                } catch (retryErr) {
                    console.error("Force logout retry failed", retryErr);
                }
            }

            throw new Error(errorMsg || 'Login failed');
        }

        // Backend returns the raw token string
        const token = await res.text();
        localStorage.setItem(AUTH_TOKEN_KEY, token);
        return { token };
    },

    logout: async () => {
        try {
            await fetch('/auth/logout', { method: 'POST' });
        } catch (e) {
            console.warn("Server logout call failed", e);
        }
        localStorage.removeItem(AUTH_TOKEN_KEY);
        localStorage.removeItem('auth_user');
        window.location.href = '/login';
    }
};
