// src/config/navigation.js

export const navigationConfig = [
    {
        id: 'dashboard',
        label: 'Dashboard',
        path: '/admin/dashboard',
        icon: 'bi-speedometer2'
    },

    {
        id: 'attendance',
        label: 'Attendance',
        path: '/admin/attendance',
        icon: 'bi-calendar-check'
    },

    {
        id: 'academics',
        label: 'Academics',
        path: '/admin/courses',
        icon: 'bi-mortarboard',
        subItems: [
            { label: 'Courses', path: '/admin/courses', icon: 'bi-journal-text' },
            { label: 'Webinars', path: '/admin/webinar', icon: 'bi-camera-video' },
            { label: 'Certificates', path: '/admin/certificates', icon: 'bi-award' }
        ]
    },

    {
        id: 'exams',
        label: 'Exams',
        path: '/admin/exams/dashboard',
        icon: 'bi-clipboard-check',
        subItems: [
            { label: 'Dashboard', path: '/admin/exams/dashboard', icon: 'bi-grid' },
            { label: 'Question Bank', path: '/admin/exams/question-bank', icon: 'bi-collection' },
            { label: 'Create Exam', path: '/admin/exams/create-exam', icon: 'bi-plus-square' },
            { label: 'Schedule', path: '/admin/exams/schedule', icon: 'bi-calendar' },
            { label: 'Reattempt', path: '/admin/exams/reattempt', icon: 'bi-arrow-repeat' },
            { label: 'Reports', path: '/admin/exams/reports', icon: 'bi-file-text' },
            { label: 'Leaderboard', path: '/admin/exams/leaderboard', icon: 'bi-trophy' },
            { label: 'Settings', path: '/admin/exams/settings', icon: 'bi-gear' }
        ]
    },

    {
        id: 'library',
        label: 'Library',
        path: '/admin/library',
        icon: 'bi-book',
        subItems: [
            { label: 'Dashboard', path: '/admin/library', icon: 'bi-speedometer2' },
            { label: 'Books', path: '/admin/library/books', icon: 'bi-book' },
            { label: 'Members', path: '/admin/library/members', icon: 'bi-people' },
            { label: 'Issues', path: '/admin/library/issues', icon: 'bi-journal-arrow-down' },
            { label: 'Reservations', path: '/admin/library/reservations', icon: 'bi-bookmark' },
            { label: 'Rules', path: '/admin/library/circulation-rules', icon: 'bi-list-ul' },
            { label: 'Settings', path: '/admin/library/settings', icon: 'bi-gear' }
        ]
    },

    {
        id: 'users',
        label: 'Users',
        path: '/admin/users',
        icon: 'bi-people',
        subItems: [
            { label: 'All Users', path: '/admin/users', icon: 'bi-people-fill' },
            { label: 'Instructors', path: '/admin/users?tab=instructors', icon: 'bi-person-video3' }
        ]
    },

    {
        id: 'finance',
        label: 'Finance',
        path: '/admin/fee',
        icon: 'bi-cash-coin',
        subItems: [
            { label: 'Fee Management', path: '/admin/fee', icon: 'bi-credit-card' },
            { label: 'Invoices', path: '/admin/invoices', icon: 'bi-file-text' }
        ]
    },

    {
        id: 'marketing',
        label: 'Marketing',
        path: '/admin/marketing',
        icon: 'bi-megaphone',
        subItems: [
            { label: 'Marketing Hub', path: '/admin/marketing', icon: 'bi-bar-chart' },
            { label: 'Website Builder', path: '/admin/websites', icon: 'bi-globe' },
            { label: 'Mobile App', path: '/admin/myapp', icon: 'bi-phone' }
        ]
    },

    {
        id: 'affiliates',
        label: 'Affiliates',
        path: '/admin/affiliates',
        icon: 'bi-share',
        subItems: [
            { label: 'All Affiliates', path: '/admin/affiliates', icon: 'bi-people' },
            { label: 'Partner Portal', path: '/admin/affiliate/portal', icon: 'bi-layout-text-window-reverse' }
        ]
    },

    {
        id: 'settings',
        label: 'Settings',
        path: '/admin/settings',
        icon: 'bi-gear',
        subItems: [
            { label: 'General', path: '/admin/settings', icon: 'bi-sliders' },
            { label: 'Audit Logs', path: '/admin/audit-logs', icon: 'bi-clipboard-data' }
        ]
    }
];

export const studentNavigationConfig = [
    {
        id: 'dashboard',
        label: 'Dashboard',
        path: '/student/dashboard',
        icon: 'bi-grid-1x2'
    },
    {
        id: 'courses',
        label: 'My Courses',
        path: '/student/courses',
        icon: 'bi-journal-bookmark'
    },
    {
        id: 'content',
        label: 'Learning Content',
        path: '/student/content',
        icon: 'bi-play-btn'
    },
    {
        id: 'assignments',
        label: 'Assignments',
        path: '/student/assignments',
        icon: 'bi-clipboard-check'
    },
    {
        id: 'exams',
        label: 'Exams',
        path: '/student/exams',
        icon: 'bi-pencil-square'
    },
    {
        id: 'grades',
        label: 'Grades',
        path: '/student/grades',
        icon: 'bi-graph-up'
    },
    {
        id: 'calendar',
        label: 'Calendar',
        path: '/student/calendar',
        icon: 'bi-calendar3'
    },
    {
        id: 'communication',
        label: 'Communication',
        path: '/student/communication',
        icon: 'bi-chat-dots'
    },
    {
        id: 'profile',
        label: 'Profile',
        path: '/student/profile',
        icon: 'bi-person-circle'
    },
    {
        id: 'certificates',
        label: 'Certificates',
        path: '/student/certificates',
        icon: 'bi-award'
    },
    {
        id: 'support',
        label: 'Support',
        path: '/student/support',
        icon: 'bi-question-circle'
    }
];
