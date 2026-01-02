
export const ATTENDANCE_STATUS = {
    PRESENT: 'Present',
    ABSENT: 'Absent',
    LATE: 'Late',
    EXCUSED: 'Excused',
    PENDING: 'Pending' // Not marked yet
};

export const ATTENDANCE_LIMITATIONS = {
    EDIT_WINDOW_DAYS: 7, // Can only edit last 7 days
    FUTURE_MARKING: false // Cannot mark future
};
