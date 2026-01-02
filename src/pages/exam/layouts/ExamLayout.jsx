import React from 'react';
import { Outlet } from "react-router-dom";
import { Link, useLocation } from "react-router-dom";
import { FaCalendarAlt, FaChartBar, FaFileAlt, FaBars, FaTimes, FaBook, FaPlusCircle } from "react-icons/fa";

const ExamLayout = () => {
    const location = useLocation();

    const isActive = (path) => {
        return location.pathname.startsWith(path);
    };

    const navItems = [
        { path: "/exams/dashboard", label: "Dashboard", icon: <FaChartBar /> },
        { path: "/exams/create-exam", label: "Create Exam", icon: <FaPlusCircle /> },
        { path: "/exams/question-bank", label: "Question Bank", icon: <FaBook /> },
        { path: "/exams/schedule", label: "Schedule", icon: <FaCalendarAlt /> },
        { path: "/exams/reports", label: "Reports", icon: <FaFileAlt /> },
    ];

    return (
        <div className="d-flex flex-column bg-light" style={{ minHeight: '100%' }}>
            <header className="bg-white border-bottom shadow-sm sticky-top" style={{ zIndex: 1010, top: 0 }}>
                <div className="container-fluid px-4">
                    <div className="d-flex align-items-center py-2" style={{ minHeight: "64px" }}>
                        <div className="d-flex align-items-center gap-4 w-100 flex-wrap">
                            <span className="fw-bold text-primary fs-4 tracking-tight flex-shrink-0">
                                <span className="d-none d-md-inline">Exam Portal</span>
                                <span className="d-inline d-md-none">Exams</span>
                            </span>
                            <nav
                                className="d-flex gap-2 flex-wrap align-items-center"
                            >
                                {navItems.map((item) => (
                                    <Link
                                        key={item.path}
                                        to={item.path}
                                        className={`px-3 py-2 rounded-pill text-decoration-none d-flex align-items-center gap-2 small fw-medium text-nowrap transition-all ${isActive(item.path)
                                            ? "bg-primary text-white shadow-sm"
                                            : "text-muted hover-bg-light"
                                            }`}
                                        style={{ transition: "all 0.2s ease" }}
                                    >
                                        {item.icon}
                                        {item.label}
                                    </Link>
                                ))}
                            </nav>
                        </div>
                    </div>
                </div>
            </header>

            <main className="flex-grow-1">
                <Outlet />
            </main>

            <style>
                {`
                    .hover-bg-light:hover {
                        background-color: rgba(0,0,0,0.05);
                        color: #000;
                    }
                    /* Hide scrollbar for Chrome, Safari and Opera */
                    nav::-webkit-scrollbar {
                        display: none;
                    }
                `}
            </style>
        </div>
    );
};

export default ExamLayout;
