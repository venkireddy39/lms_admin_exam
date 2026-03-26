import api from './api';

const BASE_RECORD_URL = '/api/attendance/record';
const BASE_SESSION_URL = '/api/attendance/session';
const BASE_CONFIG_URL = '/api/attendance/config';

export const attendanceService = {
    // ===============================
    // SESSIONS
    // ===============================
    startSession: async (sessionId, courseId, batchId, userId) => {
        const params = new URLSearchParams({ sessionId, courseId, batchId, userId });
        const response = await api.post(`${BASE_SESSION_URL}/start?${params}`);
        return response;
    },

    endSession: async (attendanceSessionId) => {
        const response = await api.put(`${BASE_SESSION_URL}/${attendanceSessionId}/end`);
        return response;
    },

    getSessionById: async (attendanceSessionId) => {
        const response = await api.get(`${BASE_SESSION_URL}/${attendanceSessionId}`);
        return response;
    },

    getActiveSession: async (sessionId) => {
        const response = await api.get(`${BASE_SESSION_URL}/active/${sessionId}`);
        return response;
    },

    getActiveAndEndedSessions: async (sessionId) => {
        const response = await api.get(`${BASE_SESSION_URL}/session/${sessionId}/all`);
        return response;
    },

    getSessionsByDate: async (date) => {
        const response = await api.get(`${BASE_SESSION_URL}/date/${date}`);
        return response;
    },

    deleteSession: async (attendanceSessionId) => {
        const response = await api.delete(`${BASE_SESSION_URL}/${attendanceSessionId}`);
        return response;
    },

    // ===============================
    // RECORDS
    // ===============================
    markAttendance: async (recordData) => {
        const response = await api.post(BASE_RECORD_URL, recordData);
        return response;
    },

    markAttendanceBulk: async (recordsData) => {
        const response = await api.post(`${BASE_RECORD_URL}/bulk`, recordsData);
        return response;
    },

    updateAttendanceRecord: async (attendanceRecordId, recordData) => {
        const response = await api.put(`${BASE_RECORD_URL}/${attendanceRecordId}`, recordData);
        return response;
    },

    getRecordsBySession: async (attendanceSessionId) => {
        const response = await api.get(`${BASE_RECORD_URL}/session/${attendanceSessionId}`);
        return response;
    },

    getRecordsByDate: async (date) => {
        const response = await api.get(`${BASE_RECORD_URL}/date/${date}`);
        return response;
    },

    getRecordsBySessionAndDate: async (attendanceSessionId, date) => {
        const response = await api.get(`${BASE_RECORD_URL}/session/${attendanceSessionId}/date/${date}`);
        return response;
    },

    getStudentRecords: async (studentId) => {
        const response = await api.get(`${BASE_RECORD_URL}/student/${studentId}`);
        return response;
    },

    deleteAttendanceRecord: async (attendanceRecordId) => {
        const response = await api.delete(`${BASE_RECORD_URL}/${attendanceRecordId}`);
        return response;
    },

    markLeave: async (attendanceSessionId, studentId) => {
        const params = new URLSearchParams({ attendanceSessionId, studentId });
        const response = await api.post(`${BASE_RECORD_URL}/leave?${params}`);
        return response;
    },

    getDashboardStatus: async (courseId, batchId) => {
        const params = new URLSearchParams({ courseId, batchId });
        const response = await api.get(`${BASE_RECORD_URL}/dashboard?${params}`);
        return response;
    },

    // ===============================
    // CONFIG
    // ===============================
    createConfig: async (configData) => {
        const response = await api.post(BASE_CONFIG_URL, configData);
        return response;
    },

    getConfig: async (courseId, batchId) => {
        const params = new URLSearchParams({ courseId, batchId });
        const response = await api.get(`${BASE_CONFIG_URL}?${params}`);
        return response;
    },

    updateConfig: async (configId, configData) => {
        const response = await api.put(`${BASE_CONFIG_URL}/${configId}`, configData);
        return response;
    }
};
