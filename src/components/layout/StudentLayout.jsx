/* src/components/layout/StudentLayout.jsx */
import React from 'react';
import { Outlet } from 'react-router-dom';
import StudentSidebar from './StudentSidebar';
import { Search, Bell, User } from 'lucide-react';
import { useAuth } from '../../pages/Library/context/AuthContext';

const StudentLayout = () => {
    const { user } = useAuth();

    return (
        <div className="d-flex" style={{ height: '100vh', backgroundColor: '#020617' }}>
            {/* VERTICAL SIDEBAR */}
            <StudentSidebar />

            <div className="flex-grow-1 d-flex flex-column overflow-hidden">
                {/* TOP NAVIGATION */}
                <header className="px-4 d-flex align-items-center justify-content-between" style={{ height: 80, borderBottom: '1px solid rgba(255, 255, 255, 0.05)' }}>
                    <div className="d-flex align-items-center gap-2 bg-white bg-opacity-5 px-3 py-2 rounded-pill" style={{ width: 400 }}>
                        <Search size={18} className="text-secondary" />
                        <input
                            type="text"
                            placeholder="Search resources..."
                            className="bg-transparent border-0 text-white small w-100"
                            style={{ outline: 'none' }}
                        />
                    </div>

                    <div className="d-flex align-items-center gap-4">
                        <button className="btn btn-link p-2 text-secondary position-relative">
                            <Bell size={20} />
                            <span className="position-absolute top-2 start-6 translate-middle p-1 bg-danger border border-dark rounded-circle"></span>
                        </button>

                        <div className="d-flex align-items-center gap-3 ps-3 border-start border-white border-opacity-10">
                            <div className="text-end d-none d-md-block">
                                <div className="fw-bold text-white small">{user?.firstName || 'Alex'} {user?.lastName || 'Johnson'}</div>
                                <div className="text-secondary" style={{ fontSize: 11 }}>{user?.role === 'STUDENT' ? 'Computer Science' : 'Instructor'}</div>
                            </div>
                            <div className="rounded-circle bg-primary-subtle text-primary d-flex align-items-center justify-content-center fw-bold" style={{ width: 40, height: 40 }}>
                                <User size={20} />
                            </div>
                        </div>
                    </div>
                </header>

                {/* SCROLLABLE MAIN CONTENT */}
                <main className="flex-grow-1 overflow-auto p-4">
                    <Outlet />
                </main>
            </div>
        </div>
    );
};

export default StudentLayout;
