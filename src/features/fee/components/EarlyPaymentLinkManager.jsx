import React, { useState, useEffect } from 'react';
import { FiLink, FiRefreshCw, FiExternalLink, FiClock, FiCheckCircle, FiXCircle } from 'react-icons/fi';
import { apiFetch } from '../../../services/api';

export default function EarlyPaymentLinkManager() {
    const [links, setLinks] = useState([]);
    const [loading, setLoading] = useState(false);

    const fetchLinks = async () => {
        setLoading(true);
        try {
            // Placeholder: Backend might need an endpoint for this
            const res = await apiFetch('/api/v1/admin/early-payment/all');
            setLinks(res || []);
        } catch (err) {
            console.error('Failed to fetch early payment links:', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchLinks();
    }, []);

    const getStatusBadge = (link) => {
        const isExpired = new Date(link.linkExpiry) < new Date();
        if (link.status === 'PAID') return <span className="badge bg-success text-white"><FiCheckCircle className="me-1" /> Paid</span>;
        if (isExpired) return <span className="badge bg-danger text-white"><FiClock className="me-1" /> Expired</span>;
        return <span className="badge bg-primary text-white"><FiExternalLink className="me-1" /> Active</span>;
    };

    return (
        <div className="fmd-anim">
            <div className="card shadow-sm border-0 rounded-4 overflow-hidden">
                <div className="card-header bg-white p-4 border-bottom d-flex justify-content-between align-items-center">
                    <div>
                        <h5 className="mb-1 fw-bold text-dark">Early Payment links</h5>
                        <p className="mb-0 text-muted small">Manage and track multi-installment payment links sent to students</p>
                    </div>
                    <button className="btn btn-light btn-sm rounded-3 fw-bold d-flex align-items-center gap-2" onClick={fetchLinks} disabled={loading}>
                        <FiRefreshCw className={loading ? 'animate-spin' : ''} /> Refresh
                    </button>
                </div>

                <div className="table-responsive">
                    <table className="table table-hover align-middle mb-0">
                        <thead className="bg-light text-muted small text-uppercase fw-bold">
                            <tr>
                                <th className="px-4 py-3">Student</th>
                                <th className="px-4 py-3">Installments</th>
                                <th className="px-4 py-3">Final Amount</th>
                                <th className="px-4 py-3">Expiry</th>
                                <th className="px-4 py-3">Status</th>
                                <th className="px-4 py-3 text-end">Link</th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                <tr><td colSpan="6" className="text-center py-5"><div className="spinner-border spinner-border-sm text-primary"></div></td></tr>
                            ) : links.length === 0 ? (
                                <tr><td colSpan="6" className="text-center py-5 text-muted">No early payment links generated yet.</td></tr>
                            ) : (
                                links.map(link => (
                                    <tr key={link.id}>
                                        <td className="px-4 py-3">
                                            <div className="fw-bold text-dark">{link.studentName || 'Student #' + link.studentId}</div>
                                            <div className="text-muted small">{link.studentEmail}</div>
                                        </td>
                                        <td className="px-4 py-3">
                                            <span className="badge bg-light text-dark border">
                                                {link.installmentIds?.length || 0} Terms
                                            </span>
                                        </td>
                                        <td className="px-4 py-3 fw-black text-primary">₹{link.finalAmount?.toLocaleString()}</td>
                                        <td className="px-4 py-3 text-muted small">
                                            {new Date(link.linkExpiry).toLocaleString()}
                                        </td>
                                        <td className="px-4 py-3">
                                            {getStatusBadge(link)}
                                        </td>
                                        <td className="px-4 py-3 text-end">
                                            <button
                                                className="btn btn-outline-primary btn-sm rounded-3 me-2"
                                                onClick={async () => {
                                                    try {
                                                        const res = await apiFetch(`/api/v1/admin/early-payment/sync-status/${link.cashfreeOrderId}`, { method: 'POST' });
                                                        if (res && res.message) {
                                                            alert(res.message);
                                                            fetchLinks(); // refresh
                                                        }
                                                    } catch (err) {
                                                        alert("Failed to sync payment status.");
                                                    }
                                                }}
                                                title="Sync Status from Cashfree"
                                            >
                                                <FiRefreshCw size={14} /> Sync
                                            </button>
                                            <button
                                                className="btn btn-outline-primary btn-sm rounded-3"
                                                onClick={() => {
                                                    const url = `${window.location.origin}/pay/${link.cashfreeOrderId}`;
                                                    navigator.clipboard.writeText(url);
                                                    alert('Payment link copied to clipboard!');
                                                }}
                                            >
                                                <FiLink size={14} /> Copy
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            <div className="mt-4 alert alert-info border-0 rounded-4 p-4 shadow-sm">
                <div className="d-flex gap-3">
                    <div className="bg-white rounded-circle p-2 text-primary shadow-sm" style={{ height: 'fit-content' }}>
                        <FiLink size={24} />
                    </div>
                    <div>
                        <h6 className="fw-bold mb-1">How it works</h6>
                        <p className="mb-0 small text-muted">Go to <strong>Student Ledgers</strong>, search for a student, and select two or more installments to generate a combined payment link with a custom discount.</p>
                    </div>
                </div>
            </div>
        </div>
    );
}
