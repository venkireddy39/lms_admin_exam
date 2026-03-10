import React from 'react';
import { FiAlertCircle } from 'react-icons/fi';

const FeeDetailsModal = ({ isOpen, onClose, student, fees, installments, loading, openEditFeeModal }) => {
    if (!isOpen) return null;

    return (
        <div className="modal fade show d-block" style={{ background: 'rgba(0,0,0,0.5)', zIndex: 1060 }}>
            <div className="modal-dialog modal-dialog-centered modal-dialog-scrollable modal-lg">
                <div className="modal-content border-0 shadow">
                    <div className="modal-header border-bottom">
                        <h5 className="modal-title fw-bold">Fee Details: {student?.studentName}</h5>
                        <button className="btn-close" onClick={onClose}></button>
                    </div>
                    <div className="modal-body">
                        {loading ? (
                            <div className="text-center py-4"><div className="spinner-border spinner-border-sm text-primary"></div></div>
                        ) : (
                            <>
                                {fees.length === 0 ? (
                                    <div className="text-center py-5 text-muted">
                                        <FiAlertCircle size={36} className="mb-3 text-warning" />
                                        <h6 className="fw-semibold">No fee records found</h6>
                                        <p className="small mb-3">This student does not have any fee allocations yet.</p>
                                        <button
                                            className="btn btn-primary btn-sm px-4"
                                            onClick={() => openEditFeeModal(student)}
                                        >
                                            Assign Fee Now
                                        </button>
                                    </div>
                                ) : (
                                    <>
                                        <div className="row g-2 mb-4">
                                            <div className="col">
                                                <div className="border rounded-3 p-3 text-center bg-light">
                                                    <div className="text-muted small fw-bold">TOTAL FEE</div>
                                                    <div className="fs-5 fw-bold text-dark">₹{fees[0].payableAmount?.toLocaleString()}</div>
                                                </div>
                                            </div>
                                            <div className="col">
                                                <div className="border rounded-3 p-3 text-center bg-light">
                                                    <div className="text-muted small fw-bold">PAID</div>
                                                    <div className="fs-5 fw-bold text-success">₹{(fees[0].payableAmount - fees[0].remainingAmount)?.toLocaleString()}</div>
                                                </div>
                                            </div>
                                            <div className="col">
                                                <div className="border rounded-3 p-3 text-center bg-light border-danger">
                                                    <div className="text-danger small fw-bold">PENDING</div>
                                                    <div className="fs-5 fw-bold text-danger">₹{fees[0].remainingAmount?.toLocaleString()}</div>
                                                </div>
                                            </div>
                                        </div>

                                        <h6 className="mb-3 text-secondary text-uppercase fw-bold small">Installment Schedule</h6>
                                        {installments.length > 0 ? (
                                            <div className="table-responsive">
                                                <table className="table table-sm table-bordered align-middle">
                                                    <thead className="table-light">
                                                        <tr>
                                                            <th className="small">Installment</th>
                                                            <th className="small">Due Date</th>
                                                            <th className="small">Amount</th>
                                                            <th className="small">Status</th>
                                                        </tr>
                                                    </thead>
                                                    <tbody>
                                                        {installments.map((inst, idx) => (
                                                            <tr key={idx}>
                                                                <td>{inst.label || inst.installmentPlanName || `Installment ${idx + 1}`}</td>
                                                                <td>{inst.dueDate ? new Date(inst.dueDate).toLocaleDateString() : 'N/A'}</td>
                                                                <td className="fw-semibold">₹{Number(inst.amount || inst.installmentAmount).toLocaleString()}</td>
                                                                <td>
                                                                    <span className={`badge ${(inst.status === 'PAID' || inst.status === 'Paid') ? 'bg-success' :
                                                                        (inst.status === 'OVERDUE') ? 'bg-danger' : 'bg-warning text-dark'
                                                                        }`}>
                                                                        {inst.status}
                                                                    </span>
                                                                </td>
                                                            </tr>
                                                        ))}
                                                    </tbody>
                                                </table>
                                            </div>
                                        ) : (
                                            <p className="text-muted fst-italic small text-center p-3 border rounded">
                                                No installment plan found (One-time payment or pending configuration).
                                            </p>
                                        )}
                                    </>
                                )}
                            </>
                        )}
                    </div>
                    <div className="modal-footer">
                        <button className="btn btn-outline-secondary btn-sm" onClick={onClose}>Close</button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default FeeDetailsModal;
