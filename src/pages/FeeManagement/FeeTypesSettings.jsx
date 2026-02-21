import React, { useState, useEffect } from 'react';
import { FiPlus, FiTrash2, FiEdit2, FiList, FiSettings } from 'react-icons/fi';
import { feeTypeService } from './services/feeTypeService';
import FeeTypeModal from './components/FeeTypeModal';

const FeeTypesSettings = () => {
    const [feeTypes, setFeeTypes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingType, setEditingType] = useState(null);

    useEffect(() => {
        fetchFeeTypes();
    }, []);

    const fetchFeeTypes = async () => {
        setLoading(true);
        try {
            const data = await feeTypeService.getAllFeeTypes();
            // Backend returns list of fee types
            setFeeTypes(Array.isArray(data) ? data : []);
        } catch (error) {
            console.error("Error fetching fee types:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async (data) => {
        // Frontend duplicate check
        const isDuplicate = feeTypes.some(t =>
            t.name.trim().toLowerCase() === data.name.trim().toLowerCase() &&
            (editingType ? (t.id !== editingType.id) : true)
        );

        if (isDuplicate) {
            alert("A fee type with this name already exists.");
            return;
        }

        try {
            if (editingType) {
                await feeTypeService.updateFeeType(editingType.id, data);
            } else {
                await feeTypeService.createFeeType(data);
            }
            setIsModalOpen(false);
            setEditingType(null);
            fetchFeeTypes();
        } catch (error) {
            console.error("Error saving fee type:", error);
            alert(error.message || "Failed to save fee type.");
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm("Are you sure you want to deactivate this fee type?")) return;
        try {
            await feeTypeService.deleteFeeType(id);
            fetchFeeTypes();
        } catch (error) {
            console.error("Error deleting fee type:", error);
            alert("Failed to delete fee type.");
        }
    };

    const openCreateModal = () => {
        setEditingType(null);
        setIsModalOpen(true);
    };

    const openEditModal = (type) => {
        // Normalize data for modal
        setEditingType({
            ...type,
            active: type.active ?? type.isActive
        });
        setIsModalOpen(true);
    };

    const seedDefaults = async () => {
        if (!window.confirm("This will attempt to create default fee types (Admission, Tuition, Lab, etc.). Continue?")) return;

        const defaults = [
            { name: "Admission Fee", description: "One time non refundable fee", active: true, refundable: false, mandatory: true, oneTime: true, applyLateFee: false, applyAutoDebit: false, admissionFee: true, displayOrder: 1 },
            { name: "Tuition Fee", description: "Monthly recurring fee", active: true, refundable: false, mandatory: true, oneTime: false, applyLateFee: true, applyAutoDebit: true, admissionFee: false, displayOrder: 2 },
            { name: "Lab Fee", description: "Laboratory usage fee", active: true, refundable: false, mandatory: true, oneTime: false, applyLateFee: false, applyAutoDebit: true, admissionFee: false, displayOrder: 3 },
            { name: "Exam Fee", description: "Examination processing fee", active: true, refundable: false, mandatory: true, oneTime: false, applyLateFee: true, applyAutoDebit: false, admissionFee: false, displayOrder: 4 },
            { name: "Hostel Fee", description: "Accommodation fee", active: true, refundable: true, mandatory: false, oneTime: false, applyLateFee: true, applyAutoDebit: true, admissionFee: false, displayOrder: 5 },
            { name: "Transport Fee", description: "Transportation service fee", active: true, refundable: true, mandatory: false, oneTime: false, applyLateFee: true, applyAutoDebit: true, admissionFee: false, displayOrder: 6 },
            { name: "Material Fee", description: "Course material and books", active: true, refundable: false, mandatory: true, oneTime: true, applyLateFee: false, applyAutoDebit: false, admissionFee: false, displayOrder: 7 },
            { name: "Certificate Fee", description: "Completion certificate cost", active: true, refundable: false, mandatory: true, oneTime: true, applyLateFee: false, applyAutoDebit: false, admissionFee: false, displayOrder: 8 },
            { name: "Batch Fee", description: "Standard fee for the batch", active: true, refundable: false, mandatory: true, oneTime: false, applyLateFee: true, applyAutoDebit: true, admissionFee: false, displayOrder: 9 },
        ];

        let successCount = 0;
        for (const type of defaults) {
            try {
                // Check local duplicate first to avoid unnecessary API calls
                const exists = feeTypes.some(t => t.name.toLowerCase() === type.name.toLowerCase());
                if (!exists) {
                    await feeTypeService.createFeeType(type);
                    successCount++;
                }
            } catch (e) {
                console.warn(`Skipping ${type.name}`);
            }
        }
        alert(`Process complete. Created ${successCount} new fee types.`);
        fetchFeeTypes();
    };

    return (
        <div className="fee-types-container">
            <div className="section-title">
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <FiList /> Fee Types Management
                </div>
                <div style={{ marginLeft: 'auto', display: 'flex', gap: '10px' }}>
                    {feeTypes.length === 0 && !loading && (
                        <button className="btn-secondary" onClick={seedDefaults} style={{ fontSize: '13px' }}>
                            <FiSettings size={14} style={{ marginRight: '6px' }} />
                            Seed Defaults
                        </button>
                    )}
                    <button className="btn-primary" onClick={openCreateModal}>
                        <FiPlus /> Create New Fee Type
                    </button>
                </div>
            </div>

            <p style={{ fontSize: 13, color: 'var(--text-secondary)', marginBottom: 24 }}>
                Define global fee categories (e.g., Tuition Fee, Exam Fee) to be used when creating standard fee structures.
            </p>

            <div className="glass-card" style={{ padding: 0, overflow: 'hidden' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <thead>
                        <tr style={{ background: '#f8fafc', borderBottom: '1px solid #e2e8f0', textAlign: 'left' }}>
                            <th style={{ padding: '12px 16px', fontSize: 13, color: '#64748b' }}>Order</th>
                            <th style={{ padding: '12px 16px', fontSize: 13, color: '#64748b' }}>Name</th>
                            <th style={{ padding: '12px 16px', fontSize: 13, color: '#64748b' }}>Type</th>
                            <th style={{ padding: '12px 16px', fontSize: 13, color: '#64748b' }}>Config</th>
                            <th style={{ padding: '12px 16px', fontSize: 13, color: '#64748b' }}>Status</th>
                            <th style={{ padding: '12px 16px', fontSize: 13, color: '#64748b', textAlign: 'right' }}>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {loading ? (
                            <tr><td colSpan="6" style={{ padding: 24, textAlign: 'center' }}>Loading...</td></tr>
                        ) : feeTypes.length === 0 ? (
                            <tr><td colSpan="6" style={{ padding: 24, textAlign: 'center', color: '#94a3b8' }}>No fee types found. Create one to get started.</td></tr>
                        ) : (
                            feeTypes
                                .sort((a, b) => (Number(a.displayOrder ?? 99)) - (Number(b.displayOrder ?? 99)))
                                .map(type => {
                                    // Normalize active status for display
                                    const isActive = type.active ?? type.isActive;

                                    return (
                                        <tr key={type.id || Math.random()} style={{ borderBottom: '1px solid #f1f5f9' }}>
                                            <td style={{ padding: '12px 16px', color: '#64748b' }}>
                                                {type.displayOrder || '-'}
                                            </td>
                                            <td style={{ padding: '12px 16px' }}>
                                                <div style={{ fontWeight: 500 }}>{type.name}</div>
                                                <div style={{ fontSize: 12, color: '#94a3b8' }}>{type.description}</div>
                                            </td>
                                            <td style={{ padding: '12px 16px' }}>
                                                {type.oneTime ?
                                                    <span className="badge-gray" style={{ background: '#f1f5f9', color: '#475569', padding: '2px 6px', borderRadius: '4px', fontSize: '11px' }}>One-Time</span> :
                                                    <span className="badge-blue" style={{ background: '#eff6ff', color: '#2563eb', padding: '2px 6px', borderRadius: '4px', fontSize: '11px' }}>Recurring</span>
                                                }
                                                {type.admissionFee && <div style={{ fontSize: 11, color: '#ea580c', fontWeight: 500, marginTop: 4 }}>Admission</div>}
                                            </td>
                                            <td style={{ padding: '12px 16px', fontSize: 12 }}>
                                                <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                                                    {type.mandatory && <span title="Mandatory" style={{ color: '#ef4444', background: '#fee2e2', padding: '2px 6px', borderRadius: '4px', fontSize: '10px' }}>Mandatory</span>}
                                                    {type.refundable && <span title="Refundable" style={{ color: '#16a34a', background: '#dcfce7', padding: '2px 6px', borderRadius: '4px', fontSize: '10px' }}>Refundable</span>}
                                                    {type.applyLateFee && <span title="Late Fee Applicable" style={{ color: '#d97706', background: '#fef3c7', padding: '2px 6px', borderRadius: '4px', fontSize: '10px' }}>Late Fee</span>}
                                                    {type.applyAutoDebit && <span title="Auto Debit Enabled" style={{ color: '#4f46e5', background: '#e0e7ff', padding: '2px 6px', borderRadius: '4px', fontSize: '10px' }}>Auto-Debit</span>}
                                                </div>
                                            </td>
                                            <td style={{ padding: '12px 16px' }}>
                                                {isActive ? (
                                                    <span className="status-badge paid" style={{ fontSize: 11, color: '#16a34a', background: '#dcfce7', padding: '2px 8px', borderRadius: '12px' }}>Active</span>
                                                ) : (
                                                    <span className="status-badge overdue" style={{ fontSize: 11, color: '#64748b', background: '#f1f5f9', padding: '2px 8px', borderRadius: '12px' }}>Inactive</span>
                                                )}
                                            </td>
                                            <td style={{ padding: '12px 16px', textAlign: 'right' }}>
                                                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8 }}>
                                                    <button onClick={() => openEditModal(type)} className="btn-icon" style={{ color: '#3b82f6', background: '#eff6ff', border: 'none', padding: '6px', borderRadius: '4px', cursor: 'pointer' }}>
                                                        <FiEdit2 size={14} />
                                                    </button>

                                                    {isActive && (
                                                        <button onClick={() => handleDelete(type.id)} className="btn-icon" style={{ color: '#ef4444', background: '#fee2e2', border: 'none', padding: '6px', borderRadius: '4px', cursor: 'pointer' }}>
                                                            <FiTrash2 size={14} />
                                                        </button>
                                                    )}
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                })
                        )}
                    </tbody>
                </table>
            </div>

            <FeeTypeModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                initialData={editingType}
                onSave={handleSave}
            />
        </div>
    );
};

export default FeeTypesSettings;
