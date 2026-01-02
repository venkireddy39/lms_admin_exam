import React from "react";
import { FiClock, FiAlertCircle } from "react-icons/fi";

const ACTIVITY_LOGS = [
  {
    id: 1,
    user: "Michael Brown",
    action: "Updated Course Settings",
    type: "INFO",
    ip: "192.168.1.1",
    time: "2 mins ago",
  },
  {
    id: 2,
    user: "Sarah Smith",
    action: "Published New Quiz",
    type: "INFO",
    ip: "192.168.1.45",
    time: "1 hour ago",
  },
  {
    id: 3,
    user: "John Doe",
    action: "Failed Login Attempt",
    type: "ERROR",
    ip: "10.0.0.5",
    time: "3 hours ago",
  },
  {
    id: 4,
    user: "System",
    action: "Daily Backup Completed",
    type: "SYSTEM",
    ip: "Server",
    time: "5 hours ago",
  },
];

const UserActivityLogs = () => {
  if (ACTIVITY_LOGS.length === 0) {
    return (
      <div className="empty-state">
        <FiClock size={32} />
        <p>No activity logs available.</p>
      </div>
    );
  }

  return (
    <div className="users-table-container">
      <table className="users-table">
        <thead>
          <tr>
            <th>Time</th>
            <th>User</th>
            <th>Action</th>
            <th>IP Address</th>
          </tr>
        </thead>

        <tbody>
          {ACTIVITY_LOGS.map((log) => (
            <tr key={log.id}>
              <td className="log-time">
                <FiClock className="log-icon" />
                {log.time}
              </td>

              <td className="log-user">{log.user}</td>

              <td>
                {log.type === "ERROR" ? (
                  <span className="log-error">
                    <FiAlertCircle /> {log.action}
                  </span>
                ) : (
                  <span className="log-info">{log.action}</span>
                )}
              </td>

              <td className="log-ip">{log.ip}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default UserActivityLogs;
