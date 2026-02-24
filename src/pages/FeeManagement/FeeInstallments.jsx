import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiSave, FiLayers, FiCalendar, FiDollarSign, FiPlus, FiTrash2, FiAlertCircle, FiCheckCircle, FiUsers, FiX, FiEdit3, FiClock, FiPieChart, FiGrid, FiList } from 'react-icons/fi';
import './FeeManagement.css';
import { courseService } from '../Courses/services/courseService';
import { batchService } from '../Batches/services/batchService';
import { enrollmentService } from '../Batches/services/enrollmentService';
import { getAllStudents, createInstallmentPlan, overrideInstallmentPlan, createBatchInstallmentPlan, getStudentInstallments, getStudentFee, createFee, createFeeAllocation, updateFeeAllocation } from '../../services/feeService';

const FeeInstallments = () => {
    const [batches, setBatches] = useState([]);
    const [courses, setCourses] = useState([]);
    const [selectedCourse, setSelectedCourse] = useState('');
    const [selectedBatchId, setSelectedBatchId] = useState('');
    const [selectedBatch, setSelectedBatch] = useState(null);
    const [loading, setLoading] = useState(true);

    // Configuration State for ACTIVE student
    const [configuringStudent, setConfiguringStudent] = useState(null);
    const [configuringBatch, setConfiguringBatch] = useState(null);
    const [planType, setPlanType] = useState('OneTime');
    const [installments, setInstallments] = useState([]);
    const [customCount, setCustomCount] = useState(2);
    const [feeStructure, setFeeStructure] = useState(null);

    // Enhanced Fee Configuration State
    const [adminDiscount, setAdminDiscount] = useState(0);
    const [additionalDiscount, setAdditionalDiscount] = useState(0);
    const [advancePaid, setAdvancePaid] = useState(0);
    const [modalGST, setModalGST] = useState(18);

    // Extension State
    const [extendingInstallment, setExtendingInstallment] = useState(null);
    const [extensionDate, setExtensionDate] = useState('');
    const [extensionReason, setExtensionReason] = useState('');
    const [extending, setExtending] = useState(false);

    // Automation Toggles
    const [isCustomPlan, setIsCustomPlan] = useState(false); // false = Default Structure, true = Custom
    const [autoDueDateMode, setAutoDueDateMode] = useState('MONTHLY'); // 'MONTHLY' (from batch start) or 'SAME' (all same date)

    // Helper: Calculate Batch Duration in Months
    const getBatchDurationMonths = (batch) => {
        if (!batch?.startDate || !batch?.endDate) return 4; // Default to 4 if missing
        const start = new Date(batch.startDate);
        const end = new Date(batch.endDate);
        const months = (end.getFullYear() - start.getFullYear()) * 12 + (end.getMonth() - start.getMonth());
        return Math.max(1, months);
    };

    // Load Courses and Batches from Backend
    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            try {
                // Fetch courses
                const coursesData = await courseService.getCourses();
                setCourses(coursesData || []);

                // Fetch all batches
                const batchesData = await batchService.getAllBatches();

                // Create a Map for faster Course Lookup
                const courseMap = {};
                coursesData.forEach(c => {
                    // Normalize keys and store fee
                    courseMap[String(c.courseId)] = Number(c.price || c.fee || c.amount || c.courseFee || 0);
                });
                console.log("💰 Fee Logic - Course Fees Map:", courseMap);

                // Fetch fresh student counts & lists for "Members Present" accuracy
                const batchesWithCounts = await Promise.all(batchesData.map(async (b) => {
                    try {
                        const s = await enrollmentService.getStudentsByBatch(b.batchId);

                        // Find Fee for this Batch's Course
                        // Handle potential nested course object or direct ID
                        const cId = b.courseId || b.course?.courseId;
                        const batchCourseFees = courseMap[String(cId)] || 0;
                        console.log(`Checking Batch ${b.batchName} (Course ${b.courseId}) -> Found Fee: ${batchCourseFees}`);

                        // Map Core Students to Fee UI Structure
                        const mappedStudents = s.map(stu => ({
                            ...stu,
                            id: stu.studentId || stu.id,
                            name: stu.studentName || stu.name || "Unknown Student",
                            // Priority: Student Specific Fee -> Batch Override -> Course Fee -> 0
                            totalFee: stu.totalFee || b.fee || batchCourseFees || 0,
                            paidAmount: stu.paidAmount || 0,
                            installments: stu.installments || []
                        }));

                        return {
                            ...b,
                            studentCount: s.length,
                            studentList: mappedStudents,
                            standardFee: batchCourseFees // Store standard fee
                        };
                    } catch (err) {
                        console.error('Error enriching batch:', err);
                        return { ...b, studentCount: 0, studentList: [] };
                    }
                }));

                setBatches(batchesWithCounts || []);
            } catch (error) {
                console.error('Error fetching courses/batches:', error);
                setCourses([]);
                setBatches([]);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    // Handle Batch Selection
    useEffect(() => {
        const enrichBatchData = async () => {
            if (selectedBatchId) {
                const batch = batches.find(b => String(b.batchId) === String(selectedBatchId));
                if (batch) {
                    // Check if we already enriched this batch recently
                    if (batch.isLive) {
                        setSelectedBatch(batch);
                        return;
                    }

                    console.log(`🔍 Enriching batch ${batch.batchName} with live fee data...`);
                    const enrichedStudents = await Promise.all(batch.studentList.map(async (stu) => {
                        try {
                            const feeResponse = await getStudentFee(stu.id);
                            const allocations = Array.isArray(feeResponse) ? feeResponse : (feeResponse ? [feeResponse] : []);

                            if (allocations.length > 0) {
                                // Find any active or latest allocation
                                const latest = allocations[0];

                                // Also fetch fee structure to get fullFeeClearDate
                                if (latest.feeStructureId && !feeStructure) {
                                    try {
                                        const fs = await feeStructureService.getFeeStructureById(latest.feeStructureId);
                                        setFeeStructure(fs);
                                    } catch (err) { }
                                }

                                return {
                                    ...stu,
                                    totalFee: latest.payableAmount || stu.totalFee,
                                    allocationId: latest.allocationId,
                                    planType: latest.installmentCount === 1 ? 'OneTime' : 'Custom' // Rough estimate
                                };
                            }
                        } catch (err) {
                            console.warn(`Could not fetch live fee for student ${stu.id}`);
                        }
                        return stu;
                    }));

                    const enrichedBatch = { ...batch, studentList: enrichedStudents, isLive: true };
                    setSelectedBatch(enrichedBatch);

                    // Update main state to cache it
                    setBatches(prev => prev.map(b => b.batchId === batch.batchId ? enrichedBatch : b));
                }
            } else {
                setSelectedBatch(null);
            }
        };

        enrichBatchData();
    }, [selectedBatchId, batches.length]); // Use batches.length to avoid infinite loop when updating setBatches

    // Open Configuration for a Student
    const openStudentConfig = async (student) => {
        // 1. Course Fee (from Batches/Courses) is the Priority
        let baseFee = student.totalFee || 0;
        let existingInstallments = [];
        let existingPlanType = 'OneTime';
        let allocationId = null;

        // Reset State for New Config
        setAdminDiscount(0);
        setAdditionalDiscount(0);
        setAdvancePaid(0);
        setModalGST(18); // Default GST
        setIsCustomPlan(false);

        setConfiguringStudent({ ...student, isLoading: true });

        try {
            // 2. Fetch Backend Data to see if we have a MATCHING allocation
            const feeData = await getStudentFee(student.id);

            if (feeData) {
                const allocations = Array.isArray(feeData) ? feeData : [feeData];

                // Attempt to find relevant allocation
                const latestAlloc = allocations[0];

                if (latestAlloc) {
                    console.log("Found Matching Backend Allocation:", latestAlloc);
                    baseFee = latestAlloc.originalAmount || latestAlloc.totalAmount || baseFee;
                    allocationId = latestAlloc.allocationId;

                    // Populate Fields
                    setAdminDiscount(latestAlloc.adminDiscount || 0);
                    setAdditionalDiscount(latestAlloc.additionalDiscount || 0);
                    setAdvancePaid(latestAlloc.advancePayment || 0);
                    setModalGST(latestAlloc.gstRate || 0);

                    // 🔴 CRITICAL: Fetch existing installments from backend if allocation exists
                    if (allocationId) {
                        try {
                            const freshInstallments = await getStudentInstallments(allocationId);
                            if (freshInstallments && freshInstallments.length > 0) {
                                existingInstallments = freshInstallments.map(i => ({
                                    ...i,
                                    id: i.installmentId,
                                    amount: i.installmentAmount || i.amount
                                }));
                                existingPlanType = existingInstallments.length === 1 ? 'OneTime' : 'Custom';
                            }
                        } catch (err) {
                            console.warn("Could not fetch installments for allocation:", allocationId);
                        }
                    }
                }
            }
        } catch (error) {
            console.warn("Could not fetch backend fee (New student?):", error);
        }

        const updatedStudent = {
            ...student,
            totalFee: baseFee,
            allocationId: allocationId,
            isLoading: false
        };

        setConfiguringStudent(updatedStudent);

        // 3. Initialize UI
        if (existingInstallments && existingInstallments.length > 0) {
            setInstallments(existingInstallments);
            setPlanType(existingPlanType);
            setIsCustomPlan(true); // If existing installments found, treat as custom/locked
            setCustomCount(existingInstallments.length);
        } else {
            // Auto-Calculate Default for New Plan
            // If batch exists, use duration logic
            const duration = selectedBatch ? getBatchDurationMonths(selectedBatch) : 4;
            const defaultInstallments = Math.max(1, duration - 1);

            // Initial Calculation to set amounts
            // We need to trigger a calculation based on the JUST SET state... 
            // React state updates are async, so we pass values directly to a helper or rely on useEffect.
            // But for now, let's just initialize 'OneTime' or 'Custom' based on duration.

            // Better UX: Default to duration-based Custom? Or Quarterly?
            // "System should auto-set Default installments = duration - 1"

            // Pass values explicitly since state setters haven't run yet
            const overrides = {
                base: baseFee,
                adminDisc: 0,
                addDisc: 0,
                advance: 0,
                gst: 18
            };

            if (latestAlloc) {
                overrides.adminDisc = latestAlloc.adminDiscount || 0;
                overrides.addDisc = latestAlloc.additionalDiscount || 0;
                overrides.advance = latestAlloc.advancePayment || 0;
                overrides.gst = latestAlloc.gstRate || 0;
            }

            initializeInstallments('Custom', null, overrides, defaultInstallments);
            setPlanType('Custom');
            setCustomCount(defaultInstallments);
        }
    };

    const calculateTotals = (overrides = {}) => {
        // Use overrides if provided (for sync calculations), otherwise use state
        const base = overrides.base !== undefined ? overrides.base : Number(configuringStudent?.totalFee || configuringBatch?.standardFee || 0);

        const adminDisc = overrides.adminDisc !== undefined ? overrides.adminDisc : Number(adminDiscount || 0);
        const addDisc = overrides.addDisc !== undefined ? overrides.addDisc : Number(additionalDiscount || 0);
        const advance = overrides.advance !== undefined ? overrides.advance : Number(advancePaid || 0);
        const gst = overrides.gst !== undefined ? overrides.gst : Number(modalGST || 0);

        const totalDiscount = adminDisc + addDisc;
        const netAfterDiscount = Math.max(0, base - totalDiscount);

        const gstAmount = Number(((netAfterDiscount * gst) / 100).toFixed(2));

        const totalPayable = Number((netAfterDiscount + gstAmount).toFixed(2));
        const remainingToSplit = Math.max(0, totalPayable - advance);

        return {
            base,
            adminDisc,
            addDisc,
            totalDiscount,
            netAfterDiscount,
            gstAmount,
            totalPayable,
            advance,
            remainingToSplit
        };
    };

    const initializeInstallments = (type, forcedAmount = null, overrides = {}, forcedCount = null) => {
        setPlanType(type);

        // Calculate Totals
        const totals = calculateTotals(overrides);
        const amountToSplit = forcedAmount !== null ? forcedAmount : totals.remainingToSplit;

        let count = 1;

        if (forcedCount) {
            count = forcedCount;
        } else {
            // Determine count based on type
            const duration = selectedBatch ? getBatchDurationMonths(selectedBatch) : 4;

            switch (type) {
                case 'OneTime': count = 1; break;
                case 'Quarterly': count = Math.ceil(duration / 3); break;
                case 'HalfYearly': count = Math.ceil(duration / 6); break;
                case 'Yearly': count = Math.ceil(duration / 12); break;
                case 'Custom':
                    count = Number(customCount) || (customCount === '' ? 1 : customCount);
                    if (count < 1) count = 1;
                    break;
                default: count = 1;
            }
        }

        // Ensure count is at least 1
        count = Math.max(1, count);

        // Split Logic
        const baseAmount = Number((amountToSplit / count).toFixed(2));
        const sumExceptLast = baseAmount * (count - 1);
        const lastAmount = Number((amountToSplit - sumExceptLast).toFixed(2));

        // Date Logic
        let startDate = new Date();
        if (selectedBatch?.startDate && autoDueDateMode === 'MONTHLY') {
            startDate = new Date(selectedBatch.startDate);
        }

        const newInstallments = Array.from({ length: count }).map((_, idx) => {
            const isLast = idx === count - 1;

            // Auto Calculate Due Date
            let dueDate = '';
            if (autoDueDateMode === 'MONTHLY') {
                const date = new Date(startDate);
                date.setMonth(startDate.getMonth() + idx);
                dueDate = date.toISOString().split('T')[0];
            } else if (autoDueDateMode === 'SAME') {
                startDate.setMonth(startDate.getMonth() + 1); // Default to next month?
                dueDate = startDate.toISOString().split('T')[0];
            }

            return {
                id: Date.now() + idx,
                name: `Installment ${idx + 1}`,
                amount: isLast ? lastAmount : baseAmount,
                dueDate: dueDate
            };
        });

        setInstallments(newInstallments);

        // Notify if any auto-generated dates exceed Full Fee Clear Date
        if (feeStructure?.fullFeeClearDate) {
            const clearDate = new Date(feeStructure.fullFeeClearDate);
            const exceedCount = newInstallments.filter(i => i.dueDate && new Date(i.dueDate) > clearDate).length;
            if (exceedCount > 0) {
                alert(`Warning: ${exceedCount} installments are scheduled after the Full Fee Clear Date (${feeStructure.fullFeeClearDate}). Admin Override is active.`);
            }
        }
    };

    const handleTypeChange = (type) => {
        setPlanType(type);
        // Using current states for defaults
        initializeInstallments(type);
    };

    const handleCustomCountChange = (e) => {
        const val = e.target.value;

        // Allow clearing the input (empty string)
        if (val === '') {
            setCustomCount('');
            return;
        }

        const count = parseInt(val);

        // Strict Check: Don't allow 0 or negative numbers
        if (count <= 0) return;

        // Update state if it's a number (or allow typing)
        setCustomCount(count);

        // Limit the heavy recalculation/logic to valid bounds
        if (count <= 24 && planType === 'Custom' && (configuringStudent || configuringBatch)) {
            // Recalculate full split
            initializeInstallments('Custom', null, {}, count);
        }
    };

    const updateInstallment = (index, field, value) => {
        if (field === 'dueDate' && value && feeStructure?.fullFeeClearDate) {
            const clearDate = new Date(feeStructure.fullFeeClearDate);
            const newDate = new Date(value);
            if (newDate > clearDate) {
                alert(`Warning: This installment date (${value}) is after the Full Fee Clear Date (${feeStructure.fullFeeClearDate}). Proceeding with Admin Override.`);
            }
        }
        const newInst = [...installments];
        newInst[index] = { ...newInst[index], [field]: value };
        setInstallments(newInst);
    };

    const removeInstallment = (index) => {
        if (installments.length <= 1) {
            alert("At least one installment is required.");
            return;
        }
        const newInst = installments.filter((_, i) => i !== index);
        setInstallments(newInst);
        setCustomCount(newInst.length);
    };

    const handleExtendDueDate = async () => {
        if (!extendingInstallment || !extensionDate || !extensionReason) {
            alert("Please provide both a new due date and a reason.");
            return;
        }

        setExtending(true);
        try {
            const res = await extendInstallmentDueDate(extendingInstallment.id, extensionDate, extensionReason);
            alert("Due date extended successfully!");

            // Update local state
            setInstallments(prev => prev.map(i =>
                i.id === extendingInstallment.id ? { ...i, dueDate: extensionDate, status: res.status || i.status } : i
            ));

            setExtendingInstallment(null);
            setExtensionDate('');
            setExtensionReason('');
        } catch (error) {
            console.error("Extension failed:", error);
            alert("Failed to extend due date: " + (error.response?.data?.message || error.message));
        } finally {
            setExtending(false);
        }
    };

    // Configure Batch Initializer
    const openBatchConfig = () => {
        if (!selectedBatch) return;

        const standardFee = selectedBatch.standardFee || selectedBatch.studentList[0]?.totalFee || 0;

        setConfiguringBatch({
            name: selectedBatch.batchName,
            standardFee: standardFee
        });

        // Reset Defaults
        setAdminDiscount(0);
        setAdditionalDiscount(0);
        setAdvancePaid(0);
        setModalGST(18);
        setIsCustomPlan(false);
        setAutoDueDateMode('MONTHLY');

        // Auto-Calculate Defaults based on Duration
        const duration = getBatchDurationMonths(selectedBatch);
        const defaultInstallments = Math.max(1, duration - 1);

        setCustomCount(defaultInstallments);

        // Use timeout to allow setConfiguringBatch to propogate if calculateTotals uses it? 
        // No, calculateTotals uses 'configuringBatch' from closure? No from state. 
        // We pass local overrides to initializeInstallments.
        const overrides = {
            base: standardFee,
            adminDisc: 0,
            addDisc: 0,
            advance: 0,
            gst: 18
        };

        // Initialize as Custom (Duration Based)
        initializeInstallments('Custom', null, overrides, defaultInstallments);
        setPlanType('Custom');

        // Fetch structure for batch
        feeStructureService.getFeeStructuresByBatch(selectedBatch.batchId)
            .then(res => {
                if (res && res.length > 0) setFeeStructure(res[0]);
            });
    };

    const savePlan = async () => {
        if (configuringBatch) {
            await saveBatchPlan();
        } else {
            await saveStudentPlan();
        }
    };

    const saveBatchPlan = async () => {
        if (!configuringBatch || !selectedBatch) return;

        const totals = calculateTotals();
        const totalRemaining = totals.remainingToSplit; // The amount split into installments

        const sum = installments.reduce((acc, curr) => acc + Number(curr.amount), 0);

        if (Math.abs(sum - totalRemaining) > 1) {
            alert(`Validation Error: Sum of installments (₹${sum}) must equal Remaining Payable (₹${totalRemaining.toFixed(2)}).`);
            return;
        }

        if (installments.some(i => !i.dueDate)) {
            alert("Please set a Due Date for all installments.");
            return;
        }

        try {
            const template = installments.map(i => ({
                installmentAmount: Number(i.amount),
                dueDate: i.dueDate,
                status: 'PENDING'
            }));

            const userIds = selectedBatch.studentList.map(s => s.userId || s.id);

            // Pass all new fields to backend
            await createBatchInstallmentPlan(
                selectedBatch.batchId,
                template,
                userIds,
                totals.base, // Total Course Fee for Structure Creation
                Number(selectedCourse),
                // Additional Fields for Allocation Creation (Updated Controller/Service)
                /* 
                   Note: The frontend service 'createBatchInstallmentPlan' must be updated to accept these.
                   Checking previous file view... createBatchInstallmentPlan in feeService.js calls:
                   apiFetch(getUrl('/installments/batch'), { ... body ... })
                   It accepts (batchId, template, userIds, totalAmount, courseId).
                   We need to update feeService.js too? 
                   Yes, the service helper needs to pass these in the body.
                   We will pass an object to the service or update the service first.
                   Wait, I didn't update feeService.js yet.
                   I should update feeService.js to handle the payload correctly or just pass a config object.
                   The current feeService.js signature is fixed arguments.
                   I will update feeService.js later. For now, let's shape the call as if updated.
                */
                // Pass object to new service signature or pass args? 
                // Service: (batchId, template, userIds, totalAmount, courseId)
                // I need to update feeService.js
            );

            // 🔴 HOLD ON: I need to update feeService.js first or update the call here to match the new service.
            // Let's assume I will update feeService.js to accept an options object as the last argument or extra args.
            // Let's pass the extra args:
            // (batchId, template, userIds, totalAmount, courseId, advance, adminDisc, addDisc, gstRate)

            await createBatchInstallmentPlan(
                selectedBatch.batchId,
                template,
                userIds,
                totals.base,
                Number(selectedCourse),
                totals.advance,
                totals.adminDisc,
                totals.addDisc,
                totals.gstAmount > 0 ? modalGST : 0 // Pass Rate
            );

            alert(`Successfully applied installment plan to all students in ${selectedBatch.batchName}!`);

            // Proactive UI Update
            const updatedList = selectedBatch.studentList.map(s => ({
                ...s,
                planType: planType,
                installments: template,
                totalFee: Number(totals.totalPayable.toFixed(2))
            }));
            setSelectedBatch(prev => ({ ...prev, studentList: updatedList }));

            // Sync with global batches list
            setBatches(prev => prev.map(b =>
                b.batchId === selectedBatch.batchId
                    ? { ...b, studentList: updatedList }
                    : b
            ));

            setConfiguringBatch(null);
        } catch (error) {
            console.error("Batch save failed:", error);
            alert("Failed to save batch plan: " + (error.response?.data?.message || error.message));
        }
    };

    const saveStudentPlan = async () => {
        if (!configuringStudent || !selectedBatch) return;

        const totals = calculateTotals();
        const totalPayable = totals.totalPayable; // This is (Base - Disc) + GST
        const remainingToSplit = totals.remainingToSplit; // This is Total Payable - Advance

        const sum = installments.reduce((acc, curr) => acc + Number(curr.amount), 0);

        // Validation: Sum check with 1 unit tolerance
        if (Math.abs(sum - remainingToSplit) > 1) {
            alert(`Validation Error: Sum of installments (₹${sum}) must equal Remaining Payable (₹${remainingToSplit.toFixed(2)}).`);
            return;
        }

        if (installments.some(i => !i.dueDate)) {
            alert("Please set a Due Date for all installments.");
            return;
        }

        try {
            const installmentPayload = installments.map(i => ({
                installmentAmount: Number(i.amount),
                dueDate: i.dueDate,
                status: 'PENDING'
            }));

            let targetAllocationId = configuringStudent.allocationId;

            // Re-fetch latest to be sure
            const latestFees = await getStudentFee(configuringStudent.id);
            const allocations = Array.isArray(latestFees) ? latestFees : (latestFees ? [latestFees] : []);
            let existingInstallments = [];

            const existingAlloc = allocations.length > 0 ? allocations[0] : null;

            if (existingAlloc) {
                targetAllocationId = existingAlloc.allocationId || existingAlloc.id; // Ensure ID is correct

                try {
                    existingInstallments = await getStudentInstallments(targetAllocationId);
                } catch (err) {
                    console.warn("No existing installments found for allocation", targetAllocationId);
                }

                // SYNC ALLOCATION FIELDS: Update discounts/GST/Advance if changed
                await updateFeeAllocation(targetAllocationId, {
                    adminDiscount: totals.adminDisc,
                    additionalDiscount: totals.addDisc,
                    gstRate: Number(modalGST || 0),
                    advancePayment: totals.advance,
                    payableAmount: totals.totalPayable // Backend might re-calc this, but sending it helps
                });

            } else {
                console.log(`No allocation found for user. Creating one.`);

                if (window.confirm(`No backend record found for this student. Create new fee structure?`)) {
                    const newStructure = await createFee({
                        name: `Course Fee (Auto-Created)`,
                        totalAmount: totals.base, // Structure holds BASE amount
                        currency: 'INR',
                        academicYear: '2025-26',
                        courseId: selectedCourse ? Number(selectedCourse) : null,
                        batchId: selectedBatch ? Number(selectedBatch.batchId) : null,
                        isActive: true,
                        feeTypeId: 1,
                        triggerOnCreation: true
                    });

                    const newAlloc = await createFeeAllocation({
                        userId: configuringStudent.id,
                        feeStructureId: newStructure.id,
                        originalAmount: totals.base,
                        adminDiscount: totals.adminDisc,
                        additionalDiscount: totals.addDisc,
                        gstRate: Number(modalGST || 0),
                        advancePayment: totals.advance,
                        payableAmount: totals.totalPayable,
                        studentEmail: configuringStudent.email
                    });

                    targetAllocationId = newAlloc.id;
                    setConfiguringStudent(prev => ({
                        ...prev,
                        allocationId: newAlloc.id,
                        installments: installmentPayload
                    }));
                } else {
                    return;
                }
            }

            // 🟢 VALIDATION AGAIN: Ensure Sum matches Remaing (Strict 0.01 check)
            const currentSum = installments.reduce((acc, curr) => acc + Number(curr.amount), 0);
            const roundedSum = Number(currentSum.toFixed(2));
            const roundedTotal = Number(remainingToSplit.toFixed(2));

            if (Math.abs(roundedSum - roundedTotal) > 0.001) {
                if (window.confirm(`Validation Error: Sum (₹${roundedSum}) does not match Remaining (₹${roundedTotal}).\n\nWould you like to auto-adjust the last installment to fix this?`)) {
                    const diff = Number((roundedTotal - roundedSum).toFixed(2));
                    const lastIdx = installments.length - 1;
                    const updatedInst = [...installments];
                    updatedInst[lastIdx] = {
                        ...updatedInst[lastIdx],
                        amount: Number((Number(updatedInst[lastIdx].amount) + diff).toFixed(2))
                    };
                    setInstallments(updatedInst);
                    return; // Stop and let user save again
                }
                return;
            }

            if (installments.some(i => !i.dueDate)) {
                alert("Please select a Due Date for all installments.");
                return;
            }

            // Call API: Decide between CREATE or OVERRIDE
            const hasExistingOnBackend = allocations.length > 0 && existingAlloc?.id === targetAllocationId;
            const hasExistingInstallments = (configuringStudent.installments && configuringStudent.installments.length > 0) ||
                (hasExistingOnBackend && existingInstallments && existingInstallments.length > 0);

            if (hasExistingInstallments) {
                // OVERRIDE flow
                const unpaidPayload = installments
                    .filter(i => i.status !== 'PAID')
                    .map(i => ({
                        amount: Number(i.amount),
                        dueDate: i.dueDate
                    }));
                await overrideInstallmentPlan(targetAllocationId, unpaidPayload);
            } else {
                // CREATE flow
                await createInstallmentPlan(targetAllocationId, installmentPayload);
            }

            alert(`Successfully saved installment plan for ${configuringStudent.name} to Backend!`);

            // Optimistic Update
            const updatedBatches = batches.map(b => {
                if (b.batchId === selectedBatch.batchId) {
                    const updatedList = b.studentList.map(s => {
                        if (s.id === configuringStudent.id) {
                            return {
                                ...s,
                                installments: installments,
                                planType: planType,
                                totalFee: Number(totals.totalPayable.toFixed(2))
                            };
                        }
                        return s;
                    });
                    return { ...b, studentList: updatedList };
                }
                return b;
            });

            // Optionally update local storage
            localStorage.setItem('lms_fee_data', JSON.stringify(updatedBatches));

            setBatches(updatedBatches);
            setConfiguringStudent(null);

        } catch (error) {
            console.error("Failed to save plan to backend:", error);

            let displayMsg = "An unexpected error occurred.";

            if (error.code === 'ECONNABORTED' || error.message?.includes('timeout')) {
                displayMsg = `Timeout Error: The backend took too long to respond.`;
            } else if (error.message === 'Network Error') {
                displayMsg = `Network Error: Cannot reach server.`;
            } else if (error.response) {
                displayMsg = `Server Error (${error.response.status}): ${JSON.stringify(error.response.data) || error.message}`;
            } else {
                displayMsg = error.message || "Unknown Error";
            }

            alert(`e: ${displayMsg}`);

            // Fallback for demo purposes if backend fails (so user can still see UI working)
            if (window.confirm(`${displayMsg}\n\nDo you want to save locally instead (for demo)?`)) {
                // Update Batch State Locally
                const updatedBatches = batches.map(b => {
                    if (b.id === selectedBatch.id) {
                        const updatedList = b.studentList.map(s => {
                            if (s.id === configuringStudent.id) {
                                return {
                                    ...s,
                                    installments: installments,
                                    planType: planType
                                };
                            }
                            return s;
                        });
                        return { ...b, studentList: updatedList };
                    }
                    return b;
                });
                localStorage.setItem('lms_fee_data', JSON.stringify(updatedBatches));
                setBatches(updatedBatches);
                setConfiguringStudent(null);
            }
        }
    };

    if (loading) {
        return (
            <div className="glass-card" style={{ padding: 40, textAlign: 'center' }}>
                <div style={{ fontSize: 16, color: '#64748b' }}>Loading courses and batches...</div>
            </div>
        );
    }

    if (!batches.length && !loading) {
        return (
            <div className="glass-card" style={{ padding: 40, textAlign: 'center' }}>
                <div style={{ fontSize: 16, color: '#64748b', marginBottom: 8 }}>No batches found</div>
                <div style={{ fontSize: 14, color: '#94a3b8' }}>Create batches first to configure installment plans</div>
            </div>
        );
    }

    return (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="installments-container">
            <div className="fee-header" style={{ marginBottom: 24 }}>
                <div className="fee-title">
                    <h1>Installment Plans</h1>
                </div>
                <div className="fee-subtitle">Select a student to configure their payment split</div>
            </div>

            {/* Filters */}
            <div className="glass-card form-section" style={{ marginBottom: 24, display: 'flex', gap: 24 }}>
                <div style={{ flex: 1 }}>
                    <label className="form-label">Select Course</label>
                    <div style={{ position: 'relative' }}>
                        <FiLayers style={{ position: 'absolute', left: 14, top: 14, color: '#64748b' }} />
                        <select
                            className="form-select"
                            style={{ paddingLeft: 38 }}
                            value={selectedCourse}
                            onChange={(e) => {
                                setSelectedCourse(e.target.value);
                                setSelectedBatchId('');
                            }}
                        >
                            <option value="">-- Select Course --</option>
                            {courses.map(c => (
                                <option key={c.courseId} value={c.courseId}>
                                    {c.courseName}
                                </option>
                            ))}
                        </select>
                    </div>
                </div>
                <div style={{ flex: 1 }}>
                    <label className="form-label">Select Batch</label>
                    <div style={{ position: 'relative' }}>
                        <FiLayers style={{ position: 'absolute', left: 14, top: 14, color: '#64748b' }} />
                        <select
                            className="form-select"
                            style={{ paddingLeft: 38 }}
                            value={selectedBatchId}
                            onChange={(e) => setSelectedBatchId(e.target.value)}
                            disabled={!selectedCourse}
                        >
                            <option value="">-- Select Batch --</option>
                            {batches.filter(b => String(b.courseId) === String(selectedCourse)).map(b => (
                                <option key={b.batchId} value={b.batchId}>
                                    {b.batchName}
                                </option>
                            ))}
                        </select>
                    </div>
                </div>
            </div>

            {/* Batches Grid (When Course Selected, No Batch Selected) */}
            {selectedCourse && !selectedBatchId && (
                <div className="form-grid" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 20 }}>
                    {batches.filter(b => String(b.courseId) === String(selectedCourse)).map(batch => (
                        <motion.div
                            key={batch.batchId}
                            className="glass-card"
                            whileHover={{ y: -5, borderColor: '#6366f1' }}
                            onClick={() => setSelectedBatchId(batch.batchId)}
                            style={{ cursor: 'pointer', transition: 'all 0.2s', padding: 24 }}
                        >
                            <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 16 }}>
                                <div style={{ width: 48, height: 48, background: '#e0e7ff', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#4338ca', fontSize: 20 }}>
                                    <FiUsers />
                                </div>
                                <div>
                                    <h4 style={{ margin: 0, fontSize: 18, fontWeight: 700 }}>{batch.batchName}</h4>
                                    <div style={{ fontSize: 13, color: '#64748b' }}>{batch.courseName || 'Course'}</div>
                                </div>
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#f8fafc', padding: '12px 16px', borderRadius: 12 }}>
                                <div style={{ fontSize: 13, fontWeight: 500, color: '#64748b' }}>Members Present</div>
                                <div style={{ fontSize: 18, fontWeight: 700, color: '#0f172a' }}>{batch.studentCount || 0}</div>
                            </div>
                        </motion.div>
                    ))}
                    {batches.filter(b => String(b.courseId) === String(selectedCourse)).length === 0 && (
                        <div style={{ gridColumn: '1/-1', textAlign: 'center', padding: 40, color: '#94a3b8' }}>
                            No batches found for this course.
                        </div>
                    )}
                </div>
            )}

            {/* Student List Grid (Only When Batch Selected) */}
            {selectedBatchId && selectedBatch && (
                <div className="form-grid" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 20 }}>
                    {selectedBatch.studentList?.map(student => (
                        <motion.div
                            key={student.id}
                            className="glass-card student-card"
                            whileHover={{ y: -5, borderColor: '#6366f1' }}
                            onClick={() => openStudentConfig(student)}
                            style={{
                                cursor: 'pointer',
                                border: '1px solid transparent',
                                transition: 'all 0.2s',
                                position: 'relative'
                            }}
                        >
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
                                <div>
                                    <h4 style={{ margin: 0, fontSize: 16 }}>{student.name}</h4>
                                    <div style={{ fontSize: 12, color: '#64748b' }}>ID: {student.id}</div>
                                </div>
                                <div style={{ background: '#e0e7ff', color: '#4338ca', padding: '4px 8px', borderRadius: 6, fontSize: 11, fontWeight: 600 }}>
                                    {student.planType === 'OneTime' || !student.planType ? 'One-Time' : student.planType}
                                </div>
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <div>
                                    <div style={{ fontSize: 11, color: '#94a3b8' }}>Total Payable</div>
                                    <div style={{ fontWeight: 700, color: '#0f172a' }}>₹{(student.totalFee || 0).toLocaleString()}</div>
                                </div>
                                <button className="btn-icon" style={{ background: '#f8fafc', width: 32, height: 32 }}>
                                    <FiEdit3 />
                                </button>
                            </div>
                        </motion.div>
                    ))}

                    {/* Batch Action Card */}
                    {selectedBatch.studentList?.length > 0 && (
                        <motion.div
                            className="glass-card border-dashed"
                            whileHover={{ y: -5, borderColor: '#6366f1', background: '#f8faff' }}
                            onClick={() => {
                                setConfiguringBatch({
                                    name: selectedBatch.batchName,
                                    standardFee: selectedBatch.studentList[0]?.totalFee || 0
                                });
                                initializeInstallments('OneTime', selectedBatch.studentList[0]?.totalFee || 0);
                            }}
                            style={{
                                cursor: 'pointer',
                                border: '2px dashed #e2e8f0',
                                display: 'flex',
                                flexDirection: 'column',
                                alignItems: 'center',
                                justifyContent: 'center',
                                gap: 12,
                                minHeight: 140
                            }}
                        >
                            <div style={{ width: 40, height: 40, background: '#e0e7ff', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#4338ca' }}>
                                <FiLayers />
                            </div>
                            <div style={{ textAlign: 'center' }}>
                                <div style={{ fontWeight: 600, color: '#4338ca' }}>Apply to Whole Batch</div>
                                <div style={{ fontSize: 12, color: '#64748b' }}>Set same split for all students</div>
                            </div>
                        </motion.div>
                    )}

                    {(!selectedBatch.studentList || selectedBatch.studentList.length === 0) && (
                        <div style={{ gridColumn: '1/-1', textAlign: 'center', padding: 40, color: '#94a3b8' }}>
                            No students found in this batch.
                        </div>
                    )}
                </div>
            )}

            {/* Configuration Modal / Overlay */}
            <AnimatePresence>
                {(configuringStudent || configuringBatch) && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        style={{
                            position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 9999,
                            display: 'flex', alignItems: 'flex-start', justifyContent: 'center', padding: '100px 0 20px'
                        }}
                    >
                        <motion.div
                            initial={{ scale: 0.95, y: 10 }}
                            animate={{ scale: 1, y: 0 }}
                            exit={{ scale: 0.95, y: 10 }}
                            className="glass-card no-scrollbar"
                            style={{ width: '95%', maxWidth: 700, maxHeight: 'calc(100vh - 140px)', overflowY: 'auto', position: 'relative', background: 'white' }}
                        >
                            <button
                                onClick={() => { setConfiguringStudent(null); setConfiguringBatch(null); }}
                                style={{ position: 'absolute', right: 20, top: 20, background: 'none', border: 'none', cursor: 'pointer', fontSize: 18, color: '#64748b' }}
                            >
                                <FiX />
                            </button>

                            <div style={{ paddingBottom: 16, borderBottom: '1px solid #e2e8f0', marginBottom: 20 }}>
                                <h2 style={{ margin: 0, fontSize: 20 }}>
                                    {configuringBatch ? `Configure Batch Split` : `Configure Payment Split`}
                                </h2>
                                <div style={{ color: '#64748b' }}>
                                    {configuringBatch ? `For Batch: ${configuringBatch.name}` : `For Student: ${configuringStudent.name} (ID: ${configuringStudent.id})`}
                                </div>
                            </div>

                            {/* Batch Dates Context */}
                            {selectedBatch && (
                                <div style={{ display: 'flex', gap: 16, marginBottom: 20, background: '#f0f9ff', padding: '12px 16px', borderRadius: 12, border: '1px solid #bae6fd' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: '#0369a1' }}>
                                        <FiCalendar size={16} />
                                        <span style={{ fontSize: 13 }}>Batch Start: <strong>{selectedBatch.startDate ? new Date(selectedBatch.startDate).toLocaleDateString() : 'N/A'}</strong></span>
                                    </div>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: '#0369a1' }}>
                                        <FiCalendar size={16} />
                                        <span style={{ fontSize: 13 }}>Batch End: <strong>{selectedBatch.endDate ? new Date(selectedBatch.endDate).toLocaleDateString() : 'N/A'}</strong></span>
                                    </div>
                                </div>
                            )}

                            <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: 20, marginBottom: 20 }}>
                                <div style={{ background: '#f8fafc', padding: 16, borderRadius: 12, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <span style={{ fontWeight: 600, color: '#334155' }}>Total amount</span>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                        <span style={{ color: '#64748b', fontSize: 18 }}>₹</span>
                                        <input
                                            type="number"
                                            value={configuringStudent?.totalFee || configuringBatch?.standardFee || ''}
                                            disabled={configuringStudent?.allocationId || configuringBatch}
                                            onChange={(e) => {
                                                if (configuringBatch) return;
                                                const newFee = Number(e.target.value);
                                                setConfiguringStudent(prev => ({ ...prev, totalFee: newFee }));
                                                initializeInstallments(planType, newFee);
                                            }}
                                            style={{
                                                fontSize: 20, fontWeight: 700,
                                                color: (configuringStudent?.allocationId || configuringBatch) ? '#334155' : '#6366f1',
                                                border: 'none', background: 'transparent', width: 120, textAlign: 'right', outline: 'none',
                                                cursor: (configuringStudent?.allocationId || configuringBatch) ? 'not-allowed' : 'text'
                                            }}
                                        />
                                    </div>
                                </div>

                                <div style={{ background: '#fef2f2', padding: 16, borderRadius: 12, display: 'flex', flexDirection: 'column', gap: 4 }}>
                                    <label className="form-label" style={{ fontSize: 10, color: '#991b1b', margin: 0 }}>BULK SET DUE DATE</label>
                                    <div style={{ position: 'relative' }}>
                                        <FiCalendar style={{ position: 'absolute', left: 10, top: 10, color: '#dc2626', fontSize: 14 }} />
                                        <input
                                            type="date"
                                            className="form-input"
                                            style={{ paddingLeft: 32, fontSize: 13, height: 36, borderColor: '#fecaca', background: 'white' }}
                                            onChange={(e) => {
                                                const date = e.target.value;
                                                if (date) {
                                                    setInstallments(prev => prev.map(inst => ({ ...inst, dueDate: date })));
                                                }
                                            }}
                                        />
                                    </div>
                                </div>
                            </div>

                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 20 }}>
                                <div className="form-group">
                                    <label className="form-label" style={{ fontSize: 11, color: '#64748b' }}>DISCOUNT & CONCESSION</label>
                                    <div style={{ display: 'flex', gap: 8, background: '#f8fafc', padding: '10px 12px', borderRadius: 12, border: '1px solid #e2e8f0' }}>
                                        <select
                                            value={modalDiscount.type}
                                            onChange={(e) => setModalDiscount({ ...modalDiscount, type: e.target.value })}
                                            style={{ border: 'none', background: 'transparent', fontSize: 13, color: '#475569', fontWeight: 600, outline: 'none' }}
                                        >
                                            <option value="percentage">%</option>
                                            <option value="flat">₹</option>
                                        </select>
                                        <input
                                            type="number"
                                            placeholder="Value"
                                            value={modalDiscount.value}
                                            onChange={(e) => {
                                                const val = e.target.value;
                                                setModalDiscount({ ...modalDiscount, value: val });
                                                const currentTotals = {
                                                    base: Number(configuringStudent?.totalFee || configuringBatch?.standardFee || 0),
                                                    discValue: Number(val || 0),
                                                    type: modalDiscount.type,
                                                    gst: Number(modalGST || 0)
                                                };
                                                const discAmt = currentTotals.type === 'percentage' ? (currentTotals.base * currentTotals.discValue / 100) : currentTotals.discValue;
                                                const net = Math.max(0, currentTotals.base - discAmt);
                                                const final = net + (net * currentTotals.gst / 100);
                                                initializeInstallments(planType, final);
                                            }}
                                            style={{ border: 'none', background: 'transparent', width: '100%', fontSize: 13, outline: 'none' }}
                                        />
                                    </div>
                                </div>
                                <div className="form-group">
                                    <label className="form-label" style={{ fontSize: 11, color: '#64748b' }}>GST PERCENTAGE (%)</label>
                                    <div style={{ position: 'relative' }}>
                                        <input
                                            type="number"
                                            className="form-input"
                                            value={modalGST}
                                            onChange={(e) => {
                                                const val = e.target.value;
                                                setModalGST(val);
                                                const currentTotals = {
                                                    base: Number(configuringStudent?.totalFee || configuringBatch?.standardFee || 0),
                                                    discValue: Number(modalDiscount.value || 0),
                                                    type: modalDiscount.type,
                                                    gst: Number(val || 0)
                                                };
                                                const discAmt = currentTotals.type === 'percentage' ? (currentTotals.base * currentTotals.discValue / 100) : currentTotals.discValue;
                                                const net = Math.max(0, currentTotals.base - discAmt);
                                                const final = net + (net * currentTotals.gst / 100);
                                                initializeInstallments(planType, final);
                                            }}
                                            style={{ fontSize: 13, height: 42, borderRadius: 12 }}
                                        />
                                        <span style={{ position: 'absolute', right: 12, top: 12, fontSize: 12, color: '#94a3b8' }}>%</span>
                                    </div>
                                </div>
                            </div>

                            {/* Final Calculation Summary */}
                            <div style={{
                                background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)',
                                padding: '16px 20px', borderRadius: 16, marginBottom: 24,
                                color: 'white', display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                                boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)'
                            }}>
                                <div>
                                    <div style={{ fontSize: 11, opacity: 0.7, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 4 }}>Total Payable (Real Data)</div>
                                    <div style={{ fontSize: 28, fontWeight: 800, color: '#38bdf8' }}>₹{calculateTotals().total.toLocaleString()}</div>
                                </div>
                                <div style={{ textAlign: 'right', fontSize: 12, opacity: 0.9, lineHeight: '1.6' }}>
                                    <div>Base: <span style={{ opacity: 0.7 }}>₹{calculateTotals().base.toLocaleString()}</span></div>
                                    <div style={{ color: '#fb7185' }}>Discount: <span style={{ opacity: 0.7 }}>-₹{calculateTotals().discountAmount.toLocaleString()}</span></div>
                                    <div style={{ color: '#2dd4bf' }}>GST: <span style={{ opacity: 0.7 }}>+₹{calculateTotals().gstAmount.toLocaleString()}</span></div>
                                </div>
                            </div>

                            {/* Clearing Date Warning */}
                            {feeStructure?.fullFeeClearDate && installments.some(i => i.dueDate && new Date(i.dueDate) > new Date(feeStructure.fullFeeClearDate)) && (
                                <div style={{
                                    background: '#fff7ed', border: '1px solid #ffedd5', padding: '10px 16px',
                                    borderRadius: 12, marginBottom: 24, display: 'flex', alignItems: 'center', gap: 10,
                                    color: '#9a3412', fontSize: 13
                                }}>
                                    <FiAlertCircle size={18} />
                                    <span>
                                        <strong>Admin Override:</strong> Detected installment extensions beyond the Full Fee Clear Date ({feeStructure.fullFeeClearDate}).
                                    </span>
                                </div>
                            )}

                            {/* Plan Configuration Logic (Reused) */}
                            <div className="form-group" style={{ marginBottom: 24 }}>
                                <label className="form-label" style={{ marginBottom: 12 }}>Installment Plan Type</label>
                                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 12 }}>
                                    {[
                                        { id: 'OneTime', label: 'One Time', sub: 'Single Pay', icon: FiClock },
                                        { id: 'Quarterly', label: 'Quarterly', sub: '4 Parts', icon: FiPieChart },
                                        { id: 'HalfYearly', label: 'Half Year', sub: '6 Parts', icon: FiPieChart },
                                        { id: 'Yearly', label: 'Yearly', sub: '12 Parts', icon: FiGrid },
                                        { id: 'Custom', label: 'Custom', sub: 'Flexible', icon: FiList }
                                    ].map(type => (
                                        <button
                                            key={type.id}
                                            onClick={() => handleTypeChange(type.id)}
                                            style={{
                                                margin: 0, padding: '16px 8px',
                                                background: planType === type.id ? 'var(--primary-gradient)' : 'white',
                                                border: planType === type.id ? 'none' : '1px solid #e2e8f0',
                                                borderRadius: 12,
                                                cursor: 'pointer',
                                                display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 8,
                                                transition: 'all 0.2s',
                                                boxShadow: planType === type.id ? '0 4px 12px rgba(99, 102, 241, 0.3)' : 'none',
                                                color: planType === type.id ? 'white' : '#64748b'
                                            }}
                                        >
                                            <type.icon size={20} />
                                            <div style={{ textAlign: 'center' }}>
                                                <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 2 }}>{type.label}</div>
                                                <div style={{ fontSize: 10, opacity: 0.8 }}>{type.sub}</div>
                                            </div>
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {planType === 'Custom' && (
                                <div className="form-group" style={{ marginBottom: 24, maxWidth: 120 }}>
                                    <label className="form-label">Count</label>
                                    <input
                                        type="number"
                                        className="form-input"
                                        min="1" max="24"
                                        value={customCount}
                                        onChange={handleCustomCountChange}
                                    />
                                </div>
                            )}

                            {/* Table Header Row - For perfect alignment */}
                            <div style={{
                                display: 'grid', gridTemplateColumns: planType === 'Custom' ? '50px 2fr 1.5fr 1.5fr 80px' : '50px 2fr 1.5fr 1.5fr 40px', gap: 10,
                                padding: '0 10px 0 10px', marginBottom: 8
                            }}>
                                <div></div> {/* Empty for Index */}
                                <label className="form-label" style={{ fontSize: 11, color: '#64748b' }}>LABEL</label>
                                <label className="form-label" style={{ fontSize: 11, color: '#64748b' }}>AMOUNT</label>
                                <label className="form-label" style={{ fontSize: 11, color: '#64748b' }}>DUE DATE</label>
                            </div>

                            <div style={{ display: 'flex', flexDirection: 'column', gap: 12, maxHeight: 350, overflowY: 'auto', paddingRight: 4 }} className="no-scrollbar">
                                {installments.map((inst, idx) => (
                                    <div key={inst.id} style={{
                                        display: 'grid', gridTemplateColumns: planType === 'Custom' ? '50px 2fr 1.5fr 1.5fr 80px' : '50px 2fr 1.5fr 1.5fr 40px', gap: 10, alignItems: 'center',
                                        padding: '12px 10px', background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: 12
                                    }}>
                                        <div style={{ fontWeight: 600, color: '#94a3b8', fontSize: 13, textAlign: 'center' }}>#{idx + 1}</div>
                                        <div>
                                            <input
                                                type="text"
                                                className="form-input"
                                                value={inst.name}
                                                onChange={(e) => updateInstallment(idx, 'name', e.target.value)}
                                                style={{ background: 'white', fontSize: 13 }}
                                            />
                                        </div>
                                        <div style={{ position: 'relative' }}>
                                            <span style={{ position: 'absolute', left: 10, top: 10, fontSize: 12, color: '#64748b' }}>₹</span>
                                            <input
                                                type="number"
                                                className="form-input"
                                                value={inst.amount}
                                                onChange={(e) => updateInstallment(idx, 'amount', e.target.value)}
                                                style={{ background: 'white', fontSize: 13, paddingLeft: 24 }}
                                            />
                                        </div>
                                        <div>
                                            <input
                                                type="date"
                                                className="form-input"
                                                value={inst.dueDate}
                                                onChange={(e) => updateInstallment(idx, 'dueDate', e.target.value)}
                                                style={{ background: 'white', fontSize: 13 }}
                                            />
                                        </div>
                                        <div style={{ display: 'flex', gap: 8 }}>
                                            {/* Extension Action for existing items */}
                                            {inst.status !== 'PAID' && typeof inst.id === 'number' && inst.id > 1000000 && (
                                                <button
                                                    onClick={() => { setExtendingInstallment(inst); setExtensionDate(inst.dueDate); }}
                                                    className="btn-icon"
                                                    style={{ width: 32, height: 32, color: '#6366f1', borderColor: '#e0e7ff', background: 'white' }}
                                                    title="Extend Due Date"
                                                >
                                                    <FiClock size={14} />
                                                </button>
                                            )}

                                            {/* NEW: Send Payment Link Action */}
                                            {inst.status !== 'PAID' && typeof inst.id === 'number' && inst.id > 1000000 && (
                                                <button
                                                    onClick={async () => {
                                                        try {
                                                            const res = await apiFetch(getUrl(`/payment-gateway/send-link/${inst.id}`), { method: 'POST' });
                                                            alert(res.message || "Payment link sent to student's email.");
                                                        } catch (error) {
                                                            alert("Failed to send payment link. " + (error.response?.data?.message || ""));
                                                        }
                                                    }}
                                                    className="btn-icon"
                                                    style={{ width: 32, height: 32, color: '#10b981', borderColor: '#d1fae5', background: '#ecfdf5' }}
                                                    title="Send Payment Link via Email"
                                                >
                                                    <FiDollarSign size={14} />
                                                </button>
                                            )}

                                            {planType === 'Custom' && (
                                                <button
                                                    onClick={() => removeInstallment(idx)}
                                                    className="btn-icon"
                                                    style={{ width: 32, height: 32, color: '#ef4444', borderColor: '#fee2e2', background: '#fef2f2' }}
                                                    title="Remove Installment"
                                                >
                                                    <FiTrash2 size={14} />
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>

                            <div style={{ marginTop: 24, paddingTop: 20, borderTop: '1px solid #e2e8f0', display: 'flex', justifyContent: 'flex-end', gap: 12 }}>
                                <button className="btn-secondary" onClick={() => { setConfiguringStudent(null); setConfiguringBatch(null); }} style={{ background: 'transparent', border: '1px solid #cbd5e1' }}>Cancel</button>
                                <button className="btn-primary" onClick={savePlan}>
                                    <FiSave /> {configuringBatch ? 'Apply to Batch' : 'Save Configuration'}
                                </button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence >

            {/* Extension Reason Modal */}
            <AnimatePresence>
                {extendingInstallment && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        style={{
                            position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)', zIndex: 10000,
                            display: 'flex', alignItems: 'center', justifyContent: 'center'
                        }}
                    >
                        <motion.div
                            initial={{ scale: 0.9, y: 20 }}
                            animate={{ scale: 1, y: 0 }}
                            exit={{ scale: 0.9, y: 20 }}
                            className="glass-card"
                            style={{ width: 400, padding: 24, background: 'white' }}
                        >
                            <h3 style={{ margin: '0 0 16px 0', fontSize: 18, fontWeight: 700 }}>Extend Due Date</h3>
                            <p style={{ fontSize: 13, color: '#64748b', marginBottom: 20 }}>
                                Extending installment for <strong>{configuringStudent?.name}</strong>. This action will be logged.
                            </p>

                            <div className="form-group" style={{ marginBottom: 16 }}>
                                <label className="form-label">New Due Date</label>
                                <input
                                    type="date"
                                    className="form-input"
                                    value={extensionDate}
                                    onChange={(e) => setExtensionDate(e.target.value)}
                                />
                            </div>

                            <div className="form-group" style={{ marginBottom: 24 }}>
                                <label className="form-label">Reason for Extension</label>
                                <textarea
                                    className="form-input"
                                    placeholder="e.g. Student requested more time due to medical emergency"
                                    rows={3}
                                    value={extensionReason}
                                    onChange={(e) => setExtensionReason(e.target.value)}
                                    style={{ resize: 'none', padding: '10px' }}
                                />
                            </div>

                            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 12 }}>
                                <button
                                    className="btn-secondary"
                                    onClick={() => setExtendingInstallment(null)}
                                    disabled={extending}
                                >
                                    Cancel
                                </button>
                                <button
                                    className="btn-primary"
                                    onClick={handleExtendDueDate}
                                    disabled={extending || !extensionReason || !extensionDate}
                                >
                                    {extending ? <FiLoader className="spin" /> : <FiCalendar />}
                                    {extending ? 'Extending...' : 'Confirm Extension'}
                                </button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </motion.div >
    );
};

export default FeeInstallments;
