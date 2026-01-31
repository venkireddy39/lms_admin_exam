import React, { useMemo, useState, useEffect } from 'react';
import AttendanceReport from '../components/AttendanceReport';
import { courseService } from '../../Courses/services/courseService';
import { batchService } from '../../Batches/services/batchService';
import { enrollmentService } from '../../Batches/services/enrollmentService';
import { attendanceService } from '../services/attendanceService';

const ReportPage = ({ batchId: propBatchId }) => {
    const [selectedCourse, setSelectedCourse] = useState('');
    const [selectedBatch, setSelectedBatch] = useState(propBatchId || '');

    const [courses, setCourses] = useState([]);
    const [batches, setBatches] = useState([]);
    const [history, setHistory] = useState([]);
    const [loading, setLoading] = useState(false);

    const [allBatches, setAllBatches] = useState([]); // Store master list

    // Initial Load
    useEffect(() => {
        const init = async () => {
            if (propBatchId) {
                loadHistory(propBatchId);
            } else {
                try {
                    // Load Courses AND All Batches in parallel
                    const [coursesData, batchesData] = await Promise.all([
                        courseService.getCourses(),
                        batchService.getAllBatches()
                    ]);

                    setCourses(coursesData);
                    setAllBatches(batchesData);
                    setBatches(batchesData); // Default to showing all
                } catch (e) { console.error(e); }
            }
        };
        init();
    }, [propBatchId]);

    // Filter Batches when Course Changes
    useEffect(() => {
        if (!propBatchId) {
            if (selectedCourse) {
                const filtered = allBatches.filter(b => String(b.courseId) === String(selectedCourse));
                setBatches(filtered);
                // Auto-select if only 1 batch exists
                if (filtered.length === 1) setSelectedBatch(filtered[0].batchId || filtered[0].id);
                else setSelectedBatch('');
            } else {
                setBatches(allBatches); // Reset to show all
            }
        }
    }, [selectedCourse, allBatches, propBatchId]);

    const [selectedClass, setSelectedClass] = useState('');
    const [classes, setClasses] = useState([]);

    // When Batch Changes, load Classes
    useEffect(() => {
        if (!propBatchId && selectedBatch) {
            // Load classes (academic sessions) for this batch
            attendanceService.getAcademicSessions(selectedBatch)
                .then(setClasses)
                .catch(() => setClasses([]));

            // Load batch-wide history initially
            loadHistory(selectedBatch);
        } else if (propBatchId) {
            // If prop is used, we assume batch view, but optionally could load classes too
            // For now, let's keep prop mode simple
        }
    }, [selectedBatch, propBatchId]);

    // When Class Changes, reload history
    useEffect(() => {
        if (selectedClass) {
            loadHistory(selectedClass, true); // true = bySession
        } else if (selectedBatch) {
            loadHistory(selectedBatch, false); // false = byBatch
        }
    }, [selectedClass]);

    const loadHistory = async (id, isSessionLevel = false) => {
        setLoading(true);
        try {
            let historyData = [];

            if (isSessionLevel) {
                // Fetch for specific class/session
                historyData = await attendanceService.getAttendance(id);
            } else {
                // "All Classes" (Batch View)
                // Backend lacks a batch-level endpoint, so we aggregate data from all classes in this batch.
                if (classes.length > 0) {
                    // Fetch attendance for ALL classes in parallel
                    const promises = classes.map(c =>
                        attendanceService.getAttendance(c.classId || c.sessionId)
                            .then(records => records.map(r => ({
                                ...r,
                                // Tag each record with the class/session name so we know where it came from
                                courseName: c.sessionName || c.topicName || `Class ${c.classId}`
                            })))
                            .catch(() => [])
                    );
                    const results = await Promise.all(promises);
                    historyData = results.flat();
                } else {
                    // Fallback if no classes loaded yet (rare)
                    historyData = await attendanceService.getAttendanceHistory(id);
                }
            }

            // Fetch Students (Batch level) to map names
            const batchIdForStudents = isSessionLevel && selectedBatch ? selectedBatch : (isSessionLevel ? null : id);
            // logic fix: if isSessionLevel, id is sessionID, we need batchId. 
            // Luckily selectedBatch is available in state.
            const targetBatchId = selectedBatch || id;

            const studentsData = await enrollmentService.getStudentsByBatch(targetBatchId).catch(() => []);

            // Create a lookup map for students: ID -> Name
            const studentMap = {};
            if (Array.isArray(studentsData)) {
                studentsData.forEach(s => {
                    studentMap[s.studentId] = s.studentName || s.name || `Student ${s.studentId}`;
                });
            }

            // Enrich history with names
            const enrichedHistory = (historyData || []).map(record => ({
                ...record,
                status: (record.status || 'ABSENT').toUpperCase(), // Normalize status
                studentName: studentMap[record.studentId] || record.studentName || `Student #${record.studentId}`,
                // If courseName wasn't set during aggregation, set default
                courseName: record.courseName || (isSessionLevel ? 'Class Session' : 'Batch History')
            }));

            setHistory(enrichedHistory);
        } catch (error) {
            console.error("Failed to load attendance history", error);
            setHistory([]);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fade-in">
            {/* Batch Selection Controls - Only show if no batchId prop is provided */}
            {!propBatchId && (
                <div className="card border-0 shadow-sm mb-4">
                    <div className="card-body">
                        <div className="row g-3">
                            <div className="col-md-4">
                                <label className="form-label small fw-bold text-secondary">Course</label>
                                <select
                                    className="form-select"
                                    value={selectedCourse}
                                    onChange={(e) => {
                                        setSelectedCourse(e.target.value);
                                        setSelectedBatch('');
                                        setSelectedClass('');
                                        setHistory([]);
                                    }}
                                >
                                    <option value="">Select Course</option>
                                    {courses.map(c => (
                                        <option key={c.courseId} value={c.courseId}>{c.courseName}</option>
                                    ))}
                                </select>
                            </div>
                            <div className="col-md-4">
                                <label className="form-label small fw-bold text-secondary">Batch</label>
                                <select
                                    className="form-select"
                                    value={selectedBatch}
                                    onChange={(e) => {
                                        setSelectedBatch(e.target.value);
                                        setSelectedClass(''); // Reset class when batch changes
                                    }}
                                    disabled={!batches.length}
                                >
                                    <option value="">Select Batch</option>
                                    {batches.map(b => (
                                        <option key={b.batchId || b.id} value={b.batchId || b.id}>
                                            {b.batchName || b.name || `Batch ${b.id}`}
                                        </option>
                                    ))}
                                </select>
                            </div>
                            <div className="col-md-4">
                                <label className="form-label small fw-bold text-secondary">Class (Optional)</label>
                                <select
                                    className="form-select"
                                    value={selectedClass}
                                    onChange={(e) => setSelectedClass(e.target.value)}
                                    disabled={!selectedBatch || !classes.length}
                                >
                                    <option value="">All Classes</option>
                                    {classes.map(c => (
                                        <option key={c.classId || c.sessionId} value={c.classId || c.sessionId}>
                                            {c.sessionName || c.topicName || `Class ${c.classId}`}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {(selectedBatch || propBatchId) ? (
                loading ? (
                    <div className="text-center py-5">
                        <div className="spinner-border text-primary" role="status"></div>
                        <p className="mt-2 text-muted">Loading attendance data...</p>
                    </div>
                ) : (
                    <AttendanceReport history={history} />
                )
            ) : (
                <div className="text-center py-5 text-muted">
                    <p>Please select a Course and Batch to view the attendance report.</p>
                </div>
            )}
        </div>
    );
};

export default ReportPage;
