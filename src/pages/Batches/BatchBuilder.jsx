import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { FiArrowLeft, FiUsers, FiBook, FiSettings, FiPlus, FiTrash2, FiSearch, FiX, FiRefreshCw } from 'react-icons/fi';

import { useAuth } from '../Library/context/AuthContext';
import { batchService } from './services/batchService';
import { enrollmentService } from './services/enrollmentService';
import AttendanceTab from './tabs/AttendanceTab';
import ClassesTab from './tabs/ClassesTab';
import './styles/BatchBuilder.css';

const BatchBuilder = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { user } = useAuth();
    const [activeTab, setActiveTab] = useState('students');
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [batchDetails, setBatchDetails] = useState(null);

    // Data State
    const [enrolledStudents, setEnrolledStudents] = useState([]);
    const [allUsers, setAllUsers] = useState([]);
    const [loading, setLoading] = useState(true);

    // Transfer Modal State
    const [transferModal, setTransferModal] = useState({ isOpen: false, student: null });
    const [selectedTransferBatch, setSelectedTransferBatch] = useState('');
    const [transferReason, setTransferReason] = useState('');

    const [searchQuery, setSearchQuery] = useState('');
    const [selectedPotentialStudents, setSelectedPotentialStudents] = useState([]);
    const [otherBatches, setOtherBatches] = useState([]);

    useEffect(() => {
        loadData();
    }, [id]);

    const loadData = async () => {
        setLoading(true);
        try {
            // Fetch individually to better handle partial failures
            // If getBatchById fails, the page is useless, so it should fail hard or redirect.
            const batch = await batchService.getBatchById(id).catch(err => {
                console.error("Batch fetch failed", err);
                return null;
            });

            if (!batch) {
                alert("Batch not found or access denied.");
                navigate('/batches');
                return;
            }

            const [studentsData, usersData, batchesData] = await Promise.all([
                enrollmentService.getStudentsByBatch(id).catch(e => []),
                enrollmentService.getAllUsers().catch(e => []),
                batchService.getAllBatches().catch(e => [])
            ]);

            // Normalize users for easier consumption
            const normalizedUsers = (usersData || []).map(u => ({
                ...u,
                // Create a unified 'name' property if missing
                name: u.name || `${u.firstName || ''} ${u.lastName || ''}`.trim() || u.username || 'Unknown User',
                // Normalize role to check both role and roleName
                normalizedRole: (u.role || u.roleName || '').toUpperCase()
            }));

            // Enrich enrolled students with actual User ID (from normalizedUsers)
            // The enrollment record usually has 'studentId', but we want to show 'userId' (Global ID)
            const enrichedStudents = (studentsData || []).map(s => {
                const userProfile = normalizedUsers.find(u => String(u.studentId) === String(s.studentId));
                return {
                    ...s,
                    // Show the actual Student ID - try multiple possible fields
                    displayId: s.studentId || s.student?.studentId || s.student?.userId || s.userId || 'N/A',
                    // We can also store userId for linking if needed
                    userId: userProfile?.userId || s.student?.userId
                };
            });

            setEnrolledStudents(enrichedStudents);
            setBatchDetails(batch);

            // Filter for Students
            setAllUsers(normalizedUsers.filter(u =>
                !u.normalizedRole ||
                u.normalizedRole === 'STUDENT' ||
                u.normalizedRole === 'ROLE_STUDENT' ||
                u.normalizedRole.includes('STUDENT') // Catch-all
            ));

            setOtherBatches((batchesData || []).filter(b => String(b.batchId) !== String(id)));

        } catch (error) {
            console.error("Failed to load batch data", error);
        } finally {
            setLoading(false);
        }
    };

    // Filter available students (Students who are NOT already enrolled)
    const availableStudents = allUsers.filter(u => {
        const isEnrolled = enrolledStudents.some(e => String(e.studentId) === String(u.userId || u.id || u.user_id));
        const term = searchQuery.toLowerCase().trim();
        const displayId = u.studentId || u.userId || u.id; // Correct ID reference

        const matchesSearch =
            (u.name || '').toLowerCase().includes(term) ||
            (u.email || '').toLowerCase().includes(term) ||
            (displayId && String(displayId).includes(term));

        return !isEnrolled && matchesSearch;
    });

    const handleAddStudents = async () => {
        // Check batch capacity
        const currentEnrollment = enrolledStudents.length;
        const maxStudents = batchDetails?.maxStudents || batchDetails?.capacity;
        const selectedCount = selectedPotentialStudents.length;

        if (maxStudents && (currentEnrollment + selectedCount) > maxStudents) {
            const available = maxStudents - currentEnrollment;
            alert(`Batch capacity exceeded! Maximum capacity: ${maxStudents}\nCurrent enrollment: ${currentEnrollment}\nAttempting to add: ${selectedCount}\nAvailable spots: ${available}\n\nPlease select ${available} or fewer students.`);
            return;
        }

        try {
            const promises = selectedPotentialStudents.map(userIdKey => {
                const student = allUsers.find(u => (u.userId || u.id) === userIdKey);
                // Ensure we use the specific Student ID if available, otherwise User ID
                const actualStudentId = student?.studentId || userIdKey;

                return enrollmentService.addStudentToBatch({
                    batchId: Number(id),
                    studentId: Number(actualStudentId), // Ensure Number
                    studentName: student?.firstName ? `${student.firstName} ${student.lastName || ''}`.trim() : (student?.name || 'Unknown'),
                    studentEmail: student?.email, // Added required field
                    courseId: batchDetails.courseId
                });
            });

            await Promise.all(promises);

            const updatedStudents = await enrollmentService.getStudentsByBatch(id);
            setEnrolledStudents(updatedStudents);
            setSelectedPotentialStudents([]);
            setIsAddModalOpen(false);
        } catch (err) {
            console.error(err);
            alert("Failed to add students");
        }
    };

    const toggleSelection = (userId) => {
        if (selectedPotentialStudents.includes(userId)) {
            setSelectedPotentialStudents(prev => prev.filter(id => id !== userId));
        } else {
            setSelectedPotentialStudents(prev => [...prev, userId]);
        }
    };

    const removeStudent = async (studentBatchId) => {
        if (window.confirm('Remove this student from the batch?')) {
            try {
                await enrollmentService.removeStudentFromBatch(studentBatchId);
                setEnrolledStudents(prev => prev.filter(s => s.studentBatchId !== studentBatchId));
            } catch (err) {
                console.error(err);
                alert("Failed to remove student");
            }
        }
    };

    const openTransferModal = (student) => {
        setTransferModal({ isOpen: true, student });
        setSelectedTransferBatch('');
        setTransferReason('');
    };

    const confirmTransfer = async () => {
        if (!selectedTransferBatch || !transferModal.student) return;

        try {
            const targetBatch = otherBatches.find(b => String(b.batchId) === String(selectedTransferBatch));

            // Use the consolidated transfer service call
            await enrollmentService.transferStudent({
                studentBatchId: transferModal.student.studentBatchId, // ID for removal
                studentId: transferModal.student.studentId,
                studentName: transferModal.student.studentName,
                studentEmail: transferModal.student.studentEmail,
                courseId: batchDetails.courseId,
                targetBatchId: Number(selectedTransferBatch), // ID for enrollment
                reason: transferReason || "Administrative Transfer",
                transferredBy: user?.name || user?.username || "Admin"
            });

            // Update UI: Remove from current batch list locally
            setEnrolledStudents(prev => prev.filter(s => s.studentBatchId !== transferModal.student.studentBatchId));
            setTransferModal({ isOpen: false, student: null });
            alert(`Successfully transferred to ${targetBatch?.batchName}`);

        } catch (err) {
            console.error(err);
            alert("Transfer failed: " + err.message);
        }
    };

    if (loading) return <div className="p-5">Loading Batch Builder...</div>;

    return (
        <div className="batch-builder-layout">
            <header className="bb-header">
                <div className="bb-header-left">
                    <button onClick={() => navigate('/batches')} className="btn-back">
                        <FiArrowLeft /> Back
                    </button>
                    <div className="bb-title">
                        <h2>Batch Management</h2>
                        <span className="badge-id">ID: {id}</span>
                    </div>
                </div>
                <div className="bb-header-right">
                    <div className="bb-tabs">
                        <button className={`tab-item ${activeTab === 'overview' ? 'active' : ''}`} onClick={() => setActiveTab('overview')}>Classes</button>
                        <button className={`tab-item ${activeTab === 'students' ? 'active' : ''}`} onClick={() => setActiveTab('students')}>Students</button>
                        <button className={`tab-item ${activeTab === 'attendance' ? 'active' : ''}`} onClick={() => setActiveTab('attendance')}>Attendance</button>
                    </div>
                </div>
            </header>

            <main className="bb-main">
                {activeTab === 'overview' ? (
                    <ClassesTab
                        batchId={id}
                        courseId={batchDetails?.courseId}
                        instructorName={batchDetails?.trainerName}
                    />
                ) : activeTab === 'students' ? (
                    <div className="students-manager">
                        <div className="sm-header">
                            <div>
                                <h3>Member Management</h3>
                                <p className="text-muted">Manage students, faculty, and staff access</p>
                                {batchDetails?.maxStudents && (
                                    <p className="text-sm mt-1">
                                        <span className={enrolledStudents.length >= batchDetails.maxStudents ? 'text-danger fw-bold' : 'text-secondary'}>
                                            Enrollment: {enrolledStudents.length} / {batchDetails.maxStudents}
                                        </span>
                                        {enrolledStudents.length >= batchDetails.maxStudents && (
                                            <span className="badge bg-danger ms-2">FULL</span>
                                        )}
                                    </p>
                                )}
                            </div>
                            <button
                                className="btn-primary-add"
                                onClick={() => setIsAddModalOpen(true)}
                                disabled={batchDetails?.maxStudents && enrolledStudents.length >= batchDetails.maxStudents}
                                title={batchDetails?.maxStudents && enrolledStudents.length >= batchDetails.maxStudents ? 'Batch is full' : 'Add new members'}
                            >
                                <FiPlus /> Add Member
                            </button>
                        </div>

                        <div className="students-list">
                            {enrolledStudents.length > 0 ? (
                                <table className="w-100 table-custom">
                                    <thead>
                                        <tr>
                                            <th>MEMBER PROFILE</th>
                                            <th>ID</th>
                                            <th>STATUS</th>
                                            <th className="text-end">ACTIONS</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {enrolledStudents.map(item => (
                                            <tr key={item.studentBatchId}>
                                                <td>
                                                    <div className="d-flex align-items-center gap-3">
                                                        <div className="avatar-square" style={{ width: 40, height: 40, borderRadius: 8, background: '#0ea5e9', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold' }}>
                                                            {item.studentName?.substring(0, 2).toUpperCase()}
                                                        </div>
                                                        <div>
                                                            <div className="fw-bold text-dark">{item.studentName}</div>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td>
                                                    <span className="text-muted small">ID: #{item.displayId}</span>
                                                </td>
                                                <td>
                                                    <div className="d-flex align-items-center gap-2 text-dark">
                                                        <div className="rounded-circle bg-success p-1" style={{ width: 6, height: 6 }}></div>
                                                        Enrolled
                                                    </div>
                                                </td>
                                                <td className="text-end">
                                                    <div className="d-flex justify-content-end gap-2">
                                                        <button
                                                            className="btn-icon-plain text-secondary hover-primary"
                                                            onClick={() => openTransferModal(item)}
                                                            title="Transfer"
                                                        >
                                                            <FiRefreshCw size={18} />
                                                        </button>
                                                        <button
                                                            className="btn-icon-plain text-secondary hover-danger"
                                                            onClick={() => removeStudent(item.studentBatchId)}
                                                            title="Delete"
                                                        >
                                                            <FiTrash2 size={18} />
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            ) : (
                                <div className="empty-state-small">
                                    <FiUsers size={40} className="text-muted mb-2" />
                                    <p>No students enrolled yet.</p>
                                </div>
                            )}
                        </div>
                    </div>
                ) : activeTab === 'attendance' ? (
                    <AttendanceTab batchId={id} />
                ) : (
                    <div className="empty-content-state">
                        <div className="ecs-icon"><FiSettings /></div>
                        <h3>Module Not Found</h3>
                    </div>
                )}
            </main>

            {/* Add Student Modal */}
            {isAddModalOpen && (
                <div className="modal-overlay">
                    <div className="modal-content-large">
                        <div className="modal-header">
                            <h3>Add Students to Batch</h3>
                            {batchDetails?.maxStudents && (
                                <span className="badge bg-info ms-2">
                                    Available Spots: {Math.max(0, batchDetails.maxStudents - enrolledStudents.length)}
                                </span>
                            )}
                            <button className="btn-close" onClick={() => setIsAddModalOpen(false)}><FiX /></button>
                        </div>
                        <div className="modal-body">

                            {/* Direct Add by ID */}
                            <div className="p-3 bg-light rounded mb-4 border">
                                <label className="form-label small fw-bold text-muted">DIRECT ENROLL BY ID (Manual Link)</label>
                                <div className="d-flex gap-2">
                                    <input
                                        type="number"
                                        className="form-control"
                                        placeholder="Enter Generated Student ID"
                                        id="manualStudentIdInput"
                                    />
                                    <button
                                        className="btn btn-dark text-nowrap"
                                        onClick={async () => {
                                            const input = document.getElementById('manualStudentIdInput');
                                            const val = input.value;
                                            if (!val) return;

                                            // Check capacity before manual enrollment
                                            const maxStudents = batchDetails?.maxStudents || batchDetails?.capacity;
                                            if (maxStudents && enrolledStudents.length >= maxStudents) {
                                                alert(`Cannot add student: Batch is at maximum capacity (${maxStudents}/${maxStudents})`);
                                                return;
                                            }

                                            try {
                                                await enrollmentService.addStudentToBatch({
                                                    batchId: Number(id),
                                                    studentId: Number(val)
                                                });
                                                const updated = await enrollmentService.getStudentsByBatch(id);
                                                setEnrolledStudents(updated);
                                                input.value = '';
                                                alert(`Successfully linked Student ID #${val}`);
                                            } catch (e) {
                                                alert("Failed: " + e.message);
                                            }
                                        }}
                                    >
                                        <FiPlus /> Link ID
                                    </button>
                                </div>
                                <small className="text-muted" style={{ fontSize: '0.7rem' }}>
                                    Use this if the student exists in the Admin DB but isn't showing in the list below yet.
                                </small>
                            </div>

                            <hr className="my-4" style={{ opacity: 0.1 }} />

                            <div className="search-bar mb-3">
                                <FiSearch className="search-icon" />
                                <input
                                    type="text"
                                    placeholder="Search by Name, Email or Student ID..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                />
                            </div>

                            <div className="list-selection">
                                {availableStudents.length > 0 ? availableStudents.map(user => (
                                    <div
                                        key={user.userId || user.id}
                                        className={`list-item-select ${selectedPotentialStudents.includes(user.userId || user.id) ? 'selected' : ''}`}
                                        onClick={() => toggleSelection(user.userId || user.id)}
                                    >
                                        <input
                                            type="checkbox"
                                            checked={selectedPotentialStudents.includes(user.userId || user.id)}
                                            readOnly
                                        />
                                        <div className="ms-3">
                                            <div className="fw-bold">{user.name || user.username}</div>
                                            <div className="d-flex flex-column">
                                                <small className="text-muted">{user.email}</small>
                                                <small className="text-secondary" style={{ fontSize: '0.75rem' }}>
                                                    ID: {user.studentId || user.userId || user.id}
                                                </small>
                                            </div>
                                        </div>
                                    </div>
                                )) : (
                                    <div className="text-center p-4 text-muted">No available students found matching "{searchQuery}".</div>
                                )}
                            </div>
                        </div>
                        <div className="modal-footer">
                            <div className="text-muted small me-auto">
                                {selectedPotentialStudents.length} selected
                            </div>
                            <button className="btn-secondary me-2" onClick={() => setIsAddModalOpen(false)}>Cancel</button>
                            <button
                                className="btn-primary"
                                onClick={handleAddStudents}
                                disabled={selectedPotentialStudents.length === 0}
                            >
                                Add Selected
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Transfer Modal */}
            {transferModal.isOpen && (
                <div className="modal-overlay">
                    <div className="modal-content-large" style={{ maxWidth: '500px' }}>
                        <div className="modal-header">
                            <h3>Transfer Student</h3>
                            <button className="btn-close" onClick={() => setTransferModal({ isOpen: false, student: null })}><FiX /></button>
                        </div>
                        <div className="modal-body">
                            <p className="mb-4 text-muted">
                                Move <strong>{transferModal.student?.studentName}</strong> to another batch.
                            </p>

                            <div className="form-group mb-3">
                                <label className="mb-2 d-block fw-bold text-sm">Select Target Batch</label>
                                <select
                                    className="w-100 p-2 border rounded"
                                    value={selectedTransferBatch}
                                    onChange={(e) => setSelectedTransferBatch(e.target.value)}
                                >
                                    <option value="">-- Select Batch --</option>
                                    {otherBatches.map(batch => (
                                        <option key={batch.batchId} value={batch.batchId}>
                                            {batch.batchName} ({batch.startDate})
                                        </option>
                                    ))}
                                </select>
                            </div>
                        </div>
                        <div className="modal-footer">
                            <button className="btn-secondary" onClick={() => setTransferModal({ isOpen: false, student: null })}>Cancel</button>
                            <button
                                className="btn-primary"
                                onClick={confirmTransfer}
                                disabled={!selectedTransferBatch}
                            >
                                Confirm Transfer
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default BatchBuilder;
