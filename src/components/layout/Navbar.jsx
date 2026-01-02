const Navbar = ({ toggleSidebar }) => {
  return (
    <header
      className="navbar bg-white px-4 d-flex align-items-center"
      style={{
        height: 64,
        position: 'sticky',
        top: 0,
        zIndex: 1020,
        boxShadow: '0 1px 4px rgba(0,0,0,0.06)'
      }}
    >
      <div className="d-flex align-items-center justify-content-between w-100">
        {/* TOGGLE BUTTON (MOBILE) */}
        <button
          className="btn btn-light border-0 me-3 d-lg-none"
          onClick={toggleSidebar}
          aria-label="Toggle sidebar"
          type="button"
        >
          <i className="bi bi-list fs-4"></i>
        </button>

        {/* TITLE */}
        <div className="fw-medium text-secondary fs-6">
          Dashboard
        </div>

        {/* ACTIONS */}
        <div className="d-flex align-items-center gap-2">
          <button
            className="btn btn-link position-relative p-2"
            title="Notifications"
            type="button"
          >
            <i className="bi bi-bell fs-5"></i>
            <span
              className="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger"
              style={{ fontSize: '0.6rem' }}
            >
              3
            </span>
          </button>

          <button
            className="btn btn-link p-2"
            title="Profile"
            type="button"
          >
            <i className="bi bi-person-circle fs-4"></i>
          </button>
        </div>
      </div>
    </header>
  )
}

export default Navbar
