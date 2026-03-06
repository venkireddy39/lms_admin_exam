import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiPlus, FiTrash2, FiPercent, FiClock, FiCheckCircle } from 'react-icons/fi';
import { getAllRefundRules, saveRefundRule, deleteRefundRule } from '../../services/feeService';

const RefundRuleSettings = () => {
    const [rules, setRules] = useState([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [showAddForm, setShowAddForm] = useState(false);
    const [newRule, setNewRule] = useState({
        policyName: '',
        daysBeforeStart: 0,
        refundPercentage: 100,
        active: true
    });

    useEffect(() => {
        fetchRules();
    }, []);

    const fetchRules = async () => {
        try {
            const data = await getAllRefundRules();
            setRules(data || []);
        } catch (error) {
            console.error('Failed to fetch refund rules', error);
        } finally {
            setLoading(false);
        }
    };

    const handleAddRule = async () => {
        if (!newRule.policyName) {
            alert('Please enter a policy name');
            return;
        }
        setSaving(true);
        try {
            await saveRefundRule(newRule);
            await fetchRules();
            setShowAddForm(false);
            setNewRule({ policyName: '', daysBeforeStart: 0, refundPercentage: 100, active: true });
        } catch (error) {
            alert('Failed to save rule: ' + error.message);
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Delete this refund rule?')) return;
        try {
            await deleteRefundRule(id);
            await fetchRules();
        } catch (error) {
            alert('Failed to delete rule: ' + error.message);
        }
    };

    return (
        <div className="glass-card" style={{ padding: 24, marginTop: 24 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
                <div>
                    <h3 style={{ margin: 0, fontSize: 18, fontWeight: 700 }}>Refund Policy Configuration</h3>
                    <p style={{ margin: '4px 0 0 0', fontSize: 13, color: '#64748b' }}>
                        Define rules for automatic refund calculation based on cancellation time.
                    </p>
                </div>
                <button className="btn-secondary" onClick={() => setShowAddForm(!showAddForm)}>
                    <FiPlus /> {showAddForm ? 'Cancel' : 'Add Rule'}
                </button>
            </div>

            <AnimatePresence>
                {showAddForm && (
                    <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        style={{ overflow: 'hidden' }}
                    >
                        <div style={{
                            background: 'rgba(99, 102, 241, 0.05)',
                            padding: 20,
                            borderRadius: 12,
                            marginBottom: 20,
                            border: '1px solid rgba(99, 102, 241, 0.1)'
                        }}>
                            <div className="form-grid" style={{ gridTemplateColumns: '1fr 1fr 1fr', gap: 16 }}>
                                <div className="form-group">
                                    <label className="form-label">Policy Name</label>
                                    <input
                                        type="text"
                                        className="form-input"
                                        placeholder="e.g. Early Bird Refund"
                                        value={newRule.policyName}
                                        onChange={e => setNewRule({ ...newRule, policyName: e.target.value })}
                                    />
                                </div>
                                <div className="form-group">
                                    <label className="form-label">Days Before Start</label>
                                    <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                                        <FiClock style={{ position: 'absolute', left: 12, color: '#64748b' }} />
                                        <input
                                            type="number"
                                            className="form-input"
                                            style={{ paddingLeft: 36 }}
                                            value={newRule.daysBeforeStart}
                                            onChange={e => setNewRule({ ...newRule, daysBeforeStart: parseInt(e.target.value) })}
                                        />
                                    </div>
                                </div>
                                <div className="form-group">
                                    <label className="form-label">Refund Percentage (%)</label>
                                    <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                                        <FiPercent style={{ position: 'absolute', left: 12, color: '#64748b' }} />
                                        <input
                                            type="number"
                                            className="form-input"
                                            style={{ paddingLeft: 36 }}
                                            value={newRule.refundPercentage}
                                            onChange={e => setNewRule({ ...newRule, refundPercentage: parseFloat(e.target.value) })}
                                        />
                                    </div>
                                </div>
                            </div>
                            <div style={{ marginTop: 16, display: 'flex', justifyContent: 'flex-end' }}>
                                <button className="btn-primary" onClick={handleAddRule} disabled={saving}>
                                    {saving ? 'Saving...' : 'Save Policy'}
                                </button>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            <div className="table-responsive">
                <table className="premium-table">
                    <thead>
                        <tr>
                            <th>Policy Name</th>
                            <th>Condition</th>
                            <th>Refund %</th>
                            <th>Status</th>
                            <th>Action</th>
                        </tr>
                    </thead>
                    <tbody>
                        {loading ? (
                            <tr><td colSpan="5" style={{ textAlign: 'center' }}>Loading rules...</td></tr>
                        ) : rules.length === 0 ? (
                            <tr><td colSpan="5" style={{ textAlign: 'center' }}>No rules defined. Default is 100% refund.</td></tr>
                        ) : rules.map(rule => (
                            <tr key={rule.id}>
                                <td style={{ fontWeight: 600 }}>{rule.policyName}</td>
                                <td>{rule.daysBeforeStart}+ Days before start</td>
                                <td style={{ color: '#10b981', fontWeight: 700 }}>{rule.refundPercentage}%</td>
                                <td>
                                    <span className={`status-badge ${rule.active ? 'paid' : 'pending'}`}>
                                        {rule.active ? 'Active' : 'Inactive'}
                                    </span>
                                </td>
                                <td>
                                    <button className="btn-icon" onClick={() => handleDelete(rule.id)}>
                                        <FiTrash2 color="#ef4444" size={14} />
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default RefundRuleSettings;
