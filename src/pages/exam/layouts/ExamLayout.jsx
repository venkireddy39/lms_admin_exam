import React from 'react';
import { Outlet, NavLink, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
    LayoutDashboard,
    Database,
    PlusCircle,
    Calendar,
    BarChart3,
    Trophy,
    Settings
} from 'lucide-react';

const ExamLayout = () => {
    const location = useLocation();

    // Hide navigation for standalone editors or specific views if needed
    const isFullscreenEditor = location.pathname.includes('/create-exam') || location.pathname.includes('/edit-exam');

    const navItems = [
        { to: "/admin/exams/dashboard", label: "Dashboard", icon: LayoutDashboard },
        { to: "/admin/exams/question-bank", label: "Question Bank", icon: Database },
        { to: "/admin/exams/create-exam", label: "Create New", icon: PlusCircle },
        { to: "/admin/exams/schedule", label: "Schedule", icon: Calendar },
        { to: "/admin/exams/reports", label: "Reports", icon: BarChart3 },
        { to: "/admin/exams/leaderboard", label: "Leaderboard", icon: Trophy },
        { to: "/admin/exams/settings", label: "Settings", icon: Settings },
    ];

    return (
        <div className="exam-module-container min-vh-100 bg-light">
            {/* Sub-Navigation Bar */}
            <div className="sticky-top bg-white border-bottom shadow-sm z-index-1000">
                <div className="container-fluid px-4">
                    <div className="d-flex align-items-center justify-content-between py-2">
                        <div className="d-flex align-items-center gap-2 me-4">
                            <div className="p-2 bg-primary rounded-3 text-white">
                                <BarChart3 size={20} />
                            </div>
                            <h5 className="mb-0 fw-bold text-dark d-none d-lg-block">Exams Control Center</h5>
                        </div>

                        <nav className="flex-grow-1 overflow-auto scrollbar-hide">
                            <ul className="nav nav-pills flex-nowrap gap-1">
                                {navItems.map((item) => (
                                    <li key={item.to} className="nav-item">
                                        <NavLink
                                            to={item.to}
                                            className={({ isActive }) =>
                                                `nav-link d-flex align-items-center gap-2 px-3 py-2 rounded-pill transition-all small fw-semibold ${isActive
                                                    ? 'bg-primary text-white shadow-sm'
                                                    : 'text-secondary hover-bg-light'
                                                }`
                                            }
                                        >
                                            <item.icon size={16} />
                                            <span>{item.label}</span>
                                            {location.pathname === item.to && (
                                                <motion.div
                                                    layoutId="activeTab"
                                                    className="position-absolute bottom-0 start-0 end-0"
                                                    initial={false}
                                                    transition={{ type: "spring", stiffness: 500, damping: 30 }}
                                                />
                                            )}
                                        </NavLink>
                                    </li>
                                ))}
                            </ul>
                        </nav>
                    </div>
                </div>
            </div>

            {/* Main Content Area */}
            <main className={`${isFullscreenEditor ? '' : 'py-4'}`}>
                <div className={isFullscreenEditor ? '' : 'container-fluid px-4'}>
                    <Outlet />
                </div>
            </main>

            <style>{`
                .scrollbar-hide::-webkit-scrollbar { display: none; }
                .scrollbar-hide { -ms-overflow-style: none; scrollbar-width: none; }
                .hover-bg-light:hover { background-color: #f8fafc; color: #0f172a; }
                .transition-all { transition: all 0.2s ease-in-out; }
                .z-index-1000 { z-index: 1000; }
                .btn-premium {
                    background: linear-gradient(135deg, #6366f1 0%, #4f46e5 100%);
                    color: white;
                    border: none;
                }
            `}</style>
        </div>
    );
};

export default ExamLayout;
