import React, { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import {
    FiSearch, FiFilter, FiCalendar, FiUsers, FiCheckCircle,
    FiAlertCircle, FiArrowRight, FiExternalLink, FiClock, FiTrash2
} from 'react-icons/fi';
import { attendanceService } from '../services/attendanceService';
import { courseService } from '../../Courses/services/courseService';
import { batchService } from '../../Batches/services/batchService';
import AttendanceStats from '../components/AttendanceStats';

const SessionsList = () => {
    const [courses, setCourses] = useState([]);
    const [batches, setBatches] = useState([]);
    const [sessions, setSessions] = useState([]);
    const [loading, setLoading] = useState(false);

    // Filters
    const [selectedCourse, setSelectedCourse] = useState('');
    const [selectedBatch, setSelectedBatch] = useState('');
    const [selectedStatus, setSelectedStatus] = useState('ALL'); // ALL, ACTIVE, ENDED
    const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
    const [searchQuery, setSearchQuery] = useState('');

    // Load Courses
    useEffect(() => {
        courseService.getCourses()
            .then(setCourses)
            .catch(err => console.error("Failed to load courses", err));
    }, []);

    // Load Batches when course changes
    useEffect(() => {
        if (selectedCourse) {
            batchService.getBatchesByCourseId(selectedCourse)
                .then(setBatches)
                .catch(err => console.error("Failed to load batches", err));
        } else {
            setBatches([]);
            setSelectedBatch('');
        }
    }, [selectedCourse]);

    // Load Sessions when batch or date changes
    useEffect(() => {
        if (selectedBatch) {
            fetchSessions();
        } else {
            setSessions([]);
        }
    }, [selectedBatch, selectedDate]);

    const fetchSessions = async () => {
        setLoading(true);
        try {
            console.log(`[SessionsList] Fetching sessions for batch: ${selectedBatch}, date: ${selectedDate}`);
            const [attData, acadData] = await Promise.all([
                attendanceService.getSessions(selectedBatch, selectedDate),
                attendanceService.getAcademicSessions(selectedBatch)
            ]);

            // Filter academic sessions for the selected date
            // Handle various formats (Array [Y, M, D] or String "YYYY-MM-DD")
            const acadForDate = (acadData || []).filter(s => {
                let d = s.date || s.startDate || s.start_date || s.attendanceDate;
                if (!d) return false;
                if (Array.isArray(d)) {
                    d = `${d[0]}-${String(d[1]).padStart(2, '0')}-${String(d[2]).padStart(2, '0')}`;
                } else if (typeof d === 'string' && d.includes('T')) {
                    d = d.split('T')[0];
                }
                return d === selectedDate;
            });

            // Map Attendance Data
            const attMapped = await Promise.all((attData || []).map(async s => {
                const acad = acadData.find(a => String(a.classId || a.sessionId) === String(s.classId));

                let studentCount = s.presentCount || 0;
                if (!studentCount) {
                    try {
                        const records = await attendanceService.getAttendance(s.id);
                        studentCount = (records || []).filter(r =>
                            ['PRESENT', 'LATE', 'PARTIAL'].includes((r.status || '').toUpperCase())
                        ).length;
                    } catch (e) { /* ignore */ }
                }

                return {
                    ...s,
                    isAttendance: true,
                    scheduledDate: acad?.startDate || s.attendanceDate,
                    scheduledStartTime: acad?.startTime || (s.startedAt ? new Date(s.startedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : null),
                    scheduledEndTime: acad?.endTime || (s.endedAt ? new Date(s.endedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : null),
                    sessionName: acad?.sessionName || s.title || `Session #${s.classId}`,
                    studentCount
                };
            }));

            // Map Academic Data (those NOT yet in attData)
            const coveredClassIds = new Set(attMapped.map(a => String(a.classId)));
            const acadMapped = acadForDate
                .filter(a => !coveredClassIds.has(String(a.classId || a.sessionId)))
                .map(a => ({
                    id: a.sessionId || a.classId, // Temporary ID
                    classId: a.sessionId || a.classId,
                    isAttendance: false,
                    status: 'SCHEDULED',
                    scheduledDate: selectedDate,
                    scheduledStartTime: a.startTime,
                    scheduledEndTime: a.endTime,
                    sessionName: a.sessionName || `Scheduled #${a.sessionId}`,
                    studentCount: 0
                }));

            setSessions([...attMapped, ...acadMapped]);
        } catch (error) {
            console.error("Failed to fetch sessions", error);
        } finally {
            setLoading(false);
        }
    };

    const handleDeleteSession = async (id) => {
        if (!window.confirm("Are you sure you want to delete this session? This will remove all associated attendance records permanently.")) {
            return;
        }

        try {
            await attendanceService.deleteSession(id);
            alert("Session deleted successfully.");
            fetchSessions(); // Refresh list
        } catch (error) {
            console.error("Failed to delete session", error);
            alert("Failed to delete session. It might have linked records or restricted permissions.");
        }
    };

    const filteredSessions = useMemo(() => {
        return sessions.filter(session => {
            const matchesStatus = selectedStatus === 'ALL' || session.status === selectedStatus;
            const matchesSearch = !searchQuery ||
                session.id.toString().includes(searchQuery.toLowerCase()) ||
                (session.sessionId && session.sessionId.toString().includes(searchQuery.toLowerCase()));
            return matchesStatus && matchesSearch;
        });
    }, [sessions, selectedStatus, searchQuery]);

    const getStatusBadge = (status) => {
        switch (status) {
            case 'ACTIVE':
                return <span className="badge bg-success bg-opacity-10 text-success rounded-pill px-3">Active</span>;
            case 'ENDED':
                return <span className="badge bg-secondary bg-opacity-10 text-secondary rounded-pill px-3">Ended</span>;
            default:
                return <span className="badge bg-light text-dark rounded-pill px-3">{status}</span>;
        }
    };

    return (
        <div className="fade-in">
            {/* Filter Section */}
            <div className="card border-0 shadow-sm mb-4">
                <div className="card-body">
                    <div className="row g-3 align-items-end">
                        <div className="col-md-3">
                            <label className="form-label small fw-bold text-secondary">Course</label>
                            <select
                                className="form-select"
                                value={selectedCourse}
                                onChange={(e) => setSelectedCourse(e.target.value)}
                            >
                                <option value="">Select Course</option>
                                {courses.map(c => (
                                    <option key={c.courseId} value={c.courseId}>{c.courseName}</option>
                                ))}
                            </select>
                        </div>
                        <div className="col-md-3">
                            <label className="form-label small fw-bold text-secondary">Batch</label>
                            <select
                                className="form-select"
                                value={selectedBatch}
                                onChange={(e) => setSelectedBatch(e.target.value)}
                                disabled={!selectedCourse}
                            >
                                <option value="">Select Batch</option>
                                {batches.map(b => (
                                    <option key={b.batchId} value={b.batchId}>{b.batchName}</option>
                                ))}
                            </select>
                        </div>
                        <div className="col-md-2">
                            <label className="form-label small fw-bold text-secondary">Status filter</label>
                            <select
                                className="form-select"
                                value={selectedStatus}
                                onChange={(e) => setSelectedStatus(e.target.value)}
                            >
                                <option value="ALL">All Sessions</option>
                                <option value="ACTIVE">Live / Active</option>
                                <option value="ENDED">Ended / Completed</option>
                                <option value="SCHEDULED">Scheduled / Not Started</option>
                            </select>
                        </div>
                        <div className="col-md-2">
                            <label className="form-label small fw-bold text-secondary">Date</label>
                            <input
                                type="date"
                                className="form-control"
                                value={selectedDate}
                                onChange={(e) => setSelectedDate(e.target.value)}
                            />
                        </div>
                        <div className="col-md-2">
                            <label className="form-label small fw-bold text-secondary">Search</label>
                            <div className="input-group">
                                <span className="input-group-text bg-white border-end-0">
                                    <FiSearch className="text-muted" />
                                </span>
                                <input
                                    type="text"
                                    className="form-control border-start-0"
                                    placeholder="Search by ID or Class ID..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                />
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Content Section */}
            {!selectedBatch ? (
                <div className="text-center py-5 bg-white rounded shadow-sm border">
                    <FiFilter size={48} className="text-muted mb-3 opacity-25" />
                    <h5 className="text-muted">Select a Course and Batch to see live & ended sessions</h5>
                </div>
            ) : loading ? (
                <div className="text-center py-5">
                    <div className="spinner-border text-primary" role="status"></div>
                    <p className="mt-2 text-muted">Loading attendance data...</p>
                </div>
            ) : (
                <div className="table-responsive bg-white rounded shadow-sm border overflow-hidden">
                    <table className="table table-hover align-middle mb-0">
                        <thead className="table-light">
                            <tr>
                                <th className="ps-4">Attendance ID</th>
                                <th>Session Name</th>
                                <th>Class/LMS ID</th>
                                <th>Date</th>
                                <th>Status</th>
                                <th>Schedule</th>
                                <th>Students</th>
                                <th className="text-end pe-4">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredSessions.length > 0 ? (
                                filteredSessions.map(session => (
                                    <tr key={session.id}>
                                        <td className="ps-4 fw-bold text-primary">#{session.id}</td>
                                        <td>
                                            <div className="fw-semibold text-dark">{session.sessionName || '—'}</div>
                                        </td>
                                        <td>
                                            <span className="badge bg-info bg-opacity-10 text-info">
                                                ID: {session.sessionId || 'N/A'}
                                            </span>
                                        </td>
                                        <td>
                                            <div className="d-flex align-items-center gap-2">
                                                <FiCalendar className="text-muted" />
                                                <span>{session.scheduledDate || session.attendanceDate || 'N/A'}</span>
                                            </div>
                                        </td>
                                        <td>
                                            {session.isAttendance ? (
                                                getStatusBadge(session.status)
                                            ) : (
                                                <span className="badge bg-warning bg-opacity-10 text-dark rounded-pill px-3 border border-warning border-opacity-25">Scheduled</span>
                                            )}
                                        </td>
                                        <td>
                                            <div className="small text-muted">
                                                <div className="d-flex align-items-center gap-1">
                                                    <FiClock size={12} />
                                                    {session.scheduledStartTime || (session.startedAt ? new Date(session.startedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '--:--')}
                                                    {' - '}
                                                    {session.scheduledEndTime || (session.endedAt ? new Date(session.endedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Ongoing')}
                                                </div>
                                            </div>
                                        </td>
                                        <td>
                                            <div className="d-flex align-items-center gap-2 text-primary fw-semibold">
                                                <FiUsers size={16} />
                                                <span>{session.studentCount || 0}</span>
                                            </div>
                                        </td>
                                        <td className="text-end pe-4">
                                            <div className="d-flex justify-content-end gap-2">
                                                {!session.isAttendance ? (
                                                    <button
                                                        className="btn btn-primary btn-sm rounded-pill px-3"
                                                        onClick={async () => {
                                                            try {
                                                                const user = JSON.parse(localStorage.getItem('auth_user') || '{}');
                                                                const userId = user.userId || user.id || 1;
                                                                const res = await attendanceService.startSession(
                                                                    session.classId,
                                                                    selectedCourse,
                                                                    selectedBatch,
                                                                    userId
                                                                );
                                                                alert("Session started successfully!");
                                                                fetchSessions();
                                                            } catch (e) {
                                                                alert("Failed to start session: " + e.message);
                                                            }
                                                        }}
                                                    >
                                                        Start <FiArrowRight className="ms-1" />
                                                    </button>
                                                ) : session.status === 'ACTIVE' ? (
                                                    <Link
                                                        to={`/admin/attendance/sessions/${session.id}/live`}
                                                        className="btn btn-primary btn-sm rounded-pill px-3"
                                                    >
                                                        Manage <FiArrowRight className="ms-1" />
                                                    </Link>
                                                ) : (
                                                    <Link
                                                        to={`/admin/attendance/sessions/${session.id}/report`}
                                                        className="btn btn-outline-secondary btn-sm rounded-pill px-3"
                                                    >
                                                        Details <FiExternalLink className="ms-1" />
                                                    </Link>
                                                )}
                                                {session.isAttendance && (
                                                    <button
                                                        className="btn btn-outline-danger btn-sm rounded-circle p-2 d-flex align-items-center justify-content-center"
                                                        onClick={() => handleDeleteSession(session.id)}
                                                        title="Delete Fake/Old Session"
                                                    >
                                                        <FiTrash2 size={14} />
                                                    </button>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="8" className="text-center py-5 text-muted">
                                        No live or ended sessions found.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
};

export default SessionsList;
