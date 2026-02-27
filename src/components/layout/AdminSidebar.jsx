import { useEffect, useState } from 'react'
import { NavLink, useNavigate } from 'react-router-dom'
import { FiMoreVertical, FiSettings, FiLogOut, FiUser, FiHelpCircle, FiBell, FiShare2, FiChevronDown, FiChevronRight, FiShield, FiDollarSign, FiFileText, FiLayout, FiGlobe, FiSun, FiMoon, FiLayers, FiCpu } from 'react-icons/fi'
import { useAuth } from '../../pages/Library/context/AuthContext';
import './AdminSidebar.css';

const AdminSidebar = ({ isOpen, toggleSidebar, isMobile }) => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const [theme, setTheme] = useState(localStorage.getItem('theme') || 'light')
    const [showUserMenu, setShowUserMenu] = useState(false);

    const role = user?.role?.toUpperCase();

    // Group States
    const [groups, setGroups] = useState({
        academics: true,
        users: ['ADMIN', 'SUPER_ADMIN'].includes(role),
        finance: false,
        marketing: false,
        affiliates: false,
        system: false,
        transport: false
    });

    const toggleGroup = (group) => {
        if (!isOpen) toggleSidebar();
        setGroups(prev => ({ ...prev, [group]: !prev[group] }));
    }

    useEffect(() => {
        document.body.setAttribute('data-theme', theme)
        localStorage.setItem('theme', theme)
    }, [theme])

    // Role-based visibility logic
    const canSeeUsers = ['ADMIN', 'SUPER_ADMIN'].includes(role);
    const canSeeFinance = ['ADMIN', 'SUPER_ADMIN', 'FINANCE'].includes(role);
    const canSeeMarketing = ['ADMIN', 'SUPER_ADMIN', 'MARKETING_MANAGER'].includes(role);
    const canSeeAcademics = ['ADMIN', 'SUPER_ADMIN', 'INSTRUCTOR'].includes(role);
    const canSeeAdministration = ['ADMIN', 'SUPER_ADMIN'].includes(role);
    const canSeeTransport = ['ADMIN', 'SUPER_ADMIN', 'DRIVER', 'CONDUCTOR'].includes(role);

    return (
        <>
            {/* Mobile Overlay */}
            {isOpen && isMobile && (
                <div className="position-fixed top-0 start-0 w-100 h-100 bg-dark bg-opacity-50" style={{ zIndex: 1040 }} onClick={toggleSidebar} />
            )}

            <aside
                className={`sidebar d-flex flex-column bg-white border-end ${isOpen ? 'sidebar-open' : 'sidebar-closed'}`}
                data-sidebar-state={isOpen ? 'open' : 'closed'}
            >
                {/* HEADER */}
                <div className="d-flex align-items-center justify-content-between px-3 h-16 border-bottom" style={{ minHeight: 64 }}>
                    {/* Auto-Expand Logo Click */}
                    <div
                        className={`d-flex align-items-center gap-3 fw-bold fs-4 text-dark overflow-hidden cursor-pointer ${!isOpen ? 'd-none' : ''}`}
                        style={{ whiteSpace: 'nowrap', fontFamily: "'Outfit', sans-serif", letterSpacing: '-0.5px' }}
                        onClick={() => !isOpen && toggleSidebar()}
                    >
                        <FiLayers size={28} className="text-primary flex-shrink-0" />
                        <span>Class X 360</span>
                    </div>
                    {/* Collapsed Logo - Click to Expand */}
                    {!isOpen && (
                        <div
                            className="d-flex align-items-center justify-content-center mx-auto flex-shrink-0 cursor-pointer"
                            onClick={toggleSidebar}
                        >
                            <FiLayers size={28} className="text-primary" />
                        </div>
                    )}

                    <button className="btn btn-link text-secondary p-1 text-decoration-none ms-auto" onClick={toggleSidebar} style={{ minWidth: 32 }}>
                        <i className={`bi ${isOpen ? 'bi-chevron-left' : 'bi-chevron-right'} fs-5`} />
                    </button>
                </div>

                {/* MENU */}
                <nav className="flex-grow-1 overflow-auto py-3">
                    <ul className="list-unstyled m-0 p-0 d-flex flex-column gap-1">

                        {/* Dashboard */}
                        <SidebarItem to="/admin/dashboard" icon="FiLayout" label="Dashboard" isOpen={isOpen} onClick={() => !isOpen && toggleSidebar()} />

                        {/* ACADEMICS GROUP */}
                        {canSeeAcademics && (
                            <MenuGroup title="Academics" icon="FiBookOpen" isOpen={isOpen} expanded={groups.academics} onToggle={() => toggleGroup('academics')}>
                                <SidebarItem to="/admin/courses" icon="FiBook" label="Courses" isOpen={isOpen} isSub />
                                <SidebarItem to="/admin/batches" icon="FiUsers" label="Batches" isOpen={isOpen} isSub />
                                <SidebarItem to="/admin/webinar" icon="FiVideo" label="Webinars" isOpen={isOpen} isSub />
                                <SidebarItem to="/admin/exams" icon="FiEdit" label="Exams" isOpen={isOpen} isSub />
                                <SidebarItem to="/admin/certificates" icon="FiAward" label="Certificates" isOpen={isOpen} isSub />
                                <SidebarItem to="/admin/attendance" icon="FiCalendar" label="Attendance" isOpen={isOpen} isSub />
                                <SidebarItem to="/admin/library" icon="FiBook" label="Library" isOpen={isOpen} isSub />
                            </MenuGroup>
                        )}

                        {/* USERS GROUP */}
                        {canSeeUsers && (
                            <MenuGroup title="User Management" icon="FiUsers" isOpen={isOpen} expanded={groups.users} onToggle={() => toggleGroup('users')}>
                                <SidebarItem to="/admin/users" icon="FiUser" label="All Users" isOpen={isOpen} isSub />
                                <SidebarItem to="/admin/users?tab=instructors" icon="FiUserCheck" label="Instructors" isOpen={isOpen} isSub />
                            </MenuGroup>
                        )}

                        {/* TRANSPORT GROUP */}
                        {canSeeTransport && (
                            <MenuGroup title="Transport" icon="FiTruck" isOpen={isOpen} expanded={groups.transport} onToggle={() => toggleGroup('transport')}>
                                <SidebarItem to="/admin/transport/vehicles" icon="FiTruck" label="Vehicles" isOpen={isOpen} isSub />
                                <SidebarItem to="/admin/transport/routes" icon="FiMap" label="Routes" isOpen={isOpen} isSub />
                                <SidebarItem to="/admin/transport/attendance" icon="FiCheckSquare" label="Transport Attd." isOpen={isOpen} isSub />
                            </MenuGroup>
                        )}

                        {/* MARKETING GROUP */}
                        {canSeeMarketing && (
                            <MenuGroup title="Marketing" icon="FiMegaphone" isOpen={isOpen} expanded={groups.marketing} onToggle={() => toggleGroup('marketing')}>
                                <SidebarItem to="/admin/marketing" icon="FiBarChart2" label="Marketing Hub" isOpen={isOpen} isSub />
                                <SidebarItem to="/admin/websites" icon="FiGlobe" label="Website Builder" isOpen={isOpen} isSub />
                                <SidebarItem to="/admin/myapp" icon="FiSmartphone" label="Mobile App" isOpen={isOpen} isSub />
                            </MenuGroup>
                        )}

                        {/* AFFILIATES GROUP */}
                        {canSeeUsers && (
                            <MenuGroup title="Affiliates" icon="FiShare2" isOpen={isOpen} expanded={groups.affiliates} onToggle={() => toggleGroup('affiliates')}>
                                <SidebarItem to="/admin/affiliates" icon="FiUsers" label="All Affiliates" isOpen={isOpen} isSub />
                                <SidebarItem to="/admin/affiliate/portal" icon="FiLayout" label="Partner Portal" isOpen={isOpen} isSub />
                            </MenuGroup>
                        )}

                        {/* FINANCE GROUP */}
                        {canSeeFinance && (
                            <MenuGroup title="Finance" icon="FiDollarSign" isOpen={isOpen} expanded={groups.finance} onToggle={() => toggleGroup('finance')}>
                                <SidebarItem to="/admin/invoices" icon="FiFileText" label="Invoices" isOpen={isOpen} isSub />
                                <SidebarItem to="/admin/fee-types" icon="FiFileText" label="Fee Types" isOpen={isOpen} isSub />
                                <SidebarItem to="/admin/fee-structures" icon="FiFileText" label="Fee Structures" isOpen={isOpen} isSub />
                                <SidebarItem to="/admin/fee-allocations" icon="FiFileText" label="Fee Allocations" isOpen={isOpen} isSub />
                            </MenuGroup>
                        )}

                        {/* ADMINISTRATION GROUP */}
                        {canSeeAdministration && (
                            <MenuGroup title="Administration" icon="FiShield" isOpen={isOpen} expanded={groups.system} onToggle={() => toggleGroup('system')}>
                                <SidebarItem to="/admin/automation" icon="FiCpu" label="Automation & AI" isOpen={isOpen} isSub />
                                <SidebarItem to="/admin/audit-logs" icon="FiClipboard" label="Audit Logs" isOpen={isOpen} isSub />
                                <SidebarItem to="/admin/settings" icon="FiSettings" label="Settings" isOpen={isOpen} isSub />
                            </MenuGroup>
                        )}
                    </ul>
                </nav>

                {/* BOTTOM SECTION */}
                <div className="border-top p-3 bg-light">
                    <div className="d-flex align-items-center p-2 rounded-2 bg-white border cursor-pointer position-relative shadow-sm user-widget">
                        <div className="d-flex align-items-center justify-content-center bg-secondary text-white rounded-circle fw-bold" style={{ width: 36, height: 36, fontSize: 14 }}>AD</div>

                        {isOpen && (
                            <div className="ms-2 flex-grow-1 overflow-hidden">
                                <div className="fw-bold text-dark text-truncate" style={{ fontSize: 14 }}>Admin User</div>
                                <div className="text-secondary" style={{ fontSize: 11 }}>Super Admin</div>
                            </div>
                        )}

                        {isOpen && (
                            <button className="btn btn-link p-0 text-secondary" onClick={() => setShowUserMenu(!showUserMenu)}>
                                <FiMoreVertical />
                            </button>
                        )}

                        {showUserMenu && (
                            <div className="position-absolute bottom-100 start-0 w-100 bg-white border rounded-2 shadow-sm p-1 mb-2 d-flex flex-column gap-1" style={{ zIndex: 1050 }}>
                                <button className="btn btn-light btn-sm text-start d-flex align-items-center gap-2" onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}>
                                    {theme === 'dark' ? <FiSun /> : <FiMoon />} {theme === 'dark' ? 'Light Mode' : 'Dark Mode'}
                                </button>
                                <div className="border-top my-1"></div>
                                <button
                                    className="btn btn-light btn-sm text-start d-flex align-items-center gap-2 text-danger"
                                    onClick={() => {
                                        logout();
                                        navigate('/login');
                                    }}
                                >
                                    <FiLogOut /> Logout
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </aside>
        </>
    )
}

// Reusable Components
const MenuGroup = ({ title, icon, isOpen, expanded, onToggle, children }) => {
    if (!isOpen) {
        // Collapsed state: Centered icon, no padding to avoid overflow (60px width)
        return (
            <li className="nav-item" title={title}>
                <div
                    className="nav-link d-flex align-items-center justify-content-center p-2 rounded-2 text-secondary"
                    onClick={onToggle}
                    style={{ cursor: 'pointer' }}
                >
                    <i className={`bi bi-${icon}`} style={{ fontSize: 18, minWidth: 24, textAlign: 'center' }} />
                </div>
            </li>
        )
    }

    return (
        <li className="nav-item d-flex flex-column gap-1">
            <div className="nav-link d-flex align-items-center justify-content-between px-3 py-2 text-secondary cursor-pointer hover-bg-light rounded-2 mx-2" onClick={onToggle}>
                <div className="d-flex align-items-center gap-2">
                    <i className={`bi bi-${icon}`} />
                    <span className="fw-medium" style={{ fontSize: 14 }}>{title}</span>
                </div>
                <i className={`bi bi-chevron-${expanded ? 'down' : 'right'} text-muted`} style={{ fontSize: 12 }} />
            </div>
            {expanded && (
                <ul className="list-unstyled ps-4 pe-2 m-0 d-flex flex-column gap-1">
                    {children}
                </ul>
            )}
        </li>
    )
}

