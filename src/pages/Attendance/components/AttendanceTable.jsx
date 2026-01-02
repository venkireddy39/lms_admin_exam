
import React from 'react';
import { ATTENDANCE_STATUS } from '../constants/attendanceConstants';
import { FiCheck, FiX, FiClock, FiMinusCircle } from 'react-icons/fi';

const AttendanceTable = ({ students, onStatusChange, isEditable }) => {
    return (
        <div className="att-table-container">
            <table className="att-table">
                <thead>
                    <tr>
                        <th>Student Name</th>
                        <th>Status</th>
                        <th>Remarks</th>
                    </tr>
                </thead>
                <tbody>
                    {students.map((student) => (
                        <tr key={student.studentId} className={isEditable ? '' : 'disabled-row'}>
                            <td className="student-name-cell">
                                <div className="avatar-placeholder">{student.name.charAt(0)}</div>
                                <span>{student.name}</span>
                            </td>
                            <td>
                                <div className="status-options">
                                    <button
                                        className={`status-btn present ${student.status === ATTENDANCE_STATUS.PRESENT ? 'active' : ''}`}
                                        onClick={() => onStatusChange(student.studentId, ATTENDANCE_STATUS.PRESENT)}
                                        disabled={!isEditable}
                                    >
                                        <FiCheck /> Present
                                    </button>
                                    <button
                                        className={`status-btn absent ${student.status === ATTENDANCE_STATUS.ABSENT ? 'active' : ''}`}
                                        onClick={() => onStatusChange(student.studentId, ATTENDANCE_STATUS.ABSENT)}
                                        disabled={!isEditable}
                                    >
                                        <FiX /> Absent
                                    </button>
                                    <button
                                        className={`status-btn late ${student.status === ATTENDANCE_STATUS.LATE ? 'active' : ''}`}
                                        onClick={() => onStatusChange(student.studentId, ATTENDANCE_STATUS.LATE)}
                                        disabled={!isEditable}
                                    >
                                        <FiClock /> Late
                                    </button>
                                    <button
                                        className={`status-btn excused ${student.status === ATTENDANCE_STATUS.EXCUSED ? 'active' : ''}`}
                                        onClick={() => onStatusChange(student.studentId, ATTENDANCE_STATUS.EXCUSED)}
                                        disabled={!isEditable}
                                    >
                                        <FiMinusCircle /> Excused
                                    </button>
                                </div>
                            </td>
                            <td>
                                <input
                                    type="text"
                                    placeholder="Add remark..."
                                    className="remark-input"
                                    disabled={!isEditable}
                                />
                            </td>
                        </tr>
                    ))}
                    {students.length === 0 && (
                        <tr>
                            <td colSpan="3" className="text-center py-4">No students found in this batch.</td>
                        </tr>
                    )}
                </tbody>
            </table>
        </div>
    );
};

export default AttendanceTable;
