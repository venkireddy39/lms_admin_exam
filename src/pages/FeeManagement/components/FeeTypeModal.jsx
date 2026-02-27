import React, { useEffect, useState } from 'react';
import { FiX } from "react-icons/fi";

const FeeTypeModal = ({
    isOpen,
    onClose,
    initialData,
    onSave
}) => {
    const [formData, setFormData] = useState({
        name: '',
        description: '',
        isActive: true,
        displayOrder: 1
    });

    useEffect(() => {
        if (initialData) {
            setFormData({
                name: initialData.name || '',
                description: initialData.description || '',
                isActive: initialData.isActive !== undefined ? initialData.isActive : true,
                displayOrder: initialData.displayOrder || 1
            });
        } else {
            setFormData({
                name: '',
                description: '',
                isActive: true,
                displayOrder: 1
            });
        }
    }, [initialData, isOpen]);

    const handleInputChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
    };

    const handleSubmit = () => {
        onSave(formData);
    };

    if (!isOpen) return null;

    return (
        <div className="modal-overlay-fixed">
            <div className="modal-box premium-modal" style={{ maxWidth: '500px' }}>
                <div className="modal-head">
                    <h2>{initialData ? 'Edit Fee Type' : 'Create Fee Type'}</h2>
                    <button className="close-btn" onClick={onClose}>
                        <FiX size={24} />
                    </button>
                </div>

                <div className="modal-body">
                    <p className="modal-subtitle">
                        Create clean fee categories without automation logic.
                    </p>

                    <div className="form-group-grid">

                        {/* Name */}
                        <div className="form-field full-width">
                            <label>Name <span className="req">*</span></label>
                            <input
                                type="text"
                                className="form-input"
                                name="name"
                                value={formData.name}
                                onChange={handleInputChange}
                                placeholder="e.g. TUITION, ADMISSION"
                            />
                        </div>

                        {/* Description */}
                        <div className="form-field full-width">
                            <label>Description</label>
                            <input
                                type="text"
                                className="form-input"
                                name="description"
                                value={formData.description}
                                onChange={handleInputChange}
                                placeholder="Fee description..."
                            />
                        </div>

                        {/* Display Order */}
                        <div className="form-field full-width">
                            <label>Display Order</label>
                            <input
                                type="number"
                                className="form-input"
                                name="displayOrder"
                                value={formData.displayOrder}
                                onChange={handleInputChange}
                                placeholder="e.g. 1"
                            />
                        </div>

                        {/* Configuration Flags */}
                        <div className="form-field full-width">
                            <label className="checkbox-label" style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                                <input
                                    type="checkbox"
                                    name="isActive"
                                    checked={formData.isActive}
                                    onChange={handleInputChange}
                                />
                                Is Active
                            </label>
                        </div>
                    </div>
                </div>

                <div className="modal-footer">
                    <button className="btn-secondary" onClick={onClose}>Cancel</button>
                    <button className="btn-primary" onClick={handleSubmit} disabled={!formData.name}>
                        {initialData ? 'Update' : 'Create'}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default FeeTypeModal;
