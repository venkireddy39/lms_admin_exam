
import { ATTENDANCE_LIMITATIONS, ATTENDANCE_STATUS } from "../constants/attendanceConstants";

export const isDateFuture = (dateString) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const selected = new Date(dateString);
    selected.setHours(0, 0, 0, 0);
    return selected > today;
};

export const isDateEditable = (dateString) => {
    if (isDateFuture(dateString)) return false;

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const selected = new Date(dateString);
    selected.setHours(0, 0, 0, 0);

    const diffTime = Math.abs(today - selected);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    return diffDays <= ATTENDANCE_LIMITATIONS.EDIT_WINDOW_DAYS;
};

export const getAttendanceStats = (attendanceList) => {
    const total = attendanceList.length;
    const present = attendanceList.filter(a => a.status === ATTENDANCE_STATUS.PRESENT).length;
    const absent = attendanceList.filter(a => a.status === ATTENDANCE_STATUS.ABSENT).length;
    const late = attendanceList.filter(a => a.status === ATTENDANCE_STATUS.LATE).length;
    const excused = attendanceList.filter(a => a.status === ATTENDANCE_STATUS.EXCUSED).length;
    const percentage = total > 0 ? Math.round((present / total) * 100) : 0;

    return { total, present, absent, late, excused, percentage };
};
