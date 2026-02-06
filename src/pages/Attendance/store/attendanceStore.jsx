import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import { generateSessionToken } from '../utils/qrTimer';
import { attendanceService } from '../services/attendanceService';

const AttendanceContext = createContext();

export const AttendanceProvider = ({ children }) => {
    const [session, setSession] = useState({
        id: null,       // Attendance Session ID (from API)
        classId: null,  // LMS Academic Session ID
        status: 'IDLE', // IDLE, LIVE, ENDED
        mode: null,     // QR, MANUAL
        qrData: null,   // { token, expiresAt }
        settings: {
            expiryMinutes: 1,
            autoRefresh: true
        }
    });

    const [attendanceList, setAttendanceList] = useState([]);

    // Auto-refresh logic (Mocking the "QR auto-refreshes" requirement)
    useEffect(() => {
        let interval;
        if (session.status === 'LIVE' && session.mode === 'QR' && session.settings.autoRefresh) {
            interval = setInterval(() => {
                const timeLeft = session.qrData ? session.qrData.expiresAt - Date.now() : 0;
                if (timeLeft <= 0) {
                    refreshQR();
                }
            }, 1000);
        }
        return () => clearInterval(interval);
    }, [session.status, session.mode, session.qrData, session.settings]);

    // --- Session Lock Logic ---

    // Helper to check if session is locked
    const isSessionLocked = useCallback(() => {
        // Only consider the session locked if it's explicitly ended or missing
        const st = (session.status || '').toUpperCase();
        if (!session.id || st === 'ENDED' || st === 'COMPLETED') return true;

        // If it's LIVE, never consider it locked regardless of client time
        if (st === 'LIVE' || st === 'ACTIVE') return false;

        // Fallback for scheduled but un-started sessions
        if (session.endTime && Date.now() > session.endTime) return true;
        return false;
    }, [session.id, session.endTime, session.status]);

    const startSession = useCallback((attendanceSessionId, classId, mode = 'QR', expiryMinutes = 5, durationMinutes = 60) => {
        console.log(`[attendanceStore] Initializing store with attendanceSessionId: ${attendanceSessionId}, classId: ${classId}`);
        const qrData = generateSessionToken(attendanceSessionId, expiryMinutes);
        const startTime = Date.now();
        const endTime = startTime + durationMinutes * 60 * 1000;

        setSession({
            id: attendanceSessionId,
            classId: classId,
            status: 'LIVE',
            mode,
            qrData,
            startTime,
            endTime,
            settings: {
                expiryMinutes,
                autoRefresh: true
            }
        });
        setAttendanceList([]);
    }, []);

    const stopSession = useCallback(async () => {
        console.log("[attendanceStore] Stopping session", session.id);

        // 1. Call backend to persist ended_at in database
        if (session.id) {
            try {
                await attendanceService.endSession(session.id);
                console.log("[attendanceStore] Session ended in backend successfully");
            } catch (error) {
                console.error("[attendanceStore] Failed to end session in backend", error);
            }
        }

        // 2. Update local state
        setSession(prev => ({ ...prev, status: 'ENDED', qrData: null }));
    }, [session.id]);

    const refreshQR = useCallback(() => {
        if (!session.id) return;
        const qrData = generateSessionToken(session.id, session.settings.expiryMinutes);
        setSession(prev => ({ ...prev, qrData }));
    }, [session.id, session.settings.expiryMinutes]);

    // --- Offline Logic ---

    const queueOfflineAttendance = useCallback((studentId, status = 'PRESENT', customDate = null, customSessionId = null, metadata = {}) => {
        const record = {
            id: crypto.randomUUID(),
            attendanceSessionId: customSessionId || session.id || 'OFFLINE_SESSION',
            classId: session.classId,
            studentId,
            status,
            synced: false,
            timestamp: customDate ? new Date(customDate).toISOString() : new Date().toISOString(),
            ...metadata
        };

        const stored = JSON.parse(localStorage.getItem('offline_attendance') || '[]');
        stored.push(record);
        localStorage.setItem('offline_attendance', JSON.stringify(stored));

        return record;
    }, [session.id, session.classId]);

    const getPendingSyncCount = useCallback(() => {
        const stored = JSON.parse(localStorage.getItem('offline_attendance') || '[]');
        return stored.length;
    }, []);

    const getModeFromSource = useCallback((source) => {
        const onlineSources = ['QR', 'FACE', 'STUDENT_SELF', 'ONLINE'];
        return onlineSources.includes(source) ? 'ONLINE' : 'OFFLINE';
    }, []);

    // Implement real sync logic using attendanceService's offline queue
    const syncOfflineData = useCallback(async () => {
        const stored = JSON.parse(localStorage.getItem('offline_attendance') || '[]');
        if (stored.length === 0) return { count: 0 };

        console.log(`[attendanceStore] Syncing ${stored.length} offline records to backend queue...`);
        let syncedCount = 0;

        try {
            for (const record of stored) {
                try {
                    await attendanceService.saveToOfflineQueue({
                        sessionId: record.attendanceSessionId,
                        batchId: record.batchId || session.id, // Fallback to current session ID if batchId missing
                        studentId: record.studentId,
                        status: record.status,
                        remarks: record.remarks || ''
                    });
                    syncedCount++;
                } catch (err) {
                    console.error(`Failed to push record for student ${record.studentId} to offline queue`, err);
                }
            }

            // If we pushed everything, clear local storage
            if (syncedCount === stored.length) {
                localStorage.removeItem('offline_attendance');
            } else if (syncedCount > 0) {
                const remaining = stored.slice(syncedCount);
                localStorage.setItem('offline_attendance', JSON.stringify(remaining));
            }

            return { count: syncedCount };
        } catch (error) {
            console.error("Sync to backend queue failed:", error);
            return { count: 0 };
        }
    }, [session.id]);

    // Trigger the backend to move records from offline-queue to attendance_record
    const triggerBackendSync = useCallback(async () => {
        try {
            console.log("[attendanceStore] Triggering backend sync...");
            await attendanceService.syncOfflineQueue();
            return { success: true };
        } catch (error) {
            console.error("[attendanceStore] Backend sync failed:", error);
            return { success: false, error };
        }
    }, []);

    const clearOfflineQueue = useCallback(() => {
        localStorage.removeItem('offline_attendance');
    }, []);

    const markAttendance = useCallback((studentId, status = 'PRESENT', source = 'MANUAL', overrideReason = null, lateMinutes = null, synced = false) => {
        // Session Lock Check
        if (isSessionLocked()) {
            if (source === 'QR' || source === 'STUDENT_SELF') {
                return { success: false, message: 'Session is LOCKED. Cannot mark attendance.' };
            }
        }

        // Conflict Guard: Check against current state
        const existingRecord = attendanceList.find(a => a.studentId === studentId);
        if (existingRecord && existingRecord.mode === 'ONLINE' && source === 'MANUAL') {
            return { success: false, message: 'Attendance auto-managed for online participants' };
        }

        const mode = getModeFromSource(source);

        setAttendanceList(prev => {
            const existingIndex = prev.findIndex(a => a.studentId === studentId);
            const newRecord = {
                attendanceSessionId: session.id,
                classId: session.classId,
                studentId,
                timestamp: new Date().toISOString(),
                source,
                mode,
                status,
                overrideReason,
                lateMinutes
            };

            if (existingIndex >= 0) {
                const updated = [...prev];
                // For updates, we usually want synced=false unless explicitly told (hydration)
                // If we are hydrating (synced=true), we respect it. 
                // If it's a manual user edit, synced is false.
                updated[existingIndex] = { ...updated[existingIndex], ...newRecord, synced: synced };
                return updated;
            } else {
                return [{ ...newRecord, synced: synced }, ...prev];
            }
        });
        return { success: true };
    }, [isSessionLocked, attendanceList, getModeFromSource, session.id, session.classId]);

    const markAsSynced = useCallback((studentIds) => {
        setAttendanceList(prev => prev.map(record =>
            studentIds.includes(record.studentId)
                ? { ...record, synced: true }
                : record
        ));
    }, []);

    // --- exposure ---

    const value = useMemo(() => ({
        session,
        attendanceList,
        startSession,
        stopSession,
        refreshQR,
        markAttendance,
        markAsSynced, // Added
        queueOfflineAttendance,
        syncOfflineData,
        triggerBackendSync,
        clearOfflineQueue,
        getPendingSyncCount,
        isSessionLocked
    }), [
        session,
        attendanceList,
        startSession,
        stopSession,
        refreshQR,
        markAttendance,
        markAsSynced, // Added
        queueOfflineAttendance,
        syncOfflineData,
        triggerBackendSync,
        clearOfflineQueue,
        getPendingSyncCount,
        isSessionLocked
    ]);

    return (
        <AttendanceContext.Provider value={value}>
            {children}
        </AttendanceContext.Provider>
    );
};

export const useAttendanceStore = () => {
    const context = useContext(AttendanceContext);
    if (!context) {
        throw new Error('useAttendanceStore must be used within an AttendanceProvider');
    }
    return context;
};
