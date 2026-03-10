import React from 'react';
import { motion } from 'framer-motion';

const PaymentModal = ({ 
    selectedStudent, 
    feeDetails, 
    paymentForm, 
    setPaymentForm, 
    onClose, 
    onSubmit 
}) => {
    return (
        <div className="modal-overlay" style={{
            position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
            background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000
        }}>
            <motion.div
                className="modal-content"
                initial={{ scale: 0.95, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                style={{ background: 'white', padding: 24, borderRadius: 12, width: 450, maxWidth: '90%' }}
            >
                <h3 style={{ margin: '0 0 16px 0' }}>Record New Payment</h3>

                <div style={{ background: '#f8fafc', padding: 12, borderRadius: 8, marginBottom: 20, fontSize: 13, color: '#475569' }}>
                    Recording payment for <strong>{selectedStudent?.name}</strong>.
                    <br />
                    Pending Due: <span style={{ color: '#dc2626', fontWeight: 600 }}>₹{feeDetails.pendingAmount.toLocaleString()}</span>
                </div>

                <div className="form-group" style={{ marginBottom: 16 }}>
                    <label className="form-label">Amount (₹)</label>
                    <input
                        type="number"
                        className="form-input"
                        placeholder="Enter amount..."
                        value={paymentForm.amount}
                        onChange={e => setPaymentForm({ ...paymentForm, amount: e.target.value })}
                    />
                </div>

                <div className="form-row" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 16 }}>
                    <div className="form-group">
                        <label className="form-label">Payment Mode</label>
                        <select
                            className="form-select"
                            value={paymentForm.mode}
                            onChange={e => setPaymentForm({ ...paymentForm, mode: e.target.value })}
                        >
                            <option>Online</option>
                            <option>Cash</option>
                            <option>Cheque</option>
                            <option>Bank Transfer</option>
                        </select>
                    </div>
                    <div className="form-group">
                        <label className="form-label">Date</label>
                        <input
                            type="date"
                            className="form-input"
                            value={paymentForm.date}
                            onChange={e => setPaymentForm({ ...paymentForm, date: e.target.value })}
                        />
                    </div>
                </div>

                <div className="form-group" style={{ marginBottom: 24 }}>
                    <label className="form-label">Reference ID (Optional)</label>
                    <input
                        type="text"
                        className="form-input"
                        placeholder="Transaction ID, Cheque No, etc."
                        value={paymentForm.reference}
                        onChange={e => setPaymentForm({ ...paymentForm, reference: e.target.value })}
                    />
                </div>

                <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end' }}>
                    <button
                        className="btn-icon"
                        style={{ width: 'auto', padding: '0 16px' }}
                        onClick={onClose}
                    >
                        Cancel
                    </button>
                    <button
                        className="btn-primary"
                        onClick={onSubmit}
                    >
                        Confirm Payment
                    </button>
                </div>
            </motion.div>
        </div>
    );
};

export default PaymentModal;
