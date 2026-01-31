import React from 'react';
import { Outlet, NavLink } from 'react-router-dom';
import { useAttendanceStore } from './store/attendanceStore';
import './styles/attendance.css';

const AttendanceLayout = () => {
    return (
        <div className="attendance-page">
            <div className="container-fluid">
                <header className="att-header mb-4">
                    <div>
                        <h1>Attendance Manager</h1>
                        <p>Manage sessions, track students, and export reports.</p>
                    </div>
                </header>

                <div className="d-flex gap-2 mb-4 border-bottom pb-3 overflow-auto">
                    <Tab to="/attendance/dashboard">Dashboard</Tab>
                    <Tab to="/attendance/sessions">Sessions</Tab>
                    <Tab to="/attendance/offline-sync">
                        Sync & Manual
                        <PendingSyncBadge />
                    </Tab>
                    <Tab to="/attendance/reports">Reports</Tab>
                    <Tab to="/attendance/settings">Settings</Tab>
                </div>

                <Outlet />
            </div>
        </div>
    );
};

const Tab = ({ to, children }) => (
    <NavLink
        to={to}
        className={({ isActive }) =>
            `btn btn-sm rounded-pill px-3 fw-medium ${isActive
                ? 'btn-secondary shadow-sm'
                : 'btn-light text-secondary hover-shadow'
            }`
        }
    >
        {children}
    </NavLink>
);

const PendingSyncBadge = () => {
    const { getPendingSyncCount } = useAttendanceStore();
    const [count, setCount] = React.useState(0);

    // Update count periodically or on interaction
    React.useEffect(() => {
        const update = () => setCount(getPendingSyncCount());
        update();
        const interval = setInterval(update, 5000); // Check every 5s
        return () => clearInterval(interval);
    }, [getPendingSyncCount]);

    if (count === 0) return null;

    return (
        <span className="badge rounded-pill bg-danger ms-2" style={{ fontSize: '0.65rem' }}>
            {count}
        </span>
    );
};

export default AttendanceLayout;
