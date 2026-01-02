
import { BATCH_STATUS } from "../constants/batchConstants";

export const getBatchStatus = (startDate, endDate) => {
    if (!startDate || !endDate) return BATCH_STATUS.UPCOMING; // Default

    const start = new Date(startDate);
    const end = new Date(endDate);
    const today = new Date();
    // Reset time for accurate date comparison
    today.setHours(0, 0, 0, 0);
    start.setHours(0, 0, 0, 0);
    end.setHours(0, 0, 0, 0);

    if (start > today) {
        return BATCH_STATUS.UPCOMING;
    } else if (end < today) {
        return BATCH_STATUS.COMPLETED;
    } else {
        return BATCH_STATUS.ONGOING;
    }
};

export const validateBatchForm = (data) => {
    const errors = [];
    if (!data.name) errors.push("Batch Name is required");
    if (!data.courseId) errors.push("Course is required");
    if (!data.startDate) errors.push("Start Date is required");
    if (!data.endDate) errors.push("End Date is required");
    if (!data.trainer) errors.push("Trainer is required");
    if (!data.maxStudents || data.maxStudents < 1) errors.push("Valid Max Students limit is required");

    if (data.startDate && data.endDate) {
        if (new Date(data.startDate) >= new Date(data.endDate)) {
            errors.push("End Date must be after Start Date");
        }
    }

    return errors;
};

export const calculateProgress = (students, maxStudents) => {
    if (!maxStudents || maxStudents === 0) return 0;
    const pct = (students / maxStudents) * 100;
    return Math.min(pct, 100);
};
