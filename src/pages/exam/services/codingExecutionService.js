import api from '../../../services/api';

const BASE_URL = '/api/exam-responses';

export const codingExecutionService = {
    runCodeSubmission: async (responseId) => {
        try {
            return await api.post(`${BASE_URL}/${responseId}/run`);
        } catch (error) {
            console.error(`Error running code submission for response ID ${responseId}:`, error);
            throw error;
        }
    },

    getExecutionResults: async (responseId) => {
        try {
            return await api.get(`${BASE_URL}/${responseId}/execution-results`);
        } catch (error) {
            console.error(`Error fetching execution results for response ID ${responseId}:`, error);
            throw error;
        }
    }
};
