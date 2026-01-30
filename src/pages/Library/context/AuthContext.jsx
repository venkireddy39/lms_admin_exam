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

/* =========================
   ROLE → PERMISSION MAP
   ========================= */

const ROLE_PERMISSIONS = {
    ADMIN: [
        'VIEW_DASHBOARD',
        'MANAGE_BOOKS', 'VIEW_BOOKS',
        'MANAGE_MEMBERS', 'VIEW_MEMBERS',
        'ISSUE_BOOKS', 'VIEW_ISSUES', 'RETURN_BOOKS',
        'VIEW_REPORTS',
        'SYSTEM_SETTINGS',
        'BATCH_CREATE', 'BATCH_VIEW', 'BATCH_UPDATE', 'BATCH_DELETE',
        'SESSION_CREATE', 'SESSION_VIEW', 'SESSION_UPDATE', 'SESSION_DELETE',
        'COURSE_BATCH_STATS_VIEW',
        'STUDENT_BATCH_CREATE', 'STUDENT_BATCH_UPDATE', 'STUDENT_BATCH_DELETE', 'STUDENT_BATCH_VIEW',
        'STUDENT_BATCH_TRANSFER_CREATE', 'STUDENT_BATCH_TRANSFER_VIEW'
    ],
    MARKETING_MANAGER: [
        'VIEW_MARKETING_DASHBOARD',
        'MANAGE_CAMPAIGNS_APPROVAL',
        'VIEW_GLOBAL_ANALYTICS',
        'CONFIGURE_MARKETING_SETTINGS'
    ],
    LIBRARIAN: [
        'VIEW_DASHBOARD',
        'MANAGE_BOOKS', 'VIEW_BOOKS',
        'VIEW_MEMBERS',
        'ISSUE_BOOKS', 'VIEW_ISSUES', 'RETURN_BOOKS'
    ],
    STUDENT: [
        'VIEW_DASHBOARD',
        'VIEW_BOOKS',
        'VIEW_MY_ACCOUNT'
    ]
};

/* =========================
   AUTH PROVIDER
   ========================= */

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    console.log("AuthProvider: Current State", { user, loading });

    /* ---------- RESTORE SESSION ---------- */
    useEffect(() => {
        // Try autologin from generated token (Dev Helper)
        try {
            import('../../../generated_token.json').then(module => {
                const devToken = module.default;
                if (devToken && devToken.token) {
                    const current = localStorage.getItem(AUTH_TOKEN_KEY);
                    if (current !== devToken.token) {
                        console.log("Auto-injecting generated dev token...");
                        localStorage.setItem(AUTH_TOKEN_KEY, devToken.token);
                        const dummyUser = { email: "admin@gmail.com", role: "ADMIN", name: "Dev Admin", userId: 1 };
                        localStorage.setItem('auth_user', JSON.stringify(dummyUser));
                        setUser(dummyUser);
                    }
                }
            }).catch(err => console.log("No dev token found"));
        } catch (e) {
            // Ignore
        }

        const token = localStorage.getItem(AUTH_TOKEN_KEY);
        const savedUser = localStorage.getItem('auth_user');

        if (token && savedUser) {
            try {
                setUser(JSON.parse(savedUser));
            } catch (e) {
                console.error("AuthContext: Failed to restore session", e);
                localStorage.removeItem(AUTH_TOKEN_KEY);
                localStorage.removeItem('auth_user');
            }
        }
        setLoading(false);
    }, []);

    /* ---------- LOGIN ---------- */
    const login = async (email, password) => {
        setLoading(true);
        try {
            const data = await authService.login(email, password);
            const token = data.token || data.jwt;

            if (!token) throw new Error("No token received");

            const userData = {
                email: email,
                role: data.user?.role || 'ADMIN',
                ...data.user
            };

            localStorage.setItem(AUTH_TOKEN_KEY, token);
            localStorage.setItem('auth_user', JSON.stringify(userData));

            setUser(userData);
            return userData;
        } catch (error) {
            console.error("AuthContext: Login Error", error);
            throw error;
        } finally {
            setLoading(false);
        }
    };

    /* ---------- LOGOUT ---------- */
    const logout = () => {
        localStorage.removeItem(AUTH_TOKEN_KEY);
        localStorage.removeItem('auth_user');
        setUser(null);
        window.location.href = '/login';
    };

    /* ---------- PERMISSION CHECK ---------- */
    const hasPermission = (permission) => {
        if (!user || !user.role) return false;
        if (user.role === 'ADMIN') return true;

        const perms = ROLE_PERMISSIONS[user.role] || [];
        return perms.includes(permission);
    };

    /* ---------- DEV LOGIN (MOCK) ---------- */
    const devLogin = () => {
        const mockUser = {
            email: "admin@gmail.com",
            role: "ADMIN",
            firstName: "Dev",
            lastName: "Admin",
            userId: 1
        };
        localStorage.setItem(AUTH_TOKEN_KEY, "dev-mock-token");
        localStorage.setItem('auth_user', JSON.stringify(mockUser));
        setUser(mockUser);
    };

    return (
        <AuthContext.Provider
            value={{
                user,
                login,
                logout,
                devLogin,
                loading,
                hasPermission
            }}
        >
            {!loading && children}
        </AuthContext.Provider>
    );
};
