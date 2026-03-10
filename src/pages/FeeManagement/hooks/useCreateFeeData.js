import { useState, useEffect } from 'react';
import { batchService } from '../../Batches/services/batchService';
import { courseService } from '../../Courses/services/courseService';
import { userService } from '../../Users/services/userService';
import { enrollmentService } from '../../Batches/services/enrollmentService';
import { getActiveFeeTypes } from '../../../services/feeService';

export const useCreateFeeData = (batchId, courseId) => {
    const [availableBatches, setAvailableBatches] = useState([]);
    const [availableCourses, setAvailableCourses] = useState([]);
    const [searchableStudents, setSearchableStudents] = useState([]);
    const [feeTypes, setFeeTypes] = useState([]);
    const [loading, setLoading] = useState(true);

    // Load initial data
    useEffect(() => {
        const loadData = async () => {
            setLoading(true);
            try {
                // Fetch Fee Types
                try {
                    const ftData = await getActiveFeeTypes();
                    setFeeTypes(ftData || []);
                } catch (err) {
                    console.warn("Could not fetch fee types, using defaults");
                }

                // Fetch Courses
                const coursesData = await courseService.getCourses();
                setAvailableCourses(coursesData || []);

                // Create Course Fee Map
                const courseMap = {};
                (coursesData || []).forEach(c => {
                    courseMap[String(c.courseId)] = Number(c.price || c.fee || c.amount || c.courseFee || 0);
                });

                // Fetch Batches
                const batchesData = await batchService.getAllBatches();

                // Enrich Batches with Cache Fee
                const enrichedBatches = (batchesData || []).map(b => {
                    const cId = b.courseId || b.course?.courseId;
                    const feeFromCourse = courseMap[String(cId)] || 0;
                    return {
                        ...b,
                        cachedFee: feeFromCourse
                    };
                });
                setAvailableBatches(enrichedBatches);

                // Initial Students load (All)
                const allStus = await userService.getAllStudents();
                const formattedStudents = allStus.map(s => ({
                    id: s.studentId,
                    name: `${s.user?.firstName || ''} ${s.user?.lastName || ''}`.trim(),
                    email: s.user?.email,
                    totalFee: s.totalFee || s.fee || 0
                }));
                setSearchableStudents(formattedStudents);

            } catch (error) {
                console.error("Failed to load initial data", error);
            } finally {
                setLoading(false);
            }
        };

        loadData();
    }, []);

    // Filter Students when Batch/Course Selected
    useEffect(() => {
        const fetchBatchStudents = async () => {
            if (batchId) {
                setLoading(true);
                try {
                    const batchStudents = await enrollmentService.getStudentsByBatch(batchId);
                    
                    let calculatedFee = 0;
                    const currentBatch = availableBatches.find(b => String(b.batchId || b.id) === String(batchId));

                    if (currentBatch) {
                        calculatedFee = currentBatch.fee || currentBatch.amount || 0;
                        if (!calculatedFee) {
                            const cId = currentBatch.courseId || currentBatch.course?.courseId;
                            const currentCourse = availableCourses.find(c => String(c.courseId || c.id) === String(cId));
                            if (currentCourse) {
                                calculatedFee = currentCourse.fee || currentCourse.price || currentCourse.amount || currentCourse.totalFee || 0;
                            }
                        }
                    }

                    const formatted = batchStudents.map(s => ({
                        id: s.studentId,
                        name: s.studentName || s.name || `Student ${s.studentId}`,
                        email: s.studentEmail,
                        totalFee: calculatedFee || s.totalFee || s.fee || 0
                    }));
                    setSearchableStudents(formatted);
                } catch (error) {
                    console.error("Failed to fetch batch students", error);
                } finally {
                    setLoading(false);
                }
            } else if (courseId) {
                setLoading(true);
                try {
                    const allStus = await userService.getAllStudents();
                    const formattedStudents = allStus.map(s => ({
                        id: s.studentId,
                        name: `${s.user?.firstName || ''} ${s.user?.lastName || ''}`.trim(),
                        email: s.user?.email,
                        totalFee: s.totalFee || s.fee || 0
                    }));
                    setSearchableStudents(formattedStudents);
                } catch (error) {
                    console.error("Failed to fetch students for course", error);
                } finally {
                    setLoading(false);
                }
            }
        };

        fetchBatchStudents();
    }, [batchId, courseId, availableBatches, availableCourses]);

    return {
        availableBatches,
        availableCourses,
        searchableStudents,
        feeTypes,
        loading
    };
};
