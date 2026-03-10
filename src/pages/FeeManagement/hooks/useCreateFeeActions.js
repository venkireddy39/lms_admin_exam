import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { enrollmentService } from '../../Batches/services/enrollmentService';
import { createFeeAllocation, createFee, createFeeDiscount } from '../../../services/feeService';

export const useCreateFeeActions = ({
    basicDetails,
    discount,
    assignment,
    feeTypes
}) => {
    const navigate = useNavigate();
    const [saving, setSaving] = useState(false);

    const handleSubmit = async (e) => {
        if (e) e.preventDefault();

        // Validation based on Target Type
        if (assignment.targetType === 'student' && assignment.selectedStudents.length === 0) {
            alert('Please select at least one student.');
            return;
        }
        if (assignment.targetType === 'batch' && !assignment.batch) {
            alert('Please select a batch.');
            return;
        }

        try {
            setSaving(true);

            // 1. Calculate Final Amount (Base + Tax)
            let finalAmount = Number(basicDetails.amount);

            const isCourseFeeWithDiscount = basicDetails.type === 'Course Fee' && discount.enabled;

            if (!isCourseFeeWithDiscount && basicDetails.taxEnabled && basicDetails.taxPercentage) {
                const taxRate = Number(basicDetails.taxPercentage);
                const taxAmount = finalAmount * (taxRate / 100);
                finalAmount += taxAmount;
            }

            finalAmount = Math.round(finalAmount * 100) / 100;

            // Description Helper
            let feeDescription = basicDetails.description;
            if (isCourseFeeWithDiscount) {
                feeDescription = (feeDescription || '') + ` [GST: ${discount.gstPercent}% calculated on discounted total]`;
            } else if (basicDetails.taxEnabled && basicDetails.taxPercentage) {
                feeDescription = (feeDescription || '') + ` [Tax: ${basicDetails.taxPercentage}% included]`;
            }

            // 2. CREATE FEE STRUCTURE
            const selectedFeeTypeObj = feeTypes.find(ft => ft.name === basicDetails.type);
            const selectedFeeTypeId = selectedFeeTypeObj ? selectedFeeTypeObj.id : (feeTypes.length > 0 ? feeTypes[0].id : null);

            if (!selectedFeeTypeId) {
                alert("Error: Invalid Fee Type selected. Please refresh and try again.");
                setSaving(false);
                return;
            }

            const structurePayload = {
                name: basicDetails.name,
                currency: 'INR',
                academicYear: '2024-25',
                courseId: Number(assignment.course),
                batchId: assignment.batch ? Number(assignment.batch) : null,
                isActive: true,
                feeTypeId: selectedFeeTypeId,
                triggerOnCreation: true,
                description: feeDescription,
                admissionFeeAmount: basicDetails.admissionFee ? Number(basicDetails.admissionFee) : 0,
                admissionNonRefundable: basicDetails.admissionNonRefundable,
                components: [
                    {
                        name: basicDetails.name || selectedFeeTypeObj?.name || 'Main Fee',
                        amount: finalAmount,
                        feeTypeId: selectedFeeTypeId 
                    }
                ]
            };

            const createdStructure = await createFee(structurePayload);

            if (!createdStructure || !createdStructure.id) {
                throw new Error("Failed to create Fee Structure. No ID returned.");
            }

            const feeStructureId = createdStructure.id;

            // 3. IDENTIFY TARGET STUDENTS
            let targetStudents = [];
            if (assignment.targetType === 'batch') {
                const batchStudents = await enrollmentService.getStudentsByBatch(assignment.batch);
                targetStudents = batchStudents.map(e => ({
                    id: e.studentId || e.student?.studentId || e.student?.id,
                    name: e.studentName || (e.student?.user?.firstName + ' ' + e.student?.user?.lastName),
                    email: e.studentEmail || e.student?.user?.email
                })).filter(s => s.id);
            } else {
                targetStudents = assignment.selectedStudents;
            }

            if (targetStudents.length === 0) {
                alert("No students found in the selected target to assign fees to.");
                setSaving(false);
                return;
            }

            // 3.5 CREATE FEE DISCOUNT RULE
            if (discount.enabled && discount.value) {
                const createDiscountRule = async (scope, scopeId) => {
                    const discountPayload = {
                        feeStructureId: feeStructureId,
                        discountScope: scope,
                        scopeId: Number(scopeId),
                        discountName: (discount.reason || 'Fee Discount'),
                        discountType: discount.type === 'flat' ? 'FLAT' : 'PERCENTAGE',
                        discountValue: Number(discount.value),
                        admissionFee: basicDetails.admissionFee ? Number(basicDetails.admissionFee) : 0,
                        gstPercent: Number(discount.gstPercent) || 0,
                        installmentCount: Number(discount.installmentCount) || 1,
                        isActive: true
                    };
                    return createFeeDiscount(discountPayload);
                };

                try {
                    if (assignment.targetType === 'batch' && assignment.batch) {
                        await createDiscountRule('BATCH', assignment.batch);
                    }
                    else if (assignment.targetType === 'student') {
                        const promises = targetStudents.map(s => createDiscountRule('STUDENT', s.id));
                        await Promise.all(promises);
                    }
                } catch (err) {
                    console.error("Failed to create discount rules:", err);
                }
            }

            // 4. CREATE ALLOCATIONS
            const allocationPromises = targetStudents.map(student => {
                const allocationPayload = {
                    feeStructureId: feeStructureId,
                    userId: Number(student.id),
                    studentEmail: student.email,
                    status: 'ACTIVE',
                    originalAmount: finalAmount,
                    totalDiscount: 0 
                };
                return createFeeAllocation(allocationPayload);
            });

            await Promise.all(allocationPromises);

            alert(`Successfully created fee and assigned to ${targetStudents.length} students!`);
            navigate('/fee', { state: { defaultTab: 'batches' } });

        } catch (error) {
            console.error("Failed to assign fees:", error);
            const msg = error.response?.data?.message || error.message || "Unknown error";
            alert("Failed to assign fees. \nError: " + msg);
        } finally {
            setSaving(false);
        }
    };

    return {
        handleSubmit,
        saving
    };
};
