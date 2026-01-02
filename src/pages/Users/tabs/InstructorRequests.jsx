import React from "react";
import { FiUserCheck } from "react-icons/fi";

const InstructorRequests = ({ requests = [], onApprove }) => {
  if (requests.length === 0) {
    return (
      <div className="empty-state">
        <FiUserCheck size={32} />
        <p>No pending instructor requests.</p>
      </div>
    );
  }

  return (
    <div className="users-table-container">
      <table className="users-table">
        <thead>
          <tr>
            <th>Instructor Name</th>
            <th>Specialty</th>
            <th>Experience</th>
            <th>Request Date</th>
            <th style={{ textAlign: "right" }}>Decision</th>
          </tr>
        </thead>
        <tbody>
          {requests.map((inst) => (
            <tr key={inst.id}>
              <td>{inst.name}</td>
              <td>{inst.specialty}</td>
              <td>{inst.experience}</td>
              <td>{inst.date}</td>
              <td style={{ textAlign: "right" }}>
                <button onClick={() => onApprove(inst)}>
                  Approve
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default InstructorRequests;
