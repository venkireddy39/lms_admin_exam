import React, { useState, useEffect } from 'react';
import { studentService } from '../../../services/studentService';
import { StatCard } from '../components/StudentDashboardComponents';
import {
    Calendar,
    CheckCircle,
    XCircle,
    Clock,
    TrendingUp,
    Filter,
    Download,
    Search,
    User,
    Award
} from 'lucide-react';
import { BarChart } from 'recharts/es6/chart/BarChart';
import { Bar } from 'recharts/es6/cartesian/Bar';
import { XAxis } from 'recharts/es6/cartesian/XAxis';
import { YAxis } from 'recharts/es6/cartesian/YAxis';
import { CartesianGrid } from 'recharts/es6/cartesian/CartesianGrid';
import { Tooltip } from 'recharts/es6/component/Tooltip';
import { ResponsiveContainer } from 'recharts/es6/component/ResponsiveContainer';
import { Cell } from 'recharts/es6/component/Cell';
import '../StudentDashboard.css';
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
        status: r.status === 'Present' ? 1 : (r.status === 'Late' ? 0.5 : 0)
    }));

    const getStatusClass = (status) => {
        switch (status) {
            case 'Present': return 'bg-success bg-opacity-10 text-success';
            case 'Absent': return 'bg-danger bg-opacity-10 text-danger';
            case 'Late': return 'bg-warning bg-opacity-10 text-warning';
            default: return 'bg-secondary bg-opacity-10 text-secondary';
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
        <div className="student-attendance-container animate-fade-in text-body">
            {/* Header */}
            <div className="row mb-4 align-items-end g-3">
                <div className="col-12 col-md">
                    <h2 className="fw-bold mb-1">Attendance Analytics</h2>
                    <p className="text-muted mb-0">Track your daily presence and consistency data.</p>
                </div>
                <div className="col-12 col-md-auto d-flex gap-2">
                    <button className="btn btn-outline-secondary rounded-pill px-3 py-2 small d-flex align-items-center gap-2 transition-all">
                        <Download size={16} />
                        <span>Export PDF</span>
                    </button>
                    <button className="btn btn-primary rounded-pill px-3 py-2 small d-flex align-items-center gap-2 shadow-primary">
                        <Calendar size={16} />
                        <span>This Month</span>
                    </button>
                </div>
            </div>

            {/* Stats Cards */}
            <div className="row g-4 mb-4">
                <div className="col-12 col-md-4 col-lg-3">
                    <StatCard
                        label="Overall Attendance"
                        value={`${attendancePct}%`}
                        icon={TrendingUp}
                        color="99, 102, 241"
                    />
                </div>
                <div className="col-12 col-md-4 col-lg-3">
                    <StatCard
                        label="Days Present"
                        value={stats.present}
                        icon={CheckCircle}
                        color="16, 185, 129"
                    />
                </div>
                <div className="col-12 col-md-4 col-lg-3">
                    <StatCard
                        label="Days Absent"
                        value={stats.absent}
                        icon={XCircle}
                        color="239, 68, 68"
                    />
                </div>
                <div className="col-12 col-md-4 col-lg-3">
                    <StatCard
                        label="Mastery Badge"
                        value="Silver"
                        icon={Award}
                        color="245, 158, 11"
                    />
                </div>
            </div>

            <div className="row g-4 mb-5">
                {/* Visual Chart Panel */}
                <div className="col-12 col-xl-8">
                    <div className="card p-4 h-100 border-0 shadow-sm" style={{ background: 'var(--surface)' }}>
                        <div className="d-flex justify-content-between align-items-center mb-4">
                            <h5 className="fw-bold m-0 text-body">Engagement Trend</h5>
                            <span className="text-muted small">Last 7 Sessions</span>
                        </div>
                        <div style={{ height: '300px' }}>
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border)" />
                                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: 'var(--muted)', fontSize: 11 }} />
                                    <YAxis hide />
                                    <Tooltip
                                        contentStyle={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '12px', color: 'var(--text-color)' }}
                                        cursor={{ fill: 'var(--hover-bg)' }}
                                    />
                                    <Bar dataKey="status" radius={[6, 6, 0, 0]} barSize={40}>
                                        {chartData.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={entry.status === 1 ? 'var(--primary)' : (entry.status === 0.5 ? '#f59e0b' : '#ef4444')} />
                                        ))}
                                    </Bar>
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </div>
                </div>

                {/* Circular Profile Indicator */}
                <div className="col-12 col-xl-4">
                    <div className="card p-4 h-100 text-center d-flex flex-column justify-content-center border-0 shadow-sm" style={{ background: 'var(--surface)' }}>
                        <div className="position-relative mx-auto mb-4" style={{ width: '180px', height: '180px' }}>
                            <svg width="180" height="180" viewBox="0 0 180 180">
                                <circle cx="90" cy="90" r="80" fill="none" stroke="var(--hover-bg)" strokeWidth="12" />
                                <circle
                                    cx="90" cy="90" r="80" fill="none" stroke="url(#progressGradient)"
                                    strokeWidth="12" strokeLinecap="round"
                                    strokeDasharray={502.65}
                                    strokeDashoffset={502.65 - (502.65 * attendancePct) / 100}
                                    transform="rotate(-90 90 90)"
                                />
                                <defs>
                                    <linearGradient id="progressGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                                        <stop offset="0%" stopColor="var(--primary)" />
                                        <stop offset="100%" stopColor="#8b5cf6" />
                                    </linearGradient>
                                </defs>
                            </svg>
                            <div className="position-absolute top-50 start-50 translate-middle text-center">
                                <div className="h1 fw-bold mb-0 text-body">{attendancePct}%</div>
                                <div className="small text-muted">Presence</div>
                            </div>
                        </div>
                        <h5 className="fw-bold mb-2 text-body">Steady Progress!</h5>
                        <p className="text-muted small mb-0 px-4">Maintain 90% attendance to stay eligible for certifications.</p>
                    </div>
                </div>
            </div>

            {/* History Table */}
            <div className="card border-0 shadow-sm overflow-hidden" style={{ background: 'var(--surface)' }}>
                <div className="p-4 border-bottom d-flex justify-content-between align-items-center flex-wrap gap-3">
                    <h5 className="fw-bold m-0 text-body">Detailed Log</h5>
                    <div className="d-flex gap-2">
                        <div className="d-flex align-items-center px-3 py-1 rounded-4 border" style={{ background: 'var(--hover-bg)' }}>
                            <Search size={14} className="text-muted me-2" />
                            <input type="text" placeholder="Search logs..." className="bg-transparent border-0 text-body small" style={{ outline: 'none', width: '180px' }} />
                        </div>
                        <button className="btn btn-light rounded-4 border-0" style={{ background: 'var(--hover-bg)' }}><Filter size={18} className="text-muted" /></button>
                    </div>
                </div>

                <div className="table-responsive">
                    <table className="table align-middle m-0">
                        <thead style={{ background: 'var(--hover-bg)' }}>
                            <tr className="text-muted smaller text-uppercase tracking-wider">
                                <th className="ps-4 py-3 border-0">Date</th>
                                <th className="py-3 border-0">Session Details</th>
                                <th className="py-3 border-0">Duration</th>
                                <th className="py-3 border-0">Status</th>
                                <th className="text-end pe-4 py-3 border-0">Action</th>
                            </tr>
                        </thead>
                        <tbody>
                            {records.map((record, idx) => (
                                <tr key={record.id || idx} className="border-bottom" style={{ borderColor: 'var(--border)' }}>
                                    <td className="ps-4 fw-bold text-body">{record.date}</td>
                                    <td>
                                        <div className="d-flex flex-column">
                                            <span className="fw-bold text-body">{record.subject || 'LMS Session'}</span>
                                            <span className="text-muted smaller">{record.batchName || 'Default Batch'}</span>
                                        </div>
                                    </td>
                                    <td>
                                        <div className="d-flex align-items-center gap-2 text-muted smaller">
                                            <Clock size={12} />
                                            <span>{record.checkIn || '--'} - {record.checkOut || '--'}</span>
                                        </div>
                                    </td>
                                    <td>
                                        <span className={`badge rounded-pill px-3 py-2 fw-bold ${getStatusClass(record.status)}`}>
                                            {record.status}
                                        </span>
                                    </td>
                                    <td className="text-end pe-4">
                                        <button className="btn btn-sm btn-link text-primary text-decoration-none fw-bold">Report Issue</button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {records.length === 0 && (
                    <div className="py-5 text-center text-muted">
                        <Calendar size={64} className="opacity-20 mb-3" />
                        <h5 className="opacity-50">No activity logged yet</h5>
                    </div>
                )}
            </div>
        </div>
    );
};

export default StudentAttendance;
