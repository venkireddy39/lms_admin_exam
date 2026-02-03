import { apiFetch } from "../services/api";

const API_BASE_URL = "/student";

export const studentService = {
    getMyCourses: async () => {
        try {
            return await apiFetch(`${API_BASE_URL}/courses`, {
                headers: { "Cache-Control": "no-cache" }
            });
        } catch (error) {
            console.error("Failed to fetch student courses", error);
            return [];
        }
    },

    getMyBatches: async () => {
        try {
            return await apiFetch(`${API_BASE_URL}/batches`, {
                headers: { "Cache-Control": "no-cache" }
            });
        } catch (error) {
            console.error("Failed to fetch student batches", error);
            return [];
        }
    },

    getMyAttendance: async () => {
        try {
            return await apiFetch(`${API_BASE_URL}/attendance`, {
                headers: { "Cache-Control": "no-cache" }
            });
        } catch (error) {
            console.error("Failed to fetch student attendance", error);
            return [];
        }
    },

    getMyLibraryBooks: async () => {
        try {
            return await apiFetch(`${API_BASE_URL}/library/books`, {
                headers: { "Cache-Control": "no-cache" }
            });
        } catch (error) {
            console.error("Failed to fetch student library books", error);
            return [];
        }
    },

    getProfile: async () => {
        try {
            return await apiFetch(`${API_BASE_URL}/profile`, {
                headers: { "Cache-Control": "no-cache" }
            });
        } catch (error) {
            console.error("Failed to fetch student profile", error);
            return null;
        }
    },

    getCourseContent: async (courseId) => {
        try {
            // This might vary based on your backend; assuming /student/courses/{id}/content
            return await apiFetch(`${API_BASE_URL}/courses/${courseId}/content`);
        } catch (error) {
            console.error(`Failed to fetch content for course ${courseId}`, error);
            return null;
        }
    },

    getAssignments: async () => {
        try {
            return await apiFetch(`${API_BASE_URL}/assignments`);
        } catch (error) {
            console.error("Failed to fetch assignments", error);
            return [];
        }
    },

    getGrades: async () => {
        try {
            return await apiFetch(`${API_BASE_URL}/grades`);
        } catch (error) {
            console.error("Failed to fetch grades", error);
            return [];
        }
    }
};
