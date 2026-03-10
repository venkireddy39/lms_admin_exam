import React from 'react';
import { motion } from 'framer-motion';
import { FiBell } from 'react-icons/fi';
import SectionHeader from './SectionHeader';

const NotificationSettingsSection = ({ data, setData, toggleNested }) => (
    <motion.div className="glass-card form-section" style={{ marginBottom: 100 }} initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.5 }}>
        <SectionHeader icon={FiBell} title="Notifications & Automation" description="Configure automated alerts for this fee" />
        <div className="form-grid">
            <div className="form-group">
                <label className="form-label">Triggers</label>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                    {Object.keys(data.triggers).map(trigger => (
                        <div key={trigger} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 14px', background: 'white', border: '1px solid #f1f5f9', borderRadius: 10 }}>
                            <span style={{ fontSize: 14, fontWeight: 500 }}>{trigger.replace('on', 'On ')}</span>
                            <div
                                className={`toggle-switch ${data.triggers[trigger] ? 'active' : ''}`}
                                onClick={() => toggleNested(setData, 'triggers', trigger)}
                                style={{ transform: 'scale(0.8)' }}
                            >
                                <div className="toggle-track"><div className="toggle-thumb"></div></div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    </motion.div>
);

export default NotificationSettingsSection;
