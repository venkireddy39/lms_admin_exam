import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { UserPlus } from 'lucide-react';
import { useMembers } from '../../hooks/useMembers';
import { useToast } from '../../context/ToastContext';
import { normalizeMember, validateMember } from '../../utils/memberRules';
import { ROLES, CATEGORIES, STATUS } from '../../utils/constants';

import MemberFilters from './components/MemberFilters';
import MemberTable from './components/MemberTable';
import MemberModal from './components/MemberModal';
import '../books/BookList.css';
import './Member.css';

const MemberList = () => {
    const toast = useToast();
    const { members, loading, createMember, updateMember, toggleMemberStatus } =
        useMembers(toast);

    const [searchTerm, setSearchTerm] = useState('');
    const [filterRole, setFilterRole] = useState('ALL');

    const [editingMember, setEditingMember] = useState(null);
    const [addingMember, setAddingMember] = useState(null);

    /* ---------- FILTER ---------- */

    const filteredMembers = useMemo(() => {
        const q = searchTerm.toLowerCase();
        return members.filter(m => {
            const matchesSearch =
                m.name?.toLowerCase().includes(q) ||
                m.email?.toLowerCase().includes(q) ||
                m.memberId?.toLowerCase().includes(q) ||
                m.mobile?.includes(q);

            const matchesRole = filterRole === 'ALL' || m.role === filterRole;
            return matchesSearch && matchesRole;
        });
    }, [members, searchTerm, filterRole]);

    /* ---------- ACTIONS ---------- */

    const handleCreate = async (form) => {
        const error = validateMember(form);
        if (error) {
            toast.error(error);
            return;
        }

        const normalized = normalizeMember(form);
        const success = await createMember(normalized);

        if (success) {
            setAddingMember(null);
            toast.success('Member created');
        }
    };

    const handleUpdate = async (form) => {
        const error = validateMember(form);
        if (error) {
            toast.error(error);
            return;
        }

        const normalized = normalizeMember(form);
        const success = await updateMember(form.id, normalized);

        if (success) {
            setEditingMember(null);
            toast.success('Member updated');
        }
    };

    const handleToggleStatus = async (id, currentStatus) => {
        const success = await toggleMemberStatus(id, currentStatus);
        if (success) {
            toast.success(`Member ${currentStatus === 'ACTIVE' ? 'blocked' : 'unblocked'}`);
        }
    };

    /* ---------- NAVIGATION ---------- */
    const navigate = useNavigate();

    const handleIssueBook = (member) => {
        navigate('/library/issues/new', {
            state: { preSelectedMember: member }
        });
    };

    /* ---------- UI ---------- */

    return (
        <div className="container-fluid p-4">
            <div className="d-flex justify-content-between mb-4">
                <div>
                    <h3>Library Members</h3>
                    <p className="text-muted">
                        All students from User Management (department field optional)
                    </p>
                </div>

                <div className="alert alert-info mb-0" style={{ maxWidth: '400px' }}>
                    <small>
                        <strong>ℹ️ Note:</strong> Members are synced from User Management.
                        To add/edit members, go to <strong>User Management</strong> and assign departments to students.
                    </small>
                </div>
            </div>

            <div className="card shadow-sm border-0">
                <div className="card-body">
                    <MemberFilters
                        searchTerm={searchTerm}
                        setSearchTerm={setSearchTerm}
                        filterRole={filterRole}
                        setFilterRole={setFilterRole}
                    />

                    <MemberTable
                        members={filteredMembers}
                        loading={loading}
                        onEdit={setEditingMember}
                        onDelete={handleToggleStatus}
                        onIssue={handleIssueBook}
                    />
                </div>
            </div>

            {/* Edit Member Modal */}
            {editingMember && (
                <MemberModal
                    member={editingMember}
                    onClose={() => setEditingMember(null)}
                    onSave={handleUpdate}
                />
            )}
        </div>
    );

};

export default MemberList;
