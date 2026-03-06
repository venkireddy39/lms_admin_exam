import { useState, useMemo, useEffect } from 'react';
import {
    INITIAL_BATCH_FORM,
    BATCH_STATUS,
    BATCH_TABS
} from '../constants/batchConstants';
import { getBatchStatus, validateBatchForm } from '../utils/batchUtils';
import { batchService } from '../services/batchService';

export const useBatches = (courses, instructors = []) => {
    const [batches, setBatches] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const [currentTab, setCurrentTab] = useState(BATCH_TABS.ALL);
    const [searchQuery, setSearchQuery] = useState('');

    // Filters
    const [courseFilter, setCourseFilter] = useState('All');
    const [instructorFilter, setInstructorFilter] = useState('All');

    // Modal state
    const [showModal, setShowModal] = useState(false);
    const [isEdit, setIsEdit] = useState(false);
    const [editId, setEditId] = useState(null);
    const [formData, setFormData] = useState(INITIAL_BATCH_FORM);

    useEffect(() => {
        fetchBatches();
    }, []);

    const fetchBatches = async () => {
        setLoading(true);
        try {
            const data = await batchService.getAllBatches();
            setBatches(data);
            setError(null);
        } catch (err) {
            console.error("Failed to fetch batches:", err);
            setError("Failed to load batches.");
            // Keep empty array or persist previous state?
        } finally {
            setLoading(false);
        }
    };

    // Derived batches with status
    const enrichedBatches = useMemo(() => {
        return batches.map(b => {
            // Check for explicit backend status first to prevent overwriting 'Deleted' or 'Archived'
            let finalStatus;
            const backendStatus = (b.status || '').toUpperCase();

            if (backendStatus === 'DELETED' || b.deleted) {
                finalStatus = BATCH_STATUS.DELETED;
            } else {
                // Otherwise derive from dates
                finalStatus = getBatchStatus(b.startDate, b.endDate);
            }

            return {
                ...b,
                status: finalStatus,
                // Map entity fields to UI if needed
                id: b.batchId,
                name: b.batchName
            };
        });
    }, [batches]);

    // Filters
    const filteredBatches = useMemo(() => {
        let result = enrichedBatches;

        // Tab Filter
        if (currentTab !== BATCH_TABS.ALL) {
            result = result.filter(b => b.status === currentTab);
        } else {
            // In 'All' tab, usually we hide Deleted unless explicitly requested
            // But if user wants to see them, maybe we should show them? 
            // Standard pattern: All = Active (Upcoming + Ongoing + Completed). Deleted is separate.
            result = result.filter(b => b.status !== BATCH_STATUS.DELETED);
        }

        // Dropdown Filters
        if (courseFilter !== 'All') {
            result = result.filter(b => String(b?.courseId || b?.course_id || b?.id) === String(courseFilter));
        }
        if (instructorFilter !== 'All') {
            // Try to match trainerName if possible
            result = result.filter(b => b.trainerName === instructorFilter);
        }

        // Search
        if (searchQuery.trim()) {
            const q = searchQuery.toLowerCase();
            result = result.filter(b => {
                const bCourseId = String(b?.courseId || b?.course_id || "");
                const bCourseName = (b.courseName || "").toLowerCase();
                const course = courses.find(c => String(c?.courseId || c?.course_id || c?.id || "") === bCourseId) ||
                    courses.find(c => c?.courseName?.trim().toLowerCase() === bCourseName.trim());

                const matchedCourseName = (course?.courseName || b.courseName || "").toLowerCase();

                return (
                    (b.batchName && b.batchName.toLowerCase().includes(q)) ||
                    (b.trainerName && b.trainerName.toLowerCase().includes(q)) ||
                    (matchedCourseName.includes(q))
                );
            });
        }

        return result;
    }, [enrichedBatches, currentTab, courseFilter, instructorFilter, searchQuery, courses]);

    // Stats
    const stats = useMemo(() => ({
        total: enrichedBatches.filter(b => b.status !== BATCH_STATUS.DELETED).length, // Total usually excludes deleted
        upcoming: enrichedBatches.filter(b => b.status === BATCH_STATUS.UPCOMING).length,
        ongoing: enrichedBatches.filter(b => b.status === BATCH_STATUS.ONGOING).length,
        completed: enrichedBatches.filter(b => b.status === BATCH_STATUS.COMPLETED).length,
        deleted: enrichedBatches.filter(b => b.status === BATCH_STATUS.DELETED).length
    }), [enrichedBatches]);

    // Form handlers
    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const openModal = (batch = null, createOverrides = null) => {
        if (batch) {
            setIsEdit(true);
            setEditId(batch.batchId); // Use entity ID

            // Reverse Lookup: Backend sends Name but might drop ID. We recover ID from Name.
            let tid = batch.trainerId;

            // LOGGING FOR DEBUGGING
            console.log("📝 Edit Batch:", batch.batchName);
            console.log("   Backend returned TrainerName:", batch.trainerName);
            console.log("   Backend returned TrainerId:", tid);

            if (!tid && batch.trainerName) {
                console.log("🔍 Attempting Reverse Lookup for:", batch.trainerName);
                if (instructors && instructors.length > 0) {
                    const match = instructors.find(i =>
                        i.name.trim().toLowerCase() === batch.trainerName.trim().toLowerCase()
                    );
                    if (match) {
                        tid = match.id || match.userId;
                        console.log("✅ Match Found! ID:", tid);
                    } else {
                        console.warn("❌ No match found in instructors list. Available names:", instructors.map(i => i.name));
                    }
                } else {
                    console.warn("⚠️ Instructors list is empty/undefined during OpenModal!");
                }
            }

            setFormData({
                batchName: batch.batchName,
                courseId: batch.courseId,
                trainerId: tid,
                trainerName: batch.trainerName,
                startDate: batch.startDate,
                endDate: batch.endDate,
                maxStudents: batch.maxStudents,
                fee: batch.fee,
                freeBatch: batch.freeBatch || false,
                feeType: batch.freeBatch ? 'Free' : 'Paid',
                contentAccess: batch.contentAccess || false,
                status: batch.status
            });
        } else {
            setIsEdit(false);
            setEditId(null);
            setFormData(createOverrides ? { ...INITIAL_BATCH_FORM, ...createOverrides } : INITIAL_BATCH_FORM);
        }
        setShowModal(true);
    };

    const closeModal = () => {
        setShowModal(false);
        setFormData(INITIAL_BATCH_FORM);
    };

    const handleSave = async () => {
        const errors = validateBatchForm(formData);
        if (errors.length) {
            alert(errors.join('\n'));
            return;
        }

        const courseIdNum = Number(formData.courseId);
        if (!courseIdNum || isNaN(courseIdNum)) {
            alert("Please select a valid course.");
            return;
        }

        const isFree = formData.feeType === 'Free';

        const batchPayload = {
            ...formData,
            maxStudents: formData.maxStudents ? Number(formData.maxStudents) : 0,
            fee: isFree ? 0 : (formData.fee ? Number(formData.fee) : 0),
            freeBatch: isFree,
            courseId: courseIdNum,
            trainerId: formData.trainerId ? Number(formData.trainerId) : null
        };

        console.log("🚀 SUBMITTING BATCH PAYLOAD:", batchPayload);
        console.log("👉 Trainer ID being sent:", batchPayload.trainerId);

        try {
            if (isEdit) {
                console.log("🔄 Calling updateBatch...");
                await batchService.updateBatch(editId, batchPayload);
                // ...
            } else {
                await batchService.createBatch(batchPayload);
            }
            await fetchBatches(); // Refresh
            closeModal();
            // Optional: Success Toast could be added here
        } catch (err) {
            console.error("Save failed", err);
            // Show the actual error message from backend
            alert(`Failed to save batch: ${err.message}`);
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm('Are you sure you want to move this batch to Trash (Soft Delete)?')) {
            try {
                // Find the batch to update
                const batchToDelete = batches.find(b => b.batchId === id);
                if (!batchToDelete) return;

                // 1. Prepare updated payload with DELETED status
                const payload = {
                    ...batchToDelete,
                    status: 'DELETED',
                    deleted: true // Optional flag if backend uses it
                };

                // 2. Call Update API instead of Delete (Soft Delete)
                await batchService.updateBatch(id, payload);

                // 3. Update Local State: Don't remove, just update status
                setBatches(prev => prev.map(b =>
                    b.batchId === id ? { ...b, status: 'DELETED', deleted: true } : b
                ));

                // Optional: Switch to Deleted tab so user sees where it went? 
                // Alternatively, just let it vanish from "All/Active" and appear in stats.

            } catch (err) {
                console.error("Soft delete failed", err);
                alert("Failed to move batch to trash. " + err.message);
            }
        }
    };

    return {
        batches: filteredBatches,
        allBatches: enrichedBatches,
        stats,
        currentTab,
        setCurrentTab,
        searchQuery,
        setSearchQuery,
        courseFilter,
        setCourseFilter,
        instructorFilter,
        setInstructorFilter,
        loading,
        error,

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
