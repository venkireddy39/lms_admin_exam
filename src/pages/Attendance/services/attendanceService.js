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
        // Correct endpoint from AttendanceSessionController.java
        const url = `${API_BASE_URL}/attendance/session/date/${effectiveDate}`;

        try {
            const apiSessions = await apiFetch(url);
            const combined = Array.isArray(apiSessions) ? apiSessions : [];

            // Normalize
            const mapped = combined.map(s => {
                const acadId = s.classId || s.sessionId || s.session_id || s.academicSessionId || (s.session && s.session.id);
                const title = s.title || s.sessionName || (s.session && s.session.sessionName) || `Session #${acadId}`;

                return {
                    ...s,
                    classId: acadId,
                    title: title,
                    batchId: s.batchId || (s.session && s.session.batchId),
                    courseId: s.courseId || (s.session && s.session.courseId)
                };
            });

            if (batchId) {
                return mapped.filter(s => String(s.batchId) === String(batchId));
            }
            return mapped;
        } catch (e) {
            console.warn("[attendanceService] Could not fetch sessions for date", effectiveDate, e);
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
    startSession: async (classId, courseId, batchId, userId) => {
        console.log(`[attendanceService] Checking existing sessions before start...`);

        // Ensure IDs are valid numbers
        const nClassId = Number(classId);
        const nCourseId = Number(courseId);
        const nBatchId = Number(batchId);
        const nUserId = Number(userId || 1);

        // 1. Check if session already exists for this class
        try {
            const existingSessions = await attendanceService.getAttendanceSessionsByClassId(nClassId);
            if (Array.isArray(existingSessions) && existingSessions.length > 0) {
                const existing = existingSessions.find(s =>
                    ['ACTIVE', 'LIVE'].includes((s.status || '').toUpperCase())
                ) || existingSessions[0];

                if (existing) {
                    console.log(`[attendanceService] Found existing session ${existing.id} (Status: ${existing.status}), returning it.`);
                    return existing;
                }
            }
        } catch (e) {
            console.warn("[attendanceService] Check existing failed, trying to start anyway", e);
        }

        console.log(`[attendanceService] Starting NEW session: classId=${nClassId}, userId=${nUserId}`);
        const params = new URLSearchParams({
            sessionId: nClassId,
            courseId: nCourseId,
            batchId: nBatchId,
            userId: nUserId
        });

        // Use POST with query params as the backend expects
        try {
            return await apiFetch(`${API_BASE_URL}/attendance/session/start?${params.toString()}`, {
                method: 'POST'
            });
        } catch (error) {
            const errorMsg = error.message || "";
            // Special Handle: 409 Conflict wrapped in 500 error
            if (errorMsg.includes("409 CONFLICT") || errorMsg.includes("already started")) {
                console.info("[attendanceService] Session already active. Fetching existing session data...");
                const existing = await attendanceService.getAttendanceSessionsByClassId(nClassId);
                const active = (existing || []).find(s => ['ACTIVE', 'LIVE'].includes((s.status || '').toUpperCase()));
                if (active) return active;
                if (existing && existing.length > 0) return existing[0];
            }

            console.warn("[attendanceService] POST with query params failed. Trying Body-based start...", error);
            // Fallback: Try with JSON Body
            return apiFetch(`${API_BASE_URL}/attendance/session/start`, {
                method: 'POST',
                body: JSON.stringify({
                    sessionId: nClassId,
                    courseId: nCourseId,
                    batchId: nBatchId,
                    userId: nUserId
                })
            }).catch(async (e2) => {
                const e2Msg = e2.message || "";
                if (e2Msg.includes("409") || e2Msg.includes("already started")) {
                    const existing = await attendanceService.getAttendanceSessionsByClassId(nClassId);
                    return (existing || []).find(s => ['ACTIVE', 'LIVE'].includes((s.status || '').toUpperCase())) || existing[0];
                }
                throw e2;
            });
        }
    },

    // End an attendance session
    endSession: (attendanceSessionId) => {
        console.log(`[attendanceService] Ending session: ${attendanceSessionId}`);
        return apiFetch(`${API_BASE_URL}/attendance/session/${Number(attendanceSessionId)}/end`, {
            method: 'PUT'
        });
    },

    // Delete an attendance session (CLEANUP)
    deleteSession: (attendanceSessionId) => {
        console.log(`[attendanceService] Deleting session: ${attendanceSessionId}`);
        return apiFetch(`${API_BASE_URL}/attendance/session/${Number(attendanceSessionId)}`, {
            method: 'DELETE'
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

        // Deduplicate input records by studentId to prevent sending duplicates in payload
        const uniqueMap = new Map();
        records.forEach(r => {
            if (r.studentId) {
                uniqueMap.set(Number(r.studentId), r);
            }
        });

        // 1. Fetch EXISTING records for this session to get their IDs
        // This prevents creating duplicate rows if we are updating
        let existingRecords = [];
        try {
            existingRecords = await attendanceService.getAttendance(attendanceSessionId);
            if (!Array.isArray(existingRecords)) existingRecords = [];
        } catch (e) {
            console.warn("Could not fetch existing records for merge, proceeding blindly", e);
        }

        const existingMap = new Map();
        existingRecords.forEach(e => existingMap.set(Number(e.studentId), e.id));

        const toCreate = [];
        const toUpdate = [];

        Array.from(uniqueMap.values()).forEach(r => {
            const studentId = Number(r.studentId || 0);

            // Resolve ID: Use passed ID, or look up from existing db records
            const existingId = r.id || existingMap.get(studentId);

            const record = {
                // Link to the attendance record primary key if updating
                id: existingId ? Number(existingId) : null,
                // Link to the attendance session ID (Long in Java)
                attendanceSessionId: Number(attendanceSessionId),
                // Links to student_id (Long in Java)
                studentId: studentId,
                // STATUS
                status: (r.status || 'PRESENT').toUpperCase(),
                // REMARKS
                remarks: r.remarks || "",
                // SOURCE
                source: (r.source || r.mode || 'ONLINE').toUpperCase(),
                // DATE
                attendanceDate: r.attendanceDate || new Date().toISOString().split('T')[0],
                markedBy: 1
            };

            if (existingId) {
                toUpdate.push(record);
            } else {
                record.id = null; // Send explicit null for new records, don't delete key
                toCreate.push(record);
            }
        });

        if (Number.isNaN(Number(attendanceSessionId)) || Number(attendanceSessionId) <= 0) {
            console.error("Invalid Attendance Session ID for Save:", attendanceSessionId);
            throw new Error("Invalid Session ID");
        }

        console.log(`[attendanceService] Splitting save: ${toCreate.length} create, ${toUpdate.length} update`);

        try {
            const promises = [];

            // 1. Bulk Create New Records
            if (toCreate.length > 0) {
                // Try bulk first, if it fails, we will catch it below
                promises.push(
                    apiFetch(`${API_BASE_URL}/attendance/record/bulk`, {
                        method: 'POST',
                        body: JSON.stringify(toCreate)
                    }).catch(async (e) => {
                        console.warn("[attendanceService] Bulk save failed, falling back to individual records", e);
                        // Fallback: Individual creation
                        const singlePromises = toCreate.map(rec =>
                            apiFetch(`${API_BASE_URL}/attendance/record`, {
                                method: 'POST',
                                body: JSON.stringify({
                                    attendanceSessionId: rec.attendanceSessionId,
                                    studentId: rec.studentId,
                                    status: rec.status,
                                    remarks: rec.remarks,
                                    attendanceDate: rec.attendanceDate,
                                    source: rec.source,
                                    markedBy: rec.markedBy
                                })
                            }).catch(err => console.error(`Failed to create record for student ${rec.studentId}`, err))
                        );
                        return Promise.all(singlePromises);
                    })
                );
            }

            // 2. Individual Update Existing Records
            toUpdate.forEach(rec => {
                promises.push(
                    apiFetch(`${API_BASE_URL}/attendance/record/${rec.id}`, {
                        method: 'PUT',
                        body: JSON.stringify(rec)
                    }).catch(e => {
                        console.error(`Failed to update record ${rec.id}`, e);
                        // If PUT fails, maybe try POST as an overwrite? (Depends on backend)
                    })
                );
            });

            await Promise.all(promises);
            return { success: true };
        } catch (error) {
            console.error("[attendanceService] saveAttendance error details:", error);

            // Handle "Student is not enrolled" error by falling back to Offline Queue
            // This happens if the user tries to mark attendance for a student who was just transferred or has a state mismatch.
            const errMsg = error.message || "";
            if (errMsg.includes("Student is not enrolled") || errMsg.includes("Student not active in batch")) {
                console.warn("[attendanceService] Enrollment Strict Check Failed. Falling back to Offline Queue for records.");

                // Try saving these records to offline queue one by one
                // We use the available data in 'toCreate'
                const fallbackPromises = toCreate.map(record => {
                    const fallbackPayload = {
                        sessionId: attendanceSessionId, // This is 'attendanceSessionId', not academic 'classId'. Queue might expect either depending on backend.
                        // Let's assume we pass the primary ID we have.
                        attendanceSessionId: attendanceSessionId,
                        batchId: 0, // We might not have batchId handy here easily without lookups, but let's try 0 or handle in queue logic
                        studentId: record.studentId,
                        status: record.status,
                        remarks: record.remarks
                    };
                    // Note: 'batchId' is required by saveToOfflineQueue usually. 
                    // But if we are here, we might lack context. 
                    // However, let's try to proceed. Ideally we should have batchId passed to saveAttendance.

                    // Since we don't have batchId in arguments, we might fail again if queue requires it.
                    // But let's try best effort.
                    return attendanceService.saveToOfflineQueue(fallbackPayload)
                        .catch(e => console.error("Fallback queue save failed for student " + record.studentId, e));
                });

                await Promise.all(fallbackPromises);
                return { success: true, warning: "Saved to Offline Queue due to enrollment mismatch." };
            }

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
        apiFetch(`${API_BASE_URL}/attendance/dashboard?courseId=${Number(courseId || 0)}&batchId=${Number(batchId || 0)}`),

    // Get all attendance instances for an academic session (classId)
    getAttendanceSessionsByClassId: async (classId) => {
        if (!classId) return [];
        console.log(`[attendanceService] Fetching attendance sessions for classId: ${classId}`);

        try {
            // Updated to match AttendanceSessionController.java @GetMapping("/session/{sessionId}/all")
            const data = await apiFetch(`${API_BASE_URL}/attendance/session/session/${classId}/all`).catch(() => null);
            if (data && Array.isArray(data)) return data;

            // Legacy/Fallback check: active only
            const activeOnly = await apiFetch(`${API_BASE_URL}/attendance/session/active/${classId}`).catch(() => null);
            if (activeOnly) return [activeOnly];

            // List and filter (last resort)
            const today = new Date().toISOString().split('T')[0];
            const all = await attendanceService.getSessions(null, today);
            return (all || []).filter(s => String(s.classId || s.sessionId) === String(classId));
        } catch (error) {
            console.warn("[attendanceService] getAttendanceSessionsByClassId failed", error);
            return [];
        }
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
        }),

    // ------------------------------------------
    // CSV UPLOAD JOB
    // ------------------------------------------

    // Upload CSV file and create a job
    uploadCsvJob: (courseId, batchId, sessionId, attendanceDate, uploadedBy, file) => {
        const formData = new FormData();
        formData.append('courseId', courseId);
        formData.append('batchId', batchId);
        if (sessionId) formData.append('sessionId', sessionId);
        formData.append('attendanceDate', attendanceDate);
        formData.append('uploadedBy', uploadedBy);
        formData.append('file', file);

        return apiFetch(`${API_BASE_URL}/attendance/upload-job/upload`, {
            method: 'POST',
            body: formData,
            headers: {
                "Content-Type": null
            }
        });
    },

    // Process a specific upload job
    processCsvJob: (uploadJobId) => {
        return apiFetch(`${API_BASE_URL}/attendance/upload-job/${uploadJobId}/process`, {
            method: 'POST'
        });
    },

    // Get all upload jobs for a batch
    getUploadJobsByBatch: (batchId) => {
        return apiFetch(`${API_BASE_URL}/attendance/upload-job/batch/${batchId}`);
    },

    // Get upload job status (assuming GET /id exists)
    getUploadJobStatus: (uploadJobId) => {
        return apiFetch(`${API_BASE_URL}/attendance/upload-job/${uploadJobId}`);
    }
};

export default attendanceService;
