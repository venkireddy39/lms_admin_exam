import React, { useState } from 'react';
import { FaCheck, FaTimes, FaSearch, FaInfoCircle } from 'react-icons/fa';

const PendingCertificates = ({ pendingCertificates = [], onApprove, onReject }) => {
    const [searchTerm, setSearchTerm] = useState("");

    const filteredList = (pendingCertificates || []).filter(cert => {
        const recipient = cert?.data?.recipientName || "";
        const course = cert?.data?.courseName || "";
        return recipient.toLowerCase().includes(searchTerm.toLowerCase()) ||
            course.toLowerCase().includes(searchTerm.toLowerCase());
    });

    return (
        <div className="card border-0 shadow-sm rounded-4 animate-fade-in bg-white">
            <div className="card-header bg-white border-bottom pt-4 px-4 pb-3">
                <div className="d-flex justify-content-between align-items-center">
                    <div>
                        <h5 className="fw-bold mb-1 text-warning">Pending Approval</h5>
                        <small className="text-muted">Review and issue certificates waiting in queue.</small>
                    </div>
                    <div className="input-group" style={{ maxWidth: '300px' }}>
                        <span className="input-group-text bg-light border-end-0"><FaSearch className="text-muted" /></span>
                        <input
                            type="text"
                            className="form-control bg-light border-start-0"
                            placeholder="Search pending..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                </div>
            </div>

            <div className="card-body p-0">
                <div className="table-responsive">
                    <table className="table table-hover align-middle mb-0 text-center">
                        <thead className="bg-light text-dark fw-bold border-bottom">
                            <tr>
                                <th className="py-3 text-start ps-4">Recipient</th>
                                <th className="py-3">Course</th>
                                <th className="py-3">Requested Date</th>
                                <th className="py-3">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredList.length === 0 ? (
                                <tr>
                                    <td colSpan="4" className="text-center py-5 text-muted">
                                        <FaInfoCircle size={30} className="mb-2 opacity-50" />
                                        <p className="mb-0">No pending certificates found.</p>
                                    </td>
                                </tr>
                            ) : (
                                filteredList.map((cert) => (
                                    <tr key={cert.id}>
                                        <td className="text-start ps-4 fw-medium">
                                            {cert.data.recipientName}
                                        </td>
                                        <td className="text-muted">{cert.data.courseName}</td>
                                        <td className="text-muted">
                                            {new Date(cert.issuedAt).toLocaleDateString()}
                                        </td>
                                        <td>
                                            <div className="d-flex justify-content-center gap-2">
                                                <button
                                                    className="btn btn-sm btn-success d-flex align-items-center gap-1"
                                                    onClick={() => onApprove(cert)}
                                                >
                                                    <FaCheck /> Approve
                                                </button>
                                                <button
                                                    className="btn btn-sm btn-outline-danger d-flex align-items-center gap-1"
                                                    onClick={() => onReject(cert.id)}
                                                >
                                                    <FaTimes /> Reject
                                                </button>
                                            </div>
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

export default PendingCertificates;