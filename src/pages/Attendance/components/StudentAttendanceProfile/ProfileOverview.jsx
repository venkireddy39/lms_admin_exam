import React from 'react';
import { FiMail, FiPhone, FiBook, FiCalendar, FiActivity, FiCheckCircle, FiXCircle } from 'react-icons/fi';

const DetailRow = ({ icon: Icon, label, value }) => (
    <div className="d-flex align-items-start mb-3">
        <div className="bg-light rounded-circle p-2 me-3 text-primary flex-shrink-0">
            <Icon size={16} />
        </div>
        <div className="overflow-hidden">
            <div className="small text-muted text-uppercase fw-bold" style={{ fontSize: '0.75rem' }}>{label}</div>
            <div className="fw-medium text-break">{value}</div>
        </div>
    </div>
);

const StatCard = ({ label, value, color, icon: Icon }) => (
    <div className="col-4">
        <div className={`p-2 p-md-3 rounded-3 bg-${color} bg-opacity-10 h-100 text-center d-flex flex-column justify-content-center align-items-center`}>
            {Icon && <Icon className={`text-${color} mb-1 mb-md-2`} size={20} />}
            <div className={`h5 h4-md fw-bold text-${color} mb-0`}>{value}</div>
            <div className={`small text-${color} text-opacity-75`} style={{ fontSize: '0.7rem' }}>{label}</div>
        </div>
    </div>
);

const ProfileOverview = ({ stats, studentInfo }) => {
    return (
        <div className="fade-in">
            <div className="row g-3 mb-4">
                <StatCard label="Attendance" value={`${stats.percentage}%`} color={stats.percentage >= 75 ? 'success' : 'warning'} icon={FiActivity} />
                <StatCard label="Present" value={stats.present} color="success" icon={FiCheckCircle} />
                <StatCard label="Absent" value={stats.absent} color="danger" icon={FiXCircle} />
            </div>

            <h6 className="fw-bold text-muted mb-3 small text-uppercase letter-spacing-1">Contact & Academic Info</h6>
            <div className="row g-3">
                <div className="col-md-6">
                    <DetailRow icon={FiMail} label="Email Address" value={studentInfo.email} />
                    <DetailRow icon={FiPhone} label="Contact Number" value={studentInfo.phone} />
                </div>
                <div className="col-md-6">
                    <DetailRow icon={FiBook} label="Course/Batch" value={studentInfo.course} />
                    <DetailRow icon={FiCalendar} label="Enrolled Date" value={studentInfo.enrolled ? (new Date(studentInfo.enrolled).toString() !== 'Invalid Date' ? new Date(studentInfo.enrolled).toLocaleDateString() : studentInfo.enrolled) : 'N/A'} />
                </div>
            </div>
        </div>
    );
};

export default ProfileOverview;
