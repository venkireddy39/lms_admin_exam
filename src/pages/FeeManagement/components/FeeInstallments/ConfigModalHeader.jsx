import React from 'react';
import { FiCalendar, FiAlertCircle } from 'react-icons/fi';

const ConfigModalHeader = ({ configuringBatch, configuringStudent, selectedBatch, onClose }) => {
    return (
        <>
            <div style={{ paddingBottom: 16, borderBottom: '1px solid #e2e8f0', marginBottom: 20 }}>
                <h2 style={{ margin: 0, fontSize: 20 }}>
                    {configuringBatch ? `Configure Batch Split` : `Configure Payment Split`}
                </h2>
                <div style={{ color: '#64748b' }}>
                    {configuringBatch ? `For Batch: ${configuringBatch.name}` : `For Student: ${configuringStudent?.name} (ID: ${configuringStudent?.id})`}
                </div>
            </div>

            {selectedBatch && (
                <div style={{ display: 'flex', gap: 16, marginBottom: 20, background: '#f0f9ff', padding: '12px 16px', borderRadius: 12, border: '1px solid #bae6fd' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: '#0369a1' }}>
                        <FiCalendar size={16} />
                        <span style={{ fontSize: 13 }}>Batch Start: <strong>{selectedBatch.startDate ? new Date(selectedBatch.startDate).toLocaleDateString() : 'N/A'}</strong></span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: '#0369a1' }}>
                        <FiCalendar size={16} />
                        <span style={{ fontSize: 13 }}>Batch End: <strong>{selectedBatch.endDate ? new Date(selectedBatch.endDate).toLocaleDateString() : 'N/A'}</strong></span>
                    </div>
                </div>
            )}
        </>
    );
};

export default ConfigModalHeader;
