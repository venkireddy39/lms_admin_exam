import React, { useState } from 'react';
import { FaDownload, FaEye, FaShareAlt, FaTrash, FaQrcode, FaPrint, FaCopy, FaSearch, FaEdit, FaFilePdf } from 'react-icons/fa';
import { toast } from 'react-toastify';

const History = ({ certificates, onView, onDelete, onEdit }) => {
    const [searchTerm, setSearchTerm] = useState("");
    const [entriesCount, setEntriesCount] = useState(10);
    const [filterType, setFilterType] = useState("All");

    const handleShare = (cert) => {
        const link = `${window.location.origin}/verify/${cert.data.certificateId}`;
        navigator.clipboard.writeText(link);
        toast.success("Link Copied!");
    };

    const filteredCertificates = certificates.filter(cert =>
        (cert.data.recipientName || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
        (cert.data.certificateId || "").toLowerCase().includes(searchTerm.toLowerCase())
    );

    // Helper to find student photo if it exists in elements (looking for image type with specific criteria or just first image)
    const getStudentPhoto = (cert) => {
        if (cert.template?.elements) {
            // Logic: Assume an element with id containing 'photo' or 'recipient' is the photo, or just user avatar
            // For now, let's look for a generic image as fallback if not explicitly tagged
            const photo = cert.template.elements.find(el => el.type === 'image' && (el.content?.toLowerCase().includes('photo') || el.id.includes('photo')));
            if (photo) return photo.src;
        }
        return "https://via.placeholder.com/50?text=User";
    };

    const getSignature = (cert) => {
        return cert.data.signatureImage || "https://via.placeholder.com/80x40?text=Sign";
    };

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
                                <th className="py-3">Image</th>
                                <th className="py-3">Sign</th>
                                <th className="py-3 text-start">Name</th>
                                <th className="py-3">Certificate No</th>
                                <th className="py-3">Course/Dep</th>
                                <th className="py-3">Duration</th>
                                <th className="py-3">Grade</th>
                                <th className="py-3">Year</th>
                                <th className="py-3">Date</th>
                                <th className="py-3">Print</th>
                                <th className="py-3">Edit</th>
                                <th className="py-3">Delete</th>
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
                                        {/* Image */}
                                        <td className="p-2">
                                            <img src={getStudentPhoto(cert)} alt="User" className="rounded border" style={{ width: '40px', height: '40px', objectFit: 'cover' }} />
                                        </td>

                                        {/* Sign */}
                                        <td className="p-2">
                                            <img src={getSignature(cert)} alt="Sign" style={{ width: '60px', height: '30px', objectFit: 'contain' }} />
                                        </td>

                                        {/* Name */}
                                        <td className="text-start fw-bold text-dark">{cert.data.recipientName}</td>

                                        {/* Cert No */}
                                        <td className="font-monospace text-primary">{cert.data.certificateId}</td>

                                        {/* Course */}
                                        <td>
                                            <span className="small">{cert.data.courseName}</span>
                                        </td>

                                        {/* Duration (Mocked) */}
                                        <td>{cert.data.duration || "6 Months"}</td>

                                        {/* Grade (Mocked) */}
                                        <td><span className="fw-bold">{cert.data.grade || "A+"}</span></td>

                                        {/* Year */}
                                        <td>{new Date(cert.issuedAt).getFullYear()}</td>

                                        {/* Date */}
                                        <td className="small text-muted">{new Date(cert.issuedAt).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}<br /><span style={{ fontSize: '0.7rem' }}>{new Date(cert.issuedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span></td>

                                        {/* Print */}
                                        <td>
                                            <div className="d-flex flex-column align-items-center gap-1">
                                                <button className="btn btn-sm btn-link text-primary p-0" title="View" onClick={() => onView(cert)}><FaEye /></button>
                                                <button className="btn btn-sm btn-link text-secondary p-0" title="PDF" onClick={() => { onView(cert); setTimeout(() => window.print(), 500); }}><FaFilePdf /></button>
                                            </div>
                                        </td>

                                        {/* Edit */}
                                        <td>
                                            <button className="btn btn-sm btn-link text-info p-0" title="Edit" onClick={() => onEdit && onEdit(cert)}><FaEdit /></button>
                                        </td>

                                        {/* Delete */}
                                        <td>
                                            <button className="btn btn-sm btn-link text-danger p-0" title="Delete" onClick={() => onDelete(cert.id)}><FaTrash /></button>
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
