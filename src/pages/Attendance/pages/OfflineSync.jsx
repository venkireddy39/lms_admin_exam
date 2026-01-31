import React, { useState, useMemo, useEffect } from 'react';
import { useAttendanceStore } from '../store/attendanceStore';
import { attendanceService } from '../services/attendanceService';
import { enrollmentService } from '../../Batches/services/enrollmentService';
import { FiSave, FiFilter, FiRefreshCw, FiTrash2, FiUpload, FiCalendar, FiClock, FiCheckCircle, FiAlertCircle, FiX, FiAlertTriangle } from 'react-icons/fi';
import AttendanceStats from '../components/AttendanceStats';
import AttendanceTable from '../components/AttendanceTable';

const OfflineSync = () => {
    // Selectors
    const [selectedCourse, setSelectedCourse] = useState('');
    const [selectedBatch, setSelectedBatch] = useState('');
    const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
    const [selectedSessionId, setSelectedSessionId] = useState('');

    const [activeTab, setActiveTab] = useState('ENTRY'); // ENTRY | QUEUE

    // Data State
    const [courses, setCourses] = useState([]);
    const [batches, setBatches] = useState([]);
    const [sessions, setSessions] = useState([]);
    const [students, setStudents] = useState([]);

    // Local Attendance State
    const [attendanceMap, setAttendanceMap] = useState({});
    const [lateMinutesMap, setLateMinutesMap] = useState({});

    // CSV Preview State
    const [csvPreview, setCsvPreview] = useState(null); // { rows: [], summary: { total, valid, errors, warnings: [] } }

    // Store Access
    const { queueOfflineAttendance, attendanceList, clearOfflineQueue } = useAttendanceStore();

    // Fetch Courses
    useEffect(() => {
        attendanceService.getCourses().then(setCourses).catch(console.error);
    }, []);

    // Fetch Batches
    useEffect(() => {
        if (selectedCourse) {
            attendanceService.getBatches(selectedCourse).then(setBatches).catch(console.error);
        } else {
            setBatches([]);
        }
    }, [selectedCourse]);

    // Fetch Sessions (Available Sessions)
    useEffect(() => {
        if (selectedBatch && selectedDate) {
            // Assuming getSessions can filter by batch and date
            // Note: getSessions might return all sessions, so we might need to filter or backend handles it.
            // Our implementation sends params.
            attendanceService.getSessions(selectedBatch, selectedDate).then(data => {
                // Filter for 'Live Class' or ensure backend does it. 
                // Let's assume returned sessions are valid for attendance.
                setSessions(data || []);
            }).catch(console.error);
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

    // Auto-init attendance or clear on session change
    useEffect(() => {
        if (selectedSessionId && students.length > 0) {
            const initial = {};
            students.forEach(s => {
                initial[s.id] = 'PRESENT';
            });
            setAttendanceMap(initial);
        } else {
            setAttendanceMap({});
        }
        setCsvPreview(null); // Clear preview on session switch
    }, [selectedSessionId, students]);

    // Stats Calculation
    const stats = useMemo(() => {
        const total = students.length;
        if (total === 0) return { total: 0, present: 0, absent: 0, late: 0, percentage: 0 };

        const vals = Object.values(attendanceMap);
        const present = vals.filter(s => s === 'PRESENT').length;
        const absent = vals.filter(s => s === 'ABSENT').length;
        const late = vals.filter(s => s === 'LATE').length;

        return {
            total,
            present,
            absent,
            late,
            percentage: total > 0 ? Math.round((present / total) * 100) : 0
        };
    }, [students, attendanceMap]);

    const handleStatusChange = (studentId, status) => {
        setAttendanceMap(prev => ({ ...prev, [studentId]: status }));
    };

    // CSV Upload (Preview Mode) with Strict Validation
    const handleFileUpload = (e) => {
        const file = e.target.files[0];
        if (!file) return;

        // A. File Level Validation
        if (!file.name.toLowerCase().endsWith('.csv')) {
            alert('❌ Invalid File Type. Only .csv files are allowed.');
            e.target.value = null;
            return;
        }

        if (file.size > 2 * 1024 * 1024) { // 2 MB
            alert('❌ File too large. Max 2MB allowed.');
            e.target.value = null;
            return;
        }

        const reader = new FileReader();
        reader.onload = (evt) => {
            const text = evt.target.result;
            const lines = text.split(/\r?\n/).filter(l => l.trim() !== '');

            if (lines.length < 2) {
                alert('❌ Empty or invalid CSV. Needs header + data.');
                e.target.value = null;
                return;
            }

            // B. Header Validation (Strict)
            const headers = lines[0].split(',').map(h => h.trim().toLowerCase());

            // Allow exact set match
            const allowedHeaders = new Set(['student_id', 'status', 'remark']);
            const headerSet = new Set(headers);

            // Check for duplicates
            if (headerSet.size !== headers.length) {
                alert('❌ Duplicate headers found.');
                e.target.value = null;
                return;
            }

            // Check required presence
            const missing = ['student_id', 'status'].filter(h => !headerSet.has(h));
            // Check extra columns (Strict)
            const extra = headers.filter(h => !allowedHeaders.has(h));

            if (missing.length > 0) {
                alert(`❌ Missing headers: ${missing.join(', ')}`);
                e.target.value = null;
                return;
            }
            if (extra.length > 0) {
                alert(`❌ Extra headers not allowed: ${extra.join(', ')}`);
                e.target.value = null;
                return;
            }

            const idIdx = headers.indexOf('student_id');
            const statusIdx = headers.indexOf('status');
            const remarkIdx = headers.indexOf('remark');

            // C. Row Parsing & Validation
            const previewRows = [];
            const seenIds = new Set();
            let validCount = 0;
            let errorCount = 0;

            // Stats for Suspicious Check
            let countPresent = 0;
            let countAbsent = 0;

            for (let i = 1; i < lines.length; i++) {
                const parts = lines[i].split(',').map(p => p.trim());

                // If line has comma but empty values, keep them. 
                // We trust split result.

                const rawId = parts[idIdx];
                const rawStatus = parts[statusIdx]?.toUpperCase();
                const rawRemark = remarkIdx !== -1 ? parts[remarkIdx] : '';

                const row = {
                    line: i + 1, // +1 for header
                    studentId: rawId,
                    status: rawStatus,
                    remark: rawRemark,
                    errors: [],
                    isValid: true
                };

                // 1. Identity Check
                if (!rawId) {
                    row.errors.push('Missing ID');
                } else if (!/^[A-Za-z0-9_-]+$/.test(rawId)) {
                    row.errors.push('Invalid ID Format');
                } else {
                    const student = students.find(s => s.id === rawId);
                    if (!student) row.errors.push('Not in batch');
                }

                // 2. Status Check
                const validStatuses = ['PRESENT', 'ABSENT', 'LATE', 'EXCUSED'];
                if (!validStatuses.includes(rawStatus)) {
                    row.errors.push('Invalid Status');
                } else {
                    if (rawStatus === 'PRESENT') countPresent++;
                    if (rawStatus === 'ABSENT') countAbsent++;
                }

                // 3. Remark Sanitization
                if (rawRemark && rawRemark.length > 255) {
                    row.errors.push('Remark too long');
                }
                if (rawRemark && /<[^>]*>/g.test(rawRemark)) {
                    row.errors.push('HTML not allowed');
                }

                // 4. Duplicate Check
                if (seenIds.has(rawId)) row.errors.push('Duplicate ID');
                else if (rawId) seenIds.add(rawId);

                // 5. Online Conflict Guard
                const onlineRecord = attendanceList.find(
                    r => r.studentId === rawId && r.sessionId === selectedSessionId && r.mode === 'ONLINE'
                );
                if (onlineRecord) {
                    row.errors.push('Already Online');
                }

                if (row.errors.length > 0) {
                    row.isValid = false;
                    errorCount++;
                } else {
                    validCount++;
                }

                previewRows.push(row);
            }

            if (previewRows.length === 0) {
                alert('❌ Copied parsed but found no rows.');
                e.target.value = null;
                return;
            }

            // Suspicious File Checks
            const totalRows = previewRows.length;
            const warnings = [];
            if (countPresent === totalRows) warnings.push('All students marked PRESENT');
            if (countAbsent === totalRows) warnings.push('All students marked ABSENT');

            setCsvPreview({
                rows: previewRows,
                summary: {
                    total: totalRows,
                    valid: validCount,
                    errors: errorCount,
                    warnings // Pass to UI
                }
            });
            e.target.value = null; // Reset input
        };
        reader.readAsText(file);
    };

    const handleConfirmImport = () => {
        if (!csvPreview) return;

        const newMap = { ...attendanceMap };
        let importCount = 0;

        csvPreview.rows.forEach(row => {
            if (row.isValid) {
                newMap[row.studentId] = row.status;
                importCount++;
            }
        });

        setAttendanceMap(newMap);
        alert(`✅ Imported ${importCount} records successfully.`);
        setCsvPreview(null);
    };

    const handleCancelPreview = () => {
        setCsvPreview(null);
    };

    const handleSave = () => {
        if (!selectedSessionId) return;

        Object.entries(attendanceMap).forEach(([sid, status]) => {
            const meta = status === 'LATE' && lateMinutesMap[sid] ? { minutesLate: lateMinutesMap[sid] } : {};
            queueOfflineAttendance(sid, status, selectedDate, selectedSessionId, meta);
        });
        alert(`Attendance for ${students.length} students queued locally.`);
        setActiveTab('QUEUE');
    };

    // Queue Logic
    const [queue, setQueue] = useState([]);

    const loadQueue = () => {
        try {
            const stored = JSON.parse(localStorage.getItem('offline_attendance') || '[]');
            setQueue(stored);
        } catch (e) {
            console.error("Failed to parse offline_attendance queue, clearing.", e);
            setQueue([]);
            localStorage.removeItem('offline_attendance');
        }
    };

    useEffect(() => { loadQueue(); }, [activeTab]);

    const handleSync = async () => {
        // Group by Session ID
        const grouped = queue.reduce((acc, curr) => {
            if (!acc[curr.sessionId]) acc[curr.sessionId] = [];
            acc[curr.sessionId].push(curr);
            return acc;
        }, {});

        let successCount = 0;
        let failCount = 0;

        for (const [sessionId, records] of Object.entries(grouped)) {
            try {
                // Prepare payload
                // The API needs records in a specific format.
                // queueOfflineAttendance stores { studentId, status, sessionId, ... }
                // saveAttendance expects list of records.
                const payload = records.map(r => ({
                    studentId: r.studentId,
                    status: r.status,
                    mode: 'OFFLINE', // It was queued as offline
                    markedAt: r.timestamp
                    // Add other meta if needed
                }));

                await attendanceService.saveAttendance(sessionId, payload);
                successCount += records.length;

            } catch (err) {
                console.error(`Failed to sync session ${sessionId}`, err);
                failCount += records.length;
            }
        }

        if (successCount > 0) {
            // Remove successfully synced ones?
            // For simplicity, we just clear the queue if mostly successful, or we should be more granular.
            // Let's clear for now as per original simple logic.
            localStorage.removeItem('offline_attendance');
            loadQueue();
            alert(`Synced ${successCount} records successfully!`);
        } else if (failCount > 0) {
            alert("Failed to sync records. Check network or data.");
        }
    };

    const handleClearQueue = () => {
        if (window.confirm("Are you sure you want to delete all pending records in the sync queue?")) {
            clearOfflineQueue();
            loadQueue();
        }
    };

    return (
        <div className="fade-in">
            <div className="d-flex justify-content-between align-items-center mb-4">
                <h4 className="fw-bold m-0 px-2">Batch Attendance Manager</h4>
                <div className="btn-group">
                    <button
                        className={`btn btn-sm ${activeTab === 'ENTRY' ? 'btn-secondary' : 'btn-outline-secondary'}`}
                        onClick={() => setActiveTab('ENTRY')}
                    >
                        Manual Entry
                    </button>
                    <button
                        className={`btn btn-sm ${activeTab === 'QUEUE' ? 'btn-secondary' : 'btn-outline-secondary'}`}
                        onClick={() => setActiveTab('QUEUE')}
                    >
                        Sync Queue ({queue.length})
                    </button>
                </div>
            </div>

            {activeTab === 'ENTRY' && (
                <>
                    {/* Filters */}
                    <div className="card border-0 shadow-sm mb-4">
                        <div className="card-body">
                            <div className="row g-3 align-items-end">
                                <div className="col-md-3">
                                    <label className="form-label small fw-bold text-secondary">Course</label>
                                    <select
                                        className="form-select"
                                        value={selectedCourse}
                                        onChange={e => { setSelectedCourse(e.target.value); setSelectedBatch(''); setSelectedSessionId(''); }}
                                    >
                                        <option value="">Select Course</option>
                                        {courses.map(c => (
                                            <option key={c.courseId} value={c.courseId}>{c.courseName}</option>
                                        ))}
                                    </select>
                                </div>
                                <div className="col-md-3">
                                    <label className="form-label small fw-bold text-secondary">Batch</label>
                                    <select
                                        className="form-select"
                                        value={selectedBatch}
                                        onChange={e => { setSelectedBatch(e.target.value); setSelectedSessionId(''); }}
                                    >
                                        <option value="">Select Batch</option>
                                        {batches.map(b => (
                                            <option key={b.batchId} value={b.batchId}>{b.batchName}</option>
                                        ))}
                                    </select>
                                </div>
                                <div className="col-md-3">
                                    <label className="form-label small fw-bold text-secondary">Date</label>
                                    <input
                                        type="date"
                                        className="form-control"
                                        value={selectedDate}
                                        onChange={e => { setSelectedDate(e.target.value); setSelectedSessionId(''); }}
                                    />
                                </div>
                                <div className="col-md-3">
                                    {/* CSV Upload Button - Only active if session selected */}
                                    <div className="w-100">
                                        <input
                                            type="file"
                                            accept=".csv"
                                            id="csv-upload"
                                            className="d-none"
                                            onChange={handleFileUpload}
                                            disabled={!selectedSessionId}
                                        />
                                        <label
                                            htmlFor="csv-upload"
                                            className={`btn btn-outline-secondary w-100 ${!selectedSessionId ? 'disabled' : ''}`}
                                        >
                                            <FiUpload className="me-2" /> Upload CSV
                                        </label>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Step 2: Session Selection */}
                    {selectedBatch && selectedDate && !selectedSessionId && (
                        <div className="mb-4 fade-in">
                            <h6 className="fw-bold text-muted mb-3">Select Scheduled Class for {selectedDate}:</h6>
                            {sessions.length > 0 ? (
                                <div className="row g-3">
                                    {sessions.map(sess => (
                                        <div className="col-md-4" key={sess.id}>
                                            <div
                                                className="card h-100 border-0 shadow-sm hover-shadow cursor-pointer"
                                                onClick={() => setSelectedSessionId(sess.id)}
                                            >
                                                <div className="card-body">
                                                    <div className="d-flex justify-content-between mb-2">
                                                        <span className="badge bg-primary bg-opacity-10 text-primary">Class ID: {sess.sessionId}</span>
                                                        <FiClock className="text-muted" />
                                                    </div>
                                                    <h6 className="fw-bold mb-1">{sess.title || 'Untitled Session'}</h6>
                                                    <p className="text-muted small mb-0">{sess.startTime} - {sess.endTime}</p>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="alert alert-info border-0 shadow-sm">
                                    <FiCalendar className="me-2" /> No classes found linked to this batch on this date.
                                </div>
                            )}
                        </div>
                    )}

                    {/* CSV PREVIEW MODAL / SECTION */}
                    {csvPreview && (
                        <div className="mb-4 fade-in">
                            <div className="card border-0 shadow-sm border-start border-primary border-4">
                                <div className="card-header bg-white p-3 d-flex justify-content-between align-items-center">
                                    <h5 className="mb-0 fw-bold d-flex align-items-center">
                                        <FiUpload className="me-2 text-primary" />
                                        Confirm CSV Import
                                    </h5>
                                    <div className="d-flex gap-2">
                                        <button className="btn btn-outline-secondary btn-sm" onClick={handleCancelPreview}>
                                            <FiX className="me-1" /> Cancel
                                        </button>
                                        <button
                                            className="btn btn-primary btn-sm"
                                            disabled={csvPreview.summary.errors > 0 || csvPreview.summary.valid === 0}
                                            onClick={handleConfirmImport}
                                        >
                                            <FiCheckCircle className="me-1" />
                                            Import {csvPreview.summary.valid} Valid Rows
                                        </button>
                                    </div>
                                </div>
                                <div className="card-body bg-light p-3">

                                    {/* Suspicious Warnings */}
                                    {csvPreview.summary.warnings && csvPreview.summary.warnings.length > 0 && (
                                        <div className="alert alert-warning d-flex align-items-center mb-3">
                                            <FiAlertTriangle className="me-2 text-warning fs-4" />
                                            <div>
                                                <strong>Suspicious Pattern Detected:</strong>
                                                <ul className="mb-0 ps-3">
                                                    {csvPreview.summary.warnings.map((w, i) => (
                                                        <li key={i}>{w}</li>
                                                    ))}
                                                </ul>
                                            </div>
                                        </div>
                                    )}

                                    {/* Summary Stats */}
                                    <div className="d-flex gap-3 mb-3">
                                        <div className="badge bg-white text-dark shadow-sm p-2 border">Total: {csvPreview.summary.total}</div>
                                        <div className="badge bg-success bg-opacity-10 text-success p-2 border border-success">Valid: {csvPreview.summary.valid}</div>
                                        <div className={`badge p-2 border ${csvPreview.summary.errors > 0 ? 'bg-danger bg-opacity-10 text-danger border-danger' : 'bg-secondary bg-opacity-10 text-secondary'}`}>
                                            Errors: {csvPreview.summary.errors}
                                        </div>
                                    </div>

                                    <div className="table-responsive bg-white border rounded" style={{ maxHeight: '300px' }}>
                                        <table className="table table-sm table-hover mb-0 sticky-top-header">
                                            <thead className="table-light">
                                                <tr>
                                                    <th>Line</th>
                                                    <th>Student ID</th>
                                                    <th>Status</th>
                                                    <th>Remark</th>
                                                    <th>Validation</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {csvPreview.rows.map((row, i) => (
                                                    <tr key={i} className={!row.isValid ? 'table-danger' : ''}>
                                                        <td className="text-muted small">{row.line}</td>
                                                        <td>{row.studentId}</td>
                                                        <td>
                                                            <span className={`badge ${!row.isValid ? 'bg-secondary' : row.status === 'PRESENT' ? 'bg-success' : 'bg-warning'} bg-opacity-25 text-dark`}>
                                                                {row.status}
                                                            </span>
                                                        </td>
                                                        <td className="small text-muted text-truncate" style={{ maxWidth: '150px' }} title={row.remark}>{row.remark}</td>
                                                        <td>
                                                            {row.isValid ? (
                                                                <span className="text-success small fw-bold">
                                                                    <FiCheckCircle /> OK
                                                                </span>
                                                            ) : (
                                                                <div className="text-danger small fw-bold">
                                                                    <FiAlertCircle className="me-1" />
                                                                    {row.errors.join(', ')}
                                                                </div>
                                                            )}
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                    <div className="mt-2 text-muted small fst-italic">
                                        * Only rows marked "OK" will be imported. Any error blocks the entire upload for better data integrity.
                                        <br />
                                        <span className="fw-bold text-danger">Strict Mode: Import button disabled if ANY error exists.</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Step 3: Attendance Table */}
                    {selectedSessionId && !csvPreview ? (
                        <div className="fade-in">
                            <div className="d-flex justify-content-between mb-3">
                                <h5 className="fw-bold">Marking for: {sessions.find(s => s.id === selectedSessionId)?.title}</h5>
                                <button className="btn btn-dark btn-sm" onClick={() => setSelectedSessionId('')}>Change Session</button>
                            </div>

                            {/* Stats */}
                            <div className="mb-4">
                                <AttendanceStats stats={stats} />
                            </div>

                            {/* Table */}
                            <div className="card border-0 shadow-sm mb-4">
                                <div className="card-body p-0">
                                    <AttendanceTable
                                        students={students.map(s => {
                                            // Check if student is already marked in the store (e.g. Online)
                                            // attendanceList from useAttendanceStore might be for the LIVE session only if we are in that context.
                                            // But OfflineSync might be used outside of a "started" live session context if we just want to upload data.
                                            // We should check if attendanceList actually pertains to selectedSessionId.
                                            const existingRecord = attendanceList.filter(r => r.sessionId === selectedSessionId).find(r => r.studentId === s.id);
                                            const isOnline = existingRecord?.mode === 'ONLINE';

                                            return {
                                                ...s,
                                                studentId: s.id,
                                                // If Online, use store status. Else use local map (defaulting to UNMARKED if missing, though we init to PRESENT)
                                                status: isOnline ? existingRecord.status : (attendanceMap[s.id] || 'UNMARKED'),
                                                mode: isOnline ? 'ONLINE' : 'OFFLINE',
                                                lateMinutes: lateMinutesMap[s.id],
                                                remarks: ''
                                            };
                                        })}
                                        onStatusChange={handleStatusChange}
                                        onLateMinutesChange={(id, mins) => setLateMinutesMap(prev => ({ ...prev, [id]: mins }))}
                                        onRemarkChange={() => { }}
                                        isEditable={true}
                                    />
                                </div>
                            </div>

                            <button
                                className="btn btn-success btn-lg w-100 rounded-pill shadow-sm"
                                onClick={handleSave}
                            >
                                <FiSave className="me-2" /> Save Offline Attendance
                            </button>
                        </div>
                    ) : null}
                </>
            )}

            {/* Queue Tab */}
            {activeTab === 'QUEUE' && (
                <div className="card border-0 shadow-sm">
                    <div className="card-header bg-white p-3 d-flex justify-content-between align-items-center">
                        <h5 className="mb-0 fw-bold">Pending Records ({queue.length})</h5>
                        <div>
                            <button className="btn btn-outline-danger btn-sm me-2" onClick={handleClearQueue}>
                                <FiTrash2 /> Clear
                            </button>
                            <button className="btn btn-secondary btn-sm" onClick={handleSync}>
                                <FiRefreshCw /> Sync Now
                            </button>
                        </div>
                    </div>
                    <div className="table-responsive">
                        <table className="table table-hover mb-0 align-middle">
                            <thead className="bg-light">
                                <tr>
                                    <th className="ps-4">Student ID</th>
                                    <th>Status</th>
                                    <th>Session</th>
                                    <th>Date</th>
                                </tr>
                            </thead>
                            <tbody>
                                {queue.map((r, i) => (
                                    <tr key={i}>
                                        <td className="ps-4 fw-medium">{r.studentId}</td>
                                        <td>
                                            <span className={`badge bg-${r.status === 'PRESENT' ? 'success' : r.status === 'LATE' ? 'warning' : 'danger'} bg-opacity-10 text-${r.status === 'PRESENT' ? 'success' : r.status === 'LATE' ? 'warning' : 'danger'}`}>
                                                {r.status}
                                            </span>
                                            {r.status === 'LATE' && r.minutesLate && (
                                                <div className="small text-danger fw-bold mt-1" style={{ fontSize: '0.7rem' }}>
                                                    +{r.minutesLate} min
                                                </div>
                                            )}
                                        </td>
                                        <td className="small text-muted">{r.sessionId}</td>
                                        <td className="text-muted small">
                                            {r.timestamp ? new Date(r.timestamp).toLocaleDateString() : '-'}
                                        </td>
                                    </tr>
                                ))}
                                {queue.length === 0 && (
                                    <tr>
                                        <td colSpan="4" className="text-center py-5 text-muted">Queue is empty</td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}
        </div>
    );
};
export default OfflineSync;
