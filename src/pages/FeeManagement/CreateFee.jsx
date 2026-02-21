import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import {
    FiArrowLeft, FiSave, FiLayers, FiUsers, FiCreditCard,
    FiCalendar, FiDollarSign, FiBell, FiSettings, FiSearch, FiX, FiPlus, FiCheckCircle, FiInfo, FiFilter, FiLoader
} from 'react-icons/fi';
import './FeeManagement.css';
import { batchService } from '../Batches/services/batchService';
import { courseService } from '../Courses/services/courseService';
import { userService } from '../Users/services/userService';
import { enrollmentService } from '../Batches/services/enrollmentService';
import { createFeeAllocation, createBatchFee, createFee, getStudentById, getActiveFeeTypes, createFeeDiscount, getFeeDiscounts, deleteFeeDiscount } from '../../services/feeService';

// --- Sub-Components ---

const SectionHeader = ({ icon: Icon, title, description }) => (
    <div className="section-title" style={{ marginBottom: 24 }}>
        <div className="stat-icon" style={{ width: 40, height: 40, fontSize: 18, borderRadius: 12 }}>
            <Icon />
        </div>
        <div>
            <h3 style={{ margin: 0, fontSize: 18, fontWeight: 700 }}>{title}</h3>
            {description && <p style={{ margin: 0, fontSize: 13, color: 'var(--text-secondary)', fontWeight: 500 }}>{description}</p>}
        </div>
    </div>
);

