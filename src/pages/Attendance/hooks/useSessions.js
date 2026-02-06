import { useState, useEffect, useCallback } from 'react';
import { attendanceService } from '../services/attendanceService';
import { batchService } from '../../Batches/services/batchService';
import { enrollmentService } from '../../Batches/services/enrollmentService';
import { sessionService } from '../../Batches/services/sessionService';

// --- HELPERS ---

// Helper: Fetch scheduled academic sessions for all batches for a specific date
const fetchAllAcademicSessions = async (batches, dateStr) => {
    if (!batches || batches.length === 0) {
        console.warn("[useSessions] No batches available to fetch academic sessions.");
        return [];
    }

    try {
        console.log(`[useSessions] Fetching academic sessions for ${batches.length} batches on ${dateStr}`);

        // Use allSettled to ensure one bad batch doesn't kill the whole process
        const results = await Promise.allSettled(
            batches.map(b => sessionService.getSessionsByBatchId(b.batchId))
        );

        const flat = [];
        results.forEach((res, index) => {
            if (res.status === 'fulfilled' && Array.isArray(res.value)) {
                flat.push(...res.value);
            } else {
                console.warn(`[useSessions] Failed to fetch sessions for batch ${batches[index]?.batchId}`, res.reason || "Invalid format");
            }
        });

        console.log(`[useSessions] Total raw academic sessions found: ${flat.length}`);

        // Filter by date
        const filtered = flat.filter(s => {
            // Check various date fields
            let d = s.date || s.sessionDate || s.scheduleDate || s.startDate || s.start_date || s.attendanceDate;

            if (!d) {
                // Formatting fallback: try to find ANYTHING that looks like a date
                // console.log("No date found in session:", s); 
                return false;
            }

            // Handle Java LocalDate Array [YYYY, MM, DD]
            if (Array.isArray(d)) {
                const [y, m, day] = d;
                d = `${y}-${String(m).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
            }

            // Handle string "YYYY-MM-DD" or ISO with T
            if (typeof d === 'string' && d.includes('T')) {
                d = d.split('T')[0];
            }

            // Normalize DateStr (just in case user passes full ISO)
            const target = dateStr.includes('T') ? dateStr.split('T')[0] : dateStr;

            // Direct string comparison or StartTime startsWith (for YYYY-MM-DD start times)
            const dateMatch = d === target;
            const startMatch = (s.startTime && String(s.startTime).startsWith(target));

            return dateMatch || startMatch;
        });

        console.log(`[useSessions] Sessions matching date ${dateStr}: ${filtered.length}`);
        return filtered;
    } catch (e) {
        console.error("Failed to fetch academic sessions", e);
        return [];
    }
};

// Helper: Hydrate attendance sessions with missing duration AND student count
const hydrateWithDetails = async (sessions) => {
    if (!sessions || !Array.isArray(sessions) || sessions.length === 0) return [];

    const candidates = sessions.map(async (s) => {
        const sId = s.id || s.attendanceSessionId;
        if (!sId) return s;

        // 1. Hydrate Duration (existing logic)
        const status = (s.status || '').toUpperCase();
        const isActive = status === 'ACTIVE' || status === 'LIVE';
        const needsDuration = isActive && !s.endTime && !s.duration && (s.classId || s.sessionId);

        // 2. Hydrate Student Count (Agreessive check for "Real Data")
        // We always try to refresh count if it's 0 or missing, to ensure "Real Data"
        let updatedS = { ...s };

        if (true) { // Always hydrate for real data
            try {
                // Fetch specific attendance session details
                // This gives us the 'records' array or pre-calculated counts
                const fullAttSession = await attendanceService.getSession(sId).catch(() => null);

                if (fullAttSession) {
                    // Normalize records
                    let records = fullAttSession.records;

                    // If records missing in getSession, try fetching them explicitly
                    if (!records || records.length === 0) {
                        records = await attendanceService.getAttendance(sId).catch(() => []);
                    }

                    if (records && Array.isArray(records) && records.length > 0) {
                        const presentOnes = records.filter(r =>
                            ['PRESENT', 'LATE', 'PARTIAL', 'HALF_DAY'].includes((r.status || '').toUpperCase())
                        );
                        updatedS.presentCount = presentOnes.length;
                        updatedS.records = records;
                        console.log(`[useSessions] Hydrated session ${sId}: ${presentOnes.length} present out of ${records.length} records.`);
                    } else {
                        // Fallback to pre-calculated fields if no records array
                        const freshCount = fullAttSession.presentCount ?? fullAttSession.attendanceCount ?? fullAttSession.totalStudents ?? 0;
                        updatedS.presentCount = freshCount;
                    }

                    // Also sync other fields
                    updatedS.batchId = updatedS.batchId || fullAttSession.batchId;
                    updatedS.courseId = updatedS.courseId || fullAttSession.courseId;
                }

                // Academic details for duration
                if (needsDuration) {
                    const acadId = s.classId || s.sessionId;
                    if (acadId) {
                        const acadDetails = await sessionService.getSessionById(acadId).catch(() => null);
                        if (acadDetails) {
                            const foundDuration = acadDetails.duration || acadDetails.durationMinutes || acadDetails.length || acadDetails.sessionDuration || 60;
                            updatedS.duration = foundDuration;
                            updatedS.title = acadDetails.sessionName || acadDetails.title || s.title || s.sessionName;
                        }
                    }
                }
            } catch (e) {
                console.error(`[useSessions] Failed to hydrate session ${sId}`, e);
            }
        }
        return updatedS;
    });

    return await Promise.all(candidates);
};

// Helper: Map ANY session (Attendance or Academic) to UI model
const mapSessionToUI = (s, batchMap, isDataFromAttendanceApi) => {
    // Lookup Batch Info
    let batchInfo = batchMap.get(String(s.batchId));
    if (!batchInfo) {
        batchInfo = batchMap.get(Number(s.batchId));
    }

    // 1. Unify Data Fields
    let uiDate = s.attendanceDate || s.date || s.startDate;

    // If no explicit date field, but we have startedAt (ISO), extract date from it
    if (!uiDate && s.startedAt) {
        if (typeof s.startedAt === 'string' && s.startedAt.includes('T')) {
            uiDate = s.startedAt.split('T')[0];
        }
    }

    if (!uiDate) {
        uiDate = new Date().toISOString().split('T')[0];
    }

    const uiStartTime = s.startTime || (s.startedAt ? String(s.startedAt).split('T')[1]?.substring(0, 5) : null);

    // Duration: Prioritize explicit minutes, fallback to 60 for ALL sessions if missing
    let dur = s.duration || s.sessionDuration || s.durationMinutes || s.length;
    // Simplify duration parsing if it's a string like "1h" OR just ensure number
    if (typeof dur === 'string') {
        let clean = dur.toLowerCase().replace(/[()]/g, '');
        let mins = 0;
        let h = clean.match(/(\d+)\s*h/);
        let m = clean.match(/(\d+)\s*m/);
        if (h) mins += parseInt(h[1]) * 60;
        if (m) mins += parseInt(m[1]);
        if (!h && !m) mins = parseFloat(clean);
        dur = isNaN(mins) ? 0 : mins;
    }

    if (!dur) dur = 60; // Universal default to ensure end-time calculation works

    // 2. Calculate End Time & Over Status & Running Status
    let finalEndTime = s.endTime || s.endedAt || s.scheduledEndTime;

    // Sanitize finalEndTime: Must be HH:MM format due to backend potentially sending "Ongoing" literal
    // If it's a full ISO timestamp, extract time
    if (finalEndTime && String(finalEndTime).includes('T')) {
        finalEndTime = String(finalEndTime).split('T')[1].substring(0, 5);
    }
    // If it's invalid or "Ongoing", nullify it so we can calculate it
    if (finalEndTime && !String(finalEndTime).match(/^\d{1,2}:\d{2}/)) {
        finalEndTime = null;
    }

    let isOver = false;
    let isRunning = false;
    const now = new Date();

    // Construct Date Objects for precise comparison
    let dateStr = uiDate;
    if (Array.isArray(uiDate)) {
        const [y, m, d] = uiDate;
        dateStr = `${y}-${String(m).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
    } else if (String(uiDate).includes('T')) {
        dateStr = String(uiDate).split('T')[0];
    } else if (!dateStr) {
        dateStr = new Date().toISOString().split('T')[0];
    }

    if (uiStartTime) {
        const sessionStart = new Date(`${dateStr}T${uiStartTime}`);
        let sessionEnd = null;

        // If we have an explicit finalEndTime (like real endedAt from backend), use it
        // BUT strict rule: if dates are past, we assume it's ended.
        if (finalEndTime) {
            sessionEnd = new Date(`${dateStr}T${finalEndTime}`);
        } else {
            // Calculate: Add (dur) minutes to start
            sessionEnd = new Date(sessionStart.getTime() + (dur * 60000));

            // Generate HH:MM string for display
            const dh = sessionEnd.getHours();
            const dm = sessionEnd.getMinutes();
            finalEndTime = `${String(dh).padStart(2, '0')}:${String(dm).padStart(2, '0')}`;
        }

        // Check Status
        if (now > sessionEnd) isOver = true;
        else if (now >= sessionStart && now <= sessionEnd) isRunning = true;

        // Handling midnight crossing logic (simplified)
        if (sessionEnd < sessionStart) {
            sessionEnd.setDate(sessionEnd.getDate() + 1);
            if (now > sessionEnd) isOver = true;
        }

    } else {
        // Fallback: If no time, assume end of day passed if date is past
        const todayStr = now.toISOString().split('T')[0];
        if (dateStr < todayStr) isOver = true;
    }


    // Backend Status Normalization
    if (isDataFromAttendanceApi && (status === 'ACTIVE' || status === 'LIVE')) {
        status = 'LIVE';
        // isOver = false; // User requested strict time adherence: if time is up, it ends.
    }

    if (status === 'ENDED' || status === 'COMPLETED') {
        isOver = true;
        status = 'COMPLETED';
    }

    if (isOver) {
        // Force visual status to COMPLETED if it's over, 
        // regardless of whether it's Academic or Attendance source
        status = 'COMPLETED';
    } else if (isRunning && !isDataFromAttendanceApi) {
        // Only infer LIVE for academic sessions. 
        // For attendance, we trust the "LIVE" status from backend (unless isOver)
        status = 'LIVE';
    }

    // Normalize ID
    const uiId = isDataFromAttendanceApi ? s.id : (s.sessionId || s.id);
    const uniqueKey = isDataFromAttendanceApi ? `att-${uiId}` : `acad-${uiId}`;

    // Student Count Logic
    // Goal: Show "X Attended" (Present + Late), not just total records (which might include Absent)
    let studentCount = 0;

    if (isDataFromAttendanceApi) {
        // ALWAYS prioritize calculation from records if they exist (Most accurate)
        if (s.records && Array.isArray(s.records)) {
            const attended = s.records.filter(r =>
                ['PRESENT', 'LATE', 'PARTIAL', 'HALF_DAY'].includes((r.status || '').toUpperCase())
            );
            studentCount = attended.length;
        } else {
            // Fallback to pre-calculated fields
            studentCount = s.presentCount ?? s.attendanceCount ?? s.studentCount ?? s.totalStudents ?? 0;
        }
    }

    return {
        id: uiId,
        uid: uniqueKey,
        isAttendance: isDataFromAttendanceApi,
        title: s.title || s.sessionName || s.topicName || s.subjectName || `Session #${uiId}`,
        batchName: s.batchName || batchInfo?.batchName || `Batch #${s.batchId}`,
        courseName: s.courseName || batchInfo?.courseName || `Course #${s.courseId}`,
        date: dateStr,
        startTime: uiStartTime || '--:--',
        endTime: finalEndTime || 'Ongoing',
        students: studentCount,
        status: status,
        classId: s.classId || s.sessionId || s.id,
        courseId: s.courseId,
        batchId: s.batchId,
        isOver: isOver
    };
};

// Shared Logic to Fetch & Merge
const loadSessionsAndMerge = async (dateStr) => {
    // 1. Fetch Parallel with Settlement (Fail-Safe)
    const results = await Promise.allSettled([
        attendanceService.getSessions(null, dateStr),
        batchService.getAllBatches().catch(() => [])
    ]);

    const attSessions = results[0].status === 'fulfilled' ? (results[0].value || []) : [];
    const allBatches = results[1].status === 'fulfilled' ? (results[1].value || []) : [];

    if (results[0].status === 'rejected') console.error("Attendance API Failed:", results[0].reason);
    if (results[1].status === 'rejected') console.error("Batches API Failed:", results[1].reason);

    // 2. Fetch Academic Sessions (The "Missing" ones)
    const acadSessions = await fetchAllAcademicSessions(allBatches, dateStr);

    // 3. Hydrate Attendance Sessions
    const hydratedAtt = await hydrateWithDetails(attSessions);

    const batchMap = new Map(allBatches.map(b => [String(b.batchId), b]));

    // 4. Map Attendance Sessions to UI
    const uiAttSessions = hydratedAtt.map(s => mapSessionToUI(s, batchMap, true));

    // 5. Map Academic Sessions to UI & Filter Duplicates
    // Create a Set of "Covered" classIds from attendance sessions (normalize to String)
    const coveredClassIds = new Set(uiAttSessions.map(u => String(u.classId)));

    const uiAcadSessions = acadSessions.map(s => mapSessionToUI(s, batchMap, false));

    // Keep only academic sessions that DON't have a corresponding attendance record
    // Check strict string quality on IDs
    const uniqueAcadSessions = uiAcadSessions.filter(u => !coveredClassIds.has(String(u.classId)));

    // 6. Return Combined
    return [...uiAttSessions, ...uniqueAcadSessions];
};


// --- HOOKS ---

export const useLiveSessions = () => {
    const [liveSessions, setLiveSessions] = useState([]);
    const [loading, setLoading] = useState(false);

    const loadLiveSessions = useCallback(async () => {
        setLoading(true);
        try {
            const today = new Date().toISOString().split('T')[0];
            const allSessions = await loadSessionsAndMerge(today);

            // Filter: (Status LIVE) OR (Status SCHEDULED/ACTIVE + Not Over)
            const live = allSessions.filter(s => {
                const st = s.status;
                if (st === 'LIVE' || st === 'ACTIVE') return !s.isOver;
                // Academic "LIVE" (Running) sessions should definitely be kept
                if (st === 'SCHEDULED' || st === 'ONGOING') return !s.isOver;
                return false;
            });

            setLiveSessions(live);
        } catch (error) {
            console.error("Failed to load live sessions", error);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        loadLiveSessions();
    }, [loadLiveSessions]);

    return { liveSessions, loading, refreshLive: loadLiveSessions };
};

export const useEndedSessions = (filterDate) => {
    const [endedSessions, setEndedSessions] = useState([]);
    const [loading, setLoading] = useState(false);

    const loadEnded = useCallback(async () => {
        setLoading(true);
        try {
            const allSessions = await loadSessionsAndMerge(filterDate);

            // Filter: (Status ENDED or COMPLETED) OR (Any Status + isOver)
            const ended = allSessions.filter(s => {
                const st = (s.status || '').toUpperCase();

                // Explicit Status
                if (st === 'ENDED' || st === 'COMPLETED') return true;

                // Implicit Status (Time Based)
                // If the session date is strictly in the past (before today), it MUST be considered ended
                const today = new Date().toISOString().split('T')[0];
                const sessionDate = s.date || s.sessionDate || s.startDate || s.attendanceDate;

                // Normalize date string for comparison
                let sDateStr = sessionDate;
                if (Array.isArray(sessionDate)) {
                    const [y, m, d] = sessionDate;
                    sDateStr = `${y}-${String(m).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
                } else if (typeof sessionDate === 'string' && sessionDate.includes('T')) {
                    sDateStr = sessionDate.split('T')[0];
                }

                // If date exists and is BEFORE today, it's ended.
                if (sDateStr && sDateStr < today) {
                    return true;
                }

                if (s.isOver) return true;

                return false;
            });

            console.log(`[useEndedSessions] Date: ${filterDate}, Found: ${ended.length} ended sessions.`);
            if (ended.length === 0 && allSessions.length > 0) {
                console.log("[useEndedSessions] All found sessions were filtered out. Sample status:", allSessions[0].status, "isOver:", allSessions[0].isOver);
            }

            setEndedSessions(ended);

        } catch (error) {
            console.error("Failed to fetch ended sessions", error);
        } finally {
            setLoading(false);
        }
    }, [filterDate]);

    useEffect(() => {
        loadEnded();
    }, [loadEnded]);

    return { endedSessions, loading, refreshEnded: loadEnded };
};

export const useDashboardStats = (liveSessions, pendingSyncCount) => {
    const [stats, setStats] = useState({
        ongoingLive: 0,
        pendingSync: 0,
        absentCount: 0,
        totalStudents: 0
    });

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const today = new Date().toISOString().split('T')[0];

                // 1. Fetch data in parallel
                const [enrollments, allTodaySessions, batches] = await Promise.all([
                    enrollmentService.getAllEnrollments().catch(() => []),
                    loadSessionsAndMerge(today).catch(() => []),
                    batchService.getAllBatches().catch(() => [])
                ]);

                // 2. Map real batch sizes from enrollments (Most accurate way to get "Real Data")
                const batchMap = new Map();
                enrollments.forEach(e => {
                    const status = String(e.status || 'ACTIVE').toUpperCase();
                    // Include any active student who hasn't been removed/dropped
                    if (!['TRANSFERRED', 'DROPPED', 'INACTIVE', 'COMPLETED'].includes(status)) {
                        const bId = e.batchId || (e.batch && (e.batch.batchId || e.batch.id));
                        if (bId) {
                            const sBId = String(bId);
                            batchMap.set(sBId, (batchMap.get(sBId) || 0) + 1);
                        }
                    }
                });

                console.log(`[useDashboardStats] Real Enrollment Count: ${enrollments.length}`);
                console.log(`[useDashboardStats] Batch Capacities Map:`, Object.fromEntries(batchMap));

                // 3. Calculate Stats for today
                let totalAbsentToday = 0;
                let completedCount = 0;

                // Only consider sessions where attendance was actually taken
                const attSessions = allTodaySessions.filter(s => s.isAttendance);
                console.log(`[useDashboardStats] Analyzing ${attSessions.length} attendance sessions for stats.`);

                attSessions.forEach(s => {
                    const sBId = String(s.batchId);
                    const batchSize = batchMap.get(sBId) || 0;
                    const presentCount = s.students || 0;

                    if (batchSize > 0) {
                        const absents = Math.max(0, batchSize - presentCount);
                        totalAbsentToday += absents;
                        console.log(` -> Session ${s.id} (Batch ${sBId}): BatchSize=${batchSize}, Present=${presentCount} => Absents=${absents}`);
                    } else {
                        console.warn(` -> Session ${s.id} has unknown/0 batch size for batchId ${sBId}`);
                    }

                    if (s.status === 'COMPLETED' || s.status === 'ENDED') {
                        completedCount++;
                    }
                });

                setStats({
                    ongoingLive: liveSessions.length,
                    pendingSync: pendingSyncCount || 0,
                    absentCount: totalAbsentToday,
                    completedToday: completedCount,
                    totalStudents: enrollments.length || 0,
                    avgPresentPct: 0
                });
            } catch (e) {
                console.error("Dashboard stats error:", e);
                setStats(curr => ({ ...curr, ongoingLive: liveSessions.length, pendingSync: pendingSyncCount }));
            }
        };
        fetchStats();
    }, [liveSessions.length, pendingSyncCount]);

    return stats;
};
