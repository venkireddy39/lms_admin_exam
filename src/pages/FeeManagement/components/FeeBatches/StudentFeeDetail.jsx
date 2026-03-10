import React from 'react';
import { motion } from 'framer-motion';
import { 
    FiArrowLeft, FiCreditCard, FiEdit3, FiDownload, FiRefreshCcw 
} from 'react-icons/fi';
import { calculateStatus } from '../../utils/feeUtils';

const StudentFeeDetail = ({ 
    selectedStudent, 
    selectedBatch, 
    feeDetails, 
    onBack, 
    onApplyDiscount, 
    onRecordPayment, 
    onDownloadReceipt, 
    onRefund 
}) => {
    if (!feeDetails) return <div className="glass-card">Loading Details...</div>;

    const { status } = calculateStatus({
        totalFee: feeDetails.totalFee,
        paidAmount: feeDetails.paidAmount
    });

    return (
        <motion.div
            key="detail"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 24 }}
        >
            {/* Main Info */}
            <div className="glass-card" style={{ padding: 0, overflow: 'hidden' }}>
                <div style={{ padding: '24px', borderBottom: '1px solid var(--glass-border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                        <button className="btn-icon" onClick={onBack}><FiArrowLeft /></button>
                        <div>
                            <h2 style={{ margin: 0, fontSize: 20 }}>{selectedStudent?.name}</h2>
                            <div style={{ color: 'var(--text-secondary)', fontSize: 13 }}>{selectedStudent?.roll} • {selectedBatch?.course}</div>
                        </div>
                    </div>
                    <div className={`status-badge ${status.toLowerCase()}`} style={{ fontSize: 14, padding: '6px 16px' }}>
                        {status} Account
                    </div>
                </div>

                <div style={{ padding: 24 }}>
                    <h4 style={{ marginTop: 0 }}>Fee Breakdown</h4>
                    <div className="invoice-preview" style={{ boxShadow: 'none', border: '1px solid #e2e8f0', padding: 24 }}>
                        {feeDetails.structure?.map((item, idx) => (
                            <div key={idx} className="invoice-row">
                                <span>{item.name}</span>
                                <span>₹{item.amount.toLocaleString()}</span>
                            </div>
                        ))}
                        <div className="invoice-total">
                            <span>Total Fee</span>
                            <span>₹{feeDetails.totalFee.toLocaleString()}</span>
                        </div>
                        <div className="invoice-row" style={{ marginTop: 10, color: '#059669' }}>
                            <span>Total Paid</span>
                            <span>- ₹{feeDetails.paidAmount.toLocaleString()}</span>
                        </div>
                        <div className="invoice-row" style={{ color: feeDetails.pendingAmount < 0 ? '#059669' : '#dc2626', fontWeight: 'bold' }}>
                            <span>{feeDetails.pendingAmount < 0 ? 'Excess Paid' : 'Balance Pending'}</span>
                            <span>{feeDetails.pendingAmount < 0 ? `+ ₹${Math.abs(feeDetails.pendingAmount).toLocaleString()}` : `₹${feeDetails.pendingAmount.toLocaleString()}`}</span>
                        </div>
                    </div>

                    <h4 style={{ marginBottom: 16 }}>Payment Schedule (Terms)</h4>
                    <div className="glass-card" style={{ padding: 0, marginBottom: 24, overflow: 'hidden', border: '1px solid #e2e8f0', boxShadow: 'none' }}>
                        <table className="premium-table" style={{ fontSize: 13 }}>
                            <thead>
                                <tr style={{ background: '#f8fafc' }}>
                                    <th>Term Name</th>
                                    <th>Due Date</th>
                                    <th>Amount</th>
                                    <th>Status</th>
                                    <th>Paid / Due</th>
                                </tr>
                            </thead>
                            <tbody>
                                {(() => {
                                    let remainingPaid = feeDetails.paidAmount;
                                    return feeDetails.installments?.map(term => {
                                        let status = 'Pending';
                                        let termPaid = 0;

                                        if (remainingPaid >= term.amount) {
                                            status = 'Paid';
                                            termPaid = term.amount;
                                            remainingPaid -= term.amount;
                                        } else if (remainingPaid > 0) {
                                            status = 'Partial';
                                            termPaid = remainingPaid;
                                            remainingPaid = 0;
                                        } else {
                                            status = 'Pending';
                                            termPaid = 0;
                                        }

                                        const termDue = Math.max(0, term.amount - termPaid);

                                        return (
                                            <tr key={term.id}>
                                                <td style={{ fontWeight: 500 }}>{term.name}</td>
                                                <td style={{ color: '#64748b' }}>{term.dueDate}</td>
                                                <td style={{ fontWeight: 600 }}>₹{term.amount.toLocaleString()}</td>
                                                <td>
                                                    <span className={`status-badge ${status.toLowerCase()}`} style={{ fontSize: 11, padding: '2px 8px' }}>
                                                        {status}
                                                    </span>
                                                </td>
                                                <td>
                                                    <div style={{ display: 'flex', flexDirection: 'column', fontSize: 11 }}>
                                                        <span style={{ color: '#16a34a' }}>Paid: ₹{termPaid.toLocaleString()}</span>
                                                        <span style={{ color: termDue > 0 ? '#dc2626' : '#94a3b8' }}>Due: ₹{termDue.toLocaleString()}</span>
                                                    </div>
                                                </td>
                                            </tr>
                                        );
                                    });
                                })()}
                            </tbody>
                        </table>
                    </div>

                    <h4 style={{ marginBottom: 12 }}>Payment History</h4>
                    <table className="premium-table" style={{ fontSize: 13 }}>
                        <thead>
                            <tr>
                                <th>Date</th>
                                <th>Mode</th>
                                <th>Ref ID</th>
                                <th>Amount</th>
                                <th>Receipt</th>
                                <th>Action</th>
                            </tr>
                        </thead>
                        <tbody>
                            {feeDetails.payments?.map(payment => (
                                <tr key={payment.id}>
                                    <td>{payment.date}</td>
                                    <td>{payment.mode}</td>
                                    <td style={{ fontFamily: 'monospace' }}>{payment.reference}</td>
                                    <td>₹{payment.amount.toLocaleString()}</td>
                                    <td>
                                        <button className="btn-icon" onClick={() => onDownloadReceipt(payment.id)}>
                                            <FiDownload style={{ color: '#6366f1' }} />
                                        </button>
                                    </td>
                                    <td>
                                        <button className="btn-icon" onClick={() => onRefund(payment.id)} title="Initiate Refund">
                                            <FiRefreshCcw style={{ color: '#f59e0b', fontSize: 12 }} />
                                        </button>
                                    </td>
                                </tr>
                            ))}
                            {(!feeDetails.payments || feeDetails.payments.length === 0) && (
                                <tr><td colSpan="6" style={{ textAlign: 'center', color: '#94a3b8' }}>No payments found</td></tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Actions Sidebar */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
                <div className="glass-card">
                    <h3 style={{ margin: '0 0 16px 0', fontSize: 16 }}>Quick Actions</h3>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                        <button
                            className="btn-primary"
                            style={{ justifyContent: 'center', opacity: feeDetails.pendingAmount <= 0 ? 0.5 : 1, cursor: feeDetails.pendingAmount <= 0 ? 'not-allowed' : 'pointer' }}
                            onClick={onRecordPayment}
                        >
                            <FiCreditCard /> Record Payment
                        </button>
                        <button className="btn-icon" style={{ width: '100%', justifyContent: 'center', gap: 8 }} onClick={onApplyDiscount}>
                            <FiEdit3 /> Apply Discount
                        </button>
                    </div>
                </div>

                <div className="glass-card">
                    <h3 style={{ margin: '0 0 16px 0', fontSize: 16 }}>Pending Dues</h3>
                    <div style={{ fontSize: 32, fontWeight: 700, color: feeDetails.pendingAmount < 0 ? '#059669' : '#dc2626' }}>
                        {feeDetails.pendingAmount < 0 ? `+ ₹${Math.abs(feeDetails.pendingAmount).toLocaleString()}` : `₹${feeDetails.pendingAmount.toLocaleString()}`}
                    </div>
                    <div style={{ fontSize: 13, color: 'var(--text-secondary)', marginTop: 4 }}>
                        Due by {feeDetails.dueDate || '-'}
                    </div>
                </div>
            </div>
        </motion.div>
    );
};

export default StudentFeeDetail;
