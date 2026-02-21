import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    FiBell, FiInfo, FiCheckCircle, FiAlertCircle, FiSettings,
    FiMail, FiMessageSquare, FiSmartphone, FiClock, FiActivity,
    FiUserCheck, FiSave, FiList, FiLoader, FiGlobe, FiFileText, FiPercent, FiZap, FiPlus, FiTrash2
} from 'react-icons/fi';
import './FeeManagement.css';
import { getFeeSettings, saveFeeSettings } from '../../services/feeService';
import FeeTypesSettings from './FeeTypesSettings';
import FeeStructureSettings from './FeeStructureSettings';

// --- Extracted Component to prevent re-renders ---
const NotificationCard = ({ notifType, data, onToggle, onConfigChange, onTest }) => (
    <motion.div
        layout
        className="glass-card"
        style={{ padding: 24, borderLeft: data.enabled ? '4px solid #6366f1' : '4px solid #cbd5e1' }}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
    >
        {/* Header Row */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 }}>
            <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <h3 style={{ margin: 0, fontSize: 16, fontWeight: 700 }}>{data.title}</h3>
                    <div className={`status-badge ${data.enabled ? 'paid' : 'pending'}`}>
                        {data.enabled ? 'Active' : 'Disabled'}
                    </div>
                </div>
                <p style={{ margin: '4px 0 0 0', fontSize: 13, color: 'var(--text-secondary)' }}>
                    {data.description}
                </p>
            </div>
            <div
                className={`toggle-switch ${data.enabled ? 'active' : ''}`}
                onClick={() => onToggle(notifType, 'enabled')}
            >
                <div className="toggle-track"><div className="toggle-thumb"></div></div>
            </div>
        </div>

        <AnimatePresence>
            {data.enabled && (
                <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.3, ease: 'easeInOut' }}
                    style={{ overflow: 'hidden' }}
                >
                    <div className="section-divider" style={{ margin: '16px 0' }}></div>

                    <div className="form-grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 20 }}>
                        {/* Channels (Read Only) */}
                        <div>
                            <label className="form-label" style={{ marginBottom: 12, display: 'block' }}>Channels</label>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 14, color: '#64748b' }}>
                                    <FiMail size={16} /> Email
                                </div>
                            </div>
                        </div>





                        {/* Configuration Specifics */}
                        {(data.config || data.template) && !['pending', 'overdue', 'paymentSuccess', 'partialPayment', 'refundStatus'].includes(notifType) && (
                            <div style={{ gridColumn: 'span 2' }}>
                                <label className="form-label" style={{ marginBottom: 12, display: 'block' }}>Configuration</label>

                                <div style={{ background: 'rgba(255,255,255,0.5)', padding: 12, borderRadius: 12, border: '1px solid var(--glass-border)' }}>



                                    {notifType === 'overdue' && (
                                        <div style={{ marginBottom: 12 }}>
                                            <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, cursor: 'pointer' }}>
                                                <input
                                                    type="checkbox"
                                                    checked={data.config.autoLateFee}
                                                    onChange={(e) => onConfigChange(notifType, 'autoLateFee', e.target.checked)}
                                                />
                                                Auto-apply late fee & update status to 'Overdue'
                                            </label>
                                        </div>
                                    )}

                                    {notifType === 'paymentSuccess' && (
                                        <div style={{ marginBottom: 12 }}>
                                            <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, cursor: 'pointer' }}>
                                                <input
                                                    type="checkbox"
                                                    checked={data.config.generateReceipt}
                                                    onChange={(e) => onConfigChange(notifType, 'generateReceipt', e.target.checked)}
                                                />
                                                Generate PDF Receipt automatically
                                            </label>
                                        </div>
                                    )}

                                    {/* Template Preview */}
                                    <div style={{ fontSize: 12, color: 'var(--text-secondary)' }}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                            <strong>Message Template:</strong>
                                            <button
                                                className="test-trigger-btn"
                                                style={{
                                                    height: '28px',
                                                    padding: '0 12px',
                                                    fontSize: '12px',
                                                    gap: '6px',
                                                    color: '#f59e0b',
                                                    background: 'rgba(245, 158, 11, 0.1)',
                                                    border: '1px solid rgba(245, 158, 11, 0.3)',
                                                    borderRadius: '6px',
                                                    fontWeight: '600',
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    cursor: 'pointer',
                                                    transition: 'all 0.2s ease'
                                                }}
                                                onClick={() => onTest(data)}
                                                onMouseEnter={(e) => {
                                                    e.currentTarget.style.background = 'rgba(245, 158, 11, 0.2)';
                                                    e.currentTarget.style.transform = 'translateY(-1px)';
                                                }}
                                                onMouseLeave={(e) => {
                                                    e.currentTarget.style.background = 'rgba(245, 158, 11, 0.1)';
                                                    e.currentTarget.style.transform = 'translateY(0)';
                                                }}
                                            >
                                                <FiZap size={14} /> Test Trigger
                                            </button>
                                        </div>
                                        <div style={{
                                            marginTop: 4,
                                            fontFamily: 'monospace',
                                            background: 'rgba(0,0,0,0.05)',
                                            padding: 8,
                                            borderRadius: 6
                                        }}>
                                            {data.template}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    </motion.div>
);

