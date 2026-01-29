import React from 'react';
import { FiX } from "react-icons/fi";

const BatchModal = ({
    isOpen,
    onClose,
    formData,
    handleInputChange,
    handleSave,
    isEdit,
    courses = [],
    instructors = []
}) => {
    if (!isOpen) return null;

    return (
        <div className="modal-overlay-fixed">
            <div className="modal-box premium-modal">
                <div className="modal-head">
                    <h2>{isEdit ? 'Edit Batch' : 'Create New Batch'}</h2>
                    <button className="close-btn" onClick={onClose}>
                        <FiX size={24} />
                    </button>
                </div>

                <div className="modal-body">
                    <p className="modal-subtitle">
                        Configure batch schedule and pricing.
                    </p>

                    <div className="form-group-grid">

                        {/* Course */}
                        <div className="form-field full-width">
                            <label>Course <span className="req">*</span></label>
                            <select
                                className="form-select"
                                name="courseId"
                                value={formData.courseId}
                                onChange={handleInputChange}
                                disabled={isEdit}
                            >
                                <option value="">Select a course</option>
                                {courses.map(course => (
                                    <option key={course.courseId} value={course.courseId}>
                                        {course.courseName}
                                    </option>
                                ))}
                            </select>
                            {isEdit && (
                                <span className="helper-text">
                                    Course cannot be changed after creation.
                                </span>
                            )}
                        </div>

                        {/* Batch Name */}
                        <div className="form-field full-width">
                            <label>Batch Name <span className="req">*</span></label>
                            <input
                                type="text"
                                className="form-input"
                                name="batchName"
                                value={formData.batchName}
                                onChange={handleInputChange}
                                placeholder="e.g. React Morning Batch A"
                            />
                        </div>

                        {/* Trainer */}
                        <div className="form-field full-width">
                            <label>Assigned Instructor</label>
                            <select
                                className="form-select"
                                name="trainerId"
                                value={formData.trainerId || ""}
                                onChange={(e) => {
                                    const selectedId = e.target.value;
                                    const instructor = instructors.find(i => String(i.id || i.userId) === String(selectedId));
                                    handleInputChange({
                                        target: {
                                            name: 'trainerId',
                                            value: selectedId
                                        }
                                    });
                                    handleInputChange({
                                        target: {
                                            name: 'trainerName',
                                            value: instructor ? instructor.name : ""
                                        }
                                    });
                                }}
                            >
                                <option value="">Select an instructor</option>
                                {instructors.map(inst => (
                                    <option key={inst.id || inst.userId || Math.random()} value={inst.id || inst.userId}>
                                        {inst.name || "Unknown Name"} {inst.role ? `(${inst.role})` : ""}
                                    </option>
                                ))}
                            </select>
                        </div>

                        {/* Dates */}
                        <div className="form-row-split">
                            <div className="form-field">
                                <label>Start Date <span className="req">*</span></label>
                                <input
                                    type="date"
                                    className="form-input"
                                    name="startDate"
                                    value={formData.startDate}
                                    onChange={handleInputChange}
                                />
                            </div>

                            <div className="form-field">
                                <label>End Date <span className="req">*</span></label>
                                <input
                                    type="date"
                                    className="form-input"
                                    name="endDate"
                                    value={formData.endDate}
                                    onChange={handleInputChange}
                                />
                            </div>
                        </div>

                        {/* Max Students */}
                        <div className="form-field full-width">
                            <label>Batch Limit (Max Students)</label>
                            <input
                                type="number"
                                className="form-input"
                                name="maxStudents"
                                value={formData.maxStudents || ''}
                                onChange={handleInputChange}
                                placeholder="e.g. 50"
                            />
                        </div>

                    </div>
                </div>

                <div className="modal-footer">
                    <button className="btn-secondary" onClick={onClose}>Cancel</button>
                    <button className="btn-primary" onClick={handleSave}>
                        {isEdit ? 'Update Batch' : 'Create Batch'}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default BatchModal;
