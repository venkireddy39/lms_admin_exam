import React from 'react';
import { FiCalendar, FiEdit2, FiTrash2, FiLayers, FiUser } from "react-icons/fi";
import { calculateProgress } from '../utils/batchUtils';
import { BATCH_STATUS } from '../constants/batchConstants';

const getStatusBadge = (status) => {
    switch (status) {
        case BATCH_STATUS.UPCOMING: return 'bg-primary';
        case BATCH_STATUS.ONGOING: return 'bg-success';
        case BATCH_STATUS.COMPLETED: return 'bg-secondary';
        default: return 'bg-dark';
    }
};

const BatchCard = ({ batch, courses = [], onEdit, onDelete, onManageContent }) => {
    const bCourseId = String(batch?.courseId || batch?.course_id || "");
    const course = courses.find(c => String(c?.courseId || c?.course_id || c?.id || "") === bCourseId) ||
        courses.find(c => c?.courseName?.trim() && batch?.courseName?.trim() && c.courseName.trim() === batch.courseName.trim());

    const students = batch.students ?? 0;
    const maxStudents = batch.maxStudents ?? 0;
    const progress = maxStudents > 0 ? calculateProgress(students, maxStudents) : 0;
    const isFull = maxStudents > 0 && students >= maxStudents;
    const isCompleted = batch.status === BATCH_STATUS.COMPLETED;
    const isFree = !batch.fee || Number(batch.fee) === 0;

    return (
        <div className="card h-100 shadow-sm border-0 rounded-4 d-flex flex-column">

            {/* Color top bar */}
            <div className={`rounded-top-4 ${getStatusBadge(batch.status)}`} style={{ height: 5 }} />

            <div className="card-body d-flex flex-column pb-2">

                {/* Header row */}
                <div className="d-flex justify-content-between align-items-start mb-2">
                    <div className="flex-grow-1 me-2">
                        <h6 className="fw-bold mb-0 text-dark">{batch.batchName}</h6>
                        <small className="text-muted">
                            {course?.courseName || batch?.courseName || 'Unassigned Course'}
                        </small>
                    </div>
                    <span className={`badge ${getStatusBadge(batch.status)} text-uppercase`} style={{ fontSize: 10, whiteSpace: 'nowrap' }}>
                        {batch.status}
                    </span>
                </div>

                {/* Dates */}
                <div className="d-flex align-items-center gap-1 text-muted small mb-1">
                    <FiCalendar size={12} />
                    <span>{batch.startDate} – {batch.endDate}</span>
                </div>

                {/* Instructor */}
                {batch.trainerName && (
                    <div className="d-flex align-items-center gap-1 text-muted small mb-2">
                        <FiUser size={12} />
                        <span>{batch.trainerName}</span>
                    </div>
                )}

                {/* Fee + Access badges */}
                <div className="d-flex gap-2 flex-wrap mb-2">
                    <span className={`badge ${isFree ? 'bg-success-subtle text-success border border-success-subtle' : 'bg-light text-dark border'}`}
                        style={{ fontSize: 11 }}>
                        {isFree ? '🆓 Free' : `₹${Number(batch.fee).toLocaleString()}`}
                    </span>
                    {batch.contentAccess && (
                        <span className="badge bg-info-subtle text-info border border-info-subtle" style={{ fontSize: 11 }}>
                            Content Access
                        </span>
                    )}
                </div>

                {/* Capacity */}
                {maxStudents > 0 && (
                    <div className="mt-auto mb-1">
                        <div className="d-flex justify-content-between small text-muted mb-1">
                            <span>Enrollment</span>
                            <span className={isFull ? 'text-danger fw-bold' : 'fw-semibold'}>
                                {students} / {maxStudents}
                            </span>
                        </div>
                        <div className="progress" style={{ height: 5 }}>
                            <div
                                className={`progress-bar ${isFull ? 'bg-danger' : 'bg-primary'}`}
                                style={{ width: `${progress}%` }}
                            />
                        </div>
                        {isFull && <small className="text-danger">Admissions Closed</small>}
                    </div>
                )}
            </div>

            {/* Footer actions — always visible */}
            <div className="card-footer bg-white border-top d-flex gap-2 pt-2 pb-3 rounded-bottom-4">
                <button
                    className="btn btn-outline-primary btn-sm flex-fill d-flex align-items-center justify-content-center gap-1"
                    onClick={() => onManageContent(batch.id)}
                    title="Manage"
                >
                    <FiLayers size={13} /> Manage
                </button>
                <button
                    className="btn btn-outline-secondary btn-sm flex-fill d-flex align-items-center justify-content-center gap-1"
                    onClick={() => onEdit(batch)}
                    disabled={isCompleted}
                    title="Edit"
                >
                    <FiEdit2 size={13} /> Edit
                </button>
                <button
                    className="btn btn-outline-danger btn-sm flex-fill d-flex align-items-center justify-content-center gap-1"
                    onClick={() => onDelete(batch.id)}
                    title="Delete"
                >
                    <FiTrash2 size={13} /> Delete
                </button>
            </div>
        </div>
    );
};

export default BatchCard;
