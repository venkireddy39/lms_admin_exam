import React, { createContext, useContext, useState, useEffect } from 'react';
import { authService } from '../../../services/authService';
import { AUTH_TOKEN_KEY } from '../../../services/auth.constants';

const AuthContext = createContext(null);

export const useAuth = () => {
    const ctx = useContext(AuthContext);
    if (!ctx) {
        throw new Error("useAuth must be used inside AuthProvider");
    }
    return ctx;
};

// Helper to decode JWT without a library
const decodeJWT = (token) => {
    try {
        const base64Url = token.split('.')[1];
        const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
        const jsonPayload = decodeURIComponent(atob(base64).split('').map(function (c) {
            return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
        }).join(''));

        return JSON.parse(jsonPayload);
    } catch (e) {
        return null;
    }
};

/* =========================
   ROLE → PERMISSION MAP
   ========================= */
const ROLE_PERMISSIONS = {
    ADMIN: ['VIEW_DASHBOARD', 'MANAGE_BOOKS', 'SYSTEM_SETTINGS'],
    STUDENT: ['VIEW_DASHBOARD', 'VIEW_BOOKS', 'VIEW_MY_ACCOUNT']
};

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    const initUserFromToken = async (token, existingUserData = {}) => {
        const decoded = decodeJWT(token);
        if (!decoded) return null;

        console.log("AuthContext: Token Decoded", decoded);

        // Backend roles are usually ROLE_STUDENT or in a roles list
        const rawRole = decoded.role ||
            (decoded.roles && decoded.roles[0]) ||
            (decoded.authorities && decoded.authorities[0]) ||
            existingUserData.role;
        const derivedRole = String(rawRole || '')
            .replace('ROLE_', '')
            .replace(/^\[/, '')
            .replace(/\]$/, '')
            .toUpperCase();

        const userData = {
            userId: decoded.userId || decoded.id || decoded.sub,
            email: decoded.sub || decoded.email,
            tenant: decoded.tenantDb || decoded.tenant || decoded.tenantName || decoded.tenant_id,
            permissions: Array.isArray(decoded.permissions) ? decoded.permissions : [],
            ...existingUserData,
            role: derivedRole
        };

        setUser(userData);
        localStorage.setItem('auth_user', JSON.stringify(userData));

        return userData;
    };

    useEffect(() => {
        const restoreSession = async () => {
            const token = localStorage.getItem(AUTH_TOKEN_KEY);
            const savedUser = localStorage.getItem('auth_user');

            if (token) {
                try {
                    // Try to restore from saved data first for speed
                    if (savedUser) {
                        setUser(JSON.parse(savedUser));
                    }
                    // Then re-initialize to ensure everything is fresh/correct
                    await initUserFromToken(token, savedUser ? JSON.parse(savedUser) : {});
                } catch (e) {
                    console.error("Session restoration failed", e);
                    logout();
                }
            }
            setLoading(false);
        };
        restoreSession();
    }, []);

    const login = async (email, password) => {
        setLoading(true);
        try {
            const data = await authService.login(email, password);
            const token = data.token || data.jwt || (typeof data === 'string' ? data : null);

            if (!token) throw new Error("Invalid response from server");

            localStorage.setItem(AUTH_TOKEN_KEY, token);
            return await initUserFromToken(token, { email });
        } catch (error) {
            console.error("Login failed:", error);
            throw error;
        } finally {
            setLoading(false);
        }
    };

    const logout = () => {
        localStorage.removeItem(AUTH_TOKEN_KEY);
        localStorage.removeItem('auth_user');
        setUser(null);
        window.location.href = '/login';
    };

    const hasPermission = (permission) => {
        if (!user) {
            console.warn("hasPermission: No user logged in");
            return false;
        }

        // 1. Check explicit permissions array from JWT
        if (user.permissions && user.permissions.includes(permission)) {
            return true;
        }

        // 2. Fallback to Role-based checks
        if (user.role === 'ADMIN' || user.role === 'SUPER_ADMIN') {
            return true;
        }

        // 3. Optional: Hardcoded mapping fallback
        const allowed = (ROLE_PERMISSIONS[user.role] || []).includes(permission);
        if (!allowed) {
            console.warn(`Permission Denied: User role ${user.role} missing ${permission}`);
        }
        return allowed;
    };

    return (
        <AuthContext.Provider value={{ user, login, logout, loading, hasPermission }}>
            {!loading && children}
        </AuthContext.Provider>
    );
};
