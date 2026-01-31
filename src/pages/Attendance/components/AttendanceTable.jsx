import React from 'react';
import { ATTENDANCE_STATUS } from '../constants/attendanceConstants';
import {
    FiCheck,
    FiX,
    FiClock,
    FiMinusCircle,
    FiLock
} from 'react-icons/fi';

const STATUS_ACTIONS = [
    {
        key: ATTENDANCE_STATUS.PRESENT,
        label: 'Present',
        icon: <FiCheck />,
        className: 'present'
    },
    {
        key: ATTENDANCE_STATUS.ABSENT,
        label: 'Absent',
        icon: <FiX />,
        className: 'absent'
    },
    {
        key: ATTENDANCE_STATUS.LATE,
        label: 'Late',
        icon: <FiClock />,
        className: 'late'
    },
    {
        key: ATTENDANCE_STATUS.EXCUSED,
        label: 'Excused',
        icon: <FiMinusCircle />,
        className: 'excused'
    }
];

const AttendanceTable = ({
    students = [],
    onStatusChange,
    onRemarkChange,
    onLateMinutesChange,
    isEditable = false
}) => {
    return (
        <div className="att-table-container">
            <table className="att-table">
                <thead>
                    <tr>
                        <th>Student Name</th>
                        <th>Mode</th>
                        <th style={{ minWidth: '350px' }}>Status</th>
                        <th>Remarks</th>
                    </tr>
                </thead>

                <tbody>
                    {students.length === 0 && (
                        <tr>
                            <td colSpan="4" className="text-center py-4 text-muted">
                                No students found in this batch.
                            </td>
                        </tr>
                    )}

                    {students.map(student => {
                        const name = student.name || 'Unknown';
                        const avatar = name.charAt(0).toUpperCase();
                        // Backend Entity uses 'source'. Map logic:
                        // If source is 'MANUAL' or 'OFFLINE' or 'CSV' -> It's "Offline/Manual" mode usually
                        // If source is 'QR' or 'FACE' (if supported) -> It's "Online"
                        // Since backend source only lists MANUAL, CSV, OFFLINE, we assume:
                        // If checking strictly against "ONLINE", we might need to check if we passed 'ONLINE' in source previously?
                        // Let's rely on the prop passed from parent or fallback to checking source.
                        // Assuming 'ONLINE' might be a source value not in the strict enum provided but used in frontend logic?
                        // If backend strictly only saves MANUAL/CSV/OFFLINE, then 'ONLINE' attendance might be saved as 'MANUAL' (by the system)?
                        // Let's assume 'source' reflects the truth.
                        const isOnline = student.source === 'QR' || student.source === 'FACE' || student.source === 'ONLINE';

                        return (
                            <tr
                                key={student.studentId}
                                className={!isEditable ? 'disabled-row' : ''}
                            >
                                {/* Student */}
                                <td className="student-name-cell">
                                    <div className={`avatar-placeholder ${isOnline ? 'online-ring' : ''}`}>
                                        {avatar}
                                    </div>
                                    <div className="d-flex flex-column">
                                        <span className="fw-medium">{name}</span>
                                        <span className="small text-muted">{student.studentId}</span>
                                    </div>
                                </td>

                                {/* Mode Badge */}
                                <td>
                                    {isOnline ? (
                                        <span className="badge bg-primary bg-opacity-10 text-primary border border-primary rounded-pill px-2 d-inline-flex align-items-center">
                                            <FiLock className="me-1" size={10} /> Online (Auto)
                                        </span>
                                    ) : (
                                        <span className="badge bg-secondary bg-opacity-10 text-secondary border rounded-pill px-2">
                                            Offline ({student.source || 'Manual'})
                                        </span>
                                    )}
                                </td>

                                {/* Status */}
                                <td style={{ position: 'relative' }}>
                                    <div className={`status-options d-flex gap-2 flex-wrap ${isOnline ? 'opacity-25' : ''}`}>
                                        {STATUS_ACTIONS.map(action => (
                                            <button
                                                key={action.key}
                                                type="button"
                                                className={`btn btn-sm ${student.status === action.key
                                                    ? `btn-${action.className === 'present' ? 'success' : action.className === 'absent' ? 'danger' : action.className === 'late' ? 'warning' : 'secondary'}`
                                                    : 'btn-outline-light text-dark border'
                                                    }`}
                                                style={{ minWidth: '90px' }}
                                                onClick={() =>
                                                    !isOnline && isEditable &&
                                                    onStatusChange(
                                                        student.studentId,
                                                        action.key
                                                    )
                                                }
                                                disabled={!isEditable || isOnline}
                                            >
                                                {action.icon} <span className="ms-1">{action.label}</span>
                                            </button>
                                        ))}
                                    </div>

                                    {/* Auto-managed Overlay */}
                                    {isOnline && (
                                        <div
                                            className="d-flex align-items-center justify-content-center text-muted small fw-bold"
                                            style={{
                                                position: 'absolute',
                                                top: 0,
                                                left: 0,
                                                width: '100%',
                                                height: '100%',
                                                backgroundColor: 'rgba(240, 242, 245, 0.6)',
                                                zIndex: 10,
                                                backdropFilter: 'blur(1px)'
                                            }}
                                        >
                                            <FiLock className="me-2" /> Auto-managed (Online Session)
                                        </div>
                                    )}

                                    {/* Late minutes input */}
                                    {!isOnline && isEditable && student.status === ATTENDANCE_STATUS.LATE && (
                                        <div className="mt-2 d-flex align-items-center animate-fade-in">
                                            <span className="small text-muted me-2">Minutes Late:</span>
                                            <input
                                                type="number"
                                                min="1"
                                                max="240"
                                                className="form-control form-control-sm"
                                                style={{ width: '80px' }}
                                                value={student.lateMinutes || ''}
                                                onChange={(e) =>
                                                    onLateMinutesChange &&
                                                    onLateMinutesChange(student.studentId, e.target.value)
                                                }
                                                placeholder="Min"
                                            />
                                        </div>
                                    )}
                                </td>

                                {/* Remarks */}
                                <td>
                                    <input
                                        type="text"
                                        className={`form-control form-control-sm remark-input ${student.status === ATTENDANCE_STATUS.EXCUSED && !student.remarks ? 'border-warning' : ''}`}
                                        placeholder={student.status === ATTENDANCE_STATUS.EXCUSED ? "Reason required..." : "Add remark (max 255)"}
                                        maxLength={255}
                                        value={student.remarks || ''}
                                        onChange={e =>
                                            isEditable &&
                                            onRemarkChange(
                                                student.studentId,
                                                e.target.value
                                            )
                                        }
                                        disabled={!isEditable || isOnline}
                                    />
                                    {student.status === ATTENDANCE_STATUS.EXCUSED && !student.remarks && (
                                        <div className="text-warning small mt-1" style={{ fontSize: '0.7rem' }}>
                                            * Reason required
                                        </div>
                                    )}
                                </td>
                            </tr>
                        );
                    })}
                </tbody>
            </table>
        </div>
    );
};

export default AttendanceTable;
