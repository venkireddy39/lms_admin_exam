import React from 'react';
import { motion } from 'framer-motion';
import { FiUsers } from 'react-icons/fi';

const BatchGridView = ({ batches, selectedCourse, setSelectedBatchId }) => {
    const filteredBatches = batches.filter(b => String(b.courseId) === String(selectedCourse));

    return (
        <div className="form-grid" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 20 }}>
            {filteredBatches.map(batch => (
                <motion.div
                    key={batch.batchId}
                    className="glass-card"
                    whileHover={{ y: -5, borderColor: '#6366f1' }}
                    onClick={() => setSelectedBatchId(batch.batchId)}
                    style={{ cursor: 'pointer', transition: 'all 0.2s', padding: 24 }}
                >
                    <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 16 }}>
                        <div style={{ width: 48, height: 48, background: '#e0e7ff', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#4338ca', fontSize: 20 }}>
                            <FiUsers />
                        </div>
                        <div>
                            <h4 style={{ margin: 0, fontSize: 18, fontWeight: 700 }}>{batch.batchName}</h4>
                            <div style={{ fontSize: 13, color: '#64748b' }}>{batch.courseName || 'Course'}</div>
                        </div>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#f8fafc', padding: '12px 16px', borderRadius: 12 }}>
                        <div style={{ fontSize: 13, fontWeight: 500, color: '#64748b' }}>Members Present</div>
                        <div style={{ fontSize: 18, fontWeight: 700, color: '#0f172a' }}>{batch.studentCount || 0}</div>
                    </div>
                </motion.div>
            ))}
            {filteredBatches.length === 0 && (
                <div style={{ gridColumn: '1/-1', textAlign: 'center', padding: 40, color: '#94a3b8' }}>
                    No batches found for this course.
                </div>
            )}
        </div>
    );
};

export default BatchGridView;
