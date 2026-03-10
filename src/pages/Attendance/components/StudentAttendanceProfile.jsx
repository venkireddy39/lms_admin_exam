import React, { useMemo } from 'react';
import { FiX } from 'react-icons/fi';
import useStudentProfile from '../hooks/useStudentProfile';
import ProfileOverview from './StudentAttendanceProfile/ProfileOverview';
import ProfileHistory from './StudentAttendanceProfile/ProfileHistory';

const StudentAttendanceProfile = ({ student, studentHistory = [], onClose }) => {
    const [showHistory, setShowHistory] = React.useState(false);
    const { studentInfo } = useStudentProfile(student);

    // Lock body scroll on mount
    React.useEffect(() => {
        document.body.style.overflow = 'hidden';
        return () => {
            document.body.style.overflow = 'unset';
        };
    }, []);

    const stats = useMemo(() => {
        if (!student) return { totalClasses: 0, present: 0, absent: 0, percentage: 0 };
        const totalClasses = studentHistory.length;
        const present = studentHistory.filter(h => ['PRESENT', 'LATE', 'PARTIAL'].includes(h.status)).length;
        const absent = totalClasses - present;
        const percentage = totalClasses > 0 ? Math.round((present / totalClasses) * 100) : 0;
        return { totalClasses, present, absent, percentage };
    }, [student?.id, studentHistory]);

    if (!student) return null;

    return (
        <div className="position-fixed top-0 start-0 w-100 h-100 overflow-y-auto"
            style={{ backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 1050, backdropFilter: 'blur(2px)' }}>

            <div className="d-flex min-vh-100 justify-content-center align-items-center py-4"
                onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}>

                <div className="card border-0 shadow-lg d-flex flex-column transition-all mx-3 position-relative"
                    style={{
                        width: showHistory ? '800px' : '500px',
                        maxWidth: '95vw',
                        transition: 'width 0.3s ease'
                    }}>
                    <div className="card-header bg-white border-0 d-flex justify-content-between align-items-center py-3 px-3 px-md-4 flex-shrink-0">
                        <h5 className="mb-0 fw-bold text-primary text-truncate pe-2">
                            {showHistory ? 'Attendance History' : 'Student Overview'}
                        </h5>
                        <button className="btn btn-light btn-sm rounded-circle p-2 flex-shrink-0" onClick={onClose}>
                            <FiX size={18} />
                        </button>
                    </div>

                    <div className="card-body px-4 pt-2 pb-4 flex-grow-1">
                        <div className="d-flex align-items-center mb-4 pb-4 border-bottom">
                            <div className="bg-primary text-white rounded-circle d-flex align-items-center justify-content-center me-3 fs-3 fw-bold flex-shrink-0"
                                style={{ width: '64px', height: '64px' }}>
                                {student.name.charAt(0)}
                            </div>
                            <div className="overflow-hidden">
                                <h4 className="fw-bold mb-1 text-truncate" title={student.name}>{student.name}</h4>
                                <span className="badge bg-light text-secondary border">ID: {student.studentId || student.id}</span>
                            </div>
                        </div>

                        {showHistory ? (
                            <ProfileHistory stats={stats} studentHistory={studentHistory} />
                        ) : (
                            <ProfileOverview stats={stats} studentInfo={studentInfo} />
                        )}
                    </div>

                    <div className="card-footer bg-light border-top py-3 px-4 flex-shrink-0">
                        <div className="d-flex justify-content-between align-items-center w-100">
                            <div className="text-muted small">
                                Status: <strong>{student.isDeleted ? 'Inactive' : 'Active'}</strong>
                            </div>
                            <div className="d-flex gap-2">
                                <button className="btn btn-outline-secondary" onClick={onClose}>Close</button>
                                {!showHistory ? (
                                    <button className="btn btn-primary" onClick={() => setShowHistory(true)}>
                                        View Full History
                                    </button>
                                ) : (
                                    <button className="btn btn-outline-primary" onClick={() => setShowHistory(false)}>
                                        Back to Overview
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default StudentAttendanceProfile;
