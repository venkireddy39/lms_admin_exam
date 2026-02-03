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
    const [selectedClass, setSelectedClass] = useState('');
    const [classes, setClasses] = useState([]);
    const [students, setStudents] = useState([]);

    // 1. Initial Load: Fetch Courses and All Batches (if not in Batch view)
    useEffect(() => {
        const init = async () => {
            if (!propBatchId) {
                try {
                    const [coursesData, batchesData] = await Promise.all([
                        courseService.getCourses(),
                        batchService.getAllBatches()
                    ]);
                    setCourses(coursesData);
                    setAllBatches(batchesData);
                    setBatches(batchesData);
                } catch (e) {
                    console.error("Failed to initialize report data", e);
                }
            }
        };
        init();
    }, [propBatchId]);

    // 2. Filter Batches when Course Changes (Dropdown Flow)
    useEffect(() => {
        if (!propBatchId && selectedCourse) {
            const filtered = allBatches.filter(b => String(b.courseId) === String(selectedCourse));
            setBatches(filtered);
            if (filtered.length === 1) setSelectedBatch(filtered[0].batchId || filtered[0].id);
            else setSelectedBatch('');
        } else if (!propBatchId) {
            setBatches(allBatches);
        }
    }, [selectedCourse, allBatches, propBatchId]);

    // 3. CORE LOGIC: When Batch changes (Dropdown or Prop), load Context
    useEffect(() => {
        const batchId = propBatchId || selectedBatch;
        if (batchId) {
            loadBatchContext(batchId);
        }
    }, [selectedBatch, propBatchId]);

    const loadBatchContext = async (batchId) => {
        setLoading(true);
        try {
            // Load sessions and students first
            const [sessionsData, studentsData] = await Promise.all([
                attendanceService.getAcademicSessions(batchId).catch(() => []),
                enrollmentService.getStudentsByBatch(batchId).catch(() => [])
            ]);

            setClasses(sessionsData);
            setStudents(studentsData);

            // Pass sessions directly to history loader because state update is async
            await loadHistoryData(batchId, false, sessionsData, studentsData);
        } catch (e) {
            console.error("Error loading batch context:", e);
        } finally {
            setLoading(false);
        }
    };

    // 4. When specific Class/Session is selected, reload history for it
    useEffect(() => {
        if (selectedClass) {
            loadHistoryData(selectedClass, true, classes, students);
        } else if (selectedBatch || propBatchId) {
            loadHistoryData(propBatchId || selectedBatch, false, classes, students);
        }
    }, [selectedClass]);

    const loadHistoryData = async (id, isSessionLevel, currentClasses, currentStudents) => {
        try {
            let historyData = [];

            if (isSessionLevel) {
                // Specific class session
                historyData = await attendanceService.getAttendance(id);
            } else {
                // Batch-wide aggregation
                if (currentClasses && currentClasses.length > 0) {
                    const promises = currentClasses.map(c =>
                        attendanceService.getAttendance(c.classId || c.sessionId)
                            .then(records => records.map(r => ({
                                ...r,
                                courseName: c.sessionName || c.topicName || `Class ${c.classId}`
                            })))
                            .catch(() => [])
                    );
                    const results = await Promise.all(promises);
                    historyData = results.flat();
                } else {
                    // Fallback to batch endpoint
                    historyData = await attendanceService.getAttendanceHistory(id);
                }
            }

            // Map and enrich records
            const studentMap = {};
            (currentStudents || []).forEach(s => {
                studentMap[s.studentId] = s.studentName || s.name || `Student ${s.studentId}`;
            });

            const enriched = (historyData || []).map(r => ({
                ...r,
                status: (r.status || 'ABSENT').toUpperCase(),
                date: r.attendanceDate || r.date,
                method: r.source || r.method || 'MANUAL',
                studentName: studentMap[r.studentId] || r.studentName || `Student #${r.studentId}`,
                courseName: r.courseName || (isSessionLevel ? 'Class Session' : 'Batch History')
            }));

            setHistory(enriched);
        } catch (error) {
            console.error("Failed to load history data", error);
            setHistory([]);
        }
    };

    return (
        <div className="fade-in">
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
                                        setSelectedClass('');
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
                loading && history.length === 0 ? (
                    <div className="text-center py-5">
                        <div className="spinner-border text-primary" role="status"></div>
                        <p className="mt-2 text-muted">Loading attendance data...</p>
                    </div>
                ) : (
                    <AttendanceReport history={history} students={students} />
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
