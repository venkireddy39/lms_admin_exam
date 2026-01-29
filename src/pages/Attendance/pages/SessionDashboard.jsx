import React, { useState, useId } from 'react';
import { Link } from 'react-router-dom';
import { Clock, Users, Activity, Calendar, CheckCircle, FileText, Monitor, Percent, UserX } from 'lucide-react';
import { AreaChart, Area, ResponsiveContainer } from 'recharts';

const MOCK_SESSIONS = [
    {
        id: 'sess-101',
        title: 'Physics 101 - Lecture 5',
        batch: 'Batch A',
        date: '2026-01-08',
        startTime: '10:00',
        endTime: '11:00',
        status: 'LIVE',
        students: 45,
    },
    {
        id: 'sess-100',
        title: 'Math 202',
        batch: 'Batch A',
        date: '2026-01-07',
        startTime: '10:00',
        endTime: '11:00',
        status: 'ENDED',
        students: 42,
    },
    {
        id: 'sess-99',
        title: 'History 101',
        batch: 'Batch B',
        date: '2026-01-08',
        startTime: '08:00',
        endTime: '09:00',
        status: 'ENDED',
        students: 38,
    },
];

const DEFAULT_TREND_DATA = [
    { value: 30 }, { value: 45 }, { value: 35 }, { value: 50 }, { value: 45 }, { value: 60 }, { value: 55 }
];

const StatCard = ({ title, value, subValue, trendData = DEFAULT_TREND_DATA, color = 'primary', icon: Icon }) => {
    const gradientId = useId();
    const COLORS = {
        success: { stroke: '#22c55e', fill: '#dcfce7', text: 'text-success', bg: 'bg-success' },
        danger: { stroke: '#ef4444', fill: '#fee2e2', text: 'text-danger', bg: 'bg-danger' },
        warning: { stroke: '#f59e0b', fill: '#fef3c7', text: 'text-warning', bg: 'bg-warning' },
        primary: { stroke: '#3b82f6', fill: '#dbeafe', text: 'text-primary', bg: 'bg-primary' },
        info: { stroke: '#06b6d4', fill: '#cffafe', text: 'text-info', bg: 'bg-info' }
    };

    const theme = COLORS[color] || COLORS.primary;

    return (
        <div className="card border-0 shadow-sm h-100 position-relative overflow-hidden">
            <div className="card-body p-3">
                <div className="d-flex justify-content-between align-items-start mb-2">
                    <div>
                        <p className="text-muted fw-bold text-uppercase mb-1" style={{ fontSize: 11, letterSpacing: '0.5px' }}>
                            {title}
                        </p>
                        <h3 className="fw-bolder mb-0 text-dark">{value}</h3>
                        {subValue && <p className="text-muted small mb-0 mt-1">{subValue}</p>}
                    </div>
                    {Icon && (
                        <div className={`p-2 rounded-circle ${theme.bg} bg-opacity-10 ${theme.text}`}>
                            <Icon size={18} />
                        </div>
                    )}
                </div>
                <div style={{ height: 40, margin: '0 -1rem -1rem', minHeight: '50px' }}>
                    <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={trendData}>
                            <defs>
                                <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor={theme.fill} stopOpacity={0.8} />
                                    <stop offset="95%" stopColor={theme.fill} stopOpacity={0} />
                                </linearGradient>
                            </defs>
                            <Area
                                type="monotone"
                                dataKey="value"
                                stroke={theme.stroke}
                                strokeWidth={2}
                                fill={`url(#${gradientId})`}
                            />
                        </AreaChart>
                    </ResponsiveContainer>
                </div>
            </div>
        </div>
    );
};

