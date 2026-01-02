const EXAMS_KEY = "exams";
const EXAM_SCHEDULES_KEY = "examSchedules";

export const ExamService = {
    // Get all exams
    getExams: () => {
        try {
            const exams = localStorage.getItem(EXAMS_KEY);
            return exams ? JSON.parse(exams) : [];
        } catch (error) {
            console.error("Error fetching exams:", error);
            return [];
        }
    },

    // Save a new exam
    saveExam: (examData) => {
        try {
            const exams = ExamService.getExams();
            const newExam = {
                ...examData,
                id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
                dateCreated: new Date().toISOString(),
                status: "upcoming"
            };

            const updatedExams = [newExam, ...exams];
            localStorage.setItem(EXAMS_KEY, JSON.stringify(updatedExams));
            return newExam;
        } catch (error) {
            console.error("Error saving exam:", error);
            throw error;
        }
    },

    // Update an exam
    updateExam: (id, updatedData) => {
        const exams = ExamService.getExams();
        const index = exams.findIndex(e => e.id === id);
        if (index !== -1) {
            exams[index] = { ...exams[index], ...updatedData };
            localStorage.setItem(EXAMS_KEY, JSON.stringify(exams));
            return exams[index];
        }
        return null;
    },

    // Delete an exam
    deleteExam: (id) => {
        const exams = ExamService.getExams();
        const updatedExams = exams.filter(e => e.id !== id);
        localStorage.setItem(EXAMS_KEY, JSON.stringify(updatedExams));
        return updatedExams;
    },

    // Get Exam by ID
    getExamById: (id) => {
        const exams = ExamService.getExams();
        return exams.find(e => e.id === id);
    },

    // Schedule Exam
    scheduleExam: (scheduleData) => {
        const schedules = JSON.parse(localStorage.getItem(EXAM_SCHEDULES_KEY)) || [];
        schedules.push(scheduleData);
        localStorage.setItem(EXAM_SCHEDULES_KEY, JSON.stringify(schedules));
    }
};
