import React, { useState, useId, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Clock, Users, Activity, Calendar, CheckCircle, FileText, Monitor, Percent, UserX, Trash2 as FiTrash2 } from 'lucide-react';
import { AreaChart, Area, ResponsiveContainer } from 'recharts';
import { attendanceService } from '../services/attendanceService';
import { useAttendanceStore } from '../store/attendanceStore';
import { batchService } from '../../Batches/services/batchService';
import { enrollmentService } from '../../Batches/services/enrollmentService';

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
                <div style={{ width: '100%', height: 60, marginTop: 'auto' }}>
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

    // Modal State
    const [showStartModal, setShowStartModal] = useState(false);
    // REVISED STATE: Combined data
    // We removed 'scheduledSessions' separate state because we will merge them into Live/Ended.
    const [liveSessions, setLiveSessions] = useState([]);
    const [endedSessions, setEndedSessions] = useState([]);

    // We keep these for the modal
    const [courses, setCourses] = useState([]);
    const [batches, setBatches] = useState([]);
    const [academicSessions, setAcademicSessions] = useState([]);

    const [newSessionData, setNewSessionData] = useState({
        courseId: '',
        batchId: '',
        classId: '' // Explicitly named classId as per backend requirement
    });

    const [stats, setStats] = useState({
        ongoingLive: 0,
        avgPresentPct: 0,
        absentCount: 0,
        totalStudents: 0
    });

    // Helper: Fetch all academic sessions for today/date from all batches
    const fetchAllAcademicSessions = async (dateStr) => {
        try {
            const allBatches = await batchService.getAllBatches();
            const promises = allBatches.map(async (batch) => {
                try {
                    const sessions = await attendanceService.getAcademicSessions(batch.batchId);
                    // Filter matching date
                    return sessions
                        .filter(s => s.startDate === dateStr)
                        .map(s => ({ ...s, batchName: batch.batchName, courseName: batch.courseName, courseId: batch.courseId, batchId: batch.batchId }));
                } catch { return []; }
            });
            const results = await Promise.all(promises);
            return results.flat();
        } catch { return []; }
    };

    // LOAD LIVE SESSIONS (Active Attendance + Today's Scheduled)
    const loadLiveSessions = async () => {
        try {
            const today = new Date().toISOString().split('T')[0];

            // 1. Fetch Today's Academic Sessions
            const academicCheck = await fetchAllAcademicSessions(today);

            // 2. Fetch Active Attendance Sessions (Optimistic Local Check)
            // Note: This relies on date matching which might fail if session started yesterday
            let activeAtt = [];
            try {
                const attData = await attendanceService.getSessions(null, null); // "Today"
                activeAtt = (attData || []).filter(s => (s.status || '').toUpperCase() === 'ACTIVE');
                console.log("[SessionDashboard] Initial Active list:", activeAtt.length);
            } catch (e) {
                console.warn("Could not fetch daily sessions list", e);
            }

            // 3. Robust Verification: Check EACH academic session for an active attendance session
            // This strictly binds the UI to the Academic Schedule but ensures we find the "Active" state
            // even if the basic list query failed or had date mismatches.
            const verifiedSessions = await Promise.all(academicCheck.map(async (acadSession) => {
                const classId = acadSession.classId || acadSession.sessionId;

                // Check if already found in current date's active list (Fast Path)
                const existingInList = activeAtt.find(s => String(s.classId) === String(classId));
                if (existingInList) {
                    return {
                        type: 'ACTIVE',
                        acad: acadSession,
                        att: existingInList
                    };
                }

                // Slow Path: Double check backend for ANY active session for this specific class
                try {
                    const history = await attendanceService.getAttendanceSessionsByClassId(classId);
                    const deepActive = Array.isArray(history) ? history.find(s => (s.status || '').toUpperCase() === 'ACTIVE') : null;

                    if (deepActive) {
                        console.log(`[SessionDashboard] Found deep active session for ${classId}`, deepActive);
                        return { type: 'ACTIVE', acad: acadSession, att: deepActive };
                    }
                } catch (e) { /* ignore */ }

                return { type: 'SCHEDULED', acad: acadSession };
            }));

            // 4. Map to UI Models
            const finalSessions = verifiedSessions.map(item => {
                const s = item.acad;

                if (item.type === 'ACTIVE') {
                    const att = item.att;
                    // Map Active
                    return {
                        id: att.id,
                        uid: `att-${att.id}`,
                        isAttendance: true,
                        title: `Class Session #${att.id}`, // Or preserve academic title?
                        batchName: s.batchName,
                        courseName: s.courseName,
                        date: att.attendanceDate || today, // Use attendance date
                        startTime: att.startedAt ? String(att.startedAt).split('T')[1]?.substring(0, 5) : (s.startTime || '--:--'),
                        endTime: 'Ongoing',
                        students: 0, // Skipping count to avoid further complexity
                        status: 'LIVE',
                        classId: s.classId || s.sessionId
                    };
                } else {
                    // Map Scheduled
                    return {
                        id: s.sessionId || s.classId,
                        uid: `acad-${s.sessionId || s.classId}`,
                        isAttendance: false,
                        title: s.sessionName || `Session #${s.classId}`,
                        batchName: s.batchName,
                        courseName: s.courseName,
                        date: s.startDate,
                        startTime: s.startTime || '--:--',
                        endTime: s.endTime || '--:--',
                        students: 0,
                        status: 'SCHEDULED',
                        classId: s.classId || s.sessionId,
                        courseId: s.courseId,
                        batchId: s.batchId
                    };
                }
            });

            // Optional: Add orphaned active sessions (Active sessions not in today's academic schedule)
            // This is important if an ad-hoc session was started or date changed.
            const matchedClassIds = new Set(verifiedSessions.filter(v => v.type === 'ACTIVE').map(v => String(v.acad.classId || v.acad.sessionId)));

            const orphans = activeAtt.filter(s => !matchedClassIds.has(String(s.classId)));
            const mappedOrphans = await Promise.all(orphans.map(async s => {
                // We need course/batch info. Try to find in allBatches (not fetched here, but we can refetch or just use IDs)
                // For simplicity, basic mapping:
                return {
                    id: s.id,
                    uid: `att-orphan-${s.id}`,
                    isAttendance: true,
                    title: `Ad-Hoc/Past Session #${s.id}`,
                    batchName: `Batch ${s.batchId}`,
                    courseName: 'Unknown',
                    date: s.attendanceDate || today,
                    startTime: 'Active',
                    endTime: 'Ongoing',
                    students: 0,
                    status: 'LIVE',
                    classId: s.classId
                };
            }));

            setLiveSessions([...finalSessions, ...mappedOrphans]);

        } catch (error) {
            console.error("Failed to load live sessions", error);
        }
    };

    useEffect(() => {
        loadLiveSessions();
    }, []);

    // FETCH ENDED SESSIONS (Completed Attendance + Past Academic)
    const fetchEndedSessions = async () => {
        try {
            const [attData, allBatches] = await Promise.all([
                attendanceService.getSessions(null, filterDate),
                batchService.getAllBatches()
            ]);
            const endedAtt = (attData || []).filter(s => s.status === 'ENDED');

            // Map Ended
            const mappedEnded = await Promise.all(endedAtt.map(async s => {
                const batch = allBatches.find(b => String(b.batchId) === String(s.batchId));
                let count = 0;
                try {
                    const students = await enrollmentService.getStudentsByBatch(s.batchId);
                    count = students.length;
                } catch (e) { count = 0; }

                const startStr = String(s.startedAt || '');
                const endStr = String(s.endedAt || '');

                return {
                    id: s.id,
                    uid: `att-${s.id}`,
                    isAttendance: true,
                    title: `Class Session #${s.id}`,
                    batchName: batch ? batch.batchName : `Batch #${s.batchId}`,
                    date: startStr.includes('T') ? startStr.split('T')[0] : filterDate,
                    startTime: startStr.includes('T') ? startStr.split('T')[1].substring(0, 5) : '--:--',
                    endTime: endStr.includes('T') ? endStr.split('T')[1].substring(0, 5) : '--:--',
                    students: count,
                    status: 'COMPLETED'
                };
            }));

            // Fetch Academic sessions for this FILTER DATE
            const academicCheck = await fetchAllAcademicSessions(filterDate);

            // Check duplications (Academic Sessions that HAVE an attendance record)
            // Note: attData (filtered by date) contains the attendance records for this date.
            const endedClassIds = new Set(endedAtt.map(s => String(s.classId || s.sessionId)));

            // Also check LIVE sessions (if user filters date = today, we shouldn't show Live sessions as Ended Pending)
            // But fetchEndedSessions is separate list.

            const pendingAcademic = academicCheck.filter(s => !endedClassIds.has(String(s.sessionId || s.classId)));

            const mappedPending = pendingAcademic.map(s => ({
                id: s.sessionId || s.classId,
                uid: `acad-${s.sessionId || s.classId}`,
                isAttendance: false,
                title: s.sessionName || "Unrecorded Session",
                batchName: s.batchName,
                date: s.startDate,
                startTime: s.startTime,
                endTime: s.endTime,
                students: 0,
                status: 'NOT_RECORDED',
                // Data needed to start
                classId: s.classId || s.sessionId,
                courseId: s.courseId,
                batchId: s.batchId
            }));

            setEndedSessions([...mappedEnded, ...mappedPending]);

        } catch (error) {
            console.error("Failed to fetch ended sessions", error);
        }
    };

    useEffect(() => {
        fetchEndedSessions();
    }, [filterDate]);

    // Fetch Courses for Modal
    useEffect(() => {
        if (showStartModal) {
            attendanceService.getCourses().then(setCourses).catch(console.error);
        }
    }, [showStartModal]);

    // Fetch Academic Sessions (Classes) when Batch is selected
    useEffect(() => {
        if (newSessionData.batchId) {
            attendanceService.getAcademicSessions(newSessionData.batchId)
                .then(setAcademicSessions)
                .catch(e => {
                    console.warn("Failed to fetch academic sessions", e);
                    setAcademicSessions([]);
                });
        } else {
            setAcademicSessions([]);
        }
    }, [newSessionData.batchId]);

    // Handle Start Session
    const handleStartSession = async () => {
        if (!newSessionData.courseId || !newSessionData.batchId || !newSessionData.classId) {
            alert("Please select Course, Batch, and Class/Topic");
            return;
        }

        console.log("[SessionDashboard] Starting Attendance Session for Class ID:", newSessionData.classId);

        try {
            const newAtt = await attendanceService.startSession(
                newSessionData.classId,
                newSessionData.courseId,
                newSessionData.batchId,
                1 // Default User ID (Admin)
            );

            setShowStartModal(false);
            setNewSessionData({ courseId: '', batchId: '', classId: '' });

            // Refresh and Navigate
            loadLiveSessions();
            alert("Attendance Session Started!");
        } catch (error) {
            console.error("Failed to start session", error);
            alert("Failed to start session. Ensure backend is running and Class ID is valid.");
        }
    };

    const { getPendingSyncCount } = useAttendanceStore();

    // Fetch Dashboard Stats
    useEffect(() => {
        const fetchStats = async () => {
            try {
                // Backend requires specific courseId/batchId for stats. 
                // Since this is a global dashboard, we cannot call this endpoint without a specific context.
                // Skipping to prevent 500 Error: "Attendance config not found"

                /* 
                const [studentData, enrollments] = await Promise.all([
                    attendanceService.getDashboardStats(courseId, batchId), 
                    enrollmentService.getAllEnrollments()
                ]);
                */

                // Fallback: Just fetch enrollments for total count
                const enrollments = await enrollmentService.getAllEnrollments().catch(() => []);

                setStats({
                    ongoingLive: liveSessions.length,
                    avgPresentPct: 0, // Cannot calc without specific batch config
                    absentCount: 0,
                    totalStudents: enrollments.length || 0,
                    pendingSync: getPendingSyncCount()
                });

            } catch (error) {
                console.error("Failed to fetch dashboard stats", error);
                setStats(prev => ({
                    ...prev,
                    ongoingLive: liveSessions.length,
                    pendingSync: getPendingSyncCount()
                }));
            }
        };
        fetchStats();
    }, [liveSessions.length, getPendingSyncCount]);

    // Derived Stats
    const ongoingLiveCount = stats.ongoingLive;
    const totalStudents = stats.totalStudents;
    const avgPresentPct = stats.avgPresentPct;
    const absentCount = stats.absentCount;

    const handleQuickStart = async (session) => {
        if (!window.confirm(`Start attendance for ${session.sessionName}?`)) return;
        try {
            await attendanceService.startSession(
                session.classId || session.sessionId,
                session.courseId,
                session.batchId,
                1
            );
            loadLiveSessions();
            alert("Session Started!");
        } catch (error) {
            console.error("Start Session Error:", error);

            // Parse error message if possible
            let errorMessage = error.message;
            try {
                const jsonErr = JSON.parse(error.message);
                errorMessage = jsonErr.message || error.message;
            } catch (e) { /* use raw message */ }

            if (errorMessage.includes("409") || errorMessage.includes("already started")) {
                alert("Attendance session is already active. Refreshing list...");
                loadLiveSessions();
            } else {
                alert("Failed to start session: " + errorMessage);
            }
        }
    };

    return (
        <div className="fade-in">
            {/* STATS ROW */}
            <div className="row g-3 mb-5">
                <div className="col-md-6 col-lg-3">
                    <StatCard
                        title="Live Sessions"
                        value={ongoingLiveCount}
                        subValue="Active in Cloud"
                        color="success"
                        icon={Monitor}
                    />
                </div>
                <div className="col-md-6 col-lg-3">
                    <StatCard
                        title="Pending Sync"
                        value={stats.pendingSync || 0}
                        subValue="Waiting in Local"
                        color="warning"
                        icon={Activity}
                    />
                </div>
                <div className="col-md-6 col-lg-3">
                    <StatCard
                        title="Today's Absence"
                        value={absentCount}
                        subValue="In current sessions"
                        color="danger"
                        icon={UserX}
                    />
                </div>
                <div className="col-md-6 col-lg-3">
                    <StatCard
                        title="Total Active Students"
                        value={totalStudents}
                        subValue="Enrolled currently"
                        color="primary"
                        icon={Users}
                    />
                </div>
            </div>

            {/* TAB TOGGLES & ACTION BUTTON */}
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
                <button
                    className="btn btn-primary rounded-pill px-4 shadow-sm fw-bold d-flex align-items-center gap-2"
                    onClick={() => setShowStartModal(true)}
                >
                    <Activity size={18} />
                    Start New Session
                </button>
            </div>

            {/* MODAL OVERLAY */}
            {showStartModal && (
                <div className="modal fade show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
                    <div className="modal-dialog modal-dialog-centered">
                        <div className="modal-content border-0 shadow">
                            <div className="modal-header border-bottom-0">
                                <h5 className="modal-title fw-bold">Start New Attendance Session</h5>
                                <button type="button" className="btn-close" onClick={() => setShowStartModal(false)}></button>
                            </div>
                            <div className="modal-body">
                                <form>
                                    <div className="mb-3">
                                        <label className="form-label small fw-bold text-secondary">Course</label>
                                        <select
                                            className="form-select"
                                            value={newSessionData.courseId}
                                            onChange={e => setNewSessionData({ ...newSessionData, courseId: e.target.value, batchId: '' })}
                                        >
                                            <option value="">Select Course</option>
                                            {courses.map(c => <option key={c.courseId} value={c.courseId}>{c.courseName}</option>)}
                                        </select>
                                    </div>
                                    <div className="mb-3">
                                        <label className="form-label small fw-bold text-secondary">Batch</label>
                                        <select
                                            className="form-select"
                                            value={newSessionData.batchId}
                                            onChange={e => setNewSessionData({ ...newSessionData, batchId: e.target.value })}
                                            disabled={!newSessionData.courseId}
                                        >
                                            <option value="">Select Batch</option>
                                            {batches.map(b => <option key={b.batchId} value={b.batchId}>{b.batchName}</option>)}
                                        </select>
                                    </div>
                                    <div className="mb-3">
                                        <label className="form-label small fw-bold text-secondary">Select Class / Topic</label>
                                        <select
                                            className="form-select"
                                            value={newSessionData.classId}
                                            onChange={e => setNewSessionData({ ...newSessionData, classId: e.target.value })}
                                            disabled={!newSessionData.batchId}
                                        >
                                            <option value="">Select Class Session</option>
                                            {academicSessions.map(s => (
                                                <option key={s.classId} value={s.classId}>
                                                    {s.sessionName} ({s.startDate})
                                                </option>
                                            ))}
                                        </select>
                                        <small className="text-muted">Pick the scheduled class session from the batch syllabus</small>
                                    </div>
                                </form>
                            </div>
                            <div className="modal-footer border-top-0">
                                <button type="button" className="btn btn-light" onClick={() => setShowStartModal(false)}>Cancel</button>
                                <button type="button" className="btn btn-primary px-4" onClick={handleStartSession}>Start Session</button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

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
                            No live sessions running. Click "Start New Session" to begin.
                        </div>
                    )}

                    <div className="row g-4">
                        {liveSessions.map((session) => (
                            <div className="col-md-6 col-lg-4" key={session.uid}>
                                <div className={`card h-100 border-0 shadow-sm border-start border-4 ${session.isAttendance ? 'border-success' : 'border-warning'}`}>
                                    <div className="card-body">
                                        <div className="d-flex justify-content-between mb-3">
                                            {session.isAttendance ? (
                                                <span className="badge bg-success rounded-pill px-3 py-2 animate-pulse">LIVE NOW</span>
                                            ) : (
                                                <span className="badge bg-warning text-dark rounded-pill px-3 py-2">SCHEDULED</span>
                                            )}

                                            <small className="text-muted d-flex align-items-center gap-1">
                                                <Calendar size={14} />
                                                {session.date}
                                            </small>
                                        </div>

                                        <h5 className="fw-bold mb-1">{session.title}</h5>
                                        <p className="text-muted small mb-1">{session.batchName}</p>
                                        <p className="text-primary small mb-4 fw-medium">{session.courseName}</p>

                                        <div className="d-flex gap-3 text-secondary small mb-4">
                                            <span className="d-flex align-items-center gap-1">
                                                <Clock size={16} />
                                                {session.startTime} – {session.endTime}
                                            </span>
                                            <span className="d-flex align-items-center gap-1">
                                                <Users size={16} />
                                                {session.students} {session.isAttendance ? 'Joined' : 'Enrolled'}
                                            </span>
                                        </div>

                                        <div className="d-flex gap-2">
                                            {session.isAttendance ? (
                                                <Link
                                                    to={`/attendance/sessions/${session.id}/live`}
                                                    className="btn btn-primary btn-sm flex-grow-1 d-flex align-items-center justify-content-center gap-2"
                                                >
                                                    <Activity size={14} />
                                                    Manage
                                                </Link>
                                            ) : (
                                                <button
                                                    onClick={() => handleQuickStart(session)}
                                                    className="btn btn-warning btn-sm flex-grow-1 d-flex align-items-center justify-content-center gap-2 fw-bold"
                                                >
                                                    <CheckCircle size={14} />
                                                    Start Attendance
                                                </button>
                                            )}

                                            <button
                                                onClick={() => handleDelete(session.id)}
                                                className="btn btn-outline-danger btn-sm px-3"
                                                title="Delete"
                                                disabled={!session.isAttendance}
                                            >
                                                <FiTrash2 size={14} />
                                            </button>
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
                            <div className="col-md-6 col-lg-4" key={session.uid}>
                                <div className={`card h-100 border-0 shadow-sm border-start border-4 ${session.isAttendance ? 'border-secondary' : 'border-danger'}`}>
                                    <div className="card-body">
                                        <div className="d-flex justify-content-between mb-3">
                                            {session.isAttendance ? (
                                                <span className="badge bg-secondary bg-opacity-10 text-secondary rounded-pill px-3 py-2">COMPLETED</span>
                                            ) : (
                                                <span className="badge bg-danger bg-opacity-10 text-danger rounded-pill px-3 py-2">NOT RECORDED</span>
                                            )}

                                            <small className="text-muted d-flex align-items-center gap-1">
                                                <Calendar size={14} />
                                                {session.date}
                                            </small>
                                        </div>

                                        <h5 className="fw-bold mb-1">{session.title}</h5>
                                        <p className="text-muted small mb-4">{session.batchName}</p>

                                        <div className="d-flex gap-3 text-secondary small mb-4">
                                            <span className="d-flex align-items-center gap-1">
                                                <Clock size={16} />
                                                {session.startTime} – {session.endTime}
                                            </span>
                                            <span className="d-flex align-items-center gap-1">
                                                <Users size={16} />
                                                {session.students} {session.isAttendance ? 'Attended' : 'Enrolled'}
                                            </span>
                                        </div>

                                        <div className="d-flex gap-2">
                                            {session.isAttendance ? (
                                                <Link
                                                    to={`/attendance/sessions/${session.id}/report`}
                                                    className="btn btn-outline-primary btn-sm flex-grow-1 d-flex align-items-center justify-content-center gap-2"
                                                >
                                                    <FileText size={14} />
                                                    View Report
                                                </Link>
                                            ) : (
                                                <button
                                                    onClick={() => handleQuickStart(session)}
                                                    className="btn btn-outline-danger btn-sm flex-grow-1 d-flex align-items-center justify-content-center gap-2"
                                                >
                                                    <CheckCircle size={14} />
                                                    Mark Attendance
                                                </button>
                                            )}

                                            <button
                                                onClick={() => handleDelete(session.id)}
                                                className="btn btn-outline-danger btn-sm px-3"
                                                title="Delete Old Data"
                                                disabled={!session.isAttendance}
                                            >
                                                <FiTrash2 size={14} />
                                            </button>
                                        </div>
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
