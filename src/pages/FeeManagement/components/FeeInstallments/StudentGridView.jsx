import React from 'react';
import { motion } from 'framer-motion';
import { FiEdit3, FiLayers } from 'react-icons/fi';

const StudentGridView = ({ studentList, openStudentConfig, openBatchConfig, batchName }) => {
    return (
        <div className="form-grid" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 20 }}>
            {studentList?.map(student => (
                <motion.div
                    key={student.id}
                    className="glass-card student-card"
                    whileHover={{ y: -5, borderColor: '#6366f1' }}
                    onClick={() => openStudentConfig(student)}
                    style={{
                        cursor: 'pointer',
                        border: '1px solid transparent',
                        transition: 'all 0.2s',
                        position: 'relative'
                    }}
                >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
                        <div>
                            <h4 style={{ margin: 0, fontSize: 16 }}>{student.name}</h4>
                            <div style={{ fontSize: 12, color: '#64748b' }}>ID: {student.id}</div>
                        </div>
                        <div style={{ background: '#e0e7ff', color: '#4338ca', padding: '4px 8px', borderRadius: 6, fontSize: 11, fontWeight: 600 }}>
                            {student.planType === 'OneTime' || !student.planType ? 'One-Time' : student.planType}
                        </div>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div>
                            <div style={{ fontSize: 11, color: '#94a3b8' }}>Total Payable</div>
                            <div style={{ fontWeight: 700, color: '#0f172a' }}>₹{(student.totalFee || 0).toLocaleString()}</div>
                        </div>
                        <button className="btn-icon" style={{ background: '#f8fafc', width: 32, height: 32 }}>
                            <FiEdit3 />
                        </button>
                    </div>
                </motion.div>
            ))}

            {studentList?.length > 0 && (
                <motion.div
                    className="glass-card border-dashed"
                    whileHover={{ y: -5, borderColor: '#6366f1', background: '#f8faff' }}
                    onClick={openBatchConfig}
                    style={{
                        cursor: 'pointer',
                        border: '2px dashed #e2e8f0',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: 12,
                        minHeight: 140
                    }}
                >
                    <div style={{ width: 40, height: 40, background: '#e0e7ff', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#4338ca' }}>
                        <FiLayers />
                    </div>
                    <div style={{ textAlign: 'center' }}>
                        <div style={{ fontWeight: 600, color: '#4338ca' }}>Apply to Whole Batch</div>
                        <div style={{ fontSize: 12, color: '#64748b' }}>Set same split for all students</div>
                    </div>
                </motion.div>
            )}

            {(!studentList || studentList.length === 0) && (
                <div style={{ gridColumn: '1/-1', textAlign: 'center', padding: 40, color: '#94a3b8' }}>
                    No students found in this batch.
                </div>
            )}
        </div>
    );
};

export default StudentGridView;
