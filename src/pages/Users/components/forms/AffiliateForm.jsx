
import React, { useState } from 'react';
import { FiEye, FiEyeOff, FiSearch } from 'react-icons/fi';

const AffiliateForm = ({ onSubmit, onCancel }) => {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        mobile: '',
        password: '',
        commissionRate: 0,
        cookieDays: '',
        assignedCourses: [],
        assignedTelegram: [],
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
        onSubmit({ ...formData, role: 'Affiliate' });
    };

    return (
        <form onSubmit={handleSubmit} className="user-form-scroll">
            <h3 className="form-subtitle">Enter details to create affiliate account</h3>

            <div className="form-group">
                <label>Name <span className="req">*</span></label>
                <input type="text" name="name" className="form-control" placeholder="Enter affiliate name" value={formData.name} onChange={handleChange} required />
            </div>

            <div className="form-group">
                <label>Email <span className="req">*</span></label>
                <input type="email" name="email" className="form-control" placeholder="Enter affiliate email" value={formData.email} onChange={handleChange} required />
            </div>

            <div className="form-group">
                <label>Mobile <span className="req">*</span></label>
                <input type="tel" name="mobile" className="form-control" placeholder="Enter affiliate mobile" value={formData.mobile} onChange={handleChange} required />
            </div>

            <div className="form-group">
                <label>Password <span className="req">*</span></label>
                <div className="password-wrapper">
                    <input type={showPassword ? "text" : "password"} name="password" className="form-control" placeholder="Set password for affiliate" value={formData.password} onChange={handleChange} required />
                    <button type="button" className="eye-btn" onClick={() => setShowPassword(!showPassword)}>
                        {showPassword ? <FiEyeOff /> : <FiEye />}
                    </button>
                </div>
            </div>

            <div className="form-group">
                <label>Commission rate</label>
                <input type="number" name="commissionRate" className="form-control" value={formData.commissionRate} onChange={handleChange} />
            </div>

            <div className="form-group">
                <label>Allow commission on all courses</label>
                <p className="helper-text">Search and select courses to allow commission on</p>
                <div className="search-input-wrapper">
                    <FiSearch className="search-icon" />
                    <input type="text" placeholder="Search by course title" className="form-control pl-4" />
                </div>
            </div>

            <div className="form-group">
                <label>Allow commission on all Telegram products</label>
                <p className="helper-text">Search and select Telegram products to allow commission on</p>
                <div className="search-input-wrapper">
                    <FiSearch className="search-icon" />
                    <input type="text" placeholder="Search by telegram" className="form-control pl-4" />
                </div>
            </div>

            <div className="form-group">
                <label>Link affiliate for limited days</label>
                <p className="helper-text">Days are counted based on cookie</p>
                <input type="number" name="cookieDays" placeholder="Enter number of days" className="form-control" value={formData.cookieDays} onChange={handleChange} />
            </div>

            <div className="form-group checkbox-group">
                <input type="checkbox" id="notifyAff" name="notify" checked={formData.notify} onChange={handleChange} />
                <label htmlFor="notifyAff">
                    Send email to user
                    <small>Notify user about account creation as affiliate</small>
                </label>
            </div>

            <div className="form-actions">
                <button type="button" className="btn-cancel" onClick={onCancel}>Cancel</button>
                <button type="submit" className="btn-submit">Add Affiliate</button>
            </div>
        </form>
    );
};

export default AffiliateForm;
