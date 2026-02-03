import React, { useState, useMemo, useCallback } from 'react';
import { FiDownload, FiCheckCircle, FiXCircle, FiClock, FiAlertCircle, FiInfo, FiMinusCircle } from 'react-icons/fi';
import StudentAttendanceProfile from './StudentAttendanceProfile';

/* ---------------- CONFIGURATION ---------------- */

const CONSTANTS = {
    ELIGIBILITY_THRESHOLD: 75,
    WARNING_THRESHOLD: 65,
    STATUS_CONFIG: {
        PRESENT: { label: 'Present', color: 'success', icon: <FiCheckCircle /> },
        LATE: { label: 'Late', color: 'warning', icon: <FiClock /> },
        PARTIAL: { label: 'Partial', color: 'info', icon: <FiClock /> },
        ABSENT: { label: 'Absent', color: 'danger', icon: <FiXCircle /> },
        EXCUSED: { label: 'Excused', color: 'secondary', icon: <FiAlertCircle /> },
        MEDICAL: { label: 'Medical', color: 'primary', icon: <FiInfo /> },
        DEFAULT: { label: 'Unknown', color: 'secondary', icon: <FiMinusCircle /> }
    }
};

/* ---------------- SUB-COMPONENTS ---------------- */

const ReportStat = React.memo(({ label, value, color, status }) => (
    <div className="col">
        <div className={`fw-bold fs-4 ${color ? `text-${color}` : 'text-dark'}`}>
            {value}
        </div>
        <div className="text-muted small text-uppercase fw-semibold">{label}</div>
        {status && <div className={`badge bg-${color} mt-1`}>{status}</div>}
    </div>
));

const StatusBadge = React.memo(({ status }) => {
    const config = CONSTANTS.STATUS_CONFIG[status] || CONSTANTS.STATUS_CONFIG.DEFAULT;
    return (
        <span className={`badge bg-${config.color} d-inline-flex align-items-center gap-2 px-3 py-2`}>
            {config.icon}
            <span>{config.label}</span>
        </span>
    );
});

/* ---------------- MAIN COMPONENT ---------------- */



