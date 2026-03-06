import React, { useState, useEffect } from 'react';
import { X, Link, Percent, IndianRupee } from 'lucide-react';

export default function EarlyPaymentModal({
    isOpen,
    onClose,
    onSuccess,
    studentId,
    selectedInstallments = []
}) {
    const [discountType, setDiscountType] = useState('PERCENT'); // PERCENT or FLAT
    const [discountValue, setDiscountValue] = useState(0);
    const [isGenerating, setIsGenerating] = useState(false);
    const [error, setError] = useState(null);
    const [paymentLink, setPaymentLink] = useState(null);

    // Filter out any installments that might have missing data
    const validInstallments = (selectedInstallments || []).filter(i => i && (i.id || i.installmentId));

    const totalAmount = validInstallments.reduce((sum, inst) => {
        const amt = Number(inst.amount || inst.installmentAmount || 0);
        const paid = Number(inst.paidAmount || 0);
        return sum + (amt - paid);
    }, 0);

    const discountAmt = discountType === 'PERCENT'
        ? (totalAmount * Number(discountValue || 0)) / 100
        : Number(discountValue || 0);

    const finalAmount = Math.max(0, totalAmount - discountAmt);

    useEffect(() => {
        if (isOpen) {
            console.log('EarlyPaymentModal opened with:', {
                studentId,
                totalInstallments: selectedInstallments.length,
                validInstallments: validInstallments.length,
                totalAmount
            });
        }
    }, [isOpen, studentId, selectedInstallments, validInstallments, totalAmount]);

    if (!isOpen) return null;

    // Show error only if no installments are selected and we haven't generated a link yet
    if (validInstallments.length === 0 && !paymentLink) {
        return (
            <div className="modal fade show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 1060 }}>
                <div className="modal-dialog modal-dialog-centered">
                    <div className="modal-content border-0 p-4 shadow-lg text-center" style={{ borderRadius: '16px' }}>
                        <div className="text-danger mb-3"><X size={48} /></div>
                        <h5 className="fw-bold mb-2">No Valid Installments</h5>
                        <p className="text-muted small">We couldn't find the selected installments. Please try selecting them again from the table.</p>
                        <button className="btn btn-primary px-4 py-2 fw-bold" onClick={onClose}>Close</button>
                    </div>
                </div>
            </div>
        );
    }

    const handleGenerate = async () => {
        setIsGenerating(true);
        setError(null);
        setPaymentLink(null);
        try {
            const token = localStorage.getItem('token') || localStorage.getItem('auth_token');
            const payload = {
                studentId: Number(studentId),
                installmentIds: validInstallments.map(i => i.id || i.installmentId),
                discountType,
                discountValue: String(discountValue)
            };

            console.log('Generating Early Payment Link with payload:', payload);

            const res = await fetch('/api/v1/admin/early-payment/generate-link', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(payload)
            });

            const data = await res.json();
            if (!res.ok) throw new Error(data.message || 'Failed to generate link');

            console.log("Early Payment Link Generated:", data);

            if (data.paymentLink) {
                setPaymentLink(data.paymentLink);
            }

            // Call onSuccess but don't close immediately if we want to show the link
            onSuccess(data);
            // onClose();
        } catch (err) {
            console.error('Generation Error:', err);
            setError(err.message);
        } finally {
            setIsGenerating(false);
        }
    };

    return (
        <div className="modal fade show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 1060 }}>
            <div className="modal-dialog modal-dialog-centered">
                <div className="modal-content border-0 shadow-lg" style={{ borderRadius: '16px' }}>
                    <div className="modal-header border-0 p-4 pb-0">
                        <h5 className="modal-title fw-bold text-dark">Generate Early Payment Link</h5>
                        <button type="button" className="btn-close shadow-none" onClick={onClose}></button>
                    </div>

                    <div className="modal-body p-4">
                        <div className="mb-4 bg-light p-3 rounded-4 border">
                            <div className="d-flex justify-content-between mb-2">
                                <span className="text-muted small fw-semibold uppercase">Total Selected ({validInstallments.length})</span>
                                <span className="fw-bold text-dark">₹{totalAmount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
                            </div>
                            <hr className="my-2" />
                            <div className="d-flex justify-content-between align-items-center">
                                <span className="text-primary fw-bold">Final Payable</span>
                                <span className="h4 mb-0 fw-black text-primary">₹{finalAmount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
                            </div>
                        </div>

                        <div className="row g-3">
                            <div className="col-12">
                                <label className="form-label small fw-bold text-muted">DISCOUNT TYPE</label>
                                <div className="d-flex gap-2">
                                    <button
                                        type="button"
                                        className={`btn btn-sm py-2 flex-grow-1 ${discountType === 'PERCENT' ? 'btn-primary' : 'btn-outline-secondary'}`}
                                        onClick={() => setDiscountType('PERCENT')}
                                    >
                                        <Percent size={14} className="me-1" /> Percentage
                                    </button>
                                    <button
                                        type="button"
                                        className={`btn btn-sm py-2 flex-grow-1 ${discountType === 'FLAT' ? 'btn-primary' : 'btn-outline-secondary'}`}
                                        onClick={() => setDiscountType('FLAT')}
                                    >
                                        <IndianRupee size={14} className="me-1" /> Flat Amount
                                    </button>
                                </div>
                            </div>

                            <div className="col-12">
                                <label className="form-label small fw-bold text-muted">DISCOUNT VALUE</label>
                                <div className="input-group shadow-sm">
                                    <span className="input-group-text bg-white border-end-0">
                                        {discountType === 'PERCENT' ? '%' : '₹'}
                                    </span>
                                    <input
                                        type="number"
                                        className="form-control border-start-0 ps-0 shadow-none"
                                        value={discountValue}
                                        onChange={(e) => setDiscountValue(e.target.value)}
                                        min="0"
                                        placeholder="Enter value..."
                                    />
                                </div>
                            </div>
                        </div>

                        {error && (
                            <div className="alert alert-danger mt-3 mb-0 small border-0 py-2 d-flex align-items-center gap-2">
                                <X size={14} /> {error}
                            </div>
                        )}

                        {paymentLink && (
                            <div className="alert alert-success mt-3 mb-0 small border-0 py-2 d-flex flex-column gap-2">
                                <strong>Payment Link Generated:</strong>
                                <a href={paymentLink} target="_blank" rel="noopener noreferrer" className="text-break">{paymentLink}</a>
                            </div>
                        )}
                    </div>

                    <div className="modal-footer border-0 p-4 pt-0">
                        <button type="button" className="btn btn-light w-100 py-2 fw-bold" onClick={onClose} disabled={isGenerating}>
                            {paymentLink ? 'Close' : 'Cancel'}
                        </button>
                        {!paymentLink && (
                            <button
                                type="button"
                                className="btn btn-primary w-100 py-2 fw-bold d-flex align-items-center justify-content-center gap-2 shadow-sm"
                                onClick={handleGenerate}
                                disabled={isGenerating || finalAmount <= 0}
                            >
                                {isGenerating ? (
                                    <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
                                ) : <Link size={16} />}
                                {isGenerating ? 'Generating...' : 'Generate & Send Link'}
                            </button>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
