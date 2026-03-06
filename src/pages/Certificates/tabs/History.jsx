import React, { useState } from 'react';
import { FaDownload, FaEye, FaShareAlt, FaTrash, FaQrcode, FaPrint, FaCopy, FaSearch, FaEdit, FaFilePdf } from 'react-icons/fa';
import { toast } from 'react-toastify';

const History = ({ certificates, onView, onDelete, onEdit }) => {
    const [searchTerm, setSearchTerm] = useState("");
    const [entriesCount, setEntriesCount] = useState(10);
    const [filterType, setFilterType] = useState("All");

    const handleShare = (cert) => {
        const link = `${window.location.origin}/verify/${cert.certificateId}`;
        navigator.clipboard.writeText(link);
        toast.success("Link Copied!");
    };

    const filteredCertificates = certificates.filter(cert =>
        (cert.studentName || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
        (cert.certificateId || "").toLowerCase().includes(searchTerm.toLowerCase())
    );


    return (
        <div className="card border-0 shadow-sm rounded-4 animate-fade-in bg-white">
            {/* Header / Toolbar */}
            <div className="card-header bg-white border-bottom pt-4 px-4 pb-3">
                <div className="row g-3 align-items-center justify-content-between">
                    <div className="col-md-4">
                        <select className="form-select bg-light border-0" value={filterType} onChange={(e) => setFilterType(e.target.value)}>
                            <option value="All">All Certificates</option>
                            <option value="Course">By Course</option>
                            <option value="Department">By Department</option>
                        </select>
                    </div>
                    <div className="col-md-8 d-flex justify-content-end gap-3 align-items-center">
                        <div className="d-flex align-items-center gap-2">
                            <span className="small text-muted text-nowrap">Show</span>
                            <select className="form-select form-select-sm" style={{ width: '70px' }} value={entriesCount} onChange={(e) => setEntriesCount(e.target.value)}>
                                <option value="10">10</option>
                                <option value="25">25</option>
                                <option value="50">50</option>
                            </select>
                            <span className="small text-muted text-nowrap">entries</span>
                        </div>
                        <div className="input-group" style={{ maxWidth: '250px' }}>
                            <span className="input-group-text bg-light border-end-0"><FaSearch className="text-muted" /></span>
                            <input
                                type="text"
                                className="form-control bg-light border-start-0"
                                placeholder="Search..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                    </div>
                </div>
            </div>

            <div className="card-body p-0">
                <div className="table-responsive">
                    <table className="table table-hover align-middle mb-0 text-center" style={{ fontSize: '0.9rem' }}>
                        <thead className="bg-light text-dark fw-bold border-bottom">
                            <tr>
                                <th className="py-3 text-start">Student Name</th>
                                <th className="py-3">Course Name</th>
                                <th className="py-3">Certificate Number</th>
                                <th className="py-3">Issue Date</th>
                                <th className="py-3">Status</th>
                                <th className="py-3">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredCertificates.length === 0 ? (
                                <tr>
                                    <td colSpan="12" className="text-center py-5 text-muted">No records found.</td>
                                </tr>
                            ) : (
                                filteredCertificates.map((cert) => (
                                    <tr key={cert.id}>
                                        <td className="text-start fw-bold text-dark">{cert.studentName || cert.recipientName || 'N/A'}</td>
                                        <td><span className="small">{cert.eventTitle || cert.courseName || 'N/A'}</span></td>
                                        <td className="font-monospace text-primary">{cert.certificateId || 'N/A'}</td>
                                        <td className="small text-muted">{new Date(cert.issuedDate || cert.createdAt || new Date()).toLocaleDateString('en-GB')}</td>
                                        <td><span className="badge bg-success">Issued</span></td>
                                        <td>
                                            <div className="d-flex justify-content-center gap-2">
                                                <button className="btn btn-sm btn-outline-primary" title="View & Download" onClick={() => onView(cert)}>
                                                    <FaEye className="me-1" /> View / Download
                                                </button>
                                                <button className="btn btn-sm btn-outline-info" title="Share Link" onClick={() => handleShare(cert)}>
                                                    <FaShareAlt />
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
            <div className="card-footer bg-white border-0 py-3 d-flex justify-content-between align-items-center">
                <small className="text-muted">Showing {Math.min(filteredCertificates.length, entriesCount)} of {filteredCertificates.length} entries</small>
                <div>
                    <button className="btn btn-sm btn-light border me-1" disabled>Previous</button>
                    <button className="btn btn-sm btn-primary">1</button>
                    <button className="btn btn-sm btn-light border ms-1">Next</button>
                </div>
            </div>
        </div>
    );
};

export default History;
