import React from 'react';
import { motion } from 'framer-motion';
import { FiCreditCard, FiCalendar } from 'react-icons/fi';
import SectionHeader from './SectionHeader';

const PaymentConfigSection = ({ data, setData }) => {
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

export default PaymentConfigSection;
