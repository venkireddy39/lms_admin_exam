import React from 'react';
import { FiSearch } from 'react-icons/fi';

const AddStudentModal = ({ 
    isOpen, 
    onClose, 
    batchDetails, 
    enrolledStudents, 
    searchQuery, 
    setSearchQuery, 
    availableStudents, 
    selectedPotentialStudents, 
    toggleSelection, 
    handleAddStudents 
}) => {
    if (!isOpen) return null;

    return (
        <div className="modal fade show d-block" style={{ background: 'rgba(0,0,0,0.5)', zIndex: 1060 }}>
            <div className="modal-dialog modal-dialog-centered modal-dialog-scrollable modal-lg">
                <div className="modal-content border-0 shadow">
                    <div className="modal-header border-bottom">
                        <h5 className="modal-title fw-bold">Add Students to Batch</h5>
                        {batchDetails?.maxStudents && (
                            <span className="badge bg-info ms-2 fw-normal">
                                {Math.max(0, batchDetails.maxStudents - enrolledStudents.length)} spots left
                            </span>
                        )}
                        <button className="btn-close ms-auto" onClick={onClose}></button>
                    </div>
                    <div className="modal-body">
                        <div className="input-group mb-3">
                            <span className="input-group-text bg-white"><FiSearch className="text-muted" /></span>
                            <input
                                type="text"
                                className="form-control border-start-0 ps-0"
                                placeholder="Search by Name, Email or Student ID..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                            />
                        </div>
                        <div className="list-group list-group-flush border rounded-3" style={{ maxHeight: 350, overflowY: 'auto' }}>
                            {availableStudents.length > 0 ? availableStudents.map(user => (
                                <label
                                    key={user.userId || user.id}
                                    className={`list-group-item list-group-item-action d-flex align-items-center gap-3 py-2 px-3 ${selectedPotentialStudents.includes(user.userId || user.id) ? 'active' : ''}`}
                                    style={{ cursor: 'pointer' }}
                                >
                                    <input
                                        type="checkbox"
                                        className="form-check-input flex-shrink-0 mt-0"
                                        checked={selectedPotentialStudents.includes(user.userId || user.id)}
                                        onChange={() => toggleSelection(user.userId || user.id)}
                                    />
                                    <div>
                                        <div className="fw-semibold">{user.name || user.username}</div>
                                        <small className="text-muted d-block">{user.email}</small>
                                        <small className="text-secondary" style={{ fontSize: '0.72rem' }}>ID: {user.studentId || user.userId || user.id}</small>
                                    </div>
                                </label>
                            )) : (
                                <div className="text-center py-4 text-muted small">
                                    No available students found{searchQuery ? ` matching "${searchQuery}"` : ''}.
                                </div>
                            )}
                        </div>
                    </div>
                    <div className="modal-footer">
                        <span className="text-muted small me-auto">{selectedPotentialStudents.length} selected</span>
                        <button className="btn btn-outline-secondary btn-sm" onClick={onClose}>Cancel</button>
                        <button
                            className="btn btn-dark btn-sm"
                            onClick={() => handleAddStudents(selectedPotentialStudents)}
                            disabled={selectedPotentialStudents.length === 0}
                        >
                            Add Selected
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AddStudentModal;
