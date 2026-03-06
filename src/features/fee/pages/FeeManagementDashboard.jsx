import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import FeeConfigForm from '../components/FeeConfigForm';
import StudentFeeSummary from '../components/StudentFeeSummary';
import InstallmentTable from '../components/InstallmentTable';
import PaymentForm from '../components/PaymentForm';
import FeePayments from '../../../pages/FeeManagement/FeePayments';
import FeeAuditLogs from '../../../pages/FeeManagement/FeeAuditLogs';
import FeeSettingsPage from './FeeSettingsPage';
import EarlyPaymentModal from '../components/EarlyPaymentModal';
import EarlyPaymentLinkManager from '../components/EarlyPaymentLinkManager';
import { feeApi } from '../api/feeApi';
import { courseService } from '../../../pages/Courses/services/courseService';
import { batchService } from '../../../pages/Batches/services/batchService';
import {
    Settings, Users, CreditCard, Activity, Search,
    RefreshCw, ChevronRight, Tag, Layers, Eye,
    IndianRupee, TrendingUp, ArrowUpRight, FileText, SlidersHorizontal,
    Link
} from 'lucide-react';

/* ══════════════════════════════════════════════════════════
   SCOPED STYLES
══════════════════════════════════════════════════════════ */
const CSS = `
    .fmd-page {
        background: #f1f5f9;
        min-height: 100vh;
        font-family: 'Inter', 'Outfit', system-ui, sans-serif;
    }

    /* ── Hero ── */
    .fmd-hero {
        background: linear-gradient(135deg, #0f172a 0%, #1e3a5f 55%, #312e81 100%);
        padding: 28px 40px;
        display: flex; justify-content: space-between; align-items: center; gap: 24px;
        position: relative; overflow: hidden;
    }
    .fmd-hero::before {
        content: ''; position: absolute;
        width: 400px; height: 400px;
        background: radial-gradient(circle, rgba(99,102,241,0.2) 0%, transparent 70%);
        top: -120px; right: -80px; border-radius: 50%; pointer-events: none;
    }
    .fmd-hero::after {
        content: ''; position: absolute;
        width: 220px; height: 220px;
        background: radial-gradient(circle, rgba(16,185,129,0.1) 0%, transparent 70%);
        bottom: -60px; left: 200px; border-radius: 50%; pointer-events: none;
    }
    .fmd-hero-left { position: relative; z-index: 1; }
    .fmd-eyebrow {
        display: inline-flex; align-items: center; gap: 6px;
        background: rgba(99,102,241,0.25); color: #a5b4fc;
        font-size: 10.5px; font-weight: 700; letter-spacing: 1.2px;
        text-transform: uppercase; padding: 3px 12px; border-radius: 20px;
        border: 1px solid rgba(99,102,241,0.3); margin-bottom: 10px;
    }
    .fmd-hero h1 {
        font-size: 28px; font-weight: 900; color: #fff;
        margin: 0 0 7px; letter-spacing: -0.5px;
    }
    .fmd-hero p { font-size: 13px; color: rgba(255,255,255,0.55); margin: 0; font-weight: 500; }
    .fmd-hero-right { display: flex; gap: 10px; align-items: center; position: relative; z-index: 1; flex-shrink: 0; }

    /* ── Hero action buttons ── */
    .fmd-hero-btn {
        display: inline-flex; align-items: center; gap: 7px;
        border-radius: 12px; padding: 9px 18px;
        font-size: 13px; font-weight: 700; cursor: pointer; transition: all 0.2s;
        white-space: nowrap;
    }
    .fmd-hero-btn.ghost {
        background: rgba(255,255,255,0.1); border: 1.5px solid rgba(255,255,255,0.18); color: rgba(255,255,255,0.85);
    }
    .fmd-hero-btn.ghost:hover { background: rgba(255,255,255,0.18); color: #fff; }
    .fmd-hero-btn.primary {
        background: linear-gradient(135deg, #6366f1, #4f46e5); border: none;
        color: #fff; box-shadow: 0 4px 16px rgba(99,102,241,0.4);
    }
    .fmd-hero-btn.primary:hover { transform: translateY(-2px); box-shadow: 0 8px 22px rgba(99,102,241,0.5); }

    /* ── Tab bar ── */
    .fmd-tabs-wrap { background: #fff; border-bottom: 1.5px solid #f1f5f9; padding: 0 40px; }
    .fmd-tabs { display: flex; gap: 0; list-style: none; margin: 0; padding: 0; }
    .fmd-tab-btn {
        display: flex; align-items: center; gap: 8px;
        padding: 16px 22px; border: none; background: none; cursor: pointer;
        font-size: 13.5px; font-weight: 600; color: #64748b;
        border-bottom: 2.5px solid transparent; margin-bottom: -1.5px;
        transition: all 0.18s; white-space: nowrap;
    }
    .fmd-tab-btn:hover { color: #4f46e5; background: #f8fafc; }
    .fmd-tab-btn.active { color: #4f46e5; border-bottom-color: #4f46e5; font-weight: 800; }
    .fmd-tab-icon { opacity: 0.7; }
    .fmd-tab-btn.active .fmd-tab-icon { opacity: 1; }

    /* ── Body ── */
    .fmd-body { padding: 32px 40px; }

    /* ── Recent structures table ── */
    .fmd-struct-card {
        background: #fff; border-radius: 20px;
        border: 1.5px solid #e5e7eb;
        box-shadow: 0 1px 4px rgba(0,0,0,0.05);
        overflow: hidden; margin-top: 28px;
    }
    .fmd-struct-hdr {
        display: flex; justify-content: space-between; align-items: center;
        padding: 18px 24px; border-bottom: 1.5px solid #f1f5f9;
    }
    .fmd-struct-title { font-size: 14px; font-weight: 800; color: #0f172a; }
    .fmd-view-all {
        display: inline-flex; align-items: center; gap: 4px;
        font-size: 12px; font-weight: 700; color: #6366f1;
        background: none; border: none; cursor: pointer; transition: gap 0.15s;
    }
    .fmd-view-all:hover { gap: 8px; }
    .fmd-struct-table { width: 100%; border-collapse: collapse; }
    .fmd-struct-table th {
        padding: 11px 20px; font-size: 10px; font-weight: 800;
        text-transform: uppercase; letter-spacing: 0.8px; color: #94a3b8;
        text-align: left; background: #f8fafc; border-bottom: 1.5px solid #f1f5f9;
    }
    .fmd-struct-table tbody tr { border-bottom: 1px solid #f8fafc; transition: background 0.12s; }
    .fmd-struct-table tbody tr:last-child { border-bottom: none; }
    .fmd-struct-table tbody tr:hover { background: #fafafe; }
    .fmd-struct-table td { padding: 14px 20px; vertical-align: middle; }
    .fmd-struct-name { font-size: 13.5px; font-weight: 700; color: #0f172a; }
    .fmd-struct-course { font-size: 12px; color: #64748b; font-weight: 500; }
    .fmd-struct-amount { font-size: 14px; font-weight: 900; color: #4f46e5; }
    .fmd-struct-badge {
        display: inline-flex; align-items: center; gap: 5px;
        padding: 4px 11px; border-radius: 20px; font-size: 11px; font-weight: 700;
    }
    .fmd-struct-badge.active { background: #ecfdf5; color: #065f46; }
    .fmd-struct-badge.inactive { background: #f1f5f9; color: #64748b; }
    .fmd-struct-dot { width: 6px; height: 6px; border-radius: 50%; }
    .active .fmd-struct-dot { background: #10b981; }
    .inactive .fmd-struct-dot { background: #94a3b8; }
    .fmd-struct-view-btn {
        display: inline-flex; align-items: center; gap: 5px;
        padding: 6px 14px; border-radius: 9px;
        border: 1.5px solid #e5e7eb; background: #fff;
        font-size: 12px; font-weight: 700; color: #64748b; cursor: pointer;
        transition: all 0.15s;
    }
    .fmd-struct-view-btn:hover { background: #eef2ff; border-color: #c7d2fe; color: #4f46e5; }

    /* ── Ledger tab ── */
    .fmd-ledger-search-card {
        background: #fff; border-radius: 20px;
        border: 1.5px solid #e5e7eb;
        box-shadow: 0 1px 4px rgba(0,0,0,0.05);
        padding: 28px 32px; margin-bottom: 24px;
    }
    .fmd-ledger-search-title { font-size: 16px; font-weight: 800; color: #0f172a; margin: 0 0 4px; }
    .fmd-ledger-search-sub { font-size: 13px; color: #64748b; font-weight: 500; margin: 0 0 20px; }
    .fmd-search-row { display: flex; gap: 12px; }
    .fmd-search-inp-wrap { position: relative; flex: 1; max-width: 500px; }
    .fmd-search-ico { position: absolute; left: 14px; top: 50%; transform: translateY(-50%); color: #94a3b8; pointer-events: none; }
    .fmd-search-inp {
        width: 100%; background: #f8fafc; border: 1.5px solid #e2e8f0;
        border-radius: 12px; padding: 11px 14px 11px 40px;
        font-size: 14px; font-weight: 500; color: #0f172a; outline: none;
        transition: all 0.2s; box-sizing: border-box;
    }
    .fmd-search-inp:focus { border-color: #6366f1; background: #fff; box-shadow: 0 0 0 3px rgba(99,102,241,0.12); }
    .fmd-search-btn {
        display: inline-flex; align-items: center; gap: 8px;
        background: linear-gradient(135deg, #6366f1, #4f46e5); color: #fff;
        border: none; border-radius: 12px; padding: 11px 22px;
        font-size: 13.5px; font-weight: 700; cursor: pointer;
        box-shadow: 0 4px 12px rgba(99,102,241,0.35); transition: all 0.2s; white-space: nowrap;
    }
    .fmd-search-btn:hover:not(:disabled) { transform: translateY(-1px); box-shadow: 0 8px 20px rgba(99,102,241,0.45); }
    .fmd-search-btn:disabled { opacity: 0.7; cursor: not-allowed; }
    .fmd-search-spin { width: 14px; height: 14px; border-radius: 50%; border: 2px solid rgba(255,255,255,0.3); border-top-color: #fff; animation: fmdSpin 0.6s linear infinite; }

    /* ── Ledger empty state ── */
    .fmd-ledger-empty {
        background: #fff; border-radius: 20px; border: 1.5px solid #e5e7eb;
        display: flex; flex-direction: column; align-items: center;
        padding: 72px 24px; text-align: center;
        box-shadow: 0 1px 4px rgba(0,0,0,0.04);
    }
    .fmd-ledger-empty-icon {
        width: 72px; height: 72px; border-radius: 20px; background: #eef2ff;
        display: flex; align-items: center; justify-content: center; color: #6366f1; margin-bottom: 16px;
    }
    .fmd-ledger-empty h3 { font-size: 18px; font-weight: 800; color: #1e293b; margin: 0 0 8px; }
    .fmd-ledger-empty p { font-size: 13.5px; color: #64748b; margin: 0; max-width: 300px; line-height: 1.6; }

    /* ── Ledger result ── */
    .fmd-ledger-result-hdr {
        display: flex; justify-content: flex-end; margin-bottom: 16px;
    }
    .fmd-refresh-btn {
        display: inline-flex; align-items: center; gap: 7px;
        background: #fff; border: 1.5px solid #e5e7eb; border-radius: 10px;
        padding: 8px 16px; font-size: 13px; font-weight: 700; color: #64748b;
        cursor: pointer; transition: all 0.15s;
    }
    .fmd-refresh-btn:hover { background: #f8fafc; color: #4f46e5; border-color: #c7d2fe; }

    /* ── Misc ── */
    @keyframes fmdSpin { to { transform: rotate(360deg); } }
    @keyframes fmdUp { from { opacity:0; transform: translateY(12px); } to { opacity:1; transform: none; } }
    .fmd-anim { animation: fmdUp 0.32s cubic-bezier(0.4,0,0.2,1) both; }

    @media (max-width: 768px) {
        .fmd-hero { padding: 22px; flex-direction: column; }
        .fmd-tabs-wrap { padding: 0 16px; overflow-x: auto; }
        .fmd-body { padding: 20px 16px; }
        .fmd-hero-right { width: 100%; flex-wrap: wrap; }
        .fmd-hero-btn { flex: 1; justify-content: center; }
    }
`;

