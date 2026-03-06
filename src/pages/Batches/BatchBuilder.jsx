import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { FiArrowLeft, FiUsers, FiBook, FiSettings, FiPlus, FiTrash2, FiSearch, FiX, FiRefreshCw, FiDollarSign, FiAlertCircle, FiEdit } from 'react-icons/fi';

import { useAuth } from '../Library/context/AuthContext';
import { batchService } from './services/batchService';
import { enrollmentService } from './services/enrollmentService';
import { feeStructureService } from '../FeeManagement/services/feeStructureService';
import { createFeeAllocation, getStudentFee, getStudentInstallments, createInstallmentPlan, updateFeeAllocation, overrideInstallmentPlan } from '../../services/feeService';
import EnrollmentFeeModal from './components/EnrollmentFeeModal';
import AttendanceTab from './tabs/AttendanceTab';
import ClassesTab from './tabs/ClassesTab';
import './styles/BatchBuilder.css';

const BatchBuilder = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { user } = useAuth();
    const [activeTab, setActiveTab] = useState('students');
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [batchDetails, setBatchDetails] = useState(null);

    // Data State
    const [enrolledStudents, setEnrolledStudents] = useState([]);
    const [allUsers, setAllUsers] = useState([]);
    const [loading, setLoading] = useState(true);

    // Fee Enrollment State
    const [isFeeModalOpen, setIsFeeModalOpen] = useState(false);
    const [pendingEnrollmentStructure, setPendingEnrollmentStructure] = useState(null);
    const [pendingEnrollmentStudents, setPendingEnrollmentStudents] = useState([]);
    const [editFeeData, setEditFeeData] = useState(null); // { student, allocation, structure, initialData }

    // Fee Details Modal State
    const [feeDetailsModal, setFeeDetailsModal] = useState({ isOpen: false, student: null, fees: [], installments: [], loading: false });

    // Transfer Modal State
    const [transferModal, setTransferModal] = useState({ isOpen: false, student: null });
    const [selectedTransferBatch, setSelectedTransferBatch] = useState('');
    const [transferReason, setTransferReason] = useState('');

    const [searchQuery, setSearchQuery] = useState('');
    const [selectedPotentialStudents, setSelectedPotentialStudents] = useState([]);
    const [otherBatches, setOtherBatches] = useState([]);

    useEffect(() => {
        loadData();
    }, [id]);

    const loadData = async () => {
        setLoading(true);
        try {
            // Fetch individually to better handle partial failures
            // If getBatchById fails, the page is useless, so it should fail hard or redirect.
            const batch = await batchService.getBatchById(id).catch(err => {
                console.error("Batch fetch failed", err);
                return null;
            });

            if (!batch) {
                alert("Batch not found or access denied.");
                navigate('/batches');
                return;
            }

            const [studentsData, usersData, batchesData] = await Promise.all([
                enrollmentService.getStudentsByBatch(id).catch(e => []),
                enrollmentService.getAllUsers().catch(e => []),
                batchService.getAllBatches().catch(e => [])
            ]);

            // Normalize users for easier consumption (Handle both flat and nested structures)
            const normalizedUsers = (usersData || []).map(u => {
                const core = u.user || u;
                // Normalize role to check both role and roleName
                const rawRole = u.role || u.roleName || core.role || core.roleName || '';
                const normalizedRole = String(rawRole).toUpperCase();

                return {
                    ...u,
                    // Extract fields with nested-aware fallback
                    name: u.name || core.name || `${u.firstName || core.firstName || ''} ${u.lastName || core.lastName || ''}`.trim() || u.username || core.username || 'Unknown User',
                    email: u.email || core.email,
                    studentId: u.studentId || core.studentId || u.userId || core.userId || u.id || core.id,
                    userId: u.userId || core.userId || u.id || core.id,
                    normalizedRole: normalizedRole.replace('ROLE_', '') // Remove prefix for easier filtering
                };
            });

            // Filter out TRANSFERRED or INACTIVE students
            const activeStudentsData = (studentsData || []).filter(s => {
                if (!s.status) return true;
                const status = String(s.status).toUpperCase();
                return status === 'ACTIVE' || status === 'ENROLLED';
            });

            // Enrich enrolled students and deduplicate
            const studentMap = new Map();
            activeStudentsData.forEach(s => {
                const effectiveId = String(s.studentId || s.userId);
                if (!studentMap.has(effectiveId)) {
                    const userProfile = normalizedUsers.find(u => String(u.studentId || u.userId) === effectiveId);
                    studentMap.set(effectiveId, {
                        ...s,
                        displayId: s.studentId || s.student?.studentId || s.student?.userId || s.userId || "N/A",
                        userId: userProfile?.userId || s.student?.userId || s.userId
                    });
                }
            });

            setEnrolledStudents(Array.from(studentMap.values()));
            setBatchDetails(batch);

            // Filter for Students - Allow ROLE_STUDENT or STUDENT
            const studentUsers = normalizedUsers.filter(u =>
                u.normalizedRole === 'STUDENT' ||
                u.normalizedRole === 'ROLE_STUDENT' ||
                !u.normalizedRole // Fallback if role is completely missing
            );

            setAllUsers(studentUsers);

            const currentBatchId = String(id);
            setOtherBatches((batchesData || []).filter(b => {
                const bId = String(b.batchId || b.id);
                return bId !== currentBatchId;
            }));

        } catch (error) {
            console.error("Failed to load batch data", error);
        } finally {
            setLoading(false);
        }
    };

    // Filter available students (Students who are NOT already enrolled)
    const availableStudents = allUsers.filter(u => {
        // Robust ID check for enrollment status
        const uId = String(u.studentId || u.userId || u.id || '');
        const isEnrolled = enrolledStudents.some(e => {
            const eId = String(e.studentId || e.userId || e.id || e.user_id || '');
            return eId === uId && uId !== '';
        });

        const term = searchQuery.toLowerCase().trim();
        if (!term) return !isEnrolled;

        const matchesSearch =
            (u.name || '').toLowerCase().includes(term) ||
            (u.email || '').toLowerCase().includes(term) ||
            (u.username || '').toLowerCase().includes(term) ||
            (u.phoneNumber || u.mobile || u.phone || '').includes(term) ||
            (uId && uId.includes(term));

        return !isEnrolled && matchesSearch;
    });

    const handleAddStudents = async () => {
        // Check batch capacity
        const currentEnrollment = enrolledStudents.length;
        const maxStudents = batchDetails?.maxStudents || batchDetails?.capacity;
        const selectedCount = selectedPotentialStudents.length;

        if (maxStudents && (currentEnrollment + selectedCount) > maxStudents) {
            const available = maxStudents - currentEnrollment;
            alert(`Batch capacity exceeded! Maximum capacity: ${maxStudents}\nCurrent enrollment: ${currentEnrollment}\nAttempting to add: ${selectedCount}\nAvailable spots: ${available}\n\nPlease select ${available} or fewer students.`);
            return;
        }

        try {
            // 1. Check for Active Fee Structure FIRST
            // We want to prompt the user about fees BEFORE enrolling
            const structures = await feeStructureService.getFeeStructuresByBatch(id).catch(e => []);
            const activeStructure = structures.find(s => s.active !== false); // Default to true if undefined

            if (activeStructure) {
                // If structure exists, pause and show options modal
                console.log("Found Fee Structure, opening modal:", activeStructure);
                setPendingEnrollmentStructure(activeStructure);
                setPendingEnrollmentStudents(selectedPotentialStudents);
                setIsFeeModalOpen(true);
            } else {
                // No fee structure, proceed directly (or warn if strict)
                if (window.confirm("No active Fee Structure found for this batch. Students will be enrolled without fee records. Continue?")) {
                    executeEnrollment([], null); // Pass null config
                }
            }

        } catch (err) {
            console.error("Error checking fee structure:", err);
            alert("Error checking fee structure. Please try again.");
        }
    };

    const confirmEnrollmentWithFee = async (feeConfig) => {
        const studentToAssign = editFeeData?.student;
        const isUpdate = editFeeData?.initialData?.isUpdate;
        const isAssignment = editFeeData && !isUpdate;

        setIsFeeModalOpen(false);

        if (isUpdate) {
            const allocationId = editFeeData.allocation?.allocationId || editFeeData.allocation?.id;
            await handleUpdateFeeDetails(allocationId, feeConfig);
        } else if (isAssignment) {
            await handleAssignFeeToExistingStudent(studentToAssign, feeConfig);
        } else {
            // Standard Multi-Student Enrollment Flow
            executeEnrollment(pendingEnrollmentStudents, feeConfig);
        }

        setEditFeeData(null);
    };

    const handleAssignFeeToExistingStudent = async (student, feeConfig) => {
        try {

            // safer ID extraction
            const studentId = student?.studentId || student?.id || student?.userId;
            const userId = student?.userId || student?.studentId || student?.id;

            // guard clause
            if (!userId) {
                console.error("User ID missing for student:", student);
                alert("User ID missing. Cannot assign fee.");
                return;
            }

            const allocationPayload = {
                userId: Number(userId),
                studentId: Number(studentId),

                studentName: student?.firstName
                    ? `${student.firstName} ${student.lastName || ""}`.trim()
                    : (student?.name || "Unknown"),

                studentEmail: student?.email,

                feeStructureId: editFeeData.structure.id,
                batchId: Number(id),
                courseId: editFeeData.structure.courseId,

                originalAmount: feeConfig.baseAmount,
                gstRate: feeConfig.gstRate,
                adminDiscount: feeConfig.discountOverride || 0,
                additionalDiscount: 0,

                payableAmount: feeConfig.finalTotal,
                remainingAmount: feeConfig.finalTotal,
                paidAmount: 0,

                status: "ACTIVE",
                currency: "INR",
                installmentCount: feeConfig.installments || 1
            };

            // debug log
            console.log("Fee Allocation Payload:", allocationPayload);

            const newAlloc = await createFeeAllocation(allocationPayload);
            const allocId = newAlloc?.id || newAlloc?.allocationId;

            if (!allocId) {
                throw new Error("Allocation ID missing from response");
            }

            let schedulePayload = (feeConfig.schedule || []).map(s => ({
                ...s,
                amount: Number(
                    Number(
                        s.installmentAmount ||
                        s.amount ||
                        (feeConfig.finalTotal / (feeConfig.installments || 1))
                    ).toFixed(2)
                ),
                installmentAmount: Number(
                    Number(
                        s.installmentAmount ||
                        s.amount ||
                        (feeConfig.finalTotal / (feeConfig.installments || 1))
                    ).toFixed(2)
                ),
                status: s.status || "PENDING"
            }));

            // fallback schedule
            if (schedulePayload.length === 0) {

                const count = feeConfig.installments || 1;
                const installmentAmt = Number((feeConfig.finalTotal / count).toFixed(2));

                let remaining = feeConfig.finalTotal;
                const startDate = new Date();

                for (let i = 1; i <= count; i++) {

                    const dueDate = new Date(startDate);

                    if (feeConfig.paymentMode !== "ONE_TIME") {
                        dueDate.setMonth(dueDate.getMonth() + i);
                    }

                    const currentAmt =
                        i === count
                            ? Number(remaining.toFixed(2))
                            : installmentAmt;

                    remaining -= currentAmt;

                    schedulePayload.push({
                        installmentNumber: i,
                        amount: currentAmt,
                        installmentAmount: currentAmt,
                        dueDate: dueDate.toISOString().split("T")[0],
                        status: "PENDING"
                    });
                }
            }

            await createInstallmentPlan(allocId, schedulePayload);

            alert(`Fee structure assigned successfully to ${student.studentName || student.name}`);

            loadData();

        } catch (error) {

            console.error("Failed to assign fee", error);

            alert(
                "Error: " +
                (error?.message || "Failed to assign fee to student.")
            );
        }
    };

    const handleUpdateFeeDetails = async (allocationId, feeConfig) => {
        try {
            // Update the main allocation record (Discounts, Total, etc.)
            await updateFeeAllocation(allocationId, {
                originalAmount: feeConfig.baseAmount,
                adminDiscount: feeConfig.discountOverride,
                payableAmount: feeConfig.finalTotal,
                remainingAmount: feeConfig.finalTotal,
                installmentCount: feeConfig.installments || 1
            });

            // Override the installment schedule
            let schedulePayload = (feeConfig.schedule || []).map(s => ({
                ...s,
                amount: Number(Number(s.installmentAmount || s.amount || (feeConfig.finalTotal / (feeConfig.installments || 1))).toFixed(2)),
                installmentAmount: Number(Number(s.installmentAmount || s.amount || (feeConfig.finalTotal / (feeConfig.installments || 1))).toFixed(2)),
                status: s.status || 'PENDING'
            }));

            // Fallback calculation if schedule is missing
            if (schedulePayload.length === 0) {
                const count = feeConfig.installments || 1;
                const installmentAmt = Number((feeConfig.finalTotal / count).toFixed(2));
                let remaining = feeConfig.finalTotal;
                const startDate = new Date();
                for (let i = 1; i <= count; i++) {
                    const dueDate = new Date(startDate);
                    if (feeConfig.paymentMode !== 'ONE_TIME') dueDate.setMonth(dueDate.getMonth() + i);

                    let currentAmt = (i === count) ? Number(remaining.toFixed(2)) : installmentAmt;
                    remaining -= currentAmt;

                    schedulePayload.push({
                        installmentNumber: i,
                        amount: currentAmt,
                        installmentAmount: currentAmt,
                        dueDate: dueDate.toISOString().split('T')[0],
                        status: 'PENDING'
                    });
                }
            }

            await overrideInstallmentPlan(allocationId, schedulePayload);

            alert("✅ Fee details updated successfully!");
            loadData();
        } catch (error) {
            console.error("Failed to update fees", error);
            alert("Error: " + (error.message || "Failed to update fee record."));
        }
    };

    const executeEnrollment = async (userIdsToEnroll, feeConfig) => {
        // Fallback to selectedPotentialStudents if argument is empty
        const studentsToEnroll = (userIdsToEnroll && userIdsToEnroll.length > 0)
            ? userIdsToEnroll
            : selectedPotentialStudents;

        if (!studentsToEnroll || studentsToEnroll.length === 0) {
            console.error("No students selected to enroll");
            return;
        }

        try {
            // 1. Perform Enrollment
            const promises = studentsToEnroll.map(userIdKey => {
                const student = allUsers.find(u => (u.userId || u.id) === userIdKey);
                // Ensure we use the specific Student ID if available, otherwise User ID
                const actualStudentId = student?.studentId || userIdKey;

                return enrollmentService.addStudentToBatch({
                    batchId: Number(id),
                    studentId: Number(actualStudentId),
                    studentName: student?.firstName ? `${student.firstName} ${student.lastName || ''}`.trim() : (student?.name || 'Unknown'),
                    studentEmail: student?.email,
                    courseId: batchDetails.courseId
                });
            });

            await Promise.all(promises);

            // 2. Refresh List
            const updatedStudents = await enrollmentService.getStudentsByBatch(id);
            setEnrolledStudents(updatedStudents);
            setSelectedPotentialStudents([]);
            setIsAddModalOpen(false); // Close the add student modal

            // 3. Create Fee Allocations (if structure exists)
            if (pendingEnrollmentStructure && feeConfig) {
                const activeStructure = pendingEnrollmentStructure;
                console.log("💰 Creating Fees with Config:", feeConfig);

                const feePromises = studentsToEnroll.map(async (qtyUserId) => {
                    const student = allUsers.find(u => (u.userId || u.id) === qtyUserId);
                    const studentId = Number(student?.studentId || qtyUserId);
                    const userId = Number(student?.userId || student?.id || qtyUserId);

                    // Calculate Amounts based on Config
                    const totalAmount = feeConfig.finalTotal;

                    const allocationPayload = {
                        userId: userId,
                        studentId: studentId,
                        studentName: student?.firstName ? `${student.firstName} ${student.lastName || ''}`.trim() : (student?.name || 'Unknown'),
                        studentEmail: student?.email,
                        feeStructureId: activeStructure.id,
                        batchId: Number(id),
                        courseId: activeStructure.courseId,
                        originalAmount: feeConfig.baseAmount,
                        gstRate: feeConfig.gstRate,
                        adminDiscount: feeConfig.discountOverride || 0,
                        additionalDiscount: 0,
                        payableAmount: feeConfig.finalTotal,
                        remainingAmount: feeConfig.finalTotal,
                        paidAmount: 0,
                        status: 'ACTIVE',
                        currency: 'INR',
                        installmentCount: feeConfig.installments || 1
                    };

                    try {
                        const newAlloc = await createFeeAllocation(allocationPayload);
                        const allocId = newAlloc?.id || newAlloc?.allocationId;

                        // Since backend auto-generates installments, we OVERRIDE them with custom ones if needed
                        const installments = (feeConfig.schedule || []).map(s => ({
                            ...s,
                            amount: Number(Number(s.installmentAmount || s.amount || (totalAmount / (feeConfig.installments || 1))).toFixed(2)),
                            installmentAmount: Number(Number(s.installmentAmount || s.amount || (totalAmount / (feeConfig.installments || 1))).toFixed(2)),
                            status: s.status || 'PENDING'
                        }));

                        if (installments.length > 0) {
                            await overrideInstallmentPlan(allocId, installments);
                        }
                    } catch (e) {
                        console.error("Fee/Installment Creation Failed for " + userId, e);
                    }
                });

                try {
                    await Promise.all(feePromises);
                    alert("Enrollment Successful! \n\n✅ Students added.\n💰 Fee Plan Applied: " + (feeConfig.paymentMode === 'ONE_TIME' ? 'Single Payment' : 'Standard Installments'));
                } catch (feeErr) {
                    console.error("Fee creation part of enrollment failed:", feeErr);
                    alert("Enrollment Successful! \n\n✅ Students added to batch.\n⚠️ BUT Fee Assignment FAILED: " + (feeErr.message || "Unknown error"));
                }
            } else {
                alert("Enrollment Successful (No Fee Created).");
            }

        } catch (err) {
            console.error("Enrollment process error:", err);
            // Access failure details if available
            let errorMsg = err.message || "Failed to add students";
            try {
                const parsed = JSON.parse(err.message);
                if (parsed.message) errorMsg = parsed.message;
            } catch (e) { }

            if (errorMsg.includes("Batch is full") || errorMsg.includes("capacity")) {
                alert(`Error: ${errorMsg}\n\nPlease increase batch capacity.`);
            } else {
                alert(`Error adding students: ${errorMsg}`);
            }
        }
    };

    const openFeeDetails = async (student) => {
        setFeeDetailsModal({ isOpen: true, student, fees: [], installments: [], loading: true });
        try {
            const feeLookupId = student.userId || student.studentId || student.id;
            console.log("🔍 Fetching fees for student ID:", feeLookupId);
            const fees = await getStudentFee(feeLookupId).catch(() => []);
            const allFeeRecords = Array.isArray(fees) ? fees : (fees ? [fees] : []);

            // Filter fees to only show the fee allocation for the current batch
            const batchIdNum = Number(id);
            const feeRecords = allFeeRecords.filter(f => Number(f.batchId) === batchIdNum);

            let installments = [];
            if (feeRecords.length > 0) {
                // Support multiple ID field names used by different parts of the system
                const allocationId = feeRecords[0].allocationId || feeRecords[0].id;
                console.log("🔍 Fetching installments for allocation ID:", allocationId);

                if (allocationId) {
                    installments = await getStudentInstallments(allocationId).catch((err) => {
                        console.error("Installment fetch error:", err);
                        return [];
                    });
                }
                console.log("📊 Loaded Installments:", installments);
            }

            setFeeDetailsModal(prev => ({ ...prev, fees: feeRecords, installments, loading: false }));
        } catch (error) {
            console.error("Failed to load fee details", error);
            setFeeDetailsModal(prev => ({ ...prev, loading: false }));
        }
    };

    const openEditFeeModal = async (student) => {
        try {
            const studentId = student.studentId || student.userId || student.id;
            const feeRecords = await getStudentFee(studentId).catch(() => []);
            const structures = await feeStructureService.getFeeStructuresByBatch(id).catch(() => []);

            if (!structures || structures.length === 0) {
                alert("No active fee structure found for this batch.");
                return;
            }

            const activeStructure = structures.find(s => s.isActive) || structures[0];
            const batchIdNum = Number(id);
            const feeArray = Array.isArray(feeRecords) ? feeRecords : (feeRecords ? [feeRecords] : []);
            const relevantFee = feeArray.find(f => Number(f.batchId) === batchIdNum);

            if (!relevantFee) {
                // If NO fee found, open in "Create/Assign" mode instead of erroring
                setEditFeeData({
                    student,
                    allocation: null,
                    structure: activeStructure,
                    initialData: {
                        isUpdate: false,
                        paymentMode: 'STANDARD',
                        specialDiscountValue: 0,
                        installments: activeStructure.installmentCount || 1,
                        schedule: []
                    }
                });
                setIsFeeModalOpen(true);
                return;
            }

            const allocationId = relevantFee.allocationId || relevantFee.id;
            const inst = await getStudentInstallments(allocationId).catch(() => []);

            setEditFeeData({
                student,
                allocation: relevantFee,
                structure: activeStructure,
                initialData: {
                    isUpdate: true,
                    paymentMode: relevantFee.paymentMode || 'STANDARD',
                    specialDiscountValue: relevantFee.specialDiscountValue || 0,
                    specialDiscountType: relevantFee.specialDiscountType || 'FLAT',
                    installments: inst?.length || 1,
                    schedule: inst || []
                }
            });
            setIsFeeModalOpen(true);
        } catch (error) {
            console.error("Error opening edit modal:", error);
            alert("Failed to load current fee data.");
        }
    };

    const toggleSelection = (userId) => {
        if (selectedPotentialStudents.includes(userId)) {
            setSelectedPotentialStudents(prev => prev.filter(id => id !== userId));
        } else {
            setSelectedPotentialStudents(prev => [...prev, userId]);
        }
    };

    const removeStudent = async (studentBatchId) => {
        if (window.confirm('Remove this student from the batch?')) {
            try {
                await enrollmentService.removeStudentFromBatch(studentBatchId);
                setEnrolledStudents(prev => prev.filter(s => s.studentBatchId !== studentBatchId));
            } catch (err) {
                console.error(err);
                alert("Failed to remove student");
            }
        }
    };

    const openTransferModal = (student) => {
        setTransferModal({ isOpen: true, student });
        setSelectedTransferBatch('');
        setTransferReason('');
    };

    const confirmTransfer = async () => {
        if (!selectedTransferBatch || !transferModal.student) return;

        const targetBatchId = String(selectedTransferBatch);
        const currentBatchId = String(id);
        console.log(`Attempting transfer: Current Batch ${currentBatchId} -> Target Batch ${targetBatchId}`);

        if (targetBatchId === currentBatchId) {
            alert("Cannot transfer to the same batch. Please select a different batch.");
            return;
        }

        try {
            const targetBatch = otherBatches.find(b => String(b.batchId || b.id) === targetBatchId);

            // 1. CAPACITY CHECK: Verify if target batch has space
            const targetStudents = await enrollmentService.getStudentsByBatch(targetBatchId).catch(e => []);
            const targetMax = targetBatch?.maxStudents || targetBatch?.capacity || 0;
            const currentTargetCount = targetStudents.length;

            console.log('Validating Transfer Target Capacity:', {
                targetName: targetBatch?.batchName,
                targetMax,
                currentCount: currentTargetCount
            });

            if (targetMax > 0 && currentTargetCount >= targetMax) {
                alert(`Cannot transfer! Target batch "${targetBatch?.batchName}" is full.\n\nCapacity: ${targetMax}\nCurrent Students: ${currentTargetCount}\n\nPlease increase the target batch capacity or choose a different batch.`);
                return;
            }

            // 2. DUPLICATE CHECK: Verify if student is ALREADY in the target batch
            const isAlreadyInTarget = targetStudents.some(s =>
                String(s.studentId) === String(transferModal.student.studentId)
            );

            if (isAlreadyInTarget) {
                // Resolution: Student should be in B, and not in A.
                if (window.confirm(`Transfer Issue: Student is already active in target batch "${targetBatch?.batchName}".\n\nTo complete the move, do you want to remove them from the CURRENT batch?`)) {
                    await enrollmentService.removeStudentFromBatch(transferModal.student.studentBatchId);
                    setEnrolledStudents(prev => prev.filter(s => s.studentBatchId !== transferModal.student.studentBatchId));
                    setTransferModal({ isOpen: false, student: null });
                    alert("Completed: Student removed from current batch (already active in target).");
                }
                return;
            }

            // 3. EXECUTE TRANSFER
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

            // Update UI: Remove from current batch list locally to reflect immediate change
            // Use ID based filtering to be safe against missing logic
            setEnrolledStudents(prev => prev.filter(s =>
                String(s.studentId) !== String(transferModal.student.studentId) &&
                String(s.studentBatchId) !== String(transferModal.student.studentBatchId)
            ));

            // Reload data to ensure counts and states are perfectly synced with backend
            // Increased delay to handle potential DB replication/indexing lag
            setTimeout(() => loadData(), 1000);

            setTransferModal({ isOpen: false, student: null });
            alert(`Successfully transferred to ${targetBatch?.batchName}`);

        } catch (err) {
            console.error("Transfer execution failed:", err);

            let msg = err.message || "Unknown error";
            try {
                const parsed = JSON.parse(msg);
                if (parsed.message) msg = parsed.message;
            } catch (e) { }

            // Fallback for race conditions where pre-check passed but backend failed
            if (msg.includes("already active") || msg.includes("Duplicate")) {
                if (window.confirm(`Transfer Conflict: Student is already in the target batch.\n\nDo you want to remove them from THIS batch to resolve the duplication?`)) {
                    try {
                        await enrollmentService.removeStudentFromBatch(transferModal.student.studentBatchId);
                        setEnrolledStudents(prev => prev.filter(s => s.studentBatchId !== transferModal.student.studentBatchId));
                        setTransferModal({ isOpen: false, student: null });
                        alert("Resolved: Student removed from old batch.");
                    } catch (remErr) {
                        alert("Failed to remove student: " + remErr.message);
                    }
                }
                return;
            }

            alert("Transfer failed: " + msg);
        }
    };

    if (loading) return <div className="d-flex align-items-center justify-content-center" style={{ minHeight: 200 }}><div className="spinner-border text-primary" role="status" /><span className="ms-3 text-muted">Loading Batch Builder...</span></div>;

    return (
        <div className="container-fluid px-3 px-md-4 py-3">

            {/* ─── Header ─────────────────────────────────── */}
            <div className="d-flex flex-column flex-md-row align-items-start align-items-md-center justify-content-between gap-3 mb-4">
                <div className="d-flex align-items-center gap-3">
                    <button
                        onClick={() => navigate('/batches')}
                        className="btn btn-outline-secondary btn-sm d-flex align-items-center gap-1"
                    >
                        <FiArrowLeft size={14} /> Back
                    </button>
                    <div>
                        <h4 className="mb-0 fw-bold">Batch Management</h4>
                        <small className="text-muted">ID: {id}</small>
                    </div>
                </div>

                <ul className="nav nav-pills gap-1">
                    {[
                        { key: 'overview', label: 'Classes' },
                        { key: 'students', label: 'Students' },
                        { key: 'attendance', label: 'Attendance' }
                    ].map(tab => (
                        <li className="nav-item" key={tab.key}>
                            <button
                                className={`nav-link py-1 px-3 ${activeTab === tab.key ? 'active' : 'text-secondary'}`}
                                onClick={() => setActiveTab(tab.key)}
                            >
                                {tab.label}
                            </button>
                        </li>
                    ))}
                </ul>
            </div>

            {/* ─── Tab Content ─────────────────────────────── */}
            {activeTab === 'overview' ? (
                <ClassesTab
                    batchId={id}
                    courseId={batchDetails?.courseId}
                    instructorName={batchDetails?.trainerName}
                />
            ) : activeTab === 'students' ? (
                <div className="card border-0 shadow-sm">
                    {/* Card Header */}
                    <div className="card-header bg-white d-flex flex-column flex-sm-row align-items-start align-items-sm-center justify-content-between gap-3 py-3">
                        <div>
                            <h5 className="mb-1 fw-bold">Member Management</h5>
                            <small className="text-muted">Manage students, faculty, and staff access</small>
                            {batchDetails?.maxStudents && (
                                <div className="mt-1">
                                    <span className={`small ${enrolledStudents.length >= batchDetails.maxStudents ? 'text-danger fw-bold' : 'text-secondary'}`}>
                                        Enrollment: {enrolledStudents.length} / {batchDetails.maxStudents}
                                    </span>
                                    {enrolledStudents.length >= batchDetails.maxStudents && (
                                        <span className="badge bg-danger ms-2">FULL</span>
                                    )}
                                </div>
                            )}
                        </div>
                        <button
                            className="btn btn-dark btn-sm d-flex align-items-center gap-1"
                            onClick={() => {
                                if (batchDetails?.maxStudents && enrolledStudents.length >= batchDetails.maxStudents) {
                                    alert("Batch limit exceeded! Please create a new batch.");
                                    return;
                                }
                                setIsAddModalOpen(true);
                            }}
                        >
                            <FiPlus size={14} /> Add Member
                        </button>
                    </div>

                    {/* Student Table / Empty State */}
                    <div className="card-body p-0">
                        {enrolledStudents.length > 0 ? (
                            <div className="table-responsive">
                                <table className="table table-hover align-middle mb-0">
                                    <thead className="table-light small text-uppercase text-muted">
                                        <tr>
                                            <th className="ps-4">Member Profile</th>
                                            <th>ID</th>
                                            <th>Status</th>
                                            <th className="text-end pe-4">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {enrolledStudents.map(item => (
                                            <tr key={item.studentBatchId}>
                                                <td className="ps-4">
                                                    <div className="d-flex align-items-center gap-3">
                                                        <div
                                                            className="rounded-2 text-white fw-bold d-flex align-items-center justify-content-center flex-shrink-0"
                                                            style={{ width: 38, height: 38, background: '#0ea5e9', fontSize: 13 }}
                                                        >
                                                            {item.studentName?.substring(0, 2).toUpperCase()}
                                                        </div>
                                                        <div className="fw-semibold text-dark">{item.studentName}</div>
                                                    </div>
                                                </td>
                                                <td>
                                                    <span className="text-muted small">#{item.displayId}</span>
                                                </td>
                                                <td>
                                                    <div className="d-flex align-items-center gap-2">
                                                        <span className="badge bg-success-subtle text-success border border-success-subtle">Enrolled</span>
                                                        {item.joinedAt && (
                                                            <small className="text-muted">{new Date(item.joinedAt).toLocaleDateString()}</small>
                                                        )}
                                                    </div>
                                                </td>
                                                <td className="text-end pe-4">
                                                    <div className="d-flex justify-content-end gap-1">
                                                        <button
                                                            className="btn btn-sm btn-outline-secondary"
                                                            onClick={() => openFeeDetails(item)}
                                                            title="View Fees"
                                                        >
                                                            <FiDollarSign size={14} />
                                                        </button>
                                                        <button
                                                            className="btn btn-sm btn-outline-primary"
                                                            onClick={() => openEditFeeModal(item)}
                                                            title="Edit Fees"
                                                        >
                                                            <FiEdit size={14} />
                                                        </button>
                                                        <button
                                                            className="btn btn-sm btn-outline-secondary"
                                                            onClick={() => openTransferModal(item)}
                                                            title="Transfer"
                                                        >
                                                            <FiRefreshCw size={14} />
                                                        </button>
                                                        <button
                                                            className="btn btn-sm btn-outline-danger"
                                                            onClick={() => removeStudent(item.studentBatchId)}
                                                            title="Remove"
                                                        >
                                                            <FiTrash2 size={14} />
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        ) : (
                            <div className="text-center py-5 text-muted">
                                <FiUsers size={40} className="mb-3 opacity-25" />
                                <p className="mb-0 small">No students enrolled yet.</p>
                            </div>
                        )}
                    </div>
                </div>
            ) : activeTab === 'attendance' ? (
                <AttendanceTab batchId={id} />
            ) : (
                <div className="text-center py-5 text-muted">
                    <FiSettings size={40} className="mb-3 opacity-25" />
                    <h6>Module Not Found</h6>
                </div>
            )}



            {/* Add Student Modal */}
            {isAddModalOpen && (
                <div className="modal fade show d-block" style={{ background: 'rgba(0,0,0,0.5)', zIndex: 1060 }}>
                    <div className="modal-dialog modal-dialog-centered modal-dialog-scrollable modal-lg">
                        <div className="modal-content border-0 shadow">
                            <div className="modal-header border-bottom">
                                <h5 className="modal-title fw-bold">Add Students to Batch</h5>
                                {batchDetails?.maxStudents && (
                                    <span className="badge bg-info ms-2 fw-normal">
                                        {Math.max(0, batchDetails.maxStudents - enrolledStudents.length)} spots left
                                    </span>
                                )}
                                <button className="btn-close ms-auto" onClick={() => setIsAddModalOpen(false)}></button>
                            </div>
                            <div className="modal-body">
                                <div className="input-group mb-3">
                                    <span className="input-group-text bg-white"><FiSearch className="text-muted" /></span>
                                    <input
                                        type="text"
                                        className="form-control border-start-0 ps-0"
                                        placeholder="Search by Name, Email or Student ID..."
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                    />
                                </div>
                                <div className="list-group list-group-flush border rounded-3" style={{ maxHeight: 350, overflowY: 'auto' }}>
                                    {availableStudents.length > 0 ? availableStudents.map(user => (
                                        <label
                                            key={user.userId || user.id}
                                            className={`list-group-item list-group-item-action d-flex align-items-center gap-3 py-2 px-3 ${selectedPotentialStudents.includes(user.userId || user.id) ? 'active' : ''}`}
                                            style={{ cursor: 'pointer' }}
                                        >
                                            <input
                                                type="checkbox"
                                                className="form-check-input flex-shrink-0 mt-0"
                                                checked={selectedPotentialStudents.includes(user.userId || user.id)}
                                                onChange={() => toggleSelection(user.userId || user.id)}
                                            />
                                            <div>
                                                <div className="fw-semibold">{user.name || user.username}</div>
                                                <small className="text-muted d-block">{user.email}</small>
                                                <small className="text-secondary" style={{ fontSize: '0.72rem' }}>ID: {user.studentId || user.userId || user.id}</small>
                                            </div>
                                        </label>
                                    )) : (
                                        <div className="text-center py-4 text-muted small">
                                            No available students found{searchQuery ? ` matching "${searchQuery}"` : ''}.
                                        </div>
                                    )}
                                </div>
                            </div>
                            <div className="modal-footer">
                                <span className="text-muted small me-auto">{selectedPotentialStudents.length} selected</span>
                                <button className="btn btn-outline-secondary btn-sm" onClick={() => setIsAddModalOpen(false)}>Cancel</button>
                                <button
                                    className="btn btn-dark btn-sm"
                                    onClick={handleAddStudents}
                                    disabled={selectedPotentialStudents.length === 0}
                                >
                                    Add Selected
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Transfer Modal */}
            {transferModal.isOpen && (
                <div className="modal fade show d-block" style={{ background: 'rgba(0,0,0,0.5)', zIndex: 1060 }}>
                    <div className="modal-dialog modal-dialog-centered" style={{ maxWidth: 500 }}>
                        <div className="modal-content border-0 shadow">
                            <div className="modal-header border-bottom">
                                <h5 className="modal-title fw-bold">Transfer Student</h5>
                                <button className="btn-close" onClick={() => setTransferModal({ isOpen: false, student: null })}></button>
                            </div>
                            <div className="modal-body">
                                <p className="text-muted mb-3">
                                    Move <strong>{transferModal.student?.studentName}</strong> to another batch.
                                </p>

                                <div className="mb-3">
                                    <label className="form-label fw-semibold small">Select Target Batch</label>
                                    <select
                                        className="form-select form-select-sm"
                                        value={selectedTransferBatch}
                                        onChange={(e) => setSelectedTransferBatch(e.target.value)}
                                    >
                                        <option value="">-- Select Batch --</option>
                                        {otherBatches.map(batch => (
                                            <option key={batch.batchId} value={batch.batchId}>
                                                {batch.batchName} ({batch.startDate})
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                <div className="mb-3">
                                    <label className="form-label fw-semibold small">Transfer Reason (Optional)</label>
                                    <textarea
                                        className="form-control form-control-sm"
                                        rows="3"
                                        placeholder="Enter reason for transfer..."
                                        value={transferReason}
                                        onChange={(e) => setTransferReason(e.target.value)}
                                    ></textarea>
                                </div>
                            </div>
                            <div className="modal-footer">
                                <button className="btn btn-outline-secondary btn-sm" onClick={() => setTransferModal({ isOpen: false, student: null })}>Cancel</button>
                                <button
                                    className="btn btn-primary btn-sm"
                                    onClick={confirmTransfer}
                                    disabled={!selectedTransferBatch}
                                >
                                    Confirm Transfer
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Fee Details Modal */}
            {feeDetailsModal.isOpen && (
                <div className="modal fade show d-block" style={{ background: 'rgba(0,0,0,0.5)', zIndex: 1060 }}>
                    <div className="modal-dialog modal-dialog-centered modal-dialog-scrollable modal-lg">
                        <div className="modal-content border-0 shadow">
                            <div className="modal-header border-bottom">
                                <h5 className="modal-title fw-bold">Fee Details: {feeDetailsModal.student?.studentName}</h5>
                                <button className="btn-close" onClick={() => setFeeDetailsModal({ isOpen: false, student: null, fees: [], installments: [], loading: false })}></button>
                            </div>
                            <div className="modal-body">
                                {feeDetailsModal.loading ? (
                                    <div className="text-center py-4"><div className="spinner-border spinner-border-sm text-primary"></div></div>
                                ) : (
                                    <>
                                        {feeDetailsModal.fees.length === 0 ? (
                                            <div className="text-center py-5 text-muted">
                                                <FiAlertCircle size={36} className="mb-3 text-warning" />
                                                <h6 className="fw-semibold">No fee records found</h6>
                                                <p className="small mb-3">This student does not have any fee allocations yet.</p>
                                                <button
                                                    className="btn btn-primary btn-sm px-4"
                                                    onClick={() => {
                                                        setFeeDetailsModal(prev => ({ ...prev, isOpen: false }));
                                                        openEditFeeModal(feeDetailsModal.student);
                                                    }}
                                                >
                                                    Assign Fee Now
                                                </button>
                                            </div>
                                        ) : (
                                            <>
                                                {/* Summary Cards */}
                                                <div className="row g-2 mb-4">
                                                    <div className="col">
                                                        <div className="border rounded-3 p-3 text-center bg-light">
                                                            <div className="text-muted small fw-bold">TOTAL FEE</div>
                                                            <div className="fs-5 fw-bold text-dark">₹{feeDetailsModal.fees[0].payableAmount?.toLocaleString()}</div>
                                                        </div>
                                                    </div>
                                                    <div className="col">
                                                        <div className="border rounded-3 p-3 text-center bg-light">
                                                            <div className="text-muted small fw-bold">ONE-TIME</div>
                                                            <div className="fs-5 fw-bold text-primary">₹{feeDetailsModal.fees[0].oneTimeAmount?.toLocaleString() || 0}</div>
                                                        </div>
                                                    </div>
                                                    <div className="col">
                                                        <div className="border rounded-3 p-3 text-center bg-light">
                                                            <div className="text-muted small fw-bold">TARGET</div>
                                                            <div className="fs-5 fw-bold text-info">₹{Number(feeDetailsModal.fees[0].installmentAmount || feeDetailsModal.fees[0].payableAmount || 0).toLocaleString()}</div>
                                                        </div>
                                                    </div>
                                                    <div className="col">
                                                        <div className="border rounded-3 p-3 text-center bg-light">
                                                            <div className="text-muted small fw-bold">PAID</div>
                                                            <div className="fs-5 fw-bold text-success">₹{(feeDetailsModal.fees[0].payableAmount - feeDetailsModal.fees[0].remainingAmount)?.toLocaleString()}</div>
                                                        </div>
                                                    </div>
                                                    <div className="col">
                                                        <div className="border rounded-3 p-3 text-center bg-light border-danger">
                                                            <div className="text-danger small fw-bold">PENDING</div>
                                                            <div className="fs-5 fw-bold text-danger">₹{feeDetailsModal.fees[0].remainingAmount?.toLocaleString()}</div>
                                                        </div>
                                                    </div>
                                                </div>

                                                {/* Installments Table */}
                                                <h6 className="mb-3 text-secondary text-uppercase fw-bold small">Installment Schedule</h6>
                                                {feeDetailsModal.installments.length > 0 ? (
                                                    <div className="table-responsive">
                                                        <table className="table table-sm table-bordered align-middle">
                                                            <thead className="table-light">
                                                                <tr>
                                                                    <th className="small">Installment</th>
                                                                    <th className="small">Due Date</th>
                                                                    <th className="small">Amount</th>
                                                                    <th className="small">Status</th>
                                                                </tr>
                                                            </thead>
                                                            <tbody>
                                                                {feeDetailsModal.installments.map((inst, idx) => (
                                                                    <tr key={idx}>
                                                                        <td>{inst.label || inst.installmentPlanName || `Installment ${idx + 1}`}</td>
                                                                        <td>{inst.dueDate ? new Date(inst.dueDate).toLocaleDateString() : 'N/A'}</td>
                                                                        <td className="fw-semibold">₹{Number(inst.amount || inst.installmentAmount).toLocaleString()}</td>
                                                                        <td>
                                                                            <span className={`badge ${(inst.status === 'PAID' || inst.status === 'Paid') ? 'bg-success' :
                                                                                (inst.status === 'OVERDUE') ? 'bg-danger' : 'bg-warning text-dark'
                                                                                }`}>
                                                                                {inst.status}
                                                                            </span>
                                                                        </td>
                                                                    </tr>
                                                                ))}
                                                            </tbody>
                                                        </table>
                                                    </div>
                                                ) : (
                                                    <p className="text-muted fst-italic small text-center p-3 border rounded">
                                                        No installment plan found (One-time payment or pending configuration).
                                                    </p>
                                                )}
                                            </>
                                        )}
                                    </>
                                )}
                            </div>
                            <div className="modal-footer">
                                <button className="btn btn-outline-secondary btn-sm" onClick={() => setFeeDetailsModal({ isOpen: false, student: null, fees: [], installments: [], loading: false })}>Close</button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Fee Options Modal */}
            <EnrollmentFeeModal
                isOpen={isFeeModalOpen}
                onClose={() => {
                    setIsFeeModalOpen(false);
                    setEditFeeData(null);
                }}
                onConfirm={confirmEnrollmentWithFee}
                feeStructure={editFeeData ? editFeeData.structure : pendingEnrollmentStructure}
                studentCount={editFeeData ? 1 : pendingEnrollmentStudents.length}
                initialData={editFeeData ? editFeeData.initialData : null}
            />
        </div >
    );
};

export default BatchBuilder;
