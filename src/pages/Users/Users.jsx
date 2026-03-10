
import React, { useState, useEffect } from 'react';
import { FiPlus } from 'react-icons/fi';
import './Users.css';

// Services
import { enrollmentService } from '../Batches/services/enrollmentService';
import { batchService } from '../Batches/services/batchService';
import { userService } from './services/userService';

// Sub-modules
import UserList from './tabs/UserList';
import UserActivityLogs from './tabs/UserActivityLogs';
import AddUserModal from './components/AddUserModal';

const Users = () => {
  const [activeTab, setActiveTab] = useState('all');
  const [isModalOpen, setIsModalOpen] = useState(false);

  const [editingUser, setEditingUser] = useState(null);

  const [users, setUsers] = useState([]);
  const [allBatchesList, setAllBatchesList] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    setLoading(true);
    try {
      // Fetch users and extra linked data
      const [data, enrollments, batches, students, instructors] = await Promise.all([
        userService.getAllUsers().catch(() => []),
        enrollmentService.getAllEnrollments().catch(() => []),
        batchService.getAllBatches().catch(() => []),
        userService.getAllStudents().catch(() => []),
        userService.getAllInstructors().catch(() => [])
      ]);

      const usersList = Array.isArray(data) ? data : [];

      // Create maps for detailed lookup
      const studentMap = {};
      if (Array.isArray(students)) {
        students.forEach(s => { if (s.user?.userId || s.userId) studentMap[s.user?.userId || s.userId] = s; });
      }
      const instructorMap = {};
      if (Array.isArray(instructors)) {
        instructors.forEach(i => { if (i.user?.userId || i.userId) instructorMap[i.user?.userId || i.userId] = i; });
      }

      // Enrich users with batch info and robust date parsing
      const enrichedUsers = usersList.map(u => {
        const uId = u.userId || u.id;

        // Fetch detailed record if available
        const detail = studentMap[uId] || instructorMap[uId] || {};

        // Construct display name if missing
        let displayName = u.name;
        if (!displayName && (u.firstName || u.lastName)) {
          displayName = `${u.firstName || ''} ${u.lastName || ''}`.trim();
        } else if (!displayName && (detail.user?.firstName || detail.user?.lastName)) {
          displayName = `${detail.user?.firstName || ''} ${detail.user?.lastName || ''}`.trim();
        }

        const normalizedUser = { ...u, id: uId, name: displayName || 'Unknown' };

        // Map status
        if (typeof u.enabled !== 'undefined') {
          normalizedUser.status = u.enabled ? 'Active' : 'Inactive';
        }

        // Map role
        if (u.roleName || detail.roleName) {
          const roleMap = {
            'ROLE_STUDENT': 'Student',
            'ROLE_INSTRUCTOR': 'Instructor',
            'ROLE_PARENT': 'Parent',
            'ROLE_AFFILIATE': 'Affiliate',
            'ROLE_ADMIN': 'Admin',
            'ROLE_SUPER_ADMIN': 'Super Admin'
          };
          const rName = u.roleName || detail.roleName;
          normalizedUser.role = roleMap[rName] || rName;
        }

        const userEnrollments = Array.isArray(enrollments) ? enrollments.filter(e => String(e.studentId) === String(uId)) : [];
        const userBatchInfos = userEnrollments.map(e => {
          const b = Array.isArray(batches) ? batches.find(bat => String(bat.batchId) === String(e.batchId)) : null;
          return b ? { id: b.batchId, name: b.batchName } : null;
        }).filter(Boolean);

        return { ...normalizedUser, batches: userBatchInfos };
      });

      setUsers(enrichedUsers);
      setAllBatchesList(Array.isArray(batches) ? batches : []);
    } catch (error) {
      console.error("Failed to load users", error);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteUser = async (id) => {
    if (window.confirm("Are you sure you want to delete this user?")) {
      try {
        await userService.deleteUser(id);
        setUsers(prev => prev.filter(u => u.id !== id));
      } catch (error) {
        alert("Failed to delete user: " + error.message);
      }
    }
  };

  const handleToggleStatus = async (id) => {
    const user = users.find(u => u.id === id);
    if (!user) return;

    try {
      await userService.toggleStatus(id, user.status);
      // Optimistic update
      setUsers(prev => prev.map(u => {
        if (u.id === id) {
          return { ...u, status: u.status === 'Active' ? 'Inactive' : 'Active' };
        }
        return u;
      }));
    } catch (error) {
      alert("Failed to update status: " + error.message);
    }
  };

  const handleEditUser = (user) => {
    setEditingUser(user);
    setIsModalOpen(true);
  };

  const handleSaveUser = async (userData) => {
    try {
      if (editingUser) {
        // TODO: Implement update in userService if needed (PATCH /users/{id})
        alert("Edit functionality requires backend update endpoint implementation.");
      } else {
        // Create new via API
        await userService.createUser(userData);
        alert("User created successfully!");
        loadUsers(); // Reload to get new ID and data
      }
      setEditingUser(null);
      setIsModalOpen(false);
    } catch (error) {
      alert("Error saving user: " + error.message);
    }
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
        <button className={`u-tab ${activeTab === 'instructors' ? 'active' : ''}`} onClick={() => setActiveTab('instructors')}>
          Instructors <span className="u-badge">{users.filter(u =>
            (u.role === 'Instructor' || u.roleName === 'ROLE_INSTRUCTOR')
          ).length}</span>
        </button>
        <button className={`u-tab ${activeTab === 'parents' ? 'active' : ''}`} onClick={() => setActiveTab('parents')}>
          Parents <span className="u-badge">{users.filter(u =>
            (u.role === 'Parent' || u.roleName === 'ROLE_PARENT')
          ).length}</span>
        </button>
        <button className={`u-tab ${activeTab === 'drivers' ? 'active' : ''}`} onClick={() => setActiveTab('drivers')}>
          Drivers <span className="u-badge">{users.filter(u =>
            (u.role === 'Driver' || u.roleName === 'ROLE_DRIVER')
          ).length}</span>
        </button>
        <button className={`u-tab ${activeTab === 'conductors' ? 'active' : ''}`} onClick={() => setActiveTab('conductors')}>
          Conductors <span className="u-badge">{users.filter(u =>
            (u.role === 'Conductor' || u.roleName === 'ROLE_CONDUCTOR')
          ).length}</span>
        </button>
        <button className={`u-tab ${activeTab === 'affiliates' ? 'active' : ''}`} onClick={() => setActiveTab('affiliates')}>
          Affiliates <span className="u-badge">{users.filter(u =>
            String(u.role || '').toLowerCase() === 'affiliate' ||
            String(u.roleName || '').toLowerCase() === 'role_affiliate'
          ).length}</span>
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
            batches={allBatchesList}
          />
        )}
        {activeTab === 'instructors' && (
          <UserList
            users={users.filter(u => u.role === 'Instructor' || u.roleName === 'ROLE_INSTRUCTOR')}
            setUsers={setUsers}
            onDelete={handleDeleteUser}
            onToggleStatus={handleToggleStatus}
            onEdit={handleEditUser}
            hideRoleFilter={true}
            batches={allBatchesList}
          />
        )}
        {activeTab === 'parents' && (
          <UserList
            users={users.filter(u => u.role === 'Parent' || u.roleName === 'ROLE_PARENT')}
            setUsers={setUsers}
            onDelete={handleDeleteUser}
            onToggleStatus={handleToggleStatus}
            onEdit={handleEditUser}
            hideRoleFilter={true}
            batches={allBatchesList}
          />
        )}
        {activeTab === 'drivers' && (
          <UserList
            users={users.filter(u => u.role === 'Driver' || u.roleName === 'ROLE_DRIVER')}
            setUsers={setUsers}
            onDelete={handleDeleteUser}
            onToggleStatus={handleToggleStatus}
            onEdit={handleEditUser}
            hideRoleFilter={true}
            batches={allBatchesList}
          />
        )}
        {activeTab === 'conductors' && (
          <UserList
            users={users.filter(u => u.role === 'Conductor' || u.roleName === 'ROLE_CONDUCTOR')}
            setUsers={setUsers}
            onDelete={handleDeleteUser}
            onToggleStatus={handleToggleStatus}
            onEdit={handleEditUser}
            hideRoleFilter={true}
            batches={allBatchesList}
          />
        )}
        {activeTab === 'affiliates' && (
          <UserList
            users={users.filter(u =>
              String(u.role || '').toLowerCase() === 'affiliate' ||
              String(u.roleName || '').toLowerCase() === 'role_affiliate'
            )}
            setUsers={setUsers}
            onDelete={handleDeleteUser}
            onToggleStatus={handleToggleStatus}
            onEdit={handleEditUser}
            hideRoleFilter={true}
            batches={allBatchesList}
          />
        )}
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
