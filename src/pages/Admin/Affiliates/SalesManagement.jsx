import React, { useState, useEffect } from 'react';
import affiliateService from '../../../services/affiliateService';
import { FiCheckCircle, FiXCircle, FiDollarSign, FiDownload } from 'react-icons/fi';

const SalesManagement = () => {
    const [sales, setSales] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchSales();
    }, []);

    const fetchSales = async () => {
        try {
            const data = await affiliateService.getAllSales();
            setSales(data || []);
            setLoading(false);
        } catch (error) {
            console.error('Error fetching sales:', error);
            setSales([]);
            setLoading(false);
        }
    };

    const handleApprove = async (id) => {
        if (!window.confirm('Approve this commission and credit the affiliate wallet?')) return;
        try {
            await affiliateService.approveSale(id, 'ADMIN');
            alert('Commission approved!');
            fetchSales();
        } catch (error) {
            alert('Error approving commission');
        }
    };

    const handlePay = async (id) => {
        const refId = prompt('Enter Payment Reference ID:');
        if (!refId) return;
        try {
            await affiliateService.markSaleAsPaid(id, refId);
            alert('Marked as PAID!');
            fetchSales();
        } catch (error) {
            alert('Error marking as paid');
        }
    };

    const handleCancel = async (id) => {
        const reason = prompt('Reason for cancellation:');
        if (!reason) return;
        try {
            await affiliateService.cancelSale(id, reason);
            alert('Sale cancelled and commission reversed.');
            fetchSales();
        } catch (error) {
            alert('Error cancelling sale');
        }
    };

    const handleExport = async () => {
        window.open('/api/admin/sales/export', '_blank');
    };

    if (loading) return <div className="p-5 text-center">Loading Financial Data...</div>;

    return (
        <div className="container-fluid py-4">
            <header className="d-flex flex-column flex-md-row justify-content-between align-items-start align-items-md-center gap-3 mb-4">
                <div>
                    <h1 className="h3 mb-1">Commission & Payout Management</h1>
                    <p className="text-muted">Approve, Pay, or Reverse affiliate earnings.</p>
                </div>
                <button className="btn btn-outline-success" onClick={handleExport}>
                    <FiDownload className="me-2" /> Export Sales CSV
                </button>
            </header>

            <div className="card shadow-sm border-0">
                <div className="card-body p-0">
                    <div className="table-responsive">
                        <table className="table table-hover align-middle mb-0">
                            <thead className="table-light">
                                <tr>
                                    <th>Order Info</th>
                                    <th>Affiliate</th>
                                    <th>Financials</th>
                                    <th>Commission</th>
                                    <th>Status</th>
                                    <th className="text-end">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {(Array.isArray(sales) ? sales : []).map(sale => (
                                    <tr key={sale.id}>
                                        <td>
                                            <div className="fw-bold">{sale.orderId}</div>
                                            <small className="text-muted">Batch: #{sale.batchId}</small>
                                        </td>
                                        <td>
                                            <span className="badge bg-secondary">AFF-{sale.affiliateId}</span>
                                        </td>
                                        <td>
                                            <div className="small">
                                                <span className="text-muted text-decoration-line-through">₹{sale.originalAmount}</span>
                                                <span className="ms-2 fw-bold text-success">₹{sale.orderAmount}</span>
                                            </div>
                                            <small className="text-danger">Disc: ₹{sale.discountAmount}</small>
                                        </td>
                                        <td>
                                            <div className="fw-bold text-blue">₹{sale.commissionAmount}</div>
                                        </td>
                                        <td>
                                            <span className={`badge ${getStatusBadge(sale.status)}`}>
                                                {sale.status}
                                            </span>
                                        </td>
                                        <td className="text-end">
                                            <div className="d-flex gap-2 justify-content-end">
                                                {sale.status === 'PENDING' && (
                                                    <button
                                                        className="btn btn-success btn-sm"
                                                        onClick={() => handleApprove(sale.id)}
                                                        title="Approve Commission"
                                                    >
                                                        <FiCheckCircle /> Approve
                                                    </button>
                                                )}
                                                {sale.status === 'APPROVED' && (
                                                    <button
                                                        className="btn btn-primary btn-sm"
                                                        onClick={() => handlePay(sale.id)}
                                                        title="Mark as Paid"
                                                    >
                                                        <FiDollarSign /> Pay
                                                    </button>
                                                )}
                                                {sale.status !== 'CANCELLED' && (
                                                    <button
                                                        className="btn btn-outline-danger btn-sm"
                                                        onClick={() => handleCancel(sale.id)}
                                                        title="Cancel & Reverse"
                                                    >
                                                        <FiXCircle />
                                                    </button>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    );
};

const getStatusBadge = (status) => {
    switch (status) {
        case 'PENDING': return 'bg-warning text-dark';
        case 'APPROVED': return 'bg-info text-dark';
        case 'PAID': return 'bg-success';
        case 'CANCELLED': return 'bg-danger';
        default: return 'bg-light text-dark';
    }
}

export default SalesManagement;