const BasicDetails = ({ data, onChange, feeTypes = [] }) => (
    <motion.div className="glass-card form-section" initial={{ y: 10, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.1 }}>
        <SectionHeader icon={FiLayers} title="Basic Details" description="Set the core information for this fee structure" />
        <div className="form-grid">
            <div className="form-group">
                <label className="form-label">Fee Name *</label>
                <input
                    type="text"
                    name="name"
                    className="form-input"
                    placeholder="e.g. Annual Tuition Fee 2026"
                    value={data.name}
                    onChange={onChange}
                />
            </div>
            <div className="form-group">
                <label className="form-label">Fee Type *</label>
                <select
                    name="type"
                    className="form-select"
                    value={data.type} // This keeps the string value for the UI state
                    onChange={onChange}
                >
                    <option value="">Select Fee Type</option>
                    {feeTypes.length > 0 ? (
                        feeTypes.map(ft => (
                            <option key={ft.id} value={ft.name}>{ft.name}</option>
                        ))
                    ) : (
                        <option disabled>Loading types...</option>
                    )}
                </select>
            </div>
            <div className="form-group">
                <label className="form-label">Total Amount (₹) *</label>
                <div style={{ position: 'relative' }}>
                    <span style={{ position: 'absolute', left: 14, top: 13, color: '#64748b', fontSize: 16, fontWeight: 600 }}>₹</span>
                    <input
                        type="number"
                        name="amount"
                        className="form-input"
                        style={{
                            paddingLeft: 38,
                            cursor: (data.type?.toLowerCase() === 'course fee' && Number(data.amount) > 0) ? 'not-allowed' : 'text',
                            background: (data.type?.toLowerCase() === 'course fee' && Number(data.amount) > 0) ? '#f1f5f9' : 'white'
                        }}
                        placeholder="0.00"
                        value={data.amount}
                        onChange={onChange}
                        disabled={data.type?.toLowerCase() === 'course fee' && Number(data.amount) > 0}
                        title={data.type?.toLowerCase() === 'course fee' ? "Auto-fetched. If 0, you can edit manually." : ""}
                    />
                </div>
            </div>
        </div>

        {/* ADMISSION FEE SECTION - ADDED */}
        <div className="form-grid" style={{ marginTop: 16 }}>
            <div className="form-group">
                <label className="form-label">Admission/Registration Fee</label>
                <div style={{ position: 'relative' }}>
                    <span style={{ position: 'absolute', left: 14, top: 13, color: '#64748b', fontSize: 16, fontWeight: 600 }}>₹</span>
                    <input
                        type="number"
                        name="admissionFee"
                        className="form-input"
                        style={{ paddingLeft: 38 }}
                        placeholder="0.00"
                        value={data.admissionFee}
                        onChange={onChange}
                    />
                </div>
                <div style={{ fontSize: 12, color: 'var(--text-secondary)', marginTop: 4 }}>Included in Total Amount? Usually separate or part of first installment.</div>
            </div>
            <div className="form-group" style={{ display: 'flex', alignItems: 'end', paddingBottom: 10 }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: 12, cursor: 'pointer', width: '100%' }}>
                    <div className={`checkbox-custom ${data.admissionNonRefundable ? 'checked' : ''}`} style={{
                        width: 24, height: 24, borderRadius: 6, border: data.admissionNonRefundable ? 'none' : '2px solid #cbd5e1',
                        background: data.admissionNonRefundable ? 'var(--primary-gradient)' : 'transparent', display: 'flex', alignItems: 'center', justifyContent: 'center'
                    }}>
                        {data.admissionNonRefundable && <FiCheckCircle color="white" size={16} />}
                    </div>
                    <input
                        type="checkbox"
                        name="admissionNonRefundable"
                        checked={data.admissionNonRefundable}
                        onChange={(e) => onChange({ target: { name: 'admissionNonRefundable', value: e.target.checked } })}
                        style={{ display: 'none' }}
                    />
                    <div>
                        <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>Non-Refundable</span>
                        <div style={{ fontSize: 12, color: 'var(--text-secondary)' }}>Admission fee cannot be refunded</div>
                    </div>
                </label>
            </div>
        </div>

        <div className="form-group" style={{ marginTop: 24, padding: 16, background: 'rgba(255,255,255,0.4)', borderRadius: 12, border: '1px solid var(--glass-border)' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: data.taxEnabled ? 16 : 0 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <div style={{ padding: 8, background: '#e0f2fe', borderRadius: 8, color: '#0284c7' }}><FiInfo size={16} /></div>
                    <div>
                        <label className="form-label" style={{ marginBottom: 2, cursor: 'pointer' }}>Include Tax (GST/VAT)</label>
                        <div style={{ fontSize: 12, color: 'var(--text-secondary)' }}>Apply percentage tax on top of the base amount</div>
                    </div>
                </div>
                <div
                    className={`toggle-switch ${data.taxEnabled ? 'active' : ''}`}
                    onClick={() => onChange({ target: { name: 'taxEnabled', value: !data.taxEnabled } })}
                >
                    <div className="toggle-track"><div className="toggle-thumb"></div></div>
                </div>
            </div>

            <AnimatePresence>
                {data.taxEnabled && (
                    <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        style={{ overflow: 'hidden' }}
                    >
                        <div style={{ display: 'flex', alignItems: 'center', gap: 12, borderTop: '1px solid var(--glass-border)', paddingTop: 16 }}>
                            <input
                                type="number"
                                name="taxPercentage"
                                className="form-input"
                                style={{ width: 120 }}
                                value={data.taxPercentage}
                                onChange={onChange}
                            />
                            <span style={{ fontSize: 14, color: '#64748b', fontWeight: 600 }}>% Tax Percentage</span>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>

        <div className="form-group" style={{ marginTop: 24 }}>
            <label className="form-label">Description (Optional)</label>
            <textarea
                name="description"
                className="form-textarea"
                placeholder="Add generic notes about this fee..."
                value={data.description}
                onChange={onChange}
            ></textarea>
        </div>
    </motion.div>
);

const FeeAssignment = ({ data, setData, studentSearch, setStudentSearch, searchableStudents, handleStudentSearchAdd, removeStudent, availableBatches, availableCourses }) => {
    return (
        <motion.div className="glass-card form-section" initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.2 }} style={{ position: 'relative', zIndex: 10 }}>
            <SectionHeader icon={FiUsers} title="Assign Fee To" description="Select specific students or batches for this fee" />

            {/* Target Selection Toggles */}
            <div style={{ display: 'flex', gap: 12, marginBottom: 24, padding: 4, background: '#f1f5f9', borderRadius: 12, width: 'fit-content' }}>
                <button
                    className={`nav-tab ${data.targetType === 'student' ? 'active' : ''}`}
                    onClick={() => setData({ ...data, targetType: 'student' })}
                    style={{
                        margin: 0,
                        border: 'none',
                        background: data.targetType === 'student' ? 'white' : 'transparent',
                        boxShadow: data.targetType === 'student' ? '0 2px 5px rgba(0,0,0,0.05)' : 'none',
                        color: data.targetType === 'student' ? '#0f172a' : '#64748b',
                        padding: '8px 16px',
                        borderRadius: 8
                    }}
                >
                    <FiUsers size={14} style={{ marginRight: 8 }} /> Individual Students
                </button>
                <button
                    className={`nav-tab ${data.targetType === 'batch' ? 'active' : ''}`}
                    onClick={() => setData({ ...data, targetType: 'batch' })}
                    style={{
                        margin: 0,
                        border: 'none',
                        background: data.targetType === 'batch' ? 'white' : 'transparent',
                        boxShadow: data.targetType === 'batch' ? '0 2px 5px rgba(0,0,0,0.05)' : 'none',
                        color: data.targetType === 'batch' ? '#0f172a' : '#64748b',
                        padding: '8px 16px',
                        borderRadius: 8
                    }}
                >
                    <FiLayers size={14} style={{ marginRight: 8 }} /> Entire Batch
                </button>
            </div>

            {/* Course & Batch Filters */}
            <div className="form-grid" style={{ marginBottom: 24, gridTemplateColumns: '1fr 1fr' }}>
                <div className="form-group">
                    <label className="form-label">Filter by Course</label>
                    <div style={{ position: 'relative' }}>
                        <FiLayers style={{ position: 'absolute', left: 14, top: 14, color: '#64748b' }} />
                        <select
                            className="form-select"
                            style={{ paddingLeft: 38 }}
                            value={data.course}
                            onChange={(e) => setData({ ...data, course: e.target.value, batch: '' })}
                        >
                            <option value="">All Courses</option>
                            {availableCourses.map(c => (
                                <option key={c.courseId} value={c.courseId}>{c.courseName}</option>
                            ))}
                        </select>
                    </div>
                </div>

                <div className="form-group">
                    <label className="form-label">Filter by Batch</label>
                    <div style={{ position: 'relative' }}>
                        <FiFilter style={{ position: 'absolute', left: 14, top: 14, color: '#64748b' }} />
                        <select
                            className="form-select"
                            style={{ paddingLeft: 38 }}
                            value={data.batch}
                            onChange={(e) => setData({ ...data, batch: e.target.value })}
                            disabled={!data.course}
                        >
                            <option value="">{data.course ? 'All Batches' : 'Select Course First'}</option>
                            {availableBatches.filter(b => !data.course || String(b.courseId) === String(data.course)).map(b => (
                                <option key={b.batchId || b.id} value={b.batchId || b.id}>{b.batchName}</option>
                            ))}
                        </select>
                    </div>
                </div>
            </div>

            {data.targetType === 'student' && (
                <div className="form-group">
                    <label className="form-label">Search & Add Students {data.batch ? '(from selected batch)' : ''}</label>
                    <div style={{ position: 'relative', marginBottom: 16 }}>
                        <FiSearch style={{ position: 'absolute', left: 14, top: 14, color: '#64748b' }} />
                        <input
                            type="text"
                            className="form-input"
                            placeholder="Search by name or ID..."
                            style={{ paddingLeft: 38 }}
                            value={studentSearch}
                            onChange={(e) => setStudentSearch(e.target.value)}
                        />
                        {studentSearch && (
                            <div style={{
                                position: 'absolute', top: 'calc(100% + 8px)', left: 0, right: 0,
                                background: 'white', borderRadius: 12, boxShadow: '0 10px 25px -5px rgba(0,0,0,0.1)',
                                zIndex: 10, padding: 8, border: '1px solid #e2e8f0'
                            }}>
                                {searchableStudents.filter(s => s.name.toLowerCase().includes(studentSearch.toLowerCase()) || String(s.id).includes(studentSearch)).map(student => (
                                    <div
                                        key={student.id}
                                        onClick={() => { handleStudentSearchAdd(student); setStudentSearch(''); }}
                                        style={{ padding: '10px 14px', cursor: 'pointer', borderRadius: 8, transition: 'background 0.2s' }}
                                        onMouseEnter={(e) => e.target.style.background = '#f8fafc'}
                                        onMouseLeave={(e) => e.target.style.background = 'transparent'}
                                    >
                                        <div style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{student.name}</div>
                                        <div style={{ fontSize: 12, color: 'var(--text-secondary)' }}>ID: #{student.id}</div>
                                    </div>
                                ))}
                                {searchableStudents.filter(s => s.name.toLowerCase().includes(studentSearch.toLowerCase()) || String(s.id).includes(studentSearch)).length === 0 && (
                                    <div style={{ padding: 12, textAlign: 'center', color: '#94a3b8' }}>No students found</div>
                                )}
                            </div>
                        )}
                    </div>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10 }}>
                        {data.selectedStudents.map(student => (
                            <div key={student.id} className="status-badge" style={{ background: '#e0e7ff', color: '#4338ca', padding: '8px 14px', border: '1px solid #c7d2fe' }}>
                                {student.name}
                                <FiX style={{ marginLeft: 8, cursor: 'pointer', opacity: 0.7 }} onClick={() => removeStudent(student.id)} />
                            </div>
                        ))}
                        {data.selectedStudents.length === 0 && <div style={{ padding: 20, width: '100%', textAlign: 'center', border: '2px dashed var(--glass-border)', borderRadius: 12, color: 'var(--text-secondary)' }}>No students selected. Search above to add.</div>}
                    </div>
                </div>
            )}
        </motion.div>
    );
};

