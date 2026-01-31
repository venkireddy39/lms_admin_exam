import React, { useState, useEffect, useMemo } from 'react';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { Download, CheckCircle, Clock } from 'lucide-react';
import { ATTENDANCE_STATUS } from '../constants/attendanceConstants';
import AttendanceTable from '../components/AttendanceTable';
import { attendanceService } from '../services/attendanceService';
import { batchService } from '../../Batches/services/batchService';
import { enrollmentService } from '../../Batches/services/enrollmentService';
import { FiEdit2, FiSave, FiUpload, FiX } from 'react-icons/fi';

const COLORS = {
    PRESENT: '#22c55e',
    ABSENT: '#ef4444',
    LATE: '#eab308',
    LEFT_EARLY: '#3b82f6',
    UNMARKED: '#94a3b8'
};

const SessionReport = ({ sessionId }) => {
    const [sessionRecords, setSessionRecords] = useState([]);
    const [loading, setLoading] = useState(true);
    const [context, setContext] = useState({ batchName: '', courseName: '', totalEnrolled: 0, batchId: null });
    const [isEditMode, setIsEditMode] = useState(false);
    const [pendingChanges, setPendingChanges] = useState([]); // Array of updated records

    useEffect(() => {
        const fetchReportData = async () => {
            try {
                // 1. Fetch Session Info (to get Batch ID)
                const sessionInfo = await attendanceService.getSession(sessionId);

                // 2. Fetch Records and Context simultaneously
                // 2. Fetch Records and Context simultaneously
                const [records, batchInfo, enrollment] = await Promise.all([
                    attendanceService.getAttendance(sessionId).catch(() => []),
                    sessionInfo?.batchId ? batchService.getBatchById(sessionInfo.batchId).catch(() => null) : null,
                    sessionInfo?.batchId ? enrollmentService.getStudentsByBatch(sessionInfo.batchId).catch(() => []) : []
                ]);

                // 3. Merge enrollment with records (so we see students who weren't marked)
                const mergedRecords = enrollment.map(student => {
                    const record = (records || []).find(r => String(r.studentId) === String(student.studentId));
                    return {
                        studentId: student.studentId,
                        name: student.studentName || student.name || `Student ${student.studentId}`,
                        status: record ? record.status : 'ABSENT', // Default to absent if missing
                        remarks: record?.remarks || '',
                        source: record?.source || 'OFFLINE',
                        id: record?.id // backend record id
                    };
                });

                setSessionRecords(mergedRecords);
                setContext({
                    batchName: batchInfo?.batchName || `Batch #${sessionInfo?.batchId}`,
                    courseName: batchInfo?.courseName || 'N/A',
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

    /* ---------------- DERIVED STATS ---------------- */

    const stats = useMemo(() => {
        if (sessionRecords.length === 0) {
            return {
                total: 0,
                present: 0,
                absent: 0,
                late: 0,
                leftEarly: 0,
                presentPct: 0,
                chartData: []
            };
        }

        const present = sessionRecords.filter(
            a => a.status === ATTENDANCE_STATUS.PRESENT
        ).length;

        const late = sessionRecords.filter(
            a => a.status === ATTENDANCE_STATUS.LATE
        ).length;

        const absent = sessionRecords.filter(
            a => a.status === ATTENDANCE_STATUS.ABSENT
        ).length;

        const leftEarly = sessionRecords.filter(
            a => a.status === ATTENDANCE_STATUS.LEFT_EARLY
        ).length;

        const total = present + late + absent + leftEarly;

        const presentPct =
            total > 0 ? (((present + late) / total) * 100).toFixed(1) : 0;

        return {
            total,
            present,
            late,
            absent,
            leftEarly,
            presentPct,
            chartData: [
                { name: 'Present', value: present },
                { name: 'Late', value: late },
                { name: 'Absent', value: absent },
                ...(leftEarly > 0 ? [{ name: 'Left Early', value: leftEarly }] : [])
            ]
        };
    }, [sessionRecords]);

    /* ---------------- EMPTY STATE ---------------- */

    if (loading) {
        return <div className="p-5 text-center text-muted">Loading report...</div>;
    }

    if (stats.total === 0) {
        return (
            <div className="p-5 text-center text-muted">
                No attendance data available for this session.
            </div>
        );
    }

    /* ---------------- DOWNLOAD ---------------- */

    const handleDownload = () => {
        alert('CSV export will be implemented via backend');
    };

    /* ---------------- RENDER ---------------- */

    return (
        <div className="card border-0 shadow-sm">
            <div className="card-header bg-white border-bottom py-3">
                <div className="d-flex justify-content-between align-items-center">
                    <div>
                        <h4 className="fw-bold mb-1">{context.batchName}</h4>
                        <p className="text-primary small mb-0 fw-medium text-uppercase">{context.courseName}</p>
                    </div>
                    <div className="d-flex gap-2">
                        {!isEditMode ? (
                            <>
                                <button
                                    className="btn btn-primary btn-sm d-flex align-items-center gap-2 px-3"
                                    onClick={() => setIsEditMode(true)}
                                >
                                    <FiEdit2 size={14} /> Correct Records
                                </button>
                                <button
                                    className="btn btn-outline-secondary btn-sm d-flex align-items-center gap-2"
                                    onClick={handleDownload}
                                >
                                    <Download size={16} /> Export CSV
                                </button>
                            </>
                        ) : (
                            <>
                                <button
                                    className="btn btn-success btn-sm d-flex align-items-center gap-2 px-3 shadow-sm"
                                    onClick={async () => {
                                        try {
                                            await attendanceService.saveAttendance(sessionId, sessionRecords);
                                            setIsEditMode(false);
                                            alert("Records updated successfully!");
                                        } catch (e) { alert("Save failed."); }
                                    }}
                                >
                                    <FiSave size={14} /> Save Changes
                                </button>
                                <div className="btn-group btn-group-sm shadow-sm">
                                    <button
                                        className="btn btn-outline-success px-3"
                                        onClick={() => {
                                            if (window.confirm("Mark all students as Present?")) {
                                                setSessionRecords(prev => prev.map(r => ({ ...r, status: 'PRESENT' })));
                                            }
                                        }}
                                    >
                                        Mark All Present
                                    </button>
                                    <button
                                        className="btn btn-outline-danger px-3"
                                        onClick={() => {
                                            if (window.confirm("Mark all students as Absent?")) {
                                                setSessionRecords(prev => prev.map(r => ({ ...r, status: 'ABSENT' })));
                                            }
                                        }}
                                    >
                                        Mark All Absent
                                    </button>
                                </div>
                                <button
                                    className="btn btn-light btn-sm d-flex align-items-center gap-2"
                                    onClick={() => { setIsEditMode(false); window.location.reload(); }}
                                >
                                    <FiX size={14} /> Cancel
                                </button>
                            </>
                        )}
                    </div>
                </div>
            </div>

            <div className="card-body">
                {/* Summary */}
                <div className="row g-4 mb-4">
                    <SummaryCard label="Total" value={stats.total} />
                    <SummaryCard label="Present" value={stats.present} color="success" />
                    <SummaryCard label="Late" value={stats.late} color="warning" />
                    <SummaryCard label="Absent" value={stats.absent} color="danger" />
                </div>

                {/* Chart + Details */}
                <div className="row g-4 align-items-center">
                    <div className="col-md-6" style={{ height: 300 }}>
                        <ResponsiveContainer>
                            <PieChart>
                                <Pie
                                    data={stats.chartData}
                                    innerRadius={60}
                                    outerRadius={90}
                                    paddingAngle={4}
                                    dataKey="value"
                                >
                                    {stats.chartData.map((entry, i) => (
                                        <Cell
                                            key={i}
                                            fill={COLORS[entry.name.toUpperCase().replace(' ', '_')]}
                                        />
                                    ))}
                                </Pie>
                                <Tooltip />
                                <Legend />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>

                    <div className="col-md-6">
                        <h6 className="fw-bold mb-3">Summary</h6>
                        <ul className="list-group list-group-flush">
                            <li className="list-group-item d-flex justify-content-between px-0">
                                <span>
                                    <Clock size={16} className="text-secondary me-2" />
                                    Total Students (Enrolled)
                                </span>
                                <strong>{context.totalEnrolled} Students</strong>
                            </li>
                            <li className="list-group-item d-flex justify-content-between px-0">
                                <span>
                                    <CheckCircle size={16} className="text-success me-2" />
                                    Attendance Rate
                                </span>
                                <strong>{stats.presentPct}%</strong>
                            </li>
                        </ul>
                    </div>

                    {/* Detailed List for Corrections */}
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
                                                    await attendanceService.uploadAttendanceCsv(formData, {
                                                        sessionId: sessionId,
                                                        batchId: context.batchId
                                                    });
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
                                students={sessionRecords.map(r => ({
                                    ...r,
                                    studentId: r.studentId,
                                    name: r.name || r.studentName || `Student ${r.studentId}`,
                                    status: r.status,
                                    remarks: r.remarks || '',
                                    source: r.source || 'OFFLINE'
                                }))}
                                onStatusChange={(id, status) => {
                                    setSessionRecords(prev => prev.map(r =>
                                        String(r.studentId) === String(id) ? { ...r, status } : r
                                    ));
                                }}
                                onRemarkChange={(id, remarks) => {
                                    setSessionRecords(prev => prev.map(r =>
                                        String(r.studentId) === String(id) ? { ...r, remarks } : r
                                    ));
                                }}
                                isEditable={isEditMode}
                            />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

/* ---------------- SMALL HELPER ---------------- */

const SummaryCard = ({ label, value, color }) => (
    <div className="col-md-3">
        <div
            className={`p-3 rounded-3 text-center border ${color ? `bg-${color} bg-opacity-10 border-${color}` : 'bg-light'
                }`}
        >
            <h6 className="text-uppercase small fw-bold text-muted">{label}</h6>
            <h2 className={`fw-bold mb-0 ${color ? `text-${color}` : ''}`}>
                {value}
            </h2>
        </div>
    </div>
);

export default SessionReport;
