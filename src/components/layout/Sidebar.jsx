import { useEffect, useState } from 'react'
import { NavLink } from 'react-router-dom'
import { FiMoreVertical, FiSettings, FiLogOut, FiUser, FiHelpCircle, FiBell, FiShare2, FiChevronDown, FiChevronRight, FiShield, FiDollarSign, FiFileText, FiLayout, FiGlobe, FiSun, FiMoon } from 'react-icons/fi'
import './Sidebar.css';

const Sidebar = ({ isOpen, toggleSidebar, isMobile }) => {
  const [theme, setTheme] = useState(localStorage.getItem('theme') || 'light')
  const [showUserMenu, setShowUserMenu] = useState(false);

  // Group States
  const [groups, setGroups] = useState({
    academics: true,
    users: true,
    finance: false,
    marketing: false,
    system: false
  });

  const toggleGroup = (group) => {
    if (!isOpen) toggleSidebar();
    setGroups(prev => ({ ...prev, [group]: !prev[group] }));
  }

  useEffect(() => {
    document.body.setAttribute('data-theme', theme)
    localStorage.setItem('theme', theme)
  }, [theme])

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
            className={`d-flex align-items-center gap-2 fw-bold fs-5 text-dark overflow-hidden cursor-pointer ${!isOpen ? 'd-none' : ''}`}
            style={{ whiteSpace: 'nowrap' }}
            onClick={() => !isOpen && toggleSidebar()}
          >
            <div className="d-flex align-items-center justify-content-center text-white rounded-2 flex-shrink-0" style={{ width: 32, height: 32, background: 'linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%)' }}>A</div>
            <span>Academy</span>
          </div>
          {/* Collapsed Logo - Click to Expand */}
          {!isOpen && (
            <div
              className="d-flex align-items-center justify-content-center text-white rounded-2 mx-auto flex-shrink-0 cursor-pointer"
              style={{ width: 32, height: 32, background: 'linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%)' }}
              onClick={toggleSidebar}
            >A</div>
          )}

          <button className="btn btn-link text-secondary p-1 text-decoration-none ms-auto" onClick={toggleSidebar} style={{ minWidth: 32 }}>
            <i className={`bi ${isOpen ? 'bi-chevron-left' : 'bi-chevron-right'} fs-5`} />
          </button>
        </div>

        {/* MENU */}
        <nav className="flex-grow-1 overflow-auto py-3">
          <ul className="list-unstyled m-0 p-0 d-flex flex-column gap-1">

            {/* CORE */}
            <div className="px-3 mb-1 mt-2">
              {isOpen && <small className="text-uppercase text-secondary fw-bold" style={{ fontSize: '0.7rem', letterSpacing: '0.5px' }}>Core</small>}
            </div>
            {/* Click to Expand Dashboard */}
            <SidebarItem to="/" icon="house-door" label="Dashboard" isOpen={isOpen} onClick={() => !isOpen && toggleSidebar()} />

            {/* ACADEMICS GROUP */}
            <MenuGroup title="Academics" icon="journal-bookmark" isOpen={isOpen} expanded={groups.academics} onToggle={() => toggleGroup('academics')}>
              <SidebarItem to="/courses" icon="journal-text" label="Courses" isOpen={isOpen} isSub />
              <SidebarItem to="/batches" icon="collection" label="Batches" isOpen={isOpen} isSub />
              <SidebarItem to="/webinar" icon="camera-video" label="Webinars" isOpen={isOpen} isSub />
              <SidebarItem to="/exams" icon="pencil-square" label="Exams" isOpen={isOpen} isSub />
              <SidebarItem to="/certificates" icon="patch-check" label="Certificates" isOpen={isOpen} isSub />
              <SidebarItem to="/attendance" icon="calendar-check" label="Attendance" isOpen={isOpen} isSub />
            </MenuGroup>

            {/* USERS GROUP */}
            <MenuGroup title="User Management" icon="people" isOpen={isOpen} expanded={groups.users} onToggle={() => toggleGroup('users')}>
              <SidebarItem to="/users" icon="person-badge" label="All Users" isOpen={isOpen} isSub />
              <SidebarItem to="/users?tab=instructors" icon="mortarboard" label="Instructors" isOpen={isOpen} isSub />
            </MenuGroup>

            {/* MARKETING GROUP */}
            <MenuGroup title="Marketing" icon="megaphone" isOpen={isOpen} expanded={groups.marketing} onToggle={() => toggleGroup('marketing')}>
              <SidebarItem to="/marketing" icon="bar-chart" label="Overview" isOpen={isOpen} isSub />
              <SidebarItem to="/affiliatemarketing" icon="share" label="Affiliates" isOpen={isOpen} isSub />
              <SidebarItem to="/websites" icon="globe" label="Website Builder" isOpen={isOpen} isSub />
              <SidebarItem to="/myapp" icon="phone" label="Mobile App" isOpen={isOpen} isSub />
            </MenuGroup>

            {/* FINANCE GROUP */}
            <MenuGroup title="Finance" icon="currency-dollar" isOpen={isOpen} expanded={groups.finance} onToggle={() => toggleGroup('finance')}>
              <SidebarItem to="/fees" icon="cash" label="Fee Management" isOpen={isOpen} isSub />
              <SidebarItem to="/invoices" icon="receipt" label="Invoices" isOpen={isOpen} isSub />
            </MenuGroup>

            {/* SYSTEM */}
            <div className="px-3 mb-1 mt-3">
              {isOpen && <small className="text-uppercase text-secondary fw-bold" style={{ fontSize: '0.7rem', letterSpacing: '0.5px' }}>System</small>}
            </div>
            <SidebarItem to="/settings" icon="gear" label="Settings" isOpen={isOpen} />
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
                <button className="btn btn-light btn-sm text-start d-flex align-items-center gap-2 text-danger">
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

export default Sidebar
