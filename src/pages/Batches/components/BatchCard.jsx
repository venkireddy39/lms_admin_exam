
import React from 'react';
import { FiCalendar, FiUsers, FiUser, FiEdit2, FiTrash2, FiClock } from "react-icons/fi";
import { calculateProgress, getBatchStatus } from '../utils/batchUtils';
import { BATCH_STATUS } from '../constants/batchConstants';

const BatchCard = ({ batch, onEdit, onDelete }) => {
    const progress = calculateProgress(batch.students, batch.maxStudents);
    const isFull = batch.students >= batch.maxStudents;
    const isCompleted = batch.status === BATCH_STATUS.COMPLETED;

    // Status visual helpers
    const getStatusColor = (status) => {
        switch (status) {
            case BATCH_STATUS.UPCOMING: return "blue";
            case BATCH_STATUS.ONGOING: return "green";
            case BATCH_STATUS.COMPLETED: return "gray";
            default: return "gray";
        }
    };

    return (
        <div className={`batch-card-premium ${isCompleted ? 'completed' : ''}`}>

            {/* Header Badge */}
            <div className={`status-pill ${getStatusColor(batch.status)}`}>
                {batch.status}
            </div>

            <div className="card-content">
                <h3 className="batch-title">
                    {batch.name}
                </h3>
                <p className="course-linked">{batch.courseName || "Unknown Course"}</p>

                {/* Detailed Info */}
                <div className="info-grid">
                    <div className="info-item">
                        <FiUser className="i-icon" />
                        <span>{batch.trainer}</span>
                    </div>
                    <div className="info-item">
                        <FiCalendar className="i-icon" />
                        <span>{batch.startDate} - {batch.endDate}</span>
                    </div>
                </div>

                {/* Capacity Progress */}
                <div className="capacity-section">
                    <div className="cap-header">
                        <span className="cap-label">Enrollment Limit</span>
                        <span className={`cap-val ${isFull ? 'text-red' : ''}`}>
                            {batch.students} / {batch.maxStudents}
                        </span>
                    </div>
                    <div className="progress-track">
                        <div
                            className={`progress-fill ${isFull ? 'full' : ''}`}
                            style={{ width: `${progress}%` }}
                        ></div>
                    </div>
                    {isFull && <span className="warning-text">Admissions Closed</span>}
                </div>
            </div>

            <div className="divider"></div>

            <div className="card-actions">
                <button
                    className="icon-action-btn edit"
                    onClick={() => onEdit(batch)}
                    disabled={isCompleted}
                    title={isCompleted ? "Cannot edit completed batch" : "Edit Batch"}
                >
                    <FiEdit2 /> Edit
                </button>
                <div className="vertical-sep"></div>
                <button className="icon-action-btn delete" onClick={() => onDelete(batch.id)}>
                    <FiTrash2 /> Delete
                </button>
            </div>
        </div>
    );
};

export default BatchCard;
