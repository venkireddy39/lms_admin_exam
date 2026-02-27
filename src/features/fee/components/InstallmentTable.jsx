import React from 'react';
import { FiTrash2, FiPlus, FiDivideCircle } from 'react-icons/fi';

export default function InstallmentTable({
    installments,
    actions,
    isEditMode = false,
    remainingToAllocate = 0,
    totalFee = 0
}) {

    // Handlers for edit mode
    const handleAutoSplit = () => {
        const count = window.prompt("How many equal installments?", "2");
        if (count && !isNaN(count)) {
            actions.autoSplit(Number(count));
        }
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
                            <th className="px-4 py-3">Installment No</th>
                            <th className="px-4 py-3">Due Date</th>
                            <th className="px-4 py-3">Amount</th>
                            {!isEditMode && <th className="px-4 py-3">Paid</th>}
                            {!isEditMode && <th className="px-4 py-3">Fine/Penalty</th>}
                            {!isEditMode && <th className="px-4 py-3">Balance</th>}
                            {!isEditMode && <th className="px-4 py-3">Status</th>}
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
                                <tr key={inst.id || index}>
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
                                                    value={inst.amount || ''}
                                                    onChange={(e) => actions.updateInstallment(inst.id, 'amount', e.target.value)}
                                                    className="form-control"
                                                    required
                                                />
                                            </div>
                                        ) : (
                                            <span className="fw-bold text-dark">₹{inst.amount}</span>
                                        )}
                                    </td>

                                    {/* Only in View Mode (Student Ledger View) */}
                                    {!isEditMode && (
                                        <>
                                            <td className="px-4 py-3 text-success fw-medium">₹{inst.paidAmount || 0}</td>
                                            <td className="px-4 py-3 text-danger small">₹{inst.penaltyApplied || 0}</td>
                                            <td className="px-4 py-3 fw-bold text-dark">₹{inst.remainingAmount || (inst.amount - (inst.paidAmount || 0))}</td>
                                            <td className="px-4 py-3">
                                                <InstallmentStatusBadge status={inst.status} dueDate={inst.dueDate} remainingAmount={inst.remainingAmount || (inst.amount - (inst.paidAmount || 0))} />
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
