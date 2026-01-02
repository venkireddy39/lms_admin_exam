
import React from 'react';
import { FiX, FiInfo } from "react-icons/fi";
import { MOCK_COURSES } from '../../../data/mockCourses';

const BatchModal = ({ isOpen, onClose, formData, handleInputChange, handleSave, isEdit }) => {
    if (!isOpen) return null;

    return (
        <div className="modal-overlay-fixed">
            <div className="modal-box premium-modal">
                <div className="modal-head">
                    <h2>{isEdit ? 'Edit Batch Details' : 'Create New Batch'}</h2>
                    <button className="close-btn" onClick={onClose}>
                        <FiX size={24} />
                    </button>
                </div>

                <div className="modal-body">
                    <p className="modal-subtitle">
                        Configure batch schedule and capacity. Status is automatically derived from dates.
                    </p>

                    <div className="form-group-grid">

                        {/* Row 1: Course (Linked) */}
                        <div className="form-field full-width">
                            <label>Course Name <span className="req">*</span></label>
                            <select
                                className="form-select"
                                name="courseId"
                                value={formData.courseId}
                                onChange={handleInputChange}
                                disabled={isEdit} // Optional: Lock course on edit
                            >
                                <option value="">Select a Course</option>
                                {MOCK_COURSES.map(course => (
                                    <option key={course.id} value={course.id}>
                                        {course.name}
                                    </option>
                                ))}
                            </select>
                            {isEdit && <span className="helper-text">Course cannot be changed once batch is created.</span>}
                        </div>

                        {/* Row 2: Batch Name */}
                        <div className="form-field full-width">
                            <label>Batch Name (Identifier) <span className="req">*</span></label>
                            <input
                                type="text"
                                className="form-input"
                                name="name"
                                value={formData.name}
                                onChange={handleInputChange}
                                placeholder="e.g. React Morning Batch A"
                            />
                        </div>

                        {/* Row 3: Trainer & Capacity */}
                        <div className="form-row-split">
                            <div className="form-field">
                                <label>Assigned Trainer <span className="req">*</span></label>
                                <input
                                    type="text"
                                    className="form-input"
                                    name="trainer"
                                    value={formData.trainer}
                                    onChange={handleInputChange}
                                    placeholder="Instructor Name"
                                />
                            </div>
                            <div className="form-field">
                                <label>Max Students <span className="req">*</span></label>
                                <input
                                    type="number"
                                    className="form-input"
                                    name="maxStudents"
                                    value={formData.maxStudents}
                                    onChange={handleInputChange}
                                    min="1"
                                />
                            </div>
                        </div>

                        {/* Row 4: Dates */}
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

                        {/* Info Block */}
                        <div className="info-block">
                            <FiInfo size={16} />
                            <span>
                                Batch status (Upcoming, Ongoing, Completed) will be set automatically based on the selected dates.
                            </span>
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
