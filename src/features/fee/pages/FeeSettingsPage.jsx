import React, { useEffect, useState } from 'react';
import { FiPlus, FiX, FiBell, FiClock, FiCalendar, FiCheckCircle, FiInfo, FiTrash2, FiSave, FiLoader, FiZap, FiPercent, FiAlertCircle } from 'react-icons/fi';

const API_BASE = '';

export default function FeeSettingsPage() {
    const [offsets, setOffsets] = useState([-3, 0, 2]); // default example
    const [inputValue, setInputValue] = useState('');
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [msg, setMsg] = useState(null);

    useEffect(() => {
        const token = localStorage.getItem('token');
        fetch(`${API_BASE}/api/v1/admin/settings/reminder-offsets`, {
            headers: { Authorization: `Bearer ${token}` }
        })
            .then(r => r.json())
            .then(data => {
                if (data.offsets) setOffsets(data.offsets);
                setLoading(false);
            })
            .catch(() => { setLoading(false); });
    }, []);

    const addOffset = () => {
        const val = parseInt(inputValue);
        if (isNaN(val)) return;
        if (offsets.includes(val)) {
            setInputValue('');
            return;
        }
        setOffsets([...offsets, val].sort((a, b) => a - b));
        setInputValue('');
    };

    const removeOffset = (val) => {
        setOffsets(offsets.filter(o => o !== val));
    };

    const handleSave = async () => {
        if (offsets.length === 0) {
            setMsg({ type: 'error', text: 'Please add at least one reminder offset.' });
            return;
        }
        setSaving(true);
        setMsg(null);
        try {
            const token = localStorage.getItem('token');
            const res = await fetch(`${API_BASE}/api/v1/admin/settings/reminder-offsets`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
                body: JSON.stringify({ offsets })
            });
            if (!res.ok) throw new Error('Save failed');
            setMsg({ type: 'success', text: `✅ Settings updated successfully!` });
        } catch {
            setMsg({ type: 'error', text: '❌ Failed to save. Please try again.' });
        } finally {
            setSaving(false);
        }
    };

    const getOffsetLabel = (o) => {
        if (o === 0) return "On Due Date";
        if (o < 0) return `${Math.abs(o)} Days Before`;
        return `${o} Days After (with Fine)`;
    };

    return (
        <div className="container-fluid py-4" style={{ maxWidth: 850 }}>
            <div className="d-flex justify-content-between align-items-center mb-4">
                <div>
                    <h5 className="fw-bold mb-1">Fee Module Settings</h5>
                    <p className="text-muted small mb-0">Manage reminder engine behavior and late fee automation.</p>
                </div>
                <button
                    className="btn btn-primary d-flex align-items-center gap-2 px-4 shadow-sm"
                    onClick={handleSave}
                    disabled={saving || loading}
                >
                    {saving ? <FiLoader className="spin" /> : <FiSave />}
                    {saving ? 'Saving...' : 'Save All Changes'}
                </button>
            </div>

            {msg && (
                <div className={`alert d-flex align-items-center gap-3 border-0 shadow-sm mb-4 ${msg.type === 'success' ? 'alert-success' : 'alert-danger'}`}>
                    {msg.type === 'success' ? <FiCheckCircle size={20} /> : <FiAlertCircle size={20} />}
                    <div className="fw-medium">{msg.text}</div>
                    <button className="btn-close ms-auto" onClick={() => setMsg(null)}></button>
                </div>
            )}

            <div className="row g-4">
                <div className="col-lg-8">
                    {/* Reminder Configuration Card */}
                    <div className="card border-0 shadow-sm overflow-hidden h-100">
                        <div className="card-header bg-white border-bottom py-3 d-flex align-items-center gap-2">
                            <div className="p-2 rounded bg-primary-soft text-primary">
                                <FiBell size={20} />
                            </div>
                            <div>
                                <h6 className="fw-bold mb-0">Automated Reminder Schedule</h6>
                                <small className="text-muted">Configure when payment links are sent to students.</small>
                            </div>
                        </div>
                        <div className="card-body p-4">
                            {loading ? (
                                <div className="text-center py-5">
                                    <div className="spinner-border text-primary" role="status"></div>
                                    <div className="mt-2 text-muted">Syncing configuration...</div>
                                </div>
                            ) : (
                                <>
                                    <div className="mb-4">
                                        <label className="form-label fw-bold text-dark small text-uppercase">Active Reminder Offsets</label>
                                        <div className="d-flex flex-wrap gap-2 p-3 rounded border bg-light-subtle">
                                            {offsets.length === 0 && <span className="text-muted small italic">No reminders scheduled</span>}
                                            {offsets.map(o => (
                                                <div key={o} className={`d-flex align-items-center gap-2 px-3 py-2 rounded shadow-sm border ${o < 0 ? 'bg-primary text-white border-primary' : o === 0 ? 'bg-indigo text-white border-indigo' : 'bg-warning-soft text-warning-emphasis border-warning-subtle'}`} style={{ backgroundColor: o === 0 ? '#4f46e5' : undefined }}>
                                                    <span className="fw-bold small">{o > 0 ? `+${o}` : o}</span>
                                                    <span className="small opacity-75">{o === 0 ? 'Due Date' : 'Days'}</span>
                                                    <FiX
                                                        className="cursor-pointer ms-1 hover-scale"
                                                        onClick={() => removeOffset(o)}
                                                        size={14}
                                                    />
                                                </div>
                                            ))}
                                        </div>
                                    </div>

                                    <div className="row g-3 align-items-end">
                                        <div className="col-md-8">
                                            <label className="form-label fw-semibold small">Add New Offset</label>
                                            <div className="input-group">
                                                <input
                                                    type="number"
                                                    className="form-control"
                                                    placeholder="e.g. -3 or 2"
                                                    value={inputValue}
                                                    onChange={e => setInputValue(e.target.value)}
                                                    onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), addOffset())}
                                                />
                                                <button className="btn btn-outline-primary" type="button" onClick={addOffset}>
                                                    <FiPlus /> Add
                                                </button>
                                            </div>
                                            <div className="form-text small mt-2">
                                                Negative = Days Before due. 0 = On due date. Positive = Days after.
                                            </div>
                                        </div>
                                    </div>
                                </>
                            )}
                        </div>
                    </div>
                </div>

                <div className="col-lg-4">
                    {/* Insights Card */}
                    <div className="card border-0 shadow-sm h-100 bg-dark text-white">
                        <div className="card-body p-4">
                            <h6 className="fw-bold mb-3 d-flex align-items-center gap-2">
                                <FiInfo className="text-info" /> Engine Logic
                            </h6>
                            <div className="vstack gap-3">
                                <div className="d-flex gap-3">
                                    <div className="p-2 rounded bg-secondary-soft text-white opacity-75" style={{ height: 'fit-content' }}>
                                        <FiClock size={16} />
                                    </div>
                                    <div>
                                        <div className="small fw-bold">Daily Run</div>
                                        <div className="text-secondary small">Scheduler creates jobs every morning at 9 AM IST.</div>
                                    </div>
                                </div>
                                <div className="d-flex gap-3">
                                    <div className="p-2 rounded bg-secondary-soft text-white opacity-75" style={{ height: 'fit-content' }}>
                                        <FiZap size={16} />
                                    </div>
                                    <div>
                                        <div className="small fw-bold">Live Processing</div>
                                        <div className="text-secondary small">Processing engine runs every 10 mins for PENDING links.</div>
                                    </div>
                                </div>
                                <div className="d-flex gap-3">
                                    <div className="p-2 rounded bg-secondary-soft text-white opacity-75" style={{ height: 'fit-content' }}>
                                        <FiPercent size={16} />
                                    </div>
                                    <div>
                                        <div className="small fw-bold">Late Fee Logic</div>
                                        <div className="text-secondary small">Reminders sent after due date automatically include current fines.</div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Custom Styles */}
            <style>{`
                .bg-primary-soft { background-color: rgba(99, 102, 241, 0.1); }
                .bg-warning-soft { background-color: rgba(245, 158, 11, 0.1); }
                .bg-light-subtle { background-color: #f8fafc; }
                .text-indigo { color: #4f46e5; }
                .bg-indigo { background-color: #4f46e5; }
                .cursor-pointer { cursor: pointer; }
                .hover-scale:hover { transform: scale(1.2); transition: transform 0.2s; }
                .spin { animation: fa-spin 2s infinite linear; }
                @keyframes fa-spin {
                    0% { transform: rotate(0deg); }
                    100% { transform: rotate(359deg); }
                }
            `}</style>
        </div>
    );
}
