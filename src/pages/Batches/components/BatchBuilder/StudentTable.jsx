import React from 'react';
import { FiUsers, FiDollarSign, FiEdit, FiRefreshCw, FiTrash2 } from 'react-icons/fi';

const StudentTable = ({ enrolledStudents, openFeeDetails, openEditFeeModal, openTransferModal, removeStudent }) => {
    if (enrolledStudents.length === 0) {
        return (
            <div className="text-center py-5 text-muted">
                <FiUsers size={40} className="mb-3 opacity-25" />
                <p className="mb-0 small">No students enrolled yet.</p>
            </div>
        );
    }

    return (
        <div className="table-responsive">
            <table className="table table-hover align-middle mb-0">
                <thead className="table-light small text-uppercase text-muted">
                    <tr>
                        <th className="ps-4">Member Profile</th>
                        <th>ID</th>
                        <th>Status</th>
                        <th className="text-end pe-4">Actions</th>
                    </tr>
                </thead>
                <tbody>
                    {enrolledStudents.map(item => (
                        <tr key={item.studentBatchId}>
                            <td className="ps-4">
                                <div className="d-flex align-items-center gap-3">
                                    <div
                                        className="rounded-2 text-white fw-bold d-flex align-items-center justify-content-center flex-shrink-0"
                                        style={{ width: 38, height: 38, background: '#0ea5e9', fontSize: 13 }}
                                    >
                                        {item.studentName?.substring(0, 2).toUpperCase()}
                                    </div>
                                    <div className="fw-semibold text-dark">{item.studentName}</div>
                                </div>
                            </td>
                            <td>
                                <span className="text-muted small">#{item.displayId}</span>
                            </td>
                            <td>
                                <div className="d-flex align-items-center gap-2">
                                    <span className="badge bg-success-subtle text-success border border-success-subtle">Enrolled</span>
                                    {item.joinedAt && (
                                        <small className="text-muted">{new Date(item.joinedAt).toLocaleDateString()}</small>
                                    )}
                                </div>
                            </td>
                            <td className="text-end pe-4">
                                <div className="d-flex justify-content-end gap-1">
                                    <button
                                        className="btn btn-sm btn-outline-secondary"
                                        onClick={() => openFeeDetails(item)}
                                        title="View Fees"
                                    >
                                        <FiDollarSign size={14} />
                                    </button>
                                    <button
                                        className="btn btn-sm btn-outline-primary"
                                        onClick={() => openEditFeeModal(item)}
                                        title="Edit Fees"
                                    >
                                        <FiEdit size={14} />
                                    </button>
                                    <button
                                        className="btn btn-sm btn-outline-secondary"
                                        onClick={() => openTransferModal(item)}
                                        title="Transfer"
                                    >
                                        <FiRefreshCw size={14} />
                                    </button>
                                    <button
                                        className="btn btn-sm btn-outline-danger"
                                        onClick={() => removeStudent(item.studentBatchId)}
                                        title="Remove"
                                    >
                                        <FiTrash2 size={14} />
                                    </button>
                                </div>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

export default StudentTable;
