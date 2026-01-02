export const statsData = {
    totalRevenue: 250000,
    monthlyRevenue: 15000,
    yearlyRevenue: 180000,
    pendingAmount: 3500,
    totalStudents: 1250,
    newStudents: 45,
};

export const monthlyEnrollmentData = [
    { name: 'Jan', students: 65 },
    { name: 'Feb', students: 59 },
    { name: 'Mar', students: 80 },
    { name: 'Apr', students: 81 },
    { name: 'May', students: 56 },
    { name: 'Jun', students: 55 },
    { name: 'Jul', students: 40 },
    { name: 'Aug', students: 70 },
    { name: 'Sep', students: 90 },
    { name: 'Oct', students: 100 },
    { name: 'Nov', students: 85 },
    { name: 'Dec', students: 110 },
];

export const monthlyRevenueData = [
    { name: 'Jan', revenue: 4000 },
    { name: 'Feb', revenue: 3000 },
    { name: 'Mar', revenue: 2000 },
    { name: 'Apr', revenue: 2780 },
    { name: 'May', revenue: 1890 },
    { name: 'Jun', revenue: 2390 },
    { name: 'Jul', revenue: 3490 },
    { name: 'Aug', revenue: 4000 },
    { name: 'Sep', revenue: 4500 },
    { name: 'Oct', revenue: 5000 },
    { name: 'Nov', revenue: 4800 },
    { name: 'Dec', revenue: 6000 },
];

export const paymentStatusData = [
    { name: 'Paid', value: 85, color: '#10b981' }, // Emerald-500
    { name: 'Pending', value: 15, color: '#f59e0b' }, // Amber-500
];

export const yearlyGrowthData = [
    { year: '2020', students: 400 },
    { year: '2021', students: 600 },
    { year: '2022', students: 800 },
    { year: '2023', students: 1000 },
    { year: '2024', students: 1250 },
];

export const recentActivities = {
    students: [
        {
            id: 1,
            name: "Alice Johnson",
            email: "alice@example.com",
            course: "React Masterclass",
            date: "2024-12-28",
            status: "Active",
            progress: 75,
            avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Alice"
        },
        {
            id: 2,
            name: "Bob Smith",
            email: "bob.smith@test.co",
            course: "Python for Data Science",
            date: "2024-12-27",
            status: "Active",
            progress: 32,
            avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Bob"
        },
        {
            id: 3,
            name: "Charlie Brown",
            email: "charlie.b@domain.net",
            course: "UX Design Fundamentals",
            date: "2024-12-26",
            status: "Pending",
            progress: 0,
            avatar: null // Testing fallback
        },
        {
            id: 4,
            name: "Diana Prince",
            email: "diana.p@wonder.com",
            course: "Advanced Java",
            date: "2024-12-25",
            status: "Active",
            progress: 90,
            avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Diana"
        },
        {
            id: 5,
            name: "Evan Wright",
            email: "evan.w@tech.io",
            course: "Cybersecurity Basics",
            date: "2024-12-24",
            status: "Inactive",
            progress: 12,
            avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Evan"
        },
    ],
    payments: [
        {
            id: 101,
            user: "Alice Johnson",
            email: "alice@example.com",
            amount: 49.99,
            date: "2024-12-28",
            status: "Completed",
            method: "Credit Card",
            invoiceId: "INV-2024-001"
        },
        {
            id: 102,
            user: "Bob Smith",
            email: "bob.smith@test.co",
            amount: 59.99,
            date: "2024-12-27",
            status: "Completed",
            method: "PayPal",
            invoiceId: "INV-2024-002"
        },
        {
            id: 103,
            user: "Charlie Brown",
            email: "charlie.b@domain.net",
            amount: 39.99,
            date: "2024-12-26",
            status: "Pending",
            method: "Bank Transfer",
            invoiceId: "INV-2024-003"
        },
        {
            id: 104,
            user: "Diana Prince",
            email: "diana.p@wonder.com",
            amount: 69.99,
            date: "2024-12-25",
            status: "Completed",
            method: "Credit Card",
            invoiceId: "INV-2024-004"
        },
    ]
};

export const popularCourses = [
    {
        id: 1,
        title: "UI/UX Design",
        count: "30+ Courses",
        color: "#FBBF24",
        icon: "U",
        rating: 4.8,
        reviews: 1240
    }, // Amber
    {
        id: 2,
        title: "Marketing",
        count: "25+ Courses",
        color: "#F472B6",
        icon: "M",
        rating: 4.6,
        reviews: 850
    }, // Pink
    {
        id: 3,
        title: "Web Dev",
        count: "30+ Courses",
        color: "#34D399",
        icon: "W",
        rating: 4.9,
        reviews: 2100
    }, // Emerald
    {
        id: 4,
        title: "Mathematics",
        count: "50+ Courses",
        color: "#60A5FA",
        icon: "M",
        rating: 4.5,
        reviews: 600
    }, // Blue
];

export const bestInstructors = [
    { id: 1, name: "Nil Yeager", role: "Design Course", courseCount: 5, avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Nil" },
    { id: 2, name: "Theron Trump", role: "Design Course", courseCount: 8, avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Theron" },
    { id: 3, name: "Tyler Mark", role: "Design Course", courseCount: 12, avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Tyler" },
    { id: 4, name: "Johen Mark", role: "Design Course", courseCount: 3, avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Johen" },
];
