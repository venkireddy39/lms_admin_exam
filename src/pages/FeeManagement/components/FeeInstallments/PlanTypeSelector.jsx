import React from 'react';
import { FiClock, FiPieChart, FiGrid, FiList } from 'react-icons/fi';

const PlanTypeSelector = ({ planType, handleTypeChange }) => {
    const types = [
        { id: 'OneTime', label: 'One Time', sub: 'Single Pay', icon: FiClock },
        { id: 'Quarterly', label: 'Quarterly', sub: '4 Parts', icon: FiPieChart },
        { id: 'HalfYearly', label: 'Half Year', sub: '6 Parts', icon: FiPieChart },
        { id: 'Yearly', label: 'Yearly', sub: '12 Parts', icon: FiGrid },
        { id: 'Custom', label: 'Custom', sub: 'Flexible', icon: FiList }
    ];

    return (
        <div className="form-group" style={{ marginBottom: 24 }}>
            <label className="form-label" style={{ marginBottom: 12 }}>Installment Plan Type</label>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 12 }}>
                {types.map(type => (
                    <button
                        key={type.id}
                        onClick={() => handleTypeChange(type.id)}
                        style={{
                            margin: 0, padding: '16px 8px',
                            background: planType === type.id ? 'var(--primary-gradient)' : 'white',
                            border: planType === type.id ? 'none' : '1px solid #e2e8f0',
                            borderRadius: 12,
                            cursor: 'pointer',
                            display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 8,
                            transition: 'all 0.2s',
                            boxShadow: planType === type.id ? '0 4px 12px rgba(99, 102, 241, 0.3)' : 'none',
                            color: planType === type.id ? 'white' : '#64748b'
                        }}
                    >
                        <type.icon size={20} />
                        <div style={{ textAlign: 'center' }}>
                            <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 2 }}>{type.label}</div>
                            <div style={{ fontSize: 10, opacity: 0.8 }}>{type.sub}</div>
                        </div>
                    </button>
                ))}
            </div>
        </div>
    );
};

export default PlanTypeSelector;
