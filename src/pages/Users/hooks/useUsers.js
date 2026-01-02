import { useState, useCallback } from "react";

export const USER_STATUS = {
  ACTIVE: "Active",
  INACTIVE: "Inactive",
};

export const USER_ROLES = {
  STUDENT: "Student",
  INSTRUCTOR: "Instructor",
  ADMIN: "Admin", // Admin = SuperAdmin
  SUBADMIN: "SubAdmin",
  PARENT: "Parent",
};

export const useUsers = (initialUsers = []) => {
  const [users, setUsers] = useState(initialUsers);

  // ADD
  const addUser = useCallback((newUser) => {
    setUsers((prev) => [...prev, newUser]);
  }, []);

  // UPDATE
  const updateUser = useCallback((userId, updatedData) => {
    setUsers((prev) =>
      prev.map((user) =>
        user.id === userId
          ? { ...user, ...updatedData }
          : user
      )
    );
  }, []);

  // DELETE
  const deleteUser = useCallback((userId) => {
    setUsers((prev) => prev.filter((user) => user.id !== userId));
  }, []);

  // TOGGLE STATUS
  const toggleUserStatus = useCallback((userId) => {
    setUsers((prev) =>
      prev.map((user) =>
        user.id === userId
          ? {
              ...user,
              status:
                user.status === USER_STATUS.ACTIVE
                  ? USER_STATUS.INACTIVE
                  : USER_STATUS.ACTIVE,
            }
          : user
      )
    );
  }, []);

  return {
    users,
    addUser,
    updateUser,
    deleteUser,
    toggleUserStatus,
  };
};

