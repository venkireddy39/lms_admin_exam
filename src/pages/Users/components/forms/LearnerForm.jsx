
import React, { useState } from 'react';
import { FiEye, FiEyeOff } from 'react-icons/fi';

const LearnerForm = ({ onSubmit, onCancel, initialValues }) => {
    // Helper to handle name splitting if only full name is provided
    const splitName = (fullName) => {
        if (!fullName) return { first: '', last: '' };
        const parts = fullName.split(' ');
        const first = parts[0];
        const last = parts.slice(1).join(' ');
        return { first, last };
    };

    const initialNames = initialValues?.firstName
        ? { first: initialValues.firstName, last: initialValues.lastName }
        : splitName(initialValues?.name);

    const [formData, setFormData] = useState({
        firstName: initialNames.first || '',
        lastName: initialNames.last || '',
        email: initialValues?.email || '',
        mobile: initialValues?.mobile || initialValues?.phone || '',
        password: initialValues?.password || '',
        dob: initialValues?.dob || '',
        gender: initialValues?.gender || '',
        notify: false
    });

    const [showPassword, setShowPassword] = useState(false);

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        const payload = {
            ...formData,
            // Construct full name for backward compatibility
            name: `${formData.firstName} ${formData.lastName}`.trim(),
            // Map mobile to phone if needed by backend, or keep both
            phone: formData.mobile,
            role: 'Learner', // Maps to Student
            // Carry forward batchId if pre-filled from a lead
            batchId: initialValues?.batchId || undefined
        };
        onSubmit(payload);
    };

    return (
        <form onSubmit={handleSubmit} className="user-form-scroll">
            <h3 className="form-subtitle">Enter details to create learner account</h3>

            <div className="form-row" style={{ display: 'flex', gap: '15px' }}>
                <div className="form-group" style={{ flex: 1 }}>
                    <label>First Name <span className="req">*</span></label>
                    <input
                        type="text"
                        name="firstName"
                        className="form-control"
                        placeholder="First Name"
                        value={formData.firstName}
                        onChange={handleChange}
                        required
                    />
                </div>
                <div className="form-group" style={{ flex: 1 }}>
                    <label>Last Name <span className="req">*</span></label>
                    <input
                        type="text"
                        name="lastName"
                        className="form-control"
                        placeholder="Last Name"
                        value={formData.lastName}
                        onChange={handleChange}
                        required
                    />
                </div>
            </div>

            <div className="form-group">
                <label>Email <span className="req">*</span></label>
                <input
                    type="email"
                    name="email"
                    className="form-control"
                    placeholder="Enter learner email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                />
            </div>

            <div className="form-group">
                <label>Mobile <span className="req">*</span></label>
                <div className="phone-input">
                    <span className="country-code">+91</span>
                    <input
                        type="tel"
                        name="mobile"
                        className="form-control"
                        value={formData.mobile}
                        onChange={handleChange}
                        required
                    />
                </div>
            </div>

            <div className="form-row" style={{ display: 'flex', gap: '15px' }}>
                <div className="form-group" style={{ flex: 1 }}>
                    <label>Date of Birth</label>
                    <input
                        type="date"
                        name="dob"
                        className="form-control"
                        value={formData.dob}
                        onChange={handleChange}
                    />
                </div>
                <div className="form-group" style={{ flex: 1 }}>
                    <label>Gender</label>
                    <select
                        name="gender"
                        className="form-control"
                        value={formData.gender}
                        onChange={handleChange}
                    >
                        <option value="">Select Gender</option>
                        <option value="MALE">Male</option>
                        <option value="FEMALE">Female</option>
                        <option value="OTHER">Other</option>
                    </select>
                </div>
            </div>

            <div className="form-group">
                <label>Password <span className="req">*</span></label>
                <div className="password-wrapper">
                    <input
                        type={showPassword ? "text" : "password"}
                        name="password"
                        className="form-control"
                        placeholder="Set password for learner"
                        value={formData.password}
                        onChange={handleChange}
                        required
                    />
                    <button type="button" className="eye-btn" onClick={() => setShowPassword(!showPassword)}>
                        {showPassword ? <FiEyeOff /> : <FiEye />}
                    </button>
                </div>
            </div>

            <div className="form-group checkbox-group">
                <input
                    type="checkbox"
                    id="notify"
                    name="notify"
                    checked={formData.notify}
                    onChange={handleChange}
                />
                <label htmlFor="notify">
                    Send email to user
                    <small>Notify user about account creation as learner</small>
                </label>
            </div>

            <div className="form-actions">
                <button type="button" className="btn-cancel" onClick={onCancel}>Cancel</button>
                <button type="submit" className="btn-submit">Add Learner</button>
            </div>
        </form>
    );
};

export default LearnerForm;
