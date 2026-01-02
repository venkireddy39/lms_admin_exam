import React from 'react';

const SettingsTab = () => {
    return (
        <div className="web-settings">
            <div className="web-header">
                <h2>General Configuration</h2>
                <p>Domain and basic site properties.</p>
            </div>

            <div className="st-group">
                <label>Custom Domain</label>
                <div style={{ display: 'flex', gap: 10 }}>
                    <input type="text" className="st-input" placeholder="e.g. www.myacademy.com" />
                    <button className="btn-primary">Connect</button>
                </div>
                <p style={{ fontSize: 12, color: '#64748b', marginTop: 4 }}>Learn how to configure your DNS records.</p>
            </div>

            <div className="st-group">
                <label>Favicon</label>
                <input type="file" className="form-control" />
            </div>

            <div className="toggle-row">
                <div className="toggle-info">
                    <h4>Maintenance Mode</h4>
                    <p>Show a "Coming Soon" page to visitors.</p>
                </div>
                <label className="switch"><input type="checkbox" /><span className="slider"></span></label>
            </div>
        </div>
    );
};

export default SettingsTab;
