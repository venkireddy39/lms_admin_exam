import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { FiSettings } from 'react-icons/fi';

import { useAuth } from '../Library/context/AuthContext';
import EnrollmentFeeModal from './components/EnrollmentFeeModal';
import AttendanceTab from './tabs/AttendanceTab';
import ClassesTab from './tabs/ClassesTab';
import './styles/BatchBuilder.css';

// Hooks
import { useBatchData } from './hooks/useBatchData';
import { useEnrollmentActions } from './hooks/useEnrollmentActions';
import { useFeeActions } from './hooks/useFeeActions';
import { useTransferActions } from './hooks/useTransferActions';

// Components
import BatchBuilderHeader from './components/BatchBuilder/BatchBuilderHeader';
import MemberManagementSection from './components/BatchBuilder/MemberManagementSection';
import StudentTable from './components/BatchBuilder/StudentTable';
import AddStudentModal from './components/BatchBuilder/AddStudentModal';
import TransferStudentModal from './components/BatchBuilder/TransferStudentModal';
import FeeDetailsModal from './components/BatchBuilder/FeeDetailsModal';

const BatchBuilder = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { user } = useAuth();
    const [activeTab, setActiveTab] = useState('students');
    
    // UI Modals State
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [isFeeModalOpen, setIsFeeModalOpen] = useState(false);
    
    // Selection State
    const [selectedPotentialStudents, setSelectedPotentialStudents] = useState([]);
    
    // Pending Enrollment Data (for Fee Modal)
    const [pendingEnrollmentStructure, setPendingEnrollmentStructure] = useState(null);
    const [pendingEnrollmentStudents, setPendingEnrollmentStudents] = useState([]);

    // 1. Data Hook
    const {
        batchDetails,
        enrolledStudents,
        setEnrolledStudents,
        allUsers,
        otherBatches,
        loading,
        searchQuery,
        setSearchQuery,
        availableStudents,
        loadData
    } = useBatchData(id, navigate);

    // 2. Enrollment Hook
    const {
        handleAddStudents,
        executeEnrollment,
        removeStudent
    } = useEnrollmentActions({
        batchId: id,
        batchDetails,
        enrolledStudents,
        setEnrolledStudents,
        allUsers,
        setSelectedPotentialStudents,
        setIsAddModalOpen,
        setPendingEnrollmentStructure,
        setPendingEnrollmentStudents,
        setIsFeeModalOpen
    });

    // 3. Fee Hook
    const {
        feeDetailsModal,
        setFeeDetailsModal,
        editFeeData,
        setEditFeeData,
        openFeeDetails,
        openEditFeeModal,
        confirmEnrollmentWithFee
    } = useFeeActions({
        batchId: id,
        loadData,
        setIsFeeModalOpen,
        setPendingEnrollmentStructure,
        setPendingEnrollmentStudents,
        executeEnrollment
    });

    // 4. Transfer Hook
    const {
        transferModal,
        setTransferModal,
        selectedTransferBatch,
        setSelectedTransferBatch,
        transferReason,
        setTransferReason,
        openTransferModal,
        confirmTransfer
    } = useTransferActions({
        batchId: id,
        batchDetails,
        otherBatches,
        user,
        setEnrolledStudents,
        loadData
    });

    const toggleSelection = (userId) => {
        setSelectedPotentialStudents(prev => 
            prev.includes(userId) ? prev.filter(id => id !== userId) : [...prev, userId]
        );
    };

    if (loading) return (
        <div className="d-flex align-items-center justify-content-center" style={{ minHeight: 200 }}>
            <div className="spinner-border text-primary" role="status" />
            <span className="ms-3 text-muted">Loading Batch Builder...</span>
        </div>
    );

    return (
        <div className="container-fluid px-3 px-md-4 py-3">
            <BatchBuilderHeader 
                id={id} 
                activeTab={activeTab} 
                setActiveTab={setActiveTab} 
                navigate={navigate} 
            />

            {/* Tab Content */}
            {activeTab === 'overview' ? (
                <ClassesTab
                    batchId={id}
                    courseId={batchDetails?.courseId}
                    instructorName={batchDetails?.trainerName}
                />
            ) : activeTab === 'students' ? (
                <MemberManagementSection 
                    batchDetails={batchDetails} 
                    enrolledStudents={enrolledStudents} 
                    setIsAddModalOpen={setIsAddModalOpen}
                >
                    <StudentTable 
                        enrolledStudents={enrolledStudents}
                        openFeeDetails={openFeeDetails}
                        openEditFeeModal={openEditFeeModal}
                        openTransferModal={openTransferModal}
                        removeStudent={removeStudent}
                    />
                </MemberManagementSection>
            ) : activeTab === 'attendance' ? (
                <AttendanceTab batchId={id} />
            ) : (
                <div className="text-center py-5 text-muted">
                    <FiSettings size={40} className="mb-3 opacity-25" />
                    <h6>Module Not Found</h6>
                </div>
            )}

            {/* Modals */}
            <AddStudentModal 
                isOpen={isAddModalOpen}
                onClose={() => setIsAddModalOpen(false)}
                batchDetails={batchDetails}
                enrolledStudents={enrolledStudents}
                searchQuery={searchQuery}
                setSearchQuery={setSearchQuery}
                availableStudents={availableStudents}
                selectedPotentialStudents={selectedPotentialStudents}
                toggleSelection={toggleSelection}
                handleAddStudents={handleAddStudents}
            />

            <TransferStudentModal 
                isOpen={transferModal.isOpen}
                onClose={() => setTransferModal({ isOpen: false, student: null })}
                student={transferModal.student}
                otherBatches={otherBatches}
                selectedTransferBatch={selectedTransferBatch}
                setSelectedTransferBatch={setSelectedTransferBatch}
                transferReason={transferReason}
                setTransferReason={setTransferReason}
                confirmTransfer={confirmTransfer}
            />

            <FeeDetailsModal 
                isOpen={feeDetailsModal.isOpen}
                onClose={() => setFeeDetailsModal(prev => ({ ...prev, isOpen: false }))}
                student={feeDetailsModal.student}
                fees={feeDetailsModal.fees}
                installments={feeDetailsModal.installments}
                loading={feeDetailsModal.loading}
                openEditFeeModal={openEditFeeModal}
            />

            <EnrollmentFeeModal
                isOpen={isFeeModalOpen}
                onClose={() => {
                    setIsFeeModalOpen(false);
                    setEditFeeData(null);
                }}
                onConfirm={(config) => confirmEnrollmentWithFee(config, pendingEnrollmentStudents, pendingEnrollmentStructure)}
                feeStructure={editFeeData ? editFeeData.structure : pendingEnrollmentStructure}
                studentCount={editFeeData ? 1 : pendingEnrollmentStudents.length}
                initialData={editFeeData ? editFeeData.initialData : null}
            />
        </div>
    );
};

export default BatchBuilder;
