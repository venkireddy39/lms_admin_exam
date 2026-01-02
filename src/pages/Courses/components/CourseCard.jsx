import React from 'react';
import { FiImage, FiEdit2, FiTrash2 } from "react-icons/fi";

const getStatusColor = (status) => {
    switch (status) {
        case 'Live': return '#ef4444';
        case 'Completed': return '#10b981';
        default: return '#3b82f6';
    }
};

const CourseCard = ({ course, index, onEdit, onDelete }) => {
    return (
        <div className="course-card-item">
            <div className="card-image-wrapper">
                {course.img ? (
                    <img src={course.img} alt={course.name} />
                ) : (
                    <div className="placeholder-wrapper">
                        <FiImage size={32} color="#94a3b8" />
                    </div>
                )}
                <div className="card-badges">
                    <span
                        className="badge-pill"
                        style={{
                            background: getStatusColor(course.status || 'Upcoming'),
                            color: '#fff'
                        }}
                    >
                        {course.status || 'Upcoming'}
                    </span>
                    {course.courseType === 'Free' ? (
                        <span className="badge-pill free">Free</span>
                    ) : (
                        <span className="badge-pill paid">₹{course.price}</span>
                    )}
                </div>
            </div>

            <div className="card-content-body">
                <div className="card-header-row">
                    <h3 className="card-title-text">{course.name}</h3>
                    <span className="card-trainer-text">
                        <span style={{ fontWeight: 500, color: '#94a3b8' }}>Trainer:</span> {course.trainer}
                    </span>
                </div>

                <p className="card-desc-text">
                    {course.desc.length > 80 ? course.desc.substring(0, 80) + '...' : course.desc}
                </p>

                <div className="card-meta-row">
                    <div className="meta-col">
                        <span className="meta-label-sm">Mentor</span>
                        <span className="meta-value-text">{course.mentorName || 'Not Assigned'}</span>
                    </div>
                    {course.mentorPhone && (
                        <div className="meta-col">
                            <span className="meta-label-sm">Contact</span>
                            <span className="meta-value-text">{course.mentorPhone}</span>
                        </div>
                    )}
                </div>
            </div>

            <div className="card-footer-actions">
                <button className="action-btn-card edit" onClick={() => onEdit(index)}>
                    <FiEdit2 size={14} /> Edit
                </button>
                <button className="action-btn-card delete" onClick={() => onDelete(index)}>
                    <FiTrash2 size={14} /> Delete
                </button>
            </div>
        </div>
    );
};

export default CourseCard;
