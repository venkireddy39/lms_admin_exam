import React from 'react';
import { FiTrash2, FiRefreshCw } from 'react-icons/fi';

const QueueTable = ({ queue, handleSync, handleClearQueue }) => {
    return (
        <div className="card border-0 shadow-sm">
            <div className="card-header bg-white p-3 d-flex justify-content-between align-items-center">
                <h5 className="mb-0 fw-bold">Pending Records ({queue.length})</h5>
                <div>
                    <button className="btn btn-outline-danger btn-sm me-2" onClick={handleClearQueue}>
                        <FiTrash2 /> Clear
                    </button>
                    <button className="btn btn-secondary btn-sm" onClick={handleSync}>
                        <FiRefreshCw /> Sync Now
                    </button>
                </div>
            </div>
            <div className="table-responsive">
                <table className="table table-hover mb-0 align-middle">
                    <thead className="bg-light">
                        <tr>
                            <th className="ps-4">Student ID</th>
                            <th>Status</th>
                            <th>Session</th>
                            <th>Date</th>
                        </tr>
                    </thead>
                    <tbody>
                        {queue.map((r, i) => (
                            <tr key={i}>
                                <td className="ps-4 fw-medium">{r.studentId}</td>
                                <td>
                                    <span className={`badge bg-${r.status === 'PRESENT' ? 'success' : r.status === 'LATE' ? 'warning' : 'danger'} bg-opacity-10 text-${r.status === 'PRESENT' ? 'success' : r.status === 'LATE' ? 'warning' : 'danger'}`}>
                                        {r.status}
                                    </span>
                                    {r.status === 'LATE' && r.minutesLate && (
                                        <div className="small text-danger fw-bold mt-1" style={{ fontSize: '0.7rem' }}>
                                            +{r.minutesLate} min
                                        </div>
                                    )}
                                </td>
                                <td className="small text-muted">{r.attendanceSessionId || r.sessionId}</td>
                                <td className="text-muted small">
                                    {r.timestamp ? new Date(r.timestamp).toLocaleDateString() : '-'}
                                </td>
                            </tr>
                        ))}
                        {queue.length === 0 && (
                            <tr>
                                <td colSpan="4" className="text-center py-5 text-muted">Queue is empty</td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default QueueTable;
