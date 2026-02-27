import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import FeeConfigForm from '../components/FeeConfigForm';
import StudentFeeSummary from '../components/StudentFeeSummary';
import InstallmentTable from '../components/InstallmentTable';
import PaymentForm from '../components/PaymentForm';
import { feeApi } from '../api/feeApi';
import { FiSettings, FiUsers, FiSearch, FiRefreshCw } from 'react-icons/fi';

export default function FeeManagementDashboard() {
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState('config'); // 'config' | 'ledger'

    // Ledger State
    const [allocationIdInput, setAllocationIdInput] = useState('');
    const [allocationData, setAllocationData] = useState(null);
    const [installmentsData, setInstallmentsData] = useState([]);
    const [isFetchingLedger, setIsFetchingLedger] = useState(false);

    // Modal State
    const [showPaymentModal, setShowPaymentModal] = useState(false);

    // Fetch Student Ledger
    const loadLedger = async (id) => {
        if (!id) return;
        setIsFetchingLedger(true);
        try {
            const alloc = await feeApi.getStudentAllocation(id);
            const insts = await feeApi.getStudentInstallments(id);
            setAllocationData(alloc);
            setInstallmentsData(insts);
        } catch (error) {
            console.error("Failed to fetch ledger", error);
            alert("Ledger not found or API error.");
            setAllocationData(null);
            setInstallmentsData([]);
        } finally {
            setIsFetchingLedger(false);
        }
    };

    const handleSearchSubmit = (e) => {
        e.preventDefault();
        loadLedger(allocationIdInput);
    };

    const refreshLedger = () => {
        if (allocationData?.id) loadLedger(allocationData.id);
    };

    return (
        <div className="container-fluid bg-light min-vh-100 py-4">
            <div className="container-lg">

                {/* Dashboard Header */}
                <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center mb-4">
                    <div>
                        <h2 className="h3 fw-bold text-dark mb-1">
                            Fee Management Console
                        </h2>
                        <p className="text-secondary small mb-0">
                            Configure base structures and manage individual student ledgers cleanly and securely.
                        </p>
                    </div>
                    <div className="d-flex gap-2 mt-3 mt-md-0">
                        <button
                            onClick={() => navigate('/admin/fee-types')}
                            className="btn btn-white border shadow-sm fw-medium text-dark d-flex align-items-center px-4"
                        >
                            Manage Fee Types
                        </button>
                        <button
                            onClick={() => navigate('/admin/fee-structures')}
                            className="btn btn-white border shadow-sm fw-medium text-dark d-flex align-items-center px-4"
                        >
                            View All Structures
                        </button>
                    </div>
                </div>

                {/* Navigation Tabs */}
                <div className="mb-4">
                    <ul className="nav nav-pills bg-white p-1 rounded-pill shadow-sm d-inline-flex border">
                        <li className="nav-item">
                            <button
                                onClick={() => setActiveTab('config')}
                                className={`nav-link rounded-pill px-4 py-2 d-flex align-items-center gap-2 fw-medium ${activeTab === 'config' ? 'active shadow-sm' : 'text-secondary bg-transparent'}`}
                            >
                                <FiSettings /> Fee Configuration (Admin)
                            </button>
                        </li>
                        <li className="nav-item">
                            <button
                                onClick={() => setActiveTab('ledger')}
                                className={`nav-link rounded-pill px-4 py-2 d-flex align-items-center gap-2 fw-medium ${activeTab === 'ledger' ? 'active shadow-sm' : 'text-secondary bg-transparent'}`}
                            >
                                <FiUsers /> Student Ledgers
                            </button>
                        </li>
                    </ul>
                </div>

                {/* Tab Rendering */}
                <div className="mt-6">
                    {activeTab === 'config' && (
                        <div className="animate-fade-in-up">
                            <FeeConfigForm />
                        </div>
                    )}

                    {activeTab === 'ledger' && (
                        <div className="container-fluid px-0 animate-fade-in-up">

                            {/* Search Bar */}
                            <form onSubmit={handleSearchSubmit} className="mb-4 d-flex gap-3" style={{ maxWidth: '600px' }}>
                                <div className="input-group shadow-sm">
                                    <span className="input-group-text bg-white border-end-0 text-muted">
                                        <FiSearch />
                                    </span>
                                    <input
                                        type="number"
                                        min="1"
                                        required
                                        value={allocationIdInput}
                                        onChange={(e) => setAllocationIdInput(e.target.value)}
                                        className="form-control border-start-0 ps-0"
                                        placeholder="Enter Allocation ID (e.g., 1)"
                                    />
                                </div>
                                <button
                                    type="submit"
                                    disabled={isFetchingLedger}
                                    className="btn btn-primary px-4 shadow-sm fw-medium text-nowrap"
                                >
                                    {isFetchingLedger ? 'Loading...' : 'Find Ledger'}
                                </button>
                            </form>

                            {/* Active Ledger Display */}
                            {allocationData ? (
                                <div className="d-flex flex-column gap-4">
                                    <div className="d-flex justify-content-end">
                                        <button
                                            onClick={refreshLedger}
                                            className="btn btn-link text-decoration-none fw-medium d-flex align-items-center gap-1 p-0 text-primary"
                                        >
                                            <FiRefreshCw /> Refresh Ledger
                                        </button>
                                    </div>

                                    {/* The Dynamic Summary */}
                                    <StudentFeeSummary
                                        allocation={allocationData}
                                        onPaymentClick={() => setShowPaymentModal(true)}
                                    />

                                    {/* The Installments Data Table */}
                                    <div className="card border-0 shadow-sm rounded-4 overflow-hidden">
                                        <div className="card-header bg-white border-bottom-0 pt-4 px-4 pb-0">
                                            <h5 className="h5 fw-bold text-dark mb-3">
                                                Installment Schedule
                                            </h5>
                                        </div>
                                        <div className="card-body p-0">
                                            <InstallmentTable
                                                isEditMode={false}
                                                installments={installmentsData}
                                                actions={{}}
                                            />
                                        </div>
                                    </div>
                                </div>
                            ) : (
                                <div className="card border p-5 text-center shadow-sm rounded-4 bg-white mt-5">
                                    <div className="mx-auto bg-light rounded-circle d-flex align-items-center justify-content-center mb-3" style={{ width: '80px', height: '80px' }}>
                                        <FiUsers className="text-secondary" size={32} />
                                    </div>
                                    <h4 className="fw-bold text-dark mb-2">No Ledger Selected</h4>
                                    <p className="text-secondary mb-0">Enter a Student Allocation ID to view and manage their fees.</p>
                                </div>
                            )}

                        </div>
                    )}
                </div>

                {/* Modals */}
                {showPaymentModal && allocationData && (
                    <PaymentForm
                        allocationId={allocationData.id}
                        // Dynamic read-only RMI execution matching StudentFeeSummary
                        rmi={Math.max(0, (allocationData.originalTotalAmount - allocationData.totalDiscount + allocationData.totalPenaltyApplied) - allocationData.paidAmount)}
                        onClose={() => setShowPaymentModal(false)}
                        onSuccess={() => {
                            refreshLedger(); // Refetch Ledger aggressively after payment
                        }}
                    />
                )}

            </div>
        </div>
    );
}
