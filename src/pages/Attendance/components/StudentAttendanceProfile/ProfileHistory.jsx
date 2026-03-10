import React from 'react';
import { FiCalendar } from 'react-icons/fi';

const ProfileHistory = ({ stats, studentHistory }) => {
    return (
        <div className="fade-in">
            <div className="row g-3 mb-4">
                <div className="col-md-3 col-6">
                    <div className="p-3 rounded bg-light border text-center h-100">
                        <div className="h4 mb-0 fw-bold text-primary">{stats.totalClasses}</div>
                        <div className="small text-muted">Total Classes</div>
                    </div>
                </div>
                <div className="col-md-3 col-6">
                    <div className="p-3 rounded bg-light border text-center h-100">
                        <div className="h4 mb-0 fw-bold text-success">{stats.present}</div>
                        <div className="small text-muted">Present</div>
                    </div>
                </div>
                <div className="col-md-3 col-6">
                    <div className="p-3 rounded bg-light border text-center h-100">
                        <div className="h4 mb-0 fw-bold text-danger">{stats.absent}</div>
                        <div className="small text-muted">Absent</div>
                    </div>
                </div>
                <div className="col-md-3 col-6">
                    <div className="p-3 rounded bg-light border text-center h-100">
                        <div className={`h4 mb-0 fw-bold ${stats.percentage >= 75 ? 'text-success' : 'text-warning'}`}>{stats.percentage}%</div>
                        <div className="small text-muted">Average</div>
                    </div>
                </div>
            </div>

            <div className="table-responsive border rounded">
                <table className="table table-hover align-middle mb-0">
                    <thead className="table-light">
                        <tr>
                            <th className="ps-3">Date</th>
                            <th>Status</th>
                            <th>Method</th>
                            <th className="text-center pe-3">Time (Min)</th>
                        </tr>
                    </thead>
                    <tbody>
                        {studentHistory.length > 0 ? (
                            studentHistory.map((record, index) => (
                                <tr key={index}>
                                    <td className="fw-medium ps-3">{record.date}</td>
                                    <td>
                                        <span className={`badge bg-${record.status === 'PRESENT' ? 'success' : record.status === 'LATE' ? 'warning' : 'danger'}`}>
                                            {record.status}
                                        </span>
                                    </td>
                                    <td className="text-secondary small">{record.method}</td>
                                    <td className="text-center pe-3">{record.attendanceInMinutes || '-'}</td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan="4" className="text-center py-5 text-muted bg-light">
                                    <div className="py-3">
                                        <FiCalendar className="mb-2 text-muted opacity-50" size={24} />
                                        <div>No attendance history recorded yet.</div>
                                    </div>
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default ProfileHistory;