const PaymentConfiguration = ({ data, setData }) => {
    const updateInstallment = (id, field, value) => {
        setData(prev => ({
            ...prev,
            installments: prev.installments.map(inst => inst.id === id ? { ...inst, [field]: value } : inst)
        }));
    };

    const addInstallment = () => {
        setData(prev => ({
            ...prev,
            installments: [...prev.installments, { id: Date.now(), name: `Installment ${prev.installments.length + 1}`, percent: 0, due: '' }]
        }));
    };

    const removeInstallment = (id) => {
        setData(prev => ({
            ...prev,
            installments: prev.installments.filter(inst => inst.id !== id)
        }));
    };

    return (
        <motion.div className="glass-card form-section" initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.3 }}>
            <SectionHeader icon={FiCreditCard} title="Payment Schedule & Rules" description="Configure when and how the fee should be paid" />

            <div className="form-group" style={{ marginBottom: 24 }}>
                <label className="form-label">Due Date (Final Deadline)</label>
                <div style={{ position: 'relative' }}>
                    <FiCalendar style={{ position: 'absolute', left: 14, top: 14, color: '#64748b' }} />
                    <input
                        type="date"
                        className="form-input"
                        style={{ paddingLeft: 38 }}
                        value={data.dueDate}
                        onChange={(e) => setData({ ...data, dueDate: e.target.value })}
                    />
                </div>
                <div style={{ fontSize: 12, color: 'var(--text-secondary)', marginTop: 8 }}>
                    * Installment plans can be configured in the Installments module after creating the fee.
                </div>
            </div>

            <div className="section-divider"></div>

            <div className="form-grid">
                <div className="form-group">
                    <label className="form-label" style={{ marginBottom: 12 }}>Late Fee Rules</label>
                    <div
                        className={`toggle-switch ${data.lateFeeEnabled ? 'active' : ''}`}
                        onClick={() => setData({ ...data, lateFeeEnabled: !data.lateFeeEnabled })}
                    >
                        <div className="toggle-track"><div className="toggle-thumb"></div></div>
                        <span className="toggle-label">Enable Late Fee</span>
                    </div>
                </div>
                {data.lateFeeEnabled && (
                    <motion.div initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }}>
                        <div className="form-group" style={{ marginTop: 16 }}>
                            <label className="form-label">Late Fee Amount (₹)</label>
                            <input
                                type="number"
                                className="form-input"
                                placeholder="Enter amount (e.g. 500)"
                                value={data.lateFeeValue}
                                onChange={(e) => setData({ ...data, lateFeeValue: e.target.value })}
                            />
                        </div>
                    </motion.div>
                )}
            </div>
        </motion.div>
    );
};

const PaymentMethods = ({ data, setData, toggleNested }) => (
    <motion.div className="glass-card form-section" initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.4 }}>
        <SectionHeader icon={FiSettings} title="Payment Methods" description="Select allowed payment modes for this fee" />
        <div className="form-grid">
            <div className="form-group">
                <label className="form-label" style={{ marginBottom: 10 }}>Online Modes</label>
                <div className="glass-card" style={{ padding: 16, background: 'rgba(255,255,255,0.4)', borderRadius: 12 }}>
                    {Object.keys(data.online).map(mode => (
                        <label key={mode} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 0', borderBottom: '1px solid rgba(0,0,0,0.05)', cursor: 'pointer' }}>
                            <div className={`checkbox-custom ${data.online[mode] ? 'checked' : ''}`} style={{
                                width: 20, height: 20, borderRadius: 6, border: data.online[mode] ? 'none' : '2px solid #cbd5e1',
                                background: data.online[mode] ? 'var(--primary-gradient)' : 'transparent', display: 'flex', alignItems: 'center', justifyContent: 'center'
                            }}>
                                {data.online[mode] && <FiCheckCircle color="white" size={12} />}
                            </div>
                            <input type="checkbox" checked={data.online[mode]} onChange={() => toggleNested(setData, 'online', mode)} style={{ display: 'none' }} />
                            <span style={{ textTransform: 'capitalize', fontWeight: 500 }}>{mode}</span>
                        </label>
                    ))}
                </div>
            </div>
            <div className="form-group">
                <label className="form-label" style={{ marginBottom: 10 }}>Manual Modes</label>
                <div className="glass-card" style={{ padding: 16, background: 'rgba(255,255,255,0.4)', borderRadius: 12 }}>
                    {Object.keys(data.manual).map(mode => (
                        <label key={mode} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 0', borderBottom: '1px solid rgba(0,0,0,0.05)', cursor: 'pointer' }}>
                            <div className={`checkbox-custom ${data.manual[mode] ? 'checked' : ''}`} style={{
                                width: 20, height: 20, borderRadius: 6, border: data.manual[mode] ? 'none' : '2px solid #cbd5e1',
                                background: data.manual[mode] ? 'var(--primary-gradient)' : 'transparent', display: 'flex', alignItems: 'center', justifyContent: 'center'
                            }}>
                                {data.manual[mode] && <FiCheckCircle color="white" size={12} />}
                            </div>
                            <input type="checkbox" checked={data.manual[mode]} onChange={() => toggleNested(setData, 'manual', mode)} style={{ display: 'none' }} />
                            <span style={{ textTransform: 'capitalize', fontWeight: 500 }}>{mode.replace(/([A-Z])/g, ' $1').trim()}</span>
                        </label>
                    ))}
                </div>
            </div>
        </div>
        <div style={{ marginTop: 24, padding: 16, background: '#f8fafc', borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div>
                <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>Allow Admin Manual Record</span>
                <p style={{ margin: 0, fontSize: 12, color: 'var(--text-secondary)' }}>Admins can mark fees as paid manually</p>
            </div>
            <div
                className={`toggle-switch ${data.allowManualRecording ? 'active' : ''}`}
                onClick={() => setData({ ...data, allowManualRecording: !data.allowManualRecording })}
            >
                <div className="toggle-track"><div className="toggle-thumb"></div></div>
            </div>
        </div>
    </motion.div>
);

const NotificationSettings = ({ data, setData, toggleNested }) => (
    <motion.div className="glass-card form-section" style={{ marginBottom: 100 }} initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.5 }}>
        <SectionHeader icon={FiBell} title="Notifications & Automation" description="Configure automated alerts for this fee" />
        <div className="form-grid">

            <div className="form-group">
                <label className="form-label">Triggers</label>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                    {Object.keys(data.triggers).map(trigger => (
                        <div key={trigger} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 14px', background: 'white', border: '1px solid #f1f5f9', borderRadius: 10 }}>
                            <span style={{ fontSize: 14, fontWeight: 500 }}>{trigger.replace('on', 'On ')}</span>
                            <div
                                className={`toggle-switch ${data.triggers[trigger] ? 'active' : ''}`}
                                onClick={() => toggleNested(setData, 'triggers', trigger)}
                                style={{ transform: 'scale(0.8)' }}
                            >
                                <div className="toggle-track"><div className="toggle-thumb"></div></div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    </motion.div>
);

const DiscountSettings = ({ data, setData, courseAmount, admissionFee }) => {
    // Calculation Logic (Matching backend FeeDiscountServiceImpl.java)
    const courseFee = Number(courseAmount) || 0;
    const admFee = Number(admissionFee) || 0;
    const discountValue = Number(data.value) || 0;
    const gstPercent = Number(data.gstPercent) || 0;

    // 1. Base Amount (Discountable Amount = course fee − admission fee)
    const baseAmount = Math.max(0, courseFee - admFee);

    // 2. Discount Amount
    let discountAmount = 0;
    if (data.type === 'percentage') {
        discountAmount = (baseAmount * discountValue) / 100;
    } else {
        discountAmount = discountValue;
    }
    // Backend validation: if (discountAmount.compareTo(baseAmount) > 0) throw ...
    discountAmount = Math.min(discountAmount, baseAmount);

    // 3. Net Course Fee (after discount)
    const netCourseFee = baseAmount - discountAmount;

    // 4. Taxable Amount (admission fee + discounted course fee)
    const taxableAmount = admFee + netCourseFee;

    // 5. GST Amount (taxableAmount * gstPercent / 100)
    const gstAmount = (taxableAmount * gstPercent) / 100;

    // 6. Final Payable (taxableAmount + gstAmount)
    const payableAmount = taxableAmount + gstAmount;

    return (
        <motion.div className="glass-card form-section" initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.15 }}>
            <SectionHeader icon={FiDollarSign} title="Fee Concession & Tax" description="Apply a scholarship or discount and configure GST" />

            <div className="form-group" style={{ marginBottom: 24 }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <div>
                        <label className="form-label" style={{ marginBottom: 2, cursor: 'pointer' }}>Enable Concession</label>
                        <div style={{ fontSize: 12, color: 'var(--text-secondary)' }}>Reduce fees via Scholarship or Discount</div>
                    </div>
                    <div
                        className={`toggle-switch ${data.enabled ? 'active' : ''}`}
                        onClick={() => setData({ ...data, enabled: !data.enabled })}
                    >
                        <div className="toggle-track"><div className="toggle-thumb"></div></div>
                    </div>
                </div>
            </div>

            <AnimatePresence>
                {data.enabled && (
                    <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} style={{ overflow: 'hidden' }}>
                        <div className="form-grid" style={{ paddingTop: 12, borderTop: '1px solid var(--glass-border)' }}>
                            <div className="form-group">
                                <label className="form-label">Admission Fee (Fixed)</label>
                                <input
                                    type="number"
                                    className="form-input"
                                    value={admFee}
                                    disabled
                                    style={{ background: '#f1f5f9', cursor: 'not-allowed' }}
                                />
                                <div style={{ fontSize: 12, color: 'var(--text-secondary)', marginTop: 4 }}>Values configured in Basic Details</div>
                            </div>
                            <div className="form-group">
                                <label className="form-label">GST Percentage (%)</label>
                                <div style={{ position: 'relative' }}>
                                    <input
                                        type="number"
                                        className="form-input"
                                        placeholder="e.g. 18"
                                        value={data.gstPercent}
                                        onChange={(e) => setData({ ...data, gstPercent: e.target.value })}
                                    />
                                    <span style={{ position: 'absolute', right: 14, top: 13, color: '#64748b', fontWeight: 600 }}>%</span>
                                </div>
                            </div>
                            <div className="form-group">
                                <label className="form-label">Installment Count</label>
                                <input
                                    type="number"
                                    className="form-input"
                                    placeholder="e.g. 1"
                                    min="1"
                                    value={data.installmentCount}
                                    onChange={(e) => setData({ ...data, installmentCount: e.target.value })}
                                />
                                <div style={{ fontSize: 12, color: 'var(--text-secondary)', marginTop: 4 }}>Split remaining into X payments</div>
                            </div>
                        </div>

                        <div className="form-grid" style={{ marginTop: 16 }}>
                            <div className="form-group">
                                <label className="form-label">Calculation Type</label>
                                <div style={{ display: 'flex', gap: 12 }}>
                                    {['flat', 'percentage'].map(type => (
                                        <button
                                            key={type}
                                            className={`nav-tab ${data.type === type ? 'active' : ''}`}
                                            onClick={() => setData({ ...data, type: type })}
                                            style={{ margin: 0, border: '1px solid var(--glass-border)', background: data.type === type ? '#f1f5f9' : 'white', color: data.type === type ? '#0f172a' : 'var(--text-secondary)', width: '100%', justifyContent: 'center' }}
                                        >
                                            {type === 'flat' ? 'Flat Amount (₹)' : 'Percentage (%)'}
                                        </button>
                                    ))}
                                </div>
                            </div>
                            <div className="form-group">
                                <label className="form-label">Discount Value</label>
                                <input
                                    type="number"
                                    className="form-input"
                                    placeholder={data.type === 'flat' ? "Amount (e.g. 5000)" : "Percentage (e.g. 10)"}
                                    value={data.value}
                                    onChange={(e) => setData({ ...data, value: e.target.value })}
                                />
                            </div>
                        </div>

                        {/* Calculation Summary Preview */}
                        <div style={{ marginTop: 24, padding: 20, background: 'linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%)', borderRadius: 16, border: '1px solid #e2e8f0' }}>
                            <h4 style={{ margin: '0 0 16px 0', fontSize: 14, color: '#475569', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Calculation Summary</h4>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                                <div className="summary-item">
                                    <div style={{ fontSize: 12, color: '#64748b' }}>Base (Discountable)</div>
                                    <div style={{ fontSize: 16, fontWeight: 700, color: '#0f172a' }}>₹{baseAmount.toLocaleString()}</div>
                                </div>
                                <div className="summary-item">
                                    <div style={{ fontSize: 12, color: '#64748b' }}>Discount Amount</div>
                                    <div style={{ fontSize: 16, fontWeight: 700, color: '#ef4444' }}>- ₹{discountAmount.toLocaleString()}</div>
                                </div>
                                <div className="summary-item">
                                    <div style={{ fontSize: 12, color: '#64748b' }}>Taxable Amount</div>
                                    <div style={{ fontSize: 16, fontWeight: 700, color: '#0f172a' }}>₹{taxableAmount.toLocaleString()}</div>
                                </div>
                                <div className="summary-item">
                                    <div style={{ fontSize: 12, color: '#64748b' }}>GST ({gstPercent}%)</div>
                                    <div style={{ fontSize: 16, fontWeight: 700, color: '#0f172a' }}>+ ₹{gstAmount.toLocaleString()}</div>
                                </div>
                            </div>
                            <div style={{ marginTop: 16, paddingTop: 16, borderTop: '2px dashed #cbd5e1', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <div style={{ fontSize: 14, fontWeight: 600, color: '#475569' }}>Total Payable</div>
                                <div style={{ fontSize: 24, fontWeight: 800, color: '#0284c7' }}>₹{payableAmount.toLocaleString()}</div>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </motion.div>
    );
};


// --- Main Component ---

const CreateFee = () => {
    const navigate = useNavigate();

    // Form States
    const [basicDetails, setBasicDetails] = useState({
        name: '',
        type: 'Tuition Fee',
        amount: '',
        description: '',
        taxEnabled: false,
        taxPercentage: 18,
        admissionFee: '',
        admissionNonRefundable: true
    });

    const [saving, setSaving] = useState(false);

    const [discount, setDiscount] = useState({
        enabled: false,
        category: 'Scholarship',
        type: 'flat',
        value: '',
        admissionFee: '', // Kept for legacy compatibility if needed, but driven by basicDetails
        gstPercent: 18,
        installmentCount: 1,
        reason: ''
    });

    const [assignment, setAssignment] = useState({
        course: '',
        batch: '', // This will now hold selected batch ID
        category: 'Normal',
        targetType: 'student',
        selectedStudents: []
    });

    const [paymentConfig, setPaymentConfig] = useState({
        schedule: 'Monthly',
        installments: [
            { id: 1, name: 'Installment 1', percent: 100, due: '' }
        ],
        lateFeeEnabled: false,
        lateFeeType: 'amount',
        lateFeeValue: '',
        dueDate: '',
        autoApplyDiscounts: false
    });

    const [paymentMethods, setPaymentMethods] = useState({
        online: { upi: true, card: true, netbanking: true },
        manual: { cash: true, bankTransfer: true, cheque: true },
        allowManualRecording: true
    });

    const [notifications, setNotifications] = useState({
        autoUpdateStatus: true,
        notifyStudent: true,
        notifyParent: false,
        notifyMentor: false,
        triggers: {
            onCreation: true,
            onPending: true,
            onOverdue: true
        }
    });

    const [studentSearch, setStudentSearch] = useState('');
    const [availableBatches, setAvailableBatches] = useState([]);
    const [availableCourses, setAvailableCourses] = useState([]);
    const [searchableStudents, setSearchableStudents] = useState([]);
    const [feeTypes, setFeeTypes] = useState([]);

    // 1. Load Data on Mount (From Backend)
    useEffect(() => {
        const loadData = async () => {
            try {
                // Fetch Fee Types
                try {
                    const ftData = await getActiveFeeTypes();
                    setFeeTypes(ftData || []);
                } catch (err) {
                    console.warn("Could not fetch fee types, using defaults");
                }

                // Fetch Courses
                const coursesData = await courseService.getCourses();
                setAvailableCourses(coursesData || []);

                // Create Course Fee Map (Same as FeeInstallments)
                const courseMap = {};
                (coursesData || []).forEach(c => {
                    courseMap[String(c.courseId)] = Number(c.price || c.fee || c.amount || c.courseFee || 0);
                });
                console.log("CreateFee - Course Fee Map:", courseMap);

                // Fetch Batches
                const batchesData = await batchService.getAllBatches();

                // Enrich Batches with Cache Fee
                const enrichedBatches = (batchesData || []).map(b => {
                    const cId = b.courseId || b.course?.courseId;
                    const feeFromCourse = courseMap[String(cId)] || 0;
                    return {
                        ...b,
                        cachedFee: feeFromCourse // Store for easy access
                    };
                });
                setAvailableBatches(enrichedBatches);

                // Fetch All Students (for global search)
                const allStus = await userService.getAllStudents(); // Expecting [{ studentId, user: { firstName, ... } }]

                const formattedStudents = allStus.map(s => ({
                    id: s.studentId,
                    name: `${s.user?.firstName || ''} ${s.user?.lastName || ''}`.trim(),
                    email: s.user?.email,
                    totalFee: s.totalFee || s.fee || 0
                }));
                setSearchableStudents(formattedStudents);

            } catch (error) {
                console.error("Failed to load initial data", error);
            }
        };

        loadData();
    }, []);

    // 2. Filter Students when Batch Selected
    useEffect(() => {
        const fetchBatchStudents = async () => {
            if (assignment.batch) {
                // Fetch specifically for this batch
                const batchStudents = await enrollmentService.getStudentsByBatch(assignment.batch);

                // Calculate Fee for this Batch context (Logic from FeeInstallments)
                let calculatedFee = 0;
                const currentBatch = availableBatches.find(b => String(b.batchId || b.id) === String(assignment.batch));

                if (currentBatch) {
                    // 1. Check Batch Override
                    calculatedFee = currentBatch.fee || currentBatch.amount || 0;

                    // 2. Check Course Fee
                    if (!calculatedFee) {
                        const cId = currentBatch.courseId || currentBatch.course?.courseId;
                        const currentCourse = availableCourses.find(c => String(c.courseId || c.id) === String(cId));
                        if (currentCourse) {
                            calculatedFee = currentCourse.fee || currentCourse.price || currentCourse.amount || currentCourse.totalFee || 0;
                        }
                    }
                }

                const formatted = batchStudents.map(s => ({
                    id: s.studentId,
                    name: s.studentName || s.name || `Student ${s.studentId}`,
                    email: s.studentEmail,
                    // Use calculated fee for the context, fallback to student's own existing fee if any
                    totalFee: calculatedFee || s.totalFee || s.fee || 0
                }));
                setSearchableStudents(formatted);
            } else if (assignment.course) {
                // If only course selected, find batches for this course, then maybe we can't easily get all students without iterating.
                // For now, if no batch is selected, we revert to ALL students search (or previously loaded).
                // Better UX: Show all students, but search filters them.
                const allStus = await userService.getAllStudents();
                const formattedStudents = allStus.map(s => ({
                    id: s.studentId,
                    name: `${s.user?.firstName || ''} ${s.user?.lastName || ''}`.trim(),
                    email: s.user?.email,
                    totalFee: s.totalFee || s.fee || 0
                }));
                setSearchableStudents(formattedStudents);
            } else {
                // Reset to all
                const allStus = await userService.getAllStudents();
                const formattedStudents = allStus.map(s => ({
                    id: s.studentId,
                    name: `${s.user?.firstName || ''} ${s.user?.lastName || ''}`.trim(),
                    email: s.user?.email,
                    totalFee: s.totalFee || s.fee || 0
                }));
                setSearchableStudents(formattedStudents);
            }
        };

        fetchBatchStudents();
    }, [assignment.batch, assignment.course, availableBatches, availableCourses]);

    const handleStudentSearchAdd = (student) => {
        if (!assignment.selectedStudents.find(s => s.id === student.id)) {
            setAssignment(prev => ({ ...prev, selectedStudents: [...prev.selectedStudents, student] }));
        }
    };

    const removeStudent = (id) => {
        setAssignment(prev => ({ ...prev, selectedStudents: prev.selectedStudents.filter(s => s.id !== id) }));
    };

    const handleBasicChange = (e) => setBasicDetails({ ...basicDetails, [e.target.name]: e.target.value });

    // Auto-Populate Amount for Course Fee
    useEffect(() => {
        const fetchDynamicFee = async () => {
            // Case-insensitive check
            if (!basicDetails.type || basicDetails.type.toLowerCase() !== 'course fee') return;

            let autoFee = 0;
            console.log("🔄 Calculating Dynamic Fee...", { assignment, basicDetails });

            try {
                let relevantBatchId = null;

                // Priority 1: Batch Filter (Explicit Selection)
                if (assignment.batch) {
                    relevantBatchId = assignment.batch;
                }
                // Priority 2: Student's Batch (Implicit Scope)
                else if (assignment.targetType === 'student' && assignment.selectedStudents.length > 0) {
                    const stu = assignment.selectedStudents[0];
                    const cachedStu = searchableStudents.find(s => s.id === stu.id);

                    if (cachedStu) {
                        if (Number(cachedStu.totalFee) > 0) {
                            autoFee = Number(cachedStu.totalFee);
                            console.log("Found fee from Student Cache:", autoFee);
                        }
                        if (!autoFee) {
                            relevantBatchId = cachedStu.batchId || cachedStu.batch?.id;
                        }
                    }
                }

                // If Batch Context Found
                if (!autoFee && relevantBatchId) {
                    const batch = availableBatches.find(b => String(b.batchId || b.id) === String(relevantBatchId));
                    if (batch) {
                        console.log("Found Batch Context:", batch);
                        // 1. Check Batch Fee
                        if (batch.fee || batch.amount) {
                            autoFee = Number(batch.fee || batch.amount);
                        }
                        // 2. Check Cached Course Fee (from enrichment)
                        else if (batch.cachedFee) {
                            autoFee = Number(batch.cachedFee);
                        }

                        // 3. Fallback to Course via Batch
                        if (!autoFee) {
                            const cId = batch.courseId || batch.course?.courseId;
                            if (cId) {
                                const course = availableCourses.find(c => String(c.courseId || c.id) === String(cId));
                                if (course) {
                                    autoFee = Number(course.fee || course.price || course.amount || course.totalFee || 0);
                                }
                            }
                        }
                    }
                }

                // Priority 3: Course Filter (If no Batch selected but Course is)
                if (!autoFee && !relevantBatchId && assignment.course) {
                    const course = availableCourses.find(c => String(c.courseId || c.id) === String(assignment.course));
                    if (course) {
                        console.log("Found Course Context (No Batch):", course);
                        autoFee = Number(course.fee || course.price || course.amount || course.totalFee || course.courseFee || 0);
                    }
                }

            } catch (err) {
                console.error("Error calculating dynamic fee:", err);
            }

            console.log("✅ Final AutoFee:", autoFee);

            // Update State
            if (autoFee > 0) {
                setBasicDetails(prev => {
                    // Only update if changed to avoid loops
                    if (Number(prev.amount) !== autoFee) {
                        return { ...prev, amount: autoFee };
                    }
                    return prev;
                });
            }
        };

        fetchDynamicFee();
    }, [basicDetails.type, assignment.batch, assignment.targetType, assignment.selectedStudents, availableBatches, availableCourses, searchableStudents]);

    // Toggle helper
    const toggleNested = (stateSetter, parentKey, childKey) => {
        stateSetter(prev => ({
            ...prev,
            [parentKey]: {
                ...prev[parentKey],
                [childKey]: !prev[parentKey][childKey]
            }
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        // Validation based on Target Type
        if (assignment.targetType === 'student' && assignment.selectedStudents.length === 0) {
            alert('Please select at least one student.');
            return;
        }
        if (assignment.targetType === 'batch' && !assignment.batch) {
            alert('Please select a batch.');
            return;
        }

        try {
            setSaving(true);

            // 1. Calculate Final Amount (Base + Tax)
            let finalAmount = Number(basicDetails.amount);

            // SPECIAL CASE: For Course Fees with Discounts enabled, the Structure Amt should be the BASE amount.
            // GST will be recalculated by the backend FeeDiscountServiceImpl on the (Base - Discount) sum.
            const isCourseFeeWithDiscount = basicDetails.type === 'Course Fee' && discount.enabled;

            // Apply Tax Logic only if NOT a Course Fee with Discount (to avoid double taxation)
            if (!isCourseFeeWithDiscount && basicDetails.taxEnabled && basicDetails.taxPercentage) {
                const taxRate = Number(basicDetails.taxPercentage);
                const taxAmount = finalAmount * (taxRate / 100);
                finalAmount += taxAmount;
            }

            // Round to 2 decimal places
            finalAmount = Math.round(finalAmount * 100) / 100;

            // Description Helper
            let feeDescription = basicDetails.description;
            if (isCourseFeeWithDiscount) {
                feeDescription = (feeDescription || '') + ` [GST: ${discount.gstPercent}% calculated on discounted total]`;
            } else if (basicDetails.taxEnabled && basicDetails.taxPercentage) {
                feeDescription = (feeDescription || '') + ` [Tax: ${basicDetails.taxPercentage}% included]`;
            }

            // 2. CREATE FEE STRUCTURE (Master Record)

            // Dynamic Fee Type Mapping
            const selectedFeeTypeObj = feeTypes.find(ft => ft.name === basicDetails.type);
            const selectedFeeTypeId = selectedFeeTypeObj ? selectedFeeTypeObj.id : (feeTypes.length > 0 ? feeTypes[0].id : null);

            if (!selectedFeeTypeId) {
                alert("Error: Invalid Fee Type selected. Please refresh and try again.");
                setSaving(false);
                return;
            }

            const structurePayload = {
                name: basicDetails.name,
                currency: 'INR',
                academicYear: '2024-25',
                courseId: Number(assignment.course),
                batchId: assignment.batch ? Number(assignment.batch) : null,
                isActive: true,
                feeTypeId: selectedFeeTypeId,
                triggerOnCreation: true,
                description: feeDescription,
                admissionFeeAmount: basicDetails.admissionFee ? Number(basicDetails.admissionFee) : 0,
                admissionNonRefundable: basicDetails.admissionNonRefundable,
                // New Backend Requirement: Components list
                components: [
                    {
                        name: basicDetails.name || selectedFeeTypeObj?.name || 'Main Fee',
                        amount: finalAmount,
                        feeTypeId: selectedFeeTypeId // Fix: Essential field for backend
                    }
                ]
            };

            console.log("Creating Fee Structure:", structurePayload);
            const createdStructure = await createFee(structurePayload); // Expects { id: 123, ... }

            if (!createdStructure || !createdStructure.id) {
                throw new Error("Failed to create Fee Structure. No ID returned.");
            }

            console.log("✅ Fee Structure Created. ID:", createdStructure.id);
            const feeStructureId = createdStructure.id;

            // 3. IDENTIFY TARGET STUDENTS
            let targetStudents = [];
            if (assignment.targetType === 'batch') {
                console.log("Fetching students for batch:", assignment.batch);
                // Currently fetching via enrollmentService logic which returns enrolled students
                const batchStudents = await enrollmentService.getStudentsByBatch(assignment.batch);

                // Map enrollment format to simple { id, name, email }
                // Adjust per your actual Enrollment response structure
                targetStudents = batchStudents.map(e => ({
                    id: e.studentId || e.student?.studentId || e.student?.id,
                    name: e.studentName || (e.student?.user?.firstName + ' ' + e.student?.user?.lastName),
                    email: e.studentEmail || e.student?.user?.email
                })).filter(s => s.id); // Ensure ID exists
            } else {
                targetStudents = assignment.selectedStudents;
            }

            if (targetStudents.length === 0) {
                alert("No students found in the selected target to assign fees to.");
                setSaving(false);
                return;
            }

            // 3.5 CREATE FEE DISCOUNT RULE (Scoped)
            // Implementation of the new backend design: Create Scope-Based Discount Rules
            if (discount.enabled && discount.value) {
                console.log("Creating Scoped Fee Discount Rules...");

                const createDiscountRule = async (scope, scopeId) => {
                    const discountPayload = {
                        feeStructureId: feeStructureId,
                        discountScope: scope,
                        scopeId: Number(scopeId),
                        discountName: (discount.reason || 'Fee Discount'),
                        discountType: discount.type === 'flat' ? 'FLAT' : 'PERCENTAGE',
                        discountValue: Number(discount.value),
                        admissionFee: basicDetails.admissionFee ? Number(basicDetails.admissionFee) : 0, // Using basicDetails
                        gstPercent: Number(discount.gstPercent) || 0,
                        installmentCount: Number(discount.installmentCount) || 1,
                        isActive: true
                    };
                    return createFeeDiscount(discountPayload);
                };

                try {
                    if (assignment.targetType === 'batch' && assignment.batch) {
                        // Create ONE rule for the Batch
                        await createDiscountRule('BATCH', assignment.batch);
                    }
                    else if (assignment.targetType === 'student') {
                        // Create rule for EACH selected student
                        // Note: If you select 50 students, this creates 50 rules.
                        // This matches the requirement "Student-level discount applies only to student 123"
                        const promises = targetStudents.map(s => createDiscountRule('STUDENT', s.id));
                        await Promise.all(promises);
                    }
                } catch (err) {
                    console.error("Failed to create discount rules:", err);
                    // Non-blocking error for User flow, but logged.
                }
            }

            // 4. CREATE ALLOCATIONS (Link Students to Structure)

            // New Logic: Discount applies to (Total - AdmissionFee). Admission Fee is non-discountable.
            // Discount calculation is now handled DYNAMICALLY by the Backend using the Rules created in Step 3.5.
            // We do NOT hardcode the discount into the allocation record to avoid data duplication and allow future rule edits.

            const allocationPromises = targetStudents.map(student => {
                const allocationPayload = {
                    feeStructureId: feeStructureId,
                    userId: Number(student.id),
                    studentEmail: student.email, // For notification
                    status: 'ACTIVE',
                    originalAmount: finalAmount, // Send Base Amount
                    totalDiscount: 0 // Discount is derived from FeeDiscount Rules (Scoped)
                };
                return createFeeAllocation(allocationPayload);
            });

            await Promise.all(allocationPromises);

            alert(`Successfully created fee and assigned to ${targetStudents.length} students!`);
            navigate('/fee', { state: { defaultTab: 'batches' } });

        } catch (error) {
            console.error("Failed to assign fees:", error);
            const msg = error.response?.data?.message || error.message || "Unknown error";
            alert("Failed to assign fees. \nError: " + msg);
        } finally {
            setSaving(false);
        }
    };

    return (
        <motion.div
            className="fee-container"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
            style={{ width: '100%', overflowX: 'hidden' }}
        >
            {/* Header */}
            <header className="fee-header">
                <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                    <button onClick={() => navigate('/fee')} className="btn-icon">
                        <FiArrowLeft />
                    </button>
                    <div className="fee-title">
                        <h1>Create New Fee</h1>
                        <div className="fee-subtitle">Define fee structure, pricing plans, and payment schedules</div>
                    </div>
                </div>
                <div style={{ display: 'flex', gap: '16px' }}>
                    <button onClick={() => navigate('/fee')} style={{
                        background: 'transparent', border: '1px solid #cbd5e1',
                        padding: '10px 24px', borderRadius: '10px', fontWeight: 600, color: '#64748b', cursor: 'pointer', transition: 'all 0.2s'
                    }} onMouseEnter={(e) => e.target.style.background = '#f1f5f9'} onMouseLeave={(e) => e.target.style.background = 'transparent'}>
                        Cancel
                    </button>
                    <button onClick={handleSubmit} className="btn-primary" disabled={saving}>
                        {saving ? <FiLoader className="spin" /> : <FiSave />} {saving ? 'Saving...' : 'Save Fee Structure'}
                    </button>
                </div>
            </header>

            {/* Main Form Content */}
            <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
                <BasicDetails data={basicDetails} onChange={handleBasicChange} feeTypes={feeTypes} />

                {basicDetails.type === 'Course Fee' && (
                    <DiscountSettings
                        data={{ ...discount, targetType: assignment.targetType }}
                        setData={setDiscount}
                        courseAmount={basicDetails.amount}
                        admissionFee={basicDetails.admissionFee} // Passed prop
                    />
                )}

                <FeeAssignment
                    data={assignment}
                    setData={setAssignment}
                    studentSearch={studentSearch}
                    setStudentSearch={setStudentSearch}
                    searchableStudents={searchableStudents}
                    availableBatches={availableBatches}
                    availableCourses={availableCourses}
                    handleStudentSearchAdd={handleStudentSearchAdd}
                    removeStudent={removeStudent}
                />

                <PaymentConfiguration data={paymentConfig} setData={setPaymentConfig} />

                <PaymentMethods data={paymentMethods} setData={setPaymentMethods} toggleNested={toggleNested} />

                <NotificationSettings data={notifications} setData={setNotifications} toggleNested={toggleNested} />
            </div>
        </motion.div>
    );
};

export default CreateFee;
