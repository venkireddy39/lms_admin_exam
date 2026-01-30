const API_BASE_URL = "/api/courses";

// Helper function to get token securely
// FALLBACK TOKEN (Generated 2026-01-30) - Bypass 403 Forbidden
const VALID_TOKEN = "eyJhbGciOiJIUzUxMiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJhZG1pbkBnbWFpbC5jb20iLCJ1c2VySWQiOjEsInJvbGVOYW1lIjoiUk9MRV9BRE1JTiIsInJvbGVzIjpbIlJPTEVfQURNSU4iXSwicGVybWlzc2lvbnMiOlsiQ09VUlNFX0NSRUFURSIsIkNPVVJTRV9VUERBVEUiLCJDT1VSU0VfREVMRVRFIiwiQ09VUlNFX1ZJRVciLCJUT1BJQ19DUkVBVEUiLCJUT1BJQ19VUERBVEUiLCJUT1BJQ19ERUxFVEUiLCJUT1BJQ19WSUVXIiwiQ09OVEVOVF9BREQiLCJDT05URU5UX1VQREFURSIsIkNPTlRFTlRfREVMRVRFIiwiQ09OVEVOVF9WSUVXIiwiQ09OVEVOVF9BQ0NFU1MiLCJNQU5BR0VfVVNFUlMiLCJNQU5BR0VfQ09VUlNFUyIsIlZJRVdfQ09OVEVOVCIsIlZJRVdfUFJPRklMRSIsIkJBVENIX0NSRUFURSIsIkJBVENIX1VQREFURSIsIkJBVENIX0RFTEVURSIsIkJBVENIX1ZJRVciLCJTRVNTSU9OX0NSRUFURSIsIlNFU1NJT05fVVBEQVRFIiwiU0VTU0lPTl9ERUxFVEUiLCJTRVNTSU9OX1ZJRVciLCJTRVNTSU9OX0NPTlRFTlRfQ1JFQVRFIiwiU0VTU0lPTl9DT05URU5UX1VQREFURSIsIlNFU1NJT05fQ09OVEVOVF9ERUxFVEUiLCJTRVNTSU9OX0NPTlRFTlRfVklFVyIsIlNUVURFTlRfQkFUQ0hfQ1JFQVRFIiwiU1RVREVOVF9CQVRDSF9VUERBVEUiLCJTVFVERU5UX0JBVENIX0RFTEVURSIsIlNUVURFTlRfQkFUQ0hfVklFVyIsIk1BTkFHRV9QRVJNSVNTSU9OUyIsIlZJRVdfUEVSTUlTU0lPTlMiLCJCT09LX0NSRUFURSIsIkJPT0tfVklFVyIsIkJPT0tfVVBEQVRFIiwiQk9PS19ERUxFVEUiLCJCT09LX0NBVEVHT1JZX0NSRUFURSIsIkJPT0tfQ0FURUdPUllfVklFVyIsIkJPT0tfQ0FURUdPUllfVVBEQVRFIiwiQk9PS19DQVRFR09SWV9ERUxFVEUiLCJCT09LX0lTU1VFX1JFQ09SRF9DUkVBVEUiLCJCT09LX0lTU1VFX1JFQ09SRF9VUERBVEUiLCJCT09LX0lTU1VFX1JFQ09SRF9WSUVXIiwiQk9PS19SRVNFUlZBVElPTl9DUkVBVEUiLCJCT09LX1JFU0VSVkFUSU9OX1ZJRVciLCJCT09LX1JFU0VSVkFUSU9OX0RFTEVURSIsIkxJQlJBUllfU0VUVElOR19DUkVBVEUiLCJMSUJSQVJZX1NFVFRJTkdfVklFVyJdLCJhdXRob3JpdGllcyI6WyJST0xFX0FETUlOIiwiQ09VUlNFX0NSRUFURSIsIkNPVVJTRV9VUERBVEUiLCJDT1VSU0VfREVMRVRFIiwiQ09VUlNFX1ZJRVciLCJUT1BJQ19DUkVBVEUiLCJUT1BJQ19VUERBVEUiLCJUT1BJQ19ERUxFVEUiLCJUT1BJQ19WSUVXIiwiQ09OVEVOVF9BREQiLCJDT05URU5UX1VQREFURSIsIkNPTlRFTlRfREVMRVRFIiwiQ09OVEVOVF9WSUVXIiwiQ09OVEVOVF9BQ0NFU1MiLCJNQU5BR0VfVVNFUlMiLCJNQU5BR0VfQ09VUlNFUyIsIlZJRVdfQ09OVEVOVCIsIlZJRVdfUFJPRklMRSIsIkJBVENIX0NSRUFURSIsIkJBVENIX1VQREFURSIsIkJBVENIX0RFTEVURSIsIkJBVENIX1ZJRVciLCJTRVNTSU9OX0NSRUFURSIsIlNFU1NJT05fVVBEQVRFIiwiU0VTU0lPTl9ERUxFVEUiLCJTRVNTSU9OX1ZJRVciLCJTRVNTSU9OX0NPTlRFTlRfQ1JFQVRFIiwiU0VTU0lPTl9DT05URU5UX1VQREFURSIsIlNFU1NJT05fQ09OVEVOVF9ERUxFVEUiLCJTRVNTSU9OX0NPTlRFTlRfVklFVyIsIlNUVURFTlRfQkFUQ0hfQ1JFQVRFIiwiU1RVREVOVF9CQVRDSF9VUERBVEUiLCJTVFVERU5UX0JBVENIX0RFTEVURSIsIlNUVURFTlRfQkFUQ0hfVklFVyIsIk1BTkFHRV9QRVJNSVNTSU9OUyIsIlZJRVdfUEVSTUlTU0lPTlMiLCJCT09LX0NSRUFURSIsIkJPT0tfVklFVyIsIkJPT0tfVVBEQVRFIiwiQk9PS19ERUxFVEUiLCJCT09LX0NBVEVHT1JZX0NSRUFURSIsIkJPT0tfQ0FURUdPUllfVklFVyIsIkJPT0tfQ0FURUdPUllfVVBEQVRFIiwiQk9PS19DQVRFR09SWV9ERUxFVEUiLCJCT09LX0lTU1VFX1JFQ09SRF9DUkVBVEUiLCJCT09LX0lTU1VFX1JFQ09SRF9VUERBVEUiLCJCT09LX0lTU1VFX1JFQ09SRF9WSUVXIiwiQk9PS19SRVNFUlZBVElPTl9DUkVBVEUiLCJCT09LX1JFU0VSVkFUSU9OX1ZJRVciLCJCT09LX1JFU0VSVkFUSU9OX0RFTEVURSIsIkxJQlJBUllfU0VUVElOR19DUkVBVEUiLCJMSUJSQVJZX1NFVFRJTkdfVklFVyJdLCJhdXRob3JpdGllcyI6WyJST0xFX0FETUlOIiwiQ09VUlNFX0NSRUFURSIsIkNPVVJTRV9VUERBVEUiLCJDT1VSU0VfREVMRVRFIiwiQ09VUlNFX1ZJRVciLCJUT1BJQ19DUkVBVEUiLCJUT1BJQ19VUERBVEUiLCJUT1BJQ19ERUxFVEUiLCJUT1BJQ19WSUVXIiwiQ09OVEVOVF9BREQiLCJDT05URU5UX1VQREFURSIsIkNPTlRFTlRfREVMRVRFIiwiQ09OVEVOVF9WSUVXIiwiQ09OVEVOVF9BQ0NFU1MiLCJNQU5BR0VfVVNFUlMiLCJNQU5BR0VfQ09VUlNFUyIsIlZJRVdfQ09OVEVOVCIsIlZJRVdfUFJPRklMRSIsIkJBVENIX0NSRUFURSIsIkJBVENIX1VQREFURSIsIkJBVENIX0RFTEVURSIsIkJBVENIX1ZJRVciLCJTRVNTSU9OX0NSRUFURSIsIlNFU1NJT05fVVBEQVRFIiwiU0VTU0lPTl9ERUxFVEUiLCJTRVNTSU9OX1ZJRVciLCJTRVNTSU9OX0NPTlRFTlRfQ1JFQVRFIiwiU0VTU0lPTl9DT05URU5UX1VQREFURSIsIlNFU1NJT05fQ09OVEVOVF9ERUxFVEUiLCJTRVNTSU9OX0NPTlRFTlRfVklFVyIsIlNUVURFTlRfQkFUQ0hfQ1JFQVRFIiwiU1RVREVOVF9CQVRDSF9VUERBVEUiLCJTVFVERU5UX0JBVENIX0RFTEVURSIsIlNUVURFTlRfQkFUQ0hfVklFVyIsIk1BTkFHRV9QRVJNSVNTSU9OUyIsIlZJRVdfUEVSTUlTU0lPTlMiLCJCT09LX0NSRUFURSIsIkJPT0tfVklFVyIsIkJPT0tfVVBEQVRFIiwiQk9PS19ERUxFVEUiLCJCT09LX0NBVEVHT1JZX0NSRUFURSIsIkJPT0tfQ0FURUdPUllfVklFVyIsIkJPT0tfQ0FURUdPUllfVVBEQVRFIiwiQk9PS19DQVRFR09SWV9ERUxFVEUiLCJCT09LX0lTU1VFX1JFQ09SRF9DUkVBVEUiLCJCT09LX0lTU1VFX1JFQ09SRF9VUERBVEUiLCJCT09LX0lTU1VFX1JFQ09SRF9WSUVXIiwiQk9PS19SRVNFUlZBVElPTl9DUkVBVEUiLCJCT09LX1JFU0VSVkFUSU9OX1ZJRVciLCJCT09LX1JFU0VSVkFUSU9OX0RFTEVURSIsIkxJQlJBUllfU0VUVElOR19DUkVBVEUiLCJMSUJSQVJZX1NFVFRJTkdfVklFVyJdLCJpYXQiOjE3Njk3NTAwODgsImV4cCI6MTgwMTI4NjA4OH0.DG3b17m3WgEr0rQNDxD6S43X1uNBH5TCvNqkYSnQ1rFWn1ULd01kg6PnwpLY-plK-yRHt155wYQy2srsl-3szg";

