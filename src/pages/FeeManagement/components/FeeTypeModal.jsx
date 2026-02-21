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
        active: true,
        refundable: false,
        mandatory: true,
        oneTime: true,
        applyLateFee: false,
        applyAutoDebit: false,
        admissionFee: false,
        displayOrder: 1
    });

    useEffect(() => {
        if (initialData) {
            setFormData(initialData);
        } else {
            setFormData({
                name: '',
                description: '',
                active: true,
                refundable: false,
                mandatory: true,
                oneTime: true,
                applyLateFee: false,
                applyAutoDebit: false,
                admissionFee: false,
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
            <div className="modal-box premium-modal" style={{ maxWidth: '600px' }}>
                <div className="modal-head">
                    <h2>{initialData ? 'Edit Fee Type' : 'Create Fee Type'}</h2>
                    <button className="close-btn" onClick={onClose}>
                        <FiX size={24} />
                    </button>
                </div>

                <div className="modal-body">
                    <p className="modal-subtitle">
                        Configure fee type details and rules.
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
                                placeholder="e.g. Admission Fee"
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
                        <div className="form-field full-width" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>

                            <label className="checkbox-label" style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                                <input
                                    type="checkbox"
                                    name="active"
                                    checked={formData.active}
                                    onChange={handleInputChange}
                                />
                                Is Active
                            </label>

                            <label className="checkbox-label" style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                                <input
                                    type="checkbox"
                                    name="refundable"
                                    checked={formData.refundable}
                                    onChange={handleInputChange}
                                />
                                Refundable
                            </label>

                            <label className="checkbox-label" style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                                <input
                                    type="checkbox"
                                    name="mandatory"
                                    checked={formData.mandatory}
                                    onChange={handleInputChange}
                                />
                                Mandatory
                            </label>

                            <label className="checkbox-label" style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                                <input
                                    type="checkbox"
                                    name="oneTime"
                                    checked={formData.oneTime}
                                    onChange={handleInputChange}
                                />
                                One-Time Fee
                            </label>

                            <label className="checkbox-label" style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                                <input
                                    type="checkbox"
                                    name="applyLateFee"
                                    checked={formData.applyLateFee}
                                    onChange={handleInputChange}
                                />
                                Apply Late Fee
                            </label>

                            <label className="checkbox-label" style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                                <input
                                    type="checkbox"
                                    name="applyAutoDebit"
                                    checked={formData.applyAutoDebit}
                                    onChange={handleInputChange}
                                />
                                Auto-Debit
                            </label>
                            <label className="checkbox-label" style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                                <input
                                    type="checkbox"
                                    name="admissionFee"
                                    checked={formData.admissionFee}
                                    onChange={handleInputChange}
                                />
                                Is Admission Fee
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
