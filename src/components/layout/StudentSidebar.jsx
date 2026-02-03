/* src/components/layout/StudentSidebar.jsx */
import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import {
    LayoutGrid,
    BookOpen,
    PlayCircle,
    ClipboardList,
    Edit3,
    BarChart3,
    Calendar,
    MessageCircle,
    User,
    Award,
    LifeBuoy,
    LogOut
} from 'lucide-react';
import { useAuth } from '../../pages/Library/context/AuthContext';
import './StudentSidebar.css';

const StudentSidebar = () => {
    const { logout } = useAuth();
    const navigate = useNavigate();

    const menuItems = [
        { id: 'dashboard', label: 'Dashboard', path: '/student/dashboard', icon: LayoutGrid },
        { id: 'courses', label: 'My Courses', path: '/student/courses', icon: BookOpen },
        { id: 'content', label: 'Learning Content', path: '/student/content', icon: PlayCircle },
        { id: 'assignments', label: 'Assignments', path: '/student/assignments', icon: ClipboardList },
        { id: 'exams', label: 'Exams', path: '/student/exams', icon: Edit3 },
        { id: 'grades', label: 'Grades', path: '/student/grades', icon: BarChart3 },
        { id: 'calendar', label: 'Calendar', path: '/student/calendar', icon: Calendar },
        { id: 'communication', label: 'Communication', path: '/student/communication', icon: MessageCircle },
        { id: 'profile', label: 'Profile', path: '/student/profile', icon: User },
        { id: 'certificates', label: 'Certificates', path: '/student/certificates', icon: Award },
        { id: 'support', label: 'Support', path: '/student/support', icon: LifeBuoy },
    ];

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    return (
        <aside className="student-sidebar">
            <div className="student-sidebar-brand">
                <div className="bg-primary rounded-3 p-1 d-flex align-items-center justify-content-center">
                    <PlayCircle size={28} className="text-white" />
                </div>
                <h3>LMS Student</h3>
            </div>

            <nav className="student-sidebar-nav">
                {menuItems.map(item => (
                    <NavLink
                        key={item.id}
                        to={item.path}
                        className={({ isActive }) => `student-nav-item ${isActive ? 'active' : ''}`}
                    >
                        <item.icon size={20} />
                        <span>{item.label}</span>
                    </NavLink>
                ))}
            </nav>

            <div className="student-sidebar-footer">
                <button className="student-logout-btn" onClick={handleLogout}>
                    <LogOut size={20} />
                    <span>Logout</span>
                </button>
            </div>
        </aside>
    );
};

export default StudentSidebar;
