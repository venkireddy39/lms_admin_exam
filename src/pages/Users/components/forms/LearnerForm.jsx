
import React, { useState } from 'react';
import { FiEye, FiEyeOff } from 'react-icons/fi';

const LearnerForm = ({ onSubmit, onCancel, initialValues }) => {
    const [formData, setFormData] = useState({
        name: initialValues?.name || '',
        email: initialValues?.email || '',
        mobile: initialValues?.mobile || '',
        password: initialValues?.password || '', // Usually blank on edit, but consistent for now
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
        onSubmit({ ...formData, role: 'Learner' });
    };

    return (
        <form onSubmit={handleSubmit} className="user-form-scroll">
            <h3 className="form-subtitle">Enter details to create learner account manually</h3>

            <div className="form-group">
                <label>Name <span className="req">*</span></label>
                <input
                    type="text"
                    name="name"
                    className="form-control"
                    placeholder="Enter learner name"
                    value={formData.name}
                    onChange={handleChange}
                    required
                />
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
