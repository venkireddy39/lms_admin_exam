import React from 'react';
import {
    FiCalendar,
    FiEdit2,
    FiTrash2,
    FiLayers
} from "react-icons/fi";
import { calculateProgress } from '../utils/batchUtils';
import { BATCH_STATUS } from '../constants/batchConstants';

const BatchCard = ({ batch, courses = [], onEdit, onDelete, onManageContent }) => {
    const course = courses.find(c => String(c.courseId) === String(batch.courseId));

    const students = batch.students ?? 0;
    const maxStudents = batch.maxStudents ?? 0;
    const progress = maxStudents > 0 ? calculateProgress(students, maxStudents) : 0;

    const isFull = maxStudents > 0 && students >= maxStudents;
    const isCompleted = batch.status === BATCH_STATUS.COMPLETED;

    const getStatusColor = (status) => {
        switch (status) {
            case BATCH_STATUS.UPCOMING:
                return "blue";
            case BATCH_STATUS.ONGOING:
                return "green";
            case BATCH_STATUS.COMPLETED:
                return "gray";
            default:
                return "gray";
        }
    };

    return (
        <div className={`batch-card-premium ${isCompleted ? 'completed' : ''}`}>

            {/* Status */}
            <div className={`status-pill ${getStatusColor(batch.status)}`}>
                {batch.status}
            </div>

            <div className="card-content">
                <h3 className="batch-title">{batch.batchName}</h3>
                <p className="course-linked">
                    {course?.courseName || 'Unassigned Course'}
                </p>

                {/* Dates */}
                <div className="info-grid">
                    <div className="info-item">
                        <FiCalendar className="i-icon" />
                        <span>{batch.startDate} – {batch.endDate}</span>
                    </div>
                    {batch.trainerName && (
                        <div className="info-item">
                            <span>Instructor: {batch.trainerName}</span>
                        </div>
                    )}
                </div>

                {/* Fee and Access */}
                <div style={{ display: 'flex', gap: '8px', marginBottom: '16px', flexWrap: 'wrap' }}>
                    <div style={{
                        background: '#f1f5f9',
                        padding: '4px 10px',
                        borderRadius: '6px',
                        fontSize: '12px',
                        fontWeight: '700',
                        color: '#475569',
                        border: '1px solid #e2e8f0'
                    }}>
                        Fee: ₹{batch.fee || 0}
                    </div>
                    {batch.contentAccess && (
                        <div style={{
                            background: '#ecfdf5',
                            padding: '4px 10px',
                            borderRadius: '6px',
                            fontSize: '12px',
                            fontWeight: '700',
                            color: '#059669',
                            border: '1px solid #a7f3d0'
                        }}>
                            Access Enabled
                        </div>
                    )}
                </div>

                {/* Capacity */}
                {maxStudents > 0 && (
                    <div className="capacity-section">
                        <div className="cap-header">
                            <span className="cap-label">Enrollment</span>
                            <span className={`cap-val ${isFull ? 'text-red' : ''}`}>
                                {students} / {maxStudents}
                            </span>
                        </div>

                        <div className="progress-track">
                            <div
                                className={`progress-fill ${isFull ? 'full' : ''}`}
                                style={{ width: `${progress}%` }}
                            />
                        </div>

                        {isFull && <span className="warning-text">Admissions Closed</span>}
                    </div>
                )}
            </div>

            <div className="divider" />

            <div className="card-actions">


                <button
                    className="icon-action-btn manage"
                    onClick={() => onManageContent(batch.id)}
                >
                    <FiLayers /> Manage
                </button>

                <div className="vertical-sep" />

                <button
                    className="icon-action-btn edit"
                    onClick={() => onEdit(batch)}
                    disabled={isCompleted}
                >
                    <FiEdit2 /> Edit
                </button>

                <div className="vertical-sep" />

                <button
                    className="icon-action-btn delete"
                    onClick={() => onDelete(batch.id)}
                >
                    <FiTrash2 /> Delete
                </button>
            </div>
        </div>
    );
};

export default BatchCard;
