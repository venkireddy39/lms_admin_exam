import React from 'react';
import { NavLink } from 'react-router-dom';
import {
    LayoutDashboard,
    BookOpen,
    Users,
    ClipboardList,
    CalendarClock,
    Settings,
    LogOut,
    ShieldCheck,
    X,
    DollarSign
} from 'lucide-react';
import './Sidebar.css';
import { useAuth } from '../../context/AuthContext';

const Sidebar = ({ mobileOpen, onClose }) => {
    const { user, hasPermission, logout } = useAuth();

    // Permission Flags (Visibility based on VIEW rights)
    const showBooks = hasPermission('VIEW_BOOKS');
    const showMembers = hasPermission('VIEW_MEMBERS'); // Librarians view members too
    const showOperations = hasPermission('VIEW_ISSUES'); // Includes viewing issues/reservations
    const showSettings = hasPermission('SYSTEM_SETTINGS');

    return (
        <aside className={`sidebar ${mobileOpen ? 'show' : ''}`}>
            <div className="sidebar-header justify-content-between">
                <div className="logo-container">
                    <BookOpen className="logo-icon" size={28} />
                    <span className="logo-text">LibAdmin</span>
                </div>
                <button className="btn btn-link p-0 text-muted d-md-none" onClick={onClose}>
                    <X size={24} />
                </button>
            </div>

            <nav className="sidebar-nav">
                <div className="nav-section">
                    <span className="nav-label">Core</span>

                    {/* Everyone sees Dashboard if logged in */}
                    <NavLink to="/" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`} onClick={onClose}>
                        <LayoutDashboard size={20} />
                        <span>Dashboard</span>
                    </NavLink>

                    {showBooks && (
                        <NavLink to="/books" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`} onClick={onClose}>
                            <BookOpen size={20} />
                            <span>Books Catalog</span>
                        </NavLink>
                    )}

                    {showMembers && (
                        <NavLink to="/members" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`} onClick={onClose}>
                            <Users size={20} />
                            <span>Members</span>
                        </NavLink>
                    )}
                </div>

                {showOperations && (
                    <div className="nav-section">
                        <span className="nav-label">Operations</span>
                        <NavLink to="/issues" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`} onClick={onClose}>
                            <ClipboardList size={20} />
                            <span>Issue & Return</span>
                        </NavLink>
                        <NavLink to="/reservations" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`} onClick={onClose}>
                            <CalendarClock size={20} />
                            <span>Reservations</span>
                        </NavLink>
                        <NavLink to="/fines" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`} onClick={onClose}>
                            <DollarSign size={20} />
                            <span>Fine Management</span>
                        </NavLink>
                    </div>
                )}

                {showSettings && (
                    <div className="nav-section">
                        <span className="nav-label">Administration</span>
                        <NavLink to="/circulation-rules" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`} onClick={onClose}>
                            <ShieldCheck size={20} />
                            <span>Circulation Rules</span>
                        </NavLink>
                        {/* Roles & Permissions typically part of Settings or separate if advanced */}
                        {/* <NavLink to="/roles" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`} onClick={onClose}>
                            <Users size={20} />
                            <span>Roles & Permissions</span>
                        </NavLink> */}
                        <NavLink to="/audit-logs" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`} onClick={onClose}>
                            <ClipboardList size={20} />
                            <span>Audit Logs</span>
                        </NavLink>
                        <NavLink to="/reports" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`} onClick={onClose}>
                            <ClipboardList size={20} />
                            <span>Reports</span>
                        </NavLink>
                        <NavLink to="/settings" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`} onClick={onClose}>
                            <Settings size={20} />
                            <span>Settings</span>
                        </NavLink>
                    </div>
                )}
            </nav>

            <div className="sidebar-footer">
                {user && (
                    <button className="nav-item logout-btn" onClick={logout}>
                        <LogOut size={20} />
                        <span>Logout</span>
                    </button>
                )}
            </div>
        </aside>
    );
};

export default Sidebar;
