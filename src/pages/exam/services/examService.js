import { apiFetch } from "../../../services/api";

const BASE_URL = "/api";
const DEBUG = false;
const MOCK_API_DELAY = 600;

// ================= DEBUG HELPERS =================
const logApi = (method, endpoint, payload = null, response = null, error = null) => {
    // Always log errors, log others if DEBUG is true (or temporarily enabled for dev)
    if (!DEBUG && !error) return;
    const style = error ? "color: #ff4d4d; font-weight: bold;" : "color: #00bcd4; font-weight: bold;";
    console.group(`%c[ExamService] ${method} ${endpoint}`, style);
    if (payload) console.log("Request:", payload);
    if (response) console.log("Response:", response);
    if (error) console.error("Error Detail:", error);
    console.groupEnd();
};

const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

// ================= MOCK DATA STORE =================
const MOCK_STORAGE_KEY = "lms_mock_exams_v2";

const getMockData = () => {
    try {
        const stored = localStorage.getItem(MOCK_STORAGE_KEY);
        if (stored) return JSON.parse(stored);
    } catch (e) { console.error("Mock storage read failed", e); }

    return [];
};

const saveMockData = (data) => {
    try {
        localStorage.setItem(MOCK_STORAGE_KEY, JSON.stringify(data));
    } catch (e) { console.error("Mock storage save failed", e); }
};

let mockExams = getMockData();

