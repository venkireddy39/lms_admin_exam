import React, { createContext, useContext, useState, useEffect } from 'react';
import { authService } from '../../../services/authService';
import { AUTH_TOKEN_KEY } from '../../../services/auth.constants';

import { studentService } from '../../../services/studentService';

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

const DEFAULT_STUDENT = {
    email: "student@gmail.com",
    role: "STUDENT",
    firstName: "Student",
    lastName: "User",
    userId: 2,
    name: "Student User"
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
        const initAuth = async () => {
            // 1. Try autologin from generated token (Dev Helper)
            try {
                const module = await import('../../../generated_token.json');
                const devToken = module.default;
                if (devToken && devToken.token) {
                    const current = localStorage.getItem(AUTH_TOKEN_KEY);
                    if (!current || current === 'dev-mock-token') {
                        localStorage.setItem(AUTH_TOKEN_KEY, devToken.token);
                        const dummyUser = { email: "admin@gmail.com", role: "ADMIN", name: "Dev Admin", userId: 1 };
                        localStorage.setItem('auth_user', JSON.stringify(dummyUser));
                    }
                }
            } catch (e) { }

            // 2. Main Auth Logic
            const token = localStorage.getItem(AUTH_TOKEN_KEY);
            const savedUser = localStorage.getItem('auth_user');

            if (token) {
                if (savedUser) {
                    const parsed = JSON.parse(savedUser);
                    setUser(parsed);

                    // If it's a student, try refreshing profile from backend for "real details"
                    if (parsed.role === 'STUDENT' && token !== 'mock-student-token') {
                        try {
                            const profile = await studentService.getProfile();
                            if (profile) {
                                const updated = { ...parsed, ...profile, role: 'STUDENT' };
                                setUser(updated);
                                localStorage.setItem('auth_user', JSON.stringify(updated));
                            }
                        } catch (e) {
                            console.warn("Could not refresh real student profile, staying with cached info");
                        }
                    }
                } else {
                    // Token exists but no user data - try to get profile
                    try {
                        const profile = await studentService.getProfile();
                        if (profile) {
                            const u = { ...profile, role: 'STUDENT' };
                            setUser(u);
                            localStorage.setItem('auth_user', JSON.stringify(u));
                        } else {
                            setUser(DEFAULT_STUDENT);
                        }
                    } catch (e) {
                        setUser(DEFAULT_STUDENT);
                    }
                }
            } else {
                // No session? Default to STUDENT (Remove Login Requirement)
                console.log("AuthContext: Defaulting to Student Mode");
                setUser(DEFAULT_STUDENT);
                localStorage.setItem(AUTH_TOKEN_KEY, "mock-student-token");
                localStorage.setItem('auth_user', JSON.stringify(DEFAULT_STUDENT));
            }

            setLoading(false);
        };

        initAuth();
    }, []);

    /* ---------- LOGIN ---------- */
    const login = async (email, password) => {
        setLoading(true);
        try {
            const data = await authService.login(email, password);
            const token = data.token || data.jwt;

            if (!token) throw new Error("No token received");

            const rawRole = data.user?.role || (email.toLowerCase().includes('student') ? 'STUDENT' : 'ADMIN');
            const derivedRole = rawRole.replace('ROLE_', '');

            const userData = {
                email: email,
                ...data.user,
                role: derivedRole
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
    /* ---------- DEV LOGIN (MOCK) ---------- */
    const devLogin = (role = 'ADMIN') => {
        const mockUser = role === 'STUDENT' ? {
            email: "student@gmail.com",
            role: "STUDENT",
            firstName: "John",
            lastName: "Student",
            userId: 2
        } : {
            email: "admin@gmail.com",
            role: "ADMIN",
            firstName: "Dev",
            lastName: "Admin",
            userId: 1
        };

        localStorage.setItem(AUTH_TOKEN_KEY, "dev-mock-token");
        localStorage.setItem('auth_user', JSON.stringify(mockUser));
        setUser(mockUser);
        return mockUser;
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
