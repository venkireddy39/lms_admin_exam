import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
    FiUsers, FiFilter, FiMoreVertical, FiTrash2, FiLoader, FiAlertCircle, FiRefreshCcw, FiCalendar 
} from 'react-icons/fi';

const FeeBatchesGrid = ({ 
    batches, 
    loading, 
    error, 
    onBatchClick, 
    onDeleteBatch, 
    onRetry 
}) => {
    const [selectedCourse, setSelectedCourse] = useState('All');
    const [activeMenu, setActiveMenu] = useState(null);

    useEffect(() => {
        const closeMenu = () => setActiveMenu(null);
        window.addEventListener('click', closeMenu);
        return () => window.removeEventListener('click', closeMenu);
    }, []);

    const uniqueCourses = ['All', ...new Set(batches.map(b => b.course).filter(Boolean))];
    const filteredBatches = selectedCourse === 'All'
        ? batches
        : batches.filter(b => b.course === selectedCourse);

    if (error) {
        return (
            <div className="glass-card" style={{ textAlign: 'center', padding: 40, color: '#ef4444' }}>
                <FiAlertCircle size={24} style={{ marginBottom: 12 }} />
                <div>{error}</div>
                <button
                    className="btn-primary"
                    onClick={onRetry}
                    style={{ marginTop: 16, padding: '8px 20px' }}
                >
                    <FiRefreshCcw style={{ marginRight: 8 }} /> Retry
                </button>
            </div>
        );
    }

    return (
        <motion.div
            key="grid"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
        >
            <div style={{ marginBottom: 20, display: 'flex', gap: 16, alignItems: 'center' }}>
                <div style={{ position: 'relative', minWidth: 250 }}>
                    <select
                        className="form-select"
                        value={selectedCourse}
                        onChange={(e) => setSelectedCourse(e.target.value)}
                        style={{
                            padding: '10px 16px', borderRadius: 10, border: '1px solid #e2e8f0',
                            outline: 'none', width: '100%', cursor: 'pointer',
                            boxShadow: '0 2px 5px rgba(0,0,0,0.02)', appearance: 'none', background: 'white'
                        }}
                    >
                        {uniqueCourses.map(course => (
                            <option key={course} value={course}>{course === 'All' ? 'All Courses' : course}</option>
                        ))}
                    </select>
                    <FiFilter style={{ position: 'absolute', right: 14, top: 14, color: '#64748b', pointerEvents: 'none' }} />
                </div>
                <div style={{ color: '#64748b', fontSize: 13 }}>
                    Showing {filteredBatches.length} batch{filteredBatches.length !== 1 ? 'es' : ''}
                </div>
            </div>

            <div
                className="form-grid"
                style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', paddingBottom: 100 }}
            >
                {loading && (
                    <div className="glass-card" style={{ gridColumn: '1/-1', textAlign: 'center', padding: 40 }}>
                        <FiLoader className="spin" style={{ marginBottom: 16 }} size={24} />
                        <div>Loading Batches...</div>
                    </div>
                )}

                {!loading && filteredBatches.map(batch => (
                    <div
                        key={batch.id}
                        className="glass-card batch-card"
                        onClick={() => onBatchClick(batch)}
                        style={{ cursor: 'pointer', position: 'relative' }}
                    >
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
                            <div className="batch-icon-placeholder">
                                <FiUsers size={20} color="white" />
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                <div className={`status-badge ${batch.collected >= 80 ? 'paid' : batch.collected >= 40 ? 'pending' : 'overdue'}`}>
                                    {batch.collected}% Collected
                                </div>
                                {String(batch.id).startsWith('custom-') && (
                                    <div style={{ position: 'relative' }} onClick={e => e.stopPropagation()}>
                                        <button
                                            className="btn-icon"
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                setActiveMenu(activeMenu === batch.id ? null : batch.id);
                                            }}
                                            style={{ width: 28, height: 28 }}
                                        >
                                            <FiMoreVertical size={16} />
                                        </button>

                                        {activeMenu === batch.id && (
                                            <div className="dropdown-menu show" style={{
                                                position: 'absolute', right: 0, top: '100%',
                                                minWidth: 120, zIndex: 10, marginTop: 4,
                                                boxShadow: '0 4px 20px rgba(0,0,0,0.15)'
                                            }}>
                                                <button
                                                    className="dropdown-item text-danger"
                                                    onClick={(e) => onDeleteBatch(e, batch.id)}
                                                    style={{ display: 'flex', alignItems: 'center', gap: 8 }}
                                                >
                                                    <FiTrash2 size={14} /> Delete
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>
                        </div>

                        <h3 style={{ margin: '0 0 4px 0', fontSize: 16 }}>{batch.name}</h3>
                        <p style={{ margin: 0, fontSize: 13, color: 'var(--text-secondary)' }}>{batch.course}</p>

                        <div style={{ marginTop: 20, display: 'flex', gap: 16, fontSize: 13, color: 'var(--text-secondary)' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                                <FiCalendar size={14} /> {batch.year}
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                                <FiUsers size={14} /> {batch.students} Members Present
                            </div>
                        </div>

                        <div style={{ marginTop: 16, height: 4, background: '#e2e8f0', borderRadius: 2, overflow: 'hidden' }}>
                            <div style={{ width: `${batch.collected}%`, background: 'var(--primary-gradient)', height: '100%' }}></div>
                        </div>
                    </div>
                ))}
                {!loading && filteredBatches.length === 0 && (
                    <div style={{ gridColumn: '1/-1', textAlign: 'center', padding: 40, color: '#94a3b8' }}>
                        No batches found for the selected course.
                    </div>
                )}
            </div>
        </motion.div>
    );
};

export default FeeBatchesGrid;
