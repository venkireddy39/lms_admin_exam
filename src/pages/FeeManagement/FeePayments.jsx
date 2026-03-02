import React, { useState, useEffect } from 'react';
import ReactDOM from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
    FiSearch, FiDownload, FiCheckCircle, FiAlertCircle, FiClock,
    FiFileText, FiPlus, FiX, FiCalendar, FiDollarSign, FiTag
} from 'react-icons/fi';
import './FeeManagement.css';
import feeService from '../../services/feeService';
import { userService } from '../Users/services/userService';

const ModalPortal = ({ children }) => ReactDOM.createPortal(children, document.body);

const FeePayments = ({ setActiveTab }) => {
    const [filter, setFilter] = useState('All');
    const [searchTerm, setSearchTerm] = useState('');
    const [showRecordModal, setShowRecordModal] = useState(false);
    const [showInvoiceModal, setShowInvoiceModal] = useState(false);
    const [selectedTransaction, setSelectedTransaction] = useState(null);

    const [transactions, setTransactions] = useState([]);
    const [allocations, setAllocations] = useState([]);
    const [loading, setLoading] = useState(true);

    // Modal state
    const [modalSearch, setModalSearch] = useState('');
    const [selectedAlloc, setSelectedAlloc] = useState(null);
    const [installments, setInstallments] = useState([]);
    const [loadingInst, setLoadingInst] = useState(false);
    const [selectedInstallmentIds, setSelectedInstallmentIds] = useState([]);
    const [payAmount, setPayAmount] = useState('');
    const [earlyDiscount, setEarlyDiscount] = useState('');
    const [payMode, setPayMode] = useState('CASH');
    const [txnRef, setTxnRef] = useState('');
    const [remarks, setRemarks] = useState('');

    useEffect(() => { fetchData(); }, []);

    const fetchData = async () => {
        setLoading(true);
        try {
            const [paymentsRes, allocationsRes, externalStudents] = await Promise.all([
                feeService.getAllPayments(),
                feeService.getAllFeeAllocations(),
                userService.getAllStudents().catch(() => [])
            ]);

            const studentMap = {};
            if (Array.isArray(externalStudents)) {
                externalStudents.forEach(s => {
                    const name = `${s.user?.firstName || ''} ${s.user?.lastName || ''}`.trim();
                    if (s.user?.userId) studentMap[s.user.userId] = name;
                    if (s.studentId) studentMap[s.studentId] = name;
                });
            }

            const patchedAllocations = (allocationsRes || []).map(a => ({
                ...a,
                studentName: (a.studentName && a.studentName !== 'null')
                    ? a.studentName
                    : (studentMap[a.userId] || `Student #${a.userId}`)
            }));

            const patchedTransactions = (paymentsRes || []).map(t => {
                const alloc = patchedAllocations.find(a => a.allocationId === t.allocationId);
                return {
                    ...t,
                    studentName: (t.studentName && t.studentName !== 'null')
                        ? t.studentName
                        : (alloc?.studentName || `User #${t.paymentId}`)
                };
            });

            setTransactions(patchedTransactions);
            setAllocations(patchedAllocations);
        } catch (e) {
            console.error('Failed to fetch payments data', e);
        } finally {
            setLoading(false);
        }
    };

    const getStatusBadge = (status) => {
        switch (status) {
            case 'SUCCESS': case 'PAID': case 'Paid':
                return <span className="status-badge paid"><FiCheckCircle /> Paid</span>;
            case 'PENDING': case 'Pending':
                return <span className="status-badge pending"><FiClock /> Pending</span>;
            case 'OVERDUE': case 'Overdue':
                return <span className="status-badge overdue"><FiAlertCircle /> Overdue</span>;
            case 'PARTIALLY_PAID': case 'Partial':
                return <span className="status-badge pending" style={{ color: '#3b82f6', background: 'rgba(59,130,246,0.1)' }}><FiClock /> Partial</span>;
            default: return null;
        }
    };

    const handleSelectAlloc = async (alloc) => {
        setSelectedAlloc(alloc);
        setModalSearch(alloc.studentName);
        setSelectedInstallmentIds([]);
        setPayAmount('');
        setEarlyDiscount('');
        setLoadingInst(true);
        try {
            const data = await feeService.getStudentInstallments(alloc.allocationId);
            const rawList = Array.isArray(data) ? data : (data?.data || data?.installments || []);

            // Map backend StudentInstallmentPlan fields to UI expected fields
            const list = rawList.map(inst => {
                const amount = Number(inst.installmentAmount || 0);
                const paid = Number(inst.paidAmount || 0);
                const remaining = amount - paid;
                return {
                    ...inst,
                    installmentId: inst.id,
                    amount: amount,
                    remainingAmount: remaining,
                    installmentName: inst.installmentNumber ? `Installment ${inst.installmentNumber}` : 'Installment',
                    status: (remaining <= 0 && amount > 0) ? 'PAID' : inst.status
                };
            });

            setInstallments(list);
        } catch (e) {
            console.error('Failed to load installments', e);
            setInstallments([]);
        } finally {
            setLoadingInst(false);
        }
    };

    const toggleInstallment = (inst) => {
        const id = inst.installmentId;
        setSelectedInstallmentIds(prev => {
            const next = prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id];

            // Calculate total amount for all selected
            const total = installments
                .filter(i => next.includes(i.installmentId))
                .reduce((acc, i) => acc + Number(i.remainingAmount), 0);

            setPayAmount(total || '');
            setEarlyDiscount('');
            return next;
        });
    };

    const pendingInstallments = installments.filter(i =>
        i.status === 'PENDING' || i.status === 'OVERDUE' ||
        i.status === 'PARTIALLY_PAID' || i.status === 'PARTIAL'
    );

    const discount = Number(earlyDiscount) || 0;
    const effectiveAmount = Math.max(0, Number(payAmount) - discount);

    const handleRecordPayment = async (e) => {
        e.preventDefault();
        if (!selectedAlloc || !payAmount) {
            alert('Please select a student and enter an amount');
            return;
        }

        // If multiple selected, we send null to let backend distribute starting from oldest.
        // If one selected, we send that specific ID.
        const instId = selectedInstallmentIds.length === 1 ? selectedInstallmentIds[0] : null;

        const params = {
            allocationId: selectedAlloc.allocationId,
            amount: effectiveAmount,
            paymentMode: payMode,
            transactionRef: txnRef || `MAN-REF-${Date.now()}`,
            recordedBy: 1,
            studentName: selectedAlloc.studentName,
            studentEmail: selectedAlloc.studentEmail || '',
            manualDiscount: discount,
            ...(instId ? { installmentId: instId } : {})
        };
        try {
            await feeService.recordManualPayment(params);
            await fetchData();
            closeModal();
            alert('Payment recorded successfully!');
        } catch (error) {
            console.error('Payment failed', error);
            alert('Failed to record payment: ' + (error.response?.data?.message || error.message));
        }
    };

    const closeModal = () => {
        setShowRecordModal(false);
        setModalSearch('');
        setSelectedAlloc(null);
        setInstallments([]);
        setSelectedInstallmentIds([]);
        setPayAmount('');
        setEarlyDiscount('');
        setPayMode('CASH');
        setTxnRef('');
        setRemarks('');
    };

    const getStudentName = (allocationId) => {
        const alloc = allocations.find(a => a.allocationId === allocationId);
        return alloc ? alloc.studentName : 'Unknown';
    };

    const filteredSearch = !modalSearch || selectedAlloc ? [] : allocations.filter(a =>
        a.status !== 'COMPLETED' &&
        (a.studentName?.toLowerCase().includes(modalSearch.toLowerCase()) ||
            String(a.allocationId).includes(modalSearch))
    );

    const filteredData = transactions.filter(t => {
        const name = getStudentName(t.allocationId).toLowerCase();
        const ref = (t.transactionReference || '').toLowerCase();
        const s = searchTerm.toLowerCase();
        const matchSearch = name.includes(s) || ref.includes(s);
        const matchFilter = filter === 'All'
            ? true
            : (t.paymentStatus === filter.toUpperCase() || (filter === 'Paid' && t.paymentStatus === 'SUCCESS'));
        return matchSearch && matchFilter;
    });

    return (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            {/* Controls */}
            <div className="controls-row">
                <div className="controls-left" style={{ display: 'flex', gap: 12 }}>
                    {['All', 'Paid', 'Pending', 'Overdue'].map(f => (
                        <button key={f} className={`nav-tab ${filter === f ? 'active' : ''}`}
                            onClick={() => setFilter(f)}>{f}</button>
                    ))}
                </div>
                <div className="controls-right" style={{ display: 'flex', gap: 12 }}>
                    <div className="glass-card" style={{ padding: '8px 16px', display: 'flex', alignItems: 'center', gap: 8 }}>
                        <FiSearch color="#64748b" />
                        <input type="text" placeholder="Search student or txn..."
                            style={{ border: 'none', background: 'transparent', outline: 'none' }}
                            value={searchTerm} onChange={e => setSearchTerm(e.target.value)} />
                    </div>
                    <button className="btn-primary" onClick={() => setShowRecordModal(true)} style={{ padding: '8px 16px' }}>
                        <FiPlus /> Record Payment
                    </button>
                    <button className="btn-icon"><FiDownload /></button>
                </div>
            </div>

            {/* Table */}
            <div className="glass-card table-container">
                <table className="premium-table">
                    <thead>
                        <tr>
                            <th>Student</th><th>Allocation ID</th><th>Amount</th>
                            <th>Payment Date</th><th>Method</th><th>Status</th><th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {loading ? (
                            <tr><td colSpan="7" style={{ textAlign: 'center', padding: 20 }}>Loading payments...</td></tr>
                        ) : filteredData.map(txn => (
                            <tr key={txn.paymentId}>
                                <td>
                                    <div style={{ fontWeight: 600 }}>{getStudentName(txn.allocationId)}</div>
                                    <div style={{ fontSize: 12, color: '#64748b' }}>Ref: {txn.transactionReference}</div>
                                </td>
                                <td>{txn.allocationId}</td>
                                <td>₹{txn.paidAmount}</td>
                                <td>{new Date(txn.paymentDate).toLocaleDateString()}</td>
                                <td>{txn.paymentMode}</td>
                                <td>{getStatusBadge(txn.paymentStatus)}</td>
                                <td>
                                    {txn.paymentStatus === 'SUCCESS' && (
                                        <button className="btn-icon" title="View Receipt" style={{ width: 32, height: 32 }}
                                            onClick={() => { setSelectedTransaction(txn); setShowInvoiceModal(true); }}>
                                            <FiFileText size={14} />
                                        </button>
                                    )}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                {!loading && filteredData.length === 0 && (
                    <div style={{ padding: 40, textAlign: 'center', color: '#94a3b8' }}>No records found.</div>
                )}
            </div>

            <ModalPortal>
                {/* ═══════════ Record Payment Modal ═══════════ */}
                <AnimatePresence>
                    {showRecordModal && (
                        <div className="modal-overlay">
                            <motion.div
                                className="modal-content"
                                style={{ maxWidth: 560 }}
                                initial={{ y: 50, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 50, opacity: 0 }}
                            >
                                <div className="modal-header">
                                    <h3 style={{ margin: 0 }}>Record Manual Payment</h3>
                                    <button className="btn-icon" onClick={closeModal}><FiX /></button>
                                </div>

                                <div className="modal-body" style={{ maxHeight: '80vh', overflowY: 'auto' }}>
                                    {/* Student Search */}
                                    <div className="form-group" style={{ marginBottom: 16, position: 'relative' }}>
                                        <label className="form-label">Search Student ID / Name</label>
                                        <input
                                            type="text"
                                            className="form-input"
                                            placeholder="Enter student details..."
                                            value={modalSearch}
                                            onChange={e => {
                                                setModalSearch(e.target.value);
                                                setSelectedAlloc(null);
                                                setInstallments([]);
                                            }}
                                        />
                                        {filteredSearch.length > 0 && (
                                            <div className="dropdown-menu show" style={{
                                                position: 'absolute', top: '100%', left: 0, right: 0,
                                                zIndex: 100, maxHeight: 200, overflowY: 'auto',
                                                background: 'white', border: '1px solid #e2e8f0', borderRadius: 8
                                            }}>
                                                {filteredSearch.map(alloc => (
                                                    <div
                                                        key={alloc.allocationId}
                                                        className="dropdown-item"
                                                        style={{ padding: '8px 12px', cursor: 'pointer', borderBottom: '1px solid #f1f5f9' }}
                                                        onClick={() => handleSelectAlloc(alloc)}
                                                    >
                                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                                            <div style={{ fontWeight: 600 }}>{alloc.studentName}</div>
                                                            <div style={{ fontSize: 11, background: '#e0f2fe', color: '#0369a1', padding: '2px 6px', borderRadius: 4 }}>
                                                                Batch: {alloc.batchId || 'N/A'}
                                                            </div>
                                                        </div>
                                                        <div style={{ fontSize: 12, color: '#64748b', marginTop: 2 }}>
                                                            {alloc.courseName || 'No Course'} | <span style={{ color: '#ef4444', fontWeight: 600 }}>Due: ₹{alloc.remainingAmount}</span>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </div>

                                    {/* Selected Student Banner — original red style */}
                                    {selectedAlloc && (
                                        <div style={{
                                            background: '#fef2f2', padding: '12px', borderRadius: 8, marginBottom: 16,
                                            border: '1px solid #fee2e2', display: 'flex', justifyContent: 'space-between', alignItems: 'center'
                                        }}>
                                            <div>
                                                <div style={{ fontSize: 12, color: '#991b1b', textTransform: 'uppercase', fontWeight: 700 }}>Selected Student</div>
                                                <div style={{ fontWeight: 600, color: '#111827' }}>{selectedAlloc.studentName}</div>
                                            </div>
                                            <div style={{ textAlign: 'right' }}>
                                                <div style={{ fontSize: 12, color: '#991b1b', textTransform: 'uppercase', fontWeight: 700 }}>Total Due</div>
                                                <div style={{ fontSize: 20, fontWeight: 800, color: '#ef4444' }}>
                                                    ₹{selectedAlloc.remainingAmount || 0}
                                                </div>
                                            </div>
                                        </div>
                                    )}

                                    {/* Pending Installments Table */}
                                    {selectedAlloc && (
                                        <div style={{ marginBottom: 16 }}>
                                            <label className="form-label">Select Installment to Pay</label>
                                            {loadingInst ? (
                                                <div style={{ color: '#94a3b8', fontSize: 13, padding: '8px 0' }}>Loading installments…</div>
                                            ) : pendingInstallments.length === 0 ? (
                                                <div style={{ color: '#16a34a', fontSize: 13, padding: '8px 12px', background: '#f0fdf4', borderRadius: 6 }}>
                                                    ✅ All installments paid
                                                </div>
                                            ) : (
                                                <div style={{ border: '1px solid #e2e8f0', borderRadius: 8, overflow: 'hidden', marginTop: 6 }}>
                                                    <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
                                                        <thead>
                                                            <tr style={{ background: '#f8fafc', color: '#64748b', fontWeight: 700, fontSize: 11, textTransform: 'uppercase' }}>
                                                                <th style={{ padding: '7px 10px' }}></th>
                                                                <th style={{ padding: '7px 10px', textAlign: 'left' }}>Installment</th>
                                                                <th style={{ padding: '7px 10px', textAlign: 'left' }}>Due Date</th>
                                                                <th style={{ padding: '7px 10px', textAlign: 'right' }}>Amount</th>
                                                                <th style={{ padding: '7px 10px', textAlign: 'right' }}>Remaining</th>
                                                                <th style={{ padding: '7px 10px', textAlign: 'center' }}>Status</th>
                                                            </tr>
                                                        </thead>
                                                        <tbody>
                                                            {pendingInstallments.map((inst, idx) => {
                                                                const isSelected = selectedInstallmentIds.includes(inst.installmentId);
                                                                const isOverdue = inst.dueDate && new Date(inst.dueDate) < new Date();
                                                                return (
                                                                    <tr key={inst.installmentId || idx}
                                                                        onClick={() => toggleInstallment(inst)}
                                                                        style={{
                                                                            cursor: 'pointer',
                                                                            background: isSelected ? '#eff6ff' : (idx % 2 === 0 ? '#fff' : '#fafafa'),
                                                                            borderBottom: '1px solid #f1f5f9'
                                                                        }}
                                                                    >
                                                                        <td style={{ padding: '8px 10px', textAlign: 'center' }}>
                                                                            <input type="checkbox" readOnly checked={isSelected} />
                                                                        </td>
                                                                        <td style={{ padding: '8px 10px', fontWeight: 600 }}>
                                                                            {inst.name || inst.installmentName || `Installment ${idx + 1}`}
                                                                        </td>
                                                                        <td style={{ padding: '8px 10px', color: isOverdue ? '#ef4444' : '#475569', fontWeight: isOverdue ? 700 : 400 }}>
                                                                            {inst.dueDate ? new Date(inst.dueDate).toLocaleDateString('en-IN') : '—'}
                                                                        </td>
                                                                        <td style={{ padding: '8px 10px', textAlign: 'right', fontWeight: 600 }}>
                                                                            ₹{Number(inst.amount || 0).toLocaleString()}
                                                                        </td>
                                                                        <td style={{ padding: '8px 10px', textAlign: 'right', fontWeight: 700, color: '#ef4444' }}>
                                                                            ₹{Number(inst.remainingAmount || inst.amount || 0).toLocaleString()}
                                                                        </td>
                                                                        <td style={{ padding: '8px 10px', textAlign: 'center' }}>
                                                                            {getStatusBadge(inst.status)}
                                                                        </td>
                                                                    </tr>
                                                                );
                                                            })}
                                                        </tbody>
                                                    </table>
                                                </div>
                                            )}
                                        </div>
                                    )}

                                    {/* Payment fields — shown after installment selected */}
                                    {selectedInstallmentIds.length > 0 && (
                                        <>
                                            <div className="form-grid" style={{ marginBottom: 16, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                                                <div className="form-group">
                                                    <label className="form-label">Amount (₹) <span style={{ fontSize: 10, color: '#64748b' }}>(Actual Pay)</span></label>
                                                    <input type="number" className="form-input" placeholder="0.00"
                                                        value={payAmount} onChange={e => setPayAmount(e.target.value)} />
                                                </div>
                                                <div className="form-group">
                                                    <label className="form-label">Early Discount (₹)</label>
                                                    <input type="number" className="form-input" placeholder="0.00"
                                                        style={{ border: '1px solid #10b981', background: '#f0fdf4' }}
                                                        value={earlyDiscount} onChange={e => setEarlyDiscount(e.target.value)} />
                                                </div>
                                            </div>

                                            {discount > 0 && (
                                                <div style={{
                                                    background: '#f0fdf4', border: '1px solid #bbf7d0',
                                                    borderRadius: 8, padding: '8px 14px', marginBottom: 16,
                                                    display: 'flex', justifyContent: 'space-between'
                                                }}>
                                                    <span style={{ color: '#15803d', fontSize: 13 }}>
                                                        ₹{Number(payAmount).toLocaleString()} − ₹{discount.toLocaleString()} discount
                                                    </span>
                                                    <strong style={{ color: '#15803d' }}>Net: ₹{effectiveAmount.toLocaleString()}</strong>
                                                </div>
                                            )}

                                            <div className="form-group" style={{ marginBottom: 16 }}>
                                                <label className="form-label">Payment Mode</label>
                                                <select className="form-select" value={payMode} onChange={e => setPayMode(e.target.value)}>
                                                    <option value="CASH">Cash</option>
                                                    <option value="UPI_MANUAL">UPI (Manual)</option>
                                                    <option value="BANK_TRANSFER">Bank Transfer</option>
                                                    <option value="CHEQUE">Cheque</option>
                                                    <option value="OTHER">Other</option>
                                                </select>
                                            </div>

                                            <div className="form-group" style={{ marginBottom: 16 }}>
                                                <label className="form-label">Transaction Reference</label>
                                                <input type="text" className="form-input"
                                                    placeholder="Optional (Auto-generated if empty)"
                                                    value={txnRef} onChange={e => setTxnRef(e.target.value)} />
                                            </div>

                                            <div className="form-group">
                                                <label className="form-label">Remarks</label>
                                                <textarea className="form-textarea" style={{ minHeight: 80 }}
                                                    placeholder="Notes..."
                                                    value={remarks} onChange={e => setRemarks(e.target.value)} />
                                            </div>
                                        </>
                                    )}
                                </div>

                                <div className="modal-footer">
                                    <button className="btn-icon" style={{ borderRadius: 8, width: 'auto', padding: '0 16px' }}
                                        onClick={closeModal}>Cancel</button>
                                    <button className="btn-primary" onClick={handleRecordPayment}
                                        disabled={!selectedAlloc || selectedInstallmentIds.length === 0 || !payAmount}
                                        style={{ opacity: (!selectedAlloc || selectedInstallmentIds.length === 0 || !payAmount) ? 0.5 : 1 }}>
                                        Record Payment{effectiveAmount > 0 ? ` · ₹${effectiveAmount.toLocaleString()}` : ''}
                                    </button>
                                </div>
                            </motion.div>
                        </div>
                    )}
                </AnimatePresence>

                {/* Invoice Preview Modal */}
                <AnimatePresence>
                    {showInvoiceModal && selectedTransaction && (
                        <div className="modal-overlay">
                            <motion.div className="modal-content" style={{ maxWidth: 600 }}
                                initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }}>
                                <div className="modal-header">
                                    <h3 style={{ margin: 0 }}>Payment Receipt</h3>
                                    <button className="btn-icon" onClick={() => setShowInvoiceModal(false)}><FiX /></button>
                                </div>
                                <div className="modal-body" style={{ background: '#f8fafc' }}>
                                    <div className="invoice-preview">
                                        <div className="invoice-header">
                                            <div>
                                                <div style={{ fontWeight: 800, fontSize: 24, marginBottom: 4 }}>WAC LMS</div>
                                                <div style={{ fontSize: 12, color: '#64748b' }}>Receipt #{selectedTransaction.paymentId}</div>
                                            </div>
                                            <div style={{ textAlign: 'right' }}>
                                                <div style={{ fontWeight: 600 }}>Date</div>
                                                <div>{new Date(selectedTransaction.paymentDate).toLocaleDateString()}</div>
                                            </div>
                                        </div>
                                        <div style={{ marginBottom: 20 }}>
                                            <div style={{ fontSize: 12, color: '#64748b', textTransform: 'uppercase' }}>To</div>
                                            <div style={{ fontWeight: 600, fontSize: 16 }}>{getStudentName(selectedTransaction.allocationId)}</div>
                                        </div>
                                        <div className="invoice-row" style={{ borderBottom: '2px solid #e2e8f0', fontWeight: 600, fontSize: 12, color: '#64748b' }}>
                                            <span>DESCRIPTION</span><span>AMOUNT</span>
                                        </div>
                                        <div className="invoice-row">
                                            <span>Fee Payment</span><span>₹{selectedTransaction.paidAmount}</span>
                                        </div>
                                        <div className="invoice-total">
                                            <span>TOTAL PAID</span><span>₹{selectedTransaction.paidAmount}</span>
                                        </div>
                                    </div>
                                </div>
                            </motion.div>
                        </div>
                    )}
                </AnimatePresence>
            </ModalPortal>
        </motion.div>
    );
};

export default FeePayments;
