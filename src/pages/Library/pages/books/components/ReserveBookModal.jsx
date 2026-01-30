import React, { useState, useEffect } from 'react';
import { Calendar, User, Search, Clock } from 'lucide-react';
import { ReservationService, MemberService } from '../../../services/api';
import { useToast } from '../../../context/ToastContext';

const ReserveBookModal = ({ book, onClose, onReserved }) => {
    const toast = useToast();
    const [members, setMembers] = useState([]);
    const [searchMember, setSearchMember] = useState('');
    const [selectedMember, setSelectedMember] = useState(null);
    const [loading, setLoading] = useState(false);
    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
        loadMembers();
    }, []);

    const loadMembers = async () => {
        setLoading(true);
        try {
            // Use MemberService to get normalized member data (includes 'id')
            const data = await MemberService.getAllMembers();
            setMembers(data);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleReserve = async () => {
        if (!selectedMember) {
            toast.error('Please select a member');
            return;
        }

        setSubmitting(true);
        try {
            // Using unified ReservationService
            const payload = {
                bookId: book.id,
                userId: selectedMember.id, // Normalized ID
                status: 'RESERVED'
            };
            await ReservationService.createReservation(payload);
            toast.success('Book reserved successfully');
            onReserved && onReserved();
            onClose();
        } catch (err) {
            console.error(err);
            toast.error('Failed to reserve book');
        } finally {
            setSubmitting(false);
        }
    };

    const filteredMembers = members.filter(m =>
        (m.name || '').toLowerCase().includes(searchMember.toLowerCase()) ||
        (m.email || '').toLowerCase().includes(searchMember.toLowerCase())
    );

    return (
        <div className="modal show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
            <div className="modal-dialog modal-dialog-centered">
                <div className="modal-content border-0 shadow">
                    <div className="modal-header bg-primary text-white">
                        <h5 className="modal-title d-flex align-items-center">
                            <Calendar className="me-2" size={20} />
                            Reserve Resource
                        </h5>
                        <button type="button" className="btn-close btn-close-white" onClick={onClose}></button>
                    </div>

                    <div className="modal-body">
                        <div className="mb-4">
                            <h6 className="fw-bold mb-1">{book.title}</h6>
                            <p className="text-muted small mb-0">{book.author}</p>
                            <span className="badge bg-danger rounded-pill mt-2">Currently Unavailable</span>
                        </div>

                        <div className="mb-3">
                            <label className="form-label fw-bold">Select Member</label>
                            <div className="input-group mb-2">
                                <span className="input-group-text bg-light border-end-0">
                                    <Search size={16} className="text-muted" />
                                </span>
                                <input
                                    type="text"
                                    className="form-control border-start-0 ps-0 shadow-none"
                                    placeholder="Search by name or email..."
                                    value={searchMember}
                                    onChange={(e) => setSearchMember(e.target.value)}
                                />
                            </div>

                            <div className="list-group overflow-auto" style={{ maxHeight: '200px', border: '1px solid #dee2e6' }}>
                                {loading ? (
                                    <div className="p-3 text-center text-muted">Loading members...</div>
                                ) : filteredMembers.length > 0 ? (
                                    filteredMembers.map(m => (
                                        <button
                                            key={m.id}
                                            type="button"
                                            className={`list-group-item list-group-item-action border-0 ${selectedMember?.id === m.id ? 'active' : ''}`}
                                            onClick={() => setSelectedMember(m)}
                                        >
                                            <div className="d-flex align-items-center">
                                                <User size={16} className="me-2" />
                                                <div>
                                                    {/* MemberService provides 'name' and 'email' */}
                                                    <div className="fw-bold">{m.name}</div>
                                                    <div className="small">{m.email}</div>
                                                </div>
                                            </div>
                                        </button>
                                    ))
                                ) : (
                                    <div className="p-3 text-center text-muted">No members found</div>
                                )}
                            </div>
                        </div>

                        <div className="alert alert-info py-2 d-flex align-items-center">
                            <Clock size={16} className="me-2" />
                            <small>The member will be notified once a copy is available.</small>
                        </div>
                    </div>

                    <div className="modal-footer border-0">
                        <button type="button" className="btn btn-light" onClick={onClose} disabled={submitting}>Cancel</button>
                        <button
                            type="button"
                            className="btn btn-primary px-4"
                            onClick={handleReserve}
                            disabled={submitting || !selectedMember}
                        >
                            {submitting ? 'Processing...' : 'Reserve Now'}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ReserveBookModal;
