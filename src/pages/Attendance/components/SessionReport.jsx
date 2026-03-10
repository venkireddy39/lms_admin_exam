import React, { useState, useEffect, useMemo } from 'react';
import { ATTENDANCE_STATUS } from '../constants/attendanceConstants';
import AttendanceTable from '../components/AttendanceTable';
import { attendanceService } from '../services/attendanceService';
import { batchService } from '../../Batches/services/batchService';
import { enrollmentService } from '../../Batches/services/enrollmentService';
import { FiUpload } from 'react-icons/fi';
import ReportHeader from './SessionReport/ReportHeader';
import ReportStatsGrid from './SessionReport/ReportStatsGrid';
import ReportCharts from './SessionReport/ReportCharts';

const SessionReport = ({ sessionId }) => {
    const [sessionRecords, setSessionRecords] = useState([]);
    const [loading, setLoading] = useState(true);
    const [context, setContext] = useState({ batchName: '', courseName: '', totalEnrolled: 0, batchId: null });
    const [isEditMode, setIsEditMode] = useState(false);

    useEffect(() => {
        const fetchReportData = async () => {
            try {
                const sessionInfo = await attendanceService.getSession(sessionId);
                const [records, batchInfo, enrollment] = await Promise.all([
                    attendanceService.getAttendance(sessionId).catch(() => []),
                    sessionInfo?.batchId ? batchService.getBatchById(sessionInfo.batchId).catch(() => null) : null,
                    sessionInfo?.batchId ? enrollmentService.getStudentsByBatch(sessionInfo.batchId).catch(() => []) : []
                ]);

                const mergedRecords = enrollment.map(student => {
                    const record = (records || []).find(r => String(r.studentId) === String(student.studentId));
                    return {
                        studentId: student.studentId,
                        name: student.studentName || student.name || `Student ${student.studentId}`,
                        status: record ? record.status : 'ABSENT',
                        remarks: record?.remarks || '',
                        source: record?.source || 'OFFLINE',
                        id: record?.id
                    };
                });

                setSessionRecords(mergedRecords);
                setContext({
                    batchName: (batchInfo?.batchName && batchInfo.batchName !== 'just now created') ? batchInfo.batchName : `Batch #${sessionInfo?.batchId || sessionId}`,
                    courseName: (batchInfo?.courseName && batchInfo.courseName !== 'N/A') ? batchInfo.courseName : 'Standard Course',
                    totalEnrolled: enrollment.length,
                    batchId: sessionInfo?.batchId
                });
            } catch (error) {
                console.error("Failed to load attendance report", error);
            } finally {
                setLoading(false);
            }
        };
        if (sessionId) fetchReportData();
    }, [sessionId]);

    const stats = useMemo(() => {
        if (sessionRecords.length === 0) return { total: 0, present: 0, absent: 0, late: 0, leftEarly: 0, presentPct: 0, chartData: [] };
        const present = sessionRecords.filter(a => a.status === ATTENDANCE_STATUS.PRESENT).length;
        const late = sessionRecords.filter(a => a.status === ATTENDANCE_STATUS.LATE).length;
        const absent = sessionRecords.filter(a => a.status === ATTENDANCE_STATUS.ABSENT).length;
        const leftEarly = sessionRecords.filter(a => a.status === ATTENDANCE_STATUS.LEFT_EARLY).length;
        const total = present + late + absent + leftEarly;
        const presentPct = total > 0 ? (((present + late) / total) * 100).toFixed(1) : 0;

        return {
            total, present, late, absent, leftEarly, presentPct,
            chartData: [
                { name: 'Present', value: present },
                { name: 'Late', value: late },
                { name: 'Absent', value: absent },
                ...(leftEarly > 0 ? [{ name: 'Left Early', value: leftEarly }] : [])
            ]
        };
    }, [sessionRecords]);

    const handleSave = async () => {
        try {
            const finalizedRecords = sessionRecords.map(r => {
                let finalRemarks = r.remarks || "";
                if (r.status === 'LATE' && r.lateMinutes && !finalRemarks.includes('[Late:')) {
                    finalRemarks = `${finalRemarks} [Late: ${r.lateMinutes}m]`.trim();
                }
                return { ...r, remarks: finalRemarks };
            });
            await attendanceService.saveAttendance(sessionId, finalizedRecords);
            setIsEditMode(false);
            alert("Records updated successfully!");
        } catch (e) { alert("Save failed."); }
    };

    if (loading) return <div className="p-5 text-center text-muted">Loading report...</div>;

    return (
        <div className="card border-0 shadow-sm">
            <ReportHeader 
                context={context} 
                sessionId={sessionId} 
                isEditMode={isEditMode} 
                setIsEditMode={setIsEditMode}
                onDownload={() => alert('CSV export will be implemented via backend')}
                onSave={handleSave}
                onCancel={() => { setIsEditMode(false); window.location.reload(); }}
                onMarkAll={(status) => {
                    if (window.confirm(`Mark all students as ${status}?`)) {
                        setSessionRecords(prev => prev.map(r => ({ ...r, status: status })));
                    }
                }}
            />

            <div className="card-body">
                <ReportStatsGrid stats={stats} />
                <ReportCharts stats={stats} context={context} />

                <div className="row g-4 mt-2">
                    <div className="col-12">
                        <div className="mt-4 border-top pt-4">
                            <div className="d-flex justify-content-between align-items-center mb-3">
                                <h6 className="fw-bold text-secondary text-uppercase mb-0 small">
                                    {isEditMode ? "Edit Mode: Update Statuses and Remarks" : "Detailed Attendance Log"}
                                </h6>
                                {isEditMode && (
                                    <div className="d-flex gap-2">
                                        <input
                                            type="file"
                                            id="csv-patch"
                                            className="d-none"
                                            accept=".csv"
                                            onChange={async (e) => {
                                                const file = e.target.files[0];
                                                if (!file) return;
                                                const formData = new FormData();
                                                formData.append('file', file);
                                                try {
                                                    await attendanceService.uploadAttendanceCsv(formData, { sessionId, batchId: context.batchId });
                                                    alert("CSV Uploaded Successfully! Refreshing...");
                                                    window.location.reload();
                                                } catch (err) { alert("CSV processing failed."); }
                                            }}
                                        />
                                        <label htmlFor="csv-patch" className="btn btn-outline-info btn-sm cursor-pointer">
                                            <FiUpload size={14} className="me-1" /> Patch via CSV
                                        </label>
                                    </div>
                                )}
                            </div>
                            <AttendanceTable
                                students={sessionRecords}
                                onStatusChange={(id, status) => setSessionRecords(prev => prev.map(r => String(r.studentId) === String(id) ? { ...r, status } : r))}
                                onRemarkChange={(id, remarks) => setSessionRecords(prev => prev.map(r => String(r.studentId) === String(id) ? { ...r, remarks } : r))}
                                onLateMinutesChange={(id, minutes) => setSessionRecords(prev => prev.map(r => String(r.studentId) === String(id) ? { ...r, lateMinutes: minutes } : r))}
                                isEditable={isEditMode}
                            />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SessionReport;
