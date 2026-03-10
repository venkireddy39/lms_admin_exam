import React from 'react';
import { motion } from 'framer-motion';
import { FiUsers, FiLayers, FiFilter, FiSearch, FiX } from 'react-icons/fi';
import SectionHeader from './SectionHeader';

const FeeAssignmentSection = ({ 
    data, 
    setData, 
    studentSearch, 
    setStudentSearch, 
    searchableStudents, 
    handleStudentSearchAdd, 
    removeStudent, 
    availableBatches, 
    availableCourses 
}) => {
    return (
        <motion.div className="glass-card form-section" initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.2 }} style={{ position: 'relative', zIndex: 10 }}>
            <SectionHeader icon={FiUsers} title="Assign Fee To" description="Select specific students or batches for this fee" />

            <div style={{ display: 'flex', gap: 12, marginBottom: 24, padding: 4, background: '#f1f5f9', borderRadius: 12, width: 'fit-content' }}>
                <button
                    className={`nav-tab ${data.targetType === 'student' ? 'active' : ''}`}
                    onClick={() => setData({ ...data, targetType: 'student' })}
                    style={{
                        margin: 0,
                        border: 'none',
                        background: data.targetType === 'student' ? 'white' : 'transparent',
                        boxShadow: data.targetType === 'student' ? '0 2px 5px rgba(0,0,0,0.05)' : 'none',
                        color: data.targetType === 'student' ? '#0f172a' : '#64748b',
                        padding: '8px 16px',
                        borderRadius: 8
                    }}
                >
                    <FiUsers size={14} style={{ marginRight: 8 }} /> Individual Students
                </button>
                <button
                    className={`nav-tab ${data.targetType === 'batch' ? 'active' : ''}`}
                    onClick={() => setData({ ...data, targetType: 'batch' })}
                    style={{
                        margin: 0,
                        border: 'none',
                        background: data.targetType === 'batch' ? 'white' : 'transparent',
                        boxShadow: data.targetType === 'batch' ? '0 2px 5px rgba(0,0,0,0.05)' : 'none',
                        color: data.targetType === 'batch' ? '#0f172a' : '#64748b',
                        padding: '8px 16px',
                        borderRadius: 8
                    }}
                >
                    <FiLayers size={14} style={{ marginRight: 8 }} /> Entire Batch
                </button>
            </div>

            <div className="form-grid" style={{ marginBottom: 24, gridTemplateColumns: '1fr 1fr' }}>
                <div className="form-group">
                    <label className="form-label">Filter by Course</label>
                    <div style={{ position: 'relative' }}>
                        <FiLayers style={{ position: 'absolute', left: 14, top: 14, color: '#64748b' }} />
                        <select
                            className="form-select"
                            style={{ paddingLeft: 38 }}
                            value={data.course}
                            onChange={(e) => setData({ ...data, course: e.target.value, batch: '' })}
                        >
                            <option value="">All Courses</option>
                            {availableCourses.map(c => (
                                <option key={c.courseId} value={c.courseId}>{c.courseName}</option>
                            ))}
                        </select>
                    </div>
                </div>

                <div className="form-group">
                    <label className="form-label">Filter by Batch</label>
                    <div style={{ position: 'relative' }}>
                        <FiFilter style={{ position: 'absolute', left: 14, top: 14, color: '#64748b' }} />
                        <select
                            className="form-select"
                            style={{ paddingLeft: 38 }}
                            value={data.batch}
                            onChange={(e) => setData({ ...data, batch: e.target.value })}
                            disabled={!data.course}
                        >
                            <option value="">{data.course ? 'All Batches' : 'Select Course First'}</option>
                            {availableBatches.filter(b => !data.course || String(b.courseId) === String(data.course)).map(b => (
                                <option key={b.batchId || b.id} value={b.batchId || b.id}>{b.batchName}</option>
                            ))}
                        </select>
                    </div>
                </div>
            </div>

            {data.targetType === 'student' && (
                <div className="form-group">
                    <label className="form-label">Search & Add Students {data.batch ? '(from selected batch)' : ''}</label>
                    <div style={{ position: 'relative', marginBottom: 16 }}>
                        <FiSearch style={{ position: 'absolute', left: 14, top: 14, color: '#64748b' }} />
                        <input
                            type="text"
                            className="form-input"
                            placeholder="Search by name or ID..."
                            style={{ paddingLeft: 38 }}
                            value={studentSearch}
                            onChange={(e) => setStudentSearch(e.target.value)}
                        />
                        {studentSearch && (
                            <div style={{
                                position: 'absolute', top: 'calc(100% + 8px)', left: 0, right: 0,
                                background: 'white', borderRadius: 12, boxShadow: '0 10px 25px -5px rgba(0,0,0,0.1)',
                                zIndex: 10, padding: 8, border: '1px solid #e2e8f0'
                            }}>
                                {searchableStudents.filter(s => s.name.toLowerCase().includes(studentSearch.toLowerCase()) || String(s.id).includes(studentSearch)).map(student => (
                                    <div
                                        key={student.id}
                                        onClick={() => { handleStudentSearchAdd(student); setStudentSearch(''); }}
                                        style={{ padding: '10px 14px', cursor: 'pointer', borderRadius: 8, transition: 'background 0.2s' }}
                                        onMouseEnter={(e) => e.target.style.background = '#f8fafc'}
                                        onMouseLeave={(e) => e.target.style.background = 'transparent'}
                                    >
                                        <div style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{student.name}</div>
                                        <div style={{ fontSize: 12, color: 'var(--text-secondary)' }}>ID: #{student.id}</div>
                                    </div>
                                ))}
                                {searchableStudents.filter(s => s.name.toLowerCase().includes(studentSearch.toLowerCase()) || String(s.id).includes(studentSearch)).length === 0 && (
                                    <div style={{ padding: 12, textAlign: 'center', color: '#94a3b8' }}>No students found</div>
                                )}
                            </div>
                        )}
                    </div>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10 }}>
                        {data.selectedStudents.map(student => (
                            <div key={student.id} className="status-badge" style={{ background: '#e0e7ff', color: '#4338ca', padding: '8px 14px', border: '1px solid #c7d2fe' }}>
                                {student.name}
                                <FiX style={{ marginLeft: 8, cursor: 'pointer', opacity: 0.7 }} onClick={() => removeStudent(student.id)} />
                            </div>
                        ))}
                        {data.selectedStudents.length === 0 && <div style={{ padding: 20, width: '100%', textAlign: 'center', border: '2px dashed var(--glass-border)', borderRadius: 12, color: 'var(--text-secondary)' }}>No students selected. Search above to add.</div>}
                    </div>
                </div>
            )}
        </motion.div>
    );
};

export default FeeAssignmentSection;
