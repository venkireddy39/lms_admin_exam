import { useState } from 'react';
import { 
    createInstallmentPlan, 
    overrideInstallmentPlan, 
    createBatchInstallmentPlan, 
    updateFeeAllocation, 
    createFee, 
    createFeeAllocation,
    getStudentFee,
    getStudentInstallments
} from '../../services/feeService';

export const useInstallmentPlans = (selectedBatch, selectedCourse, setBatches, setSelectedBatch) => {
    const [isSaving, setIsSaving] = useState(false);

    const saveBatchPlan = async (configuringBatch, installments, totals, planType, modalGST) => {
        if (!configuringBatch || !selectedBatch) return;

        const sum = installments.reduce((acc, curr) => acc + Number(curr.amount), 0);
        if (Math.abs(sum - totals.remainingToSplit) > 1) {
            alert(`Validation Error: Sum of installments (₹${sum}) must equal Remaining Payable (₹${totals.remainingToSplit.toFixed(2)}).`);
            return;
        }

        setIsSaving(true);
        try {
            const template = installments.map(i => ({
                installmentAmount: Number(i.amount),
                dueDate: i.dueDate,
                status: 'PENDING'
            }));

            const userIds = selectedBatch.studentList.map(s => s.userId || s.id);

            await createBatchInstallmentPlan(
                selectedBatch.batchId,
                template,
                userIds,
                totals.base,
                Number(selectedCourse),
                totals.advance,
                totals.adminDisc,
                totals.addDisc,
                totals.gstAmount > 0 ? modalGST : 0
            );

            const updatedList = selectedBatch.studentList.map(s => ({
                ...s,
                planType: planType,
                installments: template,
                totalFee: Number(totals.totalPayable.toFixed(2))
            }));

            const updatedBatch = { ...selectedBatch, studentList: updatedList };
            setSelectedBatch(updatedBatch);
            setBatches(prev => prev.map(b => b.batchId === selectedBatch.batchId ? updatedBatch : b));
            
            alert(`Successfully applied plan to ${selectedBatch.batchName}!`);
            return true;
        } catch (error) {
            alert("Failed to save batch plan: " + (error.response?.data?.message || error.message));
            return false;
        } finally {
            setIsSaving(false);
        }
    };

    const saveStudentPlan = async (configuringStudent, installments, totals, planType, modalGST) => {
        if (!configuringStudent || !selectedBatch) return;

        const sum = installments.reduce((acc, curr) => acc + Number(curr.amount), 0);
        if (Math.abs(sum - totals.remainingToSplit) > 1) {
            alert(`Validation Error: Sum check failed.`);
            return;
        }

        setIsSaving(true);
        try {
            let targetAllocationId = configuringStudent.allocationId;
            const feeData = await getStudentFee(configuringStudent.id);
            const allocations = Array.isArray(feeData) ? feeData : [feeData];
            const existingAlloc = allocations[0];

            if (existingAlloc) {
                targetAllocationId = existingAlloc.allocationId;
                await updateFeeAllocation(targetAllocationId, {
                    adminDiscount: totals.adminDisc,
                    additionalDiscount: totals.addDisc,
                    gstRate: Number(modalGST || 0),
                    advancePayment: totals.advance,
                    payableAmount: totals.totalPayable
                });
            } else {
                // Create new flow
                const newStructure = await createFee({
                    name: `Course Fee (Auto-Created)`,
                    totalAmount: totals.base,
                    currency: 'INR',
                    academicYear: '2025-26',
                    courseId: Number(selectedCourse),
                    batchId: Number(selectedBatch.batchId),
                    isActive: true,
                    feeTypeId: 1,
                    triggerOnCreation: true
                });

                const newAlloc = await createFeeAllocation({
                    userId: configuringStudent.id,
                    feeStructureId: newStructure.id,
                    originalAmount: totals.base,
                    adminDiscount: totals.adminDisc,
                    additionalDiscount: totals.addDisc,
                    gstRate: Number(modalGST || 0),
                    advancePayment: totals.advance,
                    payableAmount: totals.totalPayable,
                    studentEmail: configuringStudent.email
                });
                targetAllocationId = newAlloc.id;
            }

            const installmentPayload = installments.map(i => ({
                amount: Number(i.amount),
                dueDate: i.dueDate
            }));

            // Check if we should override or create
            let existingInst = [];
            try { existingInst = await getStudentInstallments(targetAllocationId); } catch(e){}

            if (existingInst && existingInst.length > 0) {
                await overrideInstallmentPlan(targetAllocationId, installmentPayload);
            } else {
                await createInstallmentPlan(targetAllocationId, installmentPayload.map(i => ({
                    installmentAmount: i.amount,
                    dueDate: i.dueDate,
                    status: 'PENDING'
                })));
            }

            alert("Successfully saved student plan!");
            return true;
        } catch (error) {
            alert("Failed to save student plan: " + error.message);
            return false;
        } finally {
            setIsSaving(false);
        }
    };

    return { saveBatchPlan, saveStudentPlan, isSaving };
};
