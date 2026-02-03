import { apiFetch } from "../../../services/api";

const BASE_URL = "/admin";

// Helper to split name for backend compatibility
const splitName = (fullName) => {
    if (!fullName) return { firstName: '', lastName: '.' };
    const parts = fullName.trim().split(/\s+/);
    if (parts.length === 1) return { firstName: parts[0], lastName: '.' };

    const firstName = parts[0];
    const lastName = parts.slice(1).join(' ');
    return { firstName, lastName };
};

export const userService = {
    // Get all users
    getAllUsers: () => apiFetch(`${BASE_URL}/users`),

    // Get Single User
    getUserById: (id) => apiFetch(`${BASE_URL}/users/${id}`),

    // Get all students (Joined Data)
    getAllStudents: () => apiFetch(`${BASE_URL}/getstudents`),

    // Get all instructors
    getAllInstructors: () => apiFetch(`${BASE_URL}/getinstructors`),

    // Create User (Student, Instructor, Parent)
    createUser: async (userData) => {
        let endpoint = "";
        let body = {};

        switch (userData.role) {
            case 'Learner':
            case 'Student':
                endpoint = "/students";
                let sFName = userData.firstName;
                let sLName = userData.lastName;
                if (!sFName && userData.name) {
                    const split = splitName(userData.name);
                    sFName = split.firstName;
                    sLName = split.lastName;
                }
                body = {
                    firstName: sFName,
                    lastName: sLName,
                    email: userData.email,
                    password: userData.password,
                    phone: userData.phone || userData.mobile,
                    dob: userData.dob,
                    gender: userData.gender,
                    roleName: "ROLE_STUDENT"
                };
                break;

            case 'Instructor':
                endpoint = "/instructors";
                let iFName = userData.firstName;
                let iLName = userData.lastName;
                if (!iFName && userData.name) {
                    const split = splitName(userData.name);
                    iFName = split.firstName;
                    iLName = split.lastName;
                }
                body = {
                    firstName: iFName,
                    lastName: iLName,
                    email: userData.email,
                    password: userData.password,
                    phone: userData.mobile || userData.phone,
                    roleName: "ROLE_INSTRUCTOR"
                };
                break;

            case 'Parent':
                endpoint = "/parents";
                const pName = splitName(userData.name);
                body = {
                    firstName: pName.firstName,
                    lastName: pName.lastName,
                    email: userData.email,
                    password: userData.password,
                    phone: userData.mobile,
                    roleName: "ROLE_PARENT"
                };
                break;

            default:
                throw new Error(`Creation for role '${userData.role}' is not supported yet.`);
        }

        return apiFetch(`${BASE_URL}${endpoint}`, {
            method: "POST",
            body: JSON.stringify(body)
        });
    },

    // Delete User
    deleteUser: (userId) => apiFetch(`${BASE_URL}/users/${userId}`, { method: "DELETE" }),

    // Toggle Status (Enable/Disable)
    toggleStatus: (userId, currentStatus) => {
        const isCurrentlyActive = currentStatus === 'Active' || currentStatus === true;
        const action = isCurrentlyActive ? 'disable' : 'enable';
        return apiFetch(`${BASE_URL}/users/${userId}/${action}`, { method: "PATCH" });
    }
};
