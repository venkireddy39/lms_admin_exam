import React, { useState, useEffect } from 'react';
import { FiPlus, FiTrash2, FiEdit2, FiList, FiAlertCircle, FiLoader } from 'react-icons/fi';
import { feeStructureService } from './services/feeStructureService';
import FeeStructureModal from './components/FeeStructureModal';

const FeeStructureSettings = () => {
    const [structures, setStructures] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingStructure, setEditingStructure] = useState(null);

    useEffect(() => {
        fetchStructures();
    }, []);

    const fetchStructures = async () => {
        setLoading(true);
        try {
            const data = await feeStructureService.getAllFeeStructures();
            setStructures(Array.isArray(data) ? data : []);
            setError(null);
        } catch (err) {
            console.error("Failed to load fee structures:", err);
            setError("Failed to load fee structures. Please ensure the backend is running.");
        } finally {
            setLoading(false);
        }
    };

    const handleCreate = () => {
        setEditingStructure(null);
        setIsModalOpen(true);
    };

    const handleEdit = (structure) => {
        setEditingStructure(structure);
        setIsModalOpen(true);
    };

    const handleDelete = async (id) => {
        if (!window.confirm("Are you sure you want to delete this fee structure? This is a soft delete.")) return;

        try {
            await feeStructureService.deleteFeeStructure(id);
            fetchStructures(); // Refresh list
        } catch (error) {
            console.error("Failed to delete fee structure:", error);
            alert("Failed to delete fee structure.");
        }
    };

    const handleSave = async (data) => {
        try {
            if (editingStructure) {
                await feeStructureService.updateFeeStructure(editingStructure.id, data);
            } else {
                await feeStructureService.createFeeStructure(data);
            }
            setIsModalOpen(false);
            fetchStructures();
        } catch (error) {
            console.error("Error saving fee structure:", error);
            alert(error.message || "Failed to save fee structure.");
        }
    };

    return (
        <div style={{ marginTop: '24px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                <div>
                    <h3 style={{ margin: 0, fontSize: '18px', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <FiList /> Fee Structures
                    </h3>
                    <p style={{ margin: '4px 0 0 0', fontSize: '13px', color: 'var(--text-secondary)' }}>
                        Define fee plans, installments, and component breakdowns for courses.
                    </p>
                </div>
                <button className="btn-primary" onClick={handleCreate}>
                    <FiPlus /> New Structure
                </button>
            </div>

            {error && (
                <div style={{ padding: '16px', borderRadius: '8px', background: '#fee2e2', color: '#dc2626', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <FiAlertCircle /> {error}
                </div>
            )}

            <div className="glass-card" style={{ padding: 0, overflow: 'hidden' }}>
                {loading ? (
                    <div style={{ padding: '40px', textAlign: 'center', color: 'var(--text-secondary)' }}>
                        <FiLoader className="spin" size={24} />
                        <div style={{ marginTop: '8px' }}>Loading Structures...</div>
                    </div>
                ) : (
                    <table className="premium-table">
                        <thead>
                            <tr>
                                <th>Name</th>
                                <th>Course</th>
                                <th>Batch</th>
                                <th>Amount</th>
                                <th>Installments</th>
                                <th>Components</th>
                                <th>Status</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {structures.length === 0 ? (
                                <tr>
                                    <td colSpan="7" style={{ textAlign: 'center', padding: '24px', color: 'var(--text-secondary)' }}>
                                        No fee structures defined yet. Click "New Structure" to create one.
                                    </td>
                                </tr>
                            ) : (
                                structures.map(struct => (
                                    <tr key={struct.id}>
                                        <td style={{ fontWeight: '600' }}>
                                            {struct.name}
                                            <div style={{ fontSize: '12px', color: 'var(--text-secondary)', fontWeight: '400' }}>
                                                {struct.academicYear} | {struct.gstApplicable ? `GST ${struct.gstPercent}%` : 'No GST'}
                                            </div>
                                        </td>
                                        <td>{struct.courseName || `ID: ${struct.courseId}`}</td>
                                        <td>{struct.batchName || (struct.batchId ? `ID: ${struct.batchId}` : 'All Batches')}</td>
                                        <td>
                                            <div style={{ fontWeight: '600' }}>
                                                {struct.currency} {struct.totalAmount?.toLocaleString() || '-'}
                                            </div>
                                        </td>
                                        <td>
                                            <span className="status-badge pending">
                                                {struct.installmentCount} Installments
                                            </span>
                                        </td>
                                        <td>
                                            {struct.components?.length || 0} Components
                                        </td>
                                        <td>
                                            <span className={`status-badge ${struct.isActive ? 'active' : 'inactive'}`}>
                                                {struct.isActive ? 'Active' : 'Inactive'}
                                            </span>
                                        </td>
                                        <td>
                                            <div style={{ display: 'flex', gap: '8px' }}>
                                                <button
                                                    className="btn-icon"
                                                    onClick={() => handleEdit(struct)}
                                                    title="Edit Structure"
                                                >
                                                    <FiEdit2 size={14} />
                                                </button>
                                                <button
                                                    className="btn-icon"
                                                    onClick={() => handleDelete(struct.id)}
                                                    style={{ color: '#ef4444', background: '#fef2f2', borderColor: '#fee2e2' }}
                                                    title="Delete Structure"
                                                >
                                                    <FiTrash2 size={14} />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                )}
            </div>

            <FeeStructureModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                initialData={editingStructure}
                onSave={handleSave}
                existingStructures={structures}
            />
        </div>
    );
};

export default FeeStructureSettings;
