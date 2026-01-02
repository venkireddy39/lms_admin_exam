import React from 'react';

const NotificationSettings = () => {
    return (
        <div className="settings-card">
            <div className="sc-header">
                <h2>Notification Preferences</h2>
                <p>Choose how and when system alerts are sent.</p>
            </div>
            <div className="toggle-row">
                <div className="toggle-info">
                    <h4>New Student Registration</h4>
                    <p>Notify admin when a new student joins.</p>
                </div>
                <label className="switch"><input type="checkbox" defaultChecked /><span className="slider"></span></label>
            </div>
            <div className="toggle-row">
                <div className="toggle-info">
                    <h4>Course Purchase</h4>
                    <p>Notify on successful payment.</p>
                </div>
                <label className="switch"><input type="checkbox" defaultChecked /><span className="slider"></span></label>
            </div>
        </div>
    );
};

export default NotificationSettings;
