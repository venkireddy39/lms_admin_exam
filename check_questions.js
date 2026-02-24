
const fetch = require('node-fetch'); // Assuming node-fetch available or use native fetch if Node 18+

async function check() {
    const examId = 16;
    const baseUrl = 'http://localhost:5173';

    console.log("Checking questions for Exam", examId);

    // Just try fetches
    try {
        // 1. Exam endpoint
        const r1 = await fetch(`${baseUrl}/api/exams/${examId}`);
        if (r1.ok) {
            const d1 = await r1.json();
            console.log("Exam Data:", JSON.stringify(d1, null, 2));
        } else {
            console.log("Exam Fetch failed:", r1.status);
        }

        // Check POST endpoint existence
        const r3 = await fetch(`${baseUrl}/api/exams/${examId}/questions`, { method: 'POST' });
        console.log("POST /api/exams/16/questions status:", r3.status);

        // 2. Questions endpoint
        const r2 = await fetch(`${baseUrl}/api/questions?examId=${examId}`);
        if (r2.ok) {
            const d2 = await r2.json();
            console.log("Questions (Filtered):", d2.length);
        } else {
            console.log("Questions Filter failed:", r2.status);
        }

    } catch (e) {
        console.error("Error:", e.message);
    }
}

check();
