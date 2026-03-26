import { apiFetch } from "./api";

const BASE_PATH = '/api/instructor';

export const instructorService = {
  // ==========================================
  // 1. BATCH
  // ==========================================
  getAssignedBatches: async (page = 0, size = 10) => {
    return apiFetch(`${BASE_PATH}/batches`, { params: { page, size } });
  },

  getCourseBatchStats: async (courseId) => {
    return apiFetch(`/api/course-batch-stats/course/${courseId}`);
  },

  getStudentsInBatch: async (batchId) => {
    return apiFetch(`${BASE_PATH}/batches/${batchId}/students`);
  },

  // ==========================================
  // 2. COURSE
  // ==========================================
  getAllCourses: async () => {
    return apiFetch(`/api/courses`);
  },

  getTopicsByCourseId: async (courseId) => {
    return apiFetch(`/api/topics/course/${courseId}`);
  },

  // ==========================================
  // 3. SESSION
  // ==========================================
  createSession: async (batchId, sessionData) => {
    return apiFetch(`${BASE_PATH}/batches/${batchId}/sessions`, {
      method: "POST",
      body: JSON.stringify(sessionData)
    });
  },

  updateSession: async (sessionId, sessionData) => {
    return apiFetch(`${BASE_PATH}/sessions/${sessionId}`, {
      method: "PUT",
      body: JSON.stringify(sessionData)
    });
  },

  getSessionsByBatchId: async (batchId) => {
    return apiFetch(`${BASE_PATH}/sessions/batch/${batchId}`);
  },

  deleteSession: async (sessionId) => {
    return apiFetch(`${BASE_PATH}/sessions/${sessionId}`, { method: "DELETE" });
  },

  // ==========================================
  // 4. SESSION CONTENT
  // ==========================================
  createSessionContent: async (sessionId, contentData) => {
    return apiFetch(`/api/session-contents/session/${sessionId}`, {
      method: "POST",
      body: JSON.stringify(contentData)
    });
  },

  updateSessionContent: async (contentId, contentData) => {
    return apiFetch(`/api/session-contents/${contentId}`, {
      method: "PUT",
      body: JSON.stringify(contentData)
    });
  },

  getSessionContents: async (sessionId) => {
    return apiFetch(`/api/session-contents/session/${sessionId}`);
  },

  deleteSessionContent: async (contentId) => {
    return apiFetch(`/api/session-contents/${contentId}`, { method: "DELETE" });
  },

  // ==========================================
  // 5. ATTENDANCE & OFFLINE ATTENDANCE
  // ==========================================
  markAttendance: async (attendanceData) => {
    return apiFetch(`${BASE_PATH}/attendance`, {
      method: "POST",
      body: JSON.stringify(attendanceData)
    });
  },

  updateAttendanceRecord: async (recordId, recordData) => {
    return apiFetch(`/api/attendance/record/${recordId}`, {
      method: "PUT",
      body: JSON.stringify(recordData)
    });
  },

  submitOfflineQueue: async (records) => {
    return apiFetch(`/api/attendance/offline-queue`, {
      method: "POST",
      body: JSON.stringify({ records })
    });
  },

  syncOfflineQueue: async () => {
    return apiFetch(`/api/attendance/offline-queue/sync`, { method: "POST" });
  },

  // ==========================================
  // 6. EXAM & SETTINGS
  // ==========================================
  createExam: async (examData) => {
    return apiFetch(`${BASE_PATH}/exams`, {
      method: "POST",
      body: JSON.stringify(examData)
    });
  },

  scheduleExam: async (scheduleData) => {
    return apiFetch(`/api/exam-schedules`, {
      method: "POST",
      body: JSON.stringify(scheduleData)
    });
  },

  updateExam: async (examId, examData) => {
    return apiFetch(`${BASE_PATH}/exams/${examId}`, {
      method: "PUT",
      body: JSON.stringify(examData)
    });
  },

  updateExamDesign: async (examId, designData) => {
    return apiFetch(`/api/exams/${examId}/design`, {
      method: "PUT",
      body: JSON.stringify(designData)
    });
  },

  updateExamSettings: async (examId, settingsData) => {
    return apiFetch(`/api/exams/${examId}/settings`, {
      method: "PUT",
      body: JSON.stringify(settingsData)
    });
  },

  updateExamProctoring: async (examId, proctoringData) => {
    return apiFetch(`/api/exams/${examId}/proctoring`, {
      method: "PUT",
      body: JSON.stringify(proctoringData)
    });
  },

  updateExamGrading: async (examId, gradingData) => {
    return apiFetch(`/api/exams/${examId}/grading`, {
      method: "PUT",
      body: JSON.stringify(gradingData)
    });
  },

  publishExam: async (examId) => {
    return apiFetch(`${BASE_PATH}/exams/${examId}/publish`, { method: "PUT" });
  },

  closeExam: async (examId) => {
    return apiFetch(`${BASE_PATH}/exams/${examId}/close`, { method: "PUT" });
  },

  getMyExams: async () => {
    return apiFetch(`${BASE_PATH}/exams`);
  },

  // ==========================================
  // 7. QUESTION BANK
  // ==========================================
  createQuestion: async (questionData) => {
    return apiFetch(`/api/questions`, {
      method: "POST",
      body: JSON.stringify(questionData)
    });
  },

  addQuestionOption: async (questionId, optionData) => {
    return apiFetch(`/api/questions/${questionId}/options`, {
      method: "POST",
      body: JSON.stringify(optionData)
    });
  },

  addCodingTestCase: async (questionId, testCaseData) => {
    return apiFetch(`/api/questions/${questionId}/coding-test-cases`, {
      method: "POST",
      body: JSON.stringify(testCaseData)
    });
  },

  // ==========================================
  // 8. EVALUATION & ATTEMPTS
  // ==========================================
  getExamAttempts: async (examId) => {
    return apiFetch(`${BASE_PATH}/exam-attempts/exam/${examId}`);
  },

  evaluateResponse: async (responseId, evaluationData) => {
    return apiFetch(`${BASE_PATH}/evaluate/${responseId}`, {
      method: "POST",
      body: JSON.stringify(evaluationData)
    });
  },

  // ==========================================
  // 9. WEBINAR & INTERACTIONS
  // ==========================================
  createWebinar: async (webinarData) => {
    return apiFetch(`${BASE_PATH}/webinars`, {
      method: "POST",
      body: JSON.stringify(webinarData)
    });
  },

  updateWebinar: async (id, webinarData) => {
    return apiFetch(`${BASE_PATH}/webinars/${id}`, {
      method: "PUT",
      body: JSON.stringify(webinarData)
    });
  },

  getScheduledWebinars: async () => {
    return apiFetch(`${BASE_PATH}/webinars/scheduled`);
  },

  cancelWebinar: async (id) => {
    return apiFetch(`${BASE_PATH}/webinars/${id}/cancel`, { method: "PUT" });
  },

  sendWebinarChatMessage: async (webinarId, messageData) => {
    return apiFetch(`/api/webinar-chat/webinar/${webinarId}`, {
      method: "POST",
      body: JSON.stringify(messageData)
    });
  },

  answerWebinarQuestion: async (questionId, answerData) => {
    return apiFetch(`/api/webinar-questions/${questionId}/answer`, {
      method: "PUT",
      body: JSON.stringify(answerData)
    });
  },

  createWebinarPoll: async (webinarId, pollData) => {
    return apiFetch(`/api/webinar-polls/webinar/${webinarId}`, {
      method: "POST",
      body: JSON.stringify(pollData)
    });
  },

  // ==========================================
  // 10. CERTIFICATE
  // ==========================================
  generateCertificate: async (studentId, certData) => {
    return apiFetch(`${BASE_PATH}/certificates/${studentId}/generate`, {
      method: "POST",
      body: JSON.stringify(certData)
    });
  },

  createCertificateRule: async (ruleData) => {
    return apiFetch(`/api/admin/certificate-rules`, {
      method: "POST",
      body: JSON.stringify(ruleData)
    });
  },

  toggleCertificateRule: async (ruleId, toggleData) => {
    return apiFetch(`/api/admin/certificate-rules/${ruleId}/toggle`, {
      method: "PUT",
      body: JSON.stringify(toggleData)
    });
  },

  createCertificateTemplate: async (templateData) => {
    return apiFetch(`/api/certificate-templates`, {
      method: "POST",
      body: JSON.stringify(templateData)
    });
  },

  updateCertificateTemplate: async (id, templateData) => {
    return apiFetch(`/api/certificate-templates/${id}`, {
      method: "PUT",
      body: JSON.stringify(templateData)
    });
  },

  // ==========================================
  // 11. VIDEO PROGRESS
  // ==========================================
  updateVideoProgress: async (progressData) => {
    return apiFetch(`/api/v1/progress/update`, {
      method: "POST",
      body: JSON.stringify(progressData)
    });
  }
};

export default instructorService;
