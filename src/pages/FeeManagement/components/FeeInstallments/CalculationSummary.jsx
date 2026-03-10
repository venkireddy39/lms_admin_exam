import React from 'react';

const CalculationSummary = ({ totals }) => {
    return (
        <div style={{
            background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)',
            padding: '16px 20px', borderRadius: 16, marginBottom: 24,
            color: 'white', display: 'flex', justifyContent: 'space-between', alignItems: 'center',
            boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)'
        }}>
            <div>
                <div style={{ fontSize: 11, opacity: 0.7, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 4 }}>Total Payable</div>
                <div style={{ fontSize: 28, fontWeight: 800, color: '#38bdf8' }}>₹{totals.totalPayable.toLocaleString()}</div>
            </div>
            <div style={{ textAlign: 'right', fontSize: 12, opacity: 0.9, lineHeight: '1.6' }}>
                <div>Base: <span style={{ opacity: 0.7 }}>₹{totals.base.toLocaleString()}</span></div>
                <div style={{ color: '#fb7185' }}>Discount: <span style={{ opacity: 0.7 }}>-₹{totals.totalDiscount.toLocaleString()}</span></div>
                <div style={{ color: '#2dd4bf' }}>GST: <span style={{ opacity: 0.7 }}>+₹{totals.gstAmount.toLocaleString()}</span></div>
                {totals.advance > 0 && <div style={{ color: '#fbbf24' }}>Advance: <span style={{ opacity: 0.7 }}>-₹{totals.advance.toLocaleString()}</span></div>}
            </div>
        </div>
    );
};

export default CalculationSummary;
