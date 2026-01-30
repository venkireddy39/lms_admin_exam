import { apiFetch } from "../../../services/api";

const API_BASE_URL = "/api";

export const topicService = {
    /* ================= TOPICS ================= */

    getTopics: (courseId) =>
        apiFetch(`${API_BASE_URL}/topics/course/${courseId}`, { headers: { "Cache-Control": "no-cache" } }),

    createTopic: (courseId, data) =>
        apiFetch(`${API_BASE_URL}/topics/course/${courseId}`, {
            method: "POST",
            body: JSON.stringify({
                topicName: data.title,
                topicDescription: data.description || "",
                status: "ACTIVE",
            }),
        }),

    updateTopic: (topicId, data) =>
        apiFetch(`${API_BASE_URL}/topics/${topicId}`, {
            method: "PUT",
            body: JSON.stringify({
                topicName: data.title,
                topicDescription: data.description || "",
                status: "ACTIVE",
            }),
        }),

    deleteTopic: (topicId) =>
        apiFetch(`${API_BASE_URL}/topics/${topicId}`, { method: "DELETE" }),

    /* ================= CONTENT ================= */

    getContents: (topicId) =>
        apiFetch(`${API_BASE_URL}/topic-contents/topic/${topicId}`, { headers: { "Cache-Control": "no-cache" } }),

    getContentById: (contentId) =>
        apiFetch(`${API_BASE_URL}/topic-contents/${contentId}`, { headers: { "Cache-Control": "no-cache" } }),

    createContent: (topicId, data) => {
        let contentType = "VIDEO";
        if (data.type === "pdf") contentType = "PDF";
        if (data.type === "heading") contentType = "TEXT";

        return apiFetch(`${API_BASE_URL}/topic-contents/topic/${topicId}`, {
            method: "POST",
            body: JSON.stringify({
                contentType,
                contentTitle: data.title,
                contentDescription: data.description || "",
                fileUrl: data.url || null,
                contentSource: data.url ? "EXTERNAL" : "UPLOAD",
            }),
        });
    },

    updateContent: (contentId, data) =>
        apiFetch(`${API_BASE_URL}/topic-contents/${contentId}`, {
            method: "PUT",
            body: JSON.stringify({
                contentTitle: data.title,
                contentDescription: data.description,
                contentOrder: data.order,
                isPreview: data.isPreview,
                fileUrl: data.url,
            }),
        }),

    deleteContent: (contentId) =>
        apiFetch(`${API_BASE_URL}/topic-contents/${contentId}`, { method: "DELETE" }),

    uploadContentFile: async (contentId, file) => {
        const formData = new FormData();
        formData.append("contentIds", String(contentId));
        formData.append("files", file);

        return apiFetch(`${API_BASE_URL}/topic-contents/upload-files`, {
            method: "PUT",
            headers: { 'Content-Type': null }, // Signal to apiFetch
            body: formData,
        });
    },
};
