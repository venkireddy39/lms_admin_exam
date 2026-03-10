import React from 'react';
import { FiArrowLeft, FiSave, FiLoader } from 'react-icons/fi';

const CreateFeeHeader = ({ onBack, onSave, saving }) => (
    <header className="fee-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <button onClick={onBack} className="btn-icon">
                <FiArrowLeft />
            </button>
            <div className="fee-title">
                <h1>Create New Fee</h1>
                <div className="fee-subtitle">Define fee structure, pricing plans, and payment schedules</div>
            </div>
        </div>
        <div style={{ display: 'flex', gap: '16px' }}>
            <button onClick={onBack} style={{
                background: 'transparent', border: '1px solid #cbd5e1',
                padding: '10px 24px', borderRadius: '10px', fontWeight: 600, color: '#64748b', cursor: 'pointer', transition: 'all 0.2s'
            }} onMouseEnter={(e) => e.target.style.background = '#f1f5f9'} onMouseLeave={(e) => e.target.style.background = 'transparent'}>
                Cancel
            </button>
            <button onClick={onSave} className="btn-primary" disabled={saving}>
                {saving ? <FiLoader className="spin" /> : <FiSave />} {saving ? 'Saving...' : 'Save Fee Structure'}
            </button>
        </div>
    </header>
);

export default CreateFeeHeader;
