
import { useState, useMemo, useEffect } from 'react';
import { MOCK_STUDENTS, MOCK_BATCHES_DROPDOWN } from '../data/mockData';
import { ATTENDANCE_STATUS } from '../constants/attendanceConstants';
import { isDateEditable, isDateFuture, getAttendanceStats } from '../utils/attendanceUtils';

export const useAttendance = () => {
    const [selectedBatchId, setSelectedBatchId] = useState("");
    const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
    const [attendanceRecords, setAttendanceRecords] = useState({}); // { "batchId-date": [ { studentId: status } ] }
    const [students, setStudents] = useState([]);
    const [isEditable, setIsEditable] = useState(true);
    const [saveStatus, setSaveStatus] = useState('idle'); // idle, saving, saved, error

    // Load students when batch changes
    useEffect(() => {
        if (selectedBatchId) {
            const batchStudents = MOCK_STUDENTS.filter(s => s.batchId == selectedBatchId);
            setStudents(batchStudents);
        } else {
            setStudents([]);
        }
    }, [selectedBatchId]);

    // Check editability when date/batch changes
    useEffect(() => {
        const batch = MOCK_BATCHES_DROPDOWN.find(b => b.id == selectedBatchId);
        const dateEditable = isDateEditable(selectedDate);
        const batchActive = batch ? batch.status !== 'Completed' : true;

        setIsEditable(dateEditable && batchActive);
    }, [selectedDate, selectedBatchId]);

    // Get current records
    const currentRecords = useMemo(() => {
        const key = `${selectedBatchId}-${selectedDate}`;
        const saved = attendanceRecords[key];

        if (saved) return saved;

        // Initialize empty/default
        return students.map(s => ({
            studentId: s.id,
            name: s.name,
            status: ATTENDANCE_STATUS.PENDING
        }));
    }, [selectedBatchId, selectedDate, attendanceRecords, students]);

    const handleStatusChange = (studentId, status) => {
        if (!isEditable) return;

        const key = `${selectedBatchId}-${selectedDate}`;
        const newRecords = [...currentRecords];
        const idx = newRecords.findIndex(r => r.studentId === studentId);

        if (idx >= 0) {
            newRecords[idx] = { ...newRecords[idx], status };
        } else {
            // Should not happen if initialized correctly, but handle just in case
            const s = students.find(st => st.id === studentId);
            newRecords.push({ studentId, name: s.name, status });
        }

        // We update the huge state object. In a real app, this would be local state until save.
        // For this demo, let's keep it in a "draft" state until saved? 
        // Or just update directly for responsiveness. Let's update copy.
        // Actually, let's keep a "draft" state for the current view and sync it.
    };

    // We need a local draft state to avoid committing to "database" immediately?
    // Simplified: Just use a local state for the current view and a function to commit it.
    const [draftRecords, setDraftRecords] = useState([]);

    useEffect(() => {
        setDraftRecords(currentRecords);
    }, [currentRecords]);

    const updateLocalStatus = (studentId, status) => {
        if (!isEditable) return;
        setDraftRecords(prev => prev.map(r => r.studentId === studentId ? { ...r, status } : r));
        setSaveStatus('idle');
    };

    const markAll = (status) => {
        if (!isEditable) return;
        setDraftRecords(prev => prev.map(r => ({ ...r, status })));
        setSaveStatus('idle');
    };

    const saveAttendance = () => {
        if (!selectedBatchId) return;

        setSaveStatus('saving');
        setTimeout(() => {
            const key = `${selectedBatchId}-${selectedDate}`;
            setAttendanceRecords(prev => ({
                ...prev,
                [key]: draftRecords
            }));
            setSaveStatus('saved');
        }, 800); // Simulate API call
    };

    // Stats
    const stats = useMemo(() => getAttendanceStats(draftRecords), [draftRecords]);

    return {
        batches: MOCK_BATCHES_DROPDOWN,
        selectedBatchId,
        setSelectedBatchId,
        selectedDate,
        setSelectedDate,
        students: draftRecords, // Return the records which include student info + status
        handleStatusChange: updateLocalStatus,
        saveAttendance,
        isEditable,
        markAll,
        stats,
        saveStatus,
        isLoading: false
    };
};
