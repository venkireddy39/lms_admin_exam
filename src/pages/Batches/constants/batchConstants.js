
export const BATCH_STATUS = {
    UPCOMING: 'Upcoming',
    ONGOING: 'Ongoing',
    COMPLETED: 'Completed'
};

export const INITIAL_BATCH_FORM = {
    name: "",
    courseId: "", // Linked Course
    courseName: "", // For display/denormalization
    startDate: "",
    endDate: "",
    trainer: "",
    students: 0,
    maxStudents: 60
};

export const BATCH_TABS = {
    ALL: 'All',
    UPCOMING: 'Upcoming',
    ONGOING: 'Ongoing',
    COMPLETED: 'Completed'
};
