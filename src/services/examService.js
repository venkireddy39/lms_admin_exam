import api from "./api";

// Matches Java Controller @RequestMapping("/api/exams")
const BASE_URL = "/api/exams";

export const examService = {
    // Matches @GetMapping("")
    getAllExams: async () => {
        try {
            const data = await api.get(BASE_URL);
            return Array.isArray(data) ? data : (data || []);
        } catch (error) {
            console.error("Exam fetch error:", error);
            return [];
        }
    },

    // Matches @GetMapping("/{examId}")
    getExamById: async (id) => {
        return await api.get(`${BASE_URL}/${id}`);
    },

    // Matches @GetMapping("/course/{courseId}")
    getExamsByCourseId: async (courseId) => {
        return await api.get(`${BASE_URL}/course/${courseId}`);
    },

    // Matches @GetMapping("/batch/{batchId}")
    getExamsByBatchId: async (batchId) => {
        return await api.get(`${BASE_URL}/batch/${batchId}`);
    },

    // Matches @PostMapping("")
    createExam: async (examData) => {
        return await api.post(BASE_URL, examData);
    },

    // Matches @PutMapping("/{examId}/publish")
    publishExam: async (id) => {
        return await api.put(`${BASE_URL}/${id}/publish`);
    },

    // Matches @PutMapping("/{examId}/close")
    closeExam: async (id) => {
        return await api.put(`${BASE_URL}/${id}/close`);
    },

    // Matches @DeleteMapping("/{examId}") - SOFT DELETE
    deleteExam: async (id) => {
        return await api.delete(`${BASE_URL}/${id}`);
    },

    // Matches @PutMapping("/{examId}/restore")
    restoreExam: async (id) => {
        return await api.put(`${BASE_URL}/${id}/restore`);
    },

    // Matches @DeleteMapping("/{examId}/hard")
    hardDeleteExam: async (id) => {
        return await api.delete(`${BASE_URL}/${id}/hard`);
    }
};
