import { useEffect } from 'react';

export const useDynamicFee = ({
    basicDetails,
    setBasicDetails,
    assignment,
    availableBatches,
    availableCourses,
    searchableStudents
}) => {
    // Auto-Populate Amount for Course Fee
    useEffect(() => {
        const fetchDynamicFee = async () => {
            if (!basicDetails.type || basicDetails.type.toLowerCase() !== 'course fee') return;

            let autoFee = 0;
            console.log("🔄 Calculating Dynamic Fee...", { assignment, basicDetails });

            try {
                let relevantBatchId = null;

                // Priority 1: Batch Filter
                if (assignment.batch) {
                    relevantBatchId = assignment.batch;
                }
                // Priority 2: Student's Batch
                else if (assignment.targetType === 'student' && assignment.selectedStudents.length > 0) {
                    const stu = assignment.selectedStudents[0];
                    const cachedStu = searchableStudents.find(s => s.id === stu.id);

                    if (cachedStu) {
                        if (Number(cachedStu.totalFee) > 0) {
                            autoFee = Number(cachedStu.totalFee);
                        }
                        if (!autoFee) {
                            relevantBatchId = cachedStu.batchId || cachedStu.batch?.id;
                        }
                    }
                }

                // If Batch Context Found
                if (!autoFee && relevantBatchId) {
                    const batch = availableBatches.find(b => String(b.batchId || b.id) === String(relevantBatchId));
                    if (batch) {
                        if (batch.fee || batch.amount) {
                            autoFee = Number(batch.fee || batch.amount);
                        }
                        else if (batch.cachedFee) {
                            autoFee = Number(batch.cachedFee);
                        }

                        if (!autoFee) {
                            const cId = batch.courseId || batch.course?.courseId;
                            if (cId) {
                                const course = availableCourses.find(c => String(c.courseId || c.id) === String(cId));
                                if (course) {
                                    autoFee = Number(course.fee || course.price || course.amount || course.totalFee || 0);
                                }
                            }
                        }
                    }
                }

                // Priority 3: Course Filter
                if (!autoFee && !relevantBatchId && assignment.course) {
                    const course = availableCourses.find(c => String(c.courseId || c.id) === String(assignment.course));
                    if (course) {
                        autoFee = Number(course.fee || course.price || course.amount || course.totalFee || course.courseFee || 0);
                    }
                }

            } catch (err) {
                console.error("Error calculating dynamic fee:", err);
            }

            if (autoFee > 0) {
                setBasicDetails(prev => {
                    if (Number(prev.amount) !== autoFee) {
                        return { ...prev, amount: autoFee };
                    }
                    return prev;
                });
            }
        };

        fetchDynamicFee();
    }, [basicDetails.type, assignment.batch, assignment.targetType, assignment.selectedStudents, availableBatches, availableCourses, searchableStudents]);
};
