import { useEffect, useState } from 'react'
import { useLocation } from 'react-router-dom'
import Sidebar from './Sidebar'
import Navbar from './Navbar'
import { Outlet } from 'react-router-dom'

const SIDEBAR_WIDTH = 260
const SIDEBAR_COLLAPSED_WIDTH = 60

const DashboardLayout = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(window.innerWidth > 768)
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768)
  const location = useLocation()
  const isFullWidth = location.pathname.startsWith('/exams') || location.pathname.startsWith('/webinar') || location.pathname.startsWith('/courses')

  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth <= 768
      setIsMobile(mobile)
      setIsSidebarOpen(!mobile)
    }

    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  const toggleSidebar = () => {
    setIsSidebarOpen(prev => !prev)
  }

  return (
    <div
      style={{
        height: '100vh',
        overflow: 'hidden',
        backgroundColor: '#fff'
      }}
    >
      {/* SIDEBAR (FIXED, NO FLEX) */}
      <Sidebar
        isOpen={isSidebarOpen}
        toggleSidebar={toggleSidebar}
        isMobile={isMobile}
      />

      {/* MAIN CONTENT */}
      <div
        style={{
          marginLeft: isMobile
            ? 0
            : isSidebarOpen
              ? SIDEBAR_WIDTH
              : SIDEBAR_COLLAPSED_WIDTH,
          transition: 'margin-left 0.25s ease-out',
          height: '100vh',
          display: 'flex',
          flexDirection: 'column'
        }}
      >
        {/* TOP NAVBAR */}
        <Navbar toggleSidebar={toggleSidebar} />

        {/* SCROLLABLE CONTENT ONLY */}
        <main
          style={{
            flex: 1,
            overflowY: 'auto',
            padding: isFullWidth ? '0' : '1.5rem',
            position: 'relative'
          }}
        >
          <Outlet />
        </main>
      </div>

      {/* FLOATING CHAT */}
      <div
        className="position-fixed d-flex align-items-center justify-content-center text-white rounded-circle shadow"
        style={{
          width: 50,
          height: 50,
          bottom: 24,
          right: 24,
          background: 'linear-gradient(135deg, #667eea, #764ba2)',
          cursor: 'pointer',
          zIndex: 1050
        }}
      >
        <i className="bi bi-chat-dots fs-5"></i>
      </div>
    </div>
  )
}

export default DashboardLayout
