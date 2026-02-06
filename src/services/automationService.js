import { apiFetch } from './apiFetch';

// Base URL for the Automation / AI Sidecar Service
// In production, this would be an environment variable
const AUTOMATION_API_URL = "http://localhost:8082/api";

const automationService = {
    // Check if the automation system is online
    getSystemStatus: async () => {
        try {
            const response = await fetch(`${AUTOMATION_API_URL}/automation/status`);
            return await response.json();
        } catch (error) {
            console.error("Automation Service Offline", error);
            return { status: "OFFLINE", scheduler: "INACTIVE", ai_engine: "UNAVAILABLE" };
        }
    },

    // Trigger a job manually
    triggerJob: async (jobType) => {
        try {
            const response = await fetch(`${AUTOMATION_API_URL}/automation/trigger/${jobType}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                }
            });
            return await response.json();
        } catch (error) {
            console.error("Failed to trigger job", error);
            throw error;
        }
    },

    // AI Chat
    sendAiQuery: async (query, role = "ADMIN") => {
        try {
            const response = await fetch(`${AUTOMATION_API_URL}/ai/chat`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ query, role })
            });
            return await response.json();
        } catch (error) {
            console.error("AI Service Error", error);
            return { response: "I am currently offline. Please check the backend connection." };
        }
    }
};

export default automationService;
