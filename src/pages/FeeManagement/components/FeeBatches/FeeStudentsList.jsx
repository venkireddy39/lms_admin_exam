import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
    FiArrowLeft, FiSearch, FiFilter, FiCheckCircle, FiChevronRight, FiTrash2 
} from 'react-icons/fi';
import { calculateStatus } from '../../utils/feeUtils';

const FeeStudentsList = ({ 
    selectedBatch, 
    students, 
    loading, 
    onBack, 
    onStudentClick, 
    onRemoveStudent 
}) => {
    const [searchTerm, setSearchTerm] = useState('');
    const [filterStatus, setFilterStatus] = useState('All');
    const [showFilterMenu, setShowFilterMenu] = useState(false);

    const filteredStudents = students.filter(student => {
        const { status } = calculateStatus(student);
        if (filterStatus !== 'All' && status !== filterStatus.toUpperCase()) return false;
        if (searchTerm && !student.name.toLowerCase().includes(searchTerm.toLowerCase()) &&
            !student.roll.toLowerCase().includes(searchTerm.toLowerCase())) return false;
        return true;
    });

    return (
        <motion.div
            key="list"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
        >
            <div className="glass-card" style={{ marginBottom: 24, display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px 24px', overflow: 'visible', position: 'relative', zIndex: 50 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                    <button className="btn-icon" onClick={onBack}><FiArrowLeft /></button>
                    <div>
                        <h3 style={{ margin: 0, fontSize: 18 }}>{selectedBatch?.name}</h3>
                        <div style={{ fontSize: 13, color: 'var(--text-secondary)' }}>{selectedBatch?.course} • {selectedBatch?.year}</div>
                    </div>
                </div>
                <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
                    <div style={{ display: 'flex', alignItems: 'center', background: 'rgba(255,255,255,0.5)', padding: '6px 12px', borderRadius: 8, border: '1px solid var(--glass-border)' }}>
                        <FiSearch color="var(--text-secondary)" />
                        <input
                            placeholder="Search student..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            style={{ background: 'transparent', border: 'none', marginLeft: 8, outline: 'none', fontSize: 13 }}
                        />
                    </div>

                    <div style={{ position: 'relative' }}>
                        <button
                            className={`btn-icon ${filterStatus !== 'All' ? 'active-filter' : ''}`}
                            onClick={() => setShowFilterMenu(!showFilterMenu)}
                        >
                            <FiFilter />
                        </button>
                        {showFilterMenu && (
                            <div className="dropdown-menu show" style={{
                                position: 'absolute', right: 0, top: '120%',
                                minWidth: 150, zIndex: 50,
                                boxShadow: '0 4px 20px rgba(0,0,0,0.15)'
                            }}>
                                {['All', 'Paid', 'Pending', 'Overdue', 'Partial'].map(status => (
                                    <button
                                        key={status}
                                        className="dropdown-item"
                                        style={{
                                            justifyContent: 'flex-start',
                                            background: filterStatus === status ? '#f1f5f9' : 'transparent',
                                            fontWeight: filterStatus === status ? 600 : 400
                                        }}
                                        onClick={() => {
                                            setFilterStatus(status);
                                            setShowFilterMenu(false);
                                        }}
                                    >
                                        {status}
                                        {filterStatus === status && <FiCheckCircle size={12} style={{ marginLeft: 'auto', color: '#6366f1' }} />}
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>

            <div className="glass-card table-container">
                {loading ? <div style={{ padding: 20, textAlign: 'center' }}>Loading Students...</div> : (
                    <table className="premium-table">
                        <thead>
                            <tr>
                                <th>Student Name</th>
                                <th>Roll No</th>
                                <th>Status</th>
                                <th>Total Fee</th>
                                <th>Paid</th>
                                <th>Due</th>
                                <th>Action</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredStudents.map(student => {
                                const { total, paid, due, status } = calculateStatus(student);
                                return (
                                    <tr key={student.id} onClick={() => onStudentClick(student)} style={{ cursor: 'pointer' }}>
                                        <td style={{ fontWeight: 600 }}>{student.name}</td>
                                        <td style={{ fontFamily: 'monospace', color: 'var(--text-secondary)' }}>{student.roll}</td>
                                        <td>
                                            <span className={`status-badge ${status.toLowerCase()}`}>
                                                {status}
                                            </span>
                                        </td>
                                        <td>₹{total.toLocaleString()}</td>
                                        <td style={{ color: '#059669' }}>₹{paid.toLocaleString()}</td>
                                        <td style={{ color: due > 0 ? '#dc2626' : 'var(--text-secondary)', fontWeight: due > 0 ? 700 : 400 }}>
                                            {due > 0 ? `₹${due.toLocaleString()}` : '-'}
                                        </td>
                                        <td>
                                            <div style={{ display: 'flex', gap: 8 }} onClick={e => e.stopPropagation()}>
                                                <button className="btn-icon" style={{ width: 28, height: 28 }} onClick={() => onStudentClick(student)}>
                                                    <FiChevronRight />
                                                </button>
                                                {selectedBatch && String(selectedBatch.id).startsWith('custom-') && (
                                                    <button
                                                        className="btn-icon"
                                                        style={{ width: 28, height: 28, color: '#ef4444', borderColor: '#fee2e2', background: '#fef2f2' }}
                                                        onClick={(e) => onRemoveStudent(e, student.id)}
                                                        title="Remove Student"
                                                    >
                                                        <FiTrash2 size={12} />
                                                    </button>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                );
                            })}
                            {students.length === 0 && (
                                <tr>
                                    <td colSpan="7" style={{ textAlign: 'center', padding: 20, color: 'var(--text-secondary)' }}>
                                        No students in this batch.
                                    </td>
                                </tr>
                            )}
                            {students.length > 0 && filteredStudents.length === 0 && (
                                <tr>
                                    <td colSpan="7" style={{ textAlign: 'center', padding: 20, color: 'var(--text-secondary)' }}>
                                        No students matching the filters.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                )}
            </div>
        </motion.div>
    );
};

export default FeeStudentsList;
