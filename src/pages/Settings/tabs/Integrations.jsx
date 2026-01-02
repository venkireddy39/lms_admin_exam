import React from 'react';
import { FiCreditCard, FiUser, FiLayers } from 'react-icons/fi';

const Integrations = () => {
    return (
        <div className="settings-card">
            <div className="sc-header">
                <h2>Integrations</h2>
                <p>Connect third-party services for payments, messaging, and meetings.</p>
            </div>

            <div className="integration-section mb-4">
                <h4 style={{ fontSize: 16, marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}><FiCreditCard /> Payment Gateways</h4>
                <div className="st-group p-3 border rounded mb-3" style={{ background: '#f8fafc' }}>
                    <div className="d-flex justify-content-between align-items-center mb-2">
                        <span style={{ fontWeight: 600 }}>Stripe</span>
                        <label className="switch"><input type="checkbox" defaultChecked /><span className="slider"></span></label>
                    </div>
                    <input type="password" className="st-input mb-2" placeholder="Publishable Key" />
                    <input type="password" className="st-input" placeholder="Secret Key" />
                </div>
                <div className="st-group p-3 border rounded" style={{ background: '#f8fafc' }}>
                    <div className="d-flex justify-content-between align-items-center mb-2">
                        <span style={{ fontWeight: 600 }}>PayPal</span>
                        <label className="switch"><input type="checkbox" /><span className="slider"></span></label>
                    </div>
                    <input type="text" className="st-input" placeholder="PayPal Client ID" />
                </div>
            </div>

            <div className="integration-section mb-4">
                <h4 style={{ fontSize: 16, marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}><FiUser /> Communication (Email & SMS)</h4>
                <div className="st-group p-3 border rounded mb-3" style={{ background: '#f8fafc' }}>
                    <div className="d-flex justify-content-between align-items-center mb-2">
                        <span style={{ fontWeight: 600 }}>SMTP / SendGrid</span>
                        <label className="switch"><input type="checkbox" defaultChecked /><span className="slider"></span></label>
                    </div>
                    <div className="st-row mb-0">
                        <input type="text" className="st-input" placeholder="Host" />
                        <input type="text" className="st-input" placeholder="Port" />
                    </div>
                </div>
                <div className="st-group p-3 border rounded" style={{ background: '#f8fafc' }}>
                    <div className="d-flex justify-content-between align-items-center mb-2">
                        <span style={{ fontWeight: 600 }}>Twilio (SMS)</span>
                        <label className="switch"><input type="checkbox" /><span className="slider"></span></label>
                    </div>
                    <input type="text" className="st-input mb-2" placeholder="Account SID" />
                    <input type="password" className="st-input" placeholder="Auth Token" />
                </div>
            </div>

            <div className="integration-section">
                <h4 style={{ fontSize: 16, marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}><FiLayers /> Misc</h4>
                <div className="st-group p-3 border rounded" style={{ background: '#f8fafc' }}>
                    <div className="d-flex justify-content-between align-items-center mb-2">
                        <span style={{ fontWeight: 600 }}>Zoom Meeting</span>
                        <label className="switch"><input type="checkbox" /><span className="slider"></span></label>
                    </div>
                    <input type="text" className="st-input mb-2" placeholder="Zoom API Key" />
                    <input type="password" className="st-input" placeholder="Zoom Secret" />
                </div>
            </div>
        </div>
    );
};

export default Integrations;
