import React, { useState, useEffect, useCallback } from 'react';
import {
    Wallet,
    TrendingUp,
    ArrowDownCircle,
    ArrowUpCircle,
    RefreshCw,
    ChevronDown,
    ChevronUp,
    DollarSign,
    Users,
    AlertCircle,
    Loader
} from 'lucide-react';
import affiliateService from '../../services/affiliateService';
import './Affiliates.css';

// ─── Helper ───────────────────────────────────────────────────────────────────
const fmt = (n) =>
    Number(n || 0).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

const StatCard = ({ icon: Icon, label, value, color }) => (
    <div className="card border-0 shadow-sm h-100" style={{ borderRadius: '14px' }}>
        <div className="card-body d-flex align-items-center gap-3 p-4">
            <div
                className="rounded-3 d-flex align-items-center justify-content-center flex-shrink-0"
                style={{ width: 52, height: 52, backgroundColor: `${color}18` }}
            >
                <Icon size={24} style={{ color }} />
            </div>
            <div>
                <p className="text-muted small mb-1">{label}</p>
                <h5 className="fw-bold mb-0">₹ {fmt(value)}</h5>
            </div>
        </div>
    </div>
);

// ─── Transaction Row ───────────────────────────────────────────────────────────
const TxRow = ({ tx }) => {
    const isCredit = tx.type === 'CREDIT';
    return (
        <tr>
            <td className="text-muted small">{new Date(tx.createdAt).toLocaleString('en-IN')}</td>
            <td>
                <span className={`badge ${isCredit ? 'bg-success-subtle text-success' : 'bg-danger-subtle text-danger'}`}>
                    {isCredit ? <ArrowDownCircle size={12} className="me-1" /> : <ArrowUpCircle size={12} className="me-1" />}
                    {tx.type}
                </span>
            </td>
            <td className={`fw-semibold ${isCredit ? 'text-success' : 'text-danger'}`}>
                {isCredit ? '+' : '-'} ₹ {fmt(tx.amount)}
            </td>
            <td className="text-muted small">{tx.description || '—'}</td>
        </tr>
    );
};

