
import React from 'react';
import { useAttendance } from './hooks/useAttendance';
import AttendanceStats from './components/AttendanceStats';
import AttendanceTable from './components/AttendanceTable';
import { ATTENDANCE_STATUS } from './constants/attendanceConstants';
import { FiSave, FiAlertTriangle, FiCheck } from 'react-icons/fi';
import './styles/attendance.css';

const Attendance = () => {
    const {
        batches,
        selectedBatchId,
        setSelectedBatchId,
        selectedDate,
        setSelectedDate,
        students,
        handleStatusChange,
        saveAttendance,
        isEditable,
        markAll,
        stats,
        saveStatus
    } = useAttendance();

    return (
        <div className="attendance-page">
            <header className="att-header">
                <div>
                    <h1>Attendance</h1>
                    <p>Mark and view daily attendance.</p>
                </div>
                {saveStatus === 'saved' && <span className="save-badge success"><FiCheck /> All changes saved</span>}
            </header>

            {/* Controls */}
            <div className="att-controls">
                <div className="control-group">
                    <label>Select Batch</label>
                    <select
                        value={selectedBatchId}
                        onChange={(e) => setSelectedBatchId(e.target.value)}
                        className="att-select"
                    >
                        <option value="">-- Choose Batch --</option>
                        {batches.map(b => (
                            <option key={b.id} value={b.id}>{b.name} ({b.status})</option>
                        ))}
                    </select>
                </div>

                <div className="control-group">
                    <label>Select Date</label>
                    <input
                        type="date"
                        value={selectedDate}
                        onChange={(e) => setSelectedDate(e.target.value)}
                        className="att-date-input"
                    />
                </div>
            </div>

            {!selectedBatchId ? (
                <div className="att-empty-state">
                    <p>Please select a batch to view or mark attendance.</p>
                </div>
            ) : (
                <>
                    {/* Stats & Actions */}
                    <div className="att-dashboard">
                        <AttendanceStats stats={stats} />

                        <div className="att-actions-bar">
                            {!isEditable && (
                                <div className="locked-msg">
                                    <FiAlertTriangle /> Attendance for this date/batch is locked.
                                </div>
                            )}

                            {isEditable && (
                                <div className="action-buttons-right">
                                    <button className="btn-text" onClick={() => markAll(ATTENDANCE_STATUS.PRESENT)}>Mark All Present</button>
                                    <button className="btn-text" onClick={() => markAll(ATTENDANCE_STATUS.ABSENT)}>Mark All Absent</button>
                                    <button
                                        className="btn-primary-save"
                                        onClick={saveAttendance}
                                        disabled={saveStatus === 'saving'}
                                    >
                                        {saveStatus === 'saving' ? 'Saving...' : <><FiSave /> Save Attendance</>}
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Table */}
                    <AttendanceTable
                        students={students}
                        onStatusChange={handleStatusChange}
                        isEditable={isEditable}
                    />
                </>
            )}
        </div>
    );
};

export default Attendance;