const FeeSettings = () => {
    const [saving, setSaving] = useState(false);


    // Default States
    const defaultGeneral = {
        currency: 'INR',
        currencySymbol: '₹',
        taxName: 'GST',
        taxPercentage: 18,
        invoicePrefix: 'INV-',
        financialYear: '2025-26'
    };

    const defaultLateFee = {
        enabled: false,
        amount: 2000.00,
        type: 'fixed', // or 'percentage'
        maxCap: 2000,
        sendEmail: true,
        frequency: 'MONTHLY',
        slabs: []
    };

    const defaultNotifications = {
        creation: {
            id: 'creation',
            enabled: true,
            title: 'Fee Creation',
            description: 'Trigger when a new fee is created or assigned.',
            channels: { inApp: true, email: true, sms: false },
            recipients: { student: true, parent: true, mentor: true }
        },
        pending: {
            id: 'pending',
            enabled: true,
            title: 'Pending Fee Reminder',
            description: 'Remind before the due date arises.',
            channels: { inApp: true, email: true, sms: true },
            recipients: { student: true, parent: true, mentor: false }
        },
        overdue: {
            id: 'overdue',
            enabled: true,
            title: 'Overdue Fee Alert',
            description: 'Trigger when due date is crossed.',
            channels: { inApp: true, email: true, sms: true },
            recipients: { student: true, parent: true, mentor: true },
            config: { autoLateFee: true },
            template: "Your fee is overdue. Default late fee rules will be applied."
        },
        paymentSuccess: {
            id: 'paymentSuccess',
            enabled: true,
            title: 'Payment Successful',
            description: 'Trigger when a payment is successfully recorded.',
            channels: { inApp: true, email: true, sms: false },
            recipients: { student: true, parent: true, mentor: false }
        },
        partialPayment: {
            id: 'partialPayment',
            enabled: true,
            title: 'Partial Payment',
            description: 'Trigger when a partial payment is made.',
            channels: { inApp: true, email: false, sms: false },
            recipients: { student: true, parent: true, mentor: false }
        },
        refundStatus: {
            id: 'refundStatus',
            enabled: true,
            title: 'Refund Status Update',
            description: 'Trigger when a refund is approved or rejected.',
            channels: { inApp: true, email: true, sms: false },
            recipients: { student: true, admin: true }
        }
    };


    const [generalSettings, setGeneralSettings] = useState(defaultGeneral);
    const [lateFeeSettings, setLateFeeSettings] = useState(defaultLateFee);
    const [notifications, setNotifications] = useState(defaultNotifications);
    const [loading, setLoading] = useState(true);

    // Load Settings from Backend
    useEffect(() => {
        fetchSettings();
    }, []);

    const fetchSettings = async () => {
        setLoading(true);
        try {
            console.log('🔄 Fetching fee settings from backend...');
            const data = await getFeeSettings();
            console.log('✅ Settings loaded successfully:', data);

            // DEBUG: Check for HTML response (common proxy issue)
            if (typeof data === 'string' && data.includes('<!DOCTYPE html>')) {
                throw new Error('Received HTML instead of JSON. Check Proxy URL or Backend Endpoint.');
            }

            // Map backend data to frontend state
            if (data && data.general) {
                setGeneralSettings(data.general);
            } else {
                console.warn('⚠️ Received data is missing "general" key:', data);
                // Optional: Throw error if strict validation is needed
                // throw new Error('Invalid data structure details: ' + JSON.stringify(data));
            }

            if (data && data.lateFee) {
                // Merge with defaults to ensure all fields exist
                // Normalize frequency to uppercase to match dropdown options (backend might send lowercase)
                setLateFeeSettings(prev => ({
                    ...defaultLateFee,
                    ...data.lateFee,
                    frequency: data.lateFee.frequency ? data.lateFee.frequency.toUpperCase() : defaultLateFee.frequency
                }));
            }

            if (data && data.notifications) {
                // Backend sends simple boolean values, map to frontend structure
                setNotifications(prev => ({
                    creation: { ...prev.creation, enabled: data.notifications.creation },
                    pending: { ...prev.pending, enabled: data.notifications.pending },
                    overdue: { ...prev.overdue, enabled: data.notifications.overdue },
                    paymentSuccess: { ...prev.paymentSuccess, enabled: data.notifications.paymentSuccess },
                    partialPayment: { ...prev.partialPayment, enabled: data.notifications.partialPayment },
                    refundStatus: { ...prev.refundStatus, enabled: data.notifications.refundStatus }
                }));
            }
        } catch (error) {
            console.error("❌ Failed to load settings from backend:", error);
            console.error("Error details:", {
                message: error.message,
                response: error.response?.data,
                status: error.response?.status,
                url: error.config?.url
            });

            const errorMsg = error.response?.status === 404
                ? 'Backend endpoint not found (404). Check if your backend is running at localhost:3130'
                : error.message.includes('Network Error')
                    ? 'Cannot connect to backend at localhost:3130. Please verify the backend is running and accessible.'
                    : `Failed to load settings: ${error.message}`;

            alert(errorMsg);
        } finally {
            setLoading(false);
        }
    };

    // Save Settings to Backend
    const handleSave = async () => {
        setSaving(true);
        try {
            // Prepare data for backend
            const payload = {
                general: generalSettings,
                lateFee: lateFeeSettings,
                notifications: {
                    creation: notifications.creation.enabled,
                    pending: notifications.pending.enabled,
                    overdue: notifications.overdue.enabled,
                    paymentSuccess: notifications.paymentSuccess.enabled,
                    partialPayment: notifications.partialPayment.enabled,
                    refundStatus: notifications.refundStatus.enabled
                }
            };

            await saveFeeSettings(payload);



            alert('Configuration saved successfully to database!');
        } catch (error) {
            console.error("Failed to save settings:", error);
            alert('Failed to save settings. Please try again.');
        } finally {
            setSaving(false);
        }
    };

    // --- Logic Handlers ---

    const handleGeneralChange = (e) => {
        const { name, value } = e.target;
        setGeneralSettings(prev => ({ ...prev, [name]: value }));
    };

    const handleToggle = (key, field, nestedField = null) => {
        setNotifications(prev => ({
            ...prev,
            [key]: {
                ...prev[key],
                [field]: nestedField
                    ? { ...prev[key][field], [nestedField]: !prev[key][field][nestedField] }
                    : !prev[key][field]
            }
        }));
    };

    const handleConfigChange = (key, configKey, value) => {
        setNotifications(prev => ({
            ...prev,
            [key]: {
                ...prev[key],
                config: {
                    ...prev[key].config,
                    [configKey]: value
                }
            }
        }));
    };

    const handleLateFeeChange = (e) => {
        const { name, value, type, checked } = e.target;
        setLateFeeSettings(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
    };

    const addSlab = () => {
        setLateFeeSettings(prev => ({
            ...prev,
            slabs: [...(prev.slabs || []), { fromDay: 1, toDay: 5, finePerDay: 10 }]
        }));
    };

    const removeSlab = (index) => {
        setLateFeeSettings(prev => ({
            ...prev,
            slabs: prev.slabs.filter((_, i) => i !== index)
        }));
    };

    const updateSlab = (index, field, value) => {
        const newSlabs = [...lateFeeSettings.slabs];
        newSlabs[index] = { ...newSlabs[index], [field]: value };
        setLateFeeSettings(prev => ({ ...prev, slabs: newSlabs }));
    };

    // --- Simulation Logic ---
    const handleTestTrigger = (data) => {
        let msg = data.template;
        // Mock Data for substitution
        const mockData = {
            amount: '₹45,000',
            dueDate: 'Jan 30, 2026',
            paidAmount: '₹12,000',
            txnId: 'TXN-998877',
            balance: '₹33,000',
            status: 'Approved'
        };

        Object.keys(mockData).forEach(key => {
            msg = msg.replace(`{{${key}}}`, mockData[key]);
        });

        const activeChannels = Object.entries(data.channels)
            .filter(([_, isActive]) => isActive)
            .map(([channel]) => channel)
            .join(', ');

        if (!activeChannels) {
            alert('Enable at least one channel to test!');
            return;
        }

        alert(`[TEST AUTOMATION]\n\nSending via: ${activeChannels.toUpperCase()}\n\nMessage:\n"${msg}"`);
    };



    return (
        <div style={{ maxWidth: 1200, margin: '0 auto', animation: 'fadeIn 0.5s ease-out' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
                <h2 style={{ fontSize: 20, fontWeight: 700, margin: 0 }}>Fee Module Settings</h2>
                <button className="btn-primary" onClick={handleSave} disabled={saving || loading}>
                    {saving ? <FiLoader className="spin" /> : <FiSave />}
                    {saving ? 'Saving...' : 'Save Changes'}
                </button>
            </div>

            {/* Loading State */}
            {loading ? (
                <div style={{ textAlign: 'center', padding: 60 }}>
                    <FiLoader size={48} className="spin" style={{ margin: '0 auto', color: '#6366f1' }} />
                    <p style={{ marginTop: 16, color: '#64748b' }}>Loading settings from database...</p>
                </div>
            ) : (
                <>
                    {/* General Configuration Section */}
                    <section className="form-section">
                        <div className="section-title"><FiSettings /> General Configuration</div>
                        <div className="glass-card">
                            <div className="form-grid">
                                <div className="form-group">
                                    <label className="form-label">Currency Symbol</label>
                                    <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                                        <FiGlobe style={{ position: 'absolute', left: 12, color: '#64748b' }} />
                                        <input name="currencySymbol" value={generalSettings.currencySymbol} onChange={handleGeneralChange} className="form-input" style={{ paddingLeft: 36 }} />
                                    </div>
                                </div>
                                <div className="form-group">
                                    <label className="form-label">Currency Code</label>
                                    <select name="currency" value={generalSettings.currency} onChange={handleGeneralChange} className="form-select">
                                        <option value="INR">INR (Indian Rupee)</option>
                                        <option value="USD">USD (US Dollar)</option>
                                        <option value="EUR">EUR (Euro)</option>
                                    </select>
                                </div>
                                <div className="form-group">
                                    <label className="form-label">Financial Year</label>
                                    <select name="financialYear" value={generalSettings.financialYear} onChange={handleGeneralChange} className="form-select">
                                        <option value="2025-26">2025-26</option>
                                        <option value="2026-27">2026-27</option>
                                    </select>
                                </div>
                            </div>
                            <div className="section-divider"></div>
                            <div className="form-grid">
                                <div className="form-group">
                                    <label className="form-label">Default Tax Name</label>
                                    <input name="taxName" value={generalSettings.taxName} onChange={handleGeneralChange} className="form-input" placeholder="e.g. GST" />
                                </div>
                                <div className="form-group">
                                    <label className="form-label">Tax Percentage (%)</label>
                                    <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                                        <FiPercent style={{ position: 'absolute', left: 12, color: '#64748b' }} />
                                        <input type="number" name="taxPercentage" value={generalSettings.taxPercentage} onChange={handleGeneralChange} className="form-input" style={{ paddingLeft: 36 }} />
                                    </div>
                                </div>
                                <div className="form-group">
                                    <label className="form-label">Invoice Prefix</label>
                                    <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                                        <FiFileText style={{ position: 'absolute', left: 12, color: '#64748b' }} />
                                        <input name="invoicePrefix" value={generalSettings.invoicePrefix} onChange={handleGeneralChange} className="form-input" style={{ paddingLeft: 36 }} placeholder="e.g. INV-" />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </section>

                    {/* Late Fee Configuration Section */}
                    <section className="form-section">
                        <div className="section-title"><FiClock /> Late Fee Configuration</div>
                        <div className="glass-card">
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                                <div>
                                    <h3 style={{ margin: 0, fontSize: 16, fontWeight: 600 }}>Enable Late Fees</h3>
                                    <p style={{ margin: '4px 0 0 0', fontSize: 13, color: 'var(--text-secondary)' }}>
                                        Automatically apply late fees to overdue invoices.
                                    </p>
                                </div>
                                <div
                                    className={`toggle-switch ${lateFeeSettings.enabled ? 'active' : ''}`}
                                    onClick={() => setLateFeeSettings(prev => ({ ...prev, enabled: !prev.enabled }))}
                                >
                                    <div className="toggle-track"><div className="toggle-thumb"></div></div>
                                </div>
                            </div>

                            <AnimatePresence>
                                {lateFeeSettings.enabled && (
                                    <motion.div
                                        initial={{ height: 0, opacity: 0 }}
                                        animate={{ height: 'auto', opacity: 1 }}
                                        exit={{ height: 0, opacity: 0 }}
                                        style={{ overflow: 'hidden' }}
                                    >
                                        <div className="section-divider"></div>
                                        <div className="form-grid">
                                            <div className="form-group">
                                                <label className="form-label">Fee Amount ({generalSettings.currencySymbol})</label>
                                                <input
                                                    type="number"
                                                    name="amount"
                                                    value={lateFeeSettings.amount}
                                                    onChange={handleLateFeeChange}
                                                    className="form-input"
                                                    placeholder="50"
                                                />
                                            </div>
                                            <div className="form-group">
                                                <label className="form-label">Application Frequency</label>
                                                <select
                                                    name="frequency"
                                                    value={lateFeeSettings.frequency}
                                                    onChange={handleLateFeeChange}
                                                    className="form-select"
                                                >
                                                    <option value="WEEKLY">Weekly</option>
                                                    <option value="MONTHLY">Monthly</option>
                                                    <option value="ONE_TIME">One-Time</option>
                                                </select>
                                            </div>

                                        </div>
                                        <div style={{ display: 'flex', alignItems: 'center', marginTop: 16, justifyContent: 'flex-start' }}>
                                            <label style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer', fontWeight: 500, color: '#334155' }}>
                                                <input
                                                    type="checkbox"
                                                    name="sendEmail"
                                                    checked={lateFeeSettings.sendEmail}
                                                    onChange={handleLateFeeChange}
                                                    style={{ width: 18, height: 18, accentColor: '#6366f1' }}
                                                />
                                                Email
                                            </label>
                                        </div>

                                        {/* Slab Management */}
                                        <div style={{ marginTop: 20 }}>
                                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                                                <h4 style={{ margin: 0, fontSize: 14, fontWeight: 600 }}>Daily Fine Slabs (Optional)</h4>
                                                <button
                                                    onClick={addSlab}
                                                    className="btn-secondary"
                                                    style={{ padding: '4px 12px', fontSize: 12, height: 32 }}
                                                >
                                                    <FiPlus /> Add Slab
                                                </button>
                                            </div>

                                            {lateFeeSettings.slabs && lateFeeSettings.slabs.length > 0 ? (
                                                <div className="table-responsive" style={{ borderRadius: 12, border: '1px solid var(--glass-border)', overflow: 'hidden' }}>
                                                    <table className="fee-table" style={{ fontSize: 13 }}>
                                                        <thead style={{ background: 'rgba(0,0,0,0.02)' }}>
                                                            <tr>
                                                                <th>From Day</th>
                                                                <th>To Day</th>
                                                                <th>Fine ({generalSettings.currencySymbol}/Day)</th>
                                                                <th style={{ width: 50 }}></th>
                                                            </tr>
                                                        </thead>
                                                        <tbody>
                                                            {lateFeeSettings.slabs.map((slab, index) => (
                                                                <tr key={index}>
                                                                    <td>
                                                                        <input
                                                                            type="number"
                                                                            value={slab.fromDay}
                                                                            onChange={(e) => updateSlab(index, 'fromDay', parseInt(e.target.value))}
                                                                            style={{ width: '100%', border: 'none', background: 'transparent' }}
                                                                        />
                                                                    </td>
                                                                    <td>
                                                                        <input
                                                                            type="number"
                                                                            value={slab.toDay || ''}
                                                                            placeholder="Forever"
                                                                            onChange={(e) => updateSlab(index, 'toDay', e.target.value ? parseInt(e.target.value) : null)}
                                                                            style={{ width: '100%', border: 'none', background: 'transparent' }}
                                                                        />
                                                                    </td>
                                                                    <td>
                                                                        <input
                                                                            type="number"
                                                                            value={slab.finePerDay}
                                                                            onChange={(e) => updateSlab(index, 'finePerDay', parseFloat(e.target.value))}
                                                                            style={{ width: '100%', border: 'none', background: 'transparent' }}
                                                                        />
                                                                    </td>
                                                                    <td style={{ textAlign: 'center' }}>
                                                                        <FiTrash2
                                                                            style={{ color: '#ef4444', cursor: 'pointer' }}
                                                                            onClick={() => removeSlab(index)}
                                                                        />
                                                                    </td>
                                                                </tr>
                                                            ))}
                                                        </tbody>
                                                    </table>
                                                </div>
                                            ) : (
                                                <div style={{ textAlign: 'center', padding: 20, background: 'rgba(0,0,0,0.02)', borderRadius: 12, fontSize: 13, color: '#64748b' }}>
                                                    No slabs defined. Using default settings above.
                                                </div>
                                            )}
                                        </div>

                                        <div style={{ marginTop: 16, padding: '12px', background: 'rgba(99, 102, 241, 0.05)', borderRadius: 8, border: '1px solid rgba(99, 102, 241, 0.1)' }}>
                                            <div style={{ fontSize: 14, fontWeight: 500, color: '#4338ca' }}>
                                                📧 Late Fee Notification ({lateFeeSettings.frequency})
                                            </div>
                                            <div style={{ fontSize: 13, color: '#64748b', marginTop: 4 }}>
                                                Automatic notifications will be sent based on the selected frequency for overdue payments
                                            </div>
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>
                    </section>

                    {/* Fee Types Section */}
                    <section className="form-section">
                        <FeeTypesSettings />
                    </section>

                    {/* Fee Structure Section */}
                    <section className="form-section">
                        <FeeStructureSettings />
                    </section>

                    {/* Notification Section */}
                    <section className="form-section">
                        <div className="section-title"><FiBell /> Notification Automation</div>
                        <div className="settings-grid">
                            {/* Render cards using the extracted component */}
                            <NotificationCard
                                notifType="creation"
                                data={notifications.creation}
                                onToggle={handleToggle}
                                onConfigChange={handleConfigChange}
                                onTest={handleTestTrigger}
                            />
                            <NotificationCard
                                notifType="pending"
                                data={notifications.pending}
                                onToggle={handleToggle}
                                onConfigChange={handleConfigChange}
                                onTest={handleTestTrigger}
                            />
                            <NotificationCard
                                notifType="overdue"
                                data={notifications.overdue}
                                onToggle={handleToggle}
                                onConfigChange={handleConfigChange}
                                onTest={handleTestTrigger}
                            />
                            <NotificationCard
                                notifType="paymentSuccess"
                                data={notifications.paymentSuccess}
                                onToggle={handleToggle}
                                onConfigChange={handleConfigChange}
                                onTest={handleTestTrigger}
                            />
                            <NotificationCard
                                notifType="partialPayment"
                                data={notifications.partialPayment}
                                onToggle={handleToggle}
                                onConfigChange={handleConfigChange}
                                onTest={handleTestTrigger}
                            />
                            <NotificationCard
                                notifType="refundStatus"
                                data={notifications.refundStatus}
                                onToggle={handleToggle}
                                onConfigChange={handleConfigChange}
                                onTest={handleTestTrigger}
                            />
                        </div>
                    </section>
                </>
            )}
        </div>
    );
};

export default FeeSettings;