const SessionDashboard = () => {
    const [filterDate, setFilterDate] = useState(new Date().toISOString().split('T')[0]);
    const [activeTab, setActiveTab] = useState('live'); // 'live' | 'ended'

    const liveSessions = MOCK_SESSIONS.filter((s) => s.status === 'LIVE');
    const endedSessions = MOCK_SESSIONS.filter((s) => s.status === 'ENDED' && s.date === filterDate);

    // Derived Stats
    const ongoingLiveCount = liveSessions.length;
    const totalStudents = MOCK_SESSIONS.reduce((acc, curr) => acc + curr.students, 0); // specialized logic if needed
    // Mocking other stats as per request since MOCK_SESSIONS is limited
    const avgPresentPct = 87;
    const absentCount = 12;

    return (
        <div className="fade-in">
            {/* STATS ROW */}
            <div className="row g-3 mb-5">
                <div className="col-md-6 col-lg-3">
                    <StatCard
                        title="Ongoing Live"
                        value={ongoingLiveCount}
                        subValue="Active Sessions"
                        color="success"
                        icon={Monitor}
                    />
                </div>
                <div className="col-md-6 col-lg-3">
                    <StatCard
                        title="Avg. Present %"
                        value={`${avgPresentPct}%`}
                        subValue="+2.5% vs last week"
                        color="info"
                        icon={Percent}
                    />
                </div>
                <div className="col-md-6 col-lg-3">
                    <StatCard
                        title="Absent Today"
                        value={absentCount}
                        subValue="Students"
                        color="danger"
                        icon={UserX}
                    />
                </div>
                <div className="col-md-6 col-lg-3">
                    <StatCard
                        title="Total Students"
                        value={totalStudents}
                        subValue="Enrolled in Batch"
                        color="primary"
                        icon={Users}
                    />
                </div>
            </div>

            {/* TAB TOGGLES */}
            <div className="d-flex mb-4 gap-2 p-1 bg-light rounded-pill d-inline-flex border">
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

            {/* TAB CONTENT: LIVE */}
            {activeTab === 'live' && (
                <div className="fade-in">
                    <div className="d-flex justify-content-between align-items-center mb-4">
                        <h4 className="text-secondary m-0">Live Sessions</h4>
                        <span className="badge bg-success bg-opacity-10 text-success rounded-pill px-3">
                            {liveSessions.length} Active
                        </span>
                    </div>

                    {liveSessions.length === 0 && (
                        <div className="text-muted text-center py-5 border rounded-3 bg-light">
                            No live sessions running at the moment.
                        </div>
                    )}

                    <div className="row g-4">
                        {liveSessions.map((session) => (
                            <div className="col-md-6 col-lg-4" key={session.id}>
                                <div className="card h-100 border-0 shadow-sm border-start border-4 border-success">
                                    <div className="card-body">
                                        <div className="d-flex justify-content-between mb-3">
                                            <span className="badge bg-success rounded-pill px-3 py-2 animate-pulse">
                                                LIVE NOW
                                            </span>
                                            <small className="text-muted d-flex align-items-center gap-1">
                                                <Calendar size={14} />
                                                {session.date}
                                            </small>
                                        </div>

                                        <h5 className="fw-bold mb-1">{session.title}</h5>
                                        <p className="text-muted small mb-4">{session.batch}</p>

                                        <div className="d-flex gap-3 text-secondary small mb-4">
                                            <span className="d-flex align-items-center gap-1">
                                                <Clock size={16} />
                                                {session.startTime} – {session.endTime}
                                            </span>
                                            <span className="d-flex align-items-center gap-1">
                                                <Users size={16} />
                                                {session.students}
                                            </span>
                                        </div>

                                        <div className="d-flex gap-2">
                                            <Link
                                                to={`/attendance/sessions/${session.id}/live`}
                                                className="btn btn-primary btn-sm flex-grow-1 d-flex align-items-center justify-content-center gap-2"
                                            >
                                                <Activity size={14} />
                                                Manage
                                            </Link>
                                            <Link
                                                to={`/attendance/sessions/${session.id}/end`}
                                                className="btn btn-outline-danger btn-sm d-flex align-items-center justify-content-center gap-2"
                                                title="End Session"
                                            >
                                                <CheckCircle size={14} />
                                                End
                                            </Link>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
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

                    {endedSessions.length === 0 && (
                        <div className="text-muted text-center py-5 border rounded-3 bg-light">
                            No ended sessions found for {filterDate}.
                        </div>
                    )}

                    <div className="row g-4">
                        {endedSessions.map((session) => (
                            <div className="col-md-6 col-lg-4" key={session.id}>
                                <div className="card h-100 border-0 shadow-sm">
                                    <div className="card-body">
                                        <div className="d-flex justify-content-between mb-3">
                                            <span className="badge bg-secondary bg-opacity-10 text-secondary rounded-pill px-3 py-2">
                                                COMPLETED
                                            </span>
                                            <small className="text-muted d-flex align-items-center gap-1">
                                                <Calendar size={14} />
                                                {session.date}
                                            </small>
                                        </div>

                                        <h5 className="fw-bold mb-1">{session.title}</h5>
                                        <p className="text-muted small mb-4">{session.batch}</p>

                                        <div className="d-flex gap-3 text-secondary small mb-4">
                                            <span className="d-flex align-items-center gap-1">
                                                <Clock size={16} />
                                                {session.startTime} – {session.endTime}
                                            </span>
                                            <span className="d-flex align-items-center gap-1">
                                                <Users size={16} />
                                                {session.students} Attended
                                            </span>
                                        </div>

                                        <Link
                                            to={`/attendance/sessions/${session.id}/report`}
                                            className="btn btn-outline-primary btn-sm w-100 d-flex align-items-center justify-content-center gap-2"
                                        >
                                            <FileText size={14} />
                                            View Report
                                        </Link>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};

export default SessionDashboard;
