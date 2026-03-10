import React from 'react';
import { FiRefreshCw } from 'react-icons/fi';

const UploadHistory = ({ uploadJobs, handleProcessJob, isUploading, refreshUploadJobs }) => {
    return (
        <div className="card border-0 shadow-sm">
            <div className="card-header bg-white p-3 d-flex justify-content-between align-items-center">
                <h5 className="mb-0 fw-bold">Upload Job History ({uploadJobs.length})</h5>
                <button
                    className="btn btn-outline-secondary btn-sm"
                    onClick={refreshUploadJobs}
                >
                    <FiRefreshCw className="me-1" /> Refresh
                </button>
            </div>
            <div className="table-responsive">
                <table className="table table-hover mb-0 align-middle">
                    <thead className="bg-light">
                        <tr>
                            <th className="ps-4">Job ID</th>
                            <th>Date</th>
                            <th>Status</th>
                            <th>Session ID</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {[...uploadJobs].reverse().map((job) => (
                            <tr key={job.id}>
                                <td className="ps-4 fw-medium text-primary">#{job.id}</td>
                                <td className="small">{job.attendanceDate}</td>
                                <td>
                                    <span className={`badge bg-${job.status === 'PROCESSED' ? 'success' : job.status === 'FAILED' ? 'danger' : 'info'} bg-opacity-10 text-${job.status === 'PROCESSED' ? 'success' : job.status === 'FAILED' ? 'danger' : 'info'}`}>
                                        {job.status}
                                    </span>
                                </td>
                                <td className="small text-muted">{job.sessionId || 'N/A'}</td>
                                <td>
                                    {job.status === 'PENDING' && (
                                        <button
                                            className="btn btn-primary btn-xs py-0 px-2"
                                            style={{ fontSize: '0.75rem' }}
                                            onClick={() => handleProcessJob(job.id)}
                                            disabled={isUploading}
                                        >
                                            {isUploading ? 'Applying...' : 'Apply Data'}
                                        </button>
                                    )}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default UploadHistory;
