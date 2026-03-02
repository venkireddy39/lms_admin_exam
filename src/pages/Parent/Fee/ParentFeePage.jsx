import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FiDollarSign, FiCalendar, FiCheckCircle, FiAlertCircle, FiClock, FiDownload, FiCreditCard } from 'react-icons/fi';
import { useAuth } from '../../../pages/Library/context/AuthContext';
import apiFetch, { getUrl } from '../../../services/api';
import { load } from '@cashfreepayments/cashfree-js';

// Assume backend generates the paymentSessionId via /payments/verify endpoint

const ParentFeePage = () => {
    // Note: Parent might manage multiple students. For this demo, assuming 1-to-1 mapping or reading user.id
    // Normally, parents would select their child first. We'll use the logged-in parent's ID 
    // to fetch associated students, OR simply use the first associated student.
    const { user } = useAuth();
    const [studentData, setStudentData] = useState(null);
    const [installments, setInstallments] = useState([]);
    const [summary, setSummary] = useState({ total: 0, paid: 0, remaining: 0 });
    const [loading, setLoading] = useState(true);
    const [processingId, setProcessingId] = useState(null);
    const [cashfree, setCashfree] = useState(null);

    // Mock fetching the child's ID.
    const childId = user?.linkedStudentId || user?.id;

    useEffect(() => {
        const initCashfree = async () => {
            const cf = await load({ mode: "sandbox" });
            setCashfree(cf);
        };
        initCashfree();
    }, []);

    const fetchFeeData = async () => {
        if (!childId) return;
        setLoading(true);
        try {
            // Fetch Installments By Student ID 
            const res = await apiFetch(getUrl(`/installments/student/${childId}`));
            const data = Array.isArray(res) ? res : [];

            // Sort by due date
            data.sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate));
            setInstallments(data);

            // Calculate Summary 
            const total = data.reduce((acc, curr) => acc + (curr.installmentAmount || 0), 0);
            const paid = data.reduce((acc, curr) => acc + (curr.paidAmount || 0), 0);

            setSummary({
                total,
                paid,
                remaining: Math.max(0, total - paid)
            });
        } catch (error) {
            console.error("Failed to fetch fee data:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchFeeData();
    }, [childId]);

    const getStatusConfig = (status, dueDate) => {
        const today = new Date();
        const due = new Date(dueDate);

        if (status === 'PAID') return { color: 'text-green-600', bg: 'bg-green-100', icon: <FiCheckCircle />, label: 'Paid' };
        if (status === 'PARTIALLY_PAID') return { color: 'text-yellow-600', bg: 'bg-yellow-100', icon: <FiClock />, label: 'Partial' };

        if (today > due && status !== 'PAID') {
            return { color: 'text-red-600', bg: 'bg-red-100', icon: <FiAlertCircle />, label: 'Overdue' };
        }

        return { color: 'text-blue-600', bg: 'bg-blue-100', icon: <FiCalendar />, label: 'Pending' };
    };

    const handlePayOnline = async (installment) => {
        const amountToPay = (installment.installmentAmount || 0) - (installment.paidAmount || 0);
        if (amountToPay <= 0) return;

        setProcessingId(installment.installmentId || installment.id);

        try {
            // 1. Initiate Payment Session from Backend
            const initRes = await apiFetch(getUrl(`/payments/verify`), {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    allocationId: installment.studentFeeAllocationId,
                    installmentPlanId: installment.installmentId || installment.id,
                    amount: amountToPay
                })
            });

            if (!initRes || !initRes.paymentSessionId) {
                throw new Error("Failed to get payment session");
            }

            // 2. Open Cashfree Checkout Widget
            if (cashfree) {
                cashfree.checkout({
                    paymentSessionId: initRes.paymentSessionId,
                    redirectTarget: "_modal",
                }).then((result) => {
                    if (result.error) {
                        console.error("Payment Error", result.error);
                        alert("Payment cancelled or failed.");
                    }
                    if (result.paymentDetails) {
                        alert("Payment successful! Wait a moment for the receipt.");
                        fetchFeeData();
                    }
                });
            } else {
                alert("Payment gateway not loaded.");
            }
        } catch (error) {
            console.error("Payment initiation failed:", error);
            alert("Could not initiate payment. Please try again.");
        } finally {
            setProcessingId(null);
        }
    };

    if (loading) {
        return <div className="flex justify-center items-center h-64">Loading portal...</div>;
    }

    return (
        <div className="p-6 max-w-6xl mx-auto">
            <h1 className="text-2xl font-bold mb-6 text-gray-800">Fee Portal (Parent Dashboard)</h1>

            {/* Warning Message if Overdue */}
            {installments.some(i => getStatusConfig(i.status, i.dueDate).label === 'Overdue') && (
                <div className="mb-6 p-4 bg-red-50 border-l-4 border-red-500 text-red-700 flex items-center shadow-sm">
                    <FiAlertCircle className="mr-3 text-xl" />
                    <div>
                        <h3 className="font-bold">Immediate Action Required</h3>
                        <p className="text-sm">Your child has overdue fee installments. Please clear them to avoid late penalties.</p>
                    </div>
                </div>
            )}

            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-center justify-between">
                    <div>
                        <p className="text-gray-500 text-sm font-medium mb-1">Total Fee Program</p>
                        <h3 className="text-2xl font-bold text-gray-800">₹{summary.total.toFixed(2)}</h3>
                    </div>
                    <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center text-xl">
                        <FiDollarSign />
                    </div>
                </motion.div>

                <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.1 }} className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-center justify-between">
                    <div>
                        <p className="text-gray-500 text-sm font-medium mb-1">Total Paid</p>
                        <h3 className="text-2xl font-bold text-green-600">₹{summary.paid.toFixed(2)}</h3>
                    </div>
                    <div className="w-12 h-12 bg-green-50 text-green-600 rounded-full flex items-center justify-center text-xl">
                        <FiCheckCircle />
                    </div>
                </motion.div>

                <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.2 }} className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-center justify-between">
                    <div>
                        <p className="text-gray-500 text-sm font-medium mb-1">Remaining Balance</p>
                        <h3 className="text-2xl font-bold text-red-600">₹{summary.remaining.toFixed(2)}</h3>
                    </div>
                    <div className="w-12 h-12 bg-red-50 text-red-600 rounded-full flex items-center justify-center text-xl">
                        <FiAlertCircle />
                    </div>
                </motion.div>
            </div>

            {/* Installments List */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-200 bg-gray-50 flex justify-between items-center">
                    <h2 className="text-lg font-semibold text-gray-800">Payment Schedule</h2>
                </div>

                {installments.length === 0 ? (
                    <div className="p-8 text-center text-gray-500">
                        No fee installments scheduled.
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-white border-b border-gray-200">
                                    <th className="p-4 text-sm font-semibold text-gray-600">#</th>
                                    <th className="p-4 text-sm font-semibold text-gray-600">Due Date</th>
                                    <th className="p-4 text-sm font-semibold text-gray-600">Total Amount</th>
                                    <th className="p-4 text-sm font-semibold text-gray-600">Remaining</th>
                                    <th className="p-4 text-sm font-semibold text-gray-600 text-center">Status</th>
                                    <th className="p-4 text-sm font-semibold text-gray-600 text-right">Action</th>
                                </tr>
                            </thead>
                            <tbody>
                                {installments.map((inst, idx) => {
                                    const status = getStatusConfig(inst.status, inst.dueDate);
                                    const amount = Number(inst.installmentAmount || 0);
                                    const paid = Number(inst.paidAmount || 0);
                                    const remaining = amount - paid;
                                    const dueStr = new Date(inst.dueDate).toLocaleDateString('en-GB');

                                    const isPaid = inst.status === 'PAID';
                                    const isProcessing = processingId === (inst.installmentId || inst.id);

                                    return (
                                        <tr key={inst.installmentId || idx} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                                            <td className="p-4 text-gray-800 font-medium">Installment {inst.installmentNumber || (idx + 1)}</td>
                                            <td className="p-4 text-gray-600">{dueStr}</td>
                                            <td className="p-4 text-gray-800 font-medium">₹{amount.toFixed(2)}</td>
                                            <td className="p-4 text-gray-800 font-bold">₹{remaining.toFixed(2)}</td>
                                            <td className="p-4">
                                                <div className="flex justify-center">
                                                    <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${status.bg} ${status.color}`}>
                                                        <span className="mr-1.5">{status.icon}</span>
                                                        {status.label}
                                                    </span>
                                                </div>
                                            </td>
                                            <td className="p-4 text-right">
                                                {isPaid ? (
                                                    <button
                                                        className="inline-flex items-center justify-center px-4 py-2 text-sm font-medium text-blue-600 bg-blue-50 border border-blue-100 rounded-lg hover:bg-blue-100 transition-colors"
                                                        onClick={() => alert('Receipt download feature coming soon!')}
                                                    >
                                                        <FiDownload className="mr-2" />
                                                        Receipt
                                                    </button>
                                                ) : (
                                                    <button
                                                        disabled={isProcessing}
                                                        className={`inline-flex items-center justify-center px-4 py-2 text-sm font-medium text-white rounded-lg transition-colors shadow-sm
                                                            ${isProcessing ? 'bg-blue-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700'}`}
                                                        onClick={() => handlePayOnline(inst)}
                                                    >
                                                        <FiCreditCard className="mr-2" />
                                                        {isProcessing ? 'Processing...' : `Pay ₹${remaining.toFixed(2)}`}
                                                    </button>
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
    );
};

export default ParentFeePage;
