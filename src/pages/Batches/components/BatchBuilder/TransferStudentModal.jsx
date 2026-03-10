import React from 'react';

const TransferStudentModal = ({ 
    isOpen, 
    onClose, 
    student, 
    otherBatches, 
    selectedTransferBatch, 
    setSelectedTransferBatch, 
    transferReason, 
    setTransferReason, 
    confirmTransfer 
}) => {
    if (!isOpen) return null;

    return (
        <div className="modal fade show d-block" style={{ background: 'rgba(0,0,0,0.5)', zIndex: 1060 }}>
            <div className="modal-dialog modal-dialog-centered" style={{ maxWidth: 500 }}>
                <div className="modal-content border-0 shadow">
                    <div className="modal-header border-bottom">
                        <h5 className="modal-title fw-bold">Transfer Student</h5>
                        <button className="btn-close" onClick={onClose}></button>
                    </div>
                    <div className="modal-body">
                        <p className="text-muted mb-3">
                            Move <strong>{student?.studentName}</strong> to another batch.
                        </p>

                        <div className="mb-3">
                            <label className="form-label fw-semibold small">Select Target Batch</label>
                            <select
                                className="form-select form-select-sm"
                                value={selectedTransferBatch}
                                onChange={(e) => setSelectedTransferBatch(e.target.value)}
                            >
                                <option value="">-- Select Batch --</option>
                                {otherBatches.map(batch => (
                                    <option key={batch.batchId || batch.id} value={batch.batchId || batch.id}>
                                        {batch.batchName} ({batch.startDate})
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div className="mb-3">
                            <label className="form-label fw-semibold small">Transfer Reason (Optional)</label>
                            <textarea
                                className="form-control form-control-sm"
                                rows="3"
                                placeholder="Enter reason for transfer..."
                                value={transferReason}
                                onChange={(e) => setTransferReason(e.target.value)}
                            ></textarea>
                        </div>
                    </div>
                    <div className="modal-footer">
                        <button className="btn btn-outline-secondary btn-sm" onClick={onClose}>Cancel</button>
                        <button
                            className="btn btn-primary btn-sm"
                            onClick={confirmTransfer}
                            disabled={!selectedTransferBatch}
                        >
                            Confirm Transfer
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default TransferStudentModal;
