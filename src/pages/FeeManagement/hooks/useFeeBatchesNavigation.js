import { useState } from 'react';

export const useFeeBatchesNavigation = () => {
    const [view, setView] = useState('grid'); // grid, list, detail
    const [selectedBatch, setSelectedBatch] = useState(null);
    const [selectedStudent, setSelectedStudent] = useState(null);

    const handleBack = (setFeeDetails, setStudents) => {
        if (view === 'detail') {
            setFeeDetails(null);
            setView('list');
        }
        else if (view === 'list') {
            setSelectedBatch(null);
            setStudents([]);
            setView('grid');
        }
    };

    return {
        view,
        setView,
        selectedBatch,
        setSelectedBatch,
        selectedStudent,
        setSelectedStudent,
        handleBack
    };
};
