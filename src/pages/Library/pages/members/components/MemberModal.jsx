import React, { useState } from 'react';
import { ROLES, CATEGORIES, STATUS } from '../../../utils/constants';

const MemberModal = ({ member, onClose, onSave, isNew }) => {
    const [form, setForm] = useState(member);
    const [saving, setSaving] = useState(false);

    const handleChange = (field, value) => {
        setForm(prev => ({ ...prev, [field]: value }));
    };

    const handleSave = async () => {
        setSaving(true);
        await onSave(form);
        setSaving(false);
    };

    const isEmployee =
        form.role !== ROLES.MEMBER || form.category === CATEGORIES.FACULTY;

    const idLabel = isEmployee ? 'Employee ID' : 'Student ID / Roll No.';

    return (
        <div className="modal show d-block" style={{ background: 'rgba(0,0,0,.5)' }}>
            <div className="modal-dialog modal-dialog-centered">
                <div className="modal-content">

                    <div className="modal-header">
                        <h5>{isNew ? 'Register New Member' : 'Edit Member'}</h5>
                        <button className="btn-close" onClick={onClose} />
                    </div>

                    <div className="modal-body">
                        <input
                            className="form-control mb-2"
                            placeholder="Full Name"
                            value={form.name || ''}
                            onChange={e => handleChange('name', e.target.value)}
                        />

                        <input
                            className="form-control mb-2"
                            placeholder="Email Address"
                            value={form.email || ''}
                            onChange={e => handleChange('email', e.target.value)}
                        />

                        <input
                            className="form-control mb-3"
                            placeholder="Mobile Number"
                            value={form.mobile || ''}
                            onChange={e => handleChange('mobile', e.target.value)}
                        />

                        <div className="row g-2 mb-3">
                            <div className="col-md-6">
                                <select
                                    className="form-select"
                                    value={form.role}
                                    onChange={e => handleChange('role', e.target.value)}
                                >
                                    <option value={ROLES.MEMBER}>Member</option>
                                    <option value={ROLES.LIBRARIAN}>Librarian</option>
                                    <option value={ROLES.ADMIN}>Admin</option>
                                </select>
                            </div>

                            <div className="col-md-6">
                                <input
                                    className="form-control"
                                    placeholder={idLabel}
                                    value={form.memberId || ''}
                                    onChange={e => handleChange('memberId', e.target.value)}
                                />
                            </div>
                        </div>

                        <div className="row g-2 mb-3">
                            <div className="col-md-12">
                                <select
                                    className="form-select"
                                    value={form.category}
                                    onChange={e => handleChange('category', e.target.value)}
                                >
                                    <option value="Student">Student</option>
                                    <option value="Faculty">Faculty</option>
                                </select>
                            </div>
                        </div>

                        <div className="row g-2">
                            <div className="col-md-12">
                                <select
                                    className="form-select"
                                    value={form.status}
                                    onChange={e => handleChange('status', e.target.value)}
                                >
                                    <option value={STATUS.ACTIVE}>ACTIVE</option>
                                    <option value={STATUS.BLOCKED}>BLOCKED</option>
                                </select>
                            </div>
                        </div>
                    </div>

                    <div className="modal-footer">
                        <button className="btn btn-light" onClick={onClose}>
                            Cancel
                        </button>
                        <button
                            className="btn btn-primary"
                            onClick={handleSave}
                            disabled={saving}
                        >
                            {saving ? 'Saving...' : isNew ? 'Create Member' : 'Save Changes'}
                        </button>
                    </div>

                </div>
            </div>
        </div>
    );
};

export default MemberModal;
