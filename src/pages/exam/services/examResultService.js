import api from '../../../services/api';

const BASE_URL = '/api/exam-results';

export const examResultService = {
    createResult: async (resultData) => {
        try {
            return await api.post(BASE_URL, resultData);
        } catch (error) {
            console.error('Error creating exam result:', error);
            throw error;
        }
    },

    getResultById: async (id) => {
        try {
            return await api.get(`${BASE_URL}/${id}`);
        } catch (error) {
            console.error(`Error fetching exam result with ID ${id}:`, error);
            throw error;
        }
    },

    getResultsByExamId: async (examId) => {
        try {
            return await api.get(`${BASE_URL}/exam/${examId}`);
        } catch (error) {
            console.error(`Error fetching results for exam ID ${examId}:`, error);
            throw error;
        }
    },

    getResultsByStudentId: async (studentId) => {
        try {
            return await api.get(`${BASE_URL}/student/${studentId}`);
        } catch (error) {
            console.error(`Error fetching results for student ID ${studentId}:`, error);
            throw error;
        }
    },

    updateResult: async (id, resultData) => {
        try {
            return await api.put(`${BASE_URL}/${id}`, resultData);
        } catch (error) {
            console.error(`Error updating exam result with ID ${id}:`, error);
            throw error;
        }
    },

    deleteResult: async (id) => {
        try {
            return await api.delete(`${BASE_URL}/${id}`);
        } catch (error) {
            console.error(`Error deleting exam result with ID ${id}:`, error);
            throw error;
        }
    }
};
