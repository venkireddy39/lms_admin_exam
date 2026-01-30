import { apiFetch } from "../../../services/api";

const API_BASE_URL = "/api/student-batches";

export const studentBatchService = {
    // ================= ENROLL =================
    enrollStudent: (enrollmentData) =>
        apiFetch(`${API_BASE_URL}/enroll`, {
            method: "POST",
            body: JSON.stringify(enrollmentData),
        }),

    // ================= VIEW BY BATCH =================
    getStudentsByBatch: (batchId) =>
        apiFetch(`${API_BASE_URL}/batch/${batchId}`, { headers: { "Cache-Control": "no-cache" } }),

    // ================= VIEW OWN =================
    getStudentBatch: (studentId) =>
        apiFetch(`${API_BASE_URL}/student/${studentId}`, { headers: { "Cache-Control": "no-cache" } }),

    // ================= UPDATE =================
    updateEnrollment: (studentBatchId, updatedData) =>
        apiFetch(`${API_BASE_URL}/${studentBatchId}`, {
            method: "PUT",
            body: JSON.stringify(updatedData),
        })
};
