export const initialTemplates = [
    {
        id: 't1',
        name: "Classic Certificate",
        page: { type: "A4", orientation: "landscape" },
        theme: {
            backgroundImage: "https://t3.ftcdn.net/jpg/02/26/51/66/360_F_226516664_wWdftnN4sP1tQ5qQ7QG7ef5q5q5q5q5.jpg", // Elegant border placeholder
            fontFamily: "'Playfair Display', serif",
            textColor: "#1a202c"
        },
        elements: [
            { id: "e1", type: "text", x: 100, y: 120, w: 800, h: 60, content: "Certificate of Achievement", style: { fontSize: "48px", fontWeight: "bold", textAlign: "center", color: "#d4af37" } },
            { id: "e2", type: "text", x: 200, y: 220, w: 600, h: 40, content: "THIS IS PRESENTED TO", style: { fontSize: "16px", textAlign: "center", letterSpacing: "2px" } },
            { id: "e3", type: "text", x: 150, y: 280, w: 700, h: 80, content: "{{recipientName}}", style: { fontSize: "56px", fontWeight: "bold", textAlign: "center", borderBottom: "1px solid #ccc", fontFamily: "'Pinyon Script', cursive" } },
            { id: "e4", type: "text", x: 100, y: 380, w: 800, h: 40, content: "For successful completion of", style: { fontSize: "18px", textAlign: "center", fontStyle: "italic" } },
            { id: "e5", type: "text", x: 100, y: 430, w: 800, h: 50, content: "{{courseName}}", style: { fontSize: "32px", fontWeight: "bold", textAlign: "center", color: "#2d3748" } },
            { id: "e6", type: "text", x: 150, y: 550, w: 300, h: 60, content: "{{date}}", style: { fontSize: "18px", borderTop: "1px solid #333", paddingTop: "10px", textAlign: "center" } },
            { id: "e7", type: "text", x: 550, y: 550, w: 300, h: 60, content: "Director Signature", style: { fontSize: "18px", borderTop: "1px solid #333", paddingTop: "10px", textAlign: "center" } },
            { id: "seal", type: "image", x: 420, y: 500, w: 150, h: 150, src: "https://cdn-icons-png.flaticon.com/512/2679/2679905.png", style: { opacity: 0.8 } }
        ]
    },
    {
        id: 't2',
        name: "Modern Minimalist",
        page: { type: "A4", orientation: "landscape" },
        theme: {
            backgroundImage: "",
            fontFamily: "'Inter', sans-serif",
            textColor: "#1F2937",
        },
        elements: [
            { id: "bg-shape", type: "text", x: 0, y: 0, w: 300, h: 707, content: "", style: { backgroundColor: "#2563eb", position: "absolute", zIndex: -1 } },
            { id: "t1", type: "text", x: 350, y: 100, w: 600, h: 60, content: "CERTIFICATE", style: { fontSize: "40px", fontWeight: "900", color: "#111", letterSpacing: "5px" } },
            { id: "t2", type: "text", x: 350, y: 160, w: 600, h: 40, content: "OF APPRECIATION", style: { fontSize: "20px", color: "#666", letterSpacing: "2px" } },
            { id: "t3", type: "text", x: 350, y: 250, w: 600, h: 70, content: "{{recipientName}}", style: { fontSize: "48px", fontWeight: "bold", color: "#2563eb" } },
            { id: "t4", type: "text", x: 350, y: 340, w: 500, h: 60, content: "For demonstrating excellence in {{courseName}}.", style: { fontSize: "18px", color: "#4b5563" } },
            { id: "t5", type: "text", x: 350, y: 550, w: 200, h: 50, content: "{{date}}", style: { fontSize: "16px", fontWeight: "bold" } },
            { id: "logo", type: "image", x: 800, y: 50, w: 100, h: 100, src: "https://cdn-icons-png.flaticon.com/512/5968/5968350.png" }
        ]
    },
    {
        id: 't3',
        name: "Tech Future",
        page: { type: "A4", orientation: "landscape" },
        theme: {
            backgroundImage: "",
            fontFamily: "'Orbitron', sans-serif",
            textColor: "#e2e8f0"
        },
        elements: [
            { id: "bg1", type: "text", x: 0, y: 0, w: 1000, h: 707, content: "", style: { backgroundColor: "#0f172a", position: "absolute", zIndex: -1 } },
            { id: "glow", type: "text", x: 100, y: 100, w: 800, h: 500, content: "", style: { border: "2px solid #00f0ff", boxShadow: "0 0 20px #00f0ff", position: "absolute", zIndex: -1, pointerEvents: "none" } },
            { id: "t1", type: "text", x: 50, y: 50, w: 900, h: 60, content: "CERTIFIED", style: { fontSize: "50px", fontWeight: "900", letterSpacing: "10px", color: "#00f0ff", textAlign: "center" } },
            { id: "t2", type: "text", x: 100, y: 250, w: 800, h: 100, content: "{{recipientName}}", style: { fontSize: "60px", fontWeight: "bold", textAlign: "center", color: "#fff", textShadow: "0 0 10px #00f0ff" } },
            { id: "t3", type: "text", x: 200, y: 400, w: 600, h: 40, content: "FULL STACK DEVELOPER", style: { fontSize: "24px", color: "#94a3b8", textAlign: "center", letterSpacing: "4px" } },
            { id: "qr", type: "image", x: 850, y: 550, w: 100, h: 100, src: "https://upload.wikimedia.org/wikipedia/commons/thumb/d/d0/QR_code_for_mobile_English_Wikipedia.svg/1200px-QR_code_for_mobile_English_Wikipedia.svg.png" }
        ]
    },
    {
        id: 't4',
        name: "Professional Corporate",
        page: { type: "A4", orientation: "landscape" },
        theme: {
            backgroundImage: "",
            fontFamily: "'Roboto', sans-serif",
            textColor: "#333"
        },
        elements: [
            { id: "strip", type: "text", x: 0, y: 650, w: 1000, h: 57, content: "", style: { backgroundColor: "#374151", position: "absolute", zIndex: -1 } },
            { id: "t1", type: "text", x: 100, y: 100, w: 300, h: 40, content: "CERTIFICATE", style: { fontSize: "28px", fontWeight: "bold", borderBottom: "4px solid #374151" } },
            { id: "t2", type: "text", x: 100, y: 200, w: 800, h: 80, content: "{{recipientName}}", style: { fontSize: "50px", fontWeight: "500", color: "#111" } },
            { id: "t3", type: "text", x: 100, y: 300, w: 800, h: 40, content: "Has been awarded this certificate for the course", style: { fontSize: "18px", color: "#555" } },
            { id: "t4", type: "text", x: 100, y: 340, w: 800, h: 40, content: "{{courseName}}", style: { fontSize: "24px", fontWeight: "bold", color: "#374151" } },
            { id: "date", type: "text", x: 100, y: 550, w: 250, h: 60, content: "Date: {{date}}", style: { fontSize: "16px" } },
            { id: "sig", type: "text", x: 600, y: 550, w: 300, h: 60, content: "Authorized Signature", style: { fontSize: "18px", borderTop: "1px solid #ccc", paddingTop: "5px" } }
        ]
    },

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
