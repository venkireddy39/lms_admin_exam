import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiLayers, FiCheckCircle, FiInfo } from 'react-icons/fi';
import SectionHeader from './SectionHeader';

const BasicDetailsSection = ({ data, onChange, feeTypes = [] }) => (
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
                    value={data.type}
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

export default BasicDetailsSection;