const TABS = [
    { id: 'config', label: 'Fee Configuration', icon: Settings },
    { id: 'ledger', label: 'Student Ledgers', icon: Users },
    { id: 'early-pay', label: 'Early Payment', icon: FileText },
    { id: 'payments', label: 'Payment History', icon: CreditCard },
    { id: 'audit', label: 'Audit Log', icon: Activity },
    { id: 'settings', label: 'Settings', icon: SlidersHorizontal },
];

export default function FeeManagementDashboard() {
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState('config');

    // Ledger state
    const [allocationIdInput, setAllocationIdInput] = useState('');
    const [allocationData, setAllocationData] = useState(null);
    const [installmentsData, setInstallmentsData] = useState([]);
    const [isFetchingLedger, setIsFetchingLedger] = useState(false);
    const [allAllocations, setAllAllocations] = useState([]);
    const [allStructures, setAllStructures] = useState([]);
    const [showPaymentModal, setShowPaymentModal] = useState(false);

    // Filter state
    const [courses, setCourses] = useState([]);
    const [batches, setBatches] = useState([]);
    const [selectedCourseId, setSelectedCourseId] = useState('');
    const [selectedBatchId, setSelectedBatchId] = useState('');

    // Multi-installment selection for Early Payment
    const [selectedInstallmentIds, setSelectedInstallmentIds] = useState([]);
    const [showEarlyPaymentModal, setShowEarlyPaymentModal] = useState(false);

    useEffect(() => {
        const fetchBaseData = async () => {
            try {
                const [allocs, structs, coursedata] = await Promise.all([
                    feeApi.getAllFeeAllocations(),
                    feeApi.getAllFeeStructures(),
                    courseService.getCourses().catch(() => [])
                ]);
                setAllAllocations(allocs || []);
                setAllStructures(structs || []);
                setCourses(Array.isArray(coursedata) ? coursedata : (coursedata?.data || []));
            } catch (err) {
                console.error('Dashboard initial load err:', err);
            }
        };
        fetchBaseData();
    }, []);

    useEffect(() => {
        const fetchBatches = async () => {
            if (!selectedCourseId) {
                setBatches([]);
                setSelectedBatchId('');
                return;
            }
            try {
                const data = await batchService.getBatchesByCourseId(selectedCourseId);
                setBatches(Array.isArray(data) ? data : (data?.data || []));
            } catch (err) {
                console.error("Failed to load batches", err);
                setBatches([]);
            }
        };
        fetchBatches();
    }, [selectedCourseId]);

    const loadLedger = async (id) => {
        if (!id) return;
        setIsFetchingLedger(true);
        try {
            const alloc = await feeApi.getStudentAllocation(id);
            const insts = await feeApi.getStudentInstallments(id);
            setAllocationData(alloc);
            setInstallmentsData(insts);
        } catch {
            alert('Ledger not found or API error.');
            setAllocationData(null);
            setInstallmentsData([]);
        } finally {
            setIsFetchingLedger(false);
        }
    };

    const handleSearchSubmit = (e) => {
        e.preventDefault();
        const term = allocationIdInput.trim();
        if (!term) return;

        if (!isNaN(term)) {
            loadLedger(term);
        } else {
            const found = allAllocations.find(a =>
                a.studentName?.toLowerCase().includes(term.toLowerCase()) ||
                a.studentEmail?.toLowerCase().includes(term.toLowerCase())
            );
            if (found) {
                loadLedger(found.allocationId);
            } else {
                // Instead of alert, we let the "No matching students" UI handle it
                setAllocationData(null);
                setInstallmentsData([]);
            }
        }
    };

    const refreshLedger = () => {
        if (allocationData?.id) loadLedger(allocationData.id);
        setSelectedInstallmentIds([]);
    };

    const toggleInstallmentSelection = (id) => {
        setSelectedInstallmentIds(prev =>
            prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
        );
    };

    return (
        <>
            <style>{CSS}</style>
            <div className="fmd-page">

                {/* ── Hero Banner ── */}
                <div className="fmd-hero">
                    <div className="fmd-hero-left">
                        <div className="fmd-eyebrow">
                            <IndianRupee size={11} /> Finance Module
                        </div>
                        <h1>Fee Management Console</h1>
                        <p>Configure base structures and manage individual student ledgers cleanly and securely</p>
                    </div>
                    <div className="fmd-hero-right">
                        <button className="fmd-hero-btn ghost" onClick={() => navigate('/admin/fee-types')}>
                            <Tag size={15} /> Manage Fee Types
                        </button>
                        <button className="fmd-hero-btn primary" onClick={() => navigate('/admin/fee-structures')}>
                            <Layers size={15} /> All Structures <ArrowUpRight size={14} />
                        </button>
                    </div>
                </div>

                {/* ── Tab Bar ── */}
                <div className="fmd-tabs-wrap">
                    <ul className="fmd-tabs">
                        {TABS.map(tab => {
                            const Icon = tab.icon;
                            return (
                                <li key={tab.id}>
                                    <button
                                        className={`fmd-tab-btn ${activeTab === tab.id ? 'active' : ''}`}
                                        onClick={() => setActiveTab(tab.id)}
                                    >
                                        <Icon size={15} className="fmd-tab-icon" />
                                        {tab.label}
                                    </button>
                                </li>
                            );
                        })}
                    </ul>
                </div>

                {/* ── Tab Content ── */}
                <div className="fmd-body">

                    {/* Config Tab */}
                    {activeTab === 'config' && (
                        <div className="fmd-anim">
                            <FeeConfigForm />

                            {/* Recent Structures */}
                            <div className="fmd-struct-card">
                                <div className="fmd-struct-hdr">
                                    <div>
                                        <div className="fmd-struct-title">Recent Fee Structures</div>
                                    </div>
                                    <button className="fmd-view-all" onClick={() => navigate('/admin/fee-structures')}>
                                        View all <ChevronRight size={14} />
                                    </button>
                                </div>
                                <table className="fmd-struct-table">
                                    <thead>
                                        <tr>
                                            <th>Structure Name</th>
                                            <th>Course</th>
                                            <th>Total Amount</th>
                                            <th>Status</th>
                                            <th style={{ textAlign: 'right' }}>Action</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {allStructures.slice(-5).reverse().map(s => (
                                            <tr key={s.id}>
                                                <td>
                                                    <div className="fmd-struct-name">{s.name}</div>
                                                </td>
                                                <td>
                                                    <div className="fmd-struct-course">{s.courseName || '—'}</div>
                                                </td>
                                                <td>
                                                    <div className="fmd-struct-amount">₹{(s.totalAmount || 0).toLocaleString()}</div>
                                                </td>
                                                <td>
                                                    <span className={`fmd-struct-badge ${s.isActive !== false ? 'active' : 'inactive'}`}>
                                                        <span className="fmd-struct-dot" />
                                                        {s.isActive !== false ? 'Active' : 'Draft'}
                                                    </span>
                                                </td>
                                                <td style={{ textAlign: 'right' }}>
                                                    <button
                                                        className="fmd-struct-view-btn"
                                                        onClick={() => navigate(`/admin/fee-structures/${s.id}`)}
                                                    >
                                                        <Eye size={13} /> View
                                                    </button>
                                                </td>
                                            </tr>
                                        ))}
                                        {allStructures.length === 0 && (
                                            <tr>
                                                <td colSpan="5" style={{ padding: '40px', textAlign: 'center', color: '#94a3b8', fontWeight: 600, fontSize: 13 }}>
                                                    No structures created yet.
                                                </td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}

                    {/* Ledger Tab */}
                    {activeTab === 'ledger' && (
                        <div className="fmd-anim">
                            <div className="fmd-ledger-search-card">
                                <div className="fmd-ledger-search-title">Student Fee Ledger</div>
                                <div className="fmd-ledger-search-sub">Search by student name, email or filter by course and batch</div>
                                <div className="row g-3 mb-3">
                                    <div className="col-md-6">
                                        <label className="form-label small fw-bold text-muted text-uppercase">Course</label>
                                        <select
                                            className="form-select bg-light border-0 py-2"
                                            value={selectedCourseId}
                                            onChange={e => setSelectedCourseId(e.target.value)}
                                        >
                                            <option value="">All Courses</option>
                                            {courses.map(c => (
                                                <option key={c.id || c.courseId} value={c.id || c.courseId}>{c.courseName || c.name || c.title}</option>
                                            ))}
                                        </select>
                                    </div>
                                    <div className="col-md-6">
                                        <label className="form-label small fw-bold text-muted text-uppercase">Batch</label>
                                        <select
                                            className="form-select bg-light border-0 py-2"
                                            value={selectedBatchId}
                                            onChange={e => setSelectedBatchId(e.target.value)}
                                            disabled={!selectedCourseId}
                                        >
                                            <option value="">All Batches</option>
                                            {batches.map(b => (
                                                <option key={b.id || b.batchId} value={b.id || b.batchId}>{b.batchName || b.name}</option>
                                            ))}
                                        </select>
                                    </div>
                                </div>
                                <form onSubmit={handleSearchSubmit} className="fmd-search-row">
                                    <div className="fmd-search-inp-wrap">
                                        <Search className="fmd-search-ico" size={15} />
                                        <input
                                            type="text"
                                            value={allocationIdInput}
                                            onChange={e => setAllocationIdInput(e.target.value)}
                                            className="fmd-search-inp"
                                            placeholder="Student name, email, or allocation ID…"
                                        />
                                    </div>
                                    <button type="submit" disabled={isFetchingLedger} className="fmd-search-btn">
                                        {isFetchingLedger
                                            ? <><span className="fmd-search-spin" /> Searching…</>
                                            : <><Search size={14} /> Find Ledger</>}
                                    </button>
                                </form>

                                {/* Matching Students List */}
                                {(selectedCourseId || selectedBatchId || (allocationIdInput.trim().length >= 2)) && !allocationData && (
                                    <div className="mt-4 border-top pt-3 fmd-anim">
                                        <div className="d-flex justify-content-between align-items-center mb-2">
                                            <div className="small fw-bold text-muted text-uppercase">Matching Students</div>
                                            <div style={{ fontSize: 11, color: '#94a3b8' }}>
                                                {allAllocations.filter(a => {
                                                    const matchCourse = !selectedCourseId || String(a.courseId) === String(selectedCourseId);
                                                    const matchBatch = !selectedBatchId || String(a.batchId) === String(selectedBatchId);
                                                    const matchName = !allocationIdInput ||
                                                        a.studentName?.toLowerCase().includes(allocationIdInput.toLowerCase()) ||
                                                        a.studentEmail?.toLowerCase().includes(allocationIdInput.toLowerCase()) ||
                                                        String(a.allocationId).includes(allocationIdInput);
                                                    return matchCourse && matchBatch && matchName;
                                                }).length} Results
                                            </div>
                                        </div>
                                        <div className="list-group list-group-flush border rounded-3 overflow-hidden shadow-sm">
                                            {allAllocations
                                                .filter(a => {
                                                    const matchCourse = !selectedCourseId || String(a.courseId) === String(selectedCourseId);
                                                    const matchBatch = !selectedBatchId || String(a.batchId) === String(selectedBatchId);
                                                    const matchName = !allocationIdInput ||
                                                        a.studentName?.toLowerCase().includes(allocationIdInput.toLowerCase()) ||
                                                        a.studentEmail?.toLowerCase().includes(allocationIdInput.toLowerCase()) ||
                                                        String(a.allocationId).includes(allocationIdInput);
                                                    return matchCourse && matchBatch && matchName;
                                                })
                                                .slice(0, 10)
                                                .map(a => (
                                                    <button
                                                        key={a.allocationId}
                                                        className="list-group-item list-group-item-action border-0 px-3 py-2 d-flex justify-content-between align-items-center"
                                                        onClick={() => {
                                                            setAllocationIdInput(String(a.allocationId));
                                                            loadLedger(a.allocationId);
                                                        }}
                                                    >
                                                        <div>
                                                            <div className="fw-bold small text-dark">{a.studentName}</div>
                                                            <div className="text-muted smaller" style={{ fontSize: 11 }}>
                                                                {a.studentEmail} • <span className="text-primary">{a.batchName}</span>
                                                            </div>
                                                        </div>
                                                        <div className="d-flex align-items-center gap-2">
                                                            <div style={{ fontSize: 10, background: '#f8fafc', border: '1px solid #e2e8f0', color: '#64748b', padding: '2px 6px', borderRadius: 4 }}>
                                                                ID: {a.allocationId}
                                                            </div>
                                                            <ChevronRight size={14} className="text-muted" />
                                                        </div>
                                                    </button>
                                                ))
                                            }
                                            {allAllocations.filter(a => {
                                                const matchCourse = !selectedCourseId || String(a.courseId) === String(selectedCourseId);
                                                const matchBatch = !selectedBatchId || String(a.batchId) === String(selectedBatchId);
                                                const matchName = !allocationIdInput ||
                                                    a.studentName?.toLowerCase().includes(allocationIdInput.toLowerCase()) ||
                                                    a.studentEmail?.toLowerCase().includes(allocationIdInput.toLowerCase());
                                                return matchCourse && matchBatch && matchName;
                                            }).length === 0 && (
                                                    <div key="no-match" className="p-4 text-center text-muted border-0 glass-card">
                                                        <Search size={24} style={{ opacity: 0.2, marginBottom: 8 }} />
                                                        <div style={{ fontSize: 13, fontWeight: 600 }}>No students found matching your criteria</div>
                                                        <div style={{ fontSize: 12, opacity: 0.7 }}>Try adjusting the filters or search term</div>
                                                    </div>
                                                )}
                                        </div>
                                    </div>
                                )}
                            </div>

                            {allocationData ? (
                                <div>
                                    <div className="fmd-ledger-result-hdr">
                                        <button className="fmd-refresh-btn" onClick={refreshLedger}>
                                            <RefreshCw size={13} /> Refresh Ledger
                                        </button>
                                    </div>
                                    <StudentFeeSummary
                                        allocation={allocationData}
                                        onPaymentClick={() => setShowPaymentModal(true)}
                                    />
                                    <div className="fmd-struct-card" style={{ marginTop: 20 }}>
                                        <div className="fmd-struct-hdr d-flex justify-content-between align-items-center">
                                            <div className="fmd-struct-title">Installment Schedule</div>
                                            {selectedInstallmentIds.length >= 2 && (
                                                <button
                                                    className="fmd-search-btn btn-sm py-1 px-3 d-flex align-items-center gap-2"
                                                    onClick={() => setShowEarlyPaymentModal(true)}
                                                >
                                                    <Link size={14} /> Generate Early Payment Link (₹{
                                                        installmentsData
                                                            .filter(i => selectedInstallmentIds.includes(i.id))
                                                            .reduce((s, i) => s + ((i.amount || i.installmentAmount || 0) - (i.paidAmount || 0)), 0)
                                                            .toLocaleString()
                                                    })
                                                </button>
                                            )}
                                        </div>
                                        <div style={{ padding: 0 }}>
                                            <InstallmentTable
                                                isEditMode={false}
                                                installments={installmentsData}
                                                actions={{}}
                                                selectedIds={selectedInstallmentIds}
                                                onToggleSelect={toggleInstallmentSelection}
                                            />
                                        </div>
                                    </div>
                                </div>
                            ) : (
                                <div className="fmd-ledger-empty">
                                    <div className="fmd-ledger-empty-icon">
                                        <Users size={32} />
                                    </div>
                                    <h3>No Ledger Selected</h3>
                                    <p>Search for a student above to view and manage their fee records, installments, and payment history.</p>
                                </div>
                            )}
                        </div>
                    )}

                    {/* Early Payment Tab */}
                    {activeTab === 'early-pay' && (
                        <div className="fmd-anim">
                            <EarlyPaymentLinkManager />
                        </div>
                    )}

                    {/* Payments Tab */}
                    {activeTab === 'payments' && (
                        <div className="fmd-anim">
                            <FeePayments />
                        </div>
                    )}

                    {/* Audit Tab */}
                    {activeTab === 'audit' && (
                        <div className="fmd-anim">
                            <FeeAuditLogs />
                        </div>
                    )}

                    {/* Settings Tab */}
                    {activeTab === 'settings' && (
                        <div className="fmd-anim">
                            <FeeSettingsPage />
                        </div>
                    )}
                </div>

                {/* Payment Modal */}
                {showPaymentModal && allocationData && (
                    <PaymentForm
                        allocationId={allocationData.id}
                        rmi={Math.max(0, (allocationData.originalTotalAmount - allocationData.totalDiscount + allocationData.totalPenaltyApplied) - allocationData.paidAmount)}
                        onClose={() => setShowPaymentModal(false)}
                        onSuccess={() => { refreshLedger(); }}
                    />
                )}

                {/* Early Payment Modal */}
                {showEarlyPaymentModal && allocationData && (
                    <EarlyPaymentModal
                        isOpen={showEarlyPaymentModal}
                        onClose={() => setShowEarlyPaymentModal(false)}
                        onSuccess={(data) => {
                            console.log('Early Payment Link Generated:', data);
                            refreshLedger();
                        }}
                        studentId={allocationData.userId || allocationData.studentId}
                        selectedInstallments={installmentsData.filter(i =>
                            selectedInstallmentIds.some(sid => String(sid) === String(i.id))
                        )}
                    />
                )}
            </div>
        </>
    );
}
