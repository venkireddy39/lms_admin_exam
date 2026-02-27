import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { feeAllocationService } from '../api';

const FeeAllocationDetailPage = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [allocation, setAllocation] = useState(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        fetchAllocationDetails();
    }, [id]);

    const fetchAllocationDetails = async () => {
        try {
            setIsLoading(true);
            const response = await feeAllocationService.getById(id);
            setAllocation(response.data);
        } catch (error) {
            toast.error('Failed to load allocation details');
        } finally {
            setIsLoading(false);
        }
    };

    if (isLoading) {
        return (
            <div className="flex justify-center items-center h-64">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
            </div>
        );
    }

    if (!allocation) {
        return (
            <div className="p-6 text-center">
                <p className="text-gray-500 mb-4">Allocation not found.</p>
                <button
                    onClick={() => navigate('/admin/fee-allocations')}
                    className="text-indigo-600 hover:underline"
                >
                    Back to List
                </button>
            </div>
        );
    }

    return (
        <div className="p-6 max-w-4xl mx-auto space-y-6">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold text-gray-800">Allocation Details</h1>
                <button
                    onClick={() => navigate('/admin/fee-allocations')}
                    className="text-gray-500 hover:text-gray-700"
                >
                    Back
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                    <h2 className="text-lg font-semibold text-gray-700 border-b pb-2 mb-4">Summary</h2>
                    <div className="space-y-3">
                        <div className="flex justify-between text-sm">
                            <span className="text-gray-500">Original Amount:</span>
                            <span className="font-medium">{allocation.originalAmount || 0}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                            <span className="text-gray-500">Discount Amount:</span>
                            <span className="font-medium text-green-600">-{allocation.discountAmount || 0}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                            <span className="text-gray-500">GST Amount:</span>
                            <span className="font-medium">{allocation.gstAmount || 0}</span>
                        </div>
                        <div className="flex justify-between text-sm font-semibold pt-2 border-t mt-2">
                            <span className="text-gray-800">Payable Amount:</span>
                            <span className="text-indigo-700">{allocation.payableAmount || 0}</span>
                        </div>
                    </div>
                </div>

                <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                    <h2 className="text-lg font-semibold text-gray-700 border-b pb-2 mb-4">Status</h2>
                    <div className="space-y-3">
                        <div className="flex justify-between text-sm">
                            <span className="text-gray-500">Remaining Amount:</span>
                            <span className="font-medium text-red-600">{allocation.remainingAmount || 0}</span>
                        </div>
                        <div className="flex justify-between text-sm items-center">
                            <span className="text-gray-500">Status:</span>
                            <span className={`px-2 py-1 rounded text-xs font-semibold ${allocation.status === 'PAID'
                                    ? 'bg-green-100 text-green-800'
                                    : allocation.status === 'PARTIAL'
                                        ? 'bg-yellow-100 text-yellow-800'
                                        : 'bg-red-100 text-red-800'
                                }`}>
                                {allocation.status || 'PENDING'}
                            </span>
                        </div>
                    </div>
                </div>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                <h2 className="text-lg font-semibold text-gray-700 border-b pb-2 mb-4">Installments</h2>

                {allocation.installments && allocation.installments.length > 0 ? (
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y-2 divide-gray-200 bg-white text-sm">
                            <thead className="bg-gray-50 text-left">
                                <tr>
                                    <th className="whitespace-nowrap px-4 py-3 font-medium text-gray-900">#</th>
                                    <th className="whitespace-nowrap px-4 py-3 font-medium text-gray-900">Due Date</th>
                                    <th className="whitespace-nowrap px-4 py-3 font-medium text-gray-900">Amount</th>
                                    <th className="whitespace-nowrap px-4 py-3 font-medium text-gray-900">Paid Amount</th>
                                    <th className="whitespace-nowrap px-4 py-3 font-medium text-gray-900">Status</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200">
                                {allocation.installments.map((inst, index) => (
                                    <tr key={inst.id || index} className="hover:bg-gray-50">
                                        <td className="whitespace-nowrap px-4 py-3 text-gray-700">{inst.installmentNumber || index + 1}</td>
                                        <td className="whitespace-nowrap px-4 py-3 text-gray-700">{inst.dueDate || 'N/A'}</td>
                                        <td className="whitespace-nowrap px-4 py-3 text-gray-700">{inst.amount || 0}</td>
                                        <td className="whitespace-nowrap px-4 py-3 text-gray-700">{inst.paidAmount || 0}</td>
                                        <td className="whitespace-nowrap px-4 py-3 text-gray-700">
                                            <span className={`px-2 py-1 rounded text-xs font-semibold ${inst.status === 'PAID'
                                                    ? 'bg-green-100 text-green-800'
                                                    : inst.status === 'PARTIAL'
                                                        ? 'bg-yellow-100 text-yellow-800'
                                                        : 'bg-red-100 text-red-800'
                                                }`}>
                                                {inst.status || 'PENDING'}
                                            </span>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                ) : (
                    <p className="text-gray-500 text-sm text-center py-4">No installments found.</p>
                )}
            </div>
        </div>
    );
};

export default FeeAllocationDetailPage;
