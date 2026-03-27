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

    // Matches @PutMapping("/{id}/publish")
    publishExam: async (id) => {
        return await api.put(`${BASE_URL}/${id}/publish`);
    },

    // Step 2: Configure Exam Settings
    saveSettings: async (examId, settings) => {
        return await api.post(`${BASE_URL}/${examId}/settings`, settings);
    },

    // Step 3: Configure Grading Rules
    saveGrading: async (examId, grading) => {
        return await api.post(`${BASE_URL}/${examId}/grading`, grading);
    },

    // Step 4: Configure Proctoring Rules
    saveProctoring: async (examId, proctoring) => {
        return await api.post(`${BASE_URL}/${examId}/proctoring`, proctoring);
    },

    // Step 5: Configure Exam Design (Multipart)
    saveDesign: async (examId, designData) => {
        // Handle both JSON (if no files) and Multipart (if files exist)
        // Based on backend requirement for @RequestParam and MultipartFile
        const formData = new FormData();
        formData.append('orientation', designData.orientation || 'PORTRAIT');
        formData.append('watermarkType', designData.watermarkType || 'TEXT');
        formData.append('watermarkValue', designData.watermarkValue || '');
        formData.append('watermarkOpacity', Math.round((designData.watermarkOpacity || 0.1) * 100));

        if (designData.instituteLogo instanceof File) {
            formData.append('instituteLogo', designData.instituteLogo);
        }
        if (designData.backgroundImage instanceof File) {
            formData.append('backgroundImage', designData.backgroundImage);
        }

        return await api.post(`${BASE_URL}/${examId}/design/upload`, formData, {
            headers: { 'Content-Type': 'multipart/form-data' }
        });
    },

    saveNotification: async (examId, notification) => {
        return await api.post(`${BASE_URL}/${examId}/notification`, notification);
    },

    // Step 6: Create Exam Schedule
    createSchedule: async (scheduleData) => {
        return await api.post('/api/exam-schedules', scheduleData);
    },

    // Step 10: Manage Question Sections
    createQuestionSection: async (sectionData) => {
        return await api.post('/api/sections', sectionData);
    },

    getAllSections: async () => {
        return await api.get('/api/sections');
    },

    // Question Bank Sub-resources (Part 2, Step 5)
    saveMCQOptions: async (questionId, options) => {
        return await api.post(`/api/questions/${questionId}/options`, options);
    },

    saveDescriptiveRubric: async (questionId, rubric) => {
        return await api.post(`/api/questions/${questionId}/descriptive-answer`, rubric);
    },

    saveCodingTestCases: async (questionId, testCases) => {
        return await api.post(`/api/questions/${questionId}/coding-test-cases`, testCases);
    },

    // Step 11: Map Sections and Questions
    addSectionToExam: async (examId, sectionId, order, shuffle = false) => {
        return await api.post(`${BASE_URL}/${examId}/sections?sectionId=${sectionId}&sectionOrder=${order}&shuffleQuestions=${shuffle}`);
    },

    addQuestionsToExamSection: async (examSectionId, mapping) => {
        return await api.post(`/api/exam-sections/${examSectionId}/questions`, mapping);
    },

    // Part 3: Student Attempt
    startAttempt: async (examId) => {
        return await api.post(`${BASE_URL}/${examId}/attempts/start`);
    },

    saveResponse: async (attemptId, responseData) => {
        return await api.post(`/api/exam-attempts/${attemptId}/responses`, responseData);
    },

    getResponsesByAttempt: async (attemptId) => {
        return await api.get(`/api/exam-attempts/${attemptId}/responses`);
    },

    autoEvaluateMcq: async (attemptId) => {
        return await api.post(`/api/exam-attempts/${attemptId}/responses/auto-evaluate`);
    },

    submitExam: async (examId, attemptId) => {
        return await api.post(`${BASE_URL}/${examId}/attempts/${attemptId}/submit`);
    },

    // Evaluation
    getDescriptiveResponses: async (attemptId) => {
        return await api.get(`/api/exam-attempts/${attemptId}/descriptive-responses`);
    },

    getCodingResponses: async (attemptId) => {
        return await api.get(`/api/exam-attempts/${attemptId}/responses/coding-responses`);
    },

    evaluateDescriptive: async (attemptId, responseId, marks) => {
        return await api.post(`/api/exam-attempts/${attemptId}/responses/${responseId}/evaluate?marks=${marks}`);
    },

    evaluateCoding: async (attemptId, responseId, evaluation) => {
        return await api.post(`/api/exam-attempts/${attemptId}/evaluation-logs/coding-evaluate/${responseId}`, evaluation);
    },

    // Mandatory for Code Evaluation Workflow
    runCode: async (responseId) => {
        return await api.post(`/api/exam-responses/${responseId}/run`);
    },

    getFinalResult: async (examId, attemptId) => {
        return await api.get(`${BASE_URL}/${examId}/attempts/${attemptId}/result`);
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
    },

    // Global Question Bank
    getAllQuestions: async () => {
        return await api.get('/api/questions');
    },

    deleteQuestion: async (id) => {
        return await api.delete(`/api/questions/${id}`);
    }
};
