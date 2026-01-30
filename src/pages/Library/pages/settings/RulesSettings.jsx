import React, { useState } from 'react';
import { Plus, Trash, AlertCircle } from 'lucide-react';

const RulesSettings = ({ rules, setRules, onSave }) => {
    // Get the first category key as default active
    const categoryKeys = Object.keys(rules);
    const [activeCategory, setActiveCategory] = useState(categoryKeys[0] || '');

    // Current category data
    const currentRule = rules[activeCategory];

    const updateField = (field, value) => {
        setRules(prev => ({
            ...prev,
            [activeCategory]: {
                ...prev[activeCategory],
                [field]: value
            }
        }));
    };

    const addSlab = () => {
        const slabs = currentRule.fineSlabs || [];
        const lastSlab = slabs[slabs.length - 1];
        const newFrom = lastSlab ? (parseInt(lastSlab.to) || 0) + 1 : 1;

        const newSlab = {
            id: Date.now(),
            from: newFrom,
            to: newFrom + 7,
            amount: 0
        };

        updateField('fineSlabs', [...slabs, newSlab]);
    };

    const updateSlab = (id, field, value) => {
        const slabs = currentRule.fineSlabs.map(slab => {
            if (slab.id === id) {
                return { ...slab, [field]: Number(value) };
            }
            return slab;
        });
        updateField('fineSlabs', slabs);
    };

    const removeSlab = (id) => {
        const slabs = currentRule.fineSlabs.filter(slab => slab.id !== id);
        updateField('fineSlabs', slabs);
    };

    if (!currentRule) return <div>No categories defined.</div>;

    return (
        <div className="row">
            {/* Category Sidebar */}
            <div className="col-md-3 mb-4">
                <div className="list-group shadow-sm">
                    {categoryKeys.map(key => (
                        <button
                            key={key}
                            className={`list-group-item list-group-item-action d-flex justify-content-between align-items-center ${activeCategory === key ? 'active' : ''}`}
                            onClick={() => setActiveCategory(key)}
                        >
                            <span>{rules[key].label || key}</span>
                        </button>
                    ))}
                    {/* Add Category Placeholder - For future implementation */}
                    {/* <button className="list-group-item list-group-item-action text-primary">
                        <Plus size={16} className="me-2" /> Add Category
                    </button> */}
                </div>
            </div>

            {/* Config Area */}
            <div className="col-md-9">
                <div className="card shadow-sm border-0">
                    <div className="card-header bg-white py-3 d-flex justify-content-between align-items-center">
                        <h5 className="mb-0 text-primary">{currentRule.label} Configuration</h5>
                        {onSave && (
                            <button className="btn btn-sm btn-primary" onClick={onSave}>
                                Apply Changes
                            </button>
                        )}
                    </div>
                    <div className="card-body">
                        {/* Basic Rules */}
                        <div className="row g-3 mb-4">
                            <div className="col-md-6">
                                <label className="form-label fw-medium">Max Books Allowed</label>
                                <input
                                    type="number"
                                    min="0"
                                    className="form-control"
                                    value={currentRule.maxBooks}
                                    onChange={(e) => updateField('maxBooks', parseInt(e.target.value) || 0)}
                                />
                                <div className="form-text">Maximum books issued at once</div>
                            </div>
                            <div className="col-md-6">
                                <label className="form-label fw-medium">Issue Duration (Days)</label>
                                <input
                                    type="number"
                                    min="1"
                                    className="form-control"
                                    value={currentRule.issueDays}
                                    onChange={(e) => updateField('issueDays', parseInt(e.target.value) || 0)}
                                />
                                <div className="form-text">Default return period</div>
                            </div>
                            <div className="col-md-6">
                                <label className="form-label fw-medium">Reservation Keep (Days)</label>
                                <input
                                    type="number"
                                    min="1"
                                    className="form-control"
                                    value={currentRule.reservationDays || 2}
                                    onChange={(e) => updateField('reservationDays', parseInt(e.target.value) || 0)}
                                />
                                <div className="form-text">Days to hold book for user</div>
                            </div>
                        </div>

                        <hr className="text-muted" />

                        {/* Fine Slabs */}
                        <div className="d-flex justify-content-between align-items-center mb-3">
                            <h6 className="mb-0 fw-bold">Overdue Fine Slabs</h6>
                            <button className="btn btn-sm btn-outline-primary" onClick={addSlab}>
                                <Plus size={16} className="me-1" /> Add Slab
                            </button>
                        </div>

                        {(!currentRule.fineSlabs || currentRule.fineSlabs.length === 0) ? (
                            <div className="alert alert-light text-center border">
                                <AlertCircle size={20} className="text-muted mb-2" />
                                <p className="mb-0 small text-muted">No fine slabs defined. This means no fines will be charged.</p>
                            </div>
                        ) : (
                            <div className="table-responsive">
                                <table className="table table-bordered align-middle mb-0">
                                    <thead className="bg-light">
                                        <tr>
                                            <th style={{ width: '25%' }}>From Day</th>
                                            <th style={{ width: '25%' }}>To Day</th>
                                            <th style={{ width: '35%' }}>Fine / Day (₹)</th>
                                            <th style={{ width: '15%' }}></th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {currentRule.fineSlabs.map((slab, index) => {
                                            // Validation Logic for visual feedback
                                            const isInvalidRange = slab.from >= slab.to;
                                            const isGap = index > 0 && slab.from !== currentRule.fineSlabs[index - 1].to + 1;

                                            return (
                                                <tr key={slab.id}>
                                                    <td>
                                                        <input
                                                            type="number"
                                                            className={`form-control form-control-sm ${isGap && index > 0 ? 'is-invalid' : ''}`}
                                                            value={slab.from}
                                                            onChange={(e) => updateSlab(slab.id, 'from', e.target.value)}
                                                        />
                                                        {isGap && index > 0 && <div className="invalid-feedback">Gap detected</div>}
                                                    </td>
                                                    <td>
                                                        <input
                                                            type="number"
                                                            className={`form-control form-control-sm ${isInvalidRange ? 'is-invalid' : ''}`}
                                                            value={slab.to}
                                                            onChange={(e) => updateSlab(slab.id, 'to', e.target.value)}
                                                        />
                                                    </td>
                                                    <td>
                                                        <div className="input-group input-group-sm">
                                                            <span className="input-group-text">₹</span>
                                                            <input
                                                                type="number"
                                                                min="0"
                                                                className="form-control"
                                                                value={slab.amount}
                                                                onChange={(e) => updateSlab(slab.id, 'amount', e.target.value)}
                                                            />
                                                        </div>
                                                    </td>
                                                    <td className="text-center">
                                                        <button
                                                            className="btn btn-sm btn-ghost text-danger"
                                                            onClick={() => removeSlab(slab.id)}
                                                        >
                                                            <Trash size={16} />
                                                        </button>
                                                    </td>
                                                </tr>
                                            );
                                        })}
                                    </tbody>
                                </table>
                            </div>
                        )}

                        <div className="mt-3 text-muted" style={{ fontSize: '0.85rem' }}>
                            <p className="mb-1"><strong>Logic:</strong> Total Fine = Sum of (Overdue Days in Range × Slab Amount)</p>
                            <p className="mb-0">Example: Overdue by 20 days. Slab 1 (1-15 @ ₹1) + Slab 2 (16-20 @ ₹2). Total = (15×1) + (5×2) = ₹25.</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default RulesSettings;