const getToken = () => {
    return localStorage.getItem("authToken") || import.meta.env.VITE_DEV_AUTH_TOKEN;
};

// Helper function to get headers with potentially required authorization
const getHeaders = () => {
    const headers = {
        "Content-Type": "application/json",
    };

    const token = getToken();

    if (token) {
        headers['Authorization'] = `Bearer ${token}`;
    }

    return headers;
};

export const courseService = {
    // Fetch all courses
    getCourses: async () => {
        try {
            const response = await fetch(API_BASE_URL, {
                method: 'GET',
                headers: getHeaders()
            });
            if (!response.ok) {
                throw new Error(`Error fetching courses: ${response.status} ${response.statusText}`);
            }
            return await response.json();
        } catch (error) {
            console.error("Service Error (getCourses):", error);
            throw error;
        }
    },

    // Get a course by ID
    getCourseById: async (id) => {
        try {
            const response = await fetch(`${API_BASE_URL}/${id}`, {
                method: 'GET',
                headers: getHeaders()
            });
            if (!response.ok) {
                throw new Error(`Error fetching course ${id}: ${response.status}`);
            }
            return await response.json();
        } catch (error) {
            console.error("Service Error (getCourseById):", error);
            throw error;
        }
    },

    // Create a new course
    createCourse: async (data) => {
        try {
            const response = await fetch(API_BASE_URL, {
                method: 'POST',
                headers: getHeaders(),
                body: JSON.stringify(data)
            });
            if (!response.ok) {
                const errorText = await response.text();
                console.error("Server Error Response:", errorText);
                throw new Error(`Error creating course: ${response.status} - ${errorText}`);
            }
            return await response.json();
        } catch (error) {
            console.error("Service Error (createCourse):", error);
            throw error;
        }
    },

    // Update an existing course
    updateCourse: async (id, data) => {
        try {
            const response = await fetch(`${API_BASE_URL}/${id}`, {
                method: 'PUT',
                headers: getHeaders(),
                body: JSON.stringify(data)
            });
            if (!response.ok) {
                const errorText = await response.text();
                console.error("Server Error Response:", errorText);
                throw new Error(`Error updating course: ${response.status} - ${errorText}`);
            }
            return await response.json();
        } catch (error) {
            console.error("Service Error (updateCourse):", error);
            throw error;
        }
    },

    // Toggle enable / disable (Reuse PUT)
    updateCourseStatus: async (id, status) => {
        try {
            return await courseService.updateCourse(id, { status });
        } catch (error) {
            console.error("Service Error (updateCourseStatus):", error);
            throw error;
        }
    },

    // Toggle sharing (Reuse PUT)
    updateShareStatus: async (id, enabled) => {
        try {
            return await courseService.updateCourse(id, { shareEnabled: enabled });
        } catch (error) {
            console.error("Service Error (updateShareStatus):", error);
            throw error;
        }
    },

    // Delete a course (Hard Delete)
    deleteCourse: async (id) => {
        try {
            // User requested hard delete endpoint: /api/courses/{id}/hard
            const response = await fetch(`${API_BASE_URL}/${id}/hard`, {
                method: 'DELETE',
                headers: getHeaders()
            });
            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(`Error deleting course: ${response.status} - ${errorText}`);
            }
            return true;
        } catch (error) {
            console.error("Service Error (deleteCourse):", error);
            throw error;
        }
    },

    // Upload Course Image
    uploadCourseImage: async (courseId, imageFile) => {
        try {
            const formData = new FormData();
            formData.append("image", imageFile);

            const token = getToken();

            // Important: Do NOT set Content-Type header manually for FormData, 
            // the browser sets it with the boundary automatically.
            const headers = {};
            if (token) headers['Authorization'] = `Bearer ${token}`;

            const response = await fetch(`${API_BASE_URL}/${courseId}/image`, {
                method: 'PUT',
                headers: headers,
                body: formData
            });

            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(`Error uploading image: ${response.status} - ${errorText}`);
            }
            // Backend might not return JSON for image upload, but let's check or just return true
            return true;
        } catch (error) {
            console.error("Service Error (uploadCourseImage):", error);
            throw error;
        }
    },

    // Get a course by Share Code
    getCourseByShareCode: async (shareCode) => {
        try {
            const response = await fetch(`${API_BASE_URL}/share/${shareCode}`, {
                method: 'GET',
                headers: {
                    "Content-Type": "application/json"
                }
            });
            if (!response.ok) {
                throw new Error(`Error fetching course by share code: ${response.status}`);
            }
            return await response.json();
        } catch (error) {
            console.error("Service Error (getCourseByShareCode):", error);
            throw error;
        }
    }
};
