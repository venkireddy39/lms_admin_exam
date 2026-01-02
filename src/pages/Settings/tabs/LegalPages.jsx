import React from 'react';

const LegalPages = () => {
    return (
        <div className="settings-card">
            <div className="sc-header">
                <h2>Legal Pages</h2>
                <p>Manage Terms of Service and Privacy Policy content.</p>
            </div>

            <div className="st-group">
                <label>Terms of Service</label>
                <textarea className="st-input" style={{ height: 200 }} placeholder="Enter your Terms of Service here..."></textarea>
            </div>
            <div className="st-group">
                <label>Privacy Policy</label>
                <textarea className="st-input" style={{ height: 200 }} placeholder="Enter your Privacy Policy here..."></textarea>
            </div>
            <div className="st-group">
                <label>Cookie Consent Text</label>
                <input type="text" className="st-input" defaultValue="We use cookies to improve your experience." />
            </div>
        </div>
    );
};

export default LegalPages;
