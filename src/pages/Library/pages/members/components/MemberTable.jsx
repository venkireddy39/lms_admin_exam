import React from 'react';
import { User as UserIcon, CheckCircle, Ban, Edit, Trash2, BookOpen } from 'lucide-react';
import { ROLES, STATUS } from '../../../utils/constants';

const roleBadge = (role) => {
    if (role === ROLES.ADMIN) return 'bg-danger';
    if (role === ROLES.INSTRUCTOR) return 'bg-warning text-dark';
    return 'bg-info';
};

const MemberTable = ({ members, loading, onEdit, onDelete, onIssue }) => (
    <div className="table-responsive">
        <table className="table table-hover align-middle">
            <thead className="table-light">
                <tr>
                    <th>Member Info</th>
                    <th>Contact</th>
                    <th>Role</th>
                    <th>Status</th>
                    <th>Books</th>
                    <th className="text-end">Actions</th>
                </tr>
            </thead>
            <tbody>
                {loading ? (
                    <tr><td colSpan="6" className="text-center">Loading...</td></tr>
                ) : members.length === 0 ? (
                    <tr><td colSpan="6" className="text-center text-muted">No members found</td></tr>
                ) : members.map((m, index) => (
                    <tr key={m.id || m.memberId || index}>
                        <td>
                            <div className="d-flex align-items-center">
                                <div className="rounded-circle bg-light me-3 p-2">
                                    <UserIcon size={18} />
                                </div>
                                <div>
                                    <div className="fw-bold">{m.name}</div>
                                    <div className="small text-muted">{m.email}</div>
                                    <div className="small text-primary">ID: {m.memberId}</div>
                                </div>
                            </div>
                        </td>

                        <td>{m.mobile || 'N/A'}</td>

                        <td>
                            <span className={`badge ${roleBadge(m.role)}`}>
                                {m.role}
                            </span>
                        </td>

                        <td>
                            {m.status === STATUS.ACTIVE ? (
                                <span className="text-success"><CheckCircle size={14} /> Active</span>
                            ) : (
                                <span className="text-danger"><Ban size={14} /> Blocked</span>
                            )}
                        </td>

                        <td>{m.issuedBooks || 0}</td>

                        <td className="text-end">
                            <button
                                className="btn btn-sm btn-outline-primary me-1"
                                onClick={() => onIssue && onIssue(m)}
                                disabled={!onIssue || m.status !== STATUS.ACTIVE}
                                title={m.status !== STATUS.ACTIVE ? "Member is blocked" : "Issue Book"}
                            >
                                <BookOpen size={14} />
                            </button>
                            <button
                                className="btn btn-sm btn-outline-secondary me-1"
                                onClick={() => onEdit && onEdit(m)}
                                disabled={!onEdit}
                                title={!onEdit ? "Managed in User Management" : "Edit member"}
                            >
                                <Edit size={14} />
                            </button>
                            <button
                                className={`btn btn-sm ${m.status === STATUS.ACTIVE ? 'btn-outline-danger' : 'btn-outline-success'}`}
                                onClick={() => onDelete && onDelete(m.id, m.status)}
                                disabled={!onDelete || m.role === ROLES.ADMIN}
                                title={m.status === STATUS.ACTIVE ? "Block Member" : "Unblock Member"}
                            >
                                {m.status === STATUS.ACTIVE ? <Ban size={14} /> : <CheckCircle size={14} />}
                            </button>
                        </td>
                    </tr>
                ))}
            </tbody>
        </table>
    </div>
);

export default MemberTable;
