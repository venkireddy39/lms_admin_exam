import React, { useState } from 'react';
import { FiPlus } from 'react-icons/fi';
import './Users.css';

// Sub-modules
import UserList from './tabs/UserList';
import InstructorRequests from './tabs/InstructorRequests';
import UserActivityLogs from './tabs/UserActivityLogs';
import AddUserModal from './components/AddUserModal';

const Users = () => {
  const [activeTab, setActiveTab] = useState('all');
  const [isModalOpen, setIsModalOpen] = useState(false);

  const [requestCount] = useState(2);
  const [editingUser, setEditingUser] = useState(null);

  const [users, setUsers] = useState([
    { id: 1, name: "John Doe", email: "john@example.com", role: "Student", status: "Active", joined: "2024-01-15" },
    { id: 2, name: "Sarah Smith", email: "sarah@example.com", role: "Instructor", status: "Active", joined: "2024-02-01" },
    { id: 3, name: "Michael Brown", email: "mike@example.com", role: "Admin", status: "Active", joined: "2023-11-20" },
    { id: 4, name: "Emma Wilson", email: "emma@example.com", role: "Student", status: "Inactive", joined: "2024-03-10" },
    { id: 5, name: "Robert Fox", email: "robert@parent.com", role: "Parent", status: "Active", joined: "2024-04-05" },
    { id: 6, name: "Jenny Cooper", email: "jenny@affiliate.com", role: "Affiliate", status: "Active", joined: "2024-04-12" },
  ]);

  const handleDeleteUser = (id) => {
    if (window.confirm("Are you sure you want to delete this user?")) {
      setUsers(prev => prev.filter(u => u.id !== id));
    }
  };

  const handleToggleStatus = (id) => {
    setUsers(prev => prev.map(u => {
      if (u.id === id) {
        return { ...u, status: u.status === 'Active' ? 'Inactive' : 'Active' };
      }
      return u;
    }));
  };

  const handleEditUser = (user) => {
    setEditingUser(user);
    setIsModalOpen(true);
  };

  const handleSaveUser = (userData) => {
    if (editingUser) {
      // Update existing
      setUsers(prev => prev.map(u => u.id === userData.id ? { ...u, ...userData } : u));
    } else {
      // Create new
      const newUser = {
        ...userData,
        id: Date.now(),
        status: userData.status || 'Active', // Default status
        joined: new Date().toISOString().split('T')[0]
      };
      setUsers(prev => [...prev, newUser]);
    }
    setEditingUser(null);
    setIsModalOpen(false);
  };

  const openAddModal = () => {
    setEditingUser(null);
    setIsModalOpen(true);
  };

  return (
    <div className="users-page">
      <header className="users-header">
        <div className="users-title">
          <h1>User Management</h1>
          <p>Manage students, instructors, and system administrators.</p>
        </div>
        <button className="btn-add-user" onClick={openAddModal}>
          <FiPlus size={18} /> Add New User
        </button>
      </header>

      {/* TAB NAVIGATION */}
      <div className="users-tabs">
        <button className={`u-tab ${activeTab === 'all' ? 'active' : ''}`} onClick={() => setActiveTab('all')}>
          All Users <span className="u-badge">{users.length}</span>
        </button>
        <button className={`u-tab ${activeTab === 'approvals' ? 'active' : ''}`} onClick={() => setActiveTab('approvals')}>
          Instructor Requests <span className="u-badge warning">{requestCount}</span>
        </button>
        <button className={`u-tab ${activeTab === 'logs' ? 'active' : ''}`} onClick={() => setActiveTab('logs')}>
          Activity Logs
        </button>
      </div>

      {/* CONTENT AREA */}
      <div className="users-content">
        {activeTab === 'all' && (
          <UserList
            users={users}
            setUsers={setUsers}
            onDelete={handleDeleteUser}
            onToggleStatus={handleToggleStatus}
            onEdit={handleEditUser}
          />
        )}
        {activeTab === 'approvals' && <InstructorRequests />}
        {activeTab === 'logs' && <UserActivityLogs />}
      </div>

      {/* ADD/EDIT USER MODAL */}
      {isModalOpen && (
        <AddUserModal
          setIsModalOpen={(val) => {
            setIsModalOpen(val);
            if (!val) setEditingUser(null);
          }}
          onAddUser={handleSaveUser}
          initialUser={editingUser}
        />
      )}
    </div>
  );
};

export default Users;