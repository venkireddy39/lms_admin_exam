
import React, { useState } from 'react';
import { FiEye, FiEyeOff } from 'react-icons/fi';
import { ADMIN_PERMISSIONS_LIST } from '../../constants/userConstants';

const AdminForm = ({ onSubmit, onCancel }) => {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        mobile: '',
        password: '',
        roleType: 'Super Admin', // Super Admin | Sub Admin
        permissions: {},
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
        onSubmit({ ...formData, role: 'Admin' });
    };

    return (
        <form onSubmit={handleSubmit} className="user-form-scroll">
            <h3 className="form-subtitle">Enter details to create admin account</h3>

            <div className="form-group">
                <label>Name <span className="req">*</span></label>
                <input type="text" name="name" className="form-control" placeholder="Enter admin name" value={formData.name} onChange={handleChange} required />
            </div>

            <div className="form-group">
                <label>Email <span className="req">*</span></label>
                <input type="email" name="email" className="form-control" placeholder="Enter admin email" value={formData.email} onChange={handleChange} required />
            </div>

            <div className="form-group">
                <label>Mobile <span className="req">*</span></label>
                <input type="tel" name="mobile" className="form-control" placeholder="Enter admin mobile" value={formData.mobile} onChange={handleChange} required />
            </div>

            <div className="form-group">
                <label>Password <span className="req">*</span></label>
                <div className="password-wrapper">
                    <input type={showPassword ? "text" : "password"} name="password" className="form-control" placeholder="Set password for admin" value={formData.password} onChange={handleChange} required />
                    <button type="button" className="eye-btn" onClick={() => setShowPassword(!showPassword)}>
                        {showPassword ? <FiEyeOff /> : <FiEye />}
                    </button>
                </div>
            </div>

            <div className="form-group checkbox-group">
                <input type="checkbox" id="notifyAdmin" name="notify" checked={formData.notify} onChange={handleChange} />
                <label htmlFor="notifyAdmin">
                    Send email to user
                    <small>Notify user about account creation as admin</small>
                </label>
            </div>

            <div className="divider"></div>

            <div className="form-group">
                <label>Select Role</label>
                <div className="role-options">
                    <label className={`role-card ${formData.roleType === 'Super Admin' ? 'selected' : ''}`}>
                        <input
                            type="radio"
                            name="roleType"
                            value="Super Admin"
                            checked={formData.roleType === 'Super Admin'}
                            onChange={handleChange}
                        />
                        <div className="role-info">
                            <strong>Super Admin</strong>
                            <span>Grant complete access</span>
                        </div>
                    </label>
                    <label className={`role-card ${formData.roleType === 'Sub Admin' ? 'selected' : ''}`}>
                        <input
                            type="radio"
                            name="roleType"
                            value="Sub Admin"
                            checked={formData.roleType === 'Sub Admin'}
                            onChange={handleChange}
                        />
                        <div className="role-info">
                            <strong>Sub Admin</strong>
                            <span>Limited access with customizable permission</span>
                        </div>
                    </label>
                </div>
            </div>

            {formData.roleType === 'Sub Admin' && (
                <div className="permissions-section">
                    <h4>Set Permission</h4>
                    {ADMIN_PERMISSIONS_LIST.map((cat, idx) => (
                        <div key={idx} className="perm-category">
                            <h5>{cat.category}</h5>
                            <div className="perm-list">
                                {cat.permissions.map((perm, pIdx) => (
                                    <div key={pIdx} className="perm-item">
                                        <input
                                            type="checkbox"
                                            id={`perm-${idx}-${pIdx}`}
                                            checked={!!formData.permissions[perm]}
                                            onChange={() => handlePermissionChange(perm)}
                                        />
                                        <label htmlFor={`perm-${idx}-${pIdx}`}>{perm}</label>
                                    </div>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>
            )}

            <div className="form-actions">
                <button type="button" className="btn-cancel" onClick={onCancel}>Cancel</button>
                <button type="submit" className="btn-submit">Add Admin</button>
            </div>
        </form>
    );
};

export default AdminForm;
