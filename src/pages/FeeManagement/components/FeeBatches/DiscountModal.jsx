import React from 'react';
import { motion } from 'framer-motion';

const DiscountModal = ({ 
    discountForm, 
    setDiscountForm, 
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
                style={{ background: 'white', padding: 24, borderRadius: 12, width: 400, maxWidth: '90%' }}
            >
                <h3 style={{ margin: '0 0 16px 0' }}>Apply Fee Discount</h3>

                <div className="form-group" style={{ marginBottom: 16 }}>
                    <label className="form-label">Discount Amount (₹)</label>
                    <input
                        type="number"
                        className="form-input"
                        placeholder="Enter amount..."
                        value={discountForm.amount}
                        onChange={e => setDiscountForm({ ...discountForm, amount: e.target.value })}
                    />
                </div>

                <div className="form-group" style={{ marginBottom: 24 }}>
                    <label className="form-label">Reason / Note</label>
                    <input
                        type="text"
                        className="form-input"
                        placeholder="e.g. Scholarship, Early Bird..."
                        value={discountForm.reason}
                        onChange={e => setDiscountForm({ ...discountForm, reason: e.target.value })}
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
                        Apply Discount
                    </button>
                </div>
            </motion.div>
        </div>
    );
};

export default DiscountModal;
