import { courseService } from "../../Courses/services/courseService";
import { batchService } from "../../Batches/services/batchService";
import { enrollmentService } from "../../Batches/services/enrollmentService";
import { sessionService } from "../../Batches/services/sessionService";
import { apiFetch } from "../../../services/api";

const API_BASE_URL = "/api";

export const attendanceService = {
    // ------------------------------------------
    // GENERIC (Assumed existing on target backend)
    // ------------------------------------------

    // Get all courses
    getCourses: () => courseService.getCourses(),

    // Get batches for a course
    getBatches: (courseId) => batchService.getBatchesByCourseId(courseId),

    // Get students for a batch
    getStudents: (batchId) => enrollmentService.getStudentsByBatch(batchId),

    // Get academic sessions (Classes) for a batch
    getAcademicSessions: async (batchId) => {
        const data = await sessionService.getSessionsByBatchId(batchId);
        return (data || []).map(s => ({
            ...s,
            classId: s.classId || s.sessionId // Normalize property name
        }));
    },

    // ------------------------------------------
    // ATTENDANCE SESSION CONTROLLER
    // ------------------------------------------

    // Get sessions with optional batch and date filters
    getSessions: async (batchId, date) => {
        const effectiveDate = date || new Date().toISOString().split('T')[0];
        const url = `${API_BASE_URL}/attendance/session/date/${effectiveDate}`;

        try {
            const apiSessions = await apiFetch(url);
            const combined = Array.isArray(apiSessions) ? apiSessions : [];

            if (combined.length > 0) {
                console.log("[attendanceService] getSessions SAMPLE:", combined[0]);
            }

            // Normalize and filter
            const mapped = combined.map(s => {
                // Robust mapping to find the Academic Session ID
                const acadId = s.classId || s.sessionId || s.session_id || s.academicSessionId || s.academic_session_id || s?.session?.id;
                return {
                    ...s,
                    classId: acadId
                };
            });

            if (batchId) {
                return mapped.filter(s => String(s.batchId) === String(batchId));
            }
            return mapped;
        } catch (e) {
            console.warn("[attendanceService] Could not fetch sessions", e);
            return [];
        }
    },

    // Get session details by ID
    // attendanceSessionId: The unique ID for the specific attendance event
    getSession: async (attendanceSessionId) => {
        const data = await apiFetch(`${API_BASE_URL}/attendance/session/${attendanceSessionId}`);
        return {
            ...data,
            classId: data?.classId || data?.sessionId || data?.session_id // Ensure classId is present
        };
    },

    // Start a new attendance session
    // classId: LMS Academic Session ID (Backend expects this as 'sessionId' param)
    startSession: (classId, courseId, batchId, userId) => {
        console.log(`[attendanceService] startSession payload: classId=${classId}, courseId=${courseId}, batchId=${batchId}`);
        const params = new URLSearchParams({
            sessionId: Number(classId), // BACKEND MAP: classId -> sessionId
            courseId: Number(courseId),
            batchId: Number(batchId),
            userId: Number(userId || 1)
        });
        return apiFetch(`${API_BASE_URL}/attendance/session/start?${params.toString()}`, {
            method: 'POST'
        });
    },

    // End an attendance session
    endSession: (attendanceSessionId) => {
        console.log(`[attendanceService] Ending session: ${attendanceSessionId}`);
        return apiFetch(`${API_BASE_URL}/attendance/session/${Number(attendanceSessionId)}/end`, {
            method: 'PUT'
        });
    },

    // ------------------------------------------
    // ATTENDANCE RECORD CONTROLLER
    // ------------------------------------------

    // Get records for a specific attendance session
    getAttendance: (attendanceSessionId) =>
        apiFetch(`${API_BASE_URL}/attendance/record/session/${Number(attendanceSessionId)}`),

    // Save/Mark bulk attendance
    saveAttendance: async (attendanceSessionId, records) => {
        if (!records || records.length === 0) return null;

        // Deduplicate records by studentId to prevent sending duplicates
        const uniqueMap = new Map();
        records.forEach(r => {
            if (r.studentId) {
                uniqueMap.set(Number(r.studentId), r);
            }
        });

        const payload = Array.from(uniqueMap.values()).map(r => {
            const studentId = r.studentId || 0;

            const record = {
                // Link to the attendance record primary key if updating
                id: r.id ? Number(r.id) : null,
                // Link to the attendance session ID (Long in Java)
                attendanceSessionId: Number(attendanceSessionId),
                // Links to student_id (Long in Java)
                studentId: Number(studentId),
                // PRESENT / ABSENT / LATE / EXCUSED (String in Java)
                status: (r.status || 'PRESENT').toUpperCase(),
                // Optional remarks (String in Java)
                remarks: r.remarks || "",
                // MANUAL / CSV / QR (String in Java)
                source: (r.source || r.mode || 'ONLINE').toUpperCase(),
                // Date in YYYY-MM-DD (LocalDate in Java)
                attendanceDate: r.attendanceDate || new Date().toISOString().split('T')[0],
                // Admin ID (Long in Java)
                markedBy: 1
            };

            // Remove ID if null to avoid JPA errors
            if (!record.id) delete record.id;

            return record;
        });

        console.log("[attendanceService] saveAttendance (Online/Bulk) payload:", payload);

        try {
            const response = await apiFetch(`${API_BASE_URL}/attendance/record/bulk`, {
                method: 'POST',
                body: JSON.stringify(payload)
            });
            console.log("[attendanceService] saveAttendance response received:", response);
            return response;
        } catch (error) {
            console.error("[attendanceService] saveAttendance error details:", error);
            throw error;
        }
    },

    // Get comprehensive attendance history for a batch
    getAttendanceHistory: async (batchId) => {
        try {
            // Attempt to hit the batch-level endpoint
            // If backend is missing this endpoint (which seems to be the case), we return empty []
            // to allow the UI to function for Class-level reports.
            const data = await apiFetch(`${API_BASE_URL}/attendance/record/batch/${Number(batchId)}`);

            return (data || []).map(r => ({
                id: r.id,
                studentId: r.studentId,
                date: r.attendanceDate,
                status: r.status,
                method: r.source,
                presenceMinutes: 0,
                studentName: r.studentName || `Student #${r.studentId}`,
                courseName: r.courseName || `Session #${r.attendanceSessionId}`
            }));

        } catch (error) {
            console.warn("[attendanceService] Batch history endpoint missing or failed. Returning empty list.", error);
            // Return empty array so UI doesn't crash or show infinite loading
            return [];
        }
    },

    // ------------------------------------------
    // OFFLINE QUEUE CONTROLLER (Manual Marking)
    // ------------------------------------------

    // Store a single offline/manual attendance record
    saveToOfflineQueue: (data) => {
        const payload = {
            sessionId: Number(data.sessionId || data.attendanceSessionId),
            batchId: Number(data.batchId),
            studentId: Number(data.studentId),
            status: (data.status || 'PRESENT').toUpperCase(),
            remarks: data.remarks || "",
            synced: false
        };
        console.log("[attendanceService] saveToOfflineQueue payload:", payload);
        return apiFetch(`${API_BASE_URL}/attendance/offline-queue`, {
            method: 'POST',
            body: JSON.stringify(payload)
        });
    },

    // Get the offline queue for a specific batch
    getOfflineQueue: (batchId) =>
        apiFetch(`${API_BASE_URL}/attendance/offline-queue/batch/${Number(batchId)}`),

    // Trigger sync from Offline Queue to main Records
    syncOfflineQueue: () =>
        apiFetch(`${API_BASE_URL}/attendance/offline-queue/sync`, {
            method: 'POST'
        }),

    // Delete a record from the offline queue
    deleteOfflineQueueRecord: (id) =>
        apiFetch(`${API_BASE_URL}/attendance/offline-queue/${Number(id)}`, {
            method: 'DELETE'
        }),

    // Get dashboard stats
    getDashboardStats: (courseId, batchId) =>
        apiFetch(`${API_BASE_URL}/attendance/record/dashboard?courseId=${Number(courseId || 0)}&batchId=${Number(batchId || 0)}`),

    // Get all attendance instances for an academic session (classId)
    getAttendanceSessionsByClassId: async (classId) => {
        console.log(`[attendanceService] Fetching attendance sessions for classId: ${classId}`);
        // Backend: @GetMapping("/session/{sessionId}/all") under /api/attendance/session
        return apiFetch(`${API_BASE_URL}/attendance/session/session/${Number(classId)}/all`);
    },

    // ------------------------------------------
    // CONFIG CONTROLLER
    // ------------------------------------------

    // Get attendance configuration for a course/batch
    getAttendanceConfig: (courseId, batchId) =>
        apiFetch(`${API_BASE_URL}/attendance/config?courseId=${Number(courseId)}&batchId=${Number(batchId)}`),

    // Create new configuration
    createAttendanceConfig: (config) =>
        apiFetch(`${API_BASE_URL}/attendance/config`, {
            method: 'POST',
            body: JSON.stringify(config)
        }),

    // Update existing configuration
    updateAttendanceConfig: (configId, config) =>
        apiFetch(`${API_BASE_URL}/attendance/config/${Number(configId)}`, {
            method: 'PUT',
            body: JSON.stringify(config)
        })
};

export default attendanceService;
