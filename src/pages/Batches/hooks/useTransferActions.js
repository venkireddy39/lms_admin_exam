import { useState } from 'react';
import { enrollmentService } from '../services/enrollmentService';

export const useTransferActions = ({
    batchId,
    batchDetails,
    otherBatches,
    user,
    setEnrolledStudents,
    loadData
}) => {
    const [transferModal, setTransferModal] = useState({ isOpen: false, student: null });
    const [selectedTransferBatch, setSelectedTransferBatch] = useState('');
    const [transferReason, setTransferReason] = useState('');

    const openTransferModal = (student) => {
        setTransferModal({ isOpen: true, student });
        setSelectedTransferBatch('');
        setTransferReason('');
    };

    const confirmTransfer = async () => {
        if (!selectedTransferBatch || !transferModal.student) return;

        const targetBatchId = String(selectedTransferBatch);
        if (targetBatchId === String(batchId)) {
            alert("Cannot transfer to the same batch.");
            return;
        }

        try {
            const targetBatch = otherBatches.find(b => String(b.batchId || b.id) === targetBatchId);
            const targetStudents = await enrollmentService.getStudentsByBatch(targetBatchId).catch(() => []);
            const targetMax = targetBatch?.maxStudents || targetBatch?.capacity || 0;

            if (targetMax > 0 && targetStudents.length >= targetMax) {
                alert(`Cannot transfer! Target batch "${targetBatch?.batchName}" is full.`);
                return;
            }

            const isAlreadyInTarget = targetStudents.some(s => String(s.studentId) === String(transferModal.student.studentId));
            if (isAlreadyInTarget) {
                if (window.confirm(`Student is already active in target batch. Remove from current batch?`)) {
                    await enrollmentService.removeStudentFromBatch(transferModal.student.studentBatchId);
                    setEnrolledStudents(prev => prev.filter(s => s.studentBatchId !== transferModal.student.studentBatchId));
                    setTransferModal({ isOpen: false, student: null });
                }
                return;
            }

            await enrollmentService.transferStudent({
                studentBatchId: transferModal.student.studentBatchId,
                studentId: transferModal.student.studentId,
                studentName: transferModal.student.studentName,
                studentEmail: transferModal.student.studentEmail,
                courseId: batchDetails.courseId,
                toBatchId: Number(targetBatchId),
                reason: transferReason || "Administrative Transfer",
                transferredBy: user?.name || user?.username || "Admin"
            });

            setEnrolledStudents(prev => prev.filter(s => 
                String(s.studentId) !== String(transferModal.student.studentId) &&
                String(s.studentBatchId) !== String(transferModal.student.studentBatchId)
            ));

            setTimeout(() => loadData(), 1000);
            setTransferModal({ isOpen: false, student: null });
            alert(`Successfully transferred to ${targetBatch?.batchName}`);
        } catch (err) {
            console.error("Transfer execution failed:", err);
            alert("Transfer failed: " + (err.message || "Unknown error"));
        }
    };

    return {
        transferModal,
        setTransferModal,
        selectedTransferBatch,
        setSelectedTransferBatch,
        transferReason,
        setTransferReason,
        openTransferModal,
        confirmTransfer
    };
};
