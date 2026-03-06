import React, { useState, useEffect } from 'react';
import { FiX, FiCheckCircle, FiAlertCircle, FiCalendar, FiPercent, FiDollarSign } from "react-icons/fi";

const EnrollmentFeeModal = ({
    isOpen,
    onClose,
    onConfirm,
    feeStructure,
    studentCount,
    initialData = null // { paymentMode, specialDiscountValue, specialDiscountType, installments, schedule, isUpdate }
}) => {
    const [paymentMode, setPaymentMode] = useState('STANDARD'); // 'STANDARD' or 'ONE_TIME'
    const [discountOverride, setDiscountOverride] = useState(0); // One-time pay discount
    const [customInstallments, setCustomInstallments] = useState(1);
    const [schedule, setSchedule] = useState([]);
    const [startDate, setStartDate] = useState(new Date().toISOString().split('T')[0]);

    // Multi-type special student discount
    const [specialDiscountType, setSpecialDiscountType] = useState('FLAT'); // 'FLAT' or 'PERCENT'
    const [specialDiscountValue, setSpecialDiscountValue] = useState(0);

    // Reset state when modal opens
    useEffect(() => {
        if (isOpen) {
            if (initialData) {
                setPaymentMode(initialData.paymentMode || 'STANDARD');
                setSpecialDiscountValue(initialData.specialDiscountValue || 0);
                setSpecialDiscountType(initialData.specialDiscountType || 'FLAT');
                setCustomInstallments(initialData.installments || 1);
                if (initialData.schedule && initialData.schedule.length > 0) {
                    setSchedule(initialData.schedule);
                }
            } else {
                setPaymentMode('STANDARD');
                setDiscountOverride(0);
                setSpecialDiscountValue(0);
                setSpecialDiscountType('FLAT');
                setCustomInstallments(Number(feeStructure?.installmentCount) || 1);
            }
        }
    }, [isOpen, feeStructure, initialData]);

    // --- Calculations ---
    const getComponentsSplit = (struct) => {
        const oneTime = [];
        const installments = [];

        if (struct?.components && Array.isArray(struct.components)) {
            struct.components.forEach(c => {
                if (c.installmentAllowed === false) {
                    oneTime.push(c);
                } else {
                    installments.push(c);
                }
            });
        }
        return { oneTime, installments };
    };

    const { oneTime, installments } = getComponentsSplit(feeStructure);
    const oneTimeBase = oneTime.reduce((sum, c) => sum + (Number(c.amount) || 0), 0);
    const installmentBase = installments.reduce((sum, c) => sum + (Number(c.amount) || 0), 0);

    // Calculate Special Discount Amount (Applies to installment base)
    const specialDiscountAmount = specialDiscountType === 'PERCENT'
        ? (installmentBase * (Number(specialDiscountValue) || 0) / 100)
        : (Number(specialDiscountValue) || 0);

    const discountedInstallmentBase = Math.max(0, installmentBase - specialDiscountAmount);

    const rawTaxRate = Number(feeStructure?.gstPercent || feeStructure?.taxPercentage || 0);
    const taxRate = (feeStructure?.gstApplicable) ? rawTaxRate : 0;
    const isTaxIncluded = feeStructure?.gstIncludedInFee || false;

    // Standard Plan Calcs
    const taxableInstallmentBase = paymentMode === 'ONE_TIME' ? Math.max(0, discountedInstallmentBase - Number(discountOverride)) : discountedInstallmentBase;

    const installmentTotal = isTaxIncluded
        ? taxableInstallmentBase
        : taxableInstallmentBase + (taxableInstallmentBase * taxRate / 100);

    const oneTimeTotal = isTaxIncluded
        ? oneTimeBase
        : oneTimeBase + (oneTimeBase * taxRate / 100);

    const grandTotal = installmentTotal + oneTimeTotal;

    const safeInstallments = customInstallments > 0 ? customInstallments : 1;

    // Generate schedule preview
    useEffect(() => {
        if (isOpen && feeStructure) {
            const newSchedule = [];
            const start = new Date(startDate);

            // 1. One-time portion (if any)
            if (oneTimeTotal > 0) {
                // If there are multiple one-time components, we might want to group them 
                // but usually they share the same 'label'. 
                // If the user wants specific dates for components, we'd need to loop components.
                // For now, let's use the first available component date if any, else startDate.
                const firstOneTimeWithDate = oneTime.find(c => c.dueDate);
                const oneTimeDateStr = firstOneTimeWithDate
                    ? new Date(firstOneTimeWithDate.dueDate).toISOString().split('T')[0]
                    : startDate;

                newSchedule.push({
                    label: "One-time Fees",
                    installmentNumber: 0,
                    amount: Number(oneTimeTotal.toFixed(2)),
                    dueDate: oneTimeDateStr
                });
            }

            // 2. Installment portion
            const count = paymentMode === 'STANDARD' ? safeInstallments : 1;
            const perInstallment = Math.floor((installmentTotal / count) * 100) / 100;
            let runningInstallmentTotal = 0;

            for (let i = 0; i < count; i++) {
                const dueDate = new Date(start);
                if (paymentMode === 'STANDARD') {
                    dueDate.setMonth(start.getMonth() + i);
                }

                let dateStr = dueDate.toISOString().split('T')[0];
                if (feeStructure?.fullFeeClearDate && dateStr > feeStructure.fullFeeClearDate.split('T')[0]) {
                    dateStr = feeStructure.fullFeeClearDate.split('T')[0];
                }

                let currentAmt = (i === count - 1)
                    ? Number((installmentTotal - runningInstallmentTotal).toFixed(2))
                    : Number(perInstallment.toFixed(2));

                runningInstallmentTotal += currentAmt;

                newSchedule.push({
                    label: `Installment #${i + 1}`,
                    installmentNumber: i + 1,
                    amount: currentAmt,
                    dueDate: dateStr
                });
            }
            setSchedule(newSchedule);
        }
    }, [isOpen, feeStructure, paymentMode, safeInstallments, installmentTotal, oneTimeTotal, specialDiscountValue, discountOverride, startDate]);

    if (!isOpen) return null;

    const handleDateChange = (idx, newDate) => {
        if (feeStructure?.fullFeeClearDate) {
            const maxDateStr = feeStructure.fullFeeClearDate.split('T')[0];
            const selectedDateStr = newDate.split('T')[0];
            if (selectedDateStr > maxDateStr) {
                alert(`Installment due date cannot exceed the final clear due date: ${maxDateStr}`);
                return;
            }
        }
        const updated = [...schedule];
        updated[idx].dueDate = newDate;
        setSchedule(updated);
    };

    const handleConfirm = () => {
        const totalAdminDiscount = specialDiscountAmount + (paymentMode === 'ONE_TIME' ? Number(discountOverride) : 0);

        onConfirm({
            paymentMode,
            discountOverride: totalAdminDiscount,
            specialDiscountValue: Number(specialDiscountValue),
            specialDiscountType,
            baseAmount: installmentBase + oneTimeBase,
            gstRate: taxRate,
            finalTotal: grandTotal,
            installments: paymentMode === 'STANDARD' ? Number(safeInstallments) : 1,
            schedule: schedule
        });
    };

    return (
        <div className="modal-overlay-fixed">
            <div className="modal-box premium-modal" style={{ maxWidth: '850px' }}>
                <div className="modal-head">
                    <h2>{initialData?.isUpdate ? 'Update Fee Records' : 'Enrollment & Fee Options'}</h2>
                    <button className="close-btn" onClick={onClose}>
                        <FiX size={24} />
                    </button>
                </div>

                <div className="modal-body">
                    <div className="alert-box-info" style={{ background: '#eff6ff', border: '1px solid #dbeafe', padding: '12px', borderRadius: '8px', marginBottom: '20px', display: 'flex', gap: '10px', alignItems: 'center' }}>
                        <FiCheckCircle color="#2563eb" />
                        <div>
                            <div style={{ fontWeight: '600', color: '#1e40af' }}>{initialData?.isUpdate ? 'Updating Fees for student' : `Enrolling ${studentCount} Student${studentCount !== 1 ? 's' : ''}`}</div>
                            <div style={{ fontSize: '13px', color: '#1e3a8a' }}>Configure specific discounts and payment plans.</div>
                        </div>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '24px' }}>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                            {/* SPECIAL STUDENT DISCOUNT SECTION */}
                            <div style={{ background: '#fafafa', padding: '16px', borderRadius: '12px', border: '1px solid #eee' }}>
                                <h4 style={{ fontSize: '14px', fontWeight: '700', color: '#444', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                    Special Student Discount
                                </h4>
                                <div style={{ display: 'flex', gap: '10px' }}>
                                    <div style={{ display: 'flex', border: '1px solid #ddd', borderRadius: '6px', overflow: 'hidden', height: '38px' }}>
                                        <button
                                            onClick={() => setSpecialDiscountType('FLAT')}
                                            style={{ padding: '0 12px', border: 'none', background: specialDiscountType === 'FLAT' ? '#2563eb' : 'white', color: specialDiscountType === 'FLAT' ? 'white' : '#666', cursor: 'pointer' }}
                                        >
                                            <FiDollarSign size={14} />
                                        </button>
                                        <button
                                            onClick={() => setSpecialDiscountType('PERCENT')}
                                            style={{ padding: '0 12px', border: 'none', background: specialDiscountType === 'PERCENT' ? '#2563eb' : 'white', color: specialDiscountType === 'PERCENT' ? 'white' : '#666', cursor: 'pointer' }}
                                        >
                                            <FiPercent size={14} />
                                        </button>
                                    </div>
                                    <input
                                        type="number"
                                        placeholder={specialDiscountType === 'FLAT' ? 'Flat Amount' : 'Percentage'}
                                        value={specialDiscountValue}
                                        onChange={(e) => setSpecialDiscountValue(e.target.value)}
                                        style={{ flex: 1, padding: '8px 12px', border: '1px solid #ddd', borderRadius: '6px', fontSize: '14px' }}
                                    />
                                </div>
                                {specialDiscountAmount > 0 && (
                                    <div style={{ fontSize: '12px', color: '#059669', marginTop: '6px', fontWeight: '600' }}>
                                        Applied: -₹{specialDiscountAmount.toLocaleString()}
                                    </div>
                                )}
                            </div>

                            {/* PAYMENT MODES */}
                            {!feeStructure ? (
                                <div style={{ textAlign: 'center', padding: '20px', color: '#dc2626' }}>
                                    <FiAlertCircle size={30} />
                                    <p>No Fee Structure found.</p>
                                </div>
                            ) : (
                                <div className="fee-options-grid" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                                    {/* Installment Plan Card */}
                                    <label className={`option-card ${paymentMode === 'STANDARD' ? 'selected' : ''}`}
                                        style={{
                                            display: 'block', padding: '16px', borderRadius: '12px',
                                            border: paymentMode === 'STANDARD' ? '2px solid #2563eb' : '1px solid #e2e8f0',
                                            background: paymentMode === 'STANDARD' ? '#f0f9ff' : 'white',
                                            cursor: 'pointer', transition: 'all 0.2s'
                                        }}
                                    >
                                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: paymentMode === 'STANDARD' ? '12px' : '0' }}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                                <input type="radio" name="pm" checked={paymentMode === 'STANDARD'} onChange={() => setPaymentMode('STANDARD')} />
                                                <div style={{ fontWeight: '700', fontSize: '15px' }}>Installment Plan</div>
                                            </div>
                                            <div style={{ textAlign: 'right' }}>
                                                <div style={{ fontSize: '18px', fontWeight: '800', color: '#0f172a' }}>₹{grandTotal.toLocaleString()}</div>
                                            </div>
                                        </div>

                                        {paymentMode === 'STANDARD' && (
                                            <div className="row g-2 mt-2 pt-2 border-top">
                                                <div className="col-6">
                                                    <label className="form-label small fw-bold text-muted mb-1">START DATE</label>
                                                    <div className="input-group input-group-sm">
                                                        <span className="input-group-text bg-white border-end-0 text-muted px-2"><FiCalendar size={12} /></span>
                                                        <input
                                                            type="date"
                                                            className="form-control border-start-0 ps-1"
                                                            value={startDate}
                                                            onChange={(e) => setStartDate(e.target.value)}
                                                            onClick={(e) => e.stopPropagation()}
                                                        />
                                                    </div>
                                                </div>
                                                <div className="col-6">
                                                    <label className="form-label small fw-bold text-muted mb-1">INST. COUNT</label>
                                                    <input
                                                        type="number"
                                                        className="form-control form-control-sm"
                                                        min="1" max="24"
                                                        value={customInstallments}
                                                        onChange={(e) => setCustomInstallments(Math.max(1, parseInt(e.target.value) || 1))}
                                                        onClick={(e) => e.stopPropagation()}
                                                    />
                                                </div>
                                            </div>
                                        )}
                                    </label>

                                    {/* Single Payment Card */}
                                    <label className={`option-card ${paymentMode === 'ONE_TIME' ? 'selected' : ''}`}
                                        style={{
                                            display: 'block', padding: '16px', borderRadius: '12px',
                                            border: paymentMode === 'ONE_TIME' ? '2px solid #2563eb' : '1px solid #e2e8f0',
                                            background: paymentMode === 'ONE_TIME' ? '#f0f9ff' : 'white',
                                            cursor: 'pointer', transition: 'all 0.2s'
                                        }}
                                    >
                                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: paymentMode === 'ONE_TIME' ? '12px' : '0' }}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                                <input type="radio" name="pm" checked={paymentMode === 'ONE_TIME'} onChange={() => setPaymentMode('ONE_TIME')} />
                                                <div style={{ fontWeight: '700', fontSize: '15px' }}>Single Payment (Full Pay)</div>
                                            </div>
                                            <div style={{ textAlign: 'right' }}>
                                                <div style={{ fontSize: '18px', fontWeight: '800', color: '#0f172a' }}>₹{grandTotal.toLocaleString()}</div>
                                            </div>
                                        </div>

                                        {paymentMode === 'ONE_TIME' && (
                                            <div className="mt-2 pt-2 border-top">
                                                <div className="col-md-6">
                                                    <label className="form-label small fw-bold text-muted mb-1">EXTRA FULL-PAY DISCOUNT (₹)</label>
                                                    <input
                                                        type="number"
                                                        className="form-control form-control-sm"
                                                        value={discountOverride}
                                                        onChange={(e) => setDiscountOverride(e.target.value)}
                                                        onClick={(e) => e.stopPropagation()}
                                                        placeholder="Enter amount"
                                                    />
                                                </div>
                                            </div>
                                        )}
                                    </label>
                                </div>
                            )}
                        </div>

                        {/* RIGHT SIDE: SCHEDULE */}
                        <div style={{ borderLeft: '1px solid #e2e8f0', paddingLeft: '20px' }}>
                            <h4 style={{ fontSize: '14px', fontWeight: '700', color: '#475569', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                <FiCalendar /> Payment Schedule
                            </h4>
                            <div style={{ maxHeight: '400px', overflowY: 'auto', border: '1px solid #e2e8f0', borderRadius: '12px', background: 'white' }}>
                                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
                                    <thead style={{ background: '#f8fafc', position: 'sticky', top: 0, borderBottom: '2px solid #e2e8f0' }}>
                                        <tr>
                                            <th style={{ textAlign: 'left', padding: '12px' }}>Label</th>
                                            <th style={{ textAlign: 'left', padding: '12px' }}>Amount</th>
                                            <th style={{ textAlign: 'left', padding: '12px' }}>Due Date</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {schedule.map((item, idx) => (
                                            <tr key={idx} style={{ borderBottom: '1px solid #f1f5f9' }}>
                                                <td style={{ padding: '12px', color: '#64748b' }}>{item.label}</td>
                                                <td style={{ padding: '12px', fontWeight: '700', color: '#0f172a' }}>₹{Number(item.amount || 0).toLocaleString()}</td>
                                                <td style={{ padding: '12px' }}>
                                                    <input
                                                        type="date"
                                                        value={item.dueDate || ''}
                                                        max={feeStructure?.fullFeeClearDate ? feeStructure.fullFeeClearDate.split('T')[0] : undefined}
                                                        onChange={(e) => handleDateChange(idx, e.target.value)}
                                                        style={{ padding: '4px 8px', border: '1px solid #cbd5e1', borderRadius: '4px', fontSize: '12px', outlineColor: '#2563eb' }}
                                                    />
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                            <div style={{ marginTop: '16px', padding: '12px', background: '#f8fafc', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px' }}>
                                    <span>Base Batch Fee:</span> <span style={{ textDecoration: specialDiscountAmount > 0 ? 'line-through' : 'none', color: '#64748b' }}>₹{(installmentBase + oneTimeBase).toLocaleString()}</span>
                                </div>
                                {specialDiscountAmount > 0 && (
                                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', color: '#059669', fontWeight: '600' }}>
                                        <span>Special Discount:</span> <span>-₹{specialDiscountAmount.toLocaleString()}</span>
                                    </div>
                                )}
                                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '14px', fontWeight: '800', marginTop: '4px', color: '#1e293b', borderTop: '1px solid #e2e8f0', paddingTop: '4px' }}>
                                    <span>Total Payable:</span> <span>₹{grandTotal.toLocaleString()}</span>
                                </div>
                                <div style={{ fontSize: '10px', color: '#94a3b8', marginTop: '4px' }}>
                                    * {isTaxIncluded ? `Inclusive of ${taxRate}% GST` : `Exclusive of ${taxRate}% GST`}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="modal-footer" style={{ borderTop: '1px solid #e2e8f0', padding: '16px 24px' }}>
                    <button className="btn-secondary" onClick={onClose} style={{ padding: '8px 20px', borderRadius: '8px', fontWeight: '600' }}>Cancel</button>
                    <button className="btn-primary" onClick={handleConfirm} style={{ padding: '8px 20px', borderRadius: '8px', fontWeight: '600', background: '#2563eb', color: 'white', border: 'none' }}>
                        {initialData?.isUpdate ? 'Update Records' : 'Confirm Enrollment'}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default EnrollmentFeeModal;
