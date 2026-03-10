import { useState, useCallback } from 'react';
import { batchService } from '../../Batches/services/batchService';
import { enrollmentService } from '../../Batches/services/enrollmentService';
import { courseService } from '../../Courses/services/courseService';
import { userService } from '../Users/services/userService';
import { 
    getFeeAllocationsByBatch, 
    getStudentInstallments, 
    getPaymentsByStudent 
} from '../../services/feeService';

export const useFeeBatchesData = () => {
    const [batches, setBatches] = useState([]);
    const [students, setStudents] = useState([]);
    const [feeDetails, setFeeDetails] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const initializeData = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const batchesData = await batchService.getAllBatches();
            const coursesData = await courseService.getCourses();
            
            const courseFeeMap = {};
            if (coursesData && Array.isArray(coursesData)) {
                coursesData.forEach(c => {
                    courseFeeMap[c.courseId] = c.fee || c.price || c.amount || 0;
                });
            }

            const batchesWithCounts = await Promise.all(batchesData.map(async (b) => {
                try {
                    const s = await enrollmentService.getStudentsByBatch(b.batchId);
                    return { ...b, _realCount: s.length };
                } catch { return { ...b, _realCount: 0 }; }
            }));

            const transformedBatches = batchesWithCounts.map(batch => ({
                id: batch.batchId,
                batchId: batch.batchId,
                name: batch.batchName,
                course: batch.courseName || 'Course',
                courseId: batch.courseId,
                courseFee: courseFeeMap[batch.courseId] || 0,
                year: batch.academicYear || batch.startDate?.substring(0, 4) || '2025-26',
                students: batch._realCount,
                collected: batch.collectionRate || 0,
                studentList: [],
            }));

            setBatches(transformedBatches);
        } catch (err) {
            console.error('Error loading batches:', err);
            setError('Failed to load batches from backend');
            setBatches([]);
        } finally {
            setLoading(false);
        }
    }, []);

    const fetchBatchStudents = useCallback(async (batch) => {
        setLoading(true);
        try {
            const [enrolledStudents, feeAllocations, externalUsers] = await Promise.all([
                enrollmentService.getStudentsByBatch(batch.id),
                getFeeAllocationsByBatch(batch.id).catch(() => []),
                userService.getAllStudents().catch(() => [])
            ]);

            const allocationMap = {};
            feeAllocations.forEach(a => { allocationMap[a.userId] = a; });

            const userMap = {};
            if (Array.isArray(externalUsers)) {
                externalUsers.forEach(u => {
                    const name = `${u.user?.firstName || ''} ${u.user?.lastName || ''}`.trim();
                    const uId = u.user?.userId || u.studentId;
                    if (uId) userMap[uId] = name;
                });
            }

            const mappedStudents = enrolledStudents.map(s => {
                const userId = s.studentId || s.id;
                const allocation = allocationMap[userId];
                const paid = allocation ? (allocation.payableAmount - allocation.remainingAmount) : (s.paidAmount || 0);

                return {
                    id: userId,
                    allocationId: allocation?.allocationId || allocation?.id,
                    name: userMap[userId] || s.studentName || s.name || "Unknown Student",
                    roll: s.rollNo || `STU-${userId}`,
                    totalFee: allocation ? allocation.payableAmount : (s.totalFee || batch.courseFee || 0),
                    paidAmount: paid,
                    status: allocation ? allocation.status : (s.status || 'PENDING'),
                    remainingAmount: allocation ? allocation.remainingAmount : (s.totalFee || batch.courseFee || 0),
                    courseName: batch.courseName || batch.course || "N/A",
                    batchName: batch.batchName || batch.name || "N/A"
                };
            });

            setStudents(mappedStudents);
            return mappedStudents;
        } catch (error) {
            console.error("Failed to fetch batch students:", error);
            setStudents([]);
            throw error;
        } finally {
            setLoading(false);
        }
    }, []);

    const fetchStudentFeeDetails = useCallback(async (student) => {
        setLoading(true);
        try {
            const allocationId = student.allocationId;
            const userId = student.id;

            const [installments, payments] = await Promise.all([
                allocationId ? getStudentInstallments(allocationId).catch(() => []) : Promise.resolve([]),
                getPaymentsByStudent(userId).catch(() => [])
            ]);

            const details = {
                structure: [
                    { name: 'Total Allocated Fee', amount: student.totalFee },
                ],
                totalFee: student.totalFee,
                paidAmount: student.paidAmount || 0,
                pendingAmount: student.remainingAmount,
                dueDate: installments.length > 0 ? installments.find(i => i.status !== 'PAID')?.dueDate : 'N/A',
                payments: payments.map(p => ({
                    paymentId: p.paymentId,
                    date: p.paymentDate,
                    mode: p.paymentMode,
                    reference: p.transactionReference,
                    amount: p.paidAmount,
                    status: p.paymentStatus,
                    id: p.paymentId || Date.now()
                })),
                installments: installments.map(i => ({
                    installmentId: i.installmentId,
                    id: i.installmentId,
                    name: `Installment ${i.installmentId}`,
                    amount: i.amount,
                    dueDate: i.dueDate,
                    status: i.status
                }))
            };
            setFeeDetails(details);
            return details;
        } catch (error) {
            console.error("Failed to fetch student fee details:", error);
            const fallback = {
                structure: [{ name: 'Tuition Fee', amount: student.totalFee }],
                totalFee: student.totalFee,
                paidAmount: student.paidAmount || 0,
                pendingAmount: student.remainingAmount,
                payments: [],
                installments: []
            };
            setFeeDetails(fallback);
            return fallback;
        } finally {
            setLoading(false);
        }
    }, []);

    return {
        batches,
        setBatches,
        students,
        setStudents,
        feeDetails,
        setFeeDetails,
        loading,
        error,
        initializeData,
        fetchBatchStudents,
        fetchStudentFeeDetails
    };
};
