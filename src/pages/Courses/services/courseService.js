import { apiFetch } from "../../../services/api";

const API_BASE_URL = "/api/courses";

export const courseService = {
    // Fetch all courses
    getCourses: async () => {
        try {
            const data = await apiFetch(API_BASE_URL);
            if (Array.isArray(data)) {
                localStorage.setItem('lms_courses_cache', JSON.stringify(data));
                return data;
            }
            const cached = localStorage.getItem('lms_courses_cache');
            return cached ? JSON.parse(cached) : [];
        } catch (error) {
            console.warn("API failed to get courses, using cache", error);
            const cached = localStorage.getItem('lms_courses_cache');
            return cached ? JSON.parse(cached) : [];
        }
    },

    // Get a course by ID
    getCourseById: (id) => apiFetch(`${API_BASE_URL}/${id}`),

    // Create a new course
    createCourse: (data) => apiFetch(API_BASE_URL, {
        method: 'POST',
        body: JSON.stringify(data)
    }),

    // Update an existing course
    updateCourse: (id, data) => apiFetch(`${API_BASE_URL}/${id}`, {
        method: 'PUT',
        body: JSON.stringify(data)
    }),

    // Toggle enable / disable (Reuse PUT)
    updateCourseStatus: (id, status) => courseService.updateCourse(id, { status }),

    // Toggle sharing (Reuse PUT)
    updateShareStatus: (id, enabled) => courseService.updateCourse(id, { shareEnabled: enabled }),

    // Delete a course (Hard Delete)
    deleteCourse: (id) => apiFetch(`${API_BASE_URL}/${id}/hard`, { method: 'DELETE' }),

    // Upload Course Image
    uploadCourseImage: async (courseId, imageFile) => {
        const formData = new FormData();
        formData.append("image", imageFile);

        // Note: For FormData, we let the browser set the Content-Type header.
        // apiFetch currently sets Content-Type to application/json by default.
        // We need to pass empty headers or null to prevent this if apiFetch handles it,
        // or just use raw fetch with the centralized token logic.

        // Let's use apiFetch but pass an option to NOT set content-type if we can, 
        // OR better, update apiFetch to handle FormData.

        return apiFetch(`${API_BASE_URL}/${courseId}/image`, {
            method: 'PUT',
            headers: { 'Content-Type': null }, // Signal to apiFetch to NOT set it
            body: formData
        });
    },

    // Get a course by Share Code
    getCourseByShareCode: (shareCode) => apiFetch(`${API_BASE_URL}/share/${shareCode}`)
};
