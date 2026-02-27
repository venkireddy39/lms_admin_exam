import React, { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { feeAllocationService } from '../api';
import { feeStructureService } from '../../feeStructure/api';
import FormInput from '../../../components/common/FormInput';
// Assuming student service
import apiClient from '../../../services/apiClient';

const allocationSchema = z.object({
    userId: z.coerce.number().min(1, 'Please select a student'),
    feeStructureId: z.coerce.number().min(1, 'Please select a fee structure'),
    discountAmount: z.coerce.number().min(0, 'Discount cannot be negative').optional(),
});

const FeeAllocationFormPage = () => {
    const navigate = useNavigate();
    const [structures, setStructures] = useState([]);
    const [students, setStudents] = useState([]); // Simplified for dropdown/search

    const [previewResult, setPreviewResult] = useState(null);
    const [showPreviewModal, setShowPreviewModal] = useState(false);

    const {
        register,
        handleSubmit,
        watch,
        formState: { errors, isSubmitting },
    } = useForm({
        resolver: zodResolver(allocationSchema),
        defaultValues: {
            userId: 0,
            feeStructureId: 0,
            discountAmount: 0,
        },
    });

    const selectedStructureId = watch('feeStructureId');
    const selectedDiscount = watch('discountAmount');

    useEffect(() => {
        Promise.all([
            feeStructureService.getAll().catch(() => ({ data: [] })),
            // Mock students fetch
            apiClient.get('/api/students').catch(() => ({ data: [] })),
        ]).then(([structuresRes, studentsRes]) => {
            setStructures(structuresRes.data || []);
            const fetchedStudents = studentsRes.data?.length ? studentsRes.data : [
                { id: 101, name: 'John Doe', email: 'john@example.com' },
                { id: 102, name: 'Jane Smith', email: 'jane@example.com' }
            ];
            setStudents(fetchedStudents);
        });
    }, []);

    const selectedStructure = structures.find(s => Number(s.id) === Number(selectedStructureId));
    const calculatedPayable = selectedStructure ? (selectedStructure.totalAmount || 0) - (Number(selectedDiscount) || 0) : 0;

    const onSubmit = async (data) => {
        try {
            const response = await feeAllocationService.create(data);
            // Let's assume response.data contains generated installments
            setPreviewResult({
                payableAmount: calculatedPayable,
                installments: response.data?.installments || []
            });
            setShowPreviewModal(true);
            toast.success('Allocation created successfully');
        } catch (error) {
            toast.error(error.response?.data?.message || 'Error creating allocation');
        }
    };

    return (
        <div className="p-6 max-w-2xl mx-auto">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold text-gray-800">Assign Fee to Student</h1>
                <button
                    onClick={() => navigate('/admin/fee-allocations')}
                    className="text-gray-500 hover:text-gray-700"
                >
                    Back
                </button>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                    <div className="mb-4">
                        <label className="mb-1 block text-sm font-medium text-gray-700">Student *</label>
                        <select
                            {...register('userId')}
                            className="w-full rounded-md border border-gray-200 p-2 outline-none focus:ring-indigo-500 focus:border-indigo-500"
                        >
                            <option value={0}>Search Student...</option>
                            {students.map((s) => (
                                <option key={s.id} value={s.id}>{s.name} ({s.email})</option>
                            ))}
                        </select>
                        {errors.userId && <p className="mt-1 text-xs text-red-500">{errors.userId.message}</p>}
                    </div>

                    <div className="mb-4">
                        <label className="mb-1 block text-sm font-medium text-gray-700">Fee Structure *</label>
                        <select
                            {...register('feeStructureId')}
                            className="w-full rounded-md border border-gray-200 p-2 outline-none focus:ring-indigo-500 focus:border-indigo-500"
                        >
                            <option value={0}>Select Structure</option>
                            {structures.map((s) => (
                                <option key={s.id} value={s.id}>{s.name}</option>
                            ))}
                        </select>
                        {errors.feeStructureId && <p className="mt-1 text-xs text-red-500">{errors.feeStructureId.message}</p>}
                    </div>

                    <FormInput
                        label="Discount Amount"
                        type="number"
                        {...register('discountAmount')}
                        error={errors.discountAmount}
                        min={0}
                    />

                    <div className="bg-gray-50 p-4 rounded-md border border-gray-100 flex justify-between items-center">
                        <span className="text-gray-600 font-medium">Calculated Payable Amount:</span>
                        <span className="text-lg font-bold text-indigo-700">Total: {calculatedPayable > 0 ? calculatedPayable : 0}</span>
                    </div>

                    <div className="flex justify-end gap-3 pb-2">
                        <button
                            type="button"
                            onClick={() => navigate('/admin/fee-allocations')}
                            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={isSubmitting}
                            className="px-6 py-2 text-sm font-medium text-white bg-indigo-600 rounded-md hover:bg-indigo-700 disabled:opacity-50 flex items-center gap-2"
                        >
                            {isSubmitting && <div className="w-4 h-4 border-2 border-white rounded-full border-t-transparent animate-spin"></div>}
                            Assign & Generate Installments
                        </button>
                    </div>
                </form>
            </div>

            {showPreviewModal && previewResult && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 px-4">
                    <div className="bg-white rounded-lg p-6 max-w-lg w-full max-h-[80vh] overflow-y-auto">
                        <h3 className="text-xl font-bold mb-4">Installment Preview</h3>
                        <p className="mb-4 text-gray-600">
                            Successfully assigned! Payable amount: <span className="font-semibold text-gray-800">{previewResult.payableAmount}</span>
                        </p>

                        {previewResult.installments.length > 0 ? (
                            <ul className="space-y-2 mb-6">
                                {previewResult.installments.map((inst, idx) => (
                                    <li key={idx} className="flex justify-between p-3 bg-gray-50 border rounded text-sm">
                                        <span>Installment {inst.installmentNumber || idx + 1}</span>
                                        <span className="font-semibold">{inst.amount}</span>
                                    </li>
                                ))}
                            </ul>
                        ) : (
                            <p className="text-sm text-gray-500 italic mb-6">No installments generated or preview not available.</p>
                        )}

                        <button
                            onClick={() => {
                                setShowPreviewModal(false);
                                navigate('/admin/fee-allocations');
                            }}
                            className="w-full bg-indigo-600 text-white rounded py-2 font-medium"
                        >
                            Done
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default FeeAllocationFormPage;
