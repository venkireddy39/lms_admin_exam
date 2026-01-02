import React, { useState } from "react";
import { FiX, FiUser, FiUsers, FiShield, FiTrendingUp, FiSmile } from "react-icons/fi";
import LearnerForm from "./forms/LearnerForm";
import AdminForm from "./forms/AdminForm";
import InstructorForm from "./forms/InstructorForm";
import AffiliateForm from "./forms/AffiliateForm";
import ParentForm from "./forms/ParentForm";
import "./styles/AddUserModal.css";

const AddUserModal = ({ setIsModalOpen, onAddUser, initialUser }) => {
  // Map "Student" -> "Learner" for initial state
  const getInitialRole = () => {
    if (!initialUser) return "Learner";
    if (initialUser.role === "Student") return "Learner";
    return initialUser.role; // Admin, Instructor, Affiliate, Parent...
  };

  const [selectedRole, setSelectedRole] = useState(getInitialRole());

  const handleAdd = (userData) => {
    if (onAddUser) {
      // If editing, preserve ID
      if (initialUser) {
        onAddUser({ ...initialUser, ...userData });
      } else {
        onAddUser(userData);
      }
    }
    setIsModalOpen(false);
  };

  const roleTabs = [
    { id: 'Learner', label: 'Add learner', icon: <FiUser /> },
    { id: 'Admin', label: 'Add admin', icon: <FiShield /> },
    { id: 'Instructor', label: 'Add instructor', icon: <FiUsers /> },
    { id: 'Affiliate', label: 'Add affiliate', icon: <FiTrendingUp /> },
    { id: 'Parent', label: 'Add parent', icon: <FiSmile /> },
  ];

  return (
    <div className="modal-overlay-fixed">
      <div className="modal-box-large">

        {/* Sidebar */}
        <div className="modal-sidebar">
          <h3>{initialUser ? 'Edit User' : 'Add New User'}</h3>
          <div className="role-tabs">
            {roleTabs.map(tab => (
              <button
                key={tab.id}
                className={`role-tab ${selectedRole === tab.id ? 'active' : ''}`}
                onClick={() => setSelectedRole(tab.id)}
                disabled={!!initialUser} // Disable switching roles on edit
                style={{ cursor: initialUser ? 'not-allowed' : 'pointer', opacity: (initialUser && selectedRole !== tab.id) ? 0.5 : 1 }}
              >
                {tab.icon}
                <span>{tab.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Content */}
        <div className="modal-main-content">
          <button className="close-btn-abs" onClick={() => setIsModalOpen(false)}>
            <FiX size={24} />
          </button>

          <div className="form-container">
            {selectedRole === 'Learner' && <LearnerForm onSubmit={handleAdd} onCancel={() => setIsModalOpen(false)} initialValues={initialUser} />}
            {selectedRole === 'Admin' && <AdminForm onSubmit={handleAdd} onCancel={() => setIsModalOpen(false)} initialValues={initialUser} />}
            {selectedRole === 'Instructor' && <InstructorForm onSubmit={handleAdd} onCancel={() => setIsModalOpen(false)} initialValues={initialUser} />}
            {selectedRole === 'Affiliate' && <AffiliateForm onSubmit={handleAdd} onCancel={() => setIsModalOpen(false)} initialValues={initialUser} />}
            {selectedRole === 'Parent' && <ParentForm onSubmit={handleAdd} onCancel={() => setIsModalOpen(false)} initialValues={initialUser} />}
          </div>
        </div>

      </div>
    </div>
  );
};

export default AddUserModal;
