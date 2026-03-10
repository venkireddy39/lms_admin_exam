import { enrollmentService } from '../services/enrollmentService';
import { feeStructureService } from '../../FeeManagement/services/feeStructureService';
import { createFeeAllocation, overrideInstallmentPlan } from '../../../services/feeService';

export const useEnrollmentActions = ({
    batchId,
    batchDetails,
    enrolledStudents,
    setEnrolledStudents,
    allUsers,
    setSelectedPotentialStudents,
    setIsAddModalOpen,
    setPendingEnrollmentStructure,
    setPendingEnrollmentStudents,
    setIsFeeModalOpen
}) => {
    
    const handleAddStudents = async (selectedStudents) => {
        const currentEnrollment = enrolledStudents.length;
        const maxStudents = batchDetails?.maxStudents || batchDetails?.capacity;
        const selectedCount = selectedStudents.length;

        if (maxStudents && (currentEnrollment + selectedCount) > maxStudents) {
            const available = maxStudents - currentEnrollment;
            alert(`Batch capacity exceeded! Maximum capacity: ${maxStudents}\nCurrent enrollment: ${currentEnrollment}\nAttempting to add: ${selectedCount}\nAvailable spots: ${available}\n\nPlease select ${available} or fewer students.`);
            return;
        }

        try {
            const structures = await feeStructureService.getFeeStructuresByBatch(batchId).catch(e => []);
            const activeStructure = structures.find(s => s.active !== false);

            if (activeStructure) {
                setPendingEnrollmentStructure(activeStructure);
                setPendingEnrollmentStudents(selectedStudents);
                setIsFeeModalOpen(true);
            } else {
                if (window.confirm("No active Fee Structure found for this batch. Students will be enrolled without fee records. Continue?")) {
                    await executeEnrollment(selectedStudents, null, activeStructure);
                }
            }
        } catch (err) {
            console.error("Error checking fee structure:", err);
            alert("Error checking fee structure. Please try again.");
        }
    };

    const executeEnrollment = async (userIdsToEnroll, feeConfig, structure) => {
        if (!userIdsToEnroll || userIdsToEnroll.length === 0) return;

        try {
            // 1. Perform Enrollment
            const promises = userIdsToEnroll.map(userIdKey => {
                const student = allUsers.find(u => (u.userId || u.id) === userIdKey);
                const actualStudentId = student?.studentId || userIdKey;

                return enrollmentService.addStudentToBatch({
                    batchId: Number(batchId),
                    studentId: Number(actualStudentId),
                    studentName: student?.firstName ? `${student.firstName} ${student.lastName || ''}`.trim() : (student?.name || 'Unknown'),
                    studentEmail: student?.email,
                    courseId: batchDetails.courseId
                });
            });

            await Promise.all(promises);

            // 2. Refresh List
            const updatedStudents = await enrollmentService.getStudentsByBatch(batchId);
            setEnrolledStudents(updatedStudents);
            setSelectedPotentialStudents([]);
            setIsAddModalOpen(false);

            // 3. Create Fee Allocations
            if (structure && feeConfig) {
                const feePromises = userIdsToEnroll.map(async (qtyUserId) => {
                    const student = allUsers.find(u => (u.userId || u.id) === qtyUserId);
                    const studentId = Number(student?.studentId || qtyUserId);
                    const userId = Number(student?.userId || student?.id || qtyUserId);

                    const allocationPayload = {
                        userId: userId,
                        studentId: studentId,
                        studentName: student?.firstName ? `${student.firstName} ${student.lastName || ''}`.trim() : (student?.name || 'Unknown'),
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
                        status: 'ACTIVE',
                        currency: 'INR',
                        installmentCount: feeConfig.installments || 1
                    };

                    try {
                        const newAlloc = await createFeeAllocation(allocationPayload);
                        const allocId = newAlloc?.id || newAlloc?.allocationId;

                        const installments = (feeConfig.schedule || []).map(s => ({
                            ...s,
                            amount: Number(Number(s.installmentAmount || s.amount || (feeConfig.finalTotal / (feeConfig.installments || 1))).toFixed(2)),
                            installmentAmount: Number(Number(s.installmentAmount || s.amount || (feeConfig.finalTotal / (feeConfig.installments || 1))).toFixed(2)),
                            status: s.status || 'PENDING'
                        }));

                        if (installments.length > 0) {
                            await overrideInstallmentPlan(allocId, installments);
                        }
                    } catch (e) {
                        console.error("Fee/Installment Creation Failed for " + userId, e);
                    }
                });

                await Promise.all(feePromises);
                alert("Enrollment Successful! \n\n✅ Students added.\n💰 Fee Plan Applied");
            } else {
                alert("Enrollment Successful (No Fee Created).");
            }
        } catch (err) {
            console.error("Enrollment process error:", err);
            let errorMsg = err.message || "Failed to add students";
            alert(`Error adding students: ${errorMsg}`);
        }
    };

    const removeStudent = async (studentBatchId) => {
        if (window.confirm('Remove this student from the batch?')) {
            try {
                await enrollmentService.removeStudentFromBatch(studentBatchId);
                setEnrolledStudents(prev => prev.filter(s => s.studentBatchId !== studentBatchId));
                alert("Student removed successfully.");
            } catch (err) {
                console.error(err);
                alert("Failed to remove student");
            }
        }
    };

    return {
        handleAddStudents,
        executeEnrollment,
        removeStudent
    };
};