const AttendanceReport = ({ history = [], students = [] }) => {
    const [viewMode, setViewMode] = useState('SUMMARY'); // 'SUMMARY' or 'LOG'
    const [statusFilter, setStatusFilter] = useState('ALL');
    const [selectedStudent, setSelectedStudent] = useState(null);

    /* ---------------- MEMOIZED COMPUTATIONS ---------------- */

    // Group history by student for the Summary View
    const studentStats = useMemo(() => {
        const stats = {};
        history.forEach(r => {
            if (!stats[r.studentId]) {
                stats[r.studentId] = {
                    id: r.studentId,
                    name: r.studentName || 'Unknown',
                    courseName: r.courseName, // Take last or first
                    total: 0,
                    present: 0,
                    absent: 0,
                    late: 0
                };
            }
            stats[r.studentId].total++;
            if (['PRESENT', 'LATE', 'PARTIAL'].includes(r.status)) {
                stats[r.studentId].present++;
            } else {
                stats[r.studentId].absent++;
            }
            if (r.status === 'LATE') stats[r.studentId].late++;
        });

        return Object.values(stats).map(s => ({
            ...s,
            percentage: s.total > 0 ? Math.round((s.present / s.total) * 100) : 0
        }));
    }, [history]);

    const filteredHistory = useMemo(() => {
        if (statusFilter === 'ALL') return history;
        return history.filter(record => record.status === statusFilter);
    }, [history, statusFilter]);

    const reportSummary = useMemo(() => {
        const total = history.length;
        const attended = history.filter(r =>
            ['PRESENT', 'LATE', 'PARTIAL'].includes(r.status)
        ).length;

        const percentage = total > 0 ? Math.round((attended / total) * 100) : 0;

        return {
            total,
            attended,
            absent: total - attended,
            percentage
        };
    }, [history]);

    /* ---------------- RENDER ---------------- */

    return (
        <div className="card shadow-sm border-0 mt-4 overflow-hidden">
            {/* Summary Section */}
            <div className="card-body border-bottom bg-light bg-opacity-50 py-4">
                <div className="row text-center g-3">
                    <ReportStat label="Total Records" value={reportSummary.total} />
                    <ReportStat label="Present Marks" value={reportSummary.attended} color="success" />
                    <ReportStat label="Absent Marks" value={reportSummary.absent} color="danger" />
                    <ReportStat
                        label="Avg Attendance %"
                        value={`${reportSummary.percentage}%`}
                        color={reportSummary.percentage >= 75 ? 'success' : 'warning'}
                    />
                </div>
            </div>

            {/* Controls Header */}
            <div className="card-header bg-white d-flex justify-content-between align-items-center py-3">
                <div className="d-flex align-items-center gap-3">
                    <h6 className="mb-0 fw-bold d-flex align-items-center gap-2">
                        <FiClock className="text-primary" />
                        Attendance Report
                    </h6>
                    <div className="btn-group btn-group-sm">
                        <button
                            className={`btn ${viewMode === 'SUMMARY' ? 'btn-primary' : 'btn-outline-primary'}`}
                            onClick={() => setViewMode('SUMMARY')}
                        >
                            Student Summary
                        </button>
                        <button
                            className={`btn ${viewMode === 'LOG' ? 'btn-primary' : 'btn-outline-primary'}`}
                            onClick={() => setViewMode('LOG')}
                        >
                            Detailed Log
                        </button>
                    </div>
                </div>

                <div className="d-flex gap-2">
                    <select
                        className="form-select form-select-sm"
                        style={{ width: '150px' }}
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value)}
                        aria-label="Filter by details"
                        disabled={viewMode === 'SUMMARY'} // Disable detail filter in summary mode usually
                    >
                        <option value="ALL">All Statuses</option>
                        {['PRESENT', 'ABSENT', 'LATE'].map(status => (
                            <option key={status} value={status}>
                                {CONSTANTS.STATUS_CONFIG[status]?.label}
                            </option>
                        ))}
                    </select>
                </div>
            </div>

            {/* Data Table */}
            <div className="table-responsive">
                <table className="table table-hover align-middle mb-0">
                    <thead className="table-light">
                        {viewMode === 'SUMMARY' ? (
                            <tr>
                                <th className="ps-4">Student Name</th>
                                <th className="text-center">Total Sessions</th>
                                <th className="text-center">Attended</th>
                                <th className="text-center">Absent</th>
                                <th className="text-center">Percentage</th>
                                <th className="text-center">Status</th>
                            </tr>
                        ) : (
                            <tr>
                                <th className="ps-4">SL .no</th>
                                <th>Date</th>
                                <th>Course/Class</th>
                                <th>Student Name</th>
                                <th>Status</th>
                                <th>Method</th>
                                <th className="text-center">Attendance (Min)</th>
                            </tr>
                        )}
                    </thead>
                    <tbody>
                        {viewMode === 'SUMMARY' ? (
                            studentStats.length > 0 ? (
                                studentStats.map(student => (
                                    <tr
                                        key={student.id}
                                        onClick={() => {
                                            const fullProfile = students.find(s => String(s.id || s.studentId) === String(student.id)) || {};
                                            const sInfo = fullProfile.student || fullProfile;
                                            setSelectedStudent({
                                                id: student.id,
                                                studentId: student.id,
                                                name: student.name,
                                                courseName: student.courseName,
                                                email: sInfo.email || sInfo.studentEmail || sInfo.userEmail,
                                                phone: sInfo.phone || sInfo.phoneNumber || sInfo.studentPhone || sInfo.mobile,
                                                enrolledDate: fullProfile.joinedAt || fullProfile.enrolledAt || fullProfile.enrolledDate || fullProfile.createdAt || sInfo.createdAt
                                            });
                                        }}
                                        className="cursor-pointer"
                                        style={{ cursor: 'pointer' }}
                                    >
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
                                                    ></div>
                                                </div>
                                                <span className="small fw-bold">{student.percentage}%</span>
                                            </div>
                                        </td>
                                        <td className="text-center">
                                            {student.percentage < 75 ? (
                                                <span className="badge bg-danger">Shortage</span>
                                            ) : (
                                                <span className="badge bg-success">Eligible</span>
                                            )}
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr><td colSpan="6" className="text-center py-4">No students found</td></tr>
                            )
                        ) : (
                            // LOG VIEW (Existing Logic)
                            filteredHistory.length > 0 ? (
                                filteredHistory.map((record, index) => (
                                    <tr key={record.id || index}>
                                        <td className="ps-4 text-muted">{index + 1}</td>
                                        <td className="fw-medium text-secondary">{record.date}</td>
                                        <td className="fw-semibold text-dark">{record.courseName || record.subject}</td>
                                        <td
                                            className="fw-medium text-primary cursor-pointer text-decoration-underline"
                                            onClick={() => {
                                                const studentId = record.studentId || record.id;
                                                const fullProfile = students.find(s => String(s.id || s.studentId) === String(studentId)) || {};
                                                const sInfo = fullProfile.student || fullProfile;

                                                setSelectedStudent({
                                                    id: studentId,
                                                    studentId: studentId,
                                                    name: record.studentName || sInfo.name || sInfo.studentName,
                                                    courseName: record.courseName || sInfo.courseName,
                                                    email: sInfo.email || sInfo.studentEmail || sInfo.userEmail,
                                                    phone: sInfo.phone || sInfo.phoneNumber || sInfo.studentPhone || sInfo.mobile,
                                                    enrolledDate: fullProfile.joinedAt || fullProfile.enrolledAt || fullProfile.enrolledDate || fullProfile.createdAt || sInfo.createdAt
                                                });
                                            }}
                                            style={{ cursor: 'pointer' }}
                                        >
                                            {record.studentName || '—'}
                                        </td>

                                        <td>
                                            <StatusBadge status={record.status} />
                                        </td>
                                        <td>
                                            <span className="badge bg-light text-dark border">
                                                {record.method}
                                            </span>
                                        </td>
                                        <td className="text-center">{record.attendanceInMinutes || record.presenceMinutes || 0}</td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="8" className="text-center text-muted py-5">
                                        <div className="d-flex flex-column align-items-center gap-2">
                                            <FiMinusCircle size={24} className="opacity-50" />
                                            <p className="mb-0">No attendance records found</p>
                                        </div>
                                    </td>
                                </tr>
                            )
                        )}
                    </tbody>
                </table>
            </div>

            {/* Student Profile Modal */}
            {
                selectedStudent && (
                    <StudentAttendanceProfile
                        key={selectedStudent.id}
                        student={selectedStudent}
                        studentHistory={history.filter(h => String(h.studentId) === String(selectedStudent.id))}
                        onClose={() => setSelectedStudent(null)}
                    />
                )
            }
        </div >
    );
};

export default AttendanceReport;