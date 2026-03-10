import React from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import './FeeManagement.css';

// Hooks
import { useCreateFeeData } from './hooks/useCreateFeeData';
import { useCreateFeeForm } from './hooks/useCreateFeeForm';
import { useDynamicFee } from './hooks/useDynamicFee';
import { useCreateFeeActions } from './hooks/useCreateFeeActions';

// Components
import CreateFeeHeader from './components/CreateFee/CreateFeeHeader';
import BasicDetailsSection from './components/CreateFee/BasicDetailsSection';
import DiscountSettingsSection from './components/CreateFee/DiscountSettingsSection';
import FeeAssignmentSection from './components/CreateFee/FeeAssignmentSection';
import PaymentConfigSection from './components/CreateFee/PaymentConfigSection';
import PaymentMethodsSection from './components/CreateFee/PaymentMethodsSection';
import NotificationSettingsSection from './components/CreateFee/NotificationSettingsSection';

const CreateFee = () => {
    const navigate = useNavigate();

    // 1. Centralized Form State
    const {
        basicDetails, setBasicDetails,
        handleBasicChange,
        discount, setDiscount,
        assignment, setAssignment,
        paymentConfig, setPaymentConfig,
        paymentMethods, setPaymentMethods,
        notifications, setNotifications,
        studentSearch, setStudentSearch,
        handleStudentSearchAdd,
        removeStudent,
        toggleNested
    } = useCreateFeeForm();

    // 2. Data Fetching
    const {
        availableBatches,
        availableCourses,
        searchableStudents,
        feeTypes
    } = useCreateFeeData(assignment.batch, assignment.course);

    // 3. Dynamic Amount Calculation
    useDynamicFee({
        basicDetails,
        setBasicDetails,
        assignment,
        availableBatches,
        availableCourses,
        searchableStudents
    });

    // 4. Form Actions (Submit)
    const { handleSubmit, saving } = useCreateFeeActions({
        basicDetails,
        discount,
        assignment,
        feeTypes
    });

    return (
        <motion.div
            className="fee-container"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
            style={{ width: '100%', overflowX: 'hidden' }}
        >
            <CreateFeeHeader 
                onBack={() => navigate('/fee')} 
                onSave={handleSubmit} 
                saving={saving} 
            />

            <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
                <BasicDetailsSection 
                    data={basicDetails} 
                    onChange={handleBasicChange} 
                    feeTypes={feeTypes} 
                />

                {basicDetails.type === 'Course Fee' && (
                    <DiscountSettingsSection
                        data={{ ...discount, targetType: assignment.targetType }}
                        setData={setDiscount}
                        courseAmount={basicDetails.amount}
                        admissionFee={basicDetails.admissionFee}
                    />
                )}

                <FeeAssignmentSection
                    data={assignment}
                    setData={setAssignment}
                    studentSearch={studentSearch}
                    setStudentSearch={setStudentSearch}
                    searchableStudents={searchableStudents}
                    availableBatches={availableBatches}
                    availableCourses={availableCourses}
                    handleStudentSearchAdd={handleStudentSearchAdd}
                    removeStudent={removeStudent}
                />

                <PaymentConfigSection 
                    data={paymentConfig} 
                    setData={setPaymentConfig} 
                />

                <PaymentMethodsSection 
                    data={paymentMethods} 
                    setData={setPaymentMethods} 
                    toggleNested={toggleNested} 
                />

                <NotificationSettingsSection 
                    data={notifications} 
                    setData={setNotifications} 
                    toggleNested={toggleNested} 
                />
            </div>
        </motion.div>
    );
};

export default CreateFee;
