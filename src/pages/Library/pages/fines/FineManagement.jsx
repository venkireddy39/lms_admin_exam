import React, { useState, useEffect } from 'react';
import { DollarSign, User, Calendar, CheckCircle, Clock, Filter, Search } from 'lucide-react';
import { libraryService } from '../../services/libraryService';
import { useToast } from '../../context/ToastContext';

const FineManagement = () => {
    const toast = useToast();
    const [fines, setFines] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filterStatus, setFilterStatus] = useState('ALL');
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        loadFines();
    }, []);

    const loadFines = async () => {
        setLoading(true);
        try {
            const data = await libraryService.fines.getAllFines();
            setFines(Array.isArray(data) ? data : []);
        } catch (err) {
            console.error(err);
            toast.error('Failed to load fines');
        } finally {
            setLoading(false);
        }
    };

    const handlePayFine = async (fineId) => {
        if (!window.confirm('Mark this fine as paid?')) return;

        try {
            await libraryService.fines.payFine(fineId);
            toast.success('Fine marked as paid');
            loadFines();
        } catch (err) {
            console.error(err);
            toast.error('Failed to update fine status');
        }
    };

    const filteredFines = fines.filter(fine => {
        const matchesStatus = filterStatus === 'ALL' || fine.paidStatus === filterStatus;
        const matchesSearch =
            (fine.issueRecord?.book?.title || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
            fine.userId.toString().includes(searchTerm);
        return matchesStatus && matchesSearch;
    });

    return (
        <div className="container-fluid p-4">
            <div className="d-flex justify-content-between align-items-center mb-4">
                <div>
                    <h2 className="h3 mb-1">Fine Management</h2>
                    <p className="text-muted">Track and collect library overdue charges</p>
                </div>
                <button className="btn btn-outline-secondary btn-sm" onClick={loadFines}>
                    Refresh Data
                </button>
            </div>

            <div className="card shadow-sm border-0 mb-4">
                <div className="card-body">
                    <div className="row g-3">
                        <div className="col-md-4">
                            <div className="input-group">
                                <span className="input-group-text bg-light border-end-0">
                                    <Search size={18} className="text-muted" />
                                </span>
                                <input
                                    type="text"
                                    className="form-control border-start-0 ps-0 shadow-none"
                                    placeholder="Search by book title or User ID..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                />
                            </div>
                        </div>
                        <div className="col-md-3">
                            <div className="input-group">
                                <span className="input-group-text bg-light">
                                    <Filter size={18} />
                                </span>
                                <select
                                    className="form-select shadow-none"
                                    value={filterStatus}
                                    onChange={(e) => setFilterStatus(e.target.value)}
                                >
                                    <option value="ALL">All Status</option>
                                    <option value="UNPAID">Unpaid</option>
                                    <option value="PAID">Paid</option>
                                </select>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="card shadow-sm border-0 overflow-hidden">
                <div className="table-responsive">
                    <table className="table table-hover align-middle mb-0">
                        <thead className="table-light">
                            <tr>
                                <th>Issue Record</th>
                                <th>User ID</th>
                                <th>Amount</th>
                                <th>Status</th>
                                <th>Due Date</th>
                                <th className="text-end">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                <tr>
                                    <td colSpan="6" className="text-center py-5">
                                        <div className="spinner-border spinner-border-sm text-primary me-2"></div>
                                        Loading fines...
                                    </td>
                                </tr>
                            ) : filteredFines.length === 0 ? (
                                <tr>
                                    <td colSpan="6" className="text-center py-5 text-muted">
                                        No fine records found.
                                    </td>
                                </tr>
                            ) : (
                                filteredFines.map(fine => (
                                    <tr key={fine.id}>
                                        <td>
                                            <div className="fw-bold">{fine.issueRecord?.book?.title || 'Unknown Book'}</div>
                                            <small className="text-muted">Issue ID: {fine.issueRecord?.id}</small>
                                        </td>
                                        <td>
                                            <div className="d-flex align-items-center">
                                                <User size={14} className="me-1 text-muted" />
                                                {fine.userId}
                                            </div>
                                        </td>
                                        <td>
                                            <span className="fw-bold text-danger">₹{fine.fineAmount}</span>
                                        </td>
                                        <td>
                                            <span className={`badge rounded-pill ${fine.paidStatus === 'PAID' ? 'bg-success' : 'bg-warning text-dark'}`}>
                                                {fine.paidStatus}
                                            </span>
                                        </td>
                                        <td>
                                            <div className="d-flex align-items-center small text-muted">
                                                <Clock size={14} className="me-1" />
                                                {fine.issueRecord?.dueDate || 'N/A'}
                                            </div>
                                        </td>
                                        <td className="text-end">
                                            {fine.paidStatus === 'UNPAID' && (
                                                <button
                                                    className="btn btn-sm btn-success d-inline-flex align-items-center"
                                                    onClick={() => handlePayFine(fine.id)}
                                                >
                                                    <DollarSign size={14} className="me-1" />
                                                    Collect
                                                </button>
                                            )}
                                            {fine.paidStatus === 'PAID' && (
                                                <CheckCircle size={20} className="text-success" />
                                            )}
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default FineManagement;