export const ExamService = {
    // ================= EXAM CORE (CRUD) =================

    getExams: async () => {
        const url = `${BASE_URL}/exams`;
        if (DEBUG) {
            await delay(MOCK_API_DELAY);
            return mockExams;
        }
        try {
            const data = await apiFetch(url);
            // Map Table 1 snake_case to camelCase for UI consistency
            return (data || []).map(exam => ({
                id: exam.exam_id || exam.id || exam.examId,
                title: exam.title,
                courseId: exam.course_id || exam.courseId,
                batchId: exam.batch_id || exam.batchId,
                type: (exam.exam_type || exam.examType || "MIXED").toLowerCase(),
                totalMarks: exam.total_marks || exam.totalMarks || 0,
                passPercentage: exam.pass_percentage || exam.passPercentage || 40,
                duration: Number(exam.duration_minutes || exam.durationMinutes || exam.duration || 0),
                status: exam.status || "DRAFT",
                totalQuestions: Number(exam.total_questions || exam.questionsCount || (exam.questions?.length) || 0),
                course: exam.course_name || exam.courseName || exam.course || "General",
                batch: exam.batch_name || exam.batchName || exam.batch || "All Batches",
                createdAt: exam.created_at || exam.createdAt
            }));
        } catch (error) {
            logApi("GET", url, null, null, error);
            return [];
        }
    },

    getExamsByCourse: async (courseId) => {
        const url = `${BASE_URL}/exams/course/${courseId}`;
        try {
            const data = await apiFetch(url);
            logApi("GET", url, null, data);
            return data;
        } catch (error) {
            logApi("GET", url, null, null, error);
            return [];
        }
    },

    getExamsByBatch: async (batchId) => {
        const url = `${BASE_URL}/exams/batch/${batchId}`;
        try {
            const data = await apiFetch(url);
            logApi("GET", url, null, data);
            return data;
        } catch (error) {
            logApi("GET", url, null, null, error);
            return [];
        }
    },

    saveExam: async (examData) => {
        const url = `${BASE_URL}/exams`;

        // Mock Save
        if (DEBUG) {
            await delay(MOCK_API_DELAY);
            const newExam = {
                id: Math.floor(Math.random() * 10000) + 4,
                ...examData,
                status: examData.status || "DRAFT",
                questions: []
            };
            mockExams.push(newExam);
            saveMockData(mockExams);
            return newExam;
        }

        // Payload alignment with Exam.java
        const payload = {
            courseId: Number(examData.courseId),
            batchId: examData.batchId ? Number(examData.batchId) : null,
            title: examData.title,
            examType: (examData.examType === "quiz" ? "MCQ" : examData.examType || "MIXED").toUpperCase(),
            totalMarks: Number(examData.totalMarks),
            passPercentage: examData.passPercentage || 40.0,
            durationMinutes: Number(examData.durationMinutes || 60),
            status: examData.status || "DRAFT",
            isDeleted: false
        };
        try {
            const data = await apiFetch(url, {
                method: "POST",
                body: JSON.stringify(payload)
            });
            logApi("POST", url, payload, data);
            return data;
        } catch (error) {
            logApi("POST", url, payload, null, error);
            throw error;
        }
    },

    updateExam: async (id, examData) => {
        const url = `${BASE_URL}/exams/${id}`;

        if (DEBUG) {
            await delay(MOCK_API_DELAY);
            const idx = mockExams.findIndex(e => e.id === Number(id));
            if (idx !== -1) {
                mockExams[idx] = { ...mockExams[idx], ...examData };
                saveMockData(mockExams);
                return mockExams[idx];
            }
            return { id, ...examData };
        }

        // Payload alignment with Exam.java
        const payload = {
            courseId: Number(examData.courseId),
            batchId: examData.batchId ? Number(examData.batchId) : null,
            title: examData.title,
            examType: (examData.examType === "quiz" ? "MCQ" : examData.examType || "MIXED").toUpperCase(),
            totalMarks: Number(examData.totalMarks),
            passPercentage: examData.passPercentage || 40.0,
            durationMinutes: Number(examData.durationMinutes || 60),
            status: examData.status || "DRAFT",
            isDeleted: false
        };
        try {
            const data = await apiFetch(url, {
                method: "PUT",
                body: JSON.stringify(payload)
            });
            logApi("PUT", url, payload, data);
            return data;
        } catch (error) {
            logApi("PUT", url, payload, null, error);
            throw error;
        }
    },

    scheduleExam: async (id, scheduleData) => {
        const url = `${BASE_URL}/exams/${id}/schedule`;
        if (DEBUG) return { status: "scheduled", id, ...scheduleData };
        try {
            const data = await apiFetch(url, {
                method: "POST",
                body: JSON.stringify(scheduleData)
            });
            logApi("POST", url, scheduleData, data);
            return data;
        } catch (error) {
            logApi("POST", url, scheduleData, null, error);
            throw error;
        }
    },

    getExamById: async (id) => {
        const url = `${BASE_URL}/exams/${id}`;
        if (DEBUG) {
            await delay(MOCK_API_DELAY);
            return mockExams.find(e => e.id === Number(id)) || null;
        }
        try {
            const exam = await apiFetch(url);
            if (!exam) return null;
            // Map to frontend model
            return {
                id: exam.exam_id || exam.id || exam.examId,
                title: exam.title,
                courseId: exam.course_id || exam.courseId,
                batchId: exam.batch_id || exam.batchId,
                type: (exam.exam_type || exam.examType || "MIXED").toLowerCase(),
                totalMarks: exam.total_marks || exam.totalMarks || 0,
                passPercentage: exam.pass_percentage || exam.passPercentage || 40,
                durationMinutes: exam.duration_minutes || exam.durationMinutes || exam.duration || 0,
                duration: exam.duration_minutes || exam.durationMinutes || exam.duration || 0,
                status: exam.status || "DRAFT",
                course: exam.course_name || exam.courseName || exam.course || "General",
                batch: exam.batch_name || exam.batchName || exam.batch || "All Batches"
            };
        } catch (error) {
            logApi("GET", url, null, null, error);
            return null;
        }
    },

    // Status Management
    publishExam: async (id) => {
        const url = `${BASE_URL}/exams/${id}/publish`;
        if (DEBUG) {
            await delay(MOCK_API_DELAY);
            const idx = mockExams.findIndex(e => e.id === Number(id));
            if (idx !== -1) {
                mockExams[idx].status = "PUBLISHED";
                saveMockData(mockExams);
            }
            return mockExams[idx];
        }
        try {
            return await apiFetch(url, { method: "PUT" });
        } catch (error) {
            logApi("PUT", url, null, null, error);
            throw error;
        }
    },

    closeExam: async (id) => {
        const url = `${BASE_URL}/exams/${id}/close`;
        if (DEBUG) {
            await delay(MOCK_API_DELAY);
            const idx = mockExams.findIndex(e => e.id === Number(id));
            if (idx !== -1) {
                mockExams[idx].status = "CLOSED";
                saveMockData(mockExams);
            }
            return mockExams[idx];
        }
        try {
            return await apiFetch(url, { method: "PUT" });
        } catch (error) {
            logApi("PUT", url, null, null, error);
            throw error;
        }
    },

    deleteExam: async (id, hard = false) => {
        const url = `${BASE_URL}/exams/${id}${hard ? "/hard" : ""}`;
        if (DEBUG) {
            await delay(MOCK_API_DELAY);
            mockExams = mockExams.filter(e => e.id !== Number(id));
            saveMockData(mockExams);
            return { status: "deleted" };
        }
        try {
            return await apiFetch(url, { method: "DELETE" });
        } catch (error) {
            logApi("DELETE", url, null, null, error);
            throw error;
        }
    },

    // ================= QUESTIONS =================

    addExamQuestions: async (examId, questions) => {
        const url = `${BASE_URL}/exams/${examId}/questions`;

        if (DEBUG) {
            await delay(MOCK_API_DELAY);
            const idx = mockExams.findIndex(e => e.id === Number(examId));
            if (idx !== -1) {
                // Mock adding questions
                const mockQuestions = questions.map(q => ({
                    examQuestionId: Math.floor(Math.random() * 10000),
                    examId: Number(examId),
                    questionId: q.id || q.questionId,
                    marks: q.marks || 1,
                    questionOrder: q.order || q.questionOrder || 0
                }));
                mockExams[idx].questions = [...(mockExams[idx].questions || []), ...mockQuestions];
                saveMockData(mockExams);
                return mockQuestions;
            }
            return [];
        }

        // Payload alignment with ExamQuestion.java (Spring Boot expects camelCase default)
        const payload = questions.map(q => ({
            examId: Number(examId),
            questionId: q.id || q.questionId || q.question_id,
            marks: Number(q.marks || 1),
            questionOrder: Number(q.order || q.questionOrder || q.question_order || 0)
        }));
        try {
            const data = await apiFetch(url, {
                method: "POST",
                body: JSON.stringify(payload)
            });
            logApi("POST", url, payload, data);
            return data;
        } catch (error) {
            logApi("POST", url, payload, null, error);
            throw error;
        }
    },

    getExamQuestions: async (examId) => {
        const url = `${BASE_URL}/exams/${examId}/questions/view`;
        if (DEBUG) {
            await delay(MOCK_API_DELAY);
            const exam = mockExams.find(e => e.id === Number(examId));
            return exam ? (exam.questions || []) : [];
        }
        try {
            const data = await apiFetch(url);
            console.log("⬇️ Raw Exam Questions Response:", data); // Debug log

            // Map Table 7 (exam_question) + Question entity to frontend
            return (data || []).map(item => {
                // If the backend returns a nested question object or a flattened one
                const q = item.question || item;
                const rawType = (q.questionType || q.type || "MCQ").toUpperCase();

                let options = q.options || [];
                // Handle stringified JSON options (common in some DB setups)
                if (typeof options === 'string') {
                    try { options = JSON.parse(options); } catch (e) { options = []; }
                }

                // Handle options normalization
                let finalOptions = [];
                if (Array.isArray(options)) {
                    finalOptions = options.map(o => {
                        if (typeof o === 'string') return o;
                        // If option is object, try common fields
                        return o.optionText || o.text || o.value || o.content || JSON.stringify(o);
                    });
                }

                return {
                    id: q.questionId || q.id || item.questionId,
                    question: q.questionText || q.question_text || q.question || q.content || q.text || q.description || "No text content",
                    type: rawType === "MCQ" ? "quiz" : rawType.toLowerCase(),
                    marks: item.marks || q.marks || 1,
                    options: finalOptions,
                    testCases: q.testCases || [],
                    starterCode: q.starterCode || q.starter_code || "",
                    language: q.language || "javascript"
                };
            });
        } catch (error) {
            logApi("GET", url, null, null, error);
            return [];
        }
    },

    // ================= STUDENT ATTEMPTS & PERFORMANCE =================

    startAttempt: async (examId, studentId) => {
        const url = `${BASE_URL}/exams/${examId}/attempts/start?studentId=${studentId}`;
        if (DEBUG) {
            await delay(MOCK_API_DELAY);
            return {
                id: Math.floor(Math.random() * 10000),
                examId: Number(examId),
                studentId: studentId,
                status: "STARTED",
                startTime: new Date().toISOString()
            };
        }
        try {
            const data = await apiFetch(url, { method: "POST" });
            logApi("POST", url, { studentId }, data);
            return data;
        } catch (error) {
            logApi("POST", url, { studentId }, null, error);
            throw error;
        }
    },

    submitAttempt: async (attemptId, studentId) => {
        const url = `${BASE_URL}/exams/attempts/${attemptId}/submit?studentId=${studentId}`;
        if (DEBUG) {
            await delay(MOCK_API_DELAY);
            return { status: "submitted", attemptId, studentId };
        }
        try {
            const data = await apiFetch(url, { method: "POST" });
            logApi("POST", url, { studentId }, data);
            return data;
        } catch (error) {
            logApi("POST", url, { studentId }, null, error);
            throw error;
        }
    },

    submitResponse: async (payload) => {
        const url = `${BASE_URL}/exams/responses`;
        if (DEBUG) {
            // No delay for smoother typing/interaction in mock
            return { status: "recorded", ...payload };
        }
        // Alignment with Table 10: exam_response
        const schemaPayload = {
            attempt_id: payload.attemptId,
            exam_question_id: payload.examQuestionId,
            selected_option_id: payload.selectedOptionId || null,
            descriptive_answer: payload.descriptiveAnswer || null,
            coding_submission_path: payload.codingSubmissionPath || null,
            evaluation_type: payload.evaluationType || "AUTO"
        };
        try {
            const data = await apiFetch(url, {
                method: "POST",
                body: JSON.stringify(schemaPayload)
            });
            logApi("POST", url, schemaPayload, data);
            return data;
        } catch (error) {
            logApi("POST", url, schemaPayload, null, error);
            throw error;
        }
    },

    getLeaderboard: async (scope = "global") => {
        if (DEBUG) {
            await delay(MOCK_API_DELAY);
            return [];
        }
        return await apiFetch(`${BASE_URL}/leaderboard?scope=${scope}`);
    },

    getReports: async () => {
        if (DEBUG) {
            await delay(MOCK_API_DELAY);
            return [];
        }
        return await apiFetch(`${BASE_URL}/reports/exams`);
    },

    getExamPaper: async (id) => {
        try {
            const exam = await ExamService.getExamById(id);
            if (!exam) throw new Error("Exam not found");
            const questions = await ExamService.getExamQuestions(id);
            return { ...exam, questions };
        } catch (error) {
            logApi("COMPOSITE", "getExamPaper", { id }, null, error);
            throw error;
        }
    }
};
