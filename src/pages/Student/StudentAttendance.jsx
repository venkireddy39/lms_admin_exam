import React, { useState, useEffect } from 'react';
import { studentService } from '../../services/studentService';
import {
    Calendar,
    CheckCircle,
    XCircle,
    Clock,
    TrendingUp,
    Filter,
    Download,
    Search
} from 'lucide-react';
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    Cell
} from 'recharts';
import './StudentDashboard.css';
import './StudentAttendance.css';

const StudentAttendance = () => {
    const [records, setRecords] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('All');

    useEffect(() => {
        const fetchAttendance = async () => {
            try {
                const data = await studentService.getMyAttendance();
                setRecords(Array.isArray(data) ? data : []);
            } catch (error) {
                console.error("Failed to fetch attendance", error);
            } finally {
                setLoading(false);
            }
        };
        fetchAttendance();
    }, []);

    const stats = {
        total: records.length,
        present: records.filter(r => r.status === 'Present').length,
        absent: records.filter(r => r.status === 'Absent').length,
        late: records.filter(r => r.status === 'Late').length,
    };

    const attendancePct = stats.total > 0 ? Math.round((stats.present / stats.total) * 100) : 0;

    // Chart Data (Last 5 days example)
    const chartData = records.slice(0, 7).reverse().map(r => ({
        name: r.date.split('-').slice(1).join('/'),
        status: r.status === 'Present' ? 1 : 0
    }));

    const getStatusClass = (status) => {
        switch (status) {
            case 'Present': return 'status-present';
            case 'Absent': return 'status-absent';
            case 'Late': return 'status-late';
            default: return '';
        }
    };

    if (loading) {
        return (
            <div className="d-flex justify-content-center align-items-center" style={{ height: '70vh' }}>
                <div className="spinner-border text-primary" role="status">
                    <span className="visually-hidden">Loading...</span>
                </div>
            </div>
        );
    }

    return (
        <div className="student-dashboard container-fluid px-0">
            {/* Header */}
            <div className="row mb-4 align-items-end g-3">
                <div className="col-12 col-md">
                    <h2 className="fw-bold mb-1">Attendance Report</h2>
                    <p className="text-secondary mb-0">Monitor your daily presence and consistency.</p>
                </div>
                <div className="col-12 col-md-auto d-flex gap-2">
                    <button className="glass-card d-flex align-items-center gap-2 px-3 py-2 text-white small">
                        <Download size={16} />
                        <span>Download PDF</span>
                    </button>
                    <button className="glass-card d-flex align-items-center gap-2 px-3 py-2 text-primary small">
                        <Calendar size={16} />
                        <span>This Month</span>
                    </button>
                </div>
            </div>

            {/* Stats Overview */}
            <div className="attendance-overview">
                {/* Attendance Percentage Circle */}
                <div className="glass-card attendance-circle-card">
                    <div className="circular-progress-wrapper">
                        <svg width="120" height="120" viewBox="0 0 120 120">
                            <circle cx="60" cy="60" r="54" fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="10" />
                            <circle
                                cx="60" cy="60" r="54" fill="none" stroke="var(--student-primary)"
                                strokeWidth="10" strokeLinecap="round"
                                strokeDasharray={339.29}
                                strokeDashoffset={339.29 - (339.29 * attendancePct) / 100}
                                transform="rotate(-90 60 60)"
                                style={{ transition: 'stroke-dashoffset 1s ease' }}
                            />
                        </svg>
                        <div className="percentage-text">
                            <span className="value">{attendancePct}%</span>
                            <span className="label">Overall</span>
                        </div>
                    </div>
                    <div className="d-flex gap-4 mt-2">
                        <div className="text-center">
                            <div className="h5 fw-bold mb-0 text-white">{stats.present}</div>
                            <div className="small text-secondary">Present</div>
                        </div>
                        <div className="text-center">
                            <div className="h5 fw-bold mb-0 text-white">{stats.absent}</div>
                            <div className="small text-secondary">Absent</div>
                        </div>
                        <div className="text-center">
                            <div className="h5 fw-bold mb-0 text-white">{stats.late}</div>
                            <div className="small text-secondary">Late</div>
                        </div>
                    </div>
                </div>

                {/* Trend Chart */}
                <div className="glass-card p-4 d-flex flex-column" style={{ minWidth: '400px', flexGrow: 2 }}>
                    <div className="d-flex justify-content-between align-items-center mb-4">
                        <h6 className="fw-bold m-0 text-white">Recent Activity</h6>
                        <span className="text-success small d-flex align-items-center gap-1">
                            <TrendingUp size={14} /> +2.5% vs Last Week
                        </span>
                    </div>
                    <div className="flex-grow-1" style={{ height: '140px' }}>
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={chartData}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.1)" />
                                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 10 }} />
                                <Tooltip
                                    contentStyle={{ background: '#1e293b', border: '1px solid rgba(255,255,255,0.1)', color: '#fff' }}
                                    cursor={{ fill: 'rgba(255,255,255,0.05)' }}
                                />
                                <Bar dataKey="status" radius={[4, 4, 0, 0]}>
                                    {chartData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={entry.status === 1 ? 'var(--student-primary)' : '#ef4444'} />
                                    ))}
                                </Bar>
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>

            {/* History Table */}
            <div className="glass-card attendance-table-card">
                <div className="d-flex justify-content-between align-items-center mb-4">
                    <h5 className="fw-bold m-0 text-white">Attendance History</h5>
                    <div className="d-flex gap-2">
                        <div className="glass-card d-flex align-items-center px-3 py-1 bg-white bg-opacity-5">
                            <Search size={14} className="text-secondary me-2" />
                            <input type="text" placeholder="Search..." className="bg-transparent border-0 text-white small" style={{ outline: 'none', width: '150px' }} />
                        </div>
                        <button className="btn btn-sm btn-link text-secondary p-0">
                            <Filter size={18} />
                        </button>
                    </div>
                </div>

                <div className="table-responsive">
                    <table className="table history-table align-middle">
                        <thead>
                            <tr>
                                <th>Date</th>
                                <th>Session / Batch</th>
                                <th>Timing</th>
                                <th>Status</th>
                                <th className="text-end">Action</th>
                            </tr>
                        </thead>
                        <tbody>
                            {records.map((record, idx) => (
                                <tr key={record.id || idx}>
                                    <td className="fw-bold">{record.date}</td>
                                    <td>
                                        <div className="d-flex flex-column">
                                            <span>{record.subject || 'LMS Session'}</span>
                                            <span className="small text-secondary">{record.batchName || 'Default Batch'}</span>
                                        </div>
                                    </td>
                                    <td className="text-secondary">
                                        {record.checkIn || '--'} - {record.checkOut || '--'}
                                    </td>
                                    <td>
                                        <span className={`status-indicator ${getStatusClass(record.status)}`}></span>
                                        <span className="fw-medium">{record.status}</span>
                                    </td>
                                    <td className="text-end">
                                        <button className="btn btn-sm btn-link text-primary p-0">View Details</button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {records.length === 0 && (
                    <div className="py-5 text-center text-secondary">
                        <Calendar size={48} className="opacity-25 mb-3" />
                        <h6 className="opacity-50">No attendance records found yet.</h6>
                    </div>
                )}
            </div>
        </div>
    );
};

export default StudentAttendance;

