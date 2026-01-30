import React, { useEffect, useMemo, useState } from 'react';
import {
    Search,
    CalendarClock,
    MoreVertical,
    XCircle,
    CheckCircle,
    Ban
} from 'lucide-react';
import { ReservationService, BookService, MemberService } from '../../services/api';
import { format, isPast, parseISO } from 'date-fns';
import '../books/BookList.css';

const ReservationList = () => {
    const [reservations, setReservations] = useState([]);
    const [resources, setResources] = useState([]);
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);

    const [searchTerm, setSearchTerm] = useState('');
    const [filterStatus, setFilterStatus] = useState('ACTIVE');

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        setLoading(true);
        try {
            const [resv, books, members] = await Promise.all([
                ReservationService.getAllReservations(),
                BookService.getAllResources(),
                MemberService.getAllMembers()
            ]);

            setReservations(resv);
            setResources(books);
            setUsers(members);
        } finally {
            setLoading(false);
        }
    };

    /* ---------- MAPS (PERFORMANCE FIX) ---------- */

    const resourceMap = useMemo(
        () => Object.fromEntries(resources.map(r => [r.id, r])),
        [resources]
    );

    const userMap = useMemo(
        () => Object.fromEntries(users.map(u => [u.id, u])),
        [users]
    );

    /* ---------- FILTER ---------- */

    const filteredReservations = useMemo(() => {
        const currentFilter = filterStatus; // Use state value

        return reservations.filter(r => {
            // Support both direct object (if backend sends populated) or ID mapping
            const resourceTitle = r.book?.title || resourceMap[r.book?.id || r.bookId]?.title || '';
            const userName = r.userId ? (userMap[r.userId]?.name || 'Unknown') : 'Unknown';
            const q = searchTerm.toLowerCase();

            const matchesSearch =
                resourceTitle.toLowerCase().includes(q) ||
                userName.toLowerCase().includes(q);

            // Logic for Expired: reserveUntil is past AND status is still RESERVED
            const isExpired = r.reserveUntil && isPast(parseISO(r.reserveUntil)) && r.status === 'RESERVED';

            if (currentFilter === 'ACTIVE')
                return matchesSearch && (r.status === 'RESERVED' || r.status === 'AVAILABLE') && !isExpired;

            if (currentFilter === 'EXPIRED')
                return matchesSearch && (isExpired || r.status === 'NO_RESPONSE');

            if (currentFilter === 'FULFILLED')
                return matchesSearch && (r.status === 'COLLECTED' || r.status === 'COMPLETED');

            if (currentFilter === 'REJECTED')
                return matchesSearch && (r.status === 'CANCELLED' || r.status === 'REJECTED');

            return matchesSearch;
        });
    }, [reservations, resourceMap, userMap, searchTerm, filterStatus]);

    /* ---------- ACTIONS ---------- */

    const cancelReservation = async (id) => {
        if (window.confirm('Are you sure you want to cancel this reservation?')) {
            await ReservationService.cancelReservation(id);
            loadData();
        }
    };

    const rejectReservation = async (id) => {
        // "Reject" in our new flow is basically Cancel
        if (window.confirm('Cancel this reservation?')) {
            await ReservationService.cancelReservation(id);
            loadData();
        }
    };

    const fulfillReservation = async (id) => {
        // Likely means "Issue Book" or "Mark Collected"
        await ReservationService.fulfillReservation(id);
        loadData();
    };

    /* ---------- STATUS ---------- */

    const getStatusBadge = (r) => {
        const isExpired = r.reserveUntil && isPast(parseISO(r.reserveUntil)) && r.status === 'RESERVED';

        if (r.status === 'COLLECTED' || r.status === 'COMPLETED')
            return <span className="badge bg-success">COLLECTED</span>;

        if (r.status === 'AVAILABLE')
            return <span className="badge bg-info text-dark">AVAILABLE FOR PICKUP</span>;

        if (r.status === 'CANCELLED' || r.status === 'REJECTED')
            return <span className="badge bg-secondary">CANCELLED</span>;

        if (isExpired || r.status === 'NO_RESPONSE')
            return <span className="badge bg-danger">EXPIRED</span>;

        return <span className="badge bg-warning text-dark">RESERVED</span>;
    };

    /* ---------- UI ---------- */

    return (
        <div className="container-fluid p-4">
            <div className="d-flex justify-content-between mb-4">
                <div>
                    <h3>Reservation Queue</h3>
                    <p className="text-muted">Manage waitlists for physical books</p>
                </div>
            </div>

            {/* FILTERS */}
            <div className="row g-3 mb-4">
                <div className="col-md-6">
                    <div className="input-group">
                        <span className="input-group-text">
                            <Search size={16} />
                        </span>
                        <input
                            className="form-control"
                            placeholder="Search book or member"
                            value={searchTerm}
                            onChange={e => setSearchTerm(e.target.value)}
                        />
                    </div>
                </div>

                <div className="col-md-3">
                    <select
                        className="form-select"
                        value={filterStatus}
                        onChange={e => setFilterStatus(e.target.value)}
                    >
                        <option value="ACTIVE">Active Queue</option>
                        <option value="FULFILLED">Collected</option>
                        <option value="REJECTED">Cancelled</option>
                        <option value="EXPIRED">Expired</option>
                        <option value="ALL">All</option>
                    </select>
                </div>
            </div>

            {/* TABLE */}
            <div className="table-responsive">
                <table className="table table-hover align-middle">
                    <thead className="table-light">
                        <tr>
                            <th>Book</th>
                            <th>Member</th>
                            <th>Reserved On</th>
                            <th>Available On</th>
                            <th>Valid Until</th>
                            <th>Status</th>
                            <th className="text-end">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {loading ? (
                            <tr><td colSpan="6" className="text-center">Loading...</td></tr>
                        ) : filteredReservations.length === 0 ? (
                            <tr><td colSpan="6" className="text-center text-muted">No reservations</td></tr>
                        ) : (
                            filteredReservations.map(r => {
                                // Resolve Book/User (handling nested objects vs IDs)
                                const resource = r.book ? r.book : resourceMap[r.bookId];
                                const user = userMap[r.userId];

                                const isExpired = r.reserveUntil && isPast(parseISO(r.reserveUntil)) && r.status === 'RESERVED';

                                return (
                                    <tr key={r.id || r.reservation_id} className={isExpired ? 'table-secondary' : ''}>
                                        <td>
                                            <div className="fw-medium">{resource?.title || 'Unknown Title'}</div>
                                            <div className="small text-muted">{resource?.author || ''}</div>
                                        </td>
                                        <td>
                                            <div>{user?.name || 'Unknown User'}</div>
                                            <div className="small text-muted">ID: {r.userId}</div>
                                        </td>
                                        <td>{r.reservedAt ? format(parseISO(r.reservedAt), 'dd MMM yyyy') : '-'}</td>
                                        <td>{r.adminHoldFrom ? format(parseISO(r.adminHoldFrom), 'dd MMM yyyy') : '-'}</td>
                                        <td>
                                            {r.reserveUntil ? format(parseISO(r.reserveUntil), 'dd MMM yyyy') : '-'}
                                        </td>
                                        <td>{getStatusBadge(r)}</td>
                                        <td className="text-end">
                                            {(r.status === 'RESERVED' || r.status === 'AVAILABLE') && !isExpired && (
                                                <div className="btn-group btn-group-sm">
                                                    <button
                                                        className="btn btn-outline-success"
                                                        onClick={() => fulfillReservation(r.id)}
                                                        title="Mark Collected"
                                                    >
                                                        <CheckCircle size={14} />
                                                    </button>
                                                    <button
                                                        className="btn btn-outline-danger"
                                                        onClick={() => cancelReservation(r.id)}
                                                        title="Cancel"
                                                    >
                                                        <XCircle size={14} />
                                                    </button>
                                                </div>
                                            )}
                                        </td>
                                    </tr>
                                );
                            })
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default ReservationList;
