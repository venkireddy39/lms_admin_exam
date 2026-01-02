
import React from 'react';
import { FiCheckCircle, FiXCircle, FiClock, FiAlertCircle } from 'react-icons/fi';

const AttendanceStats = ({ stats }) => {
    return (
        <div className="att-stats-row">
            <div className="att-stat-card present">
                <div className="icon-wrapper"><FiCheckCircle /></div>
                <div>
                    <h4>Present</h4>
                    <p>{stats.present}</p>
                </div>
            </div>
            <div className="att-stat-card absent">
                <div className="icon-wrapper"><FiXCircle /></div>
                <div>
                    <h4>Absent</h4>
                    <p>{stats.absent}</p>
                </div>
            </div>
            <div className="att-stat-card late">
                <div className="icon-wrapper"><FiClock /></div>
                <div>
                    <h4>Late</h4>
                    <p>{stats.late}</p>
                </div>
            </div>
            <div className="att-stat-card pending">
                <div className="icon-wrapper"><FiAlertCircle /></div>
                <div>
                    <h4>Pending</h4>
                    <p>{stats.total - (stats.present + stats.absent + stats.late + stats.excused)}</p>
                </div>
            </div>
            <div className="att-stat-card percentage">
                <div className="circular-chart">
                    <span>{stats.percentage}%</span>
                </div>
                <div>
                    <h4>Attendance Rate</h4>
                </div>
            </div>
        </div>
    );
};

export default AttendanceStats;
