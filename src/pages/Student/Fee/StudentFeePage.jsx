import React, { useState, useEffect } from 'react';
import { FiDollarSign, FiCalendar, FiCheckCircle, FiAlertCircle, FiClock, FiDownload, FiCreditCard } from 'react-icons/fi';
import { useAuth } from '../../../pages/Library/context/AuthContext';
import apiFetch, { getUrl } from '../../../services/api';
import { load } from '@cashfreepayments/cashfree-js';

const StudentFeePage = () => {
    const { user } = useAuth();
    const [allocation, setAllocation] = useState(null);
    const [installments, setInstallments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [cashfree, setCashfree] = useState(null);
    const [processingPaymentId, setProcessingPaymentId] = useState(null);

    useEffect(() => {
        const initializeCashfree = async () => {
            const cf = await load({
                mode: "sandbox",
            });
            setCashfree(cf);
        };
        initializeCashfree();
    }, []);

    useEffect(() => {
        const fetchAllFeeData = async () => {
            if (!user?.userId) return; // Assume userId or id is available from context

            try {
                setLoading(true);
                setError(null);

                // Step 1: Fetch allocation
                let currentAllocation = null;
                try {
                    const res = await apiFetch(getUrl('/fee-allocations/me'));
                    if (res && res.id) {
                        currentAllocation = res;
                        setAllocation(currentAllocation);
                    } else {
                        // Empty response
                        setAllocation(null);
                        setInstallments([]);
                        return;
                    }
                } catch (err) {
                    if (err.message && err.message.includes("404")) {
                        // Safe 404: No allocation exits for this user
                        setAllocation(null);
                        setInstallments([]);
                        return;
                    } else if (err.message && err.message.includes("401")) {
                        throw new Error("Session expired. Please log in again.");
                    }
                    throw new Error("Failed to load fee allocation.");
                }

                // Step 2: Fetch installments only if allocation exists
                if (currentAllocation?.id) {
                    try {
                        const instRes = await apiFetch(getUrl(`/installments/${currentAllocation.id}`));
                        const data = Array.isArray(instRes) ? instRes : [];
                        // Sort by due date ASC
                        data.sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate));
                        setInstallments(data);
                    } catch (err) {
                        throw new Error("Failed to load installment schedule.");
                    }
                }

            } catch (err) {
                console.error("StudentFeePage Error:", err);
                setError(err.message || "An unexpected error occurred while loading your fee details.");
            } finally {
                setLoading(false);
            }
        };

        fetchAllFeeData();
    }, [user]);

    const handlePayment = async (inst) => {
        try {
            setProcessingPaymentId(inst.id || inst.installmentId);
            setError(null);

            const amountToPay = Number(inst.amount || inst.installmentAmount) - Number(inst.paidAmount || 0);

            // 1. Ask backend to create an order
            const reqBody = {
                allocationId: allocation.id,
                installmentPlanId: inst.id || inst.installmentId,
                amount: amountToPay
            };

            const response = await apiFetch(getUrl('/payments/verify'), {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(reqBody)
            });

            if (!response || !response.paymentSessionId) {
                throw new Error("Failed to generate payment session");
            }

            // 2. Open Cashfree Checkout
            let checkoutOptions = {
                paymentSessionId: response.paymentSessionId,
                redirectTarget: "_modal",
            };

            cashfree.checkout(checkoutOptions).then((result) => {
                if (result.error) {
                    console.error("Payment failed", result.error);
                    setError(result.error.message || "Payment cancelled or failed");
                }
                if (result.redirect) {
                    console.log("Payment is redirecting");
                }
                if (result.paymentDetails) {
                    console.log("Payment has been completed, Verify using webhook");
                    // Assuming webhook flow handles the DB updates, we could simply reload the page details
                    alert('Payment processing! Check back in a moment as your receipt is generated.');
                    window.location.reload();
                }
            });

        } catch (err) {
            console.error("Payment error:", err);
            setError(err.message || "Could not initiate payment");
        } finally {
            setProcessingPaymentId(null);
        }
    };

    const getStatusConfig = (status, dueDate) => {
        const today = new Date();
        const due = new Date(dueDate);

        if (status === 'PAID') return { color: 'text-success', bg: 'bg-success bg-opacity-10', icon: <FiCheckCircle />, label: 'Paid' };
        if (status === 'PARTIALLY_PAID') return { color: 'text-warning', bg: 'bg-warning bg-opacity-10', icon: <FiClock />, label: 'Partial' };

        if (today > due && status !== 'PAID') {
            return { color: 'text-danger', bg: 'bg-danger bg-opacity-10', icon: <FiAlertCircle />, label: 'Overdue' };
        }

        return { color: 'text-primary', bg: 'bg-primary bg-opacity-10', icon: <FiCalendar />, label: 'Pending' };
    };

    if (loading) {
        return (
            <div className="d-flex justify-content-center align-items-center" style={{ height: '60vh' }}>
                <div className="spinner-border text-primary" role="status">
                    <span className="visually-hidden">Loading...</span>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="container mt-5">
                <div className="alert alert-danger d-flex align-items-center" role="alert">
                    <FiAlertCircle className="me-2 fs-4" />
                    <div>
                        <strong>Error:</strong> {error}
                    </div>
                </div>
            </div>
        );
    }

    if (!allocation) {
        return (
            <div className="container mt-5 text-center">
                <div className="card shadow-sm p-5 border-0 bg-light rounded-4">
                    <FiDollarSign className="fs-1 text-muted mb-3 mx-auto" style={{ opacity: 0.5 }} />
                    <h4 className="text-secondary">No Fee Allocation Assigned</h4>
                    <p className="text-muted mb-0">It looks like no fee structure has been allocated to your account yet. If you believe this is an error, please contact administration.</p>
                </div>
            </div>
        );
    }

    return (
        <div className="container py-4">
            <h2 className="fw-bold mb-4 text-dark">My Fee Details</h2>

            {/* Warning Message if Overdue */}
            {installments.some(i => getStatusConfig(i.status, i.dueDate).label === 'Overdue') && (
                <div className="alert alert-danger d-flex align-items-center shadow-sm border-0 border-start border-danger border-4 mb-4" role="alert">
                    <FiAlertCircle className="fs-4 me-3 text-danger" />
                    <div>
                        <h5 className="alert-heading fw-bold mb-1">Payment Overdue</h5>
                        <p className="mb-0 small">You have overdue installments. Please pay immediately or contact the administration.</p>
                    </div>
                </div>
            )}

            {/* Summary Cards */}
            <div className="row g-4 mb-5">
                <div className="col-12 col-md-4">
                    <div className="card border-0 shadow-sm h-100 rounded-4">
                        <div className="card-body d-flex align-items-center justify-content-between p-4">
                            <div>
                                <p className="text-muted small fw-medium text-uppercase mb-1">Total Payable</p>
                                <h3 className="fw-bold text-dark mb-0">₹{Number(allocation.payableAmount || 0).toFixed(2)}</h3>
                            </div>
                            <div className="bg-primary bg-opacity-10 text-primary rounded-circle d-flex align-items-center justify-content-center" style={{ width: '50px', height: '50px' }}>
                                <FiDollarSign className="fs-4" />
                            </div>
                        </div>
                    </div>
                </div>

                <div className="col-12 col-md-4">
                    <div className="card border-0 shadow-sm h-100 rounded-4">
                        <div className="card-body d-flex align-items-center justify-content-between p-4">
                            <div>
                                <p className="text-muted small fw-medium text-uppercase mb-1">Total Paid</p>
                                <h3 className="fw-bold text-success mb-0">₹{Number(allocation.advancePayment || 0).toFixed(2)}</h3>
                            </div>
                            <div className="bg-success bg-opacity-10 text-success rounded-circle d-flex align-items-center justify-content-center" style={{ width: '50px', height: '50px' }}>
                                <FiCheckCircle className="fs-4" />
                            </div>
                        </div>
                    </div>
                </div>

                <div className="col-12 col-md-4">
                    <div className="card border-0 shadow-sm h-100 rounded-4">
                        <div className="card-body d-flex align-items-center justify-content-between p-4">
                            <div>
                                <p className="text-muted small fw-medium text-uppercase mb-1">Remaining Balance</p>
                                <h3 className="fw-bold text-danger mb-0">₹{Number(allocation.remainingAmount || 0).toFixed(2)}</h3>
                            </div>
                            <div className="bg-danger bg-opacity-10 text-danger rounded-circle d-flex align-items-center justify-content-center" style={{ width: '50px', height: '50px' }}>
                                <FiAlertCircle className="fs-4" />
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="row g-4 mb-5">
                {/* Fee Breakdown Components side */}
                <div className="col-12 col-lg-4">
                    <div className="card border-0 shadow-sm rounded-4 h-100">
                        <div className="card-header bg-white border-bottom-0 pt-4 pb-0 px-4">
                            <h5 className="fw-bold text-dark mb-0">Fee Breakdown</h5>
                        </div>
                        <div className="card-body px-4 py-3">
                            {(!allocation.components || allocation.components.length === 0) ? (
                                <p className="text-muted small">No detailed breakdown available.</p>
                            ) : (
                                <ul className="list-group list-group-flush">
                                    {allocation.components.map((comp, i) => (
                                        <li key={i} className="list-group-item px-0 d-flex justify-content-between align-items-center border-bottom border-light">
                                            <div>
                                                <span className="text-dark d-block fw-medium">{comp.name}</span>
                                                {comp.refundable && <span className="badge bg-info bg-opacity-10 text-info fw-normal text-xs mt-1">Refundable</span>}
                                            </div>
                                            <span className="fw-bold text-dark">₹{Number(comp.amount || 0).toFixed(2)}</span>
                                        </li>
                                    ))}
                                </ul>
                            )}
                        </div>
                    </div>
                </div>

                {/* Installments List */}
                <div className="col-12 col-lg-8">
                    <div className="card border-0 shadow-sm rounded-4 h-100">
                        <div className="card-header bg-white border-bottom-0 pt-4 pb-0 px-4">
                            <h5 className="fw-bold text-dark mb-0">Installment Schedule</h5>
                        </div>
                        <div className="card-body p-0 mt-3">
                            {installments.length === 0 ? (
                                <div className="p-5 text-center text-muted">
                                    No installment schedule found for your account.
                                </div>
                            ) : (
                                <div className="table-responsive">
                                    <table className="table table-hover align-middle mb-0">
                                        <thead className="table-light text-muted small">
                                            <tr>
                                                <th className="ps-4 py-3 fw-semibold border-0">#</th>
                                                <th className="py-3 fw-semibold border-0">Due Date</th>
                                                <th className="py-3 fw-semibold border-0">Amount</th>
                                                <th className="py-3 fw-semibold border-0">Paid</th>
                                                <th className="py-3 fw-semibold border-0 text-center">Status</th>
                                                <th className="pe-4 py-3 fw-semibold border-0 text-center">Action</th>
                                            </tr>
                                        </thead>
                                        <tbody className="border-top-0">
                                            {installments.map((inst, idx) => {
                                                const status = getStatusConfig(inst.status, inst.dueDate);
                                                const amount = Number(inst.amount || inst.installmentAmount || 0);
                                                const paid = Number(inst.paidAmount || 0);
                                                const dueStr = new Date(inst.dueDate).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });

                                                return (
                                                    <tr key={inst.id || inst.installmentId || idx} className="border-bottom border-light">
                                                        <td className="ps-4 py-3 text-dark fw-medium">
                                                            {inst.installmentNumber ? `Inst. ${inst.installmentNumber}` : `Inst. ${idx + 1}`}
                                                        </td>
                                                        <td className="py-3 text-secondary">{dueStr}</td>
                                                        <td className="py-3 text-dark fw-bold">₹{amount.toFixed(2)}</td>
                                                        <td className="py-3 text-secondary">₹{paid.toFixed(2)}</td>
                                                        <td className="py-3 text-center">
                                                            <span className={`badge rounded-pill fw-normal px-2 py-1 border ${status.bg} ${status.color} border-${status.color === 'text-success' ? 'success' : status.color === 'text-danger' ? 'danger' : status.color === 'text-warning' ? 'warning' : 'primary'}-subtle`}>
                                                                {status.label}
                                                            </span>
                                                        </td>
                                                        <td className="pe-4 py-3 text-center">
                                                            {(inst.status === 'PAID' || inst.status === 'PARTIALLY_PAID') && (
                                                                <button
                                                                    className="btn btn-sm btn-light text-primary rounded-circle me-2"
                                                                    title="Download Receipt"
                                                                    onClick={() => alert('Receipt download feature coming soon!')}
                                                                >
                                                                    <FiDownload />
                                                                </button>
                                                            )}

                                                            {status.label !== 'Paid' && (
                                                                <button
                                                                    className="btn btn-sm btn-primary rounded-pill px-3"
                                                                    onClick={() => handlePayment(inst)}
                                                                    disabled={processingPaymentId === (inst.id || inst.installmentId) || !cashfree}
                                                                >
                                                                    {processingPaymentId === (inst.id || inst.installmentId) ? (
                                                                        <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
                                                                    ) : (
                                                                        <><FiCreditCard className="me-1" /> Pay Now</>
                                                                    )}
                                                                </button>
                                                            )}

                                                            {status.label === 'Paid' && (
                                                                <span className="text-muted">-</span>
                                                            )}
                                                        </td>
                                                    </tr>
                                                );
                                            })}
                                        </tbody>
                                    </table>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default StudentFeePage;
