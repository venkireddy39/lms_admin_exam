import { apiFetch } from "../../../services/api";

const BASE_URL = "/api/student-batches";

export const enrollmentService = {
    // Note: Backend has no "Get All" endpoint. 
    // We return empty array to prevent frontend errors until a proper endpoint exists.
    getAllEnrollments: async () => {
        console.warn("getAllEnrollments called but backend 'StudentBatchController' has no 'list all' endpoint.");
        return [];
    },

    getStudentsByBatch: (batchId) => apiFetch(`${BASE_URL}/batch/${batchId}`),

    addStudentToBatch: (data) => {
        console.log("Enrollment Payload (Routing to Management Service):", data);
        // Sending to StudentBatchController
        return apiFetch(`${BASE_URL}/enroll`, {
            method: "POST",
            body: JSON.stringify(data)
        });
    },

    removeStudentFromBatch: (id) => apiFetch(`${BASE_URL}/${id}`, {
        method: "DELETE"
    }),

    /* 
       Note: The backend endpoint '/api/student-batch-transfers/transfer' uses Query Params
       as per Controller: @RequestParam studentId, @RequestParam courseId, ...
    */
    transferStudent: ({ studentId, courseId, toBatchId, reason }) => {
        const queryParams = new URLSearchParams({
            studentId,
            courseId,
            toBatchId,
            reason
        }).toString();

        return apiFetch(`/api/student-batch-transfers/transfer?${queryParams}`, {
            method: "POST"
        });
    },

    getAllUsers: async () => {
        const fetchResource = async (url, explicitRole = null) => {
            try {
                const data = await apiFetch(url);
                let results = [];
                if (Array.isArray(data)) results = data;
                else if (data && data.content) results = data.content;
                else if (data && data.data) results = data.data;

                if (results.length > 0 && explicitRole) {
                    return results.map(u => ({ ...u, role: u.role || explicitRole }));
                }
                return results;
            } catch (e) {
                console.warn(`Fetch failed for ${url}`, e);
                return [];
            }
        };

        // Fetch from multiple sources to be absolutely sure we get everyone
        const [adminUsers, adminStudents] = await Promise.all([
            fetchResource('/admin/users').catch(() => []),
            fetchResource('/admin/getstudents', 'STUDENT').catch(() => [])
        ]);

        // Merge and deduplicate
        const allFetched = [...adminUsers, ...adminStudents];
        const uniqueMap = new Map();

        allFetched.forEach(u => {
            const core = u.user || u;
            const id = core.userId || core.id || u.userId || u.id || u.studentId;
            if (id && !uniqueMap.has(String(id))) {
                uniqueMap.set(String(id), u);
            }
        });

        return Array.from(uniqueMap.values());
    }
};
