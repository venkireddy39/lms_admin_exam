import React, { useState, useEffect } from 'react';
import { FiLink, FiMousePointer, FiDollarSign, FiCopy, FiTrendingUp, FiExternalLink, FiCheckCircle, FiPlus, FiClock } from 'react-icons/fi';
import affiliateService from '../../services/affiliateService';
import { courseService } from '../Courses/services/courseService';
import { getAllBatches } from '../../services/feeService';
import { useAuth } from '../Library/context/AuthContext';
import './Affiliates.css';

const AffiliatePortal = () => {
    const { user } = useAuth();
    const [metrics, setMetrics] = useState({
        totalLeads: 0,
        convertedLeads: 0,
        conversionRate: 0,
        pendingCommission: 0,
        paidCommission: 0,
        walletBalance: 0
    });
    const [loading, setLoading] = useState(true);

    const [affiliateDetails, setAffiliateDetails] = useState({
        id: user?.userId || user?.id || 1,
        name: user?.name || user?.email?.split('@')[0] || 'Partner',
        code: user?.affiliateCode || 'N/A',
        commissionValue: user?.commissionValue || 15
    });

    useEffect(() => {
        fetchPortalData();
    }, []);

    const fetchPortalData = async () => {
        try {
            setLoading(true);
            const partnerId = affiliateDetails.id;
            const [wallet, sales, links, leads, portalTransactions] = await Promise.all([
                affiliateService.getPortalWallet(partnerId).catch(() => null),
                affiliateService.getPortalSales(partnerId).catch(() => []),
                affiliateService.getAffiliateLinks(partnerId).catch(() => []),
                affiliateService.getAffiliateLeads(partnerId).catch(() => []),
                affiliateService.getPortalTransactions(partnerId).catch(() => [])
            ]);

            if (wallet) {
                setMetrics(prev => ({
                    ...prev,
                    walletBalance: wallet.balance || 0,
                    pendingCommission: (wallet.totalEarned || 0) - (wallet.totalPaid || 0),
                    paidCommission: wallet.totalPaid || 0,
                    totalLeads: Array.isArray(leads) ? leads.length : 0,
                    convertedLeads: Array.isArray(leads) ? leads.filter(l => l.status === 'ENROLLED').length : 0,
                    conversionRate: Array.isArray(leads) && leads.length > 0
                        ? (leads.filter(l => l.status === 'ENROLLED').length / leads.length) * 100
                        : 0
                }));
            }

            setMyLeads(Array.isArray(leads) ? leads : []);
            setActiveLinks(Array.isArray(links) ? links : []);
            setTransactions(Array.isArray(portalTransactions) ? portalTransactions : []);

            setLoading(false);
        } catch {
            setLoading(false);
        }
    };

    // Mock data for Leads and Active Links (In real app, fetch from API)
    const [myLeads, setMyLeads] = useState([]);
    const [activeLinks, setActiveLinks] = useState([]);
    const [transactions, setTransactions] = useState([]);

    // Manual Lead Entry State
    const [showLeadModal, setShowLeadModal] = useState(false);
    const [selectedLinkForLead, setSelectedLinkForLead] = useState(null);
    const [leadForm, setLeadForm] = useState({ name: '', email: '', mobile: '' });
    const [submittingLead, setSubmittingLead] = useState(false);
    const [leadError, setLeadError] = useState('');
    const [copyMsg, setCopyMsg] = useState('');

    const handleLeadSubmit = async (e) => {
        e.preventDefault();
        setSubmittingLead(true);
        try {
            await affiliateService.submitLead({
                name: leadForm.name, email: leadForm.email, mobile: leadForm.mobile,
                courseId: selectedLinkForLead.courseId || null,
                batchId: selectedLinkForLead.batchId || null,
                affiliateCode: selectedLinkForLead.code
            });
            setShowLeadModal(false);
            setLeadForm({ name: '', email: '', mobile: '' });
            fetchPortalData();
        } catch (error) {
            setLeadError(error.message || 'Failed to submit lead.');
        } finally {
            setSubmittingLead(false);
        }
    };

    if (loading) return (
        <div className="p-5 text-center min-vh-100 d-flex flex-column align-items-center justify-content-center">
            <div className="spinner-border text-primary mb-3" role="status"></div>
            <p className="text-muted fw-bold">Authenticating Partner Session...</p>
        </div>
    );

    return (
        <div className="affiliate-page animate-fade-in">
            <header className="affiliate-header border-bottom mb-4 pb-3">
                <div className="page-title">
                    <span className="text-primary fw-bold text-uppercase small ls-2">Affiliate Identity</span>
                    <h1 className="fw-bold">Partner Portal & Insights 👋</h1>
                    <p className="text-muted">Welcome back, <strong>{affiliateDetails.name}</strong>. Track your real-time performance and payouts.</p>
                </div>
                <div className="marketing-actions d-flex align-items-center gap-3">
                    <div className="d-flex flex-column align-items-end me-3 d-none d-md-flex">
                        <span className="small text-muted mb-0">Partner ID: <strong>{affiliateDetails.id}</strong></span>
                        <span className="small text-muted">Wallet ID: <strong className="text-dark">WAL-{affiliateDetails.id}100</strong></span>
                    </div>
                    <span className="badge bg-green-subtle text-green p-2 px-3 rounded-pill border border-green shadow-sm">
                        Status: <strong>Active</strong>
                    </span>
                </div>
            </header>

            {/* Premium Stats Grid */}
            <div className="affiliate-summary" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))' }}>
                <div className="summary-card shadow-sm border-0">
                    <div className="summary-label text-uppercase small ls-1">Total Leads Inbound</div>
                    <div className="summary-value text-primary">{metrics.totalLeads}</div>
                    <div className="text-sm text-muted mt-2 d-flex align-items-center gap-1">
                        <FiMousePointer className="text-blue" /> High engagement this week
                    </div>
                </div>
                <div className="summary-card shadow-sm border-0">
                    <div className="summary-label text-uppercase small ls-1">Student Enrollments</div>
                    <div className="summary-value text-success">{metrics.convertedLeads}</div>
                    <div className="text-sm text-muted mt-2 d-flex align-items-center gap-1">
                        <FiTrendingUp className="text-green" /> {(metrics.conversionRate || 0).toFixed(1)}% Conversion
                    </div>
                </div>
                <div className="summary-card highlight shadow-lg">
                    <div>
                        <div className="summary-label text-white-50 text-uppercase small ls-1">Current Wallet Balance</div>
                        <div className="summary-value text-white">₹{(metrics.walletBalance || 0).toLocaleString()}</div>
                    </div>
                    <div className="chart-placeholder bg-white bg-opacity-10 small d-flex justify-content-between align-items-center">
                        <span>Ready for Payout</span>
                        <button className="btn btn-sm btn-light py-0 px-2 rounded-pill fw-bold text-dark"
                            onClick={() => { setCopyMsg('Payout request sent!'); setTimeout(() => setCopyMsg(''), 3000); }}
                            style={{ fontSize: '11px' }}>
                            Request Payout
                        </button>
                    </div>
                </div>
                <div className="summary-card shadow-sm border-0">
                    <div className="summary-label text-uppercase small ls-1">Lifetime Earnings</div>
                    <div className="summary-value text-dark">₹{(metrics.paidCommission + metrics.pendingCommission).toLocaleString()}</div>
                    <div className="text-sm text-muted mt-2 d-flex align-items-center gap-1">
                        <FiDollarSign className="text-warning" /> Including pending ₹{(metrics.pendingCommission || 0).toLocaleString()}
                    </div>
                </div>
            </div>

            <div className="row mt-5 g-4">
                {/* Dashboard Tables Column */}
                <div className="col-12">
                    {/* Active Promotions Table */}
                    <div className="affiliate-table-container shadow-sm border-0 mb-4" style={{ borderRadius: '24px' }}>
                        <div className="table-header bg-white border-0 p-4 pb-2 d-flex justify-content-between align-items-center flex-wrap gap-3">
                            <h5 className="fw-bold d-flex align-items-center gap-2 mb-0">
                                <FiTrendingUp className="text-primary" /> My Active Promotions
                            </h5>
                            <div className="bg-primary bg-opacity-10 text-primary px-3 py-2 rounded-3 small fw-medium d-flex align-items-center gap-2">
                                <span>Need a new link or one expired?</span>
                                <a href="mailto:admin@lms.com" className="btn btn-sm btn-primary py-1 px-2">Contact Admin</a>
                            </div>
                        </div>
                        <div className="table-responsive p-3 pt-0">
                            <table className="table align-middle table-hover mb-0" style={{ borderCollapse: 'separate', borderSpacing: '0 8px' }}>
                                <thead className="bg-light bg-opacity-50">
                                    <tr>
                                        <th className="border-0 px-4 small fw-bold text-muted">ASSET / BATCH</th>
                                        <th className="border-0 small fw-bold text-muted">CODE</th>
                                        <th className="border-0 small fw-bold text-muted text-center">CLICKS</th>
                                        <th className="border-0 small fw-bold text-muted text-center">LEADS</th>
                                        <th className="border-0 small fw-bold text-muted text-center">ENROLLMENTS</th>
                                        <th className="border-0 small fw-bold text-muted text-center">EARNINGS</th>
                                        <th className="border-0 px-4 text-end"></th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {(Array.isArray(activeLinks) && activeLinks.length > 0) ? activeLinks.map(link => (
                                        <tr key={link.id} className="bg-white shadow-sm rounded-3">
                                            <td className="px-4 border-0 rounded-start">
                                                <div className="fw-bold text-dark">{link.course || 'Marketing Course'}</div>
                                                <div className="small text-muted">{link.batch || 'General Batch'}</div>
                                            </td>
                                            <td className="border-0">
                                                <code>{link.code}</code>
                                            </td>
                                            <td className="border-0 text-center fw-bold text-blue">{link.clicks || 0}</td>
                                            <td className="border-0 text-center fw-bold text-warning">{link.leads || 0}</td>
                                            <td className="border-0 text-center fw-bold text-success">{link.conversions || 0}</td>
                                            <td className="border-0 text-center fw-bold text-dark">₹{link.earnings || 0}</td>
                                            <td className="px-4 border-0 text-end rounded-end" style={{ minWidth: '200px' }}>
                                                <button className="btn btn-sm btn-outline-primary border p-1 px-2 rounded-pill me-2" onClick={() => {
                                                    setSelectedLinkForLead(link);
                                                    setShowLeadModal(true);
                                                }}>
                                                    <FiPlus className="me-1" /> Add Lead
                                                </button>
                                                <button className="btn btn-sm btn-light border p-1 px-2 rounded-pill" onClick={() => {
                                                    navigator.clipboard.writeText(`http://localhost:5173/apply?ref=${link.code}`);
                                                    setCopyMsg('Referral URL copied!');
                                                    setTimeout(() => setCopyMsg(''), 2000);
                                                }}>
                                                    <FiCopy className="me-1" /> Copy Link
                                                </button>
                                            </td>
                                        </tr>
                                    )) : (
                                        <tr>
                                            <td colSpan="7" className="text-center py-5 text-muted bg-white rounded-3 shadow-sm border-0">
                                                No active promotions found. Contact admin to generate a link.
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    {/* Recent Leads Table */}
                    <div className="affiliate-table-container shadow-sm border-0" style={{ borderRadius: '24px' }}>
                        <div className="table-header bg-white border-0 p-4 pb-2">
                            <h5 className="fw-bold d-flex align-items-center gap-2">
                                <FiMousePointer className="text-primary" /> Recent Registered Leads
                            </h5>
                        </div>
                        <div className="table-responsive p-3 pt-0">
                            <table className="table align-middle m-0">
                                <thead>
                                    <tr>
                                        <th className="border-0 px-4 small fw-bold text-muted">NAME & CONTACT</th>
                                        <th className="border-0 small fw-bold text-muted">TARGET BATCH</th>
                                        <th className="border-0 small fw-bold text-muted">STATUS</th>
                                        <th className="border-0 px-4 text-end small fw-bold text-muted">DATE</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {(Array.isArray(myLeads) ? myLeads : []).map(lead => (
                                        <tr key={lead.id}>
                                            <td className="px-4 py-3">
                                                <div className="fw-bold text-dark">{lead.name}</div>
                                                <div className="small text-muted">{lead.email}</div>
                                            </td>
                                            <td className="py-3">
                                                <span className="small fw-medium text-dark">{lead.batch}</span>
                                            </td>
                                            <td className="py-3">
                                                <span className={`status-tag ${lead.status.toLowerCase() == 'enrolled' ? 'active' : 'pending'}`}>
                                                    {lead.status}
                                                </span>
                                            </td>
                                            <td className="px-4 py-3 text-end text-muted small">
                                                {lead.date}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                        <div className="p-3 text-center border-top">
                            <button className="btn btn-link btn-sm text-decoration-none fw-bold">View Full Activity Log &rarr;</button>
                        </div>
                    </div>

                    {/* Commission History Table */}
                    <div className="affiliate-table-container shadow-sm border-0 mt-4" style={{ borderRadius: '24px' }}>
                        <div className="table-header bg-white border-0 p-4 pb-2">
                            <h5 className="fw-bold d-flex align-items-center gap-2 mb-0">
                                <FiClock className="text-warning" /> Commission & Payout History
                            </h5>
                        </div>
                        <div className="table-responsive p-3 pt-0">
                            <table className="table align-middle m-0">
                                <thead>
                                    <tr>
                                        <th className="border-0 px-4 small fw-bold text-muted">ID / REF</th>
                                        <th className="border-0 small fw-bold text-muted">TYPE</th>
                                        <th className="border-0 small fw-bold text-muted">AMOUNT</th>
                                        <th className="border-0 small fw-bold text-muted">STATUS</th>
                                        <th className="border-0 px-4 text-end small fw-bold text-muted">DATE</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {(Array.isArray(transactions) && transactions.length > 0) ? transactions.map(txn => (
                                        <tr key={txn.id}>
                                            <td className="px-4 py-3">
                                                <div className="fw-bold text-dark text-uppercase">{txn.transactionId || `TXN-${txn.id}`}</div>
                                                <div className="small text-muted">{txn.referenceInfo || '-'}</div>
                                            </td>
                                            <td className="py-3">
                                                <span className={`small fw-bold ${txn.transactionType === 'CREDIT' ? 'text-success' : 'text-danger'}`}>
                                                    {txn.transactionType}
                                                </span>
                                            </td>
                                            <td className="py-3 fw-bold text-dark">
                                                ₹{txn.amount}
                                            </td>
                                            <td className="py-3">
                                                <span className={`badge ${txn.status === 'COMPLETED' ? 'bg-success' : txn.status === 'PENDING' ? 'bg-warning text-dark' : txn.status === 'REJECTED' ? 'bg-danger' : 'bg-secondary'}`}>
                                                    {txn.status || 'PENDING'}
                                                </span>
                                            </td>
                                            <td className="px-4 py-3 text-end text-muted small">
                                                {new Date(txn.createdAt || Date.now()).toLocaleDateString()}
                                            </td>
                                        </tr>
                                    )) : (
                                        <tr>
                                            <td colSpan="5" className="text-center py-5 text-muted bg-white rounded-3 shadow-sm border-0">
                                                No transactions found yet.
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </div>

            {/* MANUAL LEAD ENTRY MODAL */}
            {showLeadModal && selectedLinkForLead && (
                <div className="fixed inset-0 bg-black bg-opacity-60 d-flex align-items-center justify-content-center animate-fade-in" style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, zIndex: 1050, backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <div className="bg-white rounded-5 shadow-2xl w-full max-w-md animate-scale-up-fast overflow-hidden" style={{ width: '95%', maxWidth: 500 }}>
                        <div className="p-4 border-bottom bg-light">
                            <h5 className="mb-1 fw-bold">Add Manual Lead</h5>
                            <p className="small text-muted mb-0">Registering under link: <strong>{selectedLinkForLead.code}</strong></p>
                        </div>
                        <div className="p-4">
                            <form onSubmit={handleLeadSubmit}>
                                <div className="mb-3">
                                    <label className="fw-bold small text-muted mb-1">Full Name</label>
                                    <input type="text" className="form-control bg-light" required value={leadForm.name} onChange={e => setLeadForm({ ...leadForm, name: e.target.value })} />
                                </div>
                                <div className="mb-3">
                                    <label className="fw-bold small text-muted mb-1">Email</label>
                                    <input type="email" className="form-control bg-light" required value={leadForm.email} onChange={e => setLeadForm({ ...leadForm, email: e.target.value })} />
                                </div>
                                <div className="mb-4">
                                    <label className="fw-bold small text-muted mb-1">Mobile</label>
                                    <input type="tel" className="form-control bg-light" required value={leadForm.mobile} onChange={e => setLeadForm({ ...leadForm, mobile: e.target.value })} />
                                </div>
                                <div className="d-flex gap-2 justify-content-end mt-4">
                                    <button type="button" className="btn btn-outline-secondary" onClick={() => setShowLeadModal(false)}>Cancel</button>
                                    <button type="submit" className="btn btn-primary px-4 fw-bold shadow-sm" disabled={submittingLead}>
                                        {submittingLead ? 'Submitting...' : 'Register Lead'}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AffiliatePortal;
