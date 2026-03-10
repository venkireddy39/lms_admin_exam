import React from 'react';
import { FiUpload, FiX, FiCheckCircle, FiAlertTriangle, FiAlertCircle } from 'react-icons/fi';

const CsvPreviewSection = ({ csvPreview, handleCancelPreview, handleConfirmImport }) => {
    if (!csvPreview) return null;

    return (
        <div className="mb-4 fade-in">
            <div className="card border-0 shadow-sm border-start border-primary border-4">
                <div className="card-header bg-white p-3 d-flex justify-content-between align-items-center">
                    <h5 className="mb-0 fw-bold d-flex align-items-center">
                        <FiUpload className="me-2 text-primary" />
                        Confirm CSV Import
                    </h5>
                    <div className="d-flex gap-2">
                        <button className="btn btn-outline-secondary btn-sm" onClick={handleCancelPreview}>
                            <FiX className="me-1" /> Cancel
                        </button>
                        <button
                            className="btn btn-primary btn-sm"
                            disabled={csvPreview.summary.errors > 0 || csvPreview.summary.valid === 0}
                            onClick={handleConfirmImport}
                        >
                            <FiCheckCircle className="me-1" />
                            Import {csvPreview.summary.valid} Valid Rows
                        </button>
                    </div>
                </div>
                <div className="card-body bg-light p-3">
                    {/* Suspicious Warnings */}
                    {csvPreview.summary.warnings && csvPreview.summary.warnings.length > 0 && (
                        <div className="alert alert-warning d-flex align-items-center mb-3">
                            <FiAlertTriangle className="me-2 text-warning fs-4" />
                            <div>
                                <strong>Suspicious Pattern Detected:</strong>
                                <ul className="mb-0 ps-3">
                                    {csvPreview.summary.warnings.map((w, i) => (
                                        <li key={i}>{w}</li>
                                    ))}
                                </ul>
                            </div>
                        </div>
                    )}

                    {/* Summary Stats */}
                    <div className="d-flex gap-3 mb-3">
                        <div className="badge bg-white text-dark shadow-sm p-2 border">Total: {csvPreview.summary.total}</div>
                        <div className="badge bg-success bg-opacity-10 text-success p-2 border border-success">Valid: {csvPreview.summary.valid}</div>
                        <div className={`badge p-2 border ${csvPreview.summary.errors > 0 ? 'bg-danger bg-opacity-10 text-danger border-danger' : 'bg-secondary bg-opacity-10 text-secondary'}`}>
                            Errors: {csvPreview.summary.errors}
                        </div>
                    </div>

                    <div className="table-responsive bg-white border rounded" style={{ maxHeight: '300px' }}>
                        <table className="table table-sm table-hover mb-0 sticky-top-header">
                            <thead className="table-light">
                                <tr>
                                    <th>Line</th>
                                    <th>Student ID</th>
                                    <th>Status</th>
                                    <th>Remark</th>
                                    <th>Validation</th>
                                </tr>
                            </thead>
                            <tbody>
                                {csvPreview.rows.map((row, i) => (
                                    <tr key={i} className={!row.isValid ? 'table-danger' : ''}>
                                        <td className="text-muted small">{row.line}</td>
                                        <td>{row.studentId}</td>
                                        <td>
                                            <span className={`badge ${!row.isValid ? 'bg-secondary' : row.status === 'PRESENT' ? 'bg-success' : 'bg-warning'} bg-opacity-25 text-dark`}>
                                                {row.status}
                                            </span>
                                        </td>
                                        <td className="small text-muted text-truncate" style={{ maxWidth: '150px' }} title={row.remark}>{row.remark}</td>
                                        <td>
                                            {row.isValid ? (
                                                <span className="text-success small fw-bold">
                                                    <FiCheckCircle /> OK
                                                </span>
                                            ) : (
                                                <div className="text-danger small fw-bold">
                                                    <FiAlertCircle className="me-1" />
                                                    {row.errors.join(', ')}
                                                </div>
                                            )}
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

export default CsvPreviewSection;
