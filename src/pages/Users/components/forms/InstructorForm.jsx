
import React, { useState } from 'react';
import { FiEye, FiEyeOff, FiSearch } from 'react-icons/fi';
import { INSTRUCTOR_PERMISSIONS_LIST } from '../../constants/userConstants';

const InstructorForm = ({ onSubmit, onCancel }) => {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        mobile: '',
        password: '',
        assignedCourses: [],
        permissions: {},
        notify: false
    });
    const [showPassword, setShowPassword] = useState(false);
    const [courseSearch, setCourseSearch] = useState("");

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
    };

    const handlePermissionChange = (perm) => {
        setFormData(prev => ({
            ...prev,
            permissions: {
                ...prev.permissions,
                [perm]: !prev.permissions[perm]
            }
        }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        onSubmit({ ...formData, role: 'Instructor' });
    };

    return (
        <form onSubmit={handleSubmit} className="user-form-scroll">
            <h3 className="form-subtitle">Enter details to create instructor account</h3>

            <div className="form-group">
                <label>Name <span className="req">*</span></label>
                <input type="text" name="name" className="form-control" placeholder="Enter instructor name" value={formData.name} onChange={handleChange} required />
            </div>

            <div className="form-group">
                <label>Email <span className="req">*</span></label>
                <input type="email" name="email" className="form-control" placeholder="Enter instructor email" value={formData.email} onChange={handleChange} required />
            </div>

            <div className="form-group">
                <label>Mobile <span className="req">*</span></label>
                <input type="tel" name="mobile" className="form-control" placeholder="Enter instructor mobile" value={formData.mobile} onChange={handleChange} required />
            </div>

            <div className="form-group">
                <label>Password <span className="req">*</span></label>
                <div className="password-wrapper">
                    <input type={showPassword ? "text" : "password"} name="password" className="form-control" placeholder="Set password for instructor" value={formData.password} onChange={handleChange} required />
                    <button type="button" className="eye-btn" onClick={() => setShowPassword(!showPassword)}>
                        {showPassword ? <FiEyeOff /> : <FiEye />}
                    </button>
                </div>
            </div>

            <div className="form-group">
                <label>Assign courses</label>
                <p className="helper-text">Instructor will have access to only assigned courses</p>
                <div className="search-input-wrapper">
                    <FiSearch className="search-icon" />
                    <input
                        type="text"
                        placeholder="Search by course title"
                        className="form-control pl-4"
                        value={courseSearch}
                        onChange={(e) => setCourseSearch(e.target.value)}
                    />
                </div>
            </div>

            <div className="form-group checkbox-group">
                <input type="checkbox" id="notifyInst" name="notify" checked={formData.notify} onChange={handleChange} />
                <label htmlFor="notifyInst">
                    Send email to user
                    <small>Notify user about account creation as instructor</small>
                </label>
            </div>

            <div className="divider"></div>

            <div className="permissions-section">
                <h4>Set Permission</h4>
                <div className="perm-list simple">
                    {INSTRUCTOR_PERMISSIONS_LIST.map((perm, idx) => (
                        <div key={idx} className="perm-item">
                            <input
                                type="checkbox"
                                id={`inst-perm-${idx}`}
                                checked={!!formData.permissions[perm]}
                                onChange={() => handlePermissionChange(perm)}
                            />
                            <label htmlFor={`inst-perm-${idx}`}>{perm}</label>
                        </div>
                    ))}
                </div>
            </div>

            <div className="form-actions">
                <button type="button" className="btn-cancel" onClick={onCancel}>Cancel</button>
                <button type="submit" className="btn-submit">Add Instructor</button>
            </div>
        </form>
    );
};

export default InstructorForm;
