import React from 'react';
import { FiUpload } from 'react-icons/fi';

const GeneralSettings = ({ settings, setSettings }) => {
    return (
        <div className="settings-card">
            <div className="sc-header">
                <h2>General Configuration</h2>
                <p>Basic site information and localization settings.</p>
            </div>

            <div className="avatar-upload">
                <div className="current-avatar" style={{ borderRadius: 8, width: 120, height: 60, display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f1f5f9', border: '1px dashed #cbd5e1', overflow: 'hidden' }}>
                    {settings.logo || localStorage.getItem('institute_logo') ? (
                        <img src={settings.logo || localStorage.getItem('institute_logo')} alt="Logo" style={{ maxHeight: '100%', maxWidth: '100%' }} />
                    ) : (
                        <span style={{ color: '#94a3b8', fontSize: 12 }}>Logo Preview</span>
                    )}
                </div>
                <div>
                    <label className="btn-secondary" style={{ marginBottom: 8, display: 'inline-flex', alignItems: 'center', cursor: 'pointer' }}>
                        <FiUpload style={{ marginRight: 6 }} /> Upload Brand Logo
                        <input
                            type="file"
                            accept="image/*"
                            style={{ display: 'none' }}
                            onChange={(e) => {
                                const file = e.target.files[0];
                                if (file) {
                                    const reader = new FileReader();
                                    reader.onload = (ev) => {
                                        const res = ev.target.result;
                                        setSettings({ ...settings, logo: res });
                                        localStorage.setItem('institute_logo', res);
                                    };
                                    reader.readAsDataURL(file);
                                }
                            }}
                        />
                    </label>
                    <p style={{ fontSize: 12, color: '#64748b', margin: 0 }}>Recommended height: 60px. PNG or SVG.</p>
                </div>
            </div>

            <div className="st-row">
                <div className="st-col">
                    <div className="st-group">
                        <label>Site Name</label>
                        <input type="text" className="st-input" value={settings.siteName} onChange={(e) => setSettings({ ...settings, siteName: e.target.value })} />
                    </div>
                </div>
                <div className="st-col">
                    <div className="st-group">
                        <label>Support Email</label>
                        <input type="email" className="st-input" defaultValue="support@academy.com" />
                    </div>
                </div>
            </div>

            <div className="st-row">
                <div className="st-col">
                    <div className="st-group">
                        <label>System Language</label>
                        <select className="st-input" value={settings.language} onChange={(e) => setSettings({ ...settings, language: e.target.value })}>
                            <option value="en">English (US)</option>
                            <option value="es">Spanish</option>
                            <option value="fr">French</option>
                            <option value="de">German</option>
                        </select>
                    </div>
                </div>
                <div className="st-col">
                    <div className="st-group">
                        <label>Timezone</label>
                        <select className="st-input" value={settings.timezone} onChange={(e) => setSettings({ ...settings, timezone: e.target.value })}>
                            <option value="UTC">UTC (Universal Coordinated Time)</option>
                            <option value="EST">EST (Eastern Standard Time)</option>
                            <option value="PST">PST (Pacific Standard Time)</option>
                            <option value="IST">IST (Indian Standard Time)</option>
                        </select>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default GeneralSettings;
