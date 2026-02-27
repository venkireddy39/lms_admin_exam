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
        setEditingType(type);
        setIsModalOpen(true);
    };

    const seedDefaults = async () => {
        if (!window.confirm("This will attempt to create default pure fee types (TUITION, ADMISSION, EXAM, MATERIAL, HOSTEL). Continue?")) return;

        const defaults = [
            { name: "TUITION", description: "Main course tuition fee", isActive: true, displayOrder: 1 },
            { name: "ADMISSION", description: "Admission fee", isActive: true, displayOrder: 2 },
            { name: "EXAM", description: "Examination fee", isActive: true, displayOrder: 3 },
            { name: "MATERIAL", description: "Study material fee", isActive: true, displayOrder: 4 },
            { name: "HOSTEL", description: "Hostel accommodation fee", isActive: true, displayOrder: 5 }
        ];

        let successCount = 0;
        for (const type of defaults) {
            try {
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
        <div className="fee-types-container" style={{ padding: '24px' }}>
            <div className="section-title" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '20px', fontWeight: 'bold' }}>
                    <FiList /> Fee Types Management
                </div>
                <div style={{ display: 'flex', gap: '10px' }}>
                    {feeTypes.length === 0 && !loading && (
                        <button className="btn-secondary" onClick={seedDefaults} style={{ display: 'flex', alignItems: 'center', padding: '8px 16px', borderRadius: '4px', border: '1px solid #ccc', cursor: 'pointer', background: '#fff' }}>
                            <FiSettings size={14} style={{ marginRight: '6px' }} />
                            Seed Defaults
                        </button>
                    )}
                    <button className="btn-primary" onClick={openCreateModal} style={{ display: 'flex', alignItems: 'center', padding: '8px 16px', borderRadius: '4px', border: 'none', cursor: 'pointer', background: '#007bff', color: '#fff' }}>
                        <FiPlus style={{ marginRight: '6px' }} /> Create New Fee Type
                    </button>
                </div>
            </div>

            <p style={{ fontSize: 14, color: '#666', marginBottom: '24px' }}>
                Define global fee categories (e.g., TUITION, ADMISSION) that only store naming and order details. Keep it pure.
            </p>

            <div className="glass-card" style={{ padding: 0, overflow: 'hidden', backgroundColor: '#fff', borderRadius: '8px', boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <thead>
                        <tr style={{ background: '#f8fafc', borderBottom: '1px solid #e2e8f0', textAlign: 'left' }}>
                            <th style={{ padding: '16px 24px', fontSize: 13, color: '#64748b' }}>Order</th>
                            <th style={{ padding: '16px 24px', fontSize: 13, color: '#64748b' }}>Name</th>
                            <th style={{ padding: '16px 24px', fontSize: 13, color: '#64748b' }}>Description</th>
                            <th style={{ padding: '16px 24px', fontSize: 13, color: '#64748b' }}>Status</th>
                            <th style={{ padding: '16px 24px', fontSize: 13, color: '#64748b', textAlign: 'right' }}>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {loading ? (
                            <tr><td colSpan="5" style={{ padding: 24, textAlign: 'center' }}>Loading...</td></tr>
                        ) : feeTypes.length === 0 ? (
                            <tr><td colSpan="5" style={{ padding: 24, textAlign: 'center', color: '#94a3b8' }}>No fee types found. Create one to get started.</td></tr>
                        ) : (
                            feeTypes
                                .sort((a, b) => (Number(a.displayOrder ?? 99)) - (Number(b.displayOrder ?? 99)))
                                .map(type => {
                                    // Make sure we read the right property depending on the backend response structure
                                    const isActiveFlag = type.isActive !== undefined ? type.isActive : type.active;

                                    return (
                                        <tr key={type.id || Math.random()} style={{ borderBottom: '1px solid #f1f5f9' }}>
                                            <td style={{ padding: '16px 24px', color: '#64748b' }}>
                                                {type.displayOrder || '-'}
                                            </td>
                                            <td style={{ padding: '16px 24px' }}>
                                                <div style={{ fontWeight: 600, color: '#111827' }}>{type.name}</div>
                                            </td>
                                            <td style={{ padding: '16px 24px', color: '#64748b' }}>
                                                {type.description || '-'}
                                            </td>
                                            <td style={{ padding: '16px 24px' }}>
                                                {isActiveFlag ? (
                                                    <span style={{ fontSize: 12, fontWeight: 500, color: '#16a34a', background: '#dcfce7', padding: '4px 12px', borderRadius: '16px' }}>Active</span>
                                                ) : (
                                                    <span style={{ fontSize: 12, fontWeight: 500, color: '#64748b', background: '#f1f5f9', padding: '4px 12px', borderRadius: '16px' }}>Inactive</span>
                                                )}
                                            </td>
                                            <td style={{ padding: '16px 24px', textAlign: 'right' }}>
                                                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
                                                    <button onClick={() => openEditModal(type)} style={{ color: '#3b82f6', background: '#eff6ff', border: 'none', padding: '8px', borderRadius: '6px', cursor: 'pointer', display: 'flex', alignItems: 'center' }}>
                                                        <FiEdit2 size={16} />
                                                    </button>

                                                    {isActiveFlag && (
                                                        <button onClick={() => handleDelete(type.id)} style={{ color: '#ef4444', background: '#fee2e2', border: 'none', padding: '8px', borderRadius: '6px', cursor: 'pointer', display: 'flex', alignItems: 'center' }}>
                                                            <FiTrash2 size={16} />
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
