import { apiFetch } from "../../../services/api";

const API_BASE_URL = "/api";

export const attendanceService = {
    // Get stats for a batch
    getAttendanceStats: (batchId) =>
        apiFetch(`${API_BASE_URL}/attendance/stats/${batchId}`, { headers: { "Cache-Control": "no-cache" } }),

    // Get attendance history for a batch
    getAttendanceHistory: (batchId) =>
        apiFetch(`${API_BASE_URL}/attendance/history/${batchId}`, { headers: { "Cache-Control": "no-cache" } })
};
