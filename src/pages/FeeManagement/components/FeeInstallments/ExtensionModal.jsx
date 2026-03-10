import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiCalendar, FiLoader, FiX } from 'react-icons/fi';

const ExtensionModal = ({ 
    extendingInstallment, 
    setExtendingInstallment, 
    extensionDate, 
    setExtensionDate, 
    extensionReason, 
    setExtensionReason, 
    handleExtendDueDate, 
    extending,
    configuringStudent
}) => {
    return (
        <AnimatePresence>
            {extendingInstallment && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    style={{
                        position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)', zIndex: 10000,
                        display: 'flex', alignItems: 'center', justifyContent: 'center'
                    }}
                >
                    <motion.div
                        initial={{ scale: 0.9, y: 20 }}
                        animate={{ scale: 1, y: 0 }}
                        exit={{ scale: 0.9, y: 20 }}
                        className="glass-card"
                        style={{ width: 400, padding: 24, background: 'white', position: 'relative' }}
                    >
                        <button 
                            onClick={() => setExtendingInstallment(null)}
                            style={{ position: 'absolute', right: 16, top: 16, background: 'none', border: 'none', cursor: 'pointer', color: '#64748b' }}
                        >
                            <FiX />
                        </button>

                        <h3 style={{ margin: '0 0 16px 0', fontSize: 18, fontWeight: 700 }}>Extend Due Date</h3>
                        <p style={{ fontSize: 13, color: '#64748b', marginBottom: 20 }}>
                            Extending installment for <strong>{configuringStudent?.name}</strong>. This action will be logged.
                        </p>

                        <div className="form-group" style={{ marginBottom: 16 }}>
                            <label className="form-label">New Due Date</label>
                            <input
                                type="date"
                                className="form-input"
                                value={extensionDate}
                                onChange={(e) => setExtensionDate(e.target.value)}
                            />
                        </div>

                        <div className="form-group" style={{ marginBottom: 24 }}>
                            <label className="form-label">Reason for Extension</label>
                            <textarea
                                className="form-input"
                                placeholder="e.g. Student requested more time due to medical emergency"
                                rows={3}
                                value={extensionReason}
                                onChange={(e) => setExtensionReason(e.target.value)}
                                style={{ resize: 'none', padding: '10px' }}
                            />
                        </div>

                        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 12 }}>
                            <button
                                className="btn-secondary"
                                onClick={() => setExtendingInstallment(null)}
                                disabled={extending}
                            >
                                Cancel
                            </button>
                            <button
                                className="btn-primary"
                                onClick={handleExtendDueDate}
                                disabled={extending || !extensionReason || !extensionDate}
                            >
                                {extending ? <FiLoader className="spin" /> : <FiCalendar />}
                                {extending ? 'Extending...' : 'Confirm Extension'}
                            </button>
                        </div>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
};

export default ExtensionModal;
