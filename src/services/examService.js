import apiClient from "./apiClient";

// Matches Java Controller @RequestMapping("/api/exams")
const BASE_URL = "/api/exams";

export const examService = {
    // Matches @GetMapping("")
    getAllExams: async () => {
        try {
            const response = await apiClient.get(BASE_URL);
            return Array.isArray(response.data) ? response.data : (response.data || []);
        } catch (error) {
            console.error("Exam fetch error:", error);
            return [];
        }
    },

    // Matches @GetMapping("/{examId}")
    getExamById: async (id) => {
        const response = await apiClient.get(`${BASE_URL}/${id}`);
        return response.data;
    },

    // Matches @GetMapping("/course/{courseId}")
    getExamsByCourseId: async (courseId) => {
        const response = await apiClient.get(`${BASE_URL}/course/${courseId}`);
        return response.data;
    },

    // Matches @GetMapping("/batch/{batchId}")
    getExamsByBatchId: async (batchId) => {
        const response = await apiClient.get(`${BASE_URL}/batch/${batchId}`);
        return response.data;
    },

    // Matches @PostMapping("")
    createExam: async (examData) => {
        const response = await apiClient.post(BASE_URL, examData);
        return response.data;
    },

    // Matches @PutMapping("/{examId}/publish")
    publishExam: async (id) => {
        const response = await apiClient.put(`${BASE_URL}/${id}/publish`);
        return response.data;
    },

    // Matches @PutMapping("/{examId}/close")
    closeExam: async (id) => {
        const response = await apiClient.put(`${BASE_URL}/${id}/close`);
        return response.data;
    },

    // Matches @DeleteMapping("/{examId}") - SOFT DELETE
    deleteExam: async (id) => {
        const response = await apiClient.delete(`${BASE_URL}/${id}`);
        return response.data;
    },

    // Matches @PutMapping("/{examId}/restore")
    restoreExam: async (id) => {
        const response = await apiClient.put(`${BASE_URL}/${id}/restore`);
        return response.data;
    },

    // Matches @DeleteMapping("/{examId}/hard")
    hardDeleteExam: async (id) => {
        const response = await apiClient.delete(`${BASE_URL}/${id}/hard`);
        return response.data;
    }
};
