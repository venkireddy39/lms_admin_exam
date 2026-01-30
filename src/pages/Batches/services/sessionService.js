import { apiFetch } from "../../../services/api";

export const API_BASE_URL = "/api/sessions";
export const API_BASE_URL_CONTENT = "/api/session-contents";

export const sessionService = {
    // ================= SESSIONS (REAL BACKEND) =================

    getSessionsByBatchId: (batchId) =>
        apiFetch(`${API_BASE_URL}/batch/${batchId}`, { headers: { "Cache-Control": "no-cache" } }),

    getSessionById: (sessionId) =>
        apiFetch(`${API_BASE_URL}/${sessionId}`, { headers: { "Cache-Control": "no-cache" } }),

    createSession: (sessionData) => {
        const { batchId, ...payload } = sessionData;
        if (!batchId) throw new Error("Batch ID is required to create a session");
        return apiFetch(`${API_BASE_URL}/batch/${batchId}`, {
            method: "POST",
            body: JSON.stringify(payload),
        });
    },

    updateSession: (sessionId, sessionData) =>
        apiFetch(`${API_BASE_URL}/${sessionId}`, {
            method: "PUT",
            body: JSON.stringify(sessionData),
        }),

    deleteSession: (sessionId) =>
        apiFetch(`${API_BASE_URL}/${sessionId}`, { method: "DELETE" }),

    // ================= CONTENT (VIDEO/PDF) =================
    getSessionContents: (sessionId) =>
        apiFetch(`${API_BASE_URL_CONTENT}/session/${sessionId}`, { headers: { "Cache-Control": "no-cache" } }),

    createSessionContent: (sessionId, contentData) =>
        apiFetch(`${API_BASE_URL_CONTENT}/session/${sessionId}`, {
            method: "POST",
            body: JSON.stringify(contentData),
        }),

    deleteSessionContent: (contentId) =>
        apiFetch(`${API_BASE_URL_CONTENT}/${contentId}`, { method: "DELETE" }),

    // ================= UPLOAD (Multipart PUT) =================
    uploadSessionContentFile: (contentId, file) => {
        const formData = new FormData();
        formData.append("file", file);
        return apiFetch(`${API_BASE_URL_CONTENT}/${contentId}/upload`, {
            method: "PUT",
            headers: { 'Content-Type': null }, // Signal to apiFetch
            body: formData,
        });
    },

    // ================= PREVIEW (BLOB) =================
    previewSessionContent: (contentId) =>
        apiFetch(`${API_BASE_URL_CONTENT}/preview/${contentId}`), // Note: apiFetch expects JSON by default, need to handle BLOB
};
