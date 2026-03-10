import React from 'react';
import { motion } from 'framer-motion';
import { FiSettings, FiCheckCircle } from 'react-icons/fi';
import SectionHeader from './SectionHeader';

const PaymentMethodsSection = ({ data, setData, toggleNested }) => (
    <motion.div className="glass-card form-section" initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.4 }}>
        <SectionHeader icon={FiSettings} title="Payment Methods" description="Select allowed payment modes for this fee" />
        <div className="form-grid">
            <div className="form-group">
                <label className="form-label" style={{ marginBottom: 10 }}>Online Modes</label>
                <div className="glass-card" style={{ padding: 16, background: 'rgba(255,255,255,0.4)', borderRadius: 12 }}>
                    {Object.keys(data.online).map(mode => (
                        <label key={mode} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 0', borderBottom: '1px solid rgba(0,0,0,0.05)', cursor: 'pointer' }}>
                            <div className={`checkbox-custom ${data.online[mode] ? 'checked' : ''}`} style={{
                                width: 20, height: 20, borderRadius: 6, border: data.online[mode] ? 'none' : '2px solid #cbd5e1',
                                background: data.online[mode] ? 'var(--primary-gradient)' : 'transparent', display: 'flex', alignItems: 'center', justifyContent: 'center'
                            }}>
                                {data.online[mode] && <FiCheckCircle color="white" size={12} />}
                            </div>
                            <input type="checkbox" checked={data.online[mode]} onChange={() => toggleNested(setData, 'online', mode)} style={{ display: 'none' }} />
                            <span style={{ textTransform: 'capitalize', fontWeight: 500 }}>{mode}</span>
                        </label>
                    ))}
                </div>
            </div>
            <div className="form-group">
                <label className="form-label" style={{ marginBottom: 10 }}>Manual Modes</label>
                <div className="glass-card" style={{ padding: 16, background: 'rgba(255,255,255,0.4)', borderRadius: 12 }}>
                    {Object.keys(data.manual).map(mode => (
                        <label key={mode} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 0', borderBottom: '1px solid rgba(0,0,0,0.05)', cursor: 'pointer' }}>
                            <div className={`checkbox-custom ${data.manual[mode] ? 'checked' : ''}`} style={{
                                width: 20, height: 20, borderRadius: 6, border: data.manual[mode] ? 'none' : '2px solid #cbd5e1',
                                background: data.manual[mode] ? 'var(--primary-gradient)' : 'transparent', display: 'flex', alignItems: 'center', justifyContent: 'center'
                            }}>
                                {data.manual[mode] && <FiCheckCircle color="white" size={12} />}
                            </div>
                            <input type="checkbox" checked={data.manual[mode]} onChange={() => toggleNested(setData, 'manual', mode)} style={{ display: 'none' }} />
                            <span style={{ textTransform: 'capitalize', fontWeight: 500 }}>{mode.replace(/([A-Z])/g, ' $1').trim()}</span>
                        </label>
                    ))}
                </div>
            </div>
        </div>
        <div style={{ marginTop: 24, padding: 16, background: '#f8fafc', borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div>
                <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>Allow Admin Manual Record</span>
                <p style={{ margin: 0, fontSize: 12, color: 'var(--text-secondary)' }}>Admins can mark fees as paid manually</p>
            </div>
            <div
                className={`toggle-switch ${data.allowManualRecording ? 'active' : ''}`}
                onClick={() => setData({ ...data, allowManualRecording: !data.allowManualRecording })}
            >
                <div className="toggle-track"><div className="toggle-thumb"></div></div>
            </div>
        </div>
    </motion.div>
);

export default PaymentMethodsSection;
