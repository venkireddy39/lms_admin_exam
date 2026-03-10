import { apiFetch } from "../../../services/api";

// Matches exactly @RequestMapping("/admin") in your friend's Controller
const BASE_URL = "/admin";

export const userService = {
    // Matches @GetMapping("/users")
    getAllUsers: async () => {
        const data = await apiFetch(`${BASE_URL}/users`);
        return (data || []).map(user => ({
            ...user,
            id: user.userId || user.id,
            userId: user.userId || user.id,
            name: user.name || `${user.firstName || ''} ${user.lastName || ''}`.trim(),
            role: user.role || user.roleName?.replace('ROLE_', '') || 'User'
        }));
    },

    // Matches @GetMapping("/users/{userId}")
    getUserById: (id) => apiFetch(`${BASE_URL}/users/${id}`),

    // Matches @GetMapping("/getstudents")
    getAllStudents: async () => {
        const data = await apiFetch(`${BASE_URL}/getstudents`);
        return (data || []).map(item => ({
            ...item,
            id: item.studentId || item.id,
            user: {
                ...item.user,
                name: item.user?.name || `${item.user?.firstName || ''} ${item.user?.lastName || ''}`.trim()
            }
        }));
    },

    // Matches @GetMapping("/getinstructors")
    getAllInstructors: () => apiFetch(`${BASE_URL}/getinstructors`),

    // Matches @PostMapping("/students"), /instructors, etc.
    createUser: async (userData) => {
        const roleEndpointMap = {
            'Student': '/students',
            'Instructor': '/instructors',
            'Parent': '/parents',
            'Affiliate': '/affiliates',
            'Driver': '/drivers',
            'Conductor': '/conductors'
        };

        const endpoint = roleEndpointMap[userData.role] || '/students';
        
        // Map UI role to backend ROLE_ constant
        const roleName = `ROLE_${(userData.role || 'Student').toUpperCase()}`;

        const body = {
            firstName: userData.firstName,
            lastName: userData.lastName,
            email: userData.email,
            password: userData.password,
            phone: userData.mobile || userData.phone,
            roleName: roleName, // Fixes the "roleName cannot be null" Hibernate error
            ...(userData.role === 'Student' && {
                dob: userData.dob,
                gender: userData.gender,
                batchId: userData.batchId
            })
        };

        return apiFetch(`${BASE_URL}${endpoint}`, {
            method: "POST",
            body: JSON.stringify(body)
        });
    },

    // Matches @PatchMapping("/users/{userId}/enable") or /disable
    toggleStatus: (userId, isCurrentlyEnabled) => {
        const action = isCurrentlyEnabled ? 'disable' : 'enable';
        return apiFetch(`${BASE_URL}/users/${userId}/${action}`, { method: "PATCH" });
    },

    // Updated to point to Management Service (5151)
    getAuditLogs: () => apiFetch(`/api/v1/audit-logs`)
};
