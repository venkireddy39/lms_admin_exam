import React from 'react';
import { FiPlus } from 'react-icons/fi';

const MemberManagementSection = ({ batchDetails, enrolledStudents, setIsAddModalOpen, children }) => {
    return (
        <div className="card border-0 shadow-sm">
            <div className="card-header bg-white d-flex flex-column flex-sm-row align-items-start align-items-sm-center justify-content-between gap-3 py-3">
                <div>
                    <h5 className="mb-1 fw-bold">Member Management</h5>
                    <small className="text-muted">Manage students, faculty, and staff access</small>
                    {batchDetails?.maxStudents && (
                        <div className="mt-1">
                            <span className={`small ${enrolledStudents.length >= batchDetails.maxStudents ? 'text-danger fw-bold' : 'text-secondary'}`}>
                                Enrollment: {enrolledStudents.length} / {batchDetails.maxStudents}
                            </span>
                            {enrolledStudents.length >= batchDetails.maxStudents && (
                                <span className="badge bg-danger ms-2">FULL</span>
                            )}
                        </div>
                    )}
                </div>
                <button
                    className="btn btn-dark btn-sm d-flex align-items-center gap-1"
                    onClick={() => {
                        if (batchDetails?.maxStudents && enrolledStudents.length >= batchDetails.maxStudents) {
                            alert("Batch limit exceeded! Please create a new batch.");
                            return;
                        }
                        setIsAddModalOpen(true);
                    }}
                >
                    <FiPlus size={14} /> Add Member
                </button>
            </div>
            <div className="card-body p-0">
                {children}
            </div>
        </div>
    );
};

export default MemberManagementSection;
