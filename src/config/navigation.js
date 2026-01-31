// src/config/navigation.js

export const navigationConfig = [
    {
        id: 'dashboard',
        label: 'Dashboard',
        path: '/dashboard',
        icon: 'bi-speedometer2'
    },

    {
        id: 'attendance',
        label: 'Attendance',
        path: '/attendance',
        icon: 'bi-calendar-check'
    },

    {
        id: 'academics',
        label: 'Academics',
        path: '/courses',
        icon: 'bi-mortarboard',
        subItems: [
            { label: 'Courses', path: '/courses', icon: 'bi-journal-text' },
            { label: 'Batches', path: '/batches', icon: 'bi-people' },
            { label: 'Webinars', path: '/webinar', icon: 'bi-camera-video' },
            { label: 'Certificates', path: '/certificates', icon: 'bi-award' }
        ]
    },

    {
        id: 'exams',
        label: 'Exams',
        path: '/exams/dashboard',
        icon: 'bi-clipboard-check',
        subItems: [
            { label: 'Dashboard', path: '/exams/dashboard', icon: 'bi-grid' },
            { label: 'Question Bank', path: '/exams/question-bank', icon: 'bi-collection' },
            { label: 'Create Exam', path: '/exams/create-exam', icon: 'bi-plus-square' },
            { label: 'Schedule', path: '/exams/schedule', icon: 'bi-calendar' },
            { label: 'Reattempt', path: '/exams/reattempt', icon: 'bi-arrow-repeat' },
            { label: 'Reports', path: '/exams/reports', icon: 'bi-file-text' },
            { label: 'Leaderboard', path: '/exams/leaderboard', icon: 'bi-trophy' },
            { label: 'Settings', path: '/exams/settings', icon: 'bi-gear' }
        ]
    },

    {
        id: 'library',
        label: 'Library',
        path: '/library',
        icon: 'bi-book',
        subItems: [
            { label: 'Dashboard', path: '/library', icon: 'bi-speedometer2' },
            { label: 'Books', path: '/library/books', icon: 'bi-book' },
            { label: 'Members', path: '/library/members', icon: 'bi-people' },
            { label: 'Issues', path: '/library/issues', icon: 'bi-journal-arrow-down' },
            { label: 'Reservations', path: '/library/reservations', icon: 'bi-bookmark' },
            { label: 'Rules', path: '/library/circulation-rules', icon: 'bi-list-ul' },
            { label: 'Settings', path: '/library/settings', icon: 'bi-gear' }
        ]
    },

    {
        id: 'users',
        label: 'Users',
        path: '/users',
        icon: 'bi-people',
        subItems: [
            { label: 'All Users', path: '/users', icon: 'bi-people-fill' },
            { label: 'Instructors', path: '/users?tab=instructors', icon: 'bi-person-video3' }
        ]
    },

    {
        id: 'finance',
        label: 'Finance',
        path: '/fee',
        icon: 'bi-cash-coin',
        subItems: [
            { label: 'Fee Management', path: '/fee', icon: 'bi-credit-card' },
            { label: 'Invoices', path: '/invoices', icon: 'bi-file-text' }
        ]
    },

    {
        id: 'marketing',
        label: 'Marketing',
        path: '/marketing',
        icon: 'bi-megaphone',
        subItems: [
            { label: 'Marketing Hub', path: '/marketing', icon: 'bi-bar-chart' },
            { label: 'Website Builder', path: '/websites', icon: 'bi-globe' },
            { label: 'Mobile App', path: '/myapp', icon: 'bi-phone' }
        ]
    },

    {
        id: 'affiliates',
        label: 'Affiliates',
        path: '/affiliates',
        icon: 'bi-share',
        subItems: [
            { label: 'All Affiliates', path: '/affiliates', icon: 'bi-people' },
            { label: 'Partner Portal', path: '/affiliate/portal', icon: 'bi-layout-text-window-reverse' }
        ]
    },

    {
        id: 'settings',
        label: 'Settings',
        path: '/settings',
        icon: 'bi-gear',
        subItems: [
            { label: 'General', path: '/settings', icon: 'bi-sliders' },
            { label: 'Audit Logs', path: '/audit-logs', icon: 'bi-clipboard-data' }
        ]
    }
];
