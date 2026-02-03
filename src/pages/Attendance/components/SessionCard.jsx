import React from 'react';
import { Link } from 'react-router-dom';
import { Calendar, Clock, Users, Activity, CheckCircle, FileText, Trash2 as FiTrash2 } from 'lucide-react';

const SessionCard = ({ session, type, onStart, onDelete, userRole }) => {
    // type: 'LIVE' or 'ENDED'
    const isAttendance = session.isAttendance;
    const isLive = type === 'LIVE';

    // Check if user has permission to manage attendance
    const canManageAlias = (role) => {
        if (!role) return true; // Default to true if not provided (dev mode)
        const r = String(role).toUpperCase();
        return r.includes('ADMIN') || r.includes('INSTRUCTOR') || r.includes('STAFF');
    };
    const canManage = canManageAlias(userRole);

    const getStatusBadge = () => {
        if (isLive) {
            return isAttendance ? (
                <span className="badge bg-success rounded-pill px-3 py-2 animate-pulse">LIVE NOW</span>
            ) : (
                <span className="badge bg-warning text-dark rounded-pill px-3 py-2">SCHEDULED</span>
            );
        } else {
            return isAttendance ? (
                <span className="badge bg-secondary bg-opacity-10 text-secondary rounded-pill px-3 py-2">COMPLETED</span>
            ) : (
                <span className="badge bg-danger bg-opacity-10 text-danger rounded-pill px-3 py-2">NOT RECORDED</span>
            );
        }
    };

    const getBorderClass = () => {
        if (isLive) return isAttendance ? 'border-success' : 'border-warning';
        return isAttendance ? 'border-secondary' : 'border-danger';
    };

    return (
        <div className="col-md-6 col-lg-4">
            <div className={`card h-100 border-0 shadow-sm border-start border-4 ${getBorderClass()}`}>
                <div className="card-body">
                    <div className="d-flex justify-content-between mb-3">
                        {getStatusBadge()}
                        <small className="text-muted d-flex align-items-center gap-1">
                            <Calendar size={14} />
                            {session.date}
                        </small>
                    </div>

                    <h5 className="fw-bold mb-1">{session.title}</h5>
                    <p className="text-muted small mb-1">{session.batchName}</p>
                    {isLive && <p className="text-primary small mb-4 fw-medium">{session.courseName}</p>}

                    <div className="d-flex gap-3 text-secondary small mb-4">
                        <span className="d-flex align-items-center gap-1">
                            <Clock size={16} />
                            {session.startTime} – {session.endTime}
                        </span>
                        <span className="d-flex align-items-center gap-1">
                            <Users size={16} />
                            {session.students} {isAttendance ? (isLive ? 'Joined' : 'Attended') : 'Enrolled'}
                        </span>
                    </div>

                    <div className="d-flex gap-2">
                        {isAttendance ? (
                            <Link
                                to={isLive ? `/attendance/sessions/${session.id}/live` : `/attendance/sessions/${session.id}/report`}
                                className={`btn ${isLive ? 'btn-primary' : 'btn-outline-primary'} btn-sm flex-grow-1 d-flex align-items-center justify-content-center gap-2`}
                            >
                                {isLive ? <Activity size={14} /> : <FileText size={14} />}
                                {isLive ? 'Manage' : 'View Report'}
                            </Link>
                        ) : (
                            // Only show Start button if user has permission
                            canManage ? (
                                <button
                                    onClick={() => onStart(session)}
                                    className={`btn ${isLive ? 'btn-warning' : 'btn-outline-danger'} btn-sm flex-grow-1 d-flex align-items-center justify-content-center gap-2 ${isLive ? 'fw-bold' : ''}`}
                                >
                                    <CheckCircle size={14} />
                                    {isLive ? 'Start Attendance' : 'Mark Attendance'}
                                </button>
                            ) : (
                                <div className="text-secondary small d-flex align-items-center justify-content-center flex-grow-1 border rounded py-1 bg-light">
                                    Attendance Pending
                                </div>
                            )
                        )}

                        {canManage && (
                            <button
                                onClick={() => onDelete(session.id)}
                                className="btn btn-outline-danger btn-sm px-3"
                                title="Delete Session"
                                disabled={!isAttendance}
                            >
                                <FiTrash2 size={14} />
                            </button>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SessionCard;
