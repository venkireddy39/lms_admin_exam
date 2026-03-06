import React, { useState } from 'react';
import { FiTrash2, FiPlus, FiDivideCircle, FiLink } from 'react-icons/fi';
import { apiFetch } from '../../../services/api';

export default function InstallmentTable({
    installments,
    actions,
    isEditMode = false,
    remainingToAllocate = 0,
    totalFee = 0,
    selectedIds = [],
    onToggleSelect = null
}) {

    // Auto Split defaults to 1 installment (no popup)
    const handleAutoSplit = () => {
        actions.autoSplit(1);
    };

    return (
        <div className="card shadow-sm border-0 mb-4">

            {isEditMode && (
                <div className="card-header bg-light d-flex justify-content-between align-items-center p-3 border-bottom">
                    <div>
                        <h6 className="mb-0 fw-bold text-dark">Installment Setup</h6>
                        <small className="text-muted">Total: ₹{totalFee} | Remaining to Allocate: <span className={remainingToAllocate > 0 ? "text-danger fw-bold" : "text-success fw-bold"}>₹{remainingToAllocate}</span></small>
                    </div>
                    <div className="d-flex gap-2">
                        <button
                            type="button"
                            onClick={handleAutoSplit}
                            className="btn btn-outline-secondary btn-sm d-flex align-items-center gap-1"
                        >
                            <FiDivideCircle /> Auto Split
                        </button>
                        <button
                            type="button"
                            onClick={actions.addInstallment}
                            className="btn btn-primary btn-sm d-flex align-items-center gap-1"
                        >
                            <FiPlus /> Add Installment
                        </button>
                    </div>
                </div>
            )}

            <div className="table-responsive">
                <table className="table table-hover align-middle mb-0">
                    <thead className="table-light text-muted small text-uppercase">
                        <tr>
                            {!isEditMode && onToggleSelect && (
                                <th className="px-4 py-3" style={{ width: '40px' }}>
                                    <input
                                        type="checkbox"
                                        className="form-check-input shadow-none"
                                        checked={installments.length > 0 && selectedIds.length === installments.filter(i => i.status === 'PENDING' || i.status === 'OVERDUE' || i.status === 'PARTIAL').length}
                                        onChange={(e) => {
                                            const selectable = installments.filter(i => i.status === 'PENDING' || i.status === 'OVERDUE' || i.status === 'PARTIAL');
                                            if (e.target.checked) {
                                                selectable.forEach(i => {
                                                    if (!selectedIds.includes(i.id)) onToggleSelect(i.id);
                                                });
                                            } else {
                                                selectable.forEach(i => {
                                                    if (selectedIds.includes(i.id)) onToggleSelect(i.id);
                                                });
                                            }
                                        }}
                                    />
                                </th>
                            )}
                            <th className="px-4 py-3">Installment No</th>
                            <th className="px-4 py-3">Due Date</th>
                            <th className="px-4 py-3">Amount</th>
                            {!isEditMode && <th className="px-4 py-3">Paid</th>}
                            {!isEditMode && <th className="px-4 py-3">Fine/Penalty</th>}
                            {!isEditMode && <th className="px-4 py-3">Balance</th>}
                            {!isEditMode && <th className="px-4 py-3">Status</th>}
                            {!isEditMode && <th className="px-4 py-3">Action</th>}
                            {isEditMode && <th className="px-4 py-3 text-end">Actions</th>}
                        </tr>
                    </thead>
                    <tbody>
                        {installments.length === 0 ? (
                            <tr>
                                <td colSpan="8" className="px-4 py-5 text-center text-muted">
                                    No installments configured. Click 'Auto Split' or 'Add Installment'.
                                </td>
                            </tr>
                        ) : (
                            installments.map((inst, index) => (
                                <tr key={inst.id || index} className={selectedIds.includes(inst.id) ? 'table-primary bg-opacity-10' : ''}>
                                    {!isEditMode && onToggleSelect && (
                                        <td className="px-4 py-3">
                                            <input
                                                type="checkbox"
                                                className="form-check-input shadow-none"
                                                checked={selectedIds.includes(inst.id)}
                                                disabled={inst.status !== 'PENDING' && inst.status !== 'OVERDUE' && inst.status !== 'PARTIAL'}
                                                onChange={() => onToggleSelect(inst.id)}
                                            />
                                        </td>
                                    )}
                                    <td className="px-4 py-3" style={{ minWidth: "150px" }}>
                                        {isEditMode ? (
                                            <input
                                                type="text"
                                                value={inst.name || `Term ${index + 1}`}
                                                onChange={(e) => actions.updateInstallment(inst.id, 'name', e.target.value)}
                                                className="form-control form-control-sm fw-semibold"
                                                required
                                            />
                                        ) : (
                                            <span className="fw-semibold text-dark">{inst.name || `Installment ${index + 1}`}</span>
                                        )}
                                    </td>

                                    {/* Edit Mode vs View Mode Toggles */}
                                    <td className="px-4 py-3">
                                        {isEditMode ? (
                                            <input
                                                type="date"
                                                value={inst.dueDate || ''}
                                                // Prevent selecting dates in the past
                                                min={new Date().toISOString().split('T')[0]}
                                                onChange={(e) => actions.updateInstallment(inst.id, 'dueDate', e.target.value)}
                                                className="form-control form-control-sm"
                                                required
                                            />
                                        ) : (
                                            <span className="text-secondary">{inst.dueDate}</span>
                                        )}
                                    </td>

                                    <td className="px-4 py-3">
                                        {isEditMode ? (
                                            <div className="input-group input-group-sm">
                                                <span className="input-group-text bg-white">₹</span>
                                                <input
                                                    type="number"
                                                    min="0"
                                                    step="0.01"
                                                    value={inst.amount || inst.installmentAmount || ''}
                                                    onChange={(e) => actions.updateInstallment(inst.id, 'amount', e.target.value)}
                                                    className="form-control"
                                                    required
                                                />
                                            </div>
                                        ) : (
                                            <span className="fw-bold text-dark">₹{Number(inst.amount || inst.installmentAmount || 0).toLocaleString()}</span>
                                        )}
                                    </td>

                                    {/* Only in View Mode (Student Ledger View) */}
                                    {!isEditMode && (
                                        <>
                                            <td className="px-4 py-3 text-success fw-medium">₹{Number(inst.paidAmount || 0).toLocaleString()}</td>
                                            <td className="px-4 py-3 text-danger small">₹{Number(inst.penaltyApplied || 0).toLocaleString()}</td>
                                            <td className="px-4 py-3 fw-bold text-dark">₹{Number(inst.remainingAmount !== undefined ? inst.remainingAmount : ((inst.amount || inst.installmentAmount || 0) - (inst.paidAmount || 0))).toLocaleString()}</td>
                                            <td className="px-4 py-3">
                                                <InstallmentStatusBadge status={inst.status} dueDate={inst.dueDate} remainingAmount={Number(inst.remainingAmount !== undefined ? inst.remainingAmount : ((inst.amount || inst.installmentAmount || 0) - (inst.paidAmount || 0)))} />
                                            </td>
                                            <td className="px-4 py-3">
                                                <GenerateLinkButton installmentId={inst.id} status={inst.status} />
                                            </td>
                                        </>
                                    )}

                                    {/* Actions (Edit Mode Only) */}
                                    {isEditMode && (
                                        <td className="px-4 py-3 text-end">
                                            <button
                                                type="button"
                                                onClick={() => actions.removeInstallment(inst.id)}
                                                className="btn btn-link text-danger p-0"
                                                title="Remove Installment"
                                            >
                                                <FiTrash2 size={16} />
                                            </button>
                                        </td>
                                    )}
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}

// ─── Generate Link Button ─────────────────────────────────────────────────────
function GenerateLinkButton({ installmentId, status }) {
    const [loading, setLoading] = useState(false);
    const [msg, setMsg] = useState(null); // { type: 'success'|'error', text }

    // UPDATED: Allow OVERDUE and PARTIAL
    const canGenerate = status === 'PENDING' || status === 'OVERDUE' || status === 'PARTIAL' || status === 'LOCKED_FOR_EARLY_PAYMENT';

    if (!canGenerate) return null;
    if (status === 'LOCKED_FOR_EARLY_PAYMENT') {
        return <span className="badge bg-warning text-dark">Locked (Early Pay)</span>;
    }

    const handleGenerate = async () => {
        setLoading(true);
        setMsg(null);
        try {
            const token = localStorage.getItem('token') || localStorage.getItem('auth_token');
            const res = await fetch(`/api/v1/admin/installment/${installmentId}/generate-link`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.message || 'Failed');
            setMsg({ type: 'success', text: '✅ Link sent!' });
        } catch (e) {
            setMsg({ type: 'error', text: '❌ ' + e.message });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{ minWidth: "120px" }}>
            <button
                className="btn btn-outline-primary btn-sm d-flex align-items-center gap-1"
                onClick={handleGenerate}
                disabled={loading}
            >
                {loading
                    ? <span className="spinner-border spinner-border-sm" role="status" />
                    : <FiLink size={13} />}
                {loading ? 'Sending...' : 'Send Link'}
            </button>
            {msg && (
                <small className={`d-block mt-1 ${msg.type === 'success' ? 'text-success' : 'text-danger'} animate-fade-in`}>
                    {msg.text}
                </small>
            )}
        </div>
    );
}

// Utility to render the strict status badge colors as requested
function InstallmentStatusBadge({ status, dueDate, remainingAmount }) {
    let computedStatus = status;

    // Frontend failsafe: logically compute overdue if backend hasn't yet synced the latest cron job
    if (computedStatus === 'PENDING' || computedStatus === 'PARTIAL') {
        const isPastDue = new Date(dueDate) < new Date();
        if (isPastDue && remainingAmount > 0) {
            computedStatus = 'OVERDUE';
        }
    }

    switch (computedStatus) {
        case 'PAID':
            return <span className="badge bg-success text-white">Paid</span>;
        case 'PARTIAL':
            return <span className="badge bg-warning text-dark">Partial</span>;
        case 'OVERDUE':
            return <span className="badge bg-danger text-white">Overdue</span>;
        default:
            return <span className="badge bg-secondary text-white">Pending</span>;
    }
}
