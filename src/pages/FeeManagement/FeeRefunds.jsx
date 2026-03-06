import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiRefreshCcw, FiCheck, FiX, FiSearch, FiDollarSign, FiActivity, FiCreditCard, FiBriefcase, FiFileText, FiCheckCircle, FiTrash2, FiClock } from 'react-icons/fi';
import './FeeManagement.css';
import {
    getAllRefunds,
    createRefund,
    deleteRefund,
    approveRefund,
    rejectRefund,
    getAllFeeAllocations
} from '../../services/feeService';

const FeeRefunds = () => {
    const [showProcessModal, setShowProcessModal] = useState(false);
    const [loading, setLoading] = useState(true);

    // Data States
    const [refundsData, setRefundsData] = useState([]);
    const [allStudents, setAllStudents] = useState([]); // Allocations mapped to students

    // Form States
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedStudent, setSelectedStudent] = useState(null);
    const [formData, setFormData] = useState({
        refundType: 'PARTIAL', // PARTIAL or FULL
        amount: '',
        mode: 'WALLET',
        reason: '',
        reference: ''
    });

    const [isSearching, setIsSearching] = useState(false);

    // --- 1. Load Data ---
    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        setLoading(true);
        try {
            const [refunds, allocations] = await Promise.all([
                getAllRefunds(),
                getAllFeeAllocations()
            ]);

            setRefundsData((refunds || []).map(r => {
                const alloc = (allocations || []).find(a => a.allocationId === r.studentFeeAllocationId);
                return {
                    ...r,
                    studentName: alloc ? alloc.studentName : `Alloc #${r.studentFeeAllocationId}`
                };
            }));

            // Map allocations to searchable students
            const formattedStudents = (allocations || []).map(a => ({
                id: a.allocationId, // Using Allocation ID as unique key for refund
                studentId: a.userId,
                name: a.studentName || `Student #${a.userId}`,
                email: a.studentEmail,
                paidAmount: (a.payableAmount || 0) - (a.remainingAmount || 0),
                totalFee: a.payableAmount || 0,
                remainingAmount: a.remainingAmount || 0,
                batchName: a.batchName || 'N/A'
            }));
            setAllStudents(formattedStudents);
        } catch (error) {
            console.error("Failed to load refund data:", error);
        } finally {
            setLoading(false);
        }
    };

    // --- 2. Handlers ---

    const handleStudentSearch = (term) => {
        setSearchTerm(term);
        setIsSearching(true);
        if (term === '') {
            setIsSearching(false);
            setSelectedStudent(null);
        }
    };

    const selectStudent = (student) => {
        setSelectedStudent(student);
        setSearchTerm(student.name);
        setIsSearching(false);
        setFormData(prev => ({ ...prev, amount: '' }));
    };

    const handleProcess = async () => {
        // Validation
        if (!selectedStudent) return alert("Please select a student first");
        if (!formData.reason) return alert("Reason is required");

        let finalAmount = 0;
        if (formData.refundType === 'FULL') {
            finalAmount = selectedStudent.paidAmount || 0;
        } else {
            finalAmount = Number(formData.amount);
        }

        if (finalAmount <= 0) return alert("Invalid amount to refund");
        if (formData.refundType === 'PARTIAL' && finalAmount > (selectedStudent.paidAmount || 0)) {
            return alert(`Refund amount (₹${finalAmount}) cannot exceed paid amount (₹${selectedStudent.paidAmount})`);
        }

        try {
            await createRefund({
                studentFeeAllocationId: selectedStudent.id, // Allocation ID
                refundAmount: finalAmount,
                refundType: formData.refundType,
                refundMode: formData.mode,
                refundReason: formData.reason,
                refundStatus: 'PENDING'
            });

            alert('Refund Request Created Successfully');
            setShowProcessModal(false);
            setSelectedStudent(null);
            setSearchTerm('');
            setFormData({ ...formData, amount: '', reason: '' });
            loadData();
        } catch (error) {
            alert('Error processing refund: ' + (error.response?.data?.message || error.message));
        }
    };

    const handleDeleteRefund = async (refundId) => {
        if (!window.confirm("Are you sure you want to delete this refund request?")) return;
        try {
            await deleteRefund(refundId);
            alert("Refund request deleted.");
            loadData();
        } catch (error) {
            alert("Failed to delete refund: " + error.message);
        }
    };

    const handleApprove = async (refundId) => {
        if (!window.confirm("Approve this refund? Amount will be deducted from collection.")) return;
        try {
            await approveRefund(refundId, 1); // Mock Admin ID 1
            alert("Refund Approved!");
            loadData();
        } catch (error) {
            alert("Approval failed: " + error.message);
        }
    };

    const handleReject = async (refundId) => {
        const reason = prompt("Enter rejection reason:");
        if (!reason) return;
        try {
            await rejectRefund(refundId, 1, reason); // Mock Admin ID 1
            alert("Refund Rejected.");
            loadData();
        } catch (error) {
            alert("Rejection failed: " + error.message);
        }
    };

    // --- 3. Render Helpers ---
    const getStatusStyle = (status) => {
        switch (status) {
            case 'APPROVED': return { background: '#dcfce7', color: '#166534' };
            case 'PENDING': return { background: '#fef3c7', color: '#92400e' };
            case 'REJECTED': return { background: '#fee2e2', color: '#b91c1c' };
            default: return { background: '#f3f4f6', color: '#374151' };
        }
    };

    const OptionCard = ({ label, icon: Icon, active, onClick, subText }) => (
        <div
            onClick={onClick}
            style={{
                flex: 1, padding: 16, borderRadius: 12, cursor: 'pointer', transition: 'all 0.2s',
                border: active ? '2px solid #6366f1' : '1px solid #e2e8f0',
                background: active ? '#f5f7ff' : 'white',
                display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8, textAlign: 'center'
            }}
            onMouseEnter={e => !active && (e.currentTarget.style.borderColor = '#cbd5e1')}
            onMouseLeave={e => !active && (e.currentTarget.style.borderColor = '#e2e8f0')}
        >
            <div style={{
                width: 36, height: 36, borderRadius: '50%', background: active ? '#6366f1' : '#f1f5f9',
                color: active ? 'white' : '#64748b', display: 'flex', alignItems: 'center', justifyContent: 'center'
            }}>
                <Icon size={18} />
            </div>
            <div>
                <div style={{ fontWeight: 600, fontSize: 13, color: active ? '#4338ca' : '#1e293b' }}>{label}</div>
                {subText && <div style={{ fontSize: 11, color: active ? '#6366f1' : '#94a3b8' }}>{subText}</div>}
            </div>
            {active && <div style={{ position: 'absolute', top: 8, right: 8 }}><FiCheckCircle color="#6366f1" size={16} /></div>}
        </div>
    );

    const filteredStudents = allStudents.filter(s =>
        !searchTerm ||
        s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        String(s.studentId).includes(searchTerm) ||
        String(s.id).includes(searchTerm)
    );

    return (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            {/* Header Controls */}
            <div className="controls-row" style={{ marginBottom: 24 }}>
                <h3 style={{ margin: 0, fontSize: 20, color: '#1e293b' }}>Refund Requests</h3>
                <button className="btn-primary" onClick={() => setShowProcessModal(true)}>
                    <FiRefreshCcw /> New Refund Request
                </button>
            </div>

            {/* Table */}
            <div className="glass-card table-container">
                <table className="premium-table">
                    <thead>
                        <tr>
                            <th>ID</th>
                            <th>Student</th>
                            <th>Amount</th>
                            <th>Mode</th>
                            <th>Reason</th>
                            <th>Date</th>
                            <th>Status</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {loading ? <tr><td colSpan="8" style={{ textAlign: 'center', padding: 20 }}>Loading...</td></tr> :
                            refundsData.map(r => (
                                <tr key={r.id}>
                                    <td>#{r.id}</td>
                                    <td>
                                        <div style={{ fontWeight: 600 }}>{r.studentName || `Alloc #${r.studentFeeAllocationId}`}</div>
                                        <div style={{ fontSize: 11, color: '#64748b' }}>ID: {r.studentFeeAllocationId}</div>
                                    </td>
                                    <td style={{ fontWeight: 600 }}>₹{r.refundAmount?.toLocaleString()}</td>
                                    <td>{r.refundMode}</td>
                                    <td style={{ maxWidth: 150, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }} title={r.refundReason}>{r.refundReason}</td>
                                    <td>{r.requestDate ? new Date(r.requestDate).toLocaleDateString() : '-'}</td>
                                    <td>
                                        <span style={{ padding: '4px 12px', borderRadius: 20, fontSize: 12, fontWeight: 600, ...getStatusStyle(r.refundStatus) }}>
                                            {r.refundStatus}
                                        </span>
                                    </td>
                                    <td>
                                        <div style={{ display: 'flex', gap: 6 }}>
                                            {r.refundStatus === 'PENDING' && (
                                                <>
                                                    <button className="btn-icon" style={{ color: '#16a34a', background: '#dcfce7' }} onClick={() => handleApprove(r.id)} title="Approve">
                                                        <FiCheck size={14} />
                                                    </button>
                                                    <button className="btn-icon" style={{ color: '#dc2626', background: '#fee2e2' }} onClick={() => handleReject(r.id)} title="Reject">
                                                        <FiX size={14} />
                                                    </button>
                                                </>
                                            )}
                                            <button className="btn-icon" style={{ color: '#64748b' }} onClick={() => handleDeleteRefund(r.id)} title="Delete">
                                                <FiTrash2 size={14} />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                    </tbody>
                </table>
                {!loading && refundsData.length === 0 && (
                    <div style={{ padding: 40, textAlign: 'center', color: '#94a3b8' }}>
                        No refunds found. Click 'New Refund Request' to start.
                    </div>
                )}
            </div>

            {/* Modal */}
            <AnimatePresence>
                {showProcessModal && (
                    <div className="modal-overlay">
                        <motion.div className="modal-content large-modal" initial={{ y: 50, opacity: 0 }} animate={{ y: 0, opacity: 1 }} style={{ maxHeight: '90vh', overflowY: 'auto' }}>
                            <div className="modal-header">
                                <h3 style={{ margin: 0 }}>Create Refund Request</h3>
                                <button className="btn-icon" onClick={() => setShowProcessModal(false)}><FiX size={24} /></button>
                            </div>

                            <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
                                {/* Student Search */}
                                <div style={{ position: 'relative' }}>
                                    <label className="form-label">Search Student (by Name or Allocation ID)</label>
                                    <div style={{ position: 'relative' }}>
                                        <FiSearch style={{ position: 'absolute', left: 16, top: 14, color: '#64748b' }} />
                                        <input
                                            type="text"
                                            className="form-input"
                                            style={{ paddingLeft: 40 }}
                                            placeholder="Type to search..."
                                            value={searchTerm}
                                            onChange={(e) => handleStudentSearch(e.target.value)}
                                            onFocus={() => setIsSearching(true)}
                                        />
                                        <AnimatePresence>
                                            {isSearching && searchTerm && (
                                                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="dropdown-menu show" style={{ position: 'absolute', width: '100%', maxHeight: 250, overflowY: 'auto', zIndex: 50, background: 'white', border: '1px solid #e2e8f0', borderRadius: 8, marginTop: 4 }}>
                                                    {filteredStudents.length > 0 ? filteredStudents.map(s => (
                                                        <div key={s.id} onClick={() => selectStudent(s)} style={{ padding: '10px 14px', cursor: 'pointer', borderBottom: '1px solid #f1f5f9' }}>
                                                            <div style={{ fontWeight: 600 }}>{s.name}</div>
                                                            <div style={{ fontSize: 12, color: '#64748b' }}>Alloc ID: {s.id} • Paid: <span style={{ color: '#16a34a' }}>₹{s.paidAmount}</span></div>
                                                        </div>
                                                    )) : (
                                                        <div style={{ padding: '20px', textAlign: 'center', color: '#64748b' }}>
                                                            <FiSearch size={20} style={{ opacity: 0.3, marginBottom: 8 }} />
                                                            <div style={{ fontSize: 13 }}>No students found matching "{searchTerm}"</div>
                                                        </div>
                                                    )}
                                                </motion.div>
                                            )}
                                        </AnimatePresence>
                                    </div>
                                </div>

                                {/* Selected Student Preview */}
                                {selectedStudent && (
                                    <div style={{ padding: 16, background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: 12, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                        <div>
                                            <div style={{ fontWeight: 700, color: '#166534' }}>{selectedStudent.name}</div>
                                            <div style={{ fontSize: 12, color: '#15803d' }}>Allocation #{selectedStudent.id}</div>
                                        </div>
                                        <div style={{ textAlign: 'right' }}>
                                            <div style={{ fontSize: 11, color: '#15803d' }}>REFUNDABLE</div>
                                            <div style={{ fontSize: 18, color: '#16a34a', fontWeight: 700 }}>₹{selectedStudent.paidAmount}</div>
                                        </div>
                                    </div>
                                )}

                                {/* Form Fields */}
                                <div style={{ opacity: selectedStudent ? 1 : 0.5, pointerEvents: selectedStudent ? 'auto' : 'none' }}>
                                    <label className="form-label" style={{ marginBottom: 12 }}>Refund Type</label>
                                    <div style={{ display: 'flex', gap: 12, marginBottom: 24 }}>
                                        <OptionCard label="Partial" icon={FiActivity} active={formData.refundType === 'PARTIAL'} onClick={() => setFormData({ ...formData, refundType: 'PARTIAL' })} />
                                        <OptionCard label="Full" subText={`₹${selectedStudent?.paidAmount || 0}`} icon={FiRefreshCcw} active={formData.refundType === 'FULL'} onClick={() => setFormData({ ...formData, refundType: 'FULL' })} />
                                    </div>

                                    {formData.refundType === 'PARTIAL' && (
                                        <div style={{ marginBottom: 24 }}>
                                            <label className="form-label">Amount</label>
                                            <input type="number" className="form-input" value={formData.amount} onChange={e => setFormData({ ...formData, amount: e.target.value })} placeholder="0.00" />
                                        </div>
                                    )}

                                    <div style={{ marginBottom: 24 }}>
                                        <label className="form-label">Refund Mode</label>
                                        <div style={{ display: 'flex', gap: 12 }}>
                                            <OptionCard label="Wallet" icon={FiBriefcase} active={formData.mode === 'WALLET'} onClick={() => setFormData({ ...formData, mode: 'WALLET' })} />
                                            <OptionCard label="Bank" icon={FiCreditCard} active={formData.mode === 'BANK'} onClick={() => setFormData({ ...formData, mode: 'BANK' })} />
                                        </div>
                                    </div>

                                    <div style={{ marginBottom: 24 }}>
                                        <label className="form-label">Reason</label>
                                        <textarea className="form-textarea" value={formData.reason} onChange={e => setFormData({ ...formData, reason: e.target.value })} placeholder="Reason for refund..." style={{ minHeight: 100 }}></textarea>
                                    </div>

                                    <button className="btn-primary" style={{ width: '100%', height: 48 }} onClick={handleProcess}>Create Request</button>
                                </div>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </motion.div>
    );
};

export default FeeRefunds;
