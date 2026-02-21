import { apiFetch } from "../../../services/api";

const BASE_URL = "/api/attendance";

export const attendanceService = {
    // Robust Fetch for Attendance
    getAttendanceByBatch: async (batchId, date) => {
        try {
            const data = await apiFetch(`${BASE_URL}/batch/${batchId}?date=${date}`);
            return Array.isArray(data) ? data : (data?.content || []);
        } catch (error) {
            console.error("Attendance fetch error:", error);
            return [];
        }
    },

    getSessions: async (batchId, date) => {
        try {
            const query = new URLSearchParams();
            if (batchId) query.append('batchId', batchId);
            if (date) query.append('date', date);

            // Assuming the endpoint is /api/attendance/session/date or similar.
            // Adjust based on your AttendanceSessionController. Often it's /api/attendance/session/all?date=... or /api/attendance/sessions
            const data = await apiFetch(`/api/attendance/session/date?` + query.toString());
            // Just returning data directly, if it fails, catch it
            return Array.isArray(data) ? data : (data?.content || []);
        } catch (error) {
            console.error("Attendance API getSessions Failed:", error);
            return [];
        }
    },

    markAttendance: async (attendanceData) => {
        return apiFetch(`${BASE_URL}/mark`, {
            method: 'POST',
            body: JSON.stringify(attendanceData)
        });
    },

    // Get statistics for a specific student
    getStudentAttendanceStats: async (studentId) => {
        try {
            // Note: This endpoint might return null 204 if no data, handle safely
            const data = await apiFetch(`${BASE_URL}/student/${studentId}/stats`);
            return data || { present: 0, absent: 0, total: 0 };
        } catch (error) {
            console.error("Student stats fetch error", error);
            return { present: 0, absent: 0, total: 0 };
        }
    },

    getInsights: async (params) => {
        const queryParams = new URLSearchParams(params).toString();
        return apiFetch(`${BASE_URL}/insights?${queryParams}`);
    },

    // --- Session Based Attendance Features ---

    startSession: async (sessionId, courseId, batchId, userId) => {
        // AttendanceSessionController: POST /api/attendance/session/start
        // Params: sessionId, courseId, batchId, userId
        const params = new URLSearchParams({
            sessionId: sessionId || '',
            courseId: courseId || '',
            batchId: batchId || '',
            userId: userId || ''
        });
        return apiFetch(`/api/attendance/session/start?${params.toString()}`, {
            method: 'POST'
        });
    },

    endSession: async (attendanceSessionId) => {
        // AttendanceSessionController: PUT /api/attendance/session/{id}/end
        return apiFetch(`/api/attendance/session/${attendanceSessionId}/end`, {
            method: 'PUT'
        });
    },

    getActiveSession: async (sessionId) => {
        // AttendanceSessionController: GET /api/attendance/session/active/{sessionId}
        return apiFetch(`/api/attendance/session/active/${sessionId}`);
    },

    getAttendanceSessionsByClassId: async (sessionId) => {
        // AttendanceSessionController: GET /api/attendance/session/session/{sessionId}/all
        return apiFetch(`/api/attendance/session/session/${sessionId}/all`);
    }
};
