import React from 'react';
import { FiCheckCircle, FiClock, FiXCircle, FiAlertCircle, FiInfo, FiMinusCircle } from 'react-icons/fi';

const STATUS_CONFIG = {
    PRESENT: { label: 'Present', color: 'success', icon: <FiCheckCircle /> },
    LATE: { label: 'Late', color: 'warning', icon: <FiClock /> },
    PARTIAL: { label: 'Partial', color: 'info', icon: <FiClock /> },
    ABSENT: { label: 'Absent', color: 'danger', icon: <FiXCircle /> },
    EXCUSED: { label: 'Excused', color: 'secondary', icon: <FiAlertCircle /> },
    MEDICAL: { label: 'Medical', color: 'primary', icon: <FiInfo /> },
    DEFAULT: { label: 'Unknown', color: 'secondary', icon: <FiMinusCircle /> }
};

const StatusBadge = React.memo(({ status }) => {
    const config = STATUS_CONFIG[status] || STATUS_CONFIG.DEFAULT;

    return (
        <span className={`badge bg-${config.color} d-inline-flex align-items-center gap-2 px-3 py-2`}>
            {config.icon}
            <span>{config.label}</span>
        </span>
    );
});

const ReportTable = ({ 
    viewMode, 
    studentStats, 
    filteredHistory, 
    onStudentClick, 
    statusConfig 
}) => {
    return (
        <div className="table-responsive">
            <table className="table table-hover align-middle mb-0">
                <thead className="bg-light border-bottom">
                    {viewMode === 'SUMMARY' ? (
                        <tr>
                            <th className="ps-4 py-3 text-secondary text-uppercase small fw-bold">Student Name</th>
                            <th className="text-center py-3 text-secondary text-uppercase small fw-bold">Total Sessions</th>
                            <th className="text-center py-3 text-secondary text-uppercase small fw-bold">Attended</th>
                            <th className="text-center py-3 text-secondary text-uppercase small fw-bold">Absent</th>
                            <th className="text-center py-3 text-secondary text-uppercase small fw-bold">Percentage</th>
                            <th className="text-center py-3 text-secondary text-uppercase small fw-bold">Status</th>
                        </tr>
                    ) : (
                        <tr>
                            <th className="ps-4 py-3 text-secondary text-uppercase small fw-bold">SL .no</th>
                            <th className="py-3 text-secondary text-uppercase small fw-bold">Date</th>
                            <th className="py-3 text-secondary text-uppercase small fw-bold">Course/Class</th>
                            <th className="py-3 text-secondary text-uppercase small fw-bold">Student Name</th>
                            <th className="py-3 text-secondary text-uppercase small fw-bold">Status</th>
                            <th className="py-3 text-secondary text-uppercase small fw-bold">Method</th>
                            <th className="text-center py-3 text-secondary text-uppercase small fw-bold">Attendance (Min)</th>
                        </tr>
                    )}
                </thead>
                <tbody>
                    {viewMode === 'SUMMARY'
                        ? studentStats.length > 0
                            ? studentStats.map(student => (
                                <tr key={student.id} onClick={() => onStudentClick(student)} style={{ cursor: 'pointer' }}>
                                    <td className="ps-4 fw-bold text-primary">{student.name}</td>
                                    <td className="text-center">{student.total}</td>
                                    <td className="text-center text-success fw-bold">{student.present}</td>
                                    <td className="text-center text-danger">{student.absent}</td>
                                    <td className="text-center">
                                        <div className="d-flex align-items-center justify-content-center gap-2">
                                            <div className="progress" style={{ width: '60px', height: '6px' }}>
                                                <div
                                                    className={`progress-bar bg-${student.percentage >= 75 ? 'success' : 'warning'}`}
                                                    style={{ width: `${student.percentage}%` }}
                                                />
                                            </div>
                                            <span className="small fw-bold">{student.percentage}%</span>
                                        </div>
                                    </td>
                                    <td className="text-center">
                                        {student.percentage < 75
                                            ? <span className="badge bg-danger">Shortage</span>
                                            : <span className="badge bg-success">Eligible</span>}
                                    </td>
                                </tr>
                            ))
                            : (
                                <tr>
                                    <td colSpan="6" className="text-center py-4">No students found</td>
                                </tr>
                            )
                        : filteredHistory.length > 0
                            ? filteredHistory.map((record, index) => (
                                <tr key={record.id || index}>
                                    <td className="ps-4 text-muted">{index + 1}</td>
                                    <td className="fw-medium text-secondary">{record.date}</td>
                                    <td className="fw-semibold text-dark">{record.courseName || record.subject}</td>
                                    <td
                                        className="fw-medium text-primary text-decoration-underline"
                                        style={{ cursor: 'pointer' }}
                                        onClick={() => onStudentClick(record)}
                                    >
                                        {record.studentName || '—'}
                                    </td>
                                    <td>
                                        <StatusBadge status={record.status} />
                                    </td>
                                    <td>
                                        <span className="badge bg-light text-dark border">{record.method}</span>
                                    </td>
                                    <td className="text-center">
                                        {record.attendanceInMinutes || record.presenceMinutes || 0}
                                    </td>
                                </tr>
                            ))
                            : (
                                <tr>
                                    <td colSpan="8" className="text-center text-muted py-5">
                                        <div className="d-flex flex-column align-items-center gap-2">
                                            <FiMinusCircle size={24} className="opacity-50" />
                                            <p className="mb-0">No attendance records found</p>
                                        </div>
                                    </td>
                                </tr>
                            )}
                </tbody>
            </table>
        </div>
    );
};

export default ReportTable;
