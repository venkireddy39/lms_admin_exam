import React, { useState, useEffect } from 'react';
import { FiX, FiSettings, FiActivity, FiLayers, FiDollarSign, FiAlertTriangle } from 'react-icons/fi';
import affiliateService from '../../../services/affiliateService';

const AffiliateDetails = ({ affiliate, onClose }) => {
    const [activeTab, setActiveTab] = useState('overview');
    const [metrics, setMetrics] = useState(null);
    const [links, setLinks] = useState([]);
    const [sales, setSales] = useState([]);
    const [loading, setLoading] = useState(true);

    if (!affiliate) return null;

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            try {
                const [metricsData, linksData, salesData] = await Promise.all([
                    affiliateService.getAffiliateMetrics(affiliate.id).catch(() => null),
                    affiliateService.getAffiliateLinks(affiliate.id).catch(() => []),
                    affiliateService.getAllSales().catch(() => [])
                ]);
                setMetrics(metricsData);
                setLinks(Array.isArray(linksData) ? linksData : []);
                // Filter sales to only those belonging to this affiliate
                const affilSales = (Array.isArray(salesData) ? salesData : [])
                    .filter(s => String(s.affiliateId) === String(affiliate.id));
                setSales(affilSales);
            } catch (err) {
                console.error('AffiliateDetails: Failed to fetch data', err);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [affiliate.id]);

    const fmt = (val) => val != null ? Number(val).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : '0.00';

    return (
        <div className="card shadow-lg border-0 h-100">
            {/* Header */}
            <div className="card-header bg-white py-3 px-4 d-flex justify-content-between align-items-center border-bottom">
                <div className="d-flex align-items-center gap-3">
                    <div className="bg-primary bg-opacity-10 text-primary rounded-circle d-flex align-items-center justify-content-center fw-bold fs-4" style={{ width: 48, height: 48 }}>
                        {affiliate.name?.charAt(0)}
                    </div>
                    <div>
                        <h5 className="mb-0 fw-bold">{affiliate.name}</h5>
                        <div className="d-flex align-items-center gap-2 small text-muted">
                            <span>ID: {affiliate.id}</span>
                            <span className="vr"></span>
                            <span>{affiliate.type}</span>
                            <span className="vr"></span>
                            <span className={`badge bg-${affiliate.status === 'ACTIVE' ? 'success' : 'secondary'} bg-opacity-10 text-${affiliate.status === 'ACTIVE' ? 'success' : 'secondary'} border-0`}>
                                {affiliate.status}
                            </span>
                        </div>
                    </div>
                </div>
                <button onClick={onClose} className="btn btn-light btn-sm rounded-circle p-2">
                    <FiX size={20} />
                </button>
            </div>

            {/* Navigation */}
            <div className="px-4 border-bottom bg-light bg-opacity-25">
                <ul className="nav nav-tabs border-bottom-0 gap-3">
                    {[
                        { key: 'overview', label: 'Overview', icon: <FiActivity className="me-2" /> },
                        { key: 'batches', label: `Links (${links.length})`, icon: <FiLayers className="me-2" /> },
                        { key: 'payouts', label: 'Sales / Payouts', icon: <FiDollarSign className="me-2" /> },
                        { key: 'settings', label: 'Settings', icon: <FiSettings className="me-2" /> },
                    ].map(tab => (
                        <li key={tab.key} className="nav-item">
                            <button
                                className={`nav-link border-0 border-bottom border-3 py-3 px-1 ${activeTab === tab.key ? 'active border-primary fw-bold text-primary' : 'text-muted border-transparent'}`}
                                onClick={() => setActiveTab(tab.key)}
                            >
                                {tab.icon}{tab.label}
                            </button>
                        </li>
                    ))}
                </ul>
            </div>

            {/* Content */}
            <div className="card-body p-4 overflow-auto" style={{ maxHeight: '60vh' }}>

                {loading ? (
                    <div className="py-5 text-center text-muted">
                        <div className="spinner-border text-primary spinner-border-sm mb-3" role="status"></div>
                        <p className="mb-0 small fw-bold">Loading real-time data...</p>
                    </div>
                ) : (
                    <>
                        {/* 1. OVERVIEW TAB */}
                        {activeTab === 'overview' && (
                            <div className="animate-fade-in">
                                <div className="row g-3 mb-4">
                                    <div className="col-md-4">
                                        <div className="p-3 bg-light rounded border text-center">
                                            <div className="h3 fw-bold text-primary mb-1">
                                                ₹{fmt(metrics?.totalRevenue ?? metrics?.totalSalesAmount)}
                                            </div>
                                            <div className="small text-muted">Total Revenue</div>
                                        </div>
                                    </div>
                                    <div className="col-md-4">
                                        <div className="p-3 bg-light rounded border text-center">
                                            <div className="h3 fw-bold text-success mb-1">
                                                ₹{fmt(metrics?.totalEarned ?? metrics?.commissionEarned)}
                                            </div>
                                            <div className="small text-muted">Commission Earned</div>
                                        </div>
                                    </div>
                                    <div className="col-md-4">
                                        <div className="p-3 bg-light rounded border text-center">
                                            <div className="h3 fw-bold text-dark mb-1">
                                                {metrics?.convertedLeads ?? metrics?.totalEnrollments ?? 0}
                                            </div>
                                            <div className="small text-muted">Total Enrollments</div>
                                        </div>
                                    </div>
                                </div>

                                {/* Wallet Balance Row */}
                                <div className="row g-3 mb-4">
                                    <div className="col-md-4">
                                        <div className="p-3 bg-primary bg-opacity-10 rounded border border-primary border-opacity-25 text-center">
                                            <div className="h4 fw-bold text-primary mb-1">₹{fmt(metrics?.walletBalance)}</div>
                                            <div className="small text-muted">Wallet Balance</div>
                                        </div>
                                    </div>
                                    <div className="col-md-4">
                                        <div className="p-3 bg-light rounded border text-center">
                                            <div className="h4 fw-bold text-dark mb-1">{metrics?.totalLeads ?? 0}</div>
                                            <div className="small text-muted">Total Leads</div>
                                        </div>
                                    </div>
                                    <div className="col-md-4">
                                        <div className="p-3 bg-light rounded border text-center">
                                            <div className="h4 fw-bold text-dark mb-1">
                                                {metrics?.conversionRate != null ? `${Number(metrics.conversionRate).toFixed(1)}%` : '0%'}
                                            </div>
                                            <div className="small text-muted">Conversion Rate</div>
                                        </div>
                                    </div>
                                </div>

                                {/* Risk signals */}
                                {(affiliate.riskLevel === 'High' || affiliate.riskLevel === 'Medium') && (
                                    <div className={`p-3 border rounded mb-4 ${affiliate.riskLevel === 'High' ? 'bg-danger bg-opacity-10 border-danger' : 'bg-warning bg-opacity-10 border-warning'}`}>
                                        <div className="d-flex align-items-center gap-2 mb-2">
                                            <FiAlertTriangle className={affiliate.riskLevel === 'High' ? 'text-danger' : 'text-warning'} />
                                            <h6 className={`mb-0 fw-bold ${affiliate.riskLevel === 'High' ? 'text-danger' : 'text-danger-emphasis'}`}>Fraud & Abuse Signals Detected</h6>
                                        </div>
                                        <div className="d-flex flex-wrap gap-2">
                                            {(affiliate.fraudSignals || []).map((signal, idx) => (
                                                <span key={idx} className={`badge ${affiliate.riskLevel === 'High' ? 'bg-danger text-white' : 'bg-warning text-dark'}`}>{signal}</span>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {/* Contact Information */}
                                <h6 className="fw-bold mb-3">Contact Information</h6>
                                <div className="row g-3">
                                    <div className="col-md-6">
                                        <label className="small text-muted text-uppercase fw-bold">Email</label>
                                        <div>{affiliate.email || 'N/A'}</div>
                                    </div>
                                    <div className="col-md-6">
                                        <label className="small text-muted text-uppercase fw-bold">Phone</label>
                                        <div>{affiliate.mobile || affiliate.phone || 'N/A'}</div>
                                    </div>
                                    <div className="col-12">
                                        <label className="small text-muted text-uppercase fw-bold">Affiliate Code</label>
                                        <div><span className="badge bg-primary bg-opacity-10 text-primary font-monospace">{affiliate.code || 'N/A'}</span></div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* 2. LINKS/BATCHES TAB */}
                        {activeTab === 'batches' && (
                            <div className="animate-fade-in">
                                {links.length === 0 ? (
                                    <div className="text-center py-5 text-muted">
                                        <FiLayers size={40} className="mb-3 opacity-25" />
                                        <p className="mb-0">No affiliate links created yet.</p>
                                    </div>
                                ) : (
                                    <div className="table-responsive border rounded">
                                        <table className="table table-hover align-middle mb-0 text-nowrap">
                                            <thead className="table-light">
                                                <tr>
                                                    <th>Referral Code</th>
                                                    <th>Batch ID</th>
                                                    <th>Commission</th>
                                                    <th>Discount</th>
                                                    <th className="text-center">Clicks</th>
                                                    <th className="text-center">Status</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {links.map((link, idx) => {
                                                    const fullLink = `${window.location.origin}/apply?ref=${link.referralCode}`;
                                                    return (
                                                        <tr key={link.id || idx}>
                                                            <td className="fw-bold font-monospace text-primary">
                                                                <div className="d-flex align-items-center gap-2">
                                                                    {link.referralCode || 'N/A'}
                                                                    <button
                                                                        className="btn btn-link p-0 text-decoration-none"
                                                                        title="Copy Full Link"
                                                                        onClick={() => {
                                                                            navigator.clipboard.writeText(fullLink);
                                                                            alert('Link copied to clipboard!');
                                                                        }}
                                                                    >
                                                                        <small className="text-muted" style={{ fontSize: '0.7rem' }}>(Copy Link)</small>
                                                                    </button>
                                                                </div>
                                                            </td>
                                                            <td className="text-muted">#{link.batchId}</td>
                                                            <td className="fw-bold">{link.commissionValue ?? 0}%</td>
                                                            <td>{link.studentDiscountValue ?? 0}%</td>
                                                            <td className="text-center">{link.clicks ?? 0}</td>
                                                            <td className="text-center">
                                                                <span className={`badge ${link.status === 'ACTIVE' ? 'bg-success-subtle text-success' : 'bg-secondary-subtle text-secondary'}`}>
                                                                    {link.status || 'N/A'}
                                                                </span>
                                                            </td>
                                                        </tr>
                                                    );
                                                })}
                                            </tbody>
                                        </table>
                                    </div>
                                )}
                            </div>
                        )}

                        {/* 3. PAYOUTS / SALES TAB */}
                        {activeTab === 'payouts' && (
                            <div className="animate-fade-in">
                                {sales.length === 0 ? (
                                    <div className="text-center py-5 text-muted">
                                        <FiDollarSign size={40} className="mb-3 opacity-25" />
                                        <p className="mb-0">No sales or payouts recorded yet.</p>
                                    </div>
                                ) : (
                                    <div className="table-responsive border rounded">
                                        <table className="table table-hover align-middle mb-0">
                                            <thead className="table-light">
                                                <tr>
                                                    <th>Order ID</th>
                                                    <th>Batch ID</th>
                                                    <th>Original</th>
                                                    <th>Commission</th>
                                                    <th>Status</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {sales.map((sale, idx) => (
                                                    <tr key={sale.id || idx}>
                                                        <td><span className="font-monospace small">{sale.orderId || `SALE-${sale.id}`}</span></td>
                                                        <td className="text-muted">#{sale.batchId}</td>
                                                        <td>₹{fmt(sale.originalAmount)}</td>
                                                        <td className="fw-bold text-success">₹{fmt(sale.commissionAmount)}</td>
                                                        <td>
                                                            <span className={`badge bg-${sale.status === 'APPROVED' || sale.status === 'PAID' ? 'success' : sale.status === 'PENDING' ? 'warning' : 'danger'} bg-opacity-25 text-${sale.status === 'APPROVED' || sale.status === 'PAID' ? 'success' : 'dark'}`}>
                                                                {sale.status}
                                                            </span>
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                )}
                            </div>
                        )}

                        {/* 4. SETTINGS TAB */}
                        {activeTab === 'settings' && (
                            <div className="animate-fade-in">
                                <div className="row g-4">
                                    <div className="col-12">
                                        <div className="p-3 border rounded bg-light">
                                            <h6 className="fw-bold mb-3">Default Commission Rules</h6>
                                            <div className="row g-3">
                                                <div className="col-md-6">
                                                    <label className="form-label small text-muted">Commission Type</label>
                                                    <input type="text" className="form-control" value={affiliate.commissionType || 'PERCENT'} disabled readOnly />
                                                </div>
                                                <div className="col-md-6">
                                                    <label className="form-label small text-muted">Default Value (%)</label>
                                                    <input type="text" className="form-control" value={affiliate.commissionValue ?? 'N/A'} disabled readOnly />
                                                </div>
                                            </div>
                                            <div className="mt-3 small text-muted">
                                                <FiActivity className="me-1" /> To update these defaults, edit the affiliate profile.
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}
                    </>
                )}
            </div>

            {/* Footer */}
            <div className="card-footer bg-light py-3 px-4 d-flex justify-content-end gap-2 text-end">
                <button className="btn btn-outline-secondary btn-sm" onClick={onClose}>Close</button>
            </div>
        </div>
    );
};

export default AffiliateDetails;
