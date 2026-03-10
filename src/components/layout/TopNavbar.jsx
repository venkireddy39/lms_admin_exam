import React, { useState, useEffect } from 'react';
import {
    Bell,
    User,
    LogOut,
    Settings,
    ChevronDown,
    Menu,
    Zap,
    Calendar,
    HelpCircle,
    Maximize,
    Minimize,
    Layout,
    BookOpen,
    Book,
    Users,
    Video,
    Edit,
    Award,
    UserCheck,
    Megaphone,
    BarChart2,
    Globe,
    Smartphone,
    Share2,
    DollarSign,
    CreditCard,
    FileText,
    Shield,
    Clipboard,
    Layers
} from 'lucide-react';
import { useNavigate, NavLink, useLocation } from 'react-router-dom';
import { useAuth } from '../../pages/Library/context/AuthContext';
import './TopNavbar.css';

const TopNavbar = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();
    const [isScrolled, setIsScrolled] = useState(false);
    const [showUserDropdown, setShowUserDropdown] = useState(false);
    const [isFullscreen, setIsFullscreen] = useState(false);

    const [activeDropdown, setActiveDropdown] = useState(null);

    const navItems = [
        { label: 'Dashboard', path: '/admin/dashboard', icon: Layout },
        {
            label: 'Academics',
            icon: BookOpen,
            children: [
                { label: 'Courses', path: '/admin/courses', icon: Book },
                { label: 'Webinars', path: '/admin/webinar', icon: Video },
                { label: 'Exams', path: '/admin/exams', icon: Edit },
                { label: 'Certificates', path: '/admin/certificates', icon: Award },
                { label: 'Attendance', path: '/admin/attendance', icon: Calendar },
                { label: 'Library', path: '/admin/library', icon: Book },
            ]
        },
        {
            label: 'Users',
            icon: Users,
            children: [
                { label: 'All Users', path: '/admin/users', icon: User },
                { label: 'Instructors', path: '/admin/users?tab=instructors', icon: UserCheck },
            ]
        },
        {
            label: 'Marketing',
            icon: Megaphone,
            children: [
                { label: 'Marketing Hub', path: '/admin/marketing', icon: BarChart2 },
                { label: 'Website Builder', path: '/admin/websites', icon: Globe },
                { label: 'Mobile App', path: '/admin/myapp', icon: Smartphone },
            ]
        },
        {
            label: 'Affiliates',
            icon: Share2,
            children: [
                { label: 'All Affiliates', path: '/admin/affiliates', icon: Users },
                { label: 'Partner Portal', path: '/admin/affiliate/portal', icon: Layout },
                { label: 'Wallet Settings', path: '/admin/affiliate/settings', icon: DollarSign },
            ]
        },
        {
            label: 'Finance',
            icon: DollarSign,
            children: [
                { label: 'Fee Management', path: '/admin/fee', icon: Layout },
                { label: 'Fee Types', path: '/admin/fee-types', icon: Layers },
                { label: 'Fee Structures', path: '/admin/fee-structures', icon: Clipboard },
                { label: 'Student Fees', path: '/admin/fee-allocations', icon: Users },
            ]
        },
        {
            label: 'Administration',
            icon: Shield,
            children: [
                { label: 'Audit Logs', path: '/admin/audit-logs', icon: Clipboard },
                { label: 'Settings', path: '/admin/settings', icon: Settings },
            ]
        }
    ];

    const currentRole = user?.role?.toUpperCase();

    const filteredNavItems = navItems.map(item => {
        // 1. Handle Role-based top-level visibility
        if (currentRole === 'AFFILIATE' && item.label !== 'Affiliates') {
            return null; // Affiliates only see the 'Affiliates' section
        }
        if (currentRole === 'AFFILIATE' && item.label === 'Affiliates') {
            return {
                ...item,
                children: item.children ? item.children.filter(child => child.label === 'Partner Portal') : []
            };
        }

        // 2. Handle child filtering (e.g., hide Partner Portal for Admins)
        if ((currentRole === 'ADMIN' || currentRole === 'SUPER_ADMIN') && item.label === 'Affiliates') {
            return {
                ...item,
                children: item.children ? item.children.filter(child => child.label !== 'Partner Portal') : []
            };
        }

        return item;
    }).filter(Boolean); // Remove null entries

    useEffect(() => {
        const handleScroll = () => {
            setIsScrolled(window.scrollY > 0);
        };
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    const toggleFullscreen = () => {
        if (!document.fullscreenElement) {
            document.documentElement.requestFullscreen();
            setIsFullscreen(true);
        } else {
            if (document.exitFullscreen) {
                document.exitFullscreen();
                setIsFullscreen(false);
            }
        }
    };

    // Close dropdowns on click outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (showUserDropdown && !event.target.closest('.user-account-menu')) {
                setShowUserDropdown(false);
            }
            if (activeDropdown !== null && !event.target.closest('.nav-item-with-children')) {
                setActiveDropdown(null);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [showUserDropdown, activeDropdown]);

    return (
        <header className={`global-top-navbar ${isScrolled ? 'is-scrolled' : ''}`}>
            <div className="navbar-container">
                {/* Left Side: Logo */}
                <div className="nav-left">
                    <div className="navbar-brand" onClick={() => navigate('/admin/dashboard')}>
                        <Layers size={28} className="brand-icon" />
                        <span className="brand-name">Class X 360</span>
                    </div>


                </div>

                {/* Center: Navigation Links */}
                <nav className="nav-center d-none d-lg-flex">
                    <ul className="nav-links">
                        {filteredNavItems.map((item, index) => (
                            <li
                                key={index}
                                className={`nav-item ${item.children ? 'nav-item-with-children' : ''}`}
                            >
                                {item.path ? (
                                    <NavLink
                                        to={item.path}
                                        className={({ isActive }) => `nav-link-item ${isActive ? 'active' : ''}`}
                                        onClick={() => setActiveDropdown(null)}
                                    >
                                        <item.icon size={18} />
                                        <span>{item.label}</span>
                                    </NavLink>
                                ) : (
                                    <div
                                        className={`nav-link-item ${activeDropdown === index ? 'active' : ''}`}
                                        onClick={() => setActiveDropdown(activeDropdown === index ? null : index)}
                                        style={{ cursor: 'pointer' }}
                                    >
                                        <item.icon size={18} />
                                        <span>{item.label}</span>
                                        <ChevronDown size={14} className={`chevron ${activeDropdown === index ? 'rotate' : ''}`} />
                                    </div>
                                )}

                                {item.children && activeDropdown === index && (
                                    <div className="nav-dropdown-menu fade-in-down">
                                        {item.children.map((child, childIndex) => (
                                            <NavLink
                                                key={childIndex}
                                                to={child.path}
                                                className={({ isActive }) => `topnav-dropdown-item ${isActive ? 'active' : ''}`}
                                                onClick={() => setActiveDropdown(null)}
                                            >
                                                <child.icon size={16} />
                                                <span>{child.label}</span>
                                            </NavLink>
                                        ))}
                                    </div>
                                )}
                            </li>
                        ))}
                    </ul>
                </nav>

                {/* Right Side: Actions & Profile */}
                <div className="nav-right">
                    <div className="nav-actions">
                        <button
                            className="nav-action-btn d-none d-md-flex"
                            onClick={toggleFullscreen}
                            title="Toggle Fullscreen"
                        >
                            {isFullscreen ? <Minimize size={20} /> : <Maximize size={20} />}
                        </button>

                        <button className="nav-action-btn position-relative" title="Notifications">
                            <Bell size={20} />
                            <span className="notif-badge">3</span>
                        </button>
                    </div>

                    <div className="user-account-menu">
                        <button
                            className="profile-trigger"
                            onClick={() => setShowUserDropdown(!showUserDropdown)}
                        >
                            <div className="u-avatar">
                                {user?.avatar ? (
                                    <img src={user.avatar} alt="Profile" />
                                ) : (
                                    <div className="avatar-initials">
                                        {(user?.firstName?.[0] || 'A')}{(user?.lastName?.[0] || 'D')}
                                    </div>
                                )}
                                <div className="online-status"></div>
                            </div>
                            <div className="user-info d-none d-xl-block">
                                <span className="u-name">{user?.firstName || 'Admin'}</span>
                                <ChevronDown size={14} className={`chevron-icon ${showUserDropdown ? 'rotate' : ''}`} />
                            </div>
                        </button>

                        {showUserDropdown && (
                            <div className="dropdown-panel animate-in">
                                <div className="dropdown-header">
                                    <p className="d-label">Signed in as</p>
                                    <p className="d-email text-truncate">{user?.email || 'admin@classx360.com'}</p>
                                </div>
                                <div className="dropdown-divider"></div>
                                <div className="dropdown-body">
                                    <button className="d-item" onClick={() => navigate('/admin/profile')}>
                                        <User size={16} />
                                        <span>My Profile</span>
                                    </button>
                                    <button className="d-item" onClick={() => navigate('/admin/settings')}>
                                        <Settings size={16} />
                                        <span>Account Settings</span>
                                    </button>
                                </div>
                                <div className="dropdown-divider"></div>
                                <div className="dropdown-footer">
                                    <button className="d-item logout-btn" onClick={handleLogout}>
                                        <LogOut size={16} />
                                        <span>Sign Out</span>
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </header>
    );
};

export default TopNavbar;
