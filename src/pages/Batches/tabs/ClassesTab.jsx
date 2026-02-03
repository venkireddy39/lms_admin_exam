import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    FiCalendar,
    FiClock,
    FiVideo,
    FiMoreVertical,
    FiPlus,
    FiCheckCircle,
    FiPlayCircle,
    FiTrash2,
    FiEdit3,
    FiUserCheck,
    FiRefreshCw
} from 'react-icons/fi';
import { attendanceService } from '../../Attendance/services/attendanceService';
import { sessionService } from '../services/sessionService';
import SessionContentModal from '../components/SessionContentModal';
import '../styles/BatchBuilder.css';

/* ---------------- HELPERS ---------------- */

const getStatus = (session) => {
    // If backend provides status, use it
    if (session.status) {
        const s = session.status.toLowerCase();
        if (s.includes('running') || s.includes('ongoing')) return 'Running';
        if (s.includes('completed') || s.includes('ended')) return 'Completed';
        if (s.includes('upcoming')) return 'Upcoming';
        return session.status; // Fallback to original if unknown but present
    }

    // Fallback logic
    const now = new Date();
    const start = new Date(`${session.startDate}T${session.startTime}`);
    const end = new Date(start.getTime() + (session.durationMinutes || 60) * 60000);

    if (now >= start && now <= end) return 'Running';
    if (now > end) return 'Completed';
    return 'Upcoming';
};

const getStatusColor = (status) => {
    const s = status.toLowerCase();
    if (s.includes('run') || s.includes('ongoing')) return '#22c55e';
    if (s.includes('upcom')) return '#3b82f6';
    return '#64748b';
};

/* ---------------- CARD COMPONENT ---------------- */

