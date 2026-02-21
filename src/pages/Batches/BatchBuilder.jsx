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

            // Enrich enrolled students
            const enrichedStudents = activeStudentsData.map(s => {
                const userProfile = normalizedUsers.find(u => String(u.studentId || u.userId) === String(s.studentId || s.userId));
                return {
                    ...s,
                    displayId: s.studentId || s.student?.studentId || s.student?.userId || s.userId || 'N/A',
                    userId: userProfile?.userId || s.student?.userId || s.userId
                };
            });

            setEnrolledStudents(enrichedStudents);
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
            const studentId = student.studentId || student.userId || student.id;
            const userId = student.userId || student.id;

            const allocationPayload = {
                userId: Number(userId),
                studentId: Number(studentId),
                studentName: student?.firstName ? `${student.firstName} ${student.lastName || ''}`.trim() : (student?.name || 'Unknown'),
                studentEmail: student?.email,
                feeStructureId: editFeeData.structure.id,
                batchId: Number(id),
                courseId: editFeeData.structure.courseId,
                originalAmount: feeConfig.baseAmount,
                gstRate: feeConfig.gstRate,
                adminDiscount: feeConfig.discountOverride || 0,
                // Make sure to add this so backend doesn't complain about nulls if configured that way
                additionalDiscount: 0,
                payableAmount: feeConfig.finalTotal,
                remainingAmount: feeConfig.finalTotal,
                paidAmount: 0,
                status: 'ACTIVE',
                currency: 'INR'
            };

            const newAlloc = await createFeeAllocation(allocationPayload);
            const allocId = newAlloc?.id || newAlloc?.allocationId;

            if (allocId) {
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

                await createInstallmentPlan(allocId, schedulePayload);
                alert(`✅ Fee structure assigned successfully to ${student.studentName}!`);
                loadData(); // Refresh list to reflect changes
            }
        } catch (error) {
            console.error("Failed to assign fee", error);
            alert("Error: " + (error.message || "Failed to assign fee to student."));
        }
    };

    const handleUpdateFeeDetails = async (allocationId, feeConfig) => {
        try {
            // Update the main allocation record (Discounts, Total, etc.)
            await updateFeeAllocation(allocationId, {
                originalAmount: feeConfig.baseAmount,
                adminDiscount: feeConfig.discountOverride,
                payableAmount: feeConfig.finalTotal,
                remainingAmount: feeConfig.finalTotal // Assuming we reset it for now or backend handles it
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
                        currency: 'INR'
                    };

                    try {
                        const newAlloc = await createFeeAllocation(allocationPayload);
                        const allocId = newAlloc?.id || newAlloc?.allocationId;

                        if (allocId) {
                            // Use the custom schedule from the modal if available
                            const installments = (feeConfig.schedule || []).map(s => ({
                                ...s,
                                amount: Number(Number(s.installmentAmount || s.amount || (totalAmount / (feeConfig.installments || 1))).toFixed(2)),
                                installmentAmount: Number(Number(s.installmentAmount || s.amount || (totalAmount / (feeConfig.installments || 1))).toFixed(2)),
                                status: s.status || 'PENDING'
                            }));

                            // Fallback calculation if schedule is missing
                            if (installments.length === 0) {
                                const count = feeConfig.installments || 1;
                                const installmentAmt = Number((totalAmount / count).toFixed(2));
                                let remaining = totalAmount;
                                const startDate = new Date();
                                for (let i = 1; i <= count; i++) {
                                    const dueDate = new Date(startDate);
                                    if (feeConfig.paymentMode !== 'ONE_TIME') dueDate.setMonth(dueDate.getMonth() + i);

                                    let currentAmt = (i === count) ? Number(remaining.toFixed(2)) : installmentAmt;
                                    remaining -= currentAmt;

                                    installments.push({
                                        installmentNumber: i,
                                        installmentAmount: currentAmt,
                                        amount: currentAmt,
                                        dueDate: dueDate.toISOString().split('T')[0],
                                        status: 'PENDING'
                                    });
                                }
                            }

                            console.log("📅 Saving Installment Plan for AllocID:", allocId, installments);
                            await createInstallmentPlan(allocId, installments);
                        }
                    } catch (e) {
                        console.error("Fee/Installment Creation Failed for " + userId, e);
                    }
                });

                await Promise.all(feePromises);
                alert("Enrollment Successful! \n\n✅ Students added.\n💰 Fee Plan Applied: " + (feeConfig.paymentMode === 'ONE_TIME' ? 'Single Payment' : 'Standard Installments'));
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
            const studentId = student.studentId || student.userId || student.id;
            const fees = await getStudentFee(studentId).catch(() => []);
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

    if (loading) return <div className="p-5">Loading Batch Builder...</div>;

    return (
        <div className="batch-builder-layout">
            <header className="bb-header">
                <div className="bb-header-left">
                    <button onClick={() => navigate('/batches')} className="btn-back">
                        <FiArrowLeft /> Back
                    </button>
                    <div className="bb-title">
                        <h2>Batch Management</h2>
                        <span className="badge-id">ID: {id}</span>
                    </div>
                </div>
                <div className="bb-header-right">
                    <div className="bb-tabs">
                        <button className={`tab-item ${activeTab === 'overview' ? 'active' : ''}`} onClick={() => setActiveTab('overview')}>Classes</button>
                        <button className={`tab-item ${activeTab === 'students' ? 'active' : ''}`} onClick={() => setActiveTab('students')}>Students</button>
                        <button className={`tab-item ${activeTab === 'attendance' ? 'active' : ''}`} onClick={() => setActiveTab('attendance')}>Attendance</button>
                    </div>
                </div>
            </header>

            <main className="bb-main">
                {activeTab === 'overview' ? (
                    <ClassesTab
                        batchId={id}
                        courseId={batchDetails?.courseId}
                        instructorName={batchDetails?.trainerName}
                    />
                ) : activeTab === 'students' ? (
                    <div className="students-manager">
                        <div className="sm-header">
                            <div>
                                <h3>Member Management</h3>
                                <p className="text-muted">Manage students, faculty, and staff access</p>
                                {batchDetails?.maxStudents && (
                                    <p className="text-sm mt-1">
                                        <span className={enrolledStudents.length >= batchDetails.maxStudents ? 'text-danger fw-bold' : 'text-secondary'}>
                                            Enrollment: {enrolledStudents.length} / {batchDetails.maxStudents}
                                        </span>
                                        {enrolledStudents.length >= batchDetails.maxStudents && (
                                            <span className="badge bg-danger ms-2">FULL</span>
                                        )}
                                    </p>
                                )}
                            </div>
                            <button
                                className="btn-primary-add"
                                onClick={() => {
                                    if (batchDetails?.maxStudents && enrolledStudents.length >= batchDetails.maxStudents) {
                                        alert("Batch limit exceeded! Please create a new batch.");
                                        return;
                                    }
                                    setIsAddModalOpen(true);
                                }}
                                title="Add new members"
                            >
                                <FiPlus /> Add Member
                            </button>
                        </div>

                        <div className="students-list">
                            {enrolledStudents.length > 0 ? (
                                <table className="w-100 table-custom">
                                    <thead>
                                        <tr>
                                            <th>MEMBER PROFILE</th>
                                            <th>ID</th>
                                            <th>STATUS</th>
                                            <th className="text-end">ACTIONS</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {enrolledStudents.map(item => (
                                            <tr key={item.studentBatchId}>
                                                <td>
                                                    <div className="d-flex align-items-center gap-3">
                                                        <div className="avatar-square" style={{ width: 40, height: 40, borderRadius: 8, background: '#0ea5e9', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold' }}>
                                                            {item.studentName?.substring(0, 2).toUpperCase()}
                                                        </div>
                                                        <div>
                                                            <div className="fw-bold text-dark">{item.studentName}</div>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td>
                                                    <span className="text-muted small">ID: #{item.displayId}</span>
                                                </td>
                                                <td>
                                                    <div className="d-flex align-items-center gap-2 text-dark">
                                                        <div className="rounded-circle bg-success p-1" style={{ width: 6, height: 6 }}></div>
                                                        Enrolled
                                                    </div>
                                                    {item.joinedAt && (
                                                        <div className="text-muted" style={{ fontSize: '0.75rem', marginLeft: '14px' }}>
                                                            {new Date(item.joinedAt).toLocaleDateString()}
                                                        </div>
                                                    )}
                                                </td>
                                                <td className="text-end">
                                                    <div className="d-flex justify-content-end gap-2">
                                                        <button
                                                            className="btn-icon-plain text-secondary hover-success"
                                                            onClick={() => openFeeDetails(item)}
                                                            title="View Fees"
                                                        >
                                                            <FiDollarSign size={18} />
                                                        </button>
                                                        <button
                                                            className="btn-icon-plain text-secondary hover-primary"
                                                            onClick={() => openEditFeeModal(item)}
                                                            title="Edit Fees"
                                                        >
                                                            <FiEdit size={16} />
                                                        </button>
                                                        <button
                                                            className="btn-icon-plain text-secondary hover-primary"
                                                            onClick={() => openTransferModal(item)}
                                                            title="Transfer"
                                                        >
                                                            <FiRefreshCw size={18} />
                                                        </button>
                                                        <button
                                                            className="btn-icon-plain text-secondary hover-danger"
                                                            onClick={() => removeStudent(item.studentBatchId)}
                                                            title="Delete"
                                                        >
                                                            <FiTrash2 size={18} />
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            ) : (
                                <div className="empty-state-small">
                                    <FiUsers size={40} className="text-muted mb-2" />
                                    <p>No students enrolled yet.</p>
                                </div>
                            )}
                        </div>
                    </div>
                ) : activeTab === 'attendance' ? (
                    <AttendanceTab batchId={id} />
                ) : (
                    <div className="empty-content-state">
                        <div className="ecs-icon"><FiSettings /></div>
                        <h3>Module Not Found</h3>
                    </div>
                )}
            </main>

            {/* Add Student Modal */}
            {isAddModalOpen && (
                <div className="modal-overlay">
                    <div className="modal-content-large">
                        <div className="modal-header">
                            <h3>Add Students to Batch</h3>
                            {batchDetails?.maxStudents && (
                                <span className="badge bg-info ms-2">
                                    Available Spots: {Math.max(0, batchDetails.maxStudents - enrolledStudents.length)}
                                </span>
                            )}
                            <button className="btn-close" onClick={() => setIsAddModalOpen(false)}><FiX /></button>
                        </div>
                        <div className="modal-body">



                            <div className="search-bar mb-3">
                                <FiSearch className="search-icon" />
                                <input
                                    type="text"
                                    placeholder="Search by Name, Email or Student ID..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                />
                            </div>

                            <div className="list-selection">
                                {availableStudents.length > 0 ? availableStudents.map(user => (
                                    <div
                                        key={user.userId || user.id}
                                        className={`list-item-select ${selectedPotentialStudents.includes(user.userId || user.id) ? 'selected' : ''}`}
                                        onClick={() => toggleSelection(user.userId || user.id)}
                                    >
                                        <input
                                            type="checkbox"
                                            checked={selectedPotentialStudents.includes(user.userId || user.id)}
                                            readOnly
                                        />
                                        <div className="ms-3">
                                            <div className="fw-bold">{user.name || user.username}</div>
                                            <div className="d-flex flex-column">
                                                <small className="text-muted">{user.email}</small>
                                                <small className="text-secondary" style={{ fontSize: '0.75rem' }}>
                                                    ID: {user.studentId || user.userId || user.id}
                                                </small>
                                            </div>
                                        </div>
                                    </div>
                                )) : (
                                    <div className="text-center p-4 text-muted">No available students found matching "{searchQuery}".</div>
                                )}
                            </div>
                        </div>
                        <div className="modal-footer">
                            <div className="text-muted small me-auto">
                                {selectedPotentialStudents.length} selected
                            </div>
                            <button className="btn-secondary me-2" onClick={() => setIsAddModalOpen(false)}>Cancel</button>
                            <button
                                className="btn-primary"
                                onClick={handleAddStudents}
                                disabled={selectedPotentialStudents.length === 0}
                            >
                                Add Selected
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Transfer Modal */}
            {transferModal.isOpen && (
                <div className="modal-overlay">
                    <div className="modal-content-large" style={{ maxWidth: '500px' }}>
                        <div className="modal-header">
                            <h3>Transfer Student</h3>
                            <button className="btn-close" onClick={() => setTransferModal({ isOpen: false, student: null })}><FiX /></button>
                        </div>
                        <div className="modal-body">
                            <p className="mb-4 text-muted">
                                Move <strong>{transferModal.student?.studentName}</strong> to another batch.
                            </p>

                            <div className="form-group mb-3">
                                <label className="mb-2 d-block fw-bold text-sm">Select Target Batch</label>
                                <select
                                    className="w-100 p-2 border rounded form-select"
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

                            <div className="form-group mb-3">
                                <label className="mb-2 d-block fw-bold text-sm">Transfer Reason / Description</label>
                                <textarea
                                    className="w-100 p-2 border rounded form-control"
                                    rows="3"
                                    placeholder="Enter reason for transfer (optional)..."
                                    value={transferReason}
                                    onChange={(e) => setTransferReason(e.target.value)}
                                ></textarea>
                            </div>
                        </div>
                        <div className="modal-footer">
                            <button className="btn-secondary" onClick={() => setTransferModal({ isOpen: false, student: null })}>Cancel</button>
                            <button
                                className="btn-primary"
                                onClick={confirmTransfer}
                                disabled={!selectedTransferBatch}
                            >
                                Confirm Transfer
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Fee Details Modal */}
            {feeDetailsModal.isOpen && (
                <div className="modal-overlay">
                    <div className="modal-content-large" style={{ maxWidth: '700px' }}>
                        <div className="modal-header">
                            <h3>Fee Details: {feeDetailsModal.student?.studentName}</h3>
                            <button className="btn-close" onClick={() => setFeeDetailsModal({ isOpen: false, student: null, fees: [], installments: [], loading: false })}><FiX /></button>
                        </div>
                        <div className="modal-body">
                            {feeDetailsModal.loading ? (
                                <div className="text-center p-4">Loading fee details...</div>
                            ) : (
                                <>
                                    {feeDetailsModal.fees.length === 0 ? (
                                        <div className="text-center p-4 text-muted">
                                            <FiAlertCircle size={32} className="mb-2" />
                                            <p>No fee records found for this student.</p>
                                            <button
                                                className="btn-primary mt-3"
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
                                            <div className="d-flex gap-3 mb-4">
                                                <div className="glass-card p-3 flex-fill text-center bg-light">
                                                    <div className="text-muted small fw-bold">TOTAL FEE</div>
                                                    <div className="fs-4 fw-bold text-dark">₹{feeDetailsModal.fees[0].payableAmount?.toLocaleString()}</div>
                                                </div>
                                                <div className="glass-card p-3 flex-fill text-center bg-light">
                                                    <div className="text-muted small fw-bold">PAID</div>
                                                    <div className="fs-4 fw-bold text-success">₹{(feeDetailsModal.fees[0].payableAmount - feeDetailsModal.fees[0].remainingAmount)?.toLocaleString()}</div>
                                                </div>
                                                <div className="glass-card p-3 flex-fill text-center bg-light">
                                                    <div className="text-muted small fw-bold">PENDING</div>
                                                    <div className="fs-4 fw-bold text-danger">₹{feeDetailsModal.fees[0].remainingAmount?.toLocaleString()}</div>
                                                </div>
                                            </div>

                                            {/* Installments Table */}
                                            <h4 className="mb-3 fs-6 text-secondary text-uppercase fw-bold">Installment Schedule</h4>
                                            {feeDetailsModal.installments.length > 0 ? (
                                                <table className="table table-bordered table-hover">
                                                    <thead className="table-light">
                                                        <tr>
                                                            <th>Installment</th>
                                                            <th>Due Date</th>
                                                            <th>Amount</th>
                                                            <th>Status</th>
                                                        </tr>
                                                    </thead>
                                                    <tbody>
                                                        {feeDetailsModal.installments.map((inst, idx) => (
                                                            <tr key={idx}>
                                                                <td>{inst.installmentPlanName || `Installment ${idx + 1}`}</td>
                                                                <td>{inst.dueDate ? new Date(inst.dueDate).toLocaleDateString() : 'N/A'}</td>
                                                                <td className="fw-bold">₹{Number(inst.amount || inst.installmentAmount).toLocaleString()}</td>
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
                                            ) : (
                                                <p className="text-muted fst-italic">No installment plan found (One-time payment or pending configuration).</p>
                                            )}
                                        </>
                                    )}
                                </>
                            )}
                        </div>
                        <div className="modal-footer">
                            <button className="btn-secondary" onClick={() => setFeeDetailsModal({ isOpen: false, student: null, fees: [], installments: [], loading: false })}>Close</button>
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
        </div>
    );
};

export default BatchBuilder;
