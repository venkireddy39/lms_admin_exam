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
        return response.data;
    },

    endSession: async (attendanceSessionId) => {
        const response = await api.put(`${BASE_SESSION_URL}/${attendanceSessionId}/end`);
        return response.data;
    },

    getSessionById: async (attendanceSessionId) => {
        const response = await api.get(`${BASE_SESSION_URL}/${attendanceSessionId}`);
        return response.data;
    },

    getActiveSession: async (sessionId) => {
        const response = await api.get(`${BASE_SESSION_URL}/active/${sessionId}`);
        return response.data;
    },

    getActiveAndEndedSessions: async (sessionId) => {
        const response = await api.get(`${BASE_SESSION_URL}/session/${sessionId}/all`);
        return response.data;
    },

    getSessionsByDate: async (date) => {
        const response = await api.get(`${BASE_SESSION_URL}/date/${date}`);
        return response.data;
    },

    deleteSession: async (attendanceSessionId) => {
        const response = await api.delete(`${BASE_SESSION_URL}/${attendanceSessionId}`);
        return response.data;
    },

    // ===============================
    // RECORDS
    // ===============================
    markAttendance: async (recordData) => {
        const response = await api.post(BASE_RECORD_URL, recordData);
        return response.data;
    },

    markAttendanceBulk: async (recordsData) => {
        const response = await api.post(`${BASE_RECORD_URL}/bulk`, recordsData);
        return response.data;
    },

    updateAttendanceRecord: async (attendanceRecordId, recordData) => {
        const response = await api.put(`${BASE_RECORD_URL}/${attendanceRecordId}`, recordData);
        return response.data;
    },

    getRecordsBySession: async (attendanceSessionId) => {
        const response = await api.get(`${BASE_RECORD_URL}/session/${attendanceSessionId}`);
        return response.data;
    },

    getRecordsByDate: async (date) => {
        const response = await api.get(`${BASE_RECORD_URL}/date/${date}`);
        return response.data;
    },

    getRecordsBySessionAndDate: async (attendanceSessionId, date) => {
        const response = await api.get(`${BASE_RECORD_URL}/session/${attendanceSessionId}/date/${date}`);
        return response.data;
    },

    getStudentRecords: async (studentId) => {
        const response = await api.get(`${BASE_RECORD_URL}/student/${studentId}`);
        return response.data;
    },

    deleteAttendanceRecord: async (attendanceRecordId) => {
        const response = await api.delete(`${BASE_RECORD_URL}/${attendanceRecordId}`);
        return response.data;
    },

    markLeave: async (attendanceSessionId, studentId) => {
        const params = new URLSearchParams({ attendanceSessionId, studentId });
        const response = await api.post(`${BASE_RECORD_URL}/leave?${params}`);
        return response.data;
    },

    getDashboardStatus: async (courseId, batchId) => {
        const params = new URLSearchParams({ courseId, batchId });
        const response = await api.get(`${BASE_RECORD_URL}/dashboard?${params}`);
        return response.data;
    },

    // ===============================
    // CONFIG
    // ===============================
    createConfig: async (configData) => {
        const response = await api.post(BASE_CONFIG_URL, configData);
        return response.data;
    },

    getConfig: async (courseId, batchId) => {
        const params = new URLSearchParams({ courseId, batchId });
        const response = await api.get(`${BASE_CONFIG_URL}?${params}`);
        return response.data;
    },

    updateConfig: async (configId, configData) => {
        const response = await api.put(`${BASE_CONFIG_URL}/${configId}`, configData);
        return response.data;
    }
};
