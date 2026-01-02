export const initialTemplates = [
    {
        id: 't1',
        name: "Classic Gold Test",
        page: { type: "A4", orientation: "landscape" },
        theme: {
            backgroundImage: "", // URL or empty
            fontFamily: "'Playfair Display', serif",
            textColor: "#1a202c"
        },
        elements: [
            { id: "e1", type: "text", x: 100, y: 100, w: 800, h: 60, content: "Certificate of Appreciation", style: { fontSize: "40px", fontWeight: "bold", textAlign: "center", color: "#d4af37" } },
            { id: "e2", type: "text", x: 200, y: 200, w: 600, h: 40, content: "Proudly Presented To", style: { fontSize: "20px", textAlign: "center", fontStyle: "italic" } },
            { id: "e3", type: "text", x: 150, y: 260, w: 700, h: 80, content: "{{recipientName}}", style: { fontSize: "50px", fontWeight: "bold", textAlign: "center", borderBottom: "2px solid #d4af37" } },
            { id: "e4", type: "text", x: 100, y: 400, w: 800, h: 40, content: "For successfully completing the course", style: { fontSize: "18px", textAlign: "center" } },
            { id: "e5", type: "text", x: 100, y: 450, w: 800, h: 50, content: "{{courseName}}", style: { fontSize: "30px", fontWeight: "bold", textAlign: "center", color: "#d4af37" } },
            { id: "e6", type: "text", x: 100, y: 550, w: 300, h: 30, content: "Date: {{date}}", style: { fontSize: "16px" } },
            { id: "e7", type: "text", x: 600, y: 550, w: 300, h: 60, content: "Signature", style: { fontSize: "24px", fontFamily: "cursive", textAlign: "right" } }
        ]
    },
    {
        id: 't2',
        name: "Tech Dark",
        page: { type: "A4", orientation: "landscape" },
        theme: {
            backgroundImage: "", // Can be a dark tech bg URL
            fontFamily: "'Orbitron', sans-serif",
            textColor: "#e2e8f0"
        },
        elements: [
            { id: "bg1", type: "text", x: 0, y: 0, w: 1000, h: 707, content: "", style: { backgroundColor: "#0f172a", position: "absolute", zIndex: -1 } }, // primitive bg
            { id: "t1", type: "text", x: 50, y: 50, w: 900, h: 60, content: "CERTIFICATE", style: { fontSize: "40px", fontWeight: "900", letterSpacing: "5px", color: "#00f0ff", textAlign: "right" } },
            { id: "t2", type: "text", x: 100, y: 200, w: 800, h: 100, content: "{{recipientName}}", style: { fontSize: "60px", fontWeight: "bold", textAlign: "center", color: "#fff", textShadow: "0 0 10px #00f0ff" } },
            { id: "t3", type: "text", x: 300, y: 350, w: 400, h: 40, content: "verified on blockchain", style: { fontSize: "14px", color: "#64748b", textAlign: "center", textTransform: "uppercase" } }
        ]
    }
];

export const initialPendingCertificates = [
    {
        id: "pend_001",
        data: {
            certificateId: "", // To be generated on approval
            recipientName: "Alice Smith",
            courseName: "Web Development Bootcamp",
            date: new Date().toISOString().split('T')[0]
        },
        template: initialTemplates[0], // Default template preference
        issuedAt: new Date().toISOString() // Request time
    },
    {
        id: "pend_002",
        data: {
            certificateId: "",
            recipientName: "Bob Johnson",
            courseName: "Data Science Fundamentals",
            date: new Date().toISOString().split('T')[0]
        },
        template: initialTemplates[1],
        issuedAt: new Date().toISOString()
    }
];

export const initialCertificates = [
    {
        id: "demo_001",
        data: {
            certificateId: "TSCERT4500",
            recipientName: "Rohan Kumar",
            courseName: "Computer basics",
            date: new Date().toISOString().split('T')[0]
        },
        template: initialTemplates[0],
        issuedAt: new Date().toISOString()
    }
];

export const initialAdminSettings = {
    instituteName: "Techno Smarter Help Community Coaching",
    subTitle: "Recognized by Ministry of Corporate Affairs",
    instituteAddress: "Head Office: Shubhash Nagar, New Delhi - 110001",
    website: "www.technosmarter.com",
    email: "info@technosmarter.com",
    logo: null,
    gradingScale: [
        { grade: "A+", min: 90, label: "Excellent" },
        { grade: "A", min: 80, label: "Very Good" },
        { grade: "B", min: 70, label: "Good" }
    ],
    adminUsers: [
        { id: 1, name: "Admin", email: "admin@example.com", role: "Super Admin" },
        { id: 2, name: "Manager", email: "manager@example.com", role: "Editor" }
    ],
    registrations: [
        { id: 101, name: "John Doe", course: "React Basics", dept: "IT" },
        { id: 102, name: "Alice Smith", course: "Python Master", dept: "CS" }
    ],
    defaultFooterText: "This certificate is computer generated and valid without signature.",
    sealImage: null,
    directorSignature: null,
    badgeImage: null
};
