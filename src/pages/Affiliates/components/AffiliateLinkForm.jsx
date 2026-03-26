import React, { useState, useEffect } from 'react';
import {
    FiLink, FiSearch, FiChevronDown, FiInfo, FiPercent, FiCopy, FiCheckCircle,
    FiUser, FiPackage, FiZap, FiExternalLink, FiPlus
} from 'react-icons/fi';
import affiliateService from '../../../services/affiliateService';
import { courseService } from '../../Courses/services/courseService';
import { batchService } from '../../Batches/services/batchService';
import { userService } from '../../Users/services/userService';

const AffiliateLinkForm = ({ onSave, onCancel, initialAffiliate = null }) => {
    const [formData, setFormData] = useState({
        affiliateId: initialAffiliate?.id || '',
        courseId: '',
        batchId: '',
        commissionPercentage: initialAffiliate?.commissionValue || 20,
        studentDiscountPercentage: 10,
        expiresAt: ''
    });

    const [affiliates, setAffiliates] = useState([]);
    const [courses, setCourses] = useState([]);
    const [batches, setBatches] = useState([]);
    const [loading, setLoading] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [generatedLink, setGeneratedLink] = useState(null);
    const [copied, setCopied] = useState(false);
    const [error, setError] = useState('');

    const [affSearch, setAffSearch] = useState(initialAffiliate?.name || '');
    const [isAffOpen, setIsAffOpen] = useState(false);
    const [selectedAffiliate, setSelectedAffiliate] = useState(initialAffiliate);

    const [courseSearch, setCourseSearch] = useState('');
    const [isCourseOpen, setIsCourseOpen] = useState(false);

    const [batchSearch, setBatchSearch] = useState('');
    const [isBatchOpen, setIsBatchOpen] = useState(false);

    useEffect(() => { fetchInitialData(); }, []);
    useEffect(() => {
        if (initialAffiliate) { setSelectedAffiliate(initialAffiliate); setAffSearch(initialAffiliate.name); }
    }, [initialAffiliate]);

    useEffect(() => {
        if (formData.courseId) fetchBatches(formData.courseId);
        else { setBatches([]); setBatchSearch(''); setFormData(p => ({ ...p, batchId: '' })); }
    }, [formData.courseId]);

    const fetchInitialData = async () => {
        setLoading(true);
        try {
            const [affData, crsData, usrData] = await Promise.all([
                affiliateService.getAllAffiliates().catch(() => []),
                courseService.getCourses().catch(() => []),
                userService.getAllUsers().catch(() => [])
            ]);

            const rawAff = Array.isArray(affData) ? affData : (affData?.data || []);
            const rawCrs = Array.isArray(crsData) ? crsData : (crsData?.data || crsData?.courses || []);
            const rawUsr = Array.isArray(usrData) ? usrData : (usrData?.data || []);

            const mapped = rawAff.map(a => ({
                id: a.id, name: a.name || a.username || `Partner #${a.id}`,
                email: a.email || '', commissionValue: a.commissionValue || 15,
                affiliateCode: a.code || a.affiliateCode, isRealAffiliate: true
            }));

            rawUsr.filter(u => u.role === 'Affiliate' || u.roleName === 'ROLE_AFFILIATE').forEach(u => {
                if (!mapped.some(m => m.email === u.email)) {
                    mapped.push({
                        id: u.id, name: u.name, email: u.email,
                        mobile: u.phone || u.mobile || '', commissionValue: 15, isRealAffiliate: false
                    });
                }
            });

            setAffiliates(mapped);
            setCourses(rawCrs.map(c => ({ id: c.courseId || c.id, name: c.courseName || c.title || c.name || 'Unnamed' })));
        } catch {
            setError('Failed to load form data. Please refresh.');
        } finally { setLoading(false); }
    };

    const fetchBatches = async (courseId) => {
        try {
            const data = await batchService.getBatchesByCourseId(courseId);
            const raw = Array.isArray(data) ? data : (data?.data || data?.batches || []);
            setBatches(raw.map(b => ({ id: b.batchId || b.id, name: b.batchName || b.name || `Batch #${b.batchId || b.id}` })));
        } catch { setBatches([]); }
    };

    const handleChange = e => {
        const { name, value } = e.target;
        setFormData(p => ({ ...p, [name]: value }));
    };

    const handleAffSelect = aff => {
        setFormData(p => ({ ...p, affiliateId: aff.id, commissionPercentage: aff.commissionValue || 20 }));
        setSelectedAffiliate(aff); setAffSearch(aff.name); setIsAffOpen(false);
    };

    const handleCourseSelect = c => {
        setFormData(p => ({ ...p, courseId: c.id, batchId: '' }));
        setCourseSearch(c.name); setIsCourseOpen(false); setBatchSearch('');
    };

    const handleBatchSelect = b => {
        setFormData(p => ({ ...p, batchId: b.id }));
        setBatchSearch(b.name); setIsBatchOpen(false);
    };

    const handleSubmit = async e => {
        e.preventDefault();
        setError('');
        if (!formData.affiliateId || !formData.batchId) {
            setError('Please select both a Partner and a Batch.'); return;
        }
        setSubmitting(true);
        try {
            let affiliateId = formData.affiliateId;
            if (selectedAffiliate && !selectedAffiliate.isRealAffiliate) {
                const newAff = await affiliateService.createAffiliate({
                    userId: selectedAffiliate.id, name: selectedAffiliate.name,
                    email: selectedAffiliate.email, mobile: selectedAffiliate.mobile || '',
                    password: 'temp_password_123', commissionValue: parseFloat(formData.commissionPercentage) || 15.0
                });
                affiliateId = newAff.id;
            }
            const resp = await affiliateService.generateLink({
                affiliateId, courseId: parseInt(formData.courseId), batchId: parseInt(formData.batchId),
                commissionValue: parseFloat(formData.commissionPercentage),
                studentDiscountValue: parseFloat(formData.studentDiscountPercentage) || 0,
                expiresAt: formData.expiresAt ? formData.expiresAt + 'T23:59:59' : null
            });
            setGeneratedLink(resp);
            if (onSave) onSave(resp);
        } catch (e) {
            setError(e.message || 'Failed to generate link. Please try again.');
        } finally { setSubmitting(false); }
    };

    const copyLink = () => {
        if (generatedLink?.link) {
            navigator.clipboard.writeText(generatedLink.link);
            setCopied(true); setTimeout(() => setCopied(false), 2000);
        }
    };

    /* ─── Success screen ─── */
    if (generatedLink) {
        return (
            <div className="p-4">
                <div className="text-center py-4 mb-4 bg-primary bg-opacity-10 rounded-4">
                    <FiCheckCircle size={48} className="text-primary mb-3 d-block mx-auto" />
                    <h5 className="fw-bold">Link Generated!</h5>
                    <p className="text-muted small mb-0">Referral tracking active for <strong>{selectedAffiliate?.name}</strong></p>
                </div>
                <label className="form-label fw-semibold small">Sharable Referral URL</label>
                <div className="input-group mb-4">
                    <input type="text" className="form-control" value={generatedLink.link} readOnly />
                    <button className={`btn ${copied ? 'btn-success' : 'btn-outline-secondary'} fw-semibold`} onClick={copyLink}>
                        {copied ? <><FiCheckCircle className="me-1" />Copied</> : <><FiCopy className="me-1" />Copy</>}
                    </button>
                </div>
                <div className="row g-2 mb-4">
                    <div className="col-6">
                        <div className="border rounded-3 p-3 bg-light text-center">
                            <div className="text-muted small mb-1">Affiliate Code</div>
                            <div className="fw-bold">{generatedLink.affiliateCode || 'N/A'}</div>
                        </div>
                    </div>
                    <div className="col-6">
                        <div className="border rounded-3 p-3 bg-light text-center">
                            <div className="text-muted small mb-1">Batch ID</div>
                            <div className="fw-bold">#{generatedLink.batchId}</div>
                        </div>
                    </div>
                </div>
                <a href={generatedLink.link} target="_blank" rel="noreferrer" className="btn btn-outline-primary w-100 mb-2">
                    <FiExternalLink className="me-2" />Live Preview
                </a>
                <button className="btn btn-link text-secondary w-100" onClick={onCancel}>Close</button>
            </div>
        );
    }

    /* ─── Filter helpers ─── */
    const filteredAff = affiliates.filter(a =>
        a.name.toLowerCase().includes(affSearch.toLowerCase()) ||
        a.email.toLowerCase().includes(affSearch.toLowerCase())
    );
    const filteredCrs = courses.filter(c => c.name.toLowerCase().includes(courseSearch.toLowerCase()));
    const filteredBatch = batches.filter(b => b.name.toLowerCase().includes(batchSearch.toLowerCase()));

    /* ─── Main form ─── */
    return (
        <form onSubmit={handleSubmit} className="d-flex flex-column" style={{ maxHeight: '85vh' }}>

            {error && (
                <div className="alert alert-danger alert-dismissible mx-4 mt-3 mb-0 py-2 small" role="alert">
                    {error}
                    <button type="button" className="btn-close" onClick={() => setError('')} />
                </div>
            )}

            {/* Header */}
            <div className="px-4 py-3 border-bottom d-flex align-items-center justify-content-between flex-shrink-0">
                <div className="d-flex align-items-center gap-2">
                    <span className="bg-primary bg-opacity-10 text-primary p-2 rounded-3 d-flex align-items-center justify-content-center">
                        <FiLink size={18} />
                    </span>
                    <div>
                        <div className="fw-bold">Create Affiliate Link</div>
                        <div className="text-muted" style={{ fontSize: '0.8rem' }}>Generate referral links for partners</div>
                    </div>
                </div>
                <button type="button" className="btn-close" onClick={onCancel} />
            </div>

            {/* Scrollable body */}
            <div className="overflow-auto px-4 py-3 flex-grow-1">

                {/* ── Partner ── */}
                <div className="mb-3">
                    <label className="form-label fw-semibold small mb-1 d-flex align-items-center gap-1">
                        <FiUser size={13} className="text-primary" /> Select Partner
                    </label>
                    <div className="position-relative">
                        <div className={`input-group ${isAffOpen ? 'border border-primary rounded-3' : 'border rounded-3'}`}>
                            <span className="input-group-text bg-white border-0 ps-3"><FiSearch size={13} className="text-muted" /></span>
                            <input type="text" className="form-control border-0 shadow-none py-2"
                                placeholder="Search partner..."
                                value={affSearch}
                                onChange={e => { setAffSearch(e.target.value); setIsAffOpen(true); }}
                                onFocus={() => setIsAffOpen(true)} />
                            <button type="button" className="btn btn-white border-0 pe-3" onClick={() => setIsAffOpen(p => !p)}>
                                <FiChevronDown size={14} className="text-muted" />
                            </button>
                        </div>
                        {isAffOpen && (
                            <>
                                <div className="position-absolute w-100 mt-1 bg-white border rounded-3 shadow-sm" style={{ zIndex: 1300, maxHeight: 200, overflowY: 'auto' }}>
                                    {loading
                                        ? <div className="p-3 text-center text-muted small"><span className="spinner-border spinner-border-sm me-2" />Loading…</div>
                                        : filteredAff.length > 0
                                            ? filteredAff.map((a, i) => (
                                                <div key={a.id || i} onClick={() => handleAffSelect(a)}
                                                    className={`px-3 py-2 d-flex align-items-center gap-2 cursor-pointer ${String(formData.affiliateId) === String(a.id) ? 'bg-primary bg-opacity-10 fw-semibold' : ''}`}
                                                    style={{ cursor: 'pointer' }}>
                                                    <span className={`rounded-circle d-flex align-items-center justify-content-center fw-bold small flex-shrink-0 ${String(formData.affiliateId) === String(a.id) ? 'bg-primary text-white' : 'bg-light text-muted'}`}
                                                        style={{ width: 28, height: 28 }}>
                                                        {a.name.charAt(0).toUpperCase()}
                                                    </span>
                                                    <div style={{ minWidth: 0 }}>
                                                        <div className="small fw-semibold text-truncate">{a.name}</div>
                                                        <div className="text-muted text-truncate" style={{ fontSize: '0.72rem' }}>{a.email}</div>
                                                    </div>
                                                    {String(formData.affiliateId) === String(a.id) && <FiCheckCircle className="ms-auto text-primary flex-shrink-0" size={13} />}
                                                </div>
                                            ))
                                            : <div className="p-3 text-center text-muted small">No partners found</div>
                                    }
                                </div>
                                <div className="position-fixed top-0 start-0 w-100 h-100" style={{ zIndex: 1200 }} onClick={() => setIsAffOpen(false)} />
                            </>
                        )}
                    </div>
                </div>

                {/* ── Course & Batch ── */}
                <div className="mb-3">
                    <label className="form-label fw-semibold small mb-1 d-flex align-items-center gap-1">
                        <FiPackage size={13} className="text-primary" /> Target Course &amp; Batch
                    </label>
                    <div className="row g-2">
                        {/* Course */}
                        <div className="col-6">
                            <div className="position-relative">
                                <div className={`input-group border rounded-3 ${isCourseOpen ? 'border-primary' : ''}`}>
                                    <span className="input-group-text bg-white border-0 ps-2"><FiSearch size={12} className="text-muted" /></span>
                                    <input type="text" className="form-control border-0 shadow-none py-2 small"
                                        placeholder="Select Course…" value={courseSearch}
                                        onChange={e => { setCourseSearch(e.target.value); setIsCourseOpen(true); }}
                                        onFocus={() => setIsCourseOpen(true)} />
                                    {formData.courseId && (
                                        <button type="button" className="btn btn-white border-0 py-0 px-2"
                                            onClick={() => { setFormData(p => ({ ...p, courseId: '', batchId: '' })); setCourseSearch(''); }}>
                                            <FiPlus style={{ transform: 'rotate(45deg)' }} size={12} className="text-muted" />
                                        </button>
                                    )}
                                </div>
                                {isCourseOpen && (
                                    <>
                                        <div className="position-absolute w-100 mt-1 bg-white border rounded-3 shadow-sm" style={{ zIndex: 1300, maxHeight: 180, overflowY: 'auto' }}>
                                            {filteredCrs.length > 0
                                                ? filteredCrs.map((c, i) => (
                                                    <div key={c.id || i} onClick={() => handleCourseSelect(c)}
                                                        className={`px-3 py-2 small cursor-pointer ${formData.courseId === c.id ? 'bg-primary bg-opacity-10 fw-semibold text-primary' : ''}`}
                                                        style={{ cursor: 'pointer' }}>{c.name}</div>
                                                ))
                                                : <div className="p-2 text-center text-muted small">No courses</div>
                                            }
                                        </div>
                                        <div className="position-fixed top-0 start-0 w-100 h-100" style={{ zIndex: 1200 }} onClick={() => setIsCourseOpen(false)} />
                                    </>
                                )}
                            </div>
                        </div>

                        {/* Batch */}
                        <div className="col-6">
                            <div className="position-relative">
                                <div className={`input-group border rounded-3 ${!formData.courseId ? 'opacity-50' : isBatchOpen ? 'border-primary' : ''}`}>
                                    <span className="input-group-text bg-white border-0 ps-2"><FiZap size={12} className="text-muted" /></span>
                                    <input type="text" className="form-control border-0 shadow-none py-2 small"
                                        placeholder={!formData.courseId ? 'Select Course First' : 'Select Batch…'}
                                        value={batchSearch}
                                        onChange={e => { setBatchSearch(e.target.value); setIsBatchOpen(true); }}
                                        onFocus={() => setIsBatchOpen(true)}
                                        disabled={!formData.courseId} />
                                </div>
                                {isBatchOpen && formData.courseId && (
                                    <>
                                        <div className="position-absolute w-100 mt-1 bg-white border rounded-3 shadow-sm" style={{ zIndex: 1300, maxHeight: 180, overflowY: 'auto' }}>
                                            {filteredBatch.length > 0
                                                ? filteredBatch.map((b, i) => (
                                                    <div key={b.id || i} onClick={() => handleBatchSelect(b)}
                                                        className={`px-3 py-2 small cursor-pointer ${formData.batchId === b.id ? 'bg-primary bg-opacity-10 fw-semibold text-primary' : ''}`}
                                                        style={{ cursor: 'pointer' }}>{b.name}</div>
                                                ))
                                                : <div className="p-2 text-center text-muted small">No batches found</div>
                                            }
                                        </div>
                                        <div className="position-fixed top-0 start-0 w-100 h-100" style={{ zIndex: 1200 }} onClick={() => setIsBatchOpen(false)} />
                                    </>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                {/* ── Commission / Discount / Expiry ── */}
                <div className="row g-2 mb-2">
                    <div className="col-4">
                        <label className="form-label fw-semibold small mb-1 d-flex align-items-center gap-1">
                            <FiPercent size={12} className="text-primary" /> Commission %
                        </label>
                        <div className="input-group border rounded-3">
                            <input type="number" name="commissionPercentage"
                                className="form-control border-0 shadow-none py-2"
                                value={formData.commissionPercentage} onChange={handleChange} min={0} max={100} />
                            <span className="input-group-text bg-white border-0 text-muted small">%</span>
                        </div>
                        <div className="text-muted mt-1" style={{ fontSize: '0.7rem' }}>
                            Default: {selectedAffiliate?.commissionValue || 15}%
                        </div>
                    </div>
                    <div className="col-4">
                        <label className="form-label fw-semibold small mb-1 d-flex align-items-center gap-1">
                            <FiInfo size={12} className="text-primary" /> Discount %
                        </label>
                        <div className="input-group border rounded-3">
                            <input type="number" name="studentDiscountPercentage"
                                className="form-control border-0 shadow-none py-2"
                                value={formData.studentDiscountPercentage} onChange={handleChange} min={0} max={100} />
                            <span className="input-group-text bg-white border-0 text-muted small">%</span>
                        </div>
                    </div>
                    <div className="col-4">
                        <label className="form-label fw-semibold small mb-1 d-flex align-items-center gap-1">
                            <FiZap size={12} className="text-danger" /> Expiry Date
                        </label>
                        <input type="date" name="expiresAt"
                            className="form-control border rounded-3 shadow-none py-2 small"
                            value={formData.expiresAt} onChange={handleChange} />
                    </div>
                </div>

            </div>

            {/* ── Sticky Footer ── */}
            <div className="px-4 py-3 border-top bg-white flex-shrink-0 d-flex align-items-center justify-content-between gap-3">
                <div className="small text-muted">
                    Partner: <span className="fw-semibold text-dark">{selectedAffiliate?.name || '—'}</span>
                </div>
                <div className="d-flex gap-2">
                    <button type="button" className="btn btn-outline-secondary btn-sm px-4 fw-semibold" onClick={onCancel}>
                        Cancel
                    </button>
                    <button type="submit"
                        className="btn btn-primary btn-sm px-4 fw-semibold"
                        disabled={submitting || !formData.affiliateId || !formData.batchId}>
                        {submitting
                            ? <><span className="spinner-border spinner-border-sm me-2" />Creating…</>
                            : <><FiLink size={13} className="me-2" />Generate Link</>
                        }
                    </button>
                </div>
            </div>

        </form>
    );
};

export default AffiliateLinkForm;
