import { apiFetch } from "../../../services/api";

const STORAGE_KEYS = {
    STUDENT_BATCHES: 'lms_student_batches',
    USERS: 'lms_mock_users'
};

const getStorage = (key, defaultVal = []) => {
    try {
        const item = localStorage.getItem(key);
        return item ? JSON.parse(item) : defaultVal;
    } catch {
        return defaultVal;
    }
};

const setStorage = (key, val) => {
    localStorage.setItem(key, JSON.stringify(val));
};

export const API_BASE_URL_SB = "/api/student-batches";

export const enrollmentService = {
    // Get students in a specific batch
    getStudentsByBatch: async (batchId) => {
        let apiStudents = [];
        try {
            apiStudents = await apiFetch(`${API_BASE_URL_SB}/batch/${batchId}`, {
                headers: { "Cache-Control": "no-cache" }
            });
        } catch (error) {
            console.warn("API failed, using local storage fallback for getStudents", error);
        }

        const sb = getStorage(STORAGE_KEYS.STUDENT_BATCHES);
        const localStudents = sb.filter(r => String(r.batchId) === String(batchId));

        if (apiStudents.length === 0 && localStudents.length > 0) {
            return localStudents;
        }

        const apiStudentIds = new Set(apiStudents.map(s => String(s.studentId)));
        const uniqueLocal = localStudents.filter(s => !apiStudentIds.has(String(s.studentId)));

        return [...apiStudents, ...uniqueLocal];
    },

    // Add student to a batch (Enroll)
    addStudentToBatch: async (enrollmentData) => {
        try {
            return await apiFetch(`${API_BASE_URL_SB}/enroll`, {
                method: "POST",
                body: JSON.stringify(enrollmentData)
            });
        } catch (error) {
            console.warn("API failed, using local storage fallback for addStudent", error);
            // Fallback continues...
        }

        const sb = getStorage(STORAGE_KEYS.STUDENT_BATCHES);
        const exists = sb.find(r => String(r.batchId) === String(enrollmentData.batchId) && String(r.studentId) === String(enrollmentData.studentId));
        if (exists) return exists;

        const newRecord = { ...enrollmentData, studentBatchId: Date.now() };
        sb.push(newRecord);
        setStorage(STORAGE_KEYS.STUDENT_BATCHES, sb);
        return newRecord;
    },

    // Remove student from batch (Unenroll)
    removeStudentFromBatch: async (studentBatchId) => {
        try {
            await apiFetch(`${API_BASE_URL_SB}/${studentBatchId}`, { method: "DELETE" });
            return true;
        } catch (error) {
            console.warn("API failed, using local storage fallback for removeStudent", error);
        }

        let sb = getStorage(STORAGE_KEYS.STUDENT_BATCHES);
        sb = sb.filter(r => String(r.studentBatchId) !== String(studentBatchId));
        setStorage(STORAGE_KEYS.STUDENT_BATCHES, sb);
        return true;
    },

    // Get all enrollments
    getAllEnrollments: async () => getStorage(STORAGE_KEYS.STUDENT_BATCHES),

    // ================= TRANSFERS =================

    transferStudent: async (transferData) => {
        try {
            if (transferData.studentBatchId) {
                await enrollmentService.removeStudentFromBatch(transferData.studentBatchId);
            }
            const enrollPayload = {
                studentId: transferData.studentId,
                studentName: transferData.studentName,
                studentEmail: transferData.studentEmail,
                courseId: transferData.courseId,
                batchId: transferData.targetBatchId
            };
            return await enrollmentService.addStudentToBatch(enrollPayload);
        } catch (error) {
            console.error("Transfer Failed:", error);
            throw error;
        }
    },

    // ================= USERS =================

    getAllUsers: async () => {
        try {
            const { userService } = await import('../../Users/services/userService');
            const students = await userService.getAllStudents();

            if (!students || students.length === 0) return [];

            return students.map(s => ({
                userId: s.user?.userId,
                studentId: s.studentId,
                firstName: s.user?.firstName,
                lastName: s.user?.lastName,
                email: s.user?.email,
                role: 'Student',
                name: `${s.user?.firstName || ''} ${s.user?.lastName || ''}`.trim()
            }));
        } catch (e) {
            console.warn("Failed to fetch students via userService", e);
            return [];
        }
    },

    getInstructors: async () => {
        const users = await enrollmentService.getAllUsers();
        return users.filter(u =>
            u.role === 'Instructor' ||
            u.role === 'INSTRUCTOR' ||
            u.role?.name === 'Instructor'
        );
    }
};
