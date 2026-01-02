
import React from 'react';
import { FiX } from "react-icons/fi";
import { COURSE_TYPES } from '../constants/courseConstants';

const CourseModal = ({
    isOpen,
    onClose,
    step,
    setStep,
    formData,
    handleInputChange,
    handleImageChange,
    handleSave,
    isEdit
}) => {
    if (!isOpen) return null;

    return (
        <div className="modal-overlay-fixed">
            <div className="modal-box">
                <div className="modal-head">
                    <h2>{isEdit ? 'Edit Course' : 'Add New Course'}</h2>
                    <button className="modal-close-btn" onClick={onClose}>
                        <FiX size={20} />
                    </button>
                </div>

                <div className="modal-body">
                    <h5 className="mb-3 text-primary" style={{ color: '#0f172a', marginBottom: '20px', fontWeight: 600 }}>
                        {step === 1 ? "Course Details" : "Mentor Details"}
                    </h5>

                    {step === 1 && (
                        <div className="form-section">
                            <div className="form-field">
                                <label>Course Name</label>
                                <input
                                    type="text"
                                    className="form-input"
                                    name="name"
                                    value={formData.name}
                                    onChange={handleInputChange}
                                    placeholder="e.g. Advanced React Patterns"
                                />
                            </div>

                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                                <div className="form-field">
                                    <label>Trainer Name</label>
                                    <input
                                        type="text"
                                        className="form-input"
                                        name="trainer"
                                        value={formData.trainer}
                                        onChange={handleInputChange}
                                    />
                                </div>
                                <div className="form-field">
                                    <label>Course Type</label>
                                    <select
                                        className="form-input"
                                        name="courseType"
                                        value={formData.courseType}
                                        onChange={handleInputChange}
                                    >
                                        <option value="">Select Type</option>
                                        <option value={COURSE_TYPES.FREE}>{COURSE_TYPES.FREE}</option>
                                        <option value={COURSE_TYPES.PAID}>{COURSE_TYPES.PAID}</option>
                                    </select>
                                </div>
                            </div>

                            {formData.courseType === COURSE_TYPES.PAID && (
                                <div className="form-field">
                                    <label>Price (₹)</label>
                                    <input
                                        type="number"
                                        className="form-input"
                                        name="price"
                                        value={formData.price}
                                        onChange={handleInputChange}
                                    />
                                </div>
                            )}

                            <div className="form-field">
                                <label>Description</label>
                                <textarea
                                    className="form-input"
                                    rows="3"
                                    name="desc"
                                    value={formData.desc}
                                    onChange={handleInputChange}
                                    style={{ fontFamily: 'inherit' }}
                                ></textarea>
                            </div>

                            <div className="form-field">
                                <label>Cover Image</label>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                    {formData.imgPreview && (
                                        <img
                                            src={formData.imgPreview}
                                            alt="Preview"
                                            style={{ width: 60, height: 60, borderRadius: 8, objectFit: 'cover' }}
                                        />
                                    )}
                                    <input
                                        type="file"
                                        className="form-input"
                                        accept="image/*"
                                        onChange={handleImageChange}
                                    />
                                </div>
                            </div>
                        </div>
                    )}

                    {step === 2 && (
                        <div className="form-section">
                            <div className="form-field">
                                <label>Mentor Name</label>
                                <input
                                    type="text"
                                    className="form-input"
                                    name="mentorName"
                                    value={formData.mentorName}
                                    onChange={handleInputChange}
                                />
                            </div>
                            <div className="form-field">
                                <label>Mentor ID</label>
                                <input
                                    type="text"
                                    className="form-input"
                                    name="mentorId"
                                    value={formData.mentorId}
                                    onChange={handleInputChange}
                                />
                            </div>
                            <div className="form-field">
                                <label>Mentor Phone</label>
                                <input
                                    type="tel"
                                    className="form-input"
                                    name="mentorPhone"
                                    value={formData.mentorPhone}
                                    onChange={handleInputChange}
                                />
                            </div>
                        </div>
                    )}

                    <div className="form-footer">
                        {step === 2 && (
                            <button className="btn-secondary" onClick={() => setStep(1)}>Back</button>
                        )}
                        {step === 1 ? (
                            <button className="btn-primary" onClick={() => setStep(2)}>Next</button>
                        ) : (
                            <button className="btn-primary" onClick={handleSave}>
                                {isEdit ? 'Update Course' : 'Create Course'}
                            </button>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CourseModal;
