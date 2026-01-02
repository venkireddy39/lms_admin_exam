import { USER_ROLES } from "./hooks/useUsers";

/**
 * Permission map
 * Who can manage which roles
 */
export const PERMISSIONS = {
  [USER_ROLES.ADMIN]: [
    USER_ROLES.ADMIN,
    USER_ROLES.SUBADMIN,
    USER_ROLES.INSTRUCTOR,
    USER_ROLES.PARENT,
    USER_ROLES.STUDENT,
  ],

  [USER_ROLES.SUBADMIN]: [
    USER_ROLES.STUDENT,
  ],

  [USER_ROLES.INSTRUCTOR]: [],

  [USER_ROLES.PARENT]: [],

  [USER_ROLES.STUDENT]: [],
};

/**
 * Helper function
 */
export const canManageUser = (currentUserRole, targetUserRole) => {
  const allowedRoles = PERMISSIONS[currentUserRole] || [];
  return allowedRoles.includes(targetUserRole);
};
