import React, { useState } from 'react';
import { Outlet, Navigate } from 'react-router-dom';
import StudentSidebar from './StudentSidebar';
import StudentNavbar from './StudentNavbar';
import { useAuth } from '../../pages/Library/context/AuthContext';

const StudentLayout = () => {
    const { user, loading } = useAuth();
    const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

    if (loading) {
        return (
            <div className="d-flex justify-content-center align-items-center vh-100" style={{ backgroundColor: 'var(--bg)' }}>
                <div className="spinner-border text-primary" role="status">
                    <span className="visually-hidden">Loading...</span>
                </div>
            </div>
        );
    }

    if (!user || user.role?.toUpperCase() !== 'STUDENT') {
        console.warn("Restricted Access: Non-student attempting to access student UI.");
        return <Navigate to="/login" replace />;
    }

    const toggleSidebar = () => setIsSidebarCollapsed(!isSidebarCollapsed);

    return (
        <div className="d-flex" style={{ height: '100vh', backgroundColor: 'var(--bg)' }}>
            {/* VERTICAL SIDEBAR */}
            <StudentSidebar isCollapsed={isSidebarCollapsed} />

            <div className={`flex-grow-1 d-flex flex-column overflow-hidden transition-all-custom ${isSidebarCollapsed ? 'sidebar-collapsed-content' : ''}`}>
                {/* TOP NAVIGATION */}
                <StudentNavbar toggleSidebar={toggleSidebar} isSidebarCollapsed={isSidebarCollapsed} />

                {/* SCROLLABLE MAIN CONTENT */}
                <main className="flex-grow-1 overflow-auto p-4">
                    <Outlet />
                </main>

            </div>
        </div>
    );
};

export default StudentLayout;
