import api from '../../../services/api';

const BASE_URL = '/api/exam-attempts';

export const examAttemptService = {
    createAttempt: async (attemptData) => {
        try {
            return await api.post(BASE_URL, attemptData);
        } catch (error) {
            console.error('Error creating exam attempt:', error);
            throw error;
        }
    },

    getAttemptById: async (id) => {
        try {
            return await api.get(`${BASE_URL}/${id}`);
        } catch (error) {
            console.error(`Error fetching exam attempt ID ${id}:`, error);
            throw error;
        }
    },

    getAttemptsByExamId: async (examId) => {
        try {
            return await api.get(`${BASE_URL}/exam/${examId}`);
        } catch (error) {
            console.error(`Error fetching attempts for exam ID ${examId}:`, error);
            throw error;
        }
    },

    updateAttempt: async (id, attemptData) => {
        try {
            return await api.put(`${BASE_URL}/${id}`, attemptData);
        } catch (error) {
            console.error(`Error updating exam attempt ID ${id}:`, error);
            throw error;
        }
    }
};
