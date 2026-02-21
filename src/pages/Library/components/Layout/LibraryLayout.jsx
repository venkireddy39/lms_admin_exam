import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';


const LibraryLayout = () => {
    const [mobileOpen, setMobileOpen] = useState(false);

    // Toggle for mobile (can be passed to a trigger if we had a local header)
    // For now, we assume desktop mostly or user clicks standard nav toggles.
    // If the main AdminLayout TopNavbar has a toggle, it toggles the MAIN sidebar if it existed.
    // Here we have a submodule sidebar.

    return (
        <div className="d-flex flex-column position-relative w-100" style={{ minHeight: 'calc(100vh - 64px)' }}>
            {/* Library Top Navbar */}
            <div className="library-navbar-container">
                <Sidebar
                    mobileOpen={mobileOpen}
                    onClose={() => setMobileOpen(false)}
                    className="navbar-admin-offset"
                />
            </div>

            {/* Main Content Area */}
            <div
                className="flex-grow-1 w-100"
                style={{
                    padding: '1.5rem',
                }}
            >
                <Outlet />
            </div>

            {/* Mobile Overlay */}
            {mobileOpen && (
                <div
                    className="position-fixed top-0 start-0 w-100 h-100 bg-dark bg-opacity-50"
                    style={{ zIndex: 1040 }}
                    onClick={() => setMobileOpen(false)}
                />
            )}
        </div>
    );
};

export default LibraryLayout;
