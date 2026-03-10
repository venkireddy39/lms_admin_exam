import React, { useState } from 'react';
import { FiUser, FiMail, FiLock, FiPhone, FiChevronRight } from 'react-icons/fi';
import './AffiliateForm.css';

const AffiliateForm = ({ onSubmit, onCancel, initialValues }) => {
    const [formData, setFormData] = useState({
        firstName: initialValues?.firstName || '',
        lastName: initialValues?.lastName || '',
        email: initialValues?.email || '',
        mobile: initialValues?.mobile || initialValues?.phone || '',
        password: '',
        role: 'Affiliate'
    });

    const [loading, setLoading] = useState(false);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            await onSubmit(formData);
        } finally {
            setLoading(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="affiliate-simple-form pt-2">
            <div className="form-section-header mb-4">
                <h5 className="fw-bold text-dark d-flex align-items-center gap-2">
                    <FiUser className="text-primary" /> 
                    Affiliate Partner Identity
                </h5>
                <p className="text-muted small">Create a specialized affiliate account using standard user credentials.</p>
            </div>

            <div className="row g-3">
                <div className="col-md-6">
                    <div className="form-group mb-3">
                        <label className="form-label small fw-bold text-secondary">FIRST NAME</label>
                        <div className="input-group">
                            <span className="input-group-text bg-white border-end-0"><FiUser size={16} /></span>
                            <input
                                type="text"
                                name="firstName"
                                className="form-control border-start-0 ps-0"
                                placeholder="Enter first name"
                                value={formData.firstName}
                                onChange={handleChange}
                                required
                            />
                        </div>
                    </div>
                </div>

                <div className="col-md-6">
                    <div className="form-group mb-3">
                        <label className="form-label small fw-bold text-secondary">LAST NAME</label>
                        <div className="input-group">
                            <span className="input-group-text bg-white border-end-0"><FiUser size={16} /></span>
                            <input
                                type="text"
                                name="lastName"
                                className="form-control border-start-0 ps-0"
                                placeholder="Enter last name"
                                value={formData.lastName}
                                onChange={handleChange}
                                required
                            />
                        </div>
                    </div>
                </div>

                <div className="col-12">
                    <div className="form-group mb-3">
                        <label className="form-label small fw-bold text-secondary">EMAIL ADDRESS</label>
                        <div className="input-group">
                            <span className="input-group-text bg-white border-end-0"><FiMail size={16} /></span>
                            <input
                                type="email"
                                name="email"
                                className="form-control border-start-0 ps-0"
                                placeholder="name@company.com"
                                value={formData.email}
                                onChange={handleChange}
                                required
                            />
                        </div>
                    </div>
                </div>

                <div className="col-md-6">
                    <div className="form-group mb-3">
                        <label className="form-label small fw-bold text-secondary">MOBILE NUMBER</label>
                        <div className="input-group">
                            <span className="input-group-text bg-white border-end-0"><FiPhone size={16} /></span>
                            <input
                                type="tel"
                                name="mobile"
                                className="form-control border-start-0 ps-0"
                                placeholder="+91 00000 00000"
                                value={formData.mobile}
                                onChange={handleChange}
                                required
                            />
                        </div>
                    </div>
                </div>

                <div className="col-md-6">
                    <div className="form-group mb-3">
                        <label className="form-label small fw-bold text-secondary">SET PASSWORD</label>
                        <div className="input-group">
                            <span className="input-group-text bg-white border-end-0"><FiLock size={16} /></span>
                            <input
                                type="password"
                                name="password"
                                className="form-control border-start-0 ps-0"
                                placeholder="••••••••"
                                value={formData.password}
                                onChange={handleChange}
                                required={!initialValues}
                            />
                        </div>
                    </div>
                </div>
            </div>

            <div className="alert alert-soft-primary small border-0 mt-4 d-flex align-items-center gap-2">
                <FiChevronRight className="text-primary" />
                <span>Wallet and commission settings will be automatically initialized upon creation.</span>
            </div>

            <div className="d-flex gap-2 justify-content-end mt-4 pt-3 border-top">
                <button type="button" className="btn btn-outline-secondary px-4 rounded-3" onClick={onCancel}>Cancel</button>
                <button 
                  type="submit" 
                  className="btn btn-primary px-4 fw-bold rounded-3 shadow-sm d-flex align-items-center gap-2"
                  disabled={loading}
                >
                    {loading ? 'Creating...' : 'Create Affiliate Account'}
                </button>
            </div>
        </form>
    );
};

export default AffiliateForm;

