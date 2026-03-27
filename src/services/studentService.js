import { apiFetch } from "./api";

const API_BASE_URL = "/api-identity/students";

export const studentService = {
    // 1. Get My Enrollment
    getMyBatches: async () => {
        return apiFetch(`${API_BASE_URL}/my/batches`);
    },

    // 2. Get My Courses
    getMyCourses: async () => {
        return apiFetch(`${API_BASE_URL}/my/courses`);
    },

    // 3. Get My Attendance
    getMyAttendance: async () => {
        return apiFetch(`${API_BASE_URL}/my/attendance`);
    },

    // 4. Get Course Content
    getCourseContent: async (courseId) => {
        return apiFetch(`/api/courses/${courseId}/content`);
    },

    // 5. Get My Certificates
    getMyCertificates: async () => {
        return apiFetch(`${API_BASE_URL}/my/certificates`);
    },

    // 6. Get Profile
    getProfile: async () => {
        return apiFetch(`${API_BASE_URL}/my/profile`);
    },

    // 7. Update Profile
    updateProfile: async (profileData) => {
        return apiFetch(`${API_BASE_URL}/my/profile`, {
            method: 'PUT',
            body: JSON.stringify(profileData)
        });
    },

    // 8. Get Calendar Events
    getCalendarEvents: async () => {
        return apiFetch(`${API_BASE_URL}/my/calendar`);
    },

    // 9. Get Grades
    getMyGrades: async () => {
        return apiFetch(`${API_BASE_URL}/my/grades`);
    },

    // 10. Get Exams
    getMyExams: async () => {
        return apiFetch(`${API_BASE_URL}/my/exams`);
    },

    // 11. Get Assignments
    getMyAssignments: async () => {
        return apiFetch(`${API_BASE_URL}/my/assignments`);
    },

    // 12. Get Notifications
    getNotifications: async () => {
        return apiFetch(`${API_BASE_URL}/my/notifications`);
    },

    // 13. Get Webinars
    getWebinars: async () => {
        return apiFetch(`${API_BASE_URL}/my/webinars`);
    },

    // 14. Get Hostel Data
    getHostelData: async () => {
        return apiFetch(`${API_BASE_URL}/my/hostel`);
    },

    // 15. Submit Maintenance Ticket
    submitMaintenanceTicket: async (data) => {
        return apiFetch(`${API_BASE_URL}/my/hostel/maintenance`, {
            method: 'POST',
            body: JSON.stringify(data)
        });
    },

    // 16. Submit Outpass Application
    submitOutpassApplication: async (data) => {
        return apiFetch(`${API_BASE_URL}/my/hostel/outpass`, {
            method: 'POST',
            body: JSON.stringify(data)
        });
    },

    // 17. Download Hostel Receipt
    downloadHostelReceipt: async (month) => {
        return apiFetch(`${API_BASE_URL}/my/hostel/receipt/${month}`);
    },

    // 18. Get Library Books
    getMyLibraryBooks: async () => {
        return apiFetch(`${API_BASE_URL}/my/library/books`);
    },

    // 19. Get Library History
    getLibraryHistory: async () => {
        return apiFetch(`${API_BASE_URL}/my/library/history`);
    },

    // 20. Exam Lifecycle (New Flow)
    getExamDetails: async (examId) => {
        return apiFetch(`/api/exams/${examId}`);
    },
    startExam: async (examId) => {
        return apiFetch(`/api/exams/${examId}/attempts/start`, { method: 'POST' });
    },
    getExamQuestions: async (sectionId) => {
        const data = await apiFetch(`/api/sections/${sectionId}/questions`);
        return (data || []).map(q => ({
            ...q,
            id: q.questionId || q.id,
            questionText: q.questionText || q.question || "Untitled Question",
            questionType: (q.questionType || q.type || "MCQ").toUpperCase()
        }));
    },
    saveResponse: async (attemptId, responseData) => {
        return apiFetch(`/api/exam-attempts/${attemptId}/responses`, {
            method: 'POST',
            body: JSON.stringify(responseData)
        });
    },
    submitExam: async (examId, attemptId) => {
        return apiFetch(`/api/exams/${examId}/attempts/${attemptId}/submit`, { method: 'POST' });
    }
};
