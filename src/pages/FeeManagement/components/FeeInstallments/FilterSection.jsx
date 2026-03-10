import React from 'react';
import { FiLayers } from 'react-icons/fi';

const FilterSection = ({ courses, selectedCourse, setSelectedCourse, setSelectedBatchId, batches, selectedBatchId, disabled }) => {
    return (
        <div className="glass-card form-section" style={{ marginBottom: 24, display: 'flex', gap: 24 }}>
            <div style={{ flex: 1 }}>
                <label className="form-label">Select Course</label>
                <div style={{ position: 'relative' }}>
                    <FiLayers style={{ position: 'absolute', left: 14, top: 14, color: '#64748b' }} />
                    <select
                        className="form-select"
                        style={{ paddingLeft: 38 }}
                        value={selectedCourse}
                        onChange={(e) => {
                            setSelectedCourse(e.target.value);
                            setSelectedBatchId('');
                        }}
                    >
                        <option value="">-- Select Course --</option>
                        {courses.map(c => (
                            <option key={c.courseId} value={c.courseId}>
                                {c.courseName}
                            </option>
                        ))}
                    </select>
                </div>
            </div>
            <div style={{ flex: 1 }}>
                <label className="form-label">Select Batch</label>
                <div style={{ position: 'relative' }}>
                    <FiLayers style={{ position: 'absolute', left: 14, top: 14, color: '#64748b' }} />
                    <select
                        className="form-select"
                        style={{ paddingLeft: 38 }}
                        value={selectedBatchId}
                        onChange={(e) => setSelectedBatchId(e.target.value)}
                        disabled={!selectedCourse || disabled}
                    >
                        <option value="">-- Select Batch --</option>
                        {batches.filter(b => String(b.courseId) === String(selectedCourse)).map(b => (
                            <option key={b.batchId} value={b.batchId}>
                                {b.batchName}
                            </option>
                        ))}
                    </select>
                </div>
            </div>
        </div>
    );
};

export default FilterSection;
