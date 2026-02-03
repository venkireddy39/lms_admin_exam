import React, { useEffect, useState } from 'react';
import { Routes, Route, useParams, useNavigate, Navigate } from 'react-router-dom';
import { Users, Camera, QrCode, ListChecks } from 'lucide-react';
import { useAttendanceStore } from '../store/attendanceStore.jsx';
import AttendanceTable from '../components/AttendanceTable.jsx';
import OfflineMarker from '../components/OfflineMarker.jsx';
import SessionReport from '../components/SessionReport.jsx';
import QRPanel from '../components/QRPanel.jsx';
import { attendanceService } from '../services/attendanceService';
import { enrollmentService } from '../../Batches/services/enrollmentService';
import { batchService } from '../../Batches/services/batchService';

/* ---------------- LIVE VIEW ---------------- */

const LiveView = () => {
    const { sessionId } = useParams();
    const navigate = useNavigate();

    const {
        session,
        attendanceList,
        startSession, // Needed to init session
        isSessionLocked,
        stopSession,
        markAttendance
    } = useAttendanceStore();

    const [activeTab, setActiveTab] = useState('MANUAL'); // 'MANUAL' prioritized for offline flow
    const [isOfflineMode, setIsOfflineMode] = useState(false);
    const [pendingChanges, setPendingChanges] = useState(0);
    const [students, setStudents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [contextInfo, setContextInfo] = useState({ batchName: '', lmsSessionId: '' });

    // Sync offline mode with tab
    useEffect(() => {
        setIsOfflineMode(activeTab === 'MANUAL');
    }, [activeTab]);

    // Fetch Session and Students
    useEffect(() => {
        let isMounted = true;

        const fetchContext = async () => {
            // Avoid re-fetching if the store is already in sync with this sessionId and loading is done
            if (String(session.id) === String(sessionId) && students.length > 0) {
                setLoading(false);
                return;
            }

            try {
                console.log(`[SessionDetails] fetchContext triggered for sessionId: ${sessionId}`);

                // 1. Fetch Session Details
                const sessionData = await attendanceService.getSession(sessionId);

                if (!isMounted) return;

                if (sessionData && sessionData.batchId) {
                    // Check if session is already ended/completed and redirect to report if so
                    const st = (sessionData.status || '').toUpperCase();
                    if (st === 'ENDED' || st === 'COMPLETED') {
                        console.log(`[SessionDetails] Session ${sessionId} is ${st}. Redirecting to Report.`);
                        navigate(`../report`, { replace: true });
                        return;
                    }

                    const classId = sessionData.classId || sessionData.sessionId;

                    // 2. Initialize/Sync Store State - Only if needed
                    if (String(session.id) !== String(sessionId)) {
                        startSession(sessionId, classId, 'MANUAL');
                    }

                    // ---------------------------------------------------------
                    // AUTO-CONFIG CHECK: Ensure Config exists or Dashboard crashes
                    // ---------------------------------------------------------
                    const courseId = sessionData.courseId || 1; // Fallback if missing
                    try {
                        await attendanceService.getAttendanceConfig(courseId, sessionData.batchId);
                    } catch (configError) {
                        console.warn("[SessionDetails] Config not found. Creating default...", configError);

                        const defaultConfig = {
                            courseId: courseId,
                            batchId: Number(sessionData.batchId),
                            examEligibilityPercent: 75,
                            atRiskPercent: 60,
                            lateGraceMinutes: 15,
                            minPresenceMinutes: 45,
                            autoAbsentMinutes: 120,
                            earlyExitAction: 'MARK_PARTIAL',
                            allowOffline: true,
                            allowManualOverride: true,
                            requireOverrideReason: true,
                            notifyParents: false,
                            oneDevicePerSession: false, // Less strict for now
                            logIpAddress: false,
                            strictStart: false,
                            qrCodeMode: 'ALWAYS',
                            gracePeriodMinutes: 10,
                            consecutiveAbsenceLimit: 3,
                            // Audit fields
                            createdBy: 1,
                            updatedBy: 1
                        };

                        try {
                            await attendanceService.createAttendanceConfig(defaultConfig);
                            console.log("[SessionDetails] Default config created successfully.");
                        } catch (createErr) {
                            console.error("[SessionDetails] Failed to create default config:", createErr);
                            // We don't block the UI here, but reports might fail later
                        }
                    }
                    // ---------------------------------------------------------

                    // 3. Fetch Batch, Students, AND Existing Attendance in parallel
                    const [batchData, studentsData, existingAttendance] = await Promise.all([
                        batchService.getBatchById(sessionData.batchId).catch(() => null),
                        enrollmentService.getStudentsByBatch(sessionData.batchId),
                        attendanceService.getAttendance(sessionId).catch(e => {
                            console.warn("[SessionDetails] Failed to fetch existing attendance", e);
                            return [];
                        })
                    ]);

                    if (!isMounted) return;

                    setContextInfo({
                        batchName: batchData ? batchData.batchName : `Batch #${sessionData.batchId}`,
                        lmsSessionId: classId
                    });

                    // Hydrate Store with existing records if it's empty
                    if (existingAttendance && existingAttendance.length > 0 && attendanceList.length === 0) {
                        console.log(`[SessionDetails] Hydrating store with ${existingAttendance.length} existing records.`);
                        // We need to push these into the store somehow.
                        // Since markAttendance updates state, we iterates.
                        // BETTER: use a setInitialState logic in store, but iterating is fine for < 100 students.
                        // However, markAttendance might toggle 'synced: false'. We want 'synced: true'.
                        // We'll manually reconstruct the format expected by the store.

                        // We can't easily reach into store state setter from here without exposing a setter.
                        // Hack: We'll cycle through and 'mark' them, then forcefully set synced=true.
                        // OR better: Just map them in the 'students' state logic below and rely on the fact 
                        // that the Store's attendanceList is the "Pending Changes" and the 'existingAttendance' is "Saved State".

                        // ACTUALLY: The UI merges `attendanceList` (pending) over basic student list.
                        // If we don't put them in `attendanceList`, they show as UNMARKED.
                        // So we MUST put them in `attendanceList`.

                        // Let's use `markAttendance` but we need to mark them as synced.
                        // The store exposes `markAsSynced`.

                        existingAttendance.forEach(r => {
                            // Extract Late Minutes from remarks if needed (e.g. "Some remark [Late: 15m]")
                            let lateMins = 0;
                            let cleanRemarks = r.remarks || "";
                            if (cleanRemarks.includes('[Late:')) {
                                const match = cleanRemarks.match(/\[Late:\s*(\d+)m\]/);
                                if (match) {
                                    lateMins = parseInt(match[1], 10);
                                    // Optional: keep remarks as is, or strip the tag. 
                                    // UI adds the tag back on save, so stripping might be safer to avoid duplication if Edited.
                                    // For now, let's leave it, as UI logic handles appending.
                                }
                            }


                            markAttendance(r.studentId, r.status, r.source || 'MANUAL', r.remarks, lateMins, true);
                        });

                        // Set pending to 0 initially since these are hydrated records
                        setPendingChanges(0);
                    }

                    // Map enrollment data to UI student format
                    const mappedStudents = Array.isArray(studentsData) ? studentsData.map(s => ({
                        id: s.studentId,
                        studentId: s.studentId,
                        name: s.studentName || s.name || `Student ${s.studentId}`,
                        email: s.studentEmail || s.email || '',
                        source: 'MANUAL',
                        classId: classId
                    })) : [];

                    setStudents(mappedStudents);
                }
            } catch (error) {
                console.error("[SessionDetails] Failed to load session context", error);
            } finally {
                if (isMounted) setLoading(false);
            }
        };

        if (sessionId) {
            fetchContext();
        }

        return () => { isMounted = false; };
    }, [sessionId, startSession, session.id, students.length]);

    // Helper to get effective attendance status (store vs default)
    const getStudentStatus = (student) => {
        const record = attendanceList.find(r => r.studentId === student.id);
        return {
            status: record ? record.status : 'UNMARKED',
            mode: record ? record.mode : 'OFFLINE', // Default to offline unless marked Online
            remarks: record?.overrideReason || '',
            lateMinutes: record?.lateMinutes || 0
        };
    };

    const handleMarkAll = (status) => {
        // Filter out ONLINE students
        const eligibleStudents = students.filter(s => {
            const { mode } = getStudentStatus(s);
            return mode !== 'ONLINE';
        });

        const onlineCount = students.length - eligibleStudents.length;

        if (eligibleStudents.length === 0) {
            alert("No eligible offline students to mark. (Online students are protected)");
            return;
        }

        if (window.confirm(`Mark ${eligibleStudents.length} students as ${status}?\n(${onlineCount} Online students excluded)`)) {
            eligibleStudents.forEach(student => {
                markAttendance(student.id, status, 'MANUAL');
            });
            setPendingChanges(prev => prev + eligibleStudents.length);
        }
    };

    const handleManualMark = (id, status) => {
        const res = markAttendance(id, status, 'MANUAL');
        if (res.success) {
            setPendingChanges(prev => prev + 1);
        } else {
            alert(res.message);
        }
    };

    const handleLateMinutesChange = (id, minutes) => {
        const current = getStudentStatus({ id });
        // Use existing status (which should be LATE), and update minutes
        const res = markAttendance(id, current.status, 'MANUAL', current.remarks, minutes);
        if (res.success) setPendingChanges(prev => prev + 1);
    };

    const {
        triggerBackendSync,
        syncOfflineData,
        getPendingSyncCount,
        markAsSynced
    } = useAttendanceStore();

    const handleSaveChanges = async () => {
        try {
            // Filter to find only unsynced changes to prevent duplicates
            const unsyncedRecords = attendanceList.filter(r => !r.synced);

            if (unsyncedRecords.length > 0) {
                console.log(`[SessionDetails] Processing ${unsyncedRecords.length} records...`);

                const bulkPayload = unsyncedRecords.map(record => {
                    let finalRemarks = record.remarks || record.overrideReason || "";
                    if (record.status === 'LATE' && record.lateMinutes) {
                        if (!finalRemarks.includes('[Late:')) {
                            finalRemarks = `${finalRemarks} [Late: ${record.lateMinutes}m]`.trim();
                        }
                    }
                    return {
                        id: record.id, // Important: pass ID if exists to enable UPDATE
                        studentId: record.studentId,
                        status: record.status,
                        remarks: finalRemarks,
                        source: record.source || 'MANUAL',
                        attendanceDate: new Date().toISOString().split('T')[0]
                    };
                });

                // DIRECT ONLINE SAVE
                // We use our smart saveAttendance which now handles deduplication/updates correctly
                let saveSuccess = false;
                try {
                    await attendanceService.saveAttendance(sessionId, bulkPayload);
                    console.log("[SessionDetails] Direct online save successful.");
                    saveSuccess = true;
                } catch (err) {
                    console.error("[SessionDetails] Online save failed, trying offline queue.", err);
                }

                if (!saveSuccess) {
                    // FALLBACK: Offline Queue (slow, loop)
                    for (const record of unsyncedRecords) {
                        let finalRemarks = bulkPayload.find(p => p.studentId === record.studentId)?.remarks || "";
                        await attendanceService.saveToOfflineQueue({
                            sessionId: session.classId || contextInfo.lmsSessionId,
                            attendanceSessionId: sessionId,
                            batchId: session.batchId || session.id,
                            studentId: record.studentId,
                            status: record.status,
                            remarks: finalRemarks
                        });
                    }
                    // Force sync attempt
                    await triggerBackendSync();
                }

                // Mark as synced locally
                markAsSynced(unsyncedRecords.map(r => r.studentId));
            } else {
                console.log("[SessionDetails] No new changes to save.");
            }

            // Sync any other pending offline data
            if (getPendingSyncCount() > 0) {
                await syncOfflineData();
                await triggerBackendSync();
            }

            setPendingChanges(0);
            alert('Attendance saved successfully!');

        } catch (error) {
            console.error("Failed to save attendance", error);
            alert("Save failed. Please try again.");
        }
    };

    // Guard: wait for session to exist AND match the current URL context
    if (loading || !session.id || String(session.id) !== String(sessionId)) {
        return (
            <div className="p-5 text-center text-muted">
                <div className="spinner-border spinner-border-sm me-2 text-primary" role="status"></div>
                Synchronizing attendance session...
            </div>
        );
    }

    // Redirect if session is locked/ended
    // Only check if we have an active session in context
    if (isSessionLocked()) {
        return <Navigate to={`/attendance/sessions/${sessionId}/report`} replace />;
    }

    return (
        <div className="fade-in pb-5">
            {/* Top Tracker / Header */}
            <div className="mb-4 d-flex flex-wrap gap-3 justify-content-between align-items-center bg-white p-3 rounded shadow-sm border">
                <div>
                    <h4 className="m-0 fw-bold">Live Session: {contextInfo.batchName}</h4>
                    <div className="d-flex align-items-center gap-3 mt-1">
                        <span className="text-secondary small fw-bold">LMS Class ID: {contextInfo.lmsSessionId}</span>
                        <span className="badge bg-success bg-opacity-10 text-success">Active</span>
                        {pendingChanges > 0 && (
                            <span className="badge bg-warning text-dark animate-pulse ms-2">
                                {pendingChanges} Unsaved Changes
                            </span>
                        )}
                    </div>
                </div>
                <div className="d-flex gap-2">
                    {pendingChanges > 0 && (
                        <button
                            className="btn btn-primary btn-sm px-4"
                            onClick={handleSaveChanges}
                        >
                            Save Changes
                        </button>
                    )}
                    <button
                        className="btn btn-danger btn-sm px-4"
                        disabled={pendingChanges > 0}
                        title={pendingChanges > 0 ? "Save changes before ending session" : ""}
                        onClick={() => {
                            if (window.confirm('End Session? This will finalize all records.')) {
                                stopSession();
                                navigate(`/attendance/sessions/${sessionId}/report`);
                            }
                        }}
                    >
                        End Session
                    </button>
                </div>
            </div>

            <div className="row g-4">
                <div className="col-12">
                    <div className="card border-0 shadow-sm h-100">
                        <div className="card-header bg-white py-3 border-bottom d-flex justify-content-between align-items-center flex-wrap gap-3">
                            <div className="d-flex align-items-center gap-3">
                                <h5 className="mb-0 fw-bold">Master Attendance List</h5>
                                <span className="badge bg-light text-secondary border">
                                    {students.length} Students
                                </span>
                            </div>

                            <div className="d-flex gap-2 align-items-center">
                                <div className="d-flex gap-2" style={{ minWidth: 'fit-content' }}>
                                    <button
                                        className="btn btn-outline-success btn-sm text-nowrap d-flex align-items-center gap-1"
                                        onClick={() => handleMarkAll('PRESENT')}
                                        title="Mark all eligible offline students as Present"
                                    >
                                        <i className="bi bi-check-all"></i> Mark All Present
                                    </button>
                                    <button
                                        className="btn btn-outline-danger btn-sm text-nowrap d-flex align-items-center gap-1"
                                        onClick={() => handleMarkAll('ABSENT')}
                                        title="Mark all eligible offline students as Absent"
                                    >
                                        <i className="bi bi-x-circle"></i> Mark All Absent
                                    </button>
                                </div>
                            </div>
                        </div>

                        <div className="px-3 pt-3">
                            <OfflineMarker isActive={true} />
                        </div>

                        <div className="card-body p-0">
                            <AttendanceTable
                                students={students.map(s => {
                                    const { status, remarks, mode, lateMinutes } = getStudentStatus(s);
                                    return {
                                        ...s,
                                        studentId: s.id,
                                        status,
                                        source: mode, // AttendanceTable expects 'source'
                                        remarks,
                                        lateMinutes
                                    };
                                })}
                                onStatusChange={handleManualMark}
                                onRemarkChange={(id, val) => {
                                    const current = getStudentStatus({ id });
                                    const res = markAttendance(id, current.status, 'MANUAL', val, current.lateMinutes);
                                    if (res.success) setPendingChanges(prev => prev + 1);
                                }}
                                onLateMinutesChange={handleLateMinutesChange}
                                isEditable={true}
                            />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

/* ---------------- REPORT VIEW ---------------- */

const ReportView = () => {
    const { sessionId } = useParams();

    return (
        <div className="fade-in">
            <div className="mb-4 d-flex justify-content-between align-items-center">
                <div>
                    <h4 className="fw-bold m-0">Session Final Report</h4>
                    <p className="text-muted m-0 small">ID: {sessionId}</p>
                </div>
            </div>
            <SessionReport sessionId={sessionId} />
        </div>
    );
};

/* ---------------- END HANDLER ---------------- */

const EndSessionHandler = () => {
    const { sessionId } = useParams();
    const navigate = useNavigate();
    const { stopSession } = useAttendanceStore();

    useEffect(() => {
        const confirmEnd = window.confirm("Are you sure you want to end this session?");
        if (confirmEnd) {
            stopSession();
            navigate(`../report`, { replace: true });
        } else {
            navigate(`../live`, { replace: true });
        }
    }, [sessionId, stopSession, navigate]);

    return <div className="p-5 text-center">Processing...</div>;
};

/* ---------------- ROUTER ---------------- */

const SessionDetails = () => {
    return (
        <Routes>
            <Route index element={<Navigate to="live" replace />} />
            <Route path="live" element={<LiveView />} />
            <Route path="end" element={<EndSessionHandler />} />
            <Route path="report" element={<ReportView />} />
        </Routes>
    );
};

export default SessionDetails;
