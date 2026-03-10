import { useState } from 'react';
import { feeStructureService } from '../../FeeManagement/services/feeStructureService';
import { getStudentFee, getStudentInstallments, createFeeAllocation, createInstallmentPlan, updateFeeAllocation, overrideInstallmentPlan } from '../../../services/feeService';

export const useFeeActions = ({
    batchId,
    loadData,
    setIsFeeModalOpen,
    setPendingEnrollmentStructure,
    setPendingEnrollmentStudents,
    executeEnrollment
}) => {
    const [feeDetailsModal, setFeeDetailsModal] = useState({ isOpen: false, student: null, fees: [], installments: [], loading: false });
    const [editFeeData, setEditFeeData] = useState(null);

    const openFeeDetails = async (student) => {
        setFeeDetailsModal({ isOpen: true, student, fees: [], installments: [], loading: true });
        try {
            const feeLookupId = student.userId || student.studentId || student.id;
            const fees = await getStudentFee(feeLookupId).catch(() => []);
            const allFeeRecords = Array.isArray(fees) ? fees : (fees ? [fees] : []);
            const batchIdNum = Number(batchId);
            const feeRecords = allFeeRecords.filter(f => Number(f.batchId) === batchIdNum);

            let installments = [];
            if (feeRecords.length > 0) {
                const allocationId = feeRecords[0].allocationId || feeRecords[0].id;
                if (allocationId) {
                    installments = await getStudentInstallments(allocationId).catch(() => []);
                }
            }

            setFeeDetailsModal(prev => ({ ...prev, fees: feeRecords, installments, loading: false }));
        } catch (error) {
            console.error("Failed to load fee details", error);
            setFeeDetailsModal(prev => ({ ...prev, loading: false }));
        }
    };

    const openEditFeeModal = async (student) => {
        try {
            const studentId = student.studentId || student.userId || student.id;
            const feeRecords = await getStudentFee(studentId).catch(() => []);
            const structures = await feeStructureService.getFeeStructuresByBatch(batchId).catch(() => []);

            if (!structures || structures.length === 0) {
                alert("No active fee structure found for this batch.");
                return;
            }

            const activeStructure = structures.find(s => s.isActive) || structures[0];
            const batchIdNum = Number(batchId);
            const feeArray = Array.isArray(feeRecords) ? feeRecords : (feeRecords ? [feeRecords] : []);
            const relevantFee = feeArray.find(f => Number(f.batchId) === batchIdNum);

            if (!relevantFee) {
                setEditFeeData({
                    student,
                    allocation: null,
                    structure: activeStructure,
                    initialData: {
                        isUpdate: false,
                        paymentMode: 'STANDARD',
                        specialDiscountValue: 0,
                        installments: activeStructure.installmentCount || 1,
                        schedule: []
                    }
                });
                setIsFeeModalOpen(true);
                return;
            }

            const allocationId = relevantFee.allocationId || relevantFee.id;
            const inst = await getStudentInstallments(allocationId).catch(() => []);

            setEditFeeData({
                student,
                allocation: relevantFee,
                structure: activeStructure,
                initialData: {
                    isUpdate: true,
                    paymentMode: relevantFee.paymentMode || 'STANDARD',
                    specialDiscountValue: relevantFee.specialDiscountValue || 0,
                    specialDiscountType: relevantFee.specialDiscountType || 'FLAT',
                    installments: inst?.length || 1,
                    schedule: inst || []
                }
            });
            setIsFeeModalOpen(true);
        } catch (error) {
            console.error("Error opening edit modal:", error);
            alert("Failed to load current fee data.");
        }
    };

    const handleAssignFeeToExistingStudent = async (student, feeConfig, structure) => {
        try {
            const studentId = student?.studentId || student?.id || student?.userId;
            const userId = student?.userId || student?.studentId || student?.id;

            if (!userId) {
                alert("User ID missing. Cannot assign fee.");
                return;
            }

            const allocationPayload = {
                userId: Number(userId),
                studentId: Number(studentId),
                studentName: student?.firstName ? `${student.firstName} ${student.lastName || ""}`.trim() : (student?.name || "Unknown"),
                studentEmail: student?.email,
                feeStructureId: structure.id,
                batchId: Number(batchId),
                courseId: structure.courseId,
                originalAmount: feeConfig.baseAmount,
                gstRate: feeConfig.gstRate,
                adminDiscount: feeConfig.discountOverride || 0,
                additionalDiscount: 0,
                payableAmount: feeConfig.finalTotal,
                remainingAmount: feeConfig.finalTotal,
                paidAmount: 0,
                status: "ACTIVE",
                currency: "INR",
                installmentCount: feeConfig.installments || 1
            };

            const newAlloc = await createFeeAllocation(allocationPayload);
            const allocId = newAlloc?.id || newAlloc?.allocationId;

            if (!allocId) throw new Error("Allocation ID missing");

            const schedulePayload = (feeConfig.schedule || []).map(s => ({
                ...s,
                amount: Number(Number(s.installmentAmount || s.amount).toFixed(2)),
                installmentAmount: Number(Number(s.installmentAmount || s.amount).toFixed(2)),
                status: s.status || "PENDING"
            }));

            await createInstallmentPlan(allocId, schedulePayload);
            alert(`Fee structure assigned successfully to ${student.studentName || student.name}`);
            loadData();
        } catch (error) {
            console.error("Failed to assign fee", error);
            alert("Error: " + (error?.message || "Failed to assign fee."));
        }
    };

    const handleUpdateFeeDetails = async (allocationId, feeConfig) => {
        try {
            await updateFeeAllocation(allocationId, {
                originalAmount: feeConfig.baseAmount,
                adminDiscount: feeConfig.discountOverride,
                payableAmount: feeConfig.finalTotal,
                remainingAmount: feeConfig.finalTotal,
                installmentCount: feeConfig.installments || 1
            });

            const schedulePayload = (feeConfig.schedule || []).map(s => ({
                ...s,
                amount: Number(Number(s.installmentAmount || s.amount).toFixed(2)),
                installmentAmount: Number(Number(s.installmentAmount || s.amount).toFixed(2)),
                status: s.status || 'PENDING'
            }));

            await overrideInstallmentPlan(allocationId, schedulePayload);
            alert("✅ Fee details updated successfully!");
            loadData();
        } catch (error) {
            console.error("Failed to update fees", error);
            alert("Error: " + (error.message || "Failed to update fee record."));
        }
    };

    const confirmEnrollmentWithFee = async (feeConfig, pendingStudents, pendingStructure) => {
        const studentToAssign = editFeeData?.student;
        const isUpdate = editFeeData?.initialData?.isUpdate;
        const isAssignment = editFeeData && !isUpdate;

        setIsFeeModalOpen(false);

        if (isUpdate) {
            const allocationId = editFeeData.allocation?.allocationId || editFeeData.allocation?.id;
            await handleUpdateFeeDetails(allocationId, feeConfig);
        } else if (isAssignment) {
            await handleAssignFeeToExistingStudent(studentToAssign, feeConfig, editFeeData.structure);
        } else {
            await executeEnrollment(pendingStudents, feeConfig, pendingStructure);
        }

        setEditFeeData(null);
    };

    return {
        feeDetailsModal,
        setFeeDetailsModal,
        editFeeData,
        setEditFeeData,
        openFeeDetails,
        openEditFeeModal,
        confirmEnrollmentWithFee
    };
};
