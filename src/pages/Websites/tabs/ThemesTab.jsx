import React, { useState } from 'react';
import { FiCheck, FiLayout, FiEye } from 'react-icons/fi';

const ThemesTab = () => {
    const [selectedTheme, setSelectedTheme] = useState('June');

    const themes = [
        { id: 'pulse', name: 'Pulse', colors: ['#1e293b', '#22c55e'], type: 'dark' },
        { id: 'june', name: 'June', colors: ['#ffffff', '#3b82f6'], type: 'light' },
        { id: 'showstopper', name: 'Showstopper', colors: ['#0f172a', '#eab308'], type: 'dark' },
        { id: 'vellum', name: 'Vellum', colors: ['#f0fdf4', '#16a34a'], type: 'light' },
        { id: 'vegas', name: 'Vegas', colors: ['#ffffff', '#f97316'], type: 'light' },
        { id: 'blaze', name: 'Blaze', colors: ['#1c1917', '#ef4444'], type: 'dark' },
        { id: 'nebula', name: 'Nebula', colors: ['#faf5ff', '#a855f7'], type: 'light' },
    ];

    return (
        <div className="themes-container">
            <h3>Themes</h3>
            <div className="themes-grid">
                {themes.map(theme => (
                    <div
                        key={theme.id}
                        className={`theme-card-premium ${selectedTheme === theme.name ? 'active' : ''}`}
                        onClick={() => setSelectedTheme(theme.name)}
                    >
                        <div className="theme-preview-box" style={{ background: theme.colors[0] }}>
                            {/* Mock UI in Preview */}
                            <div className="tp-nav" style={{ borderBottom: `1px solid ${theme.type === 'dark' ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)'}` }}>
                                <div className="tp-logo" style={{ background: theme.colors[1] }}></div>
                                <div className="tp-links">
                                    <span style={{ background: theme.type === 'dark' ? '#475569' : '#e2e8f0' }}></span>
                                    <span style={{ background: theme.type === 'dark' ? '#475569' : '#e2e8f0' }}></span>
                                </div>
                            </div>
                            <div className="tp-hero">
                                <div className="tp-h-content">
                                    <div className="tp-h-title" style={{ background: theme.type === 'dark' ? '#fff' : '#1e293b' }}></div>
                                    <div className="tp-h-sub" style={{ background: theme.type === 'dark' ? '#64748b' : '#94a3b8' }}></div>
                                    <div className="tp-h-btn" style={{ background: theme.colors[1] }}></div>
                                </div>
                                <div className="tp-h-img" style={{ background: theme.type === 'dark' ? '#334155' : '#cbd5e1' }}></div>
                            </div>
                            <div className="tp-overlay">
                                <button className="btn-preview"><FiEye /> Preview</button>
                            </div>
                        </div>
                        <div className="theme-info-row">
                            <span className="theme-name">{theme.name}</span>
                            {selectedTheme === theme.name && <span className="theme-badge"><FiCheck /> Active</span>}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default ThemesTab;
