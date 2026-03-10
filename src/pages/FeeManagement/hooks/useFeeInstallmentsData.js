import { useState, useEffect } from 'react';
import { courseService } from '../../Courses/services/courseService';
import { batchService } from '../../Batches/services/batchService';
import { enrollmentService } from '../../Batches/services/enrollmentService';
import { getStudentFee } from '../../services/feeService';

export const useFeeInstallmentsData = (selectedCourse, selectedBatchId) => {
    const [courses, setCourses] = useState([]);
    const [batches, setBatches] = useState([]);
    const [selectedBatch, setSelectedBatch] = useState(null);
    const [loading, setLoading] = useState(true);

    // Initial load of courses and batches
    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            try {
                const coursesData = await courseService.getCourses();
                setCourses(coursesData || []);

                const batchesData = await batchService.getAllBatches();
                
                const courseMap = {};
                coursesData.forEach(c => {
                    courseMap[String(c.courseId)] = Number(c.price || c.fee || c.amount || c.courseFee || 0);
                });

                const batchesWithCounts = await Promise.all(batchesData.map(async (b) => {
                    try {
                        const s = await enrollmentService.getStudentsByBatch(b.batchId);
                        const cId = b.courseId || b.course?.courseId;
                        const batchCourseFees = courseMap[String(cId)] || 0;

                        const mappedStudents = s.map(stu => ({
                            ...stu,
                            id: stu.studentId || stu.id,
                            name: stu.studentName || stu.name || "Unknown Student",
                            totalFee: stu.totalFee || b.fee || batchCourseFees || 0,
                            paidAmount: stu.paidAmount || 0,
                            installments: stu.installments || []
                        }));

                        return {
                            ...b,
                            studentCount: s.length,
                            studentList: mappedStudents,
                            standardFee: batchCourseFees
                        };
                    } catch (err) {
                        return { ...b, studentCount: 0, studentList: [] };
                    }
                }));

                setBatches(batchesWithCounts || []);
            } catch (error) {
                console.error('Error fetching courses/batches:', error);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    // Handle detailed batch enrichment when selected
    useEffect(() => {
        const enrichBatchData = async () => {
            if (selectedBatchId) {
                const batch = batches.find(b => String(b.batchId) === String(selectedBatchId));
                if (batch && !batch.isLive) {
                    const enrichedStudents = await Promise.all(batch.studentList.map(async (stu) => {
                        try {
                            const feeResponse = await getStudentFee(stu.id);
                            const allocations = Array.isArray(feeResponse) ? feeResponse : (feeResponse ? [feeResponse] : []);
                            if (allocations.length > 0) {
                                const latest = allocations[0];
                                return {
                                    ...stu,
                                    totalFee: latest.payableAmount || stu.totalFee,
                                    allocationId: latest.allocationId,
                                    planType: latest.installmentCount === 1 ? 'OneTime' : 'Custom'
                                };
                            }
                        } catch (err) {}
                        return stu;
                    }));

                    const enrichedBatch = { ...batch, studentList: enrichedStudents, isLive: true };
                    setSelectedBatch(enrichedBatch);
                    setBatches(prev => prev.map(b => b.batchId === batch.batchId ? enrichedBatch : b));
                } else if (batch) {
                    setSelectedBatch(batch);
                }
            } else {
                setSelectedBatch(null);
            }
        };
        enrichBatchData();
    }, [selectedBatchId, batches.length]);

    return { courses, batches, selectedBatch, setSelectedBatch, loading, setBatches };
};
