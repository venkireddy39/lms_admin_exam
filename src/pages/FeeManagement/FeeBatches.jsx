import React, { useEffect } from 'react';
import { AnimatePresence } from 'framer-motion';
import './FeeManagement.css';

// Hooks
import { useFeeBatchesData } from './hooks/useFeeBatchesData';
import { useFeeBatchesNavigation } from './hooks/useFeeBatchesNavigation';
import { useFeeBatchesActions } from './hooks/useFeeBatchesActions';

// Components
import FeeBatchesGrid from './components/FeeBatches/FeeBatchesGrid';
import FeeStudentsList from './components/FeeBatches/FeeStudentsList';
import StudentFeeDetail from './components/FeeBatches/StudentFeeDetail';
import DiscountModal from './components/FeeBatches/DiscountModal';
import PaymentModal from './components/FeeBatches/PaymentModal';

const FeeBatches = () => {
    // 1. Navigation Hook
    const { 
        view, setView, selectedBatch, setSelectedBatch, 
        selectedStudent, setSelectedStudent, handleBack 
    } = useFeeBatchesNavigation();

    // 2. Data Hook
    const {
        batches, setBatches, students, setStudents, feeDetails, setFeeDetails,
        loading, error, initializeData, fetchBatchStudents, fetchStudentFeeDetails
    } = useFeeBatchesData();

    // 3. Actions Hook
    const {
        showDiscountModal, setShowDiscountModal, discountForm, setDiscountForm,
        showPaymentModal, setShowPaymentModal, paymentForm, setPaymentForm,
        handleApplyDiscount, submitDiscount, handleRecordPayment,
        handleRemoveStudent, handleDeleteBatch
    } = useFeeBatchesActions({
        selectedStudent, selectedBatch, feeDetails, setFeeDetails, 
        setBatches, setSelectedBatch, students, setStudents
    });

    // --- Initial Effect ---
    useEffect(() => {
        initializeData();
    }, [initializeData]);

    // --- Event Handlers ---
    const handleBatchClick = async (batch) => {
        setSelectedBatch(batch);
        try {
            await fetchBatchStudents(batch);
            setView('list');
        } catch (err) {
            setView('list'); // Still navigate but showing empty/error state
        }
    };

    const handleStudentClick = async (student) => {
        setSelectedStudent(student);
        try {
            await fetchStudentFeeDetails(student);
            setView('detail');
        } catch (err) {
            setView('detail');
        }
    };

    const handleBackWithReset = () => {
        handleBack(setFeeDetails, setStudents);
    };

    const handleDownloadReceipt = (paymentId) => {
        alert(`Downloading receipt for payment ${paymentId}...`);
    };

    const handleRefund = (paymentId) => {
        if (!window.confirm('Initiate Refund?')) return;
        alert('Refund Initiated (Simulated)');
    };

    if (error) {
        return <div className="glass-card" style={{ padding: 40, textAlign: 'center', color: 'red' }}>{error}</div>;
    }

    return (
        <>
            <AnimatePresence mode="wait">
                {view === 'grid' && (
                    <FeeBatchesGrid 
                        batches={batches}
                        loading={loading}
                        error={error}
                        onBatchClick={handleBatchClick}
                        onDeleteBatch={handleDeleteBatch}
                        onRetry={initializeData}
                    />
                )}
                {view === 'list' && (
                    <FeeStudentsList 
                        selectedBatch={selectedBatch}
                        students={students}
                        loading={loading}
                        onBack={handleBackWithReset}
                        onStudentClick={handleStudentClick}
                        onRemoveStudent={handleRemoveStudent}
                    />
                )}
                {view === 'detail' && (
                    <StudentFeeDetail 
                        selectedStudent={selectedStudent}
                        selectedBatch={selectedBatch}
                        feeDetails={feeDetails}
                        onBack={handleBackWithReset}
                        onApplyDiscount={handleApplyDiscount}
                        onRecordPayment={() => setShowPaymentModal(true)}
                        onDownloadReceipt={handleDownloadReceipt}
                        onRefund={handleRefund}
                    />
                )}
            </AnimatePresence>

            {/* Modals */}
            {showDiscountModal && (
                <DiscountModal 
                    discountForm={discountForm}
                    setDiscountForm={setDiscountForm}
                    onClose={() => setShowDiscountModal(false)}
                    onSubmit={submitDiscount}
                />
            )}

            {showPaymentModal && (
                <PaymentModal 
                    selectedStudent={selectedStudent}
                    feeDetails={feeDetails}
                    paymentForm={paymentForm}
                    setPaymentForm={setPaymentForm}
                    onClose={() => setShowPaymentModal(false)}
                    onSubmit={handleRecordPayment}
                />
            )}
        </>
    );
};

export default FeeBatches;
