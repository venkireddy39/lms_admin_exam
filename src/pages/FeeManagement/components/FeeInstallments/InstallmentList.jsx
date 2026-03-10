import React from 'react';
import { FiClock, FiTrash2, FiDollarSign } from 'react-icons/fi';

const InstallmentList = ({ installments, planType, updateInstallment, removeInstallment, setExtendingInstallment, setExtensionDate, apiFetch, getUrl }) => {
    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12, maxHeight: 350, overflowY: 'auto', paddingRight: 4 }} className="no-scrollbar">
            {installments.map((inst, idx) => (
                <div key={inst.id} style={{
                    display: 'grid', 
                    gridTemplateColumns: planType === 'Custom' ? '50px 2fr 1.5fr 1.5fr 80px' : '50px 2fr 1.5fr 1.5fr 40px', 
                    gap: 10, 
                    alignItems: 'center',
                    padding: '12px 10px', 
                    background: '#f8fafc', 
                    border: '1px solid #e2e8f0', 
                    borderRadius: 12
                }}>
                    <div style={{ fontWeight: 600, color: '#94a3b8', fontSize: 13, textAlign: 'center' }}>#{idx + 1}</div>
                    <div>
                        <input
                            type="text"
                            className="form-input"
                            value={inst.name}
                            onChange={(e) => updateInstallment(idx, 'name', e.target.value)}
                            style={{ background: 'white', fontSize: 13 }}
                        />
                    </div>
                    <div style={{ position: 'relative' }}>
                        <span style={{ position: 'absolute', left: 10, top: 10, fontSize: 12, color: '#64748b' }}>₹</span>
                        <input
                            type="number"
                            className="form-input"
                            value={inst.amount}
                            onChange={(e) => updateInstallment(idx, 'amount', e.target.value)}
                            style={{ background: 'white', fontSize: 13, paddingLeft: 24 }}
                        />
                    </div>
                    <div>
                        <input
                            type="date"
                            className="form-input"
                            value={inst.dueDate}
                            onChange={(e) => updateInstallment(idx, 'dueDate', e.target.value)}
                            style={{ background: 'white', fontSize: 13 }}
                        />
                    </div>
                    <div style={{ display: 'flex', gap: 8 }}>
                        {inst.status !== 'PAID' && typeof inst.id === 'number' && inst.id > 1000000 && (
                            <button
                                onClick={() => { setExtendingInstallment(inst); setExtensionDate(inst.dueDate); }}
                                className="btn-icon"
                                style={{ width: 32, height: 32, color: '#6366f1', borderColor: '#e0e7ff', background: 'white' }}
                                title="Extend Due Date"
                            >
                                <FiClock size={14} />
                            </button>
                        )}

                        {inst.status !== 'PAID' && typeof inst.id === 'number' && inst.id > 1000000 && (
                            <button
                                onClick={async () => {
                                    try {
                                        const res = await apiFetch(getUrl(`/payment-gateway/send-link/${inst.id}`), { method: 'POST' });
                                        alert(res.message || "Payment link sent to student's email.");
                                    } catch (error) {
                                        alert("Failed to send payment link. " + (error.response?.data?.message || ""));
                                    }
                                }}
                                className="btn-icon"
                                style={{ width: 32, height: 32, color: '#10b981', borderColor: '#d1fae5', background: '#ecfdf5' }}
                                title="Send Payment Link via Email"
                            >
                                <FiDollarSign size={14} />
                            </button>
                        )}

                        {planType === 'Custom' && (
                            <button
                                onClick={() => removeInstallment(idx)}
                                className="btn-icon"
                                style={{ width: 32, height: 32, color: '#ef4444', borderColor: '#fee2e2', background: '#fef2f2' }}
                                title="Remove Installment"
                            >
                                <FiTrash2 size={14} />
                            </button>
                        )}
                    </div>
                </div>
            ))}
        </div>
    );
};

export default InstallmentList;
