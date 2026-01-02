import React from "react";
import { FiEdit2, FiTrash2 } from "react-icons/fi";
import { BsToggleOn, BsToggleOff } from "react-icons/bs";
import { USER_STATUS } from "../hooks/useUsers";
import { canManageUser } from "../users.permissions";

const UserRow = ({
  user,
  currentUserRole,
  onDelete,
  onToggleStatus,
}) => {
  // ONE permission check
  const canManage = canManageUser(currentUserRole, user.role);

  return (
    <tr>
      <td>
        <div className="user-profile-cell">
          <div className="user-avatar">
            {user.name?.charAt(0) || "?"}
          </div>
          <div>
            <div className="u-name">{user.name}</div>
            <div className="u-id">ID: #{user.id}</div>
          </div>
        </div>
      </td>

      <td>{user.email}</td>

      <td>
        <span className={`role-badge ${user.role.toLowerCase()}`}>
          {user.role}
        </span>
      </td>

      <td>{user.status}</td>

      <td>{user.joined}</td>

      <td style={{ textAlign: "right" }}>
        <button className="icon-btn" title="Edit">
          <FiEdit2 />
        </button>

        {/* TOGGLE STATUS */}
        <button
          className={`icon-btn ${!canManage ? "action-disabled" : ""}`}
          title={
            canManage
              ? user.status === USER_STATUS.ACTIVE
                ? "Deactivate User"
                : "Activate User"
              : "You don't have permission"
          }
          disabled={!canManage}
          onClick={() => canManage && onToggleStatus(user.id)}
        >
          {user.status === USER_STATUS.ACTIVE ? (
            <BsToggleOn size={22} />
          ) : (
            <BsToggleOff size={22} />
          )}
        </button>

        {/* DELETE USER */}
        <button
          className={`icon-btn delete ${!canManage ? "action-disabled" : ""}`}
          title={canManage ? "Delete User" : "You don't have permission"}
          disabled={!canManage}
          onClick={() => canManage && onDelete(user.id)}
        >
          <FiTrash2 />
        </button>
      </td>
    </tr>
  );
};

export default UserRow;
