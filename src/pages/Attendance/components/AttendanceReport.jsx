import React, { useState, useMemo } from 'react';
import { FiClock } from 'react-icons/fi';
import StudentAttendanceProfile from './StudentAttendanceProfile';
import ReportSummary from './AttendanceReport/ReportSummary';
import ReportTable from './AttendanceReport/ReportTable';

const AttendanceReport = ({ history = [], students = [] }) => {
    const [viewMode, setViewMode] = useState('SUMMARY');
    const [statusFilter, setStatusFilter] = useState('ALL');
    const [selectedStudent, setSelectedStudent] = useState(null);

    const studentStats = useMemo(() => {
        const stats = {};
        history.forEach(r => {
            if (!stats[r.studentId]) {
                stats[r.studentId] = {
                    id: r.studentId,
                    name: r.studentName || 'Unknown',
                    courseName: r.courseName,
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

        return { total, attended, absent: total - attended, percentage };
    }, [history]);

    const handleStudentClick = (data) => {
        const studentId = data.studentId || data.id;
        const fullProfile = students.find(s => String(s.id || s.studentId) === String(studentId)) || {};
        const sInfo = fullProfile.student || fullProfile;

        setSelectedStudent({
            id: studentId,
            studentId: studentId,
            name: data.name || data.studentName || sInfo.name || sInfo.studentName,
            courseName: data.courseName || sInfo.courseName,
            email: sInfo.email || sInfo.studentEmail || sInfo.userEmail,
            phone: sInfo.phone || sInfo.phoneNumber || sInfo.studentPhone || sInfo.mobile,
            enrolledDate: fullProfile.joinedAt || fullProfile.enrolledAt || fullProfile.enrolledDate || fullProfile.createdAt || sInfo.createdAt
        });
    };

    return (
        <div className="card shadow-sm border-0 mt-4 overflow-hidden">
            <ReportSummary summary={reportSummary} />

            <div className="card-header bg-white d-flex justify-content-between align-items-center py-3">
                <div className="d-flex align-items-center gap-4">
                    <h6 className="mb-0 fw-bold d-flex align-items-center gap-2 text-dark">
                        <FiClock className="text-primary" size={18} />
                        Attendance Report
                    </h6>

                    <div className="nav nav-pills bg-light p-1 rounded-3">
                        {['SUMMARY', 'LOG'].map(mode => (
                            <button
                                key={mode}
                                className={`nav-link border-0 py-1 px-3 fw-bold small ${viewMode === mode ? 'bg-primary text-white shadow-sm' : 'text-secondary bg-transparent'}`}
                                onClick={() => setViewMode(mode)}
                            >
                                {mode === 'SUMMARY' ? 'Student Summary' : 'Detailed Log'}
                            </button>
                        ))}
                    </div>
                </div>

                <div className="d-flex gap-2">
                    <select
                        className="form-select form-select-sm"
                        style={{ width: '150px' }}
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value)}
                        disabled={viewMode === 'SUMMARY'}
                    >
                        <option value="ALL">All Statuses</option>
                        {['PRESENT', 'ABSENT', 'LATE'].map(status => (
                            <option key={status} value={status}>{status.charAt(0) + status.slice(1).toLowerCase()}</option>
                        ))}
                    </select>
                </div>
            </div>

            <ReportTable 
                viewMode={viewMode}
                studentStats={studentStats}
                filteredHistory={filteredHistory}
                onStudentClick={handleStudentClick}
            />

            {selectedStudent && (
                <StudentAttendanceProfile
                    key={selectedStudent.id}
                    student={selectedStudent}
                    studentHistory={history.filter(h => String(h.studentId) === String(selectedStudent.id))}
                    onClose={() => setSelectedStudent(null)}
                />
            )}
        </div>
    );
};

export default AttendanceReport;