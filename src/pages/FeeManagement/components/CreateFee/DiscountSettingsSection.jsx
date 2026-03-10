import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiDollarSign } from 'react-icons/fi';
import SectionHeader from './SectionHeader';

const DiscountSettingsSection = ({ data, setData, courseAmount, admissionFee }) => {
    // Calculation Logic
    const courseFee = Number(courseAmount) || 0;
    const admFee = Number(admissionFee) || 0;
    const discountValue = Number(data.value) || 0;
    const gstPercent = Number(data.gstPercent) || 0;

    const baseAmount = Math.max(0, courseFee - admFee);

    let discountAmount = 0;
    if (data.type === 'percentage') {
        discountAmount = (baseAmount * discountValue) / 100;
    } else {
        discountAmount = discountValue;
    }
    discountAmount = Math.min(discountAmount, baseAmount);

    const netCourseFee = baseAmount - discountAmount;
    const taxableAmount = admFee + netCourseFee;
    const gstAmount = (taxableAmount * gstPercent) / 100;
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

export default DiscountSettingsSection;
