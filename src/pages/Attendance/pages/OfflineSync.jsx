import React, { useState, useMemo, useEffect } from 'react';
import { FiSave, FiClock, FiCheckCircle, FiAlertCircle, FiUpload, FiDownload, FiCalendar } from 'react-icons/fi';
import AttendanceStats from '../components/AttendanceStats';
import AttendanceTable from '../components/AttendanceTable';
import { useOfflineData } from '../hooks/useOfflineData';
import { useOfflineQueue } from '../hooks/useOfflineQueue';
import { useCsvUpload } from '../hooks/useCsvUpload';
import QueueTable from '../components/OfflineSync/QueueTable';
import UploadHistory from '../components/OfflineSync/UploadHistory';

const OfflineSync = () => {
    const [selectedCourse, setSelectedCourse] = useState('');
    const [selectedBatch, setSelectedBatch] = useState('');
    const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
    const [selectedSessionId, setSelectedSessionId] = useState('');
    const [activeTab, setActiveTab] = useState('ENTRY'); // ENTRY | QUEUE | HISTORY

    const {
        courses,
        batches,
        sessions,
        students,
        uploadJobs,
        refreshUploadJobs
    } = useOfflineData(selectedCourse, selectedBatch, selectedDate);

    const {
        queue,
        handleSync,
        handleClearQueue,
        queueOfflineAttendance
    } = useOfflineQueue(activeTab, selectedDate);

    const {
        uploadJob,
        setUploadJob,
        isUploading,
        downloadTemplate,
        handleFileUpload,
        handleProcessJob
    } = useCsvUpload(selectedCourse, selectedBatch, selectedSessionId, selectedDate, students, refreshUploadJobs);

    const [attendanceMap, setAttendanceMap] = useState({});
    const [lateMinutesMap, setLateMinutesMap] = useState({});

    // Auto-init attendance or clear on session change
    useEffect(() => {
        if (selectedSessionId && students.length > 0) {
            const initial = {};
            students.forEach(s => { initial[s.id] = 'UNMARKED'; });
            setAttendanceMap(initial);
        } else {
            setAttendanceMap({});
        }
    }, [selectedSessionId, students]);

    const stats = useMemo(() => {
        const total = students.length;
        if (total === 0) return { total: 0, present: 0, absent: 0, late: 0, percentage: 0 };
        const vals = Object.values(attendanceMap);
        const present = vals.filter(s => s === 'PRESENT').length;
        const absent = vals.filter(s => s === 'ABSENT').length;
        const late = vals.filter(s => s === 'LATE').length;
        return { total, present, absent, late, percentage: total > 0 ? Math.round((present / total) * 100) : 0 };
    }, [students, attendanceMap]);

    const handleSave = () => {
        if (!selectedSessionId) return;
        let markedCount = 0;
        Object.entries(attendanceMap).forEach(([sid, status]) => {
            if (!status || status === 'UNMARKED') return;
            const meta = status === 'LATE' && lateMinutesMap[sid] ? { minutesLate: lateMinutesMap[sid] } : {};
            queueOfflineAttendance(sid, status, selectedDate, selectedSessionId, meta);
            markedCount++;
        });
        if (markedCount === 0) {
            alert("No changes to save. Please mark at least one student.");
            return;
        }
        alert(`Attendance for ${markedCount} students queued locally.`);
        setActiveTab('QUEUE');
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
                    <button
                        className={`btn btn-sm ${activeTab === 'HISTORY' ? 'btn-secondary' : 'btn-outline-secondary'}`}
                        onClick={() => setActiveTab('HISTORY')}
                    >
                        Upload History ({uploadJobs.length})
                    </button>
                </div>
            </div>

            <div className="card border-0 shadow-sm mb-4 bg-light">
                <div className="card-body py-3">
                    <div className="row g-3 align-items-center">
                        <div className="col-md-5">
                            <label className="form-label small fw-bold text-secondary mb-1">Select Course</label>
                            <select className="form-select" value={selectedCourse} onChange={e => { setSelectedCourse(e.target.value); setSelectedBatch(''); setSelectedSessionId(''); }}>
                                <option value="">-- Select Course --</option>
                                {courses.map(c => <option key={c.courseId} value={c.courseId}>{c.courseName}</option>)}
                            </select>
                        </div>
                        <div className="col-md-5">
                            <label className="form-label small fw-bold text-secondary mb-1">Select Batch</label>
                            <select className="form-select" value={selectedBatch} onChange={e => { setSelectedBatch(e.target.value); setSelectedSessionId(''); }} disabled={!selectedCourse}>
                                <option value="">-- Select Batch --</option>
                                {batches.map(b => <option key={b.batchId} value={b.batchId}>{b.batchName}</option>)}
                            </select>
                        </div>
                    </div>
                </div>
            </div>

            {activeTab === 'ENTRY' && (
                <>
                    <div className="card border-0 shadow-sm mb-4">
                        <div className="card-body">
                            <div className="row g-3 align-items-end">
                                <div className="col-md-4">
                                    <label className="form-label small fw-bold text-secondary">Attendance Date</label>
                                    <input type="date" className="form-control" value={selectedDate} onChange={e => { setSelectedDate(e.target.value); setSelectedSessionId(''); }} />
                                </div>
                                <div className="col-md-8">
                                    <label className="form-label small fw-bold text-secondary">Bulk Upload (Optional)</label>
                                    <div className="w-100 d-flex gap-2">
                                        <div className="flex-grow-1">
                                            <input type="file" accept=".csv,.xlsx" id="csv-upload" className="d-none" onChange={handleFileUpload} disabled={!selectedSessionId || isUploading} />
                                            <label htmlFor="csv-upload" className={`btn btn-outline-secondary w-100 ${(!selectedSessionId || isUploading) ? 'disabled' : ''}`}>
                                                {isUploading ? <><span className="spinner-border spinner-border-sm me-2" /> Uploading...</> : <><FiUpload className="me-2" /> Upload CSV/Excel to Session</>}
                                            </label>
                                        </div>
                                        <button className="btn btn-outline-info d-flex align-items-center gap-1" title="Download CSV Template" onClick={downloadTemplate}>
                                            <FiDownload /><span className="small">Template</span>
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {selectedBatch && selectedDate && !selectedSessionId && (
                        <div className="mb-4 fade-in">
                            <h6 className="fw-bold text-muted mb-3">Select Scheduled Class for {selectedDate}:</h6>
                            {sessions.length > 0 ? (
                                <div className="row g-3">
                                    {sessions.map(sess => (
                                        <div className="col-md-4" key={sess.id}>
                                            <div className="card h-100 border-0 shadow-sm hover-shadow cursor-pointer" onClick={() => setSelectedSessionId(sess.id)}>
                                                <div className="card-body">
                                                    <div className="d-flex justify-content-between mb-2">
                                                        <span className="badge bg-primary bg-opacity-10 text-primary">Class ID: {sess.sessionId}</span>
                                                    </div>
                                                    <h6 className="fw-bold mb-1">{sess.title || 'Untitled Session'}</h6>
                                                    <p className="text-muted small mb-0">{sess.startTime} - {sess.endTime}</p>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="alert alert-info border-0 shadow-sm"><FiCalendar className="me-2" /> No classes found for this date.</div>
                            )}
                        </div>
                    )}

                    {uploadJob && (
                        <div className="mb-4 fade-in">
                            <div className={`card border-0 shadow-sm border-start border-4 ${uploadJob.status === 'FAILED' ? 'border-danger' : uploadJob.status === 'PROCESSED' ? 'border-success' : 'border-info'}`}>
                                <div className="card-body d-flex justify-content-between align-items-center">
                                    <div>
                                        <h6 className="fw-bold mb-1">
                                            {uploadJob.status === 'PENDING' && <><FiClock className="me-2 text-info" /> File Uploaded (Action Required)</>}
                                            {uploadJob.status === 'PROCESSED' && <><FiCheckCircle className="me-2 text-success" /> Attendance Updated Successfully</>}
                                            {uploadJob.status === 'FAILED' && <><FiAlertCircle className="me-2 text-danger" /> Processing Failed</>}
                                        </h6>
                                        <p className="small text-muted mb-0">Job ID: {uploadJob.id}</p>
                                    </div>
                                    <div>
                                        {uploadJob.status === 'PENDING' && (
                                            <button className="btn btn-warning btn-sm fw-bold shadow-sm" onClick={() => handleProcessJob(uploadJob.id)} disabled={isUploading}>
                                                {isUploading ? 'Applying...' : 'Apply Data to DB'}
                                            </button>
                                        )}
                                        <button className="btn btn-link btn-sm text-secondary" onClick={() => setUploadJob(null)}>Dismiss</button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {selectedSessionId && (
                        <div className="fade-in">
                            <div className="d-flex justify-content-between mb-3 text-truncate">
                                <h5 className="fw-bold text-truncate">Marking for: {sessions.find(s => s.id === selectedSessionId)?.title}</h5>
                                <button className="btn btn-dark btn-sm flex-shrink-0" onClick={() => setSelectedSessionId('')}>Change Session</button>
                            </div>
                            <div className="mb-4"><AttendanceStats stats={stats} /></div>
                            <div className="card border-0 shadow-sm mb-4">
                                <div className="card-body p-0">
                                    <AttendanceTable
                                        students={students.map(s => ({
                                            ...s,
                                            studentId: s.id,
                                            status: attendanceMap[s.id] || 'UNMARKED',
                                            mode: 'OFFLINE',
                                            lateMinutes: lateMinutesMap[s.id],
                                            remarks: ''
                                        }))}
                                        onStatusChange={(id, status) => setAttendanceMap(prev => ({ ...prev, [id]: status }))}
                                        onLateMinutesChange={(id, mins) => setLateMinutesMap(prev => ({ ...prev, [id]: mins }))}
                                        onRemarkChange={() => { }}
                                        isEditable={true}
                                    />
                                </div>
                            </div>
                            <button className="btn btn-success btn-lg w-100 rounded-pill shadow-sm" onClick={handleSave}>
                                <FiSave className="me-2" /> Save Offline Attendance
                            </button>
                        </div>
                    )}
                </>
            )}

            {activeTab === 'QUEUE' && <QueueTable queue={queue} handleSync={handleSync} handleClearQueue={handleClearQueue} />}
            {activeTab === 'HISTORY' && <UploadHistory uploadJobs={uploadJobs} handleProcessJob={handleProcessJob} isUploading={isUploading} refreshUploadJobs={refreshUploadJobs} />}
        </div>
    );
};

export default OfflineSync;
