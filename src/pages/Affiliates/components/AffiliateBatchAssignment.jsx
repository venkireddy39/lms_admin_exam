import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { FiSave, FiX, FiInfo, FiCheck, FiAlertCircle, FiSearch, FiChevronDown } from 'react-icons/fi';

const AffiliateBatchAssignment = ({
    affiliates = [],
    batches = [],
    initialAffiliate = null,
    onSave,
    onCancel
}) => {
    const [formData, setFormData] = useState({
        affiliateId: initialAffiliate?.id || '',
        courseId: '',
        batchId: '',
        useDefaultCommission: true,
        customCommissionType: 'PERCENT',
        customCommissionValue: '',
        status: 'ACTIVE',
        internalNotes: '',
        campaignName: '',
        studentDiscountValue: ''
    });

    const [selectedBatchDetails, setSelectedBatchDetails] = useState(null);
    const [currentAffiliate, setCurrentAffiliate] = useState(initialAffiliate);
    const [errors, setErrors] = useState({});

    // Searchable Select State
    const [searchTerm, setSearchTerm] = useState(initialAffiliate ? initialAffiliate.name : '');
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const [filteredAffiliates, setFilteredAffiliates] = useState(affiliates);

    useEffect(() => {
        if (searchTerm) {
            setFilteredAffiliates(affiliates.filter(a =>
                a.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                (a.affiliateCode && a.affiliateCode.toLowerCase().includes(searchTerm.toLowerCase()))
            ));
        } else {
            setFilteredAffiliates(affiliates);
        }
    }, [searchTerm, affiliates]);

    // Update derived state when affiliate changes
    useEffect(() => {
        if (formData.affiliateId) {
            const aff = affiliates.find(a => a.id.toString() === formData.affiliateId.toString());
            setCurrentAffiliate(aff);
        } else {
            setCurrentAffiliate(null);
        }
    }, [formData.affiliateId, affiliates]);

    // Update derived state when batch changes
    useEffect(() => {
        if (formData.batchId) {
            // Flatten batches structure for search if needed, or assume 'batches' prop is flat list or handled by parent
            // For this mock, let's assume 'batches' is an object { courseId: [batchList] } or flat array. 
            // Let's assume passed prop 'batches' is a flat list of all batches for simplicity in this form, 
            // OR we iterate through the grouped object.
            // *Correction*: In AffiliateMarketing.jsx, batches is { courseId: [] }.
            // We need to handle that. 
            // Ideally, the parent passes a flat list or we flatten it here.
            // Let's rely on finding it.
            let found = null;
            Object.values(batches).flat().forEach(b => {
                if (b.id.toString() === formData.batchId.toString()) found = b;
            });
            setSelectedBatchDetails(found);
            if (found) {
                setFormData(prev => ({ ...prev, courseId: 'Derived from Batch' })); // Placeholder or actual course ID lookup
            }
        } else {
            setSelectedBatchDetails(null);
        }
    }, [formData.batchId, batches]);

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
        // Clear errors
        if (errors[name]) setErrors(prev => ({ ...prev, [name]: '' }));
    };

    const validate = () => {
        const newErrors = {};
        if (!formData.affiliateId) newErrors.affiliateId = "Affiliate is required";
        if (currentAffiliate && currentAffiliate.status !== 'ACTIVE' && currentAffiliate.status !== 'Active') {
            newErrors.affiliateId = "Cannot assign batch to an Inactive affiliate";
        }
        if (!formData.batchId) newErrors.batchId = "Batch is required";

        if (!formData.useDefaultCommission) {
            if (!formData.customCommissionValue) {
                newErrors.customCommissionValue = "Commission value is required";
            } else {
                const val = parseFloat(formData.customCommissionValue);
                if (formData.customCommissionType === 'PERCENT' && (val <= 0 || val > 100)) {
                    newErrors.customCommissionValue = "Percentage must be between 0 and 100";
                }
                if (formData.customCommissionType === 'FIXED' && val <= 0) {
                    newErrors.customCommissionValue = "Value must be positive";
                }
            }
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const [generatedLink, setGeneratedLink] = useState(null);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setGeneratedLink(null);
        if (validate()) {
            try {
                const response = await axios.post('/api/admin/affiliate-links', {
                    affiliateId: formData.affiliateId,
                    courseId: formData.courseId === 'Derived from Batch' ? selectedBatchDetails?.courseId : formData.courseId,
                    batchId: formData.batchId,
                    commissionValue: formData.useDefaultCommission ? null : parseFloat(formData.customCommissionValue),
                    studentDiscountValue: formData.studentDiscountValue ? parseFloat(formData.studentDiscountValue) : null
                });
                setGeneratedLink(response.data.link);
                if (onSave) onSave(response.data);
            } catch (error) {
                alert('Error generating link: ' + (error.response?.data?.message || error.message));
            }
        }
    };

    return (
        <div className="card shadow-sm border-0">
            <div className="card-header bg-white border-bottom py-3 d-flex justify-content-between align-items-center">
                <h5 className="mb-0 fw-bold text-primary">Assign Batch to Affiliate</h5>
                <button type="button" className="btn-close" aria-label="Close" onClick={onCancel}></button>
            </div>
            <div className="card-body p-4">
                <form onSubmit={handleSubmit}>

                    {/* A. IDENTIFICATION */}
                    <h6 className="text-uppercase text-muted small fw-bold mb-3 ls-1">1. Assignment Details</h6>
                    <div className="row g-3 mb-4">
                        <div className="col-md-6">
                            <label className="form-label">Select Affiliate <span className="text-danger">*</span></label>
                            <div className="position-relative">
                                <div className="input-group">
                                    <span className="input-group-text bg-white border-end-0">
                                        <FiSearch className="text-muted" />
                                    </span>
                                    <input
                                        type="text"
                                        className={`form-control border-start-0 ps-0 ${errors.affiliateId ? 'is-invalid' : ''}`}
                                        placeholder="Search by Name or Code..."
                                        value={searchTerm}
                                        onChange={(e) => {
                                            setSearchTerm(e.target.value);
                                            setIsDropdownOpen(true);
                                            if (!e.target.value) setFormData(prev => ({ ...prev, affiliateId: '' }));
                                        }}
                                        onFocus={() => setIsDropdownOpen(true)}
                                    />
                                    <button
                                        className="btn btn-outline-secondary border-start-0"
                                        type="button"
                                        onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                                    >
                                        <FiChevronDown />
                                    </button>
                                </div>

                                {isDropdownOpen && (
                                    <div className="card position-absolute w-100 shadow mt-1 p-0 overflow-hidden" style={{ zIndex: 1000, maxHeight: '200px', overflowY: 'auto' }}>
                                        <ul className="list-group list-group-flush mb-0">
                                            {filteredAffiliates.length > 0 ? (
                                                filteredAffiliates.map(aff => (
                                                    <li
                                                        key={aff.id}
                                                        className={`list-group-item list-group-item-action d-flex justify-content-between align-items-center cursor-pointer ${formData.affiliateId === aff.id ? 'bg-primary bg-opacity-10 text-primary' : ''}`}
                                                        style={{ cursor: 'pointer' }}
                                                        onClick={() => {
                                                            setFormData(prev => ({ ...prev, affiliateId: aff.id }));
                                                            setSearchTerm(aff.name);
                                                            setIsDropdownOpen(false);
                                                            // Clear existing errors
                                                            if (errors.affiliateId) setErrors(prev => ({ ...prev, affiliateId: '' }));
                                                        }}
                                                    >
                                                        <div>
                                                            <div className="fw-bold fs-6">{aff.name}</div>
                                                            <div className="small text-muted">{aff.affiliateCode || 'No Code'}</div>
                                                        </div>
                                                        {aff.status && (
                                                            <span className={`badge ${aff.status === 'ACTIVE' || aff.status === 'Active' ? 'bg-success-subtle text-success' : 'bg-danger-subtle text-danger'} rounded-pill`} style={{ fontSize: '0.65rem' }}>
                                                                {aff.status}
                                                            </span>
                                                        )}
                                                    </li>
                                                ))
                                            ) : (
                                                <li className="list-group-item text-muted text-center py-3">
                                                    No affiliates found.
                                                </li>
                                            )}
                                        </ul>
                                    </div>
                                )}
                                {/* Overlay to close dropdown when clicking outside */}
                                {isDropdownOpen && (
                                    <div
                                        className="position-fixed top-0 start-0 w-100 h-100 bg-transparent"
                                        style={{ zIndex: 999 }}
                                        onClick={() => setIsDropdownOpen(false)}
                                    />
                                )}
                            </div>
                            {errors.affiliateId && <div className="invalid-feedback d-block">{errors.affiliateId}</div>}
                            {currentAffiliate && (
                                <div className={`form-text small ${currentAffiliate.status === 'ACTIVE' || currentAffiliate.status === 'Active' ? 'text-success' : 'text-danger'}`}>
                                    <i className={`bi ${currentAffiliate.status === 'ACTIVE' || currentAffiliate.status === 'Active' ? 'bi-check-circle' : 'bi-x-circle'} me-1`}></i>
                                    Status: {currentAffiliate.status}
                                </div>
                            )}
                        </div>

                        <div className="col-md-6">
                            <label className="form-label">Select Batch <span className="text-danger">*</span></label>
                            <select
                                name="batchId"
                                className={`form-select ${errors.batchId ? 'is-invalid' : ''}`}
                                value={formData.batchId}
                                onChange={handleChange}
                            >
                                <option value="">-- Choose Batch --</option>
                                {/* Flatten batches for display */}
                                {Object.entries(batches).map(([courseId, batchList]) => (
                                    <optgroup key={courseId} label={`Course ID: ${courseId}`}>
                                        {batchList.map(b => (
                                            <option key={b.id} value={b.id}>{b.name}</option>
                                        ))}
                                    </optgroup>
                                ))}
                            </select>
                            {errors.batchId && <div className="invalid-feedback">{errors.batchId}</div>}
                        </div>

                        {selectedBatchDetails && (
                            <div className="col-12 animate-fade-in">
                                <div className="alert alert-light border d-flex align-items-center gap-3">
                                    <div className="bg-primary bg-opacity-10 p-2 rounded text-primary">
                                        <FiInfo size={20} />
                                    </div>
                                    <div className="small">
                                        <div><strong>Batch:</strong> {selectedBatchDetails.name}</div>
                                        <div className="text-muted">Starts: {selectedBatchDetails.startDate} | Price: <strong>₹{selectedBatchDetails.price}</strong></div>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* B. COMMISSION CONTROL */}
                    <div className="mb-4">
                        <div className="d-flex align-items-center justify-content-between mb-3">
                            <h6 className="text-uppercase text-muted small fw-bold mb-0 ls-1">2. Commission Rules</h6>
                            <div className="form-check form-switch">
                                <input
                                    className="form-check-input"
                                    type="checkbox"
                                    id="useDefaultCommission"
                                    name="useDefaultCommission"
                                    checked={formData.useDefaultCommission}
                                    onChange={handleChange}
                                />
                                <label className="form-check-label small" htmlFor="useDefaultCommission">Use Affiliate Default</label>
                            </div>
                        </div>

                        <div className="bg-light p-3 rounded border">
                            {formData.useDefaultCommission ? (
                                <div className="text-muted small">
                                    <p className="mb-1">Applying Default Commission:</p>
                                    {currentAffiliate ? (
                                        <div className="h5 text-dark mb-0">
                                            {currentAffiliate.commissionValue}{currentAffiliate.commissionType === 'PERCENT' ? '%' : ' INR'}
                                            <span className="badge bg-secondary ms-2 text-uppercase" style={{ fontSize: '0.65rem' }}>{currentAffiliate.commissionType}</span>
                                        </div>
                                    ) : (
                                        <span className="text-danger">Select an affiliate to view defaults.</span>
                                    )}
                                </div>
                            ) : (
                                <div className="row g-3 animate-slide-down">
                                    <div className="col-md-6">
                                        <label className="form-label small fw-bold">Custom Type</label>
                                        <select
                                            name="customCommissionType"
                                            className="form-select"
                                            value={formData.customCommissionType}
                                            onChange={handleChange}
                                        >
                                            <option value="PERCENT">Percentage (%)</option>
                                            <option value="FIXED">Fixed Amount (₹)</option>
                                        </select>
                                    </div>
                                    <div className="col-md-6">
                                        <label className="form-label small fw-bold">Custom Value</label>
                                        <input
                                            type="number"
                                            name="customCommissionValue"
                                            className={`form-control ${errors.customCommissionValue ? 'is-invalid' : ''}`}
                                            value={formData.customCommissionValue}
                                            onChange={handleChange}
                                            placeholder="e.g. 20"
                                        />
                                        {errors.customCommissionValue && <div className="invalid-feedback">{errors.customCommissionValue}</div>}
                                    </div>
                                    </div>
                                )}
                            </div>

                        <div className="mt-3 p-3 bg-blue-subtle rounded border border-blue">
                             <div className="d-flex align-items-center justify-content-between mb-2">
                                <label className="form-label small fw-bold mb-0">Student Discount (%)</label>
                                <span className="badge bg-primary text-white" style={{ fontSize: '0.65rem' }}>LEAD BENEFIT</span>
                             </div>
                             <input
                                type="number"
                                name="studentDiscountValue"
                                className="form-control"
                                value={formData.studentDiscountValue}
                                onChange={handleChange}
                                placeholder="e.g. 10 (Default: 10%)"
                             />
                             <div className="form-text small opacity-75">Discount applied when student uses this link.</div>
                        </div>
                    </div>

                    {/* C. STATUS & INFO */}
                    <h6 className="text-uppercase text-muted small fw-bold mb-3 ls-1">3. Status & Tracking</h6>
                    <div className="row g-3">
                        <div className="col-md-6">
                            <label className="form-label">Assignment Status</label>
                            <select name="status" className="form-select" value={formData.status} onChange={handleChange}>
                                <option value="ACTIVE">Active</option>
                                <option value="INACTIVE">Inactive</option>
                            </select>
                        </div>
                        <div className="col-md-6">
                            <label className="form-label">Campaign / Link Label <span className="text-muted small">(Optional)</span></label>
                            <input
                                type="text"
                                name="campaignName"
                                className="form-control"
                                placeholder="e.g. Summer-2024-Promo"
                                value={formData.campaignName}
                                onChange={handleChange}
                            />
                        </div>
                        <div className="col-12">
                            <label className="form-label">Internal Notes</label>
                            <textarea
                                name="internalNotes"
                                rows="2"
                                className="form-control"
                                placeholder="Admin only notes..."
                                value={formData.internalNotes}
                                onChange={handleChange}
                            ></textarea>
                        </div>
                    </div>

                    {generatedLink && (
                        <div className="mt-4 p-3 bg-success bg-opacity-10 border border-success border-opacity-25 rounded animate-fade-in">
                            <label className="form-label small fw-bold text-success mb-2">Referral Link Generated!</label>
                            <div className="input-group">
                                <input 
                                    type="text" 
                                    className="form-control border-success text-success fw-bold" 
                                    value={generatedLink} 
                                    readOnly 
                                />
                                <button 
                                    className="btn btn-success" 
                                    type="button"
                                    onClick={() => {
                                        navigator.clipboard.writeText(generatedLink);
                                        alert('Link copied to clipboard!');
                                    }}
                                >
                                    Copy Link
                                </button>
                            </div>
                            <div className="form-text text-success small">Share this link with the affiliate to track their leads.</div>
                        </div>
                    )}

                    <div className="d-flex justify-content-end gap-2 mt-4 pt-3 border-top">
                        <button type="button" className="btn btn-light" onClick={onCancel}>Cancel</button>
                        <button type="submit" className="btn btn-primary px-4 fw-bold">
                            <FiSave className="me-2" />
                            {generatedLink ? 'Regenerate Link' : 'Save Assignment'}
                        </button>
                    </div>

                </form>
            </div>
        </div>
    );
};

export default AffiliateBatchAssignment;
