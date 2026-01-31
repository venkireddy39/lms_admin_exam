import { apiFetch } from "../../../services/api";

export const API_BASE_URL = "/api/sessions";
export const API_BASE_URL_CONTENT = "/api/session-contents";

// ================= LOCAL STORAGE HELPERS =================
const STORAGE_KEYS = {
    SESSIONS: 'lms_academic_sessions'
};

const getStorage = (key) => {
    try {
        const item = localStorage.getItem(key);
        return item ? JSON.parse(item) : [];
    } catch { return []; }
};

const setStorage = (key, val) => {
    localStorage.setItem(key, JSON.stringify(val));
};

export const sessionService = {
    // ================= SESSIONS (REAL BACKEND) =================

    getSessionsByBatchId: async (batchId) => {
        console.log(`[sessionService] Fetching sessions for batchId: ${batchId}`);
        try {
            const data = await apiFetch(`${API_BASE_URL}/batch/${batchId}`, { headers: { "Cache-Control": "no-cache" } });
            console.log(`[sessionService] Received ${data?.length || 0} sessions from API`);
            return Array.isArray(data) ? data : [];
        } catch (e) {
            console.warn(`[sessionService] API fetch failed for batch ${batchId}, falling back to local storage`, e);
            const sessions = getStorage(STORAGE_KEYS.SESSIONS);
            const filtered = sessions.filter(s => String(s.batchId) === String(batchId));
            console.log(`[sessionService] Found ${filtered.length} sessions in local storage`);
            return filtered;
        }
    },

    getSessionById: async (sessionId) => {
        try {
            return await apiFetch(`${API_BASE_URL}/${sessionId}`, { headers: { "Cache-Control": "no-cache" } });
        } catch (e) {
            const sessions = getStorage(STORAGE_KEYS.SESSIONS);
            return sessions.find(s => String(s.sessionId) === String(sessionId));
        }
    },

    createSession: async (sessionData) => {
        const { batchId } = sessionData;
        console.log(`[sessionService] Creating session for batch ${batchId}`, sessionData);
        if (!batchId) throw new Error("Batch ID is required to create a session");

        try {
            // Keep batchId in body as well, many backends need it for mapping
            const response = await apiFetch(`${API_BASE_URL}/batch/${batchId}`, {
                method: "POST",
                body: JSON.stringify(sessionData),
            });
            console.log("[sessionService] Session created successfully in API");
            return response;
        } catch (e) {
            console.warn("[sessionService] API creation failed, storing in local storage", e);
            const sessions = getStorage(STORAGE_KEYS.SESSIONS);
            const newSession = { ...sessionData, sessionId: Date.now() };
            sessions.push(newSession);
            setStorage(STORAGE_KEYS.SESSIONS, sessions);
            return newSession;
        }
    },

    updateSession: async (sessionId, sessionData) => {
        try {
            return await apiFetch(`${API_BASE_URL}/${sessionId}`, {
                method: "PUT",
                body: JSON.stringify(sessionData),
            });
        } catch (e) {
            const sessions = getStorage(STORAGE_KEYS.SESSIONS);
            const idx = sessions.findIndex(s => String(s.sessionId) === String(sessionId));
            if (idx !== -1) {
                sessions[idx] = { ...sessions[idx], ...sessionData };
                setStorage(STORAGE_KEYS.SESSIONS, sessions);
            }
            return sessions[idx];
        }
    },

    deleteSession: async (sessionId) => {
        try {
            await apiFetch(`${API_BASE_URL}/${sessionId}`, { method: "DELETE" });
        } catch (e) {
            const sessions = getStorage(STORAGE_KEYS.SESSIONS);
            const filtered = sessions.filter(s => String(s.sessionId) !== String(sessionId));
            setStorage(STORAGE_KEYS.SESSIONS, filtered);
        }
        return true;
    },

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

