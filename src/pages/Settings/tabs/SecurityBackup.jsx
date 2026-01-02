import React from 'react';
import { FiDatabase } from 'react-icons/fi';

const SecurityBackup = () => {
    return (
        <div className="settings-card">
            <div className="sc-header">
                <h2>Security & Data</h2>
                <p>Manage access security, passwords, and data backups.</p>
            </div>

            <div className="toggle-row">
                <div className="toggle-info">
                    <h4>Two-Factor Authentication (2FA)</h4>
                    <p>Require 2FA for all administrator accounts.</p>
                </div>
                <label className="switch"><input type="checkbox" /><span className="slider"></span></label>
            </div>

            <div className="st-group mt-4">
                <label>Password Policy</label>
                <select className="st-input">
                    <option>Minimum 8 characters</option>
                    <option>Minimum 10 characters + Special char</option>
                    <option>Strict (12+ chars, alphanumeric, special)</option>
                </select>
            </div>

            <hr className="my-4" />

            <h4 style={{ fontSize: 16, marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}><FiDatabase /> Backup & Restore</h4>
            <div className="p-3 border rounded" style={{ background: '#fff7ed', borderColor: '#ffedd5' }}>
                <div className="d-flex justify-content-between align-items-center">
                    <div>
                        <div style={{ fontWeight: 600, color: '#9a3412' }}>Last Backup: 2024-03-20 14:00</div>
                        <div style={{ fontSize: 12, color: '#c2410c' }}>Size: 450MB</div>
                    </div>
                    <div className="d-flex gap-2">
                        <button className="btn-secondary">Download</button>
                        <button className="btn-primary" style={{ background: '#ea580c' }}>Create Backup Now</button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SecurityBackup;
