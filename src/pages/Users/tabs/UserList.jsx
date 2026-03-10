import React, { useState, useMemo } from "react";
import { FiSearch, FiEdit2, FiTrash2, FiUserX } from "react-icons/fi";
import { BsToggleOn, BsToggleOff } from "react-icons/bs";
import { USER_STATUS } from "../hooks/useUsers";

const UserList = ({ users, onDelete, onToggleStatus, onEdit, hideRoleFilter, batches = [] }) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [roleFilter, setRoleFilter] = useState("All");
  const [batchFilter, setBatchFilter] = useState("All");

  // UI-only filtering
  const filteredUsers = useMemo(() => {
    const term = searchTerm.toLowerCase();

    return users.filter((user) => {
      // Create user details string for search
      const roleStr = user.role ? String(user.role).toLowerCase() : "";

      const matchesSearch =
        (user.name || "").toLowerCase().includes(term) ||
        (user.email || "").toLowerCase().includes(term) ||
        roleStr.includes(term);

      const matchesRole = roleFilter === "All" ||
        String(user.role).toLowerCase() === roleFilter.toLowerCase() ||
        (user.roleName && user.roleName.replace('ROLE_', '').toLowerCase() === roleFilter.toLowerCase());

      // Batch Filter
      const userBatchIds = user.batches ? user.batches.map(b => String(b.id)) : [];
      const matchesBatch = batchFilter === "All" || userBatchIds.includes(String(batchFilter));

      return matchesSearch && matchesRole && matchesBatch;
    });
  }, [users, searchTerm, roleFilter, batchFilter]);

  return (
    <>
      <div className="users-controls">
        <div className="search-box">
          <FiSearch />
          <input
            type="text"
            placeholder="Search by name, email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        {/* Batch Filter */}
        {batches && batches.length > 0 && (
          <select
            className="role-filter-select"
            style={{ marginLeft: '10px', minWidth: '150px' }}
            value={batchFilter}
            onChange={(e) => setBatchFilter(e.target.value)}
          >
            <option value="All">All Batches</option>
            {batches.map(b => (
              <option key={b.batchId} value={b.batchId}>{b.batchName}</option>
            ))}
          </select>
        )}

        {!hideRoleFilter && (
          <select
            className="role-filter-select"
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
          >
            <option value="All">All Roles</option>
            <option value="Admin">Admin</option>
            <option value="Instructor">Instructor</option>
            <option value="Student">Learner (Student)</option>
            <option value="Parent">Parent</option>
            <option value="Affiliate">Affiliate</option>
          </select>
        )}
      </div>

      <div className="users-table-container">
        <table className="users-table">
          <thead>
            <tr>
              <th>User</th>
              <th>Contact Info</th>
              <th>Role</th>
              <th>Status</th>
              <th>Batch</th>
              <th style={{ textAlign: "right" }}>Actions</th>
            </tr>
          </thead>

          <tbody>
            {filteredUsers.length === 0 ? (
              <tr>
                <td colSpan="6">
                  <div className="empty-state-list">
                    <div className="empty-icon">
                      <FiUserX />
                    </div>
                    <h3>No users found</h3>
                    <p>Try adjusting your search or add a new user.</p>
                  </div>
                </td>
              </tr>
            ) : (
              filteredUsers.map((user) => (
                <tr key={user.id}>
                  <td>
                    <div className="user-profile-cell">
                      <div className="user-avatar">
                        {user.name?.charAt(0) || "?"}
                      </div>
                      <div>
                        <div className="u-name">{user.name}</div>
                        <div className="u-id">ID: #{user.id || user.userId}</div>
                      </div>
                    </div>
                  </td>

                  <td>{user.email}</td>

                  <td>
                    <span className={`role-badge ${String(user.role || "").toLowerCase()}`}>
                      {user.role}
                    </span>
                  </td>

                  <td>
                    <div className={`status-indicator ${(user.status || "active").toLowerCase()}`}>
                      <span className="status-dot"></span>
                      {user.status || "Active"}
                    </div>
                  </td>

                  <td>
                    {user.batches && user.batches.length > 0 ? (
                      <div className="d-flex flex-wrap gap-1">
                        {user.batches.map(b => (
                          <span key={b.id} className="badge bg-light text-dark border" style={{ fontSize: '0.7rem' }}>
                            {b.name}
                          </span>
                        ))}
                      </div>
                    ) : (
                      <span className="text-muted small">-</span>
                    )}
                  </td>



                  <td style={{ textAlign: "right" }}>
                    <button className="icon-btn" title="Edit" onClick={() => onEdit(user)}>
                      <FiEdit2 size={16} />
                    </button>

                    <button
                      className="icon-btn"
                      title={
                        user.status === USER_STATUS.ACTIVE
                          ? "Deactivate User"
                          : "Activate User"
                      }
                      onClick={() => onToggleStatus(user.id)}
                    >
                      {user.status === USER_STATUS.ACTIVE ? (
                        <BsToggleOn size={22} color="#22c55e" />
                      ) : (
                        <BsToggleOff size={22} color="#94a3b8" />
                      )}
                    </button>

                    <button
                      className="icon-btn delete"
                      title="Delete User"
                      onClick={() => onDelete(user.id)}
                    >
                      <FiTrash2 size={16} />
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </>
  );
};

export default UserList;
