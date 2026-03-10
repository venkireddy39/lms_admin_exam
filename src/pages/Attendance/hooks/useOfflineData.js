import { useState, useEffect } from 'react';
import { courseService } from '../../Courses/services/courseService';
import { batchService } from '../../Batches/services/batchService';
import { attendanceService } from '../services/attendanceService';
import { enrollmentService } from '../../Batches/services/enrollmentService';

export const useOfflineData = (selectedCourse, selectedBatch, selectedDate) => {
    const [courses, setCourses] = useState([]);
    const [batches, setBatches] = useState([]);
    const [sessions, setSessions] = useState([]);
    const [students, setStudents] = useState([]);
    const [uploadJobs, setUploadJobs] = useState([]);

    // Fetch Courses
    useEffect(() => {
        courseService.getCourses().then(setCourses).catch(console.error);
    }, []);

    // Fetch Batches
    useEffect(() => {
        if (selectedCourse) {
            batchService.getBatchesByCourseId(selectedCourse).then(setBatches).catch(console.error);
        } else {
            setBatches([]);
        }
    }, [selectedCourse]);

    // Fetch Sessions
    useEffect(() => {
        if (selectedBatch && selectedDate) {
            attendanceService.getSessions(selectedBatch, selectedDate)
                .then(data => setSessions(data || []))
                .catch(console.error);
        } else {
            setSessions([]);
        }
    }, [selectedBatch, selectedDate]);

    // Fetch Students
    useEffect(() => {
        if (selectedBatch) {
            enrollmentService.getStudentsByBatch(selectedBatch).then(data => {
                const mapped = Array.isArray(data) ? data.map(s => ({
                    id: s.studentId,
                    studentId: s.studentId,
                    name: s.studentName || s.name || `Student ${s.studentId}`,
                    email: s.studentEmail || s.email || ''
                })) : [];
                setStudents(mapped);
            }).catch(console.error);
        } else {
            setStudents([]);
        }
    }, [selectedBatch]);

    // Fetch Upload Jobs History
    const refreshUploadJobs = () => {
        if (selectedBatch) {
            attendanceService.getUploadJobsByBatch(selectedBatch)
                .then(setUploadJobs)
                .catch(err => console.error("Failed to fetch upload jobs", err));
        } else {
            setUploadJobs([]);
        }
    };

    useEffect(() => {
        refreshUploadJobs();
    }, [selectedBatch]);

    return { courses, batches, sessions, students, uploadJobs, setUploadJobs, refreshUploadJobs };
};
