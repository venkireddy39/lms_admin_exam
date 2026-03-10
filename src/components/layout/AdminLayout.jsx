
import React from 'react';
import { Outlet, Navigate, useLocation } from 'react-router-dom';
import TopNavbar from './TopNavbar';
import { useAuth } from '../../pages/Library/context/AuthContext';

/**
 * AdminLayout - Auth-guarded layout for all /admin routes
 * Includes AdminSidebar and either TopNav or AdminHeader
 */
const AdminLayout = () => {
    const { user, loading } = useAuth();
    const location = useLocation();


    if (loading) {
        return (
            <div className="d-flex justify-content-center align-items-center vh-100 bg-light">
                <div className="spinner-border text-primary" role="status">
                    <span className="visually-hidden">Loading...</span>
                </div>
            </div>
        );
    }

    // Role check - allow Admin, Affiliate and other staff roles
    const role = user?.role?.toUpperCase();
    const allowedRoles = ['ADMIN', 'SUPER_ADMIN', 'LIBRARIAN', 'MARKETING_MANAGER', 'INSTRUCTOR', 'AFFILIATE', 'DRIVER', 'CONDUCTOR'];

    if (!user || !allowedRoles.includes(role)) {
        console.warn("Restricted Access: Unauthorized attempt to access admin UI.", { role });
        return <Navigate to="/login" replace />;
    }

    return (
        <div className="min-vh-100 d-flex flex-column" style={{ backgroundColor: '#f8fafc' }}>
            {/* TOP NAVBAR */}
            <TopNavbar />

            {/* MAIN CONTENT */}
            <main className="flex-grow-1 p-4">
                <div className="container-fluid">
                    <Outlet />
                </div>
            </main>
        </div>
    );
};

export default AdminLayout;
