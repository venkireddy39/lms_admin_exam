/* src/components/layout/StudentSidebar.jsx */
import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import {
    LayoutGrid,
    ClipboardList,
    PlayCircle
} from 'lucide-react';
import { useToast } from '../../pages/Library/context/ToastContext';
import './StudentSidebar.css';
const StudentSidebar = ({ isCollapsed }) => {
    const navigate = useNavigate();
    const toast = useToast();

    const menuItems = [
        { id: 'dashboard', label: 'Dashboard', path: '/student/dashboard', icon: LayoutGrid, isMock: false },
        { id: 'fee', label: 'Fee Details', path: '/student/fee', icon: ClipboardList, isMock: false },
    ];

    const handleItemClick = (e, item) => {
        if (item.isMock) {
            e.preventDefault();
            toast.info(`${item.label} feature is coming soon!`);
        }
    };

    return (
        <aside className={`student-sidebar ${isCollapsed ? 'is-collapsed' : ''}`}>
            <div className="student-sidebar-brand d-flex align-items-center px-4 py-4">
                <div className="brand-logo bg-primary rounded-3 p-1 d-flex align-items-center justify-content-center me-3 shadow-lg">
                    <PlayCircle size={28} className="text-white" />
                </div>
                {!isCollapsed && <h3 className="m-0 fw-bold text-primary">LMS Student</h3>}
            </div>

            <nav className="student-sidebar-nav px-3 flex-grow-1 overflow-auto">
                <div className="nav flex-column gap-1">
                    {menuItems.map(item => (
                        <NavLink
                            key={item.id}
                            to={item.path}
                            onClick={(e) => handleItemClick(e, item)}
                            className={({ isActive }) => `nav-link student-nav-item d-flex align-items-center gap-3 px-3 py-2 rounded-3 transition-all ${isActive ? 'active shadow-sm' : ''}`}
                            title={isCollapsed ? item.label : ''}
                        >
                            <item.icon size={20} className="nav-icon flex-shrink-0" />
                            {!isCollapsed && <span className="nav-label">{item.label}</span>}
                        </NavLink>
                    ))}
                </div>
            </nav>

            {!isCollapsed && (
                <div className="student-sidebar-footer p-3 mt-auto">
                    <div className="p-3 text-center text-muted small rounded-4 border transition-all" style={{ background: 'var(--hover-bg)', borderColor: 'var(--border)' }}>
                        <span className="opacity-75 tracking-wider fw-bold">Academic Year 2024-25</span>
                    </div>
                </div>
            )}
        </aside>
    );
};

export default StudentSidebar;
