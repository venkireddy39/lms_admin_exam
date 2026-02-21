
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
    if (!data.batchName) errors.push("Batch Name is required");
    if (!data.courseId) errors.push("Course is required");
    if (!data.startDate) errors.push("Start Date is required");
    if (!data.endDate) errors.push("End Date is required");


    if (data.startDate && data.endDate) {
        if (new Date(data.startDate) >= new Date(data.endDate)) {
            errors.push("End Date must be after Start Date");
        }
    }

    if (data.maxStudents && Number(data.maxStudents) < 0) {
        errors.push("Batch Limit cannot be negative");
    }

    if (data.fee === "" || data.fee === null) {
        errors.push("Batch Fee is required");
    } else if (Number(data.fee) < 0) {
        errors.push("Batch Fee cannot be negative");
    }

    if (!data.trainerId || !data.trainerName) {
        errors.push("An instructor must be selected");
    }

    return errors;
};

export const calculateProgress = (students, maxStudents) => {
    if (!maxStudents || maxStudents === 0) return 0;
    const pct = (students / maxStudents) * 100;
    return Math.min(pct, 100);
};
