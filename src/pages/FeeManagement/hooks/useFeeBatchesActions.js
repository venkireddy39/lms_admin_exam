import { useState, useCallback } from 'react';

export const useFeeBatchesActions = ({ 
    selectedStudent, 
    selectedBatch, 
    feeDetails, 
    setFeeDetails, 
    setBatches, 
    setSelectedBatch,
    students,
    setStudents
}) => {
    // Discount State
    const [showDiscountModal, setShowDiscountModal] = useState(false);
    const [discountForm, setDiscountForm] = useState({ amount: '', reason: '' });

    // Payment State
    const [showPaymentModal, setShowPaymentModal] = useState(false);
    const [paymentForm, setPaymentForm] = useState({
        amount: '',
        mode: 'Online',
        reference: '',
        date: new Date().toISOString().split('T')[0]
    });

    const handleApplyDiscount = useCallback(() => {
        if (feeDetails.pendingAmount <= 0) {
            return alert("Cannot apply discount: Student has already paid full fees (or excess).");
        }
        setShowDiscountModal(true);
    }, [feeDetails]);

    const submitDiscount = useCallback(() => {
        if (!discountForm.amount || !discountForm.reason) return alert('Please fill all fields');
        const discountAmt = Number(discountForm.amount);

        if (discountAmt <= 0) return alert('Invalid amount');

        if (discountAmt > feeDetails.pendingAmount) {
            return alert(`Discount cannot exceed pending amount (₹${feeDetails.pendingAmount.toLocaleString()}).`);
        }

        setFeeDetails(prev => {
            const newTotal = prev.totalFee - discountAmt;
            const newStructure = [...prev.structure, { name: `Discount (${discountForm.reason})`, amount: -discountAmt }];

            return {
                ...prev,
                totalFee: newTotal,
                pendingAmount: newTotal - prev.paidAmount,
                structure: newStructure
            };
        });

        setShowDiscountModal(false);
        setDiscountForm({ amount: '', reason: '' });
        alert(`Discount of ₹${discountAmt} applied successfully.`);
    }, [discountForm, feeDetails, setFeeDetails]);

    const handleRecordPayment = useCallback(() => {
        if (feeDetails.pendingAmount <= 0) return alert("Fee is fully paid. Cannot record further payments.");
        if (!paymentForm.amount || Number(paymentForm.amount) <= 0) return alert("Please enter a valid amount");

        const payAmount = Number(paymentForm.amount);
        const currentPending = feeDetails.totalFee - feeDetails.paidAmount;

        if (payAmount > currentPending) {
            return alert(`Payment exceeds pending amount. Maximum payable: ₹${currentPending.toLocaleString()}`);
        }

        setFeeDetails(prev => {
            const newPaid = prev.paidAmount + payAmount;
            const newPending = prev.totalFee - newPaid;

            const newPayment = {
                id: Date.now(),
                date: new Date(paymentForm.date).toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' }),
                mode: paymentForm.mode,
                reference: paymentForm.reference || `#${Math.floor(Math.random() * 10000)}`,
                amount: payAmount
            };

            return {
                ...prev,
                paidAmount: newPaid,
                pendingAmount: newPending,
                payments: [newPayment, ...(prev.payments || [])]
            };
        });

        // Persist logic (simulated in original as well)
        const allBatches = JSON.parse(localStorage.getItem('lms_fee_data') || '[]');
        const updatedBatches = allBatches.map(b => {
            if (b.id === selectedBatch?.id) {
                const sIndex = b.studentList?.findIndex(s => s.id === selectedStudent?.id);
                if (sIndex !== -1 && b.studentList) {
                    const student = b.studentList[sIndex];
                    student.paidAmount = (student.paidAmount || 0) + payAmount;
                    if (student.paidAmount >= student.totalFee) student.status = 'PAID';
                    else if (student.paidAmount > 0) student.status = 'PARTIAL';
                    
                    if (!student.payments) student.payments = [];
                    student.payments.push({
                        id: Date.now(),
                        amount: payAmount,
                        date: paymentForm.date,
                        mode: paymentForm.mode,
                        reference: paymentForm.reference
                    });
                }
            }
            return b;
        });
        localStorage.setItem('lms_fee_data', JSON.stringify(updatedBatches));

        setShowPaymentModal(false);
        setPaymentForm({ amount: '', mode: 'Online', reference: '', date: new Date().toISOString().split('T')[0] });
        alert("Payment Recorded Successfully!");
    }, [feeDetails, paymentForm, selectedBatch, selectedStudent, setFeeDetails]);

    const handleRemoveStudent = useCallback((e, studentId) => {
        e.stopPropagation();
        if (!window.confirm('Remove this student from the batch?')) return;

        const updatedStudents = students.filter(s => s.id !== studentId);
        setStudents(updatedStudents);

        if (selectedBatch && String(selectedBatch.id).startsWith('custom-')) {
            const storedBatches = JSON.parse(localStorage.getItem('userCreatedBatches') || '[]');
            const batchIndex = storedBatches.findIndex(b => b.id === selectedBatch.id);

            if (batchIndex !== -1) {
                storedBatches[batchIndex].studentList = updatedStudents;
                storedBatches[batchIndex].students = updatedStudents.length;
                localStorage.setItem('userCreatedBatches', JSON.stringify(storedBatches));

                setBatches(prev => prev.map(b => b.id === selectedBatch.id ? {
                    ...b,
                    students: updatedStudents.length,
                    studentList: updatedStudents
                } : b));

                setSelectedBatch(prev => ({ ...prev, students: updatedStudents.length, studentList: updatedStudents }));
            }
        }
    }, [selectedBatch, students, setStudents, setBatches, setSelectedBatch]);

    const handleDeleteBatch = useCallback((e, batchId) => {
        e.stopPropagation();
        if (!window.confirm('Are you sure you want to delete this fee batch?')) return;

        setBatches(prev => prev.filter(b => b.id !== batchId));

        if (String(batchId).startsWith('custom-')) {
            const storedBatches = JSON.parse(localStorage.getItem('userCreatedBatches') || '[]');
            const updatedStored = storedBatches.filter(b => b.id !== batchId);
            localStorage.setItem('userCreatedBatches', JSON.stringify(updatedStored));
        }
    }, [setBatches]);

    return {
        showDiscountModal,
        setShowDiscountModal,
        discountForm,
        setDiscountForm,
        showPaymentModal,
        setShowPaymentModal,
        paymentForm,
        setPaymentForm,
        handleApplyDiscount,
        submitDiscount,
        handleRecordPayment,
        handleRemoveStudent,
        handleDeleteBatch
    };
};
