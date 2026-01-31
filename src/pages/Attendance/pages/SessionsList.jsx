import React, { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import {
    FiSearch, FiFilter, FiCalendar, FiUsers, FiCheckCircle,
    FiAlertCircle, FiArrowRight, FiExternalLink, FiClock, FiTrash2
} from 'react-icons/fi';
import { attendanceService } from '../services/attendanceService';
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
    const [searchQuery, setSearchQuery] = useState('');

    // Load Courses
    useEffect(() => {
        attendanceService.getCourses()
            .then(setCourses)
            .catch(err => console.error("Failed to load courses", err));
    }, []);

    // Load Batches when course changes
    useEffect(() => {
        if (selectedCourse) {
            attendanceService.getBatches(selectedCourse)
                .then(setBatches)
                .catch(err => console.error("Failed to load batches", err));
        } else {
            setBatches([]);
            setSelectedBatch('');
        }
    }, [selectedCourse]);

    // Load Sessions when batch changes
    useEffect(() => {
        if (selectedBatch) {
            fetchSessions();
        } else {
            setSessions([]);
        }
    }, [selectedBatch]);

    const fetchSessions = async () => {
        setLoading(true);
        try {
            const data = await attendanceService.getSessions(selectedBatch);
            setSessions(data || []);
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
                            </select>
                        </div>
                        <div className="col-md-4">
                            <label className="form-label small fw-bold text-secondary">Search Session</label>
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
                                            <span className="badge bg-info bg-opacity-10 text-info">
                                                ID: {session.sessionId || 'N/A'}
                                            </span>
                                        </td>
                                        <td>
                                            <div className="d-flex align-items-center gap-2">
                                                <FiCalendar className="text-muted" />
                                                <span>{session.startedAt ? new Date(session.startedAt).toLocaleDateString() : 'N/A'}</span>
                                            </div>
                                        </td>
                                        <td>{getStatusBadge(session.status)}</td>
                                        <td>
                                            <div className="small text-muted">
                                                <div className="d-flex align-items-center gap-1">
                                                    <FiClock size={12} />
                                                    {session.startedAt ? new Date(session.startedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '--:--'}
                                                    {' - '}
                                                    {session.endedAt ? new Date(session.endedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Ongoing'}
                                                </div>
                                            </div>
                                        </td>
                                        <td>
                                            <div className="d-flex align-items-center gap-2 text-muted">
                                                <FiUsers size={16} />
                                                <span>--</span>
                                            </div>
                                        </td>
                                        <td className="text-end pe-4">
                                            <div className="d-flex justify-content-end gap-2">
                                                {session.status === 'ACTIVE' ? (
                                                    <Link
                                                        to={`/attendance/sessions/${session.id}/live`}
                                                        className="btn btn-primary btn-sm rounded-pill px-3"
                                                    >
                                                        Manage <FiArrowRight className="ms-1" />
                                                    </Link>
                                                ) : (
                                                    <Link
                                                        to={`/attendance/sessions/${session.id}/report`}
                                                        className="btn btn-outline-secondary btn-sm rounded-pill px-3"
                                                    >
                                                        Details <FiExternalLink className="ms-1" />
                                                    </Link>
                                                )}
                                                <button
                                                    className="btn btn-outline-danger btn-sm rounded-circle p-2 d-flex align-items-center justify-content-center"
                                                    onClick={() => handleDeleteSession(session.id)}
                                                    title="Delete Fake/Old Session"
                                                >
                                                    <FiTrash2 size={14} />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="7" className="text-center py-5 text-muted">
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
