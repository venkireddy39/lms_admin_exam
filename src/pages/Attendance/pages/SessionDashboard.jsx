import React, { useState } from 'react';
import { Activity, Users, Monitor, UserX } from 'lucide-react';
import { attendanceService } from '../services/attendanceService';
import { useAttendanceStore } from '../store/attendanceStore';
import { useLiveSessions } from '../hooks/useLiveSessions';
import { useEndedSessions } from '../hooks/useEndedSessions';
import { useDashboardStats } from '../hooks/useDashboardStats';
import { useToast } from '../../Library/context/ToastContext';
import StatCard from '../components/StatCard';
import SessionList from '../components/SessionList';
import { CheckCircle } from 'lucide-react';

import { useNavigate } from 'react-router-dom';

const SessionDashboard = () => {
    // 1. State
    const [activeTab, setActiveTab] = useState('live'); // 'live' | 'ended'
    const [filterDate, setFilterDate] = useState(new Date().toISOString().split('T')[0]);
    const navigate = useNavigate();

    // 2. Hooks
    const { liveSessions, refreshLive } = useLiveSessions();
    const { endedSessions, refreshEnded } = useEndedSessions(filterDate);
    const { getPendingSyncCount } = useAttendanceStore();
    const toast = useToast();

    // Check if getPendingSyncCount is a function or val (Store usually returns state/actions)
    const pendingSyncCount = getPendingSyncCount();

    const stats = useDashboardStats(liveSessions, pendingSyncCount);

    // Helper to get current user info (ID and Role)
    const getCurrentUser = () => {
        try {
            const user = JSON.parse(localStorage.getItem('auth_user') || '{}');
            return {
                id: user.userId || user.id || 1,
                role: (user.role || '').toUpperCase()
            };
        } catch { return { id: 1, role: 'STUDENT' }; }
    };

    const currentUser = getCurrentUser();

    // 3. Handlers
    const handleQuickStart = async (session) => {
        console.log(`[SessionDashboard] handleQuickStart calling: /api/attendance/session/start`);
        try {
            const res = await attendanceService.startSession(
                session.classId || session.sessionId,
                session.courseId,
                session.batchId,
                currentUser.id
            );

            const status = (res.status || '').toUpperCase();

            if (status === 'ENDED' || status === 'COMPLETED') {
                toast.info("Attendance already marked. Opening Report...");
                navigate(`/admin/attendance/sessions/${res.id}/report`);
            } else {
                toast.success("Attendance Session Active!");
                refreshLive();
                // Auto-navigate to live view
                navigate(`/admin/attendance/sessions/${res.id}/live`);
            }

        } catch (error) {
            console.error("Start Session Error:", error);
            let msg = error.message;
            if (msg.includes("409")) {
                toast.warning("Attendance session is already active. Refreshing list...");
                refreshLive();
            } else {
                toast.error("Failed to start session: " + msg);
            }
        }
    };

    const handleDelete = async (sessionId) => {
        if (!sessionId) return;
        if (!window.confirm("Are you sure you want to delete this attendance session?")) return;

        try {
            await attendanceService.deleteSession(sessionId);
            toast.success("Session deleted successfully.");
            refreshLive();
            if (refreshEnded) refreshEnded();
        } catch (error) {
            console.error("Delete failed", error);
            toast.error("Failed to delete session: " + error.message);
        }
    };


    // 4. Render
    return (
        <div className="fade-in">
            {/* STATS ROW */}
            <div className="row g-3 mb-5">
                <div className="col-md-6 col-lg-3">
                    <StatCard
                        title="Live Sessions"
                        value={stats.ongoingLive}
                        subValue="Active in Cloud"
                        color="success"
                        icon={Monitor}
                    />
                </div>
                <div className="col-md-6 col-lg-3">
                    <StatCard
                        title="Pending Sync"
                        value={stats.pendingSync}
                        subValue="Waiting in Local"
                        color="warning"
                        icon={Activity}
                    />
                </div>
                <div className="col-md-6 col-lg-3">
                    <StatCard
                        title="Today's Absence"
                        value={stats.absentCount}
                        subValue="In current sessions"
                        color="danger"
                        icon={UserX}
                    />
                </div>
                <div className="col-md-6 col-lg-3">
                    <StatCard
                        title="Completed Today"
                        value={stats.completedToday || 0}
                        subValue="Finished sessions"
                        color="primary"
                        icon={CheckCircle}
                    />
                </div>
            </div>

            {/* ACTION BAR */}
            <div className="d-flex justify-content-between align-items-center mb-4">
                <div className="d-flex gap-2 p-1 bg-light rounded-pill d-inline-flex border">
                    <button
                        className={`btn btn-sm rounded-pill px-4 fw-bold ${activeTab === 'live' ? 'btn-white shadow-sm text-primary' : 'text-muted border-0'}`}
                        onClick={() => setActiveTab('live')}
                    >
                        Live Sessions
                    </button>
                    <button
                        className={`btn btn-sm rounded-pill px-4 fw-bold ${activeTab === 'ended' ? 'btn-white shadow-sm text-primary' : 'text-muted border-0'}`}
                        onClick={() => setActiveTab('ended')}
                    >
                        Ended Sessions
                    </button>
                </div>
            </div>

            {/* TAB CONTENT: LIVE */}
            {activeTab === 'live' && (
                <div className="fade-in">
                    <div className="d-flex justify-content-between align-items-center mb-4">
                        <h4 className="text-secondary m-0">Live Sessions</h4>
                        {liveSessions.length > 0 && (
                            <span className="badge bg-success bg-opacity-10 text-success rounded-pill px-3">
                                {liveSessions.length} Active
                            </span>
                        )}
                    </div>
                    <SessionList
                        sessions={liveSessions}
                        type="LIVE"
                        onStart={handleQuickStart}
                        onDelete={handleDelete}
                        userRole={currentUser.role}
                        emptyMessage="No live sessions or scheduled classes for today."
                    />
                </div>
            )}

            {/* TAB CONTENT: ENDED */}
            {activeTab === 'ended' && (
                <div className="fade-in">
                    <div className="d-flex justify-content-between align-items-center mb-4">
                        <h4 className="text-secondary m-0">Past Sessions History</h4>
                        <div className="d-flex align-items-center gap-2">
                            <span className="text-muted small">Filter Date:</span>
                            <input
                                type="date"
                                className="form-control form-control-sm"
                                value={filterDate}
                                onChange={(e) => setFilterDate(e.target.value)}
                            />
                        </div>
                    </div>
                    <SessionList
                        sessions={endedSessions}
                        type="ENDED"
                        onStart={handleQuickStart}
                        onDelete={handleDelete}
                        userRole={currentUser.role}
                        emptyMessage={`No ended sessions found for ${filterDate}.`}
                    />
                </div>
            )}

        </div>
    );
};

export default SessionDashboard;
