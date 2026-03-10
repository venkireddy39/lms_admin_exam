import React from 'react';
import { Download, ListChecks } from 'lucide-react';
import { FiEdit2, FiSave, FiX } from 'react-icons/fi';

const ReportHeader = ({ context, sessionId, isEditMode, setIsEditMode, onDownload, onSave, onCancel, onMarkAll }) => {
    return (
        <div className="card-header bg-white border-bottom py-4 px-4 shadow-sm">
            <div className="d-flex justify-content-between align-items-center">
                <div>
                    <div className="d-flex align-items-center gap-2 mb-1">
                        <div className="p-2 bg-primary bg-opacity-10 rounded-3 text-primary">
                            <ListChecks size={24} />
                        </div>
                        <h3 className="fw-bold mb-0" style={{ letterSpacing: '-0.5px' }}>{context.batchName}</h3>
                    </div>
                    <p className="text-muted small mb-0 d-flex align-items-center gap-2">
                        <span className="badge bg-primary bg-opacity-10 text-primary fw-bold" style={{ fontSize: '0.7rem' }}>{context.courseName || 'General Course'}</span>
                        <span className="text-secondary opacity-50">•</span>
                        <span className="fw-medium">ID: {sessionId}</span>
                    </p>
                </div>
                <div className="d-flex gap-2">
                    {!isEditMode ? (
                        <>
                            <button className="btn btn-warning d-flex align-items-center gap-2 px-4 py-2 fw-bold shadow-sm" onClick={() => setIsEditMode(true)}>
                                <FiEdit2 size={18} /> Correct Records
                            </button>
                            <button className="btn btn-outline-primary d-flex align-items-center gap-2 px-4 py-2 fw-bold shadow-sm bg-white" onClick={onDownload}>
                                <Download size={18} /> Export CSV
                            </button>
                        </>
                    ) : (
                        <>
                            <button className="btn btn-success btn-sm d-flex align-items-center gap-2 px-3 shadow-sm" onClick={onSave}>
                                <FiSave size={14} /> Save Changes
                            </button>
                            <div className="btn-group btn-group-sm shadow-sm">
                                <button className="btn btn-outline-success px-3" onClick={() => onMarkAll('PRESENT')}>Mark All Present</button>
                                <button className="btn btn-outline-danger px-3" onClick={() => onMarkAll('ABSENT')}>Mark All Absent</button>
                            </div>
                            <button className="btn btn-light btn-sm d-flex align-items-center gap-2" onClick={onCancel}>
                                <FiX size={14} /> Cancel
                            </button>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ReportHeader;
