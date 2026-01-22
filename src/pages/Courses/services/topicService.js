const API_BASE_URL = "/api";

const getAuthHeader = () => {
    const token =
        localStorage.getItem("authToken") ||
        import.meta.env.VITE_DEV_AUTH_TOKEN;

    return token ? { Authorization: `Bearer ${token}` } : {};
};

export const topicService = {
    /* ================= TOPICS ================= */

    getTopics: async (courseId) => {
        const res = await fetch(
            `${API_BASE_URL}/topics/course/${courseId}`,
            { headers: { ...getAuthHeader(), "Cache-Control": "no-cache" } }
        );
        if (!res.ok) throw new Error(await res.text());
        return res.json();
    },

    createTopic: async (courseId, data) => {
        const res = await fetch(
            `${API_BASE_URL}/topics/course/${courseId}`,
            {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    ...getAuthHeader(),
                },
                body: JSON.stringify({
                    topicName: data.title,
                    topicDescription: data.description || "",
                    status: "ACTIVE",
                }),
            }
        );
        if (!res.ok) throw new Error(await res.text());
        return res.json();
    },

    updateTopic: async (topicId, data) => {
        const res = await fetch(
            `${API_BASE_URL}/topics/${topicId}`,
            {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                    ...getAuthHeader(),
                },
                body: JSON.stringify({
                    topicName: data.title,
                    topicDescription: data.description || "",
                    status: "ACTIVE",
                }),
            }
        );
        if (!res.ok) throw new Error(await res.text());
        return res.json();
    },

    deleteTopic: async (topicId) => {
        const res = await fetch(
            `${API_BASE_URL}/topics/${topicId}`,
            {
                method: "DELETE",
                headers: getAuthHeader(),
            }
        );
        if (!res.ok) throw new Error(await res.text());
        return true;
    },

    /* ================= CONTENT ================= */

    getContents: async (topicId) => {
        const res = await fetch(
            `${API_BASE_URL}/topic-contents/topic/${topicId}`,
            { headers: { ...getAuthHeader(), "Cache-Control": "no-cache" } }
        );
        if (!res.ok) throw new Error(await res.text());
        return res.json();
    },

    getContentById: async (contentId) => {
        const res = await fetch(
            `${API_BASE_URL}/topic-contents/${contentId}`,
            { headers: { ...getAuthHeader(), "Cache-Control": "no-cache" } }
        );
        if (!res.ok) throw new Error(await res.text());
        return res.json();
    },

    createContent: async (topicId, data) => {
        let contentType = "VIDEO";
        if (data.type === "pdf") contentType = "PDF";
        if (data.type === "heading") contentType = "TEXT";

        // Determine source type based on inputs
        let contentSource = "UPLOAD"; // Default
        if (data.url) contentSource = "EXTERNAL_URL";
        // Or if the backend expects "FILE" vs "URL", let's try a safe common convention or simply pass what the backend likely needs. 
        // Given the error `Column 'content_source' cannot be null`, let's send a value. 

        // I'll try sending "UPLOAD" for files and "EXTERNAL" for URLs. 
        // Better yet, I'll update the payload to include this.

        const res = await fetch(
            `${API_BASE_URL}/topic-contents/topic/${topicId}`,
            {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    ...getAuthHeader(),
                },
                body: JSON.stringify({
                    contentType,
                    contentTitle: data.title,
                    contentDescription: data.description || "",
                    fileUrl: data.url || null,
                    contentSource: data.url ? "EXTERNAL" : "UPLOAD", // ✅ Fix 500 Error
                }),
            }
        );
        if (!res.ok) throw new Error(await res.text());
        return res.json();
    },

    updateContent: async (contentId, data) => {
        const res = await fetch(
            `${API_BASE_URL}/topic-contents/${contentId}`,
            {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                    ...getAuthHeader(),
                },
                body: JSON.stringify({
                    contentTitle: data.title,
                    contentDescription: data.description, // ✅ REQUIRED
                    contentOrder: data.order,
                    isPreview: data.isPreview, // ✅ Pass isPreview flag
                    fileUrl: data.url, // ✅ Pass URL for external links
                }),
            }
        );
        if (!res.ok) throw new Error(await res.text());
        return res.json();
    },

    deleteContent: async (contentId) => {
        const res = await fetch(
            `${API_BASE_URL}/topic-contents/${contentId}`,
            {
                method: "DELETE",
                headers: getAuthHeader(),
            }
        );
        if (!res.ok) throw new Error(await res.text());
        return true;
    },

    uploadContentFile: async (contentId, file) => {
        const formData = new FormData();
        formData.append("contentIds", String(contentId));
        formData.append("files", file);

        const res = await fetch(
            `${API_BASE_URL}/topic-contents/upload-files`,
            {
                method: "PUT",
                headers: getAuthHeader(), // ❌ no Content-Type
                body: formData,
            }
        );

        if (!res.ok) throw new Error(await res.text());
        return true;
    },
};