const ClassCard = ({ session, onDelete, onEdit, onViewContent, instructorName, batchId, courseId, onAttendanceUpdate }) => {
    const status = getStatus(session);
    const navigate = useNavigate();

    // Attendance Data from session object (enriched in parent)
    const attendance = session.attendanceSession || null;

    const handleAttendanceAction = async () => {
        if (!attendance) {
            // Start New Attendance Session
            if (window.confirm(`Start attendance marking for ${session.sessionName}?`)) {
                try {
                    // session.sessionId is the Academic Session (Class) ID
                    const classId = session.classId || session.sessionId;
                    console.log(`[ClassesTab] Starting attendance for classId: ${classId}`);

                    // Get real user ID from localStorage
                    let userId = 1;
                    try {
                        const authUser = JSON.parse(localStorage.getItem('auth_user') || '{}');
                        userId = authUser.userId || authUser.id || 1;
                    } catch (e) { console.warn("Failed to get userId for startSession", e); }

                    const newAtt = await attendanceService.startSession(classId, courseId, batchId, userId);
                    onAttendanceUpdate(); // Refresh parent state
                    navigate(`/attendance/sessions/${newAtt.id}/live`);
                } catch (e) {
                    alert("Failed to start attendance session. Check if backend is running.");
                }
            }
        } else if (attendance.status === 'ACTIVE') {
            navigate(`/attendance/sessions/${attendance.id}/live`);
        } else {
            navigate(`/attendance/sessions/${attendance.id}/report`);
        }
    };

    // Calculated end time for display
    const getEndTime = () => {
        if (!session.startDate || !session.startTime) return '';
        const start = new Date(`2000-01-01T${session.startTime}`); // Dummy date
        const end = new Date(start.getTime() + (session.durationMinutes || 60) * 60000);
        return end.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false });
    };

    return (
        <div className={`class-card ${status.toLowerCase().includes('run') ? 'highlighted' : ''}`}>
            <div
                className="class-status-stripe"
                style={{ backgroundColor: getStatusColor(status) }}
            />

            <div className="class-content">
                <div className="class-header">
                    <h4 className="class-title">{session.sessionName}</h4>

                    <div className="card-actions">
                        {status === 'Upcoming' && (
                            <button
                                className="btn-icon-plain"
                                title="Edit class"
                                onClick={() => onEdit && onEdit(session)}
                            >
                                <FiEdit3 />
                            </button>
                        )}
                        <button
                            className="btn-icon-plain"
                            title="Delete class"
                            onClick={() => onDelete(session.sessionId)}
                        >
                            <FiTrash2 />
                        </button>
                    </div>
                </div>

                <div className="class-meta">
                    <div className="meta-item">
                        <FiCalendar /> {session.startDate}
                    </div>
                    <div className="meta-item">
                        <FiClock /> {session.startTime} - {getEndTime()} ({session.durationMinutes}m)
                    </div>
                </div>

                <div className="class-footer flex-wrap gap-2">
                    <div className="instructor-info me-auto">
                        <div className="avatar-mini">
                            {(instructorName || 'I').charAt(0).toUpperCase()}
                        </div>
                        <span>{instructorName || 'Instructor'}</span>
                    </div>

                    <div className="d-flex gap-2 w-100 mt-2">
                        {/* Attendance Action Button */}
                        <button
                            className={`btn-sm flex-grow-1 d-flex align-items-center justify-content-center gap-2 rounded border-0 py-2 px-3 fw-bold
                                ${!attendance ? 'btn-attendance-start' : (attendance.status === 'ACTIVE' ? 'btn-attendance-manage' : 'btn-attendance-report')}`}
                            onClick={handleAttendanceAction}
                            style={{
                                backgroundColor: !attendance ? '#0ea5e9' : (attendance.status === 'ACTIVE' ? '#22c55e' : '#64748b'),
                                color: 'white',
                                fontSize: '0.85rem'
                            }}
                        >
                            <FiUserCheck />
                            {!attendance
                                ? (status === 'Completed' ? 'Mark Attendance' : 'Start Attendance')
                                : (attendance.status === 'ACTIVE' ? 'Manage Attendance' : 'View Report')
                            }
                        </button>

                        {status === 'Running' && (
                            <button
                                className="btn-join flex-grow-1"
                                onClick={() => session.meetingLink && window.open(session.meetingLink, '_blank')}
                            >
                                <FiVideo /> Join
                            </button>
                        )}
                    </div>

                    {status === 'Completed' && (
                        <button
                            className="btn-view-recording w-100 mt-2"
                            onClick={() => onViewContent && onViewContent(session)}
                        >
                            <FiPlayCircle /> Class Content
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
};

/* ---------------- MAIN TAB ---------------- */

const ClassesTab = ({ batchId, courseId, instructorName }) => {
    const navigate = useNavigate();
    const [classes, setClasses] = useState([]);
    const [filter, setFilter] = useState('upcoming');
    const [loading, setLoading] = useState(true);
    const [activeContentSession, setActiveContentSession] = useState(null);

    useEffect(() => {
        console.log(`[ClassesTab] batchId changed to: ${batchId}`);
        loadSessions();
    }, [batchId]);

    const loadSessions = async () => {
        setLoading(true);
        try {
            console.log(`[ClassesTab] Loading sessions for batchId: ${batchId}`);
            let data = await sessionService.getSessionsByBatchId(batchId);

            if (!Array.isArray(data)) {
                console.warn("[ClassesTab] Received non-array data for sessions:", data);
                data = [];
            }

            // Sort by date/time
            data.sort((a, b) => {
                const dateA = new Date(`${a.startDate}T${a.startTime}`);
                const dateB = new Date(`${b.startDate}T${b.startTime}`);
                return dateA - dateB;
            });

            console.log(`[ClassesTab] Enriching ${data.length} sessions with attendance info`);

            // Enrich sessions with attendance session info from backend
            const enriched = await Promise.all(data.map(async (cls) => {
                try {
                    const atts = await attendanceService.getAttendanceSessionsByClassId(cls.sessionId);
                    const attList = Array.isArray(atts) ? atts : [];

                    // Take the most recent or active one
                    const active = attList.find(a => a.status === 'ACTIVE');
                    const completed = attList.find(a => a.status === 'ENDED');

                    return {
                        ...cls,
                        attendanceSession: active || completed || null
                    };
                } catch (e) {
                    console.warn(`[ClassesTab] Failed to fetch attendance for session ${cls.sessionId}`, e);
                    return { ...cls, attendanceSession: null };
                }
            }));

            console.log(`[ClassesTab] Setting ${enriched.length} enriched classes`);
            setClasses(enriched);
        } catch (error) {
            console.error("[ClassesTab] Failed to load sessions", error);
        } finally {
            setLoading(false);
        }
    };

    /* -------- ACTIONS -------- */
    const handleDeleteClass = async (id) => {
        const ok = window.confirm('Delete this class?');
        if (!ok) return;
        try {
            await sessionService.deleteSession(id);
            setClasses(prev => prev.filter(c => c.sessionId !== id));
        } catch (error) {
            alert("Failed to delete session");
        }
    };

    const handleEditClass = (session) => {
        navigate(`/batches/${batchId}/create-class?edit=${session.sessionId}`, { state: { session } });
    };

    const handleViewContent = (session) => {
        setActiveContentSession(session);
    };

    /* -------- FILTERED DATA -------- */
    const upcoming = classes.filter(
        c => getStatus(c) === 'Upcoming'
    );
    const ongoing = classes.filter(
        c => getStatus(c) === 'Running'
    );
    const completed = classes.filter(
        c => getStatus(c) === 'Completed'
    );

    if (loading) return <div>Loading sessions...</div>;

    return (
        <div className="classes-tab-container">
            {/* HEADER */}
            <div className="tab-header-actions">
                <div className="filter-tabs">
                    <button
                        className={`filter-btn ${filter === 'upcoming' ? 'active' : ''}`}
                        onClick={() => setFilter('upcoming')}
                    >
                        Upcoming
                    </button>
                    <button
                        className={`filter-btn ${filter === 'ongoing' ? 'active' : ''}`}
                        onClick={() => setFilter('ongoing')}
                    >
                        Ongoing
                    </button>
                    <button
                        className={`filter-btn ${filter === 'completed' ? 'active' : ''}`}
                        onClick={() => setFilter('completed')}
                    >
                        Completed
                    </button>
                </div>

                <div className="d-flex gap-2">
                    <button
                        className="btn-icon-plain"
                        onClick={loadSessions}
                        title="Refresh sessions"
                        style={{ border: '1px solid #e2e8f0', padding: '8px', borderRadius: '8px' }}
                    >
                        <FiRefreshCw className={loading ? 'spin' : ''} />
                    </button>
                    <button
                        className="btn-primary-add"
                        onClick={() => navigate(`/batches/${batchId}/create-class`)}
                    >
                        <FiPlus /> Schedule Class
                    </button>
                </div>
            </div>

            {/* ONGOING */}
            {filter === 'ongoing' && (
                <section className="classes-section">
                    <div className="section-title">
                        <FiPlayCircle />
                        <h4>Happening Now</h4>
                    </div>

                    <div className="classes-grid">
                        {ongoing.length ? ongoing.map(c => (
                            <ClassCard
                                key={c.sessionId}
                                session={c}
                                onDelete={handleDeleteClass}
                                instructorName={instructorName}
                                batchId={batchId}
                                courseId={courseId}
                                onAttendanceUpdate={loadSessions}
                            />
                        )) : (
                            <div className="empty-section">No ongoing classes.</div>
                        )}
                    </div>
                </section>
            )}

            {/* UPCOMING */}
            {filter === 'upcoming' && (
                <section className="classes-section">
                    <div className="section-title">
                        <h4>Upcoming Classes</h4>
                    </div>

                    <div className="classes-grid">
                        {upcoming.length ? upcoming.map(c => (
                            <ClassCard
                                key={c.sessionId}
                                session={c}
                                onDelete={handleDeleteClass}
                                onEdit={handleEditClass}
                                instructorName={instructorName}
                                batchId={batchId}
                                courseId={courseId}
                                onAttendanceUpdate={loadSessions}
                            />
                        )) : (
                            <div className="empty-section">No upcoming classes.</div>
                        )}
                    </div>
                </section>
            )}

            {/* COMPLETED */}
            {filter === 'completed' && (
                <section className="classes-section">
                    <div className="section-title">
                        <h4>Completed Classes</h4>
                    </div>

                    <div className="classes-grid">
                        {completed.length ? completed.map(c => (
                            <ClassCard
                                key={c.sessionId}
                                session={c}
                                onDelete={handleDeleteClass}
                                onViewContent={handleViewContent}
                                instructorName={instructorName}
                                batchId={batchId}
                                courseId={courseId}
                                onAttendanceUpdate={loadSessions}
                            />
                        )) : (
                            <div className="empty-section">No completed classes.</div>
                        )}
                    </div>
                </section>
            )}

            {activeContentSession && (
                <SessionContentModal
                    session={activeContentSession}
                    onClose={() => setActiveContentSession(null)}
                />
            )}
        </div>
    );
};

export default ClassesTab;