const SidebarItem = ({ to, icon, label, isOpen, isSub, onClick }) => (
    <li className={`nav-item ${isSub ? '' : ''}`} onClick={onClick} style={{ cursor: 'pointer' }}>
        <NavLink
            to={to}
            title={!isOpen ? label : ''}
            className={({ isActive }) =>
                `nav-link d-flex align-items-center rounded-2
        ${!isOpen ? 'justify-content-center px-0 py-2' : ''}
        ${isOpen && !isSub ? 'px-3 py-2 gap-2' : ''}
        ${isSub ? 'py-1 ps-2 pe-2 gap-2' : ''}
        ${isActive ? 'bg-primary-subtle text-primary fw-semibold' : 'text-secondary hover-bg-light'}`
            }
            style={{ transition: 'all 0.1s ease' }}
        >
            {!isSub && <i className={`bi bi-${icon}`} style={{ fontSize: 18, minWidth: 24, textAlign: 'center' }} />}
            {isSub && <span className="d-flex align-items-center justify-content-center" style={{ width: 20 }}><i className={`bi bi-${icon}`} style={{ fontSize: 14 }} /></span>}
            {isOpen && <span className="text-nowrap" style={{ fontSize: 14 }}>{label}</span>}
        </NavLink>
    </li>
)

export default AdminSidebar
