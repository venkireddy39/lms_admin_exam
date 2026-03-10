import { useState } from 'react';

export const useCreateFeeForm = () => {
    const [basicDetails, setBasicDetails] = useState({
        name: '',
        type: 'Tuition Fee',
        amount: '',
        description: '',
        taxEnabled: false,
        taxPercentage: 18,
        admissionFee: '',
        admissionNonRefundable: true
    });

    const [discount, setDiscount] = useState({
        enabled: false,
        category: 'Scholarship',
        type: 'flat',
        value: '',
        admissionFee: '', 
        gstPercent: 18,
        installmentCount: 1,
        reason: ''
    });

    const [assignment, setAssignment] = useState({
        course: '',
        batch: '',
        category: 'Normal',
        targetType: 'student',
        selectedStudents: []
    });

    const [paymentConfig, setPaymentConfig] = useState({
        schedule: 'Monthly',
        installments: [
            { id: 1, name: 'Installment 1', percent: 100, due: '' }
        ],
        lateFeeEnabled: false,
        lateFeeType: 'amount',
        lateFeeValue: '',
        dueDate: '',
        autoApplyDiscounts: false
    });

    const [paymentMethods, setPaymentMethods] = useState({
        online: { upi: true, card: true, netbanking: true },
        manual: { cash: true, bankTransfer: true, cheque: true },
        allowManualRecording: true
    });

    const [notifications, setNotifications] = useState({
        autoUpdateStatus: true,
        notifyStudent: true,
        notifyParent: false,
        notifyMentor: false,
        triggers: {
            onCreation: true,
            onPending: true,
            onOverdue: true
        }
    });

    const [studentSearch, setStudentSearch] = useState('');

    const handleBasicChange = (e) => setBasicDetails(prev => ({ ...prev, [e.target.name]: e.target.value }));

    const handleStudentSearchAdd = (student) => {
        if (!assignment.selectedStudents.find(s => s.id === student.id)) {
            setAssignment(prev => ({ ...prev, selectedStudents: [...prev.selectedStudents, student] }));
        }
    };

    const removeStudent = (id) => {
        setAssignment(prev => ({ ...prev, selectedStudents: prev.selectedStudents.filter(s => s.id !== id) }));
    };

    const toggleNested = (stateSetter, parentKey, childKey) => {
        stateSetter(prev => ({
            ...prev,
            [parentKey]: {
                ...prev[parentKey],
                [childKey]: !prev[parentKey][childKey]
            }
        }));
    };

    return {
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
    };
};