// ─── Affiliate Wallet Row ─────────────────────────────────────────────────────
const AffiliateWalletRow = ({ wallet, affiliates }) => {
    const [expanded, setExpanded] = useState(false);
    const [transactions, setTransactions] = useState([]);
    const [loadingTx, setLoadingTx] = useState(false);

    const affiliate = affiliates.find((a) => a.id === wallet.affiliateId);

    const loadTransactions = useCallback(async () => {
        if (transactions.length > 0) { setExpanded(true); return; }
        setLoadingTx(true);
        try {
            const data = await affiliateService.getWalletTransactions(wallet.affiliateId);
            setTransactions(data);
        } catch {
            setTransactions([]);
        } finally {
            setLoadingTx(false);
            setExpanded(true);
        }
    }, [wallet.affiliateId, transactions.length]);

    const toggle = () => {
        if (expanded) { setExpanded(false); } else { loadTransactions(); }
    };

    return (
        <>
            <tr className="align-middle" style={{ cursor: 'pointer' }} onClick={toggle}>
                <td>
                    <div className="d-flex align-items-center gap-2">
                        <div
                            className="rounded-circle bg-primary text-white d-flex align-items-center justify-content-center fw-bold flex-shrink-0"
                            style={{ width: 36, height: 36, fontSize: 14 }}
                        >
                            {affiliate?.name?.charAt(0)?.toUpperCase() || '?'}
                        </div>
                        <div>
                            <div className="fw-semibold" style={{ fontSize: 14 }}>{affiliate?.name || `Affiliate #${wallet.affiliateId}`}</div>
                            <div className="text-muted" style={{ fontSize: 12 }}>{affiliate?.email || ''}</div>
                        </div>
                    </div>
                </td>
                <td className="fw-bold text-primary">₹ {fmt(wallet.balance)}</td>
                <td className="text-success fw-semibold">₹ {fmt(wallet.totalEarned)}</td>
                <td className="text-secondary">₹ {fmt(wallet.totalPaid)}</td>
                <td className="text-muted small">{wallet.updatedAt ? new Date(wallet.updatedAt).toLocaleDateString('en-IN') : '—'}</td>
                <td>
                    <button className="btn btn-sm btn-outline-primary" onClick={(e) => { e.stopPropagation(); toggle(); }}>
                        {expanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                        <span className="ms-1" style={{ fontSize: 12 }}>History</span>
                    </button>
                </td>
            </tr>
            {expanded && (
                <tr>
                    <td colSpan={6} className="p-0">
                        <div className="bg-light p-3 border-top" style={{ borderRadius: '0 0 10px 10px' }}>
                            {loadingTx ? (
                                <div className="text-center py-3 text-muted">
                                    <Loader size={18} className="me-2 spin" /> Loading transactions...
                                </div>
                            ) : transactions.length === 0 ? (
                                <p className="text-muted text-center mb-0 small fst-italic py-2">No transactions yet.</p>
                            ) : (
                                <div className="table-responsive">
                                    <table className="table table-sm table-borderless mb-0">
                                        <thead>
                                            <tr className="text-muted" style={{ fontSize: 12 }}>
                                                <th>Date</th>
                                                <th>Type</th>
                                                <th>Amount</th>
                                                <th>Description</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {transactions.map((tx) => <TxRow key={tx.id} tx={tx} />)}
                                        </tbody>
                                    </table>
                                </div>
                            )}
                        </div>
                    </td>
                </tr>
            )}
        </>
    );
};

// ─── Main Component ───────────────────────────────────────────────────────────
const WalletSettings = () => {
    const [wallets, setWallets] = useState([]);
    const [affiliates, setAffiliates] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const loadData = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const [walletsData, affiliatesData] = await Promise.all([
                affiliateService.getAllWallets(),
                affiliateService.getAllAffiliates(),
            ]);
            setWallets(Array.isArray(walletsData) ? walletsData : (walletsData?.data || []));
            setAffiliates(Array.isArray(affiliatesData) ? affiliatesData : (affiliatesData?.data || []));
        } catch (err) {
            setError('Failed to load wallet data. Please check if the backend is running.');
            console.error(err);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => { loadData(); }, [loadData]);

    // Summary totals
    const safeWallets = Array.isArray(wallets) ? wallets : [];
    const totalBalance = safeWallets.reduce((s, w) => s + (w.balance || 0), 0);
    const totalEarned = safeWallets.reduce((s, w) => s + (w.totalEarned || 0), 0);
    const totalPaid = safeWallets.reduce((s, w) => s + (w.totalPaid || 0), 0);

    if (loading) {
        return (
            <div className="d-flex justify-content-center align-items-center min-vh-50 py-5">
                <div className="text-center text-muted">
                    <Loader size={40} className="spin mb-3" />
                    <p>Loading wallet data…</p>
                </div>
            </div>
        );
    }

    return (
        <div className="container-fluid py-4" style={{ backgroundColor: '#f8f9fa', minHeight: '100vh' }}>

            {/* ── Header ── */}
            <div className="d-flex justify-content-between align-items-center mb-4">
                <div>
                    <h2 className="fw-bold text-dark mb-1 d-flex align-items-center gap-2">
                        <Wallet className="text-primary" /> Affiliate Wallets
                    </h2>
                    <p className="text-muted mb-0">Real-time view of all affiliate wallet balances and transaction history</p>
                </div>
                <button className="btn btn-outline-primary d-flex align-items-center gap-2" onClick={loadData}>
                    <RefreshCw size={16} /> Refresh
                </button>
            </div>

            {/* ── Error ── */}
            {error && (
                <div className="alert alert-danger d-flex align-items-center gap-2 mb-4" style={{ borderRadius: 12 }}>
                    <AlertCircle size={20} /> {error}
                </div>
            )}

            {/* ── Summary Cards ── */}
            <div className="row g-3 mb-4">
                <div className="col-sm-6 col-xl-3">
                    <StatCard icon={Users} label="Total Affiliates" value={wallets.length} color="#6366f1" />
                </div>
                <div className="col-sm-6 col-xl-3">
                    <StatCard icon={Wallet} label="Total Balance (Unpaid)" value={totalBalance} color="#0d6efd" />
                </div>
                <div className="col-sm-6 col-xl-3">
                    <StatCard icon={TrendingUp} label="Total Commissions Earned" value={totalEarned} color="#198754" />
                </div>
                <div className="col-sm-6 col-xl-3">
                    <StatCard icon={DollarSign} label="Total Paid Out" value={totalPaid} color="#fd7e14" />
                </div>
            </div>

            {/* ── Wallets Table ── */}
            <div className="card border-0 shadow-sm" style={{ borderRadius: 16 }}>
                <div className="card-body p-0">
                    {safeWallets.length === 0 ? (
                        <div className="text-center py-5 text-muted">
                            <Wallet size={48} className="mb-3 opacity-25" />
                            <p>No affiliate wallets found.</p>
                        </div>
                    ) : (
                        <div className="table-responsive">
                            <table className="table align-middle mb-0">
                                <thead className="table-light" style={{ fontSize: 13 }}>
                                    <tr>
                                        <th className="ps-4">Affiliate</th>
                                        <th>Balance</th>
                                        <th>Total Earned</th>
                                        <th>Total Paid</th>
                                        <th>Last Updated</th>
                                        <th>Transactions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {safeWallets.map((w) => (
                                        <AffiliateWalletRow
                                            key={w.affiliateId || w.id || Math.random()}
                                            wallet={w}
                                            affiliates={affiliates}
                                        />
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            </div>

            {/* Spin animation */}
            <style>{`.spin { animation: spin 1s linear infinite; } @keyframes spin { from{transform:rotate(0deg)} to{transform:rotate(360deg)} }`}</style>
        </div>
    );
};

export default WalletSettings;
