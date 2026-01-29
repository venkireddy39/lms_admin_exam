
const BASE_URL = "/admin";

const getAuthHeader = () => {
    // Attempt to get token from storage, fallback to env for dev
    const token = localStorage.getItem("authToken")
        || localStorage.getItem("token")
        || import.meta.env.VITE_DEV_AUTH_TOKEN;
    return token ? { Authorization: `Bearer ${token}` } : {};
};

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
    getAllUsers: async () => {
        const res = await fetch(`${BASE_URL}/users`, {
            headers: { ...getAuthHeader(), "Cache-Control": "no-cache" }
        });
        if (!res.ok) throw new Error(`Status: ${res.status} - ${await res.text()}`);
        return await res.json();
    },

    // Get all students (Joined Data)
    getAllStudents: async () => {
        const res = await fetch(`${BASE_URL}/getstudents`, {
            headers: { ...getAuthHeader(), "Cache-Control": "no-cache" }
        });
        if (!res.ok) throw new Error(`Status: ${res.status} - ${await res.text()}`);
        return await res.json();
    },

    // Get all instructors
    getAllInstructors: async () => {
        const res = await fetch(`${BASE_URL}/getinstructors`, {
            headers: { ...getAuthHeader(), "Cache-Control": "no-cache" }
        });
        if (!res.ok) throw new Error(`Status: ${res.status} - ${await res.text()}`);
        return await res.json();
    },

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
                // Prefer explicit first/last name, fallback to split if only name provided
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

            // TODO: Add Admin/Affiliate when endpoints are available
            default:
                throw new Error(`Creation for role '${userData.role}' is not supported yet.`);
        }

        const res = await fetch(`${BASE_URL}${endpoint}`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                ...getAuthHeader()
            },
            body: JSON.stringify(body)
        });

        if (!res.ok) {
            const errorText = await res.text();
            throw new Error(errorText || "Failed to create user");
        }

        return await res.text();
    },

    // Delete User
    deleteUser: async (userId) => {
        const res = await fetch(`${BASE_URL}/users/${userId}`, {
            method: "DELETE",
            headers: getAuthHeader()
        });
        if (!res.ok) throw new Error("Failed to delete user");
        return true;
    },

    // Toggle Status (Enable/Disable)
    toggleStatus: async (userId, currentStatus) => {
        // currentStatus in backend is 'enabled' (boolean), frontend might use "Active"/"Inactive"
        // If passed status is "Active", we want to disable.

        const isCurrentlyActive = currentStatus === 'Active' || currentStatus === true;
        const action = isCurrentlyActive ? 'disable' : 'enable';

        const res = await fetch(`${BASE_URL}/users/${userId}/${action}`, {
            method: "PATCH",
            headers: getAuthHeader()
        });

        if (!res.ok) throw new Error("Failed to update status");
        return true;
    }
};
