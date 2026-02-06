import React, { useState, useEffect } from 'react';
import automationService from '../../services/automationService';
import './AutomationDashboard.css';

const AutomationDashboard = () => {
    const [systemStatus, setSystemStatus] = useState({ status: 'CHECKING', scheduler: 'UNKNOWN', ai_engine: 'UNKNOWN' });
    const [loading, setLoading] = useState(false);
    const [aiQuery, setAiQuery] = useState('');
    const [aiResponse, setAiResponse] = useState('');

    // 1. Check Backend Status on Load
    useEffect(() => {
        fetchStatus();
        // Poll every 30 seconds
        const interval = setInterval(fetchStatus, 30000);
        return () => clearInterval(interval);
    }, []);

    const fetchStatus = async () => {
        const status = await automationService.getSystemStatus();
        setSystemStatus(status);
    };

    const handleTriggerJob = async (jobName) => {
        setLoading(true);
        try {
            if (confirm(`Are you sure you want to run ${jobName} manually?`)) {
                const res = await automationService.triggerJob(jobName);
                alert(`Success: ${res.message}`);
            }
        } catch (err) {
            alert("Failed to trigger job.");
        } finally {
            setLoading(false);
        }
    };

    const handleAiQuery = async () => {
        if (!aiQuery) return;
        setLoading(true);
        setAiResponse("Thinking...");
        try {
            const res = await automationService.sendAiQuery(aiQuery);
            setAiResponse(res.response);
        } catch (err) {
            setAiResponse("Error connecting to AI.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="automation-container">
            <div className="automation-header">
                <h1>Automation & AI Command Center</h1>
                <p>Manage background jobs and interact with the AI Sidecar.</p>
            </div>

            {/* Status Grid */}
            <div className="status-grid">
                <div className="status-card">
                    <div className={`status-indicator ${systemStatus.status === 'ONLINE' ? 'status-online' : 'status-offline'}`}></div>
                    <h3>System Status</h3>
                    <p>{systemStatus.status}</p>
                </div>
                <div className="status-card">
                    <h3>Scheduler</h3>
                    <p>{systemStatus.scheduler}</p>
                </div>
                <div className="status-card">
                    <h3>AI Engine</h3>
                    <p>{systemStatus.ai_engine}</p>
                </div>
            </div>

            {/* Manual Triggers - Admin Only */}
            <div className="actions-section">
                <h2>Manual Job Triggers</h2>
                <p>Force-run background tasks. Use with caution.</p>
                <div className="action-buttons">
                    <button className="btn-trigger" onClick={() => handleTriggerJob('exam-cleanup')} disabled={loading}>
                        Run Exam Cleanup
                    </button>
                    <button className="btn-trigger" onClick={() => handleTriggerJob('notification-dispatch')} disabled={loading}>
                        Dispatch Notifications
                    </button>
                </div>
            </div>

            {/* AI Playground */}
            <div className="ai-section">
                <h2>AI Assistant Playground</h2>
                <p>Test the AI responding to student/admin queries.</p>

                <div className="chat-box">
                    {aiResponse || "AI response will appear here..."}
                </div>

                <div className="ai-input-group">
                    <input
                        type="text"
                        className="ai-input"
                        placeholder="Ask anything (e.g. 'Explain topic X', 'Summarize stats')..."
                        value={aiQuery}
                        onChange={(e) => setAiQuery(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && handleAiQuery()}
                    />
                    <button className="btn-trigger" onClick={handleAiQuery} disabled={loading}>
                        Ask AI
                    </button>
                </div>
            </div>
        </div>
    );
};

export default AutomationDashboard;
