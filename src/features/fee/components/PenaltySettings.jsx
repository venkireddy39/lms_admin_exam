import React, { useState, useEffect } from 'react';
import { FiInfo, FiPlus, FiTrash2, FiClock, FiSettings, FiCheckCircle } from 'react-icons/fi';
import { IndianRupee } from 'lucide-react';
import '../FeeManagement.css';

export default function PenaltySettings({ penaltyConfig, onChange }) {
    const [enabled, setEnabled] = useState(false);

    useEffect(() => {
        if (penaltyConfig?.penaltyType && penaltyConfig.penaltyType !== 'NONE') {
            setEnabled(true);
        } else {
            setEnabled(false);
        }
    }, [penaltyConfig?.penaltyType]);

    const handleToggle = (e) => {
        const isEnabled = e.target.checked;
        setEnabled(isEnabled);
        if (!isEnabled) {
            onChange({
                ...penaltyConfig,
                penaltyType: 'NONE',
                fixedPenaltyAmount: 0,
                penaltyPercentage: 0,
                maxPenaltyCap: 0,
                slabs: []
            });
        } else {
            onChange({
                ...penaltyConfig,
                penaltyType: 'SLAB',
                slabs: penaltyConfig.slabs?.length > 0 ? penaltyConfig.slabs : [{ fromDay: 1, toDay: 8, amount: 10 }]
            });
        }
    };

    const handleChange = (field, value) => {
        if (field !== 'penaltyType' && Number(value) < 0) value = 0;
        onChange({ ...penaltyConfig, [field]: value });
    };

    const handleAddSlab = () => {
        const currentSlabs = penaltyConfig.slabs || [];
        const lastSlab = currentSlabs[currentSlabs.length - 1];
        const nextFromDay = lastSlab ? Number(lastSlab.toDay) + 1 : 1;
        const nextToDay = nextFromDay + 7;
        const newSlabs = [...currentSlabs, { fromDay: nextFromDay, toDay: nextToDay, amount: 0 }];
        onChange({ ...penaltyConfig, slabs: newSlabs });
    };

    const handleRemoveSlab = (index) => {
        const newSlabs = penaltyConfig.slabs.filter((_, i) => i !== index);
        onChange({ ...penaltyConfig, slabs: newSlabs });
    };

    const handleSlabChange = (index, field, value) => {
        const newSlabs = [...penaltyConfig.slabs];
        newSlabs[index][field] = Number(value);
        onChange({ ...penaltyConfig, slabs: newSlabs });
    };

    return (
        <div className="fee-card animate-premium">
            <div className="fee-card-header">
                <div className="d-flex align-items-center gap-3">
                    <div className="bg-indigo-50 p-2 rounded-lg">
                        <FiClock className="text-indigo-600" size={24} />
                    </div>
                    <div>
                        <h2 className="fee-section-title">Penalty & Slab Architecture</h2>
                        <p className="text-sm text-gray-500 font-medium m-0">Automate late fee calculations and delinquency rules</p>
                    </div>
                </div>
                <div className="form-check form-switch p-0 m-0">
                    <input
                        className="form-check-input fee-switch ms-0"
                        type="checkbox"
                        checked={enabled}
                        onChange={handleToggle}
                        id="penaltyToggle"
                    />
                </div>
            </div>

            {enabled && (
                <div className="p-8">
                    {/* Selector */}
                    <div className="row g-4 mb-8">
                        <div className="col-md-4">
                            <div
                                onClick={() => handleChange('penaltyType', 'SLAB')}
                                className={`p-4 rounded-xl border-2 transition-all cursor-pointer h-100 ${penaltyConfig.penaltyType === 'SLAB' ? 'border-primary bg-blue-50 bg-opacity-30' : 'border-gray-100 bg-white hover:border-gray-200'}`}
                            >
                                <div className="d-flex align-items-center gap-3 mb-2">
                                    <div className={`p-2 rounded-pill ${penaltyConfig.penaltyType === 'SLAB' ? 'bg-primary text-white' : 'bg-gray-100 text-gray-400'}`}>
                                        <FiSettings size={16} />
                                    </div>
                                    <span className="font-bold text-gray-800" style={{ fontSize: '0.85rem' }}>Daily Slab Model</span>
                                </div>
                                <p className="text-[10px] text-gray-500 font-medium m-0">Dynamic per-day fines (e.g. ₹10/day for 1-7 days).</p>
                            </div>
                        </div>
                        <div className="col-md-4">
                            <div
                                onClick={() => handleChange('penaltyType', 'FIXED')}
                                className={`p-4 rounded-xl border-2 transition-all cursor-pointer h-100 ${penaltyConfig.penaltyType === 'FIXED' ? 'border-primary bg-blue-50 bg-opacity-30' : 'border-gray-100 bg-white hover:border-gray-200'}`}
                            >
                                <div className="d-flex align-items-center gap-3 mb-2">
                                    <div className={`p-2 rounded-pill ${penaltyConfig.penaltyType === 'FIXED' ? 'bg-primary text-white' : 'bg-gray-100 text-gray-400'}`}>
                                        <IndianRupee size={16} />
                                    </div>
                                    <span className="font-bold text-gray-800" style={{ fontSize: '0.85rem' }}>Flat One-Time Fee</span>
                                </div>
                                <p className="text-[10px] text-gray-500 font-medium m-0">A single fixed amount charged once if late (e.g. ₹500).</p>
                            </div>
                        </div>
                        <div className="col-md-4">
                            <div
                                onClick={() => handleChange('penaltyType', 'PERCENTAGE')}
                                className={`p-4 rounded-xl border-2 transition-all cursor-pointer h-100 ${penaltyConfig.penaltyType === 'PERCENTAGE' ? 'border-primary bg-blue-50 bg-opacity-30' : 'border-gray-100 bg-white hover:border-gray-200'}`}
                            >
                                <div className="d-flex align-items-center gap-3 mb-2">
                                    <div className={`p-2 rounded-pill ${penaltyConfig.penaltyType === 'PERCENTAGE' ? 'bg-primary text-white' : 'bg-gray-100 text-gray-400'}`}>
                                        <FiPercent size={16} />
                                    </div>
                                    <span className="font-bold text-gray-800" style={{ fontSize: '0.85rem' }}>Percentage (%)</span>
                                </div>
                                <p className="text-[10px] text-gray-500 font-medium m-0">Calculate penalty based on installment value (e.g. 5%).</p>
                            </div>
                        </div>
                    </div>

                    {penaltyConfig.penaltyType === 'SLAB' && (
                        <div className="bg-gray-50 bg-opacity-50 rounded-2xl border p-6">
                            <div className="d-flex justify-content-between align-items-center mb-4">
                                <h6 className="text-xs font-black text-gray-400 text-uppercase tracking-widest m-0">Slab Schedule</h6>
                                <button
                                    type="button"
                                    onClick={handleAddSlab}
                                    className="btn btn-sm btn-primary rounded-pill px-4"
                                >
                                    <FiPlus className="me-1" /> Add New Slab
                                </button>
                            </div>
                            <div className="table-responsive mt-3">
                                <table className="table fee-table-modern bg-white rounded-xl shadow-sm overflow-hidden m-0">
                                    <thead>
                                        <tr>
                                            <th className="text-[10px] text-uppercase tracking-wider py-3">From Day</th>
                                            <th className="text-[10px] text-uppercase tracking-wider py-3">To Day</th>
                                            <th className="text-[10px] text-uppercase tracking-wider py-3">Fine / Day</th>
                                            <th className="text-end py-3">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {(penaltyConfig.slabs || []).map((slab, idx) => (
                                            <tr key={idx}>
                                                <td className="py-2">
                                                    <input
                                                        type="number"
                                                        className="fee-input h-9 w-20 py-1 text-center border-gray-200"
                                                        value={slab.fromDay}
                                                        onChange={(e) => handleSlabChange(idx, 'fromDay', e.target.value)}
                                                    />
                                                </td>
                                                <td className="py-2">
                                                    <input
                                                        type="number"
                                                        className="fee-input h-9 w-20 py-1 text-center border-gray-200"
                                                        value={slab.toDay}
                                                        onChange={(e) => handleSlabChange(idx, 'toDay', e.target.value)}
                                                    />
                                                </td>
                                                <td className="py-2">
                                                    <div className="input-group input-group-sm w-36">
                                                        <span className="input-group-text bg-gray-50 border-end-0 text-gray-400">₹</span>
                                                        <input
                                                            type="number"
                                                            className="fee-input h-9 border-start-0 ps-0 font-bold border-gray-200"
                                                            value={slab.amount}
                                                            onChange={(e) => handleSlabChange(idx, 'amount', e.target.value)}
                                                        />
                                                    </div>
                                                </td>
                                                <td className="text-end py-2">
                                                    <button
                                                        type="button"
                                                        onClick={() => handleRemoveSlab(idx)}
                                                        className="btn btn-link text-red-500 p-1 hover:bg-red-50 rounded transition-all"
                                                    >
                                                        <FiTrash2 size={16} />
                                                    </button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}

                    {penaltyConfig.penaltyType === 'FIXED' && (
                        <div className="bg-indigo-50 bg-opacity-30 rounded-2xl border border-indigo-100 p-8 text-center">
                            <div className="max-w-xs mx-auto">
                                <label className="fee-label">One-Time Fixed Penalty (₹)</label>
                                <div className="input-group input-group-lg shadow-sm">
                                    <span className="input-group-text bg-white border-end-0 text-gray-400 font-bold">₹</span>
                                    <input
                                        type="number"
                                        value={penaltyConfig.fixedPenaltyAmount || ''}
                                        onChange={(e) => handleChange('fixedPenaltyAmount', e.target.value)}
                                        className="fee-input border-start-0 ps-0 text-center font-black text-2xl text-indigo-600"
                                        placeholder="0"
                                    />
                                </div>
                                <p className="text-xs text-gray-400 font-medium mt-3">This flat amount will be added once if the payment is late.</p>
                            </div>
                        </div>
                    )}

                    {penaltyConfig.penaltyType === 'PERCENTAGE' && (
                        <div className="bg-blue-50 bg-opacity-30 rounded-2xl border border-blue-100 p-8 text-center">
                            <div className="max-w-xs mx-auto">
                                <label className="fee-label">Global Penalty Rate (%)</label>
                                <div className="input-group input-group-lg shadow-sm">
                                    <input
                                        type="number"
                                        value={penaltyConfig.penaltyPercentage || ''}
                                        onChange={(e) => handleChange('penaltyPercentage', e.target.value)}
                                        className="fee-input text-center font-black text-2xl text-primary"
                                        placeholder="0"
                                    />
                                    <span className="input-group-text bg-white border-start-0 font-bold text-gray-400">%</span>
                                </div>
                                <p className="text-xs text-gray-400 font-medium mt-3">This will be applied once per installment when it crosses the grace period.</p>
                            </div>
                        </div>
                    )}

                    <div className="row mt-8 pt-8 border-t border-dashed">
                        <div className="col-md-6">
                            <label className="fee-label">Max Penalty Ceiling (₹)</label>
                            <div className="input-group">
                                <span className="input-group-text bg-white border-end-0 text-muted">₹</span>
                                <input
                                    type="number"
                                    value={penaltyConfig.maxPenaltyCap || ''}
                                    onChange={(e) => handleChange('maxPenaltyCap', e.target.value)}
                                    className="fee-input border-start-0 ps-0 font-bold"
                                    placeholder="No limit"
                                />
                            </div>
                            <small className="text-xs text-gray-400 font-medium d-block mt-2">Prevent penalties from exceeding a specific amount.</small>
                        </div>
                        <div className="col-md-6">
                            <div className="bg-emerald-50 rounded-2xl p-4 flex items-start gap-3">
                                <FiCheckCircle className="text-emerald-500 mt-1" size={20} />
                                <div>
                                    <h6 className="text-sm font-bold text-emerald-800 mb-1">Auto-Pilot Active</h6>
                                    <p className="text-xs text-emerald-700 font-medium m-0">The system will automatically calculate fines when students pay late based on these rules.</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

function FiPercent({ size }) {
    return <span style={{ fontSize: size, fontWeight: 'bold' }}>%</span>;
}
