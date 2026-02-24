import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FiDollarSign, FiCalendar, FiCheckCircle, FiAlertCircle, FiClock, FiDownload } from 'react-icons/fi';
import { useAuth } from '../../../pages/Library/context/AuthContext';
import apiFetch, { getUrl } from '../../../services/api';

const StudentFeePage = () => {
    const { user } = useAuth();
    const [installments, setInstallments] = useState([]);
    const [summary, setSummary] = useState({ total: 0, paid: 0, remaining: 0 });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchFeeData = async () => {
            if (!user?.id) return;
            try {
                // Fetch Installments By Student ID (New API Endpoint built earlier)
                const res = await apiFetch(getUrl(`/installments/student/${user.id}`));
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
                console.error("Failed to fetch student fee data:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchFeeData();
    }, [user]);

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

    if (loading) {
        return <div className="flex justify-center items-center h-64">Loading fee details...</div>;
    }

    return (
        <div className="p-6 max-w-6xl mx-auto">
            <h1 className="text-2xl font-bold mb-6 text-gray-800">My Fee Details</h1>

            {/* Warning Message if Overdue */}
            {installments.some(i => getStatusConfig(i.status, i.dueDate).label === 'Overdue') && (
                <div className="mb-6 p-4 bg-red-50 border-l-4 border-red-500 text-red-700 flex items-center shadow-sm">
                    <FiAlertCircle className="mr-3 text-xl" />
                    <div>
                        <h3 className="font-bold">Payment Overdue</h3>
                        <p className="text-sm">You have overdue installments. Please pay immediately or contact the administration.</p>
                    </div>
                </div>
            )}

            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-center justify-between">
                    <div>
                        <p className="text-gray-500 text-sm font-medium mb-1">Total Fee</p>
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
                <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
                    <h2 className="text-lg font-semibold text-gray-800">Fee Installments</h2>
                </div>

                {installments.length === 0 ? (
                    <div className="p-8 text-center text-gray-500">
                        No fee installments found for your account.
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-white border-b border-gray-200">
                                    <th className="p-4 text-sm font-semibold text-gray-600">#</th>
                                    <th className="p-4 text-sm font-semibold text-gray-600">Due Date</th>
                                    <th className="p-4 text-sm font-semibold text-gray-600">Amount</th>
                                    <th className="p-4 text-sm font-semibold text-gray-600">Paid</th>
                                    <th className="p-4 text-sm font-semibold text-gray-600 text-center">Status</th>
                                    <th className="p-4 text-sm font-semibold text-gray-600 text-center">Receipt</th>
                                </tr>
                            </thead>
                            <tbody>
                                {installments.map((inst, idx) => {
                                    const status = getStatusConfig(inst.status, inst.dueDate);
                                    const amount = Number(inst.installmentAmount || 0);
                                    const paid = Number(inst.paidAmount || 0);
                                    const dueStr = new Date(inst.dueDate).toLocaleDateString('en-GB');

                                    return (
                                        <tr key={inst.installmentId || idx} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                                            <td className="p-4 text-gray-800 font-medium">Installment {inst.installmentNumber || (idx + 1)}</td>
                                            <td className="p-4 text-gray-600">{dueStr}</td>
                                            <td className="p-4 text-gray-800 font-medium">₹{amount.toFixed(2)}</td>
                                            <td className="p-4 text-gray-600">₹{paid.toFixed(2)}</td>
                                            <td className="p-4">
                                                <div className="flex justify-center">
                                                    <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${status.bg} ${status.color}`}>
                                                        <span className="mr-1.5">{status.icon}</span>
                                                        {status.label}
                                                    </span>
                                                </div>
                                            </td>
                                            <td className="p-4 text-center">
                                                {(inst.status === 'PAID' || inst.status === 'PARTIALLY_PAID') ? (
                                                    <button
                                                        className="inline-flex items-center justify-center p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                                        title="Download Receipt"
                                                        onClick={() => alert('Receipt download feature coming soon!')}
                                                    >
                                                        <FiDownload />
                                                    </button>
                                                ) : (
                                                    <span className="text-gray-300">-</span>
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

export default StudentFeePage;
