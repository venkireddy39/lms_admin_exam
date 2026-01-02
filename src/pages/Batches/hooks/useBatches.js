
import { useState, useEffect, useMemo } from 'react';
import { INITIAL_BATCH_FORM, BATCH_STATUS, BATCH_TABS } from '../constants/batchConstants';
import { getBatchStatus, validateBatchForm } from '../utils/batchUtils';
import { MOCK_COURSES } from '../../../data/mockCourses';

// Mock Data with distinct dates to test statuses
const DUMMY_BATCHES = [
    {
        id: 1,
        name: "React Morning Batch A",
        courseId: "C-101",
        courseName: "Introduction to React Native",
        startDate: "2024-01-01",
        endDate: "2024-03-01",
        trainer: "Sarah Wilson",
        students: 60,
        maxStudents: 60,
    },
    {
        id: 2,
        name: "Python Weekend Special",
        courseId: "C-102",
        courseName: "Advanced Python Masterclass",
        startDate: "2025-06-01",
        endDate: "2025-08-01",
        trainer: "David Chen",
        students: 5,
        maxStudents: 45,
    },
    {
        id: 3,
        name: "Full Stack Bootcamp",
        courseId: "C-103",
        courseName: "Full Stack Web Development",
        startDate: "2023-12-01", // Past
        endDate: "2025-12-30", // Future -> Ongoing
        trainer: "Michael Brown",
        students: 25,
        maxStudents: 50,
    },
    {
        id: 4,
        name: "Legacy Batch 2023",
        courseId: "C-104",
        courseName: "UI/UX Design Fundamentals",
        startDate: "2023-01-01",
        endDate: "2023-06-01", // Completed
        trainer: "Emma Davis",
        students: 40,
        maxStudents: 40,
    }
];

export const useBatches = () => {
    // Enrich dummy data with dynamic status
    const initializedBatches = useMemo(() => {
        return DUMMY_BATCHES.map(b => ({
            ...b,
            status: getBatchStatus(b.startDate, b.endDate)
        }));
    }, []);

    const [batches, setBatches] = useState(initializedBatches);
    const [viewMode, setViewMode] = useState('grid'); // grid | list
    const [currentTab, setCurrentTab] = useState(BATCH_TABS.ALL);
    const [searchQuery, setSearchQuery] = useState("");

    // Modal State
    const [showModal, setShowModal] = useState(false);
    const [isEdit, setIsEdit] = useState(false);
    const [editId, setEditId] = useState(null);
    const [formData, setFormData] = useState(INITIAL_BATCH_FORM);

    // Filter Logic
    const filteredBatches = useMemo(() => {
        let filtered = batches;

        // 1. Tab Filter
        if (currentTab !== BATCH_TABS.ALL) {
            filtered = filtered.filter(b => b.status === currentTab);
        }

        // 2. Search Filter
        if (searchQuery.trim()) {
            const q = searchQuery.toLowerCase();
            filtered = filtered.filter(b =>
                b.name.toLowerCase().includes(q) ||
                b.trainer.toLowerCase().includes(q) ||
                b.courseName.toLowerCase().includes(q)
            );
        }

        return filtered;
    }, [batches, currentTab, searchQuery]);

    // Stats Logic
    const stats = useMemo(() => {
        return {
            total: batches.length,
            upcoming: batches.filter(b => b.status === BATCH_STATUS.UPCOMING).length,
            ongoing: batches.filter(b => b.status === BATCH_STATUS.ONGOING).length,
            completed: batches.filter(b => b.status === BATCH_STATUS.COMPLETED).length,
        };
    }, [batches]);

    const handleInputChange = (e) => {
        const { name, value } = e.target;

        let updatedForm = { ...formData, [name]: value };

        // Auto-populate course name if ID changes
        if (name === 'courseId') {
            const selectedCourse = MOCK_COURSES.find(c => c.id === value); // value is ID here? Or Name? 
            // In the previous code we used name as value, let's fix that to be ID based for robustness
            // But wait, the previous modal used name. I'll stick to ID logic here for enterprise grade.
            if (selectedCourse) {
                updatedForm.courseName = selectedCourse.name;
            }
        }

        setFormData(updatedForm);
    };

    const openModal = (batch = null) => {
        if (batch) {
            setIsEdit(true);
            setEditId(batch.id);
            setFormData({
                name: batch.name,
                courseId: batch.courseId,
                courseName: batch.courseName,
                startDate: batch.startDate,
                endDate: batch.endDate,
                trainer: batch.trainer,
                students: batch.students,
                maxStudents: batch.maxStudents
            });
        } else {
            setIsEdit(false);
            setEditId(null);
            setFormData(INITIAL_BATCH_FORM);
        }
        setShowModal(true);
    };

    const closeModal = () => {
        setShowModal(false);
        setFormData(INITIAL_BATCH_FORM);
    };

    const handleSave = () => {
        const errors = validateBatchForm(formData);
        if (errors.length > 0) {
            alert(errors.join("\n"));
            return;
        }

        const newBatchValues = {
            ...formData,
            status: getBatchStatus(formData.startDate, formData.endDate) // Derived
        };

        if (isEdit) {
            setBatches(prev => prev.map(b => b.id === editId ? { ...newBatchValues, id: editId } : b));
        } else {
            setBatches(prev => [...prev, { ...newBatchValues, id: Date.now() }]);
        }

        closeModal();
    };

    const handleDelete = (id) => {
        if (window.confirm("Are you sure you want to delete this batch?")) {
            setBatches(prev => prev.filter(b => b.id !== id));
        }
    };

    return {
        batches: filteredBatches,
        allBatches: batches, // For global stats if needed
        stats,
        currentTab,
        setCurrentTab,
        searchQuery,
        setSearchQuery,
        viewMode,
        setViewMode,
        // Modal
        showModal,
        openModal,
        closeModal,
        isEdit,
        formData,
        handleInputChange,
        handleSave,
        handleDelete
    };
};
