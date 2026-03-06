import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';

const FEE_API_BASE = import.meta.env.VITE_FEE_API_URL || '';

export default function PayPage() {
    const { orderId } = useParams();
    const [info, setInfo] = useState(null);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!orderId) return;
        fetch(`${FEE_API_BASE}/api/v1/payments/${orderId}`)
            .then(r => r.json())
            .then(res => {
                if (res.success && res.data) {
                    const data = res.data;
                    setInfo(data);
                    if (data.paymentSessionId) {
                        initCashfree(data.paymentSessionId);
                    }
                } else {
                    setError(res.message || 'Failed to load payment info.');
                }
                setLoading(false);
            })
            .catch(() => {
                setError('Failed to load payment info. Please try again or contact admin.');
                setLoading(false);
            });
    }, [orderId]);

    function initCashfree(sessionId) {
        // Load Cashfree SDK dynamically
        const script = document.createElement('script');
        script.src = 'https://sdk.cashfree.com/js/v3/cashfree.js';
        script.onload = () => {
            const cashfree = window.Cashfree({ mode: 'sandbox' }); // change to "production" in prod
            cashfree.checkout({ paymentSessionId: sessionId });
        };
        document.head.appendChild(script);
    }

    if (loading) return (
        <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '100vh' }}>
            <div className="spinner-border text-primary" role="status">
                <span className="visually-hidden">Loading...</span>
            </div>
        </div>
    );

    if (info?.alreadyPaid) return (
        <div className="container mt-5">
            <div className="alert alert-success text-center p-5">
                <h2>✅ Already Paid</h2>
                <p className="mb-0">This installment has already been paid successfully.</p>
            </div>
        </div>
    );

    if (info?.expired) return (
        <div className="container mt-5">
            <div className="alert alert-warning text-center p-5">
                <h2>⏰ Link Expired</h2>
                <p className="mb-0">This payment link has expired. Please contact your admin to generate a new one.</p>
            </div>
        </div>
    );

    if (error) return (
        <div className="container mt-5">
            <div className="alert alert-danger text-center p-5">
                <h2>❌ Error</h2>
                <p className="mb-0">{error}</p>
            </div>
        </div>
    );

    return (
        <div className="container mt-5">
            <div className="row justify-content-center">
                <div className="col-md-6">
                    <div className="card shadow-sm border-0">
                        <div className="card-body p-4 text-center">
                            <h4 className="mb-3">💳 Fee Payment</h4>
                            {info && (
                                <>
                                    <p className="text-muted">{info.label}</p>
                                    <h2 className="text-primary fw-bold">₹{info.amount}</h2>
                                    <p className="text-muted small">
                                        Link valid until: {info.linkExpiry ? new Date(info.linkExpiry).toLocaleString() : '—'}
                                    </p>
                                    <p className="text-muted small">Opening payment checkout...</p>
                                </>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
