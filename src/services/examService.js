import { apiFetch } from "./api";

/**
 * EXAM SERVICE
 * 
 * Handles all exam-related API calls for Admin, Instructors, and Students.
 */
export const examService = {
    // --- Admin / Instructor Endpoints ---

    /**
     * Get all exams (for admin/instructor dashboard)
     */
    getAllExams: async () => {
        try {
            return await apiFetch('/api/exams');
        } catch (error) {
            console.error("Failed to fetch all exams:", error);
            // Return empty array instead of failing completely for UI stability
            return [];
        }
    },

    /**
     * Get a specific exam by ID
     */
    getExamById: async (id) => {
        return await apiFetch(`/api/exams/${id}`);
    },

    /**
     * Create a new exam
     */
    createExam: async (examData) => {
        return await apiFetch('/api/exams', {
            method: 'POST',
            body: JSON.stringify(examData)
        });
    },

    /**
     * Update an existing exam
     */
    updateExam: async (id, examData) => {
        return await apiFetch(`/api/exams/${id}`, {
            method: 'PUT',
            body: JSON.stringify(examData)
        });
    },

    /**
     * Delete an exam
     */
    deleteExam: async (id) => {
        return await apiFetch(`/api/exams/${id}`, {
            method: 'DELETE'
        });
    },

    // --- Student Endpoints ---

    /**
     * Get exams for the logged-in student
     */
    getMyExams: async () => {
        try {
            // Adjusting endpoint if needed - commonly /api/student/exams or filtered /api/exams
            return await apiFetch('/api/exams/my-exams');
        } catch (error) {
            console.error("Failed to fetch student exams:", error);
            return [];
        }
    },

    /**
     * Start/Attempt an exam
     */
    startExam: async (examId) => {
        return await apiFetch(`/api/exams/${examId}/start`, {
            method: 'POST'
        });
    },

    /**
     * Submit an exam attempt
     */
    submitExam: async (examId, responses) => {
        return await apiFetch(`/api/exams/${examId}/submit`, {
            method: 'POST',
            body: JSON.stringify({ responses })
        });
    },

    /**
     * Get exam result/report
     */
    /**
     * Get exam result/report
     */
    getExamResult: async (examId) => {
        return await apiFetch(`/api/exams/${examId}/result`);
    },

    /**
     * Get all exam reports (for admin/instructor)
     */
    getExamReports: async () => {
        try {
            return await apiFetch('/api/exams/reports');
        } catch (error) {
            console.error("Failed to fetch exam reports:", error);
            return [];
        }
    },

    /**
     * Schedule an exam
     */
    scheduleExam: async (scheduleData) => {
        return await apiFetch('/api/exams/schedule', {
            method: 'POST',
            body: JSON.stringify(scheduleData)
        });
    },

    /**
     * Get exam paper view (questions)
     */
    viewExamPaper: async (examId) => {
        return await apiFetch(`/api/exams/${examId}/questions/view`);
    }
};
