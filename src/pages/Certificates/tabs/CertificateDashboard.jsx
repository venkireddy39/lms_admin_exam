import React from 'react';
import {
    Award,
    TrendingUp,
    GraduationCap,
    Palette,
    ArrowUpRight,
    ArrowDownRight
} from 'lucide-react';
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const CertificateDashboard = ({ certificates = [], templates = [], onNavigate }) => {
    // 1. Calculate Stats
    const totalIssued = certificates.length;
    const totalTemplates = templates.length;

    const issuedThisMonth = certificates.filter(c => {
        if (!c) return false;
        const d = new Date(c.issuedDate || c.createdAt);
        const now = new Date();
        return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
    }).length;

    // Get most recent certificate
    const recentCert = certificates.length > 0 ? certificates[0] : null;

    // Group by Course (Simple aggregation) - null safe
    const courseStats = certificates.reduce((acc, curr) => {
        if (!curr) return acc;
        const course = curr.eventTitle || "Unknown";
        acc[course] = (acc[course] || 0) + 1;
        return acc;
    }, {});

    const topCourse = Object.keys(courseStats).length > 0
        ? Object.keys(courseStats).reduce((a, b) => courseStats[a] > courseStats[b] ? a : b)
        : "N/A";

    // Prepare Pie Chart Data
    const pieData = Object.keys(courseStats).map(key => ({
        name: key,
        value: courseStats[key]
    }));

    const COLORS = ['#0d6efd', '#198754', '#ffc107', '#dc3545', '#6610f2'];

    // Stats Card Component
    const StatsCard = ({ title, value, icon: Icon, trend, color, subValue }) => (
        <div className={`card border-0 shadow-sm h-100 border-start border-${color} border-4`}>
            <div className="card-body py-3 px-4">
                <div className="d-flex justify-content-between align-items-center">
                    <div>
                        <p className="text-muted small text-uppercase fw-semibold mb-1">{title}</p>
                        <h3 className="fw-bold mb-1">{value}</h3>
                        <div className="d-flex align-items-center">
                            {trend !== undefined && (
                                <span className={`badge bg-${trend > 0 ? 'success' : 'danger'}-subtle text-${trend > 0 ? 'success' : 'danger'} me-2 small`}>
                                    {trend > 0 ? <ArrowUpRight size={12} /> : <ArrowDownRight size={12} />}
                                    {Math.abs(trend)}%
                                </span>
                            )}
                            <span className="text-muted" style={{ fontSize: '0.78rem' }}>{subValue}</span>
                        </div>
                    </div>
                    <div className={`p-3 rounded-3 bg-${color}-subtle`}>
                        <Icon className={`text-${color}`} size={26} />
                    </div>
                </div>
            </div>
        </div>
    );

    return (
        <div className="animate-fade-in text-start"> {/* text-start ensures left alignment like admin panels usually are */}

            {/* Stats Cards Row */}
            <div className="row g-4 mb-5">
                <div className="col-xl-3 col-md-6">
                    <StatsCard
                        title="Total Issued"
                        value={totalIssued}
                        icon={Award}
                        trend={12}
                        color="primary"
                        subValue="vs last month"
                    />
                </div>

                <div className="col-xl-3 col-md-6">
                    <StatsCard
                        title="Issued This Month"
                        value={issuedThisMonth}
                        icon={TrendingUp}
                        // trend={0} // No trend functionality yet
                        color="success"
                        subValue="Active issuance period"
                    />
                </div>

                <div className="col-xl-3 col-md-6">
                    <StatsCard
                        title="Top Course"
                        value={topCourse}
                        icon={GraduationCap}
                        color="info"
                        subValue="Most popular certification"
                    />
                </div>

                <div className="col-xl-3 col-md-6">
                    <StatsCard
                        title="Templates"
                        value={totalTemplates}
                        icon={Palette}
                        color="warning"
                        subValue="Available designs"
                    />
                </div>
            </div>

            {/* Quick Actions & Recent Activity Grid */}
            <div className="row g-4">
                <div className="col-lg-8">
                    <div className="card border-0 shadow-sm rounded-4 h-100">
                        <div className="card-header bg-white border-0 pt-4 px-4 d-flex justify-content-between align-items-center">
                            <h5 className="fw-bold mb-0">Recent Activity</h5>
                            <button className="btn btn-sm btn-light text-primary fw-medium" onClick={() => onNavigate('history')}>View All History</button>
                        </div>
                        <div className="card-body p-0">
                            <div className="table-responsive">
                                <table className="table table-hover align-middle mb-0">
                                    <thead className="bg-light small text-muted text-uppercase">
                                        <tr>
                                            <th className="ps-4">Recipient</th>
                                            <th>Course</th>
                                            <th>Date</th>
                                            <th>Status</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {certificates.slice(0, 5).map((cert, idx) => (
                                            <tr key={idx}>
                                                <td className="ps-4 fw-medium">
                                                    <div className="d-flex align-items-center">
                                                        <div className="bg-primary text-white rounded-circle d-flex align-items-center justify-content-center me-2" style={{ width: 32, height: 32, fontSize: 12 }}>
                                                            {(cert.studentName || cert.recipientName || '?').charAt(0)}
                                                        </div>
                                                        {cert.studentName || cert.recipientName || 'Unknown'}
                                                    </div>
                                                </td>
                                                <td className="small text-muted">{cert.eventTitle || cert.courseName || 'Unknown'}</td>
                                                <td className="small text-muted">{new Date(cert.issuedDate || cert.createdAt || new Date()).toLocaleDateString()}</td>
                                                <td><span className="badge bg-success bg-opacity-10 text-success rounded-pill px-3">{cert.status || 'Issued'}</span></td>
                                            </tr>
                                        ))}
                                        {certificates.length === 0 && (
                                            <tr>
                                                <td colSpan="4" className="text-center py-4 text-muted">No recent activity.</td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="col-lg-4">
                    <div className="d-flex flex-column gap-4 h-100">
                        {/* Pie Chart Section */}
                        <div className="card border-0 shadow-sm rounded-4 bg-white flex-grow-1">
                            <div className="card-header bg-white border-0 pt-4 px-4">
                                <h6 className="fw-bold mb-0">Data Distribution</h6>
                            </div>
                            <div className="card-body p-2">
                                <ResponsiveContainer width="100%" height={300}>
                                    <PieChart>
                                        <Pie
                                            data={pieData}
                                            cx="50%"
                                            cy="50%"
                                            innerRadius={50}
                                            outerRadius={80}
                                            fill="#8884d8"
                                            paddingAngle={5}
                                            dataKey="value"
                                        >
                                            {pieData.map((entry, index) => (
                                                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                            ))}
                                        </Pie>
                                        <Tooltip />
                                        <Legend verticalAlign="bottom" height={36} iconType="circle" />
                                    </PieChart>
                                </ResponsiveContainer>
                            </div>
                        </div>

                        {/* Quick Actions Section */}
                        <div className="card border-0 shadow-sm rounded-4 bg-light">
                            <div className="card-body p-4 d-flex flex-column justify-content-center text-center">
                                <h5 className="fw-bold mb-3">Quick Actions</h5>
                                <button className="btn btn-primary w-100 mb-3 py-2 shadow-sm" onClick={() => onNavigate('issue')}>
                                    <Award className="me-2" /> Issue New Certificate
                                </button>
                                <button className="btn btn-white border w-100 mb-3 py-2 shadow-sm" onClick={() => onNavigate('templates')}>
                                    <Palette className="me-2" /> Design Template
                                </button>
                                <button className="btn btn-white border w-100 py-2 shadow-sm" onClick={() => onNavigate('settings')}>
                                    <TrendingUp className="me-2" /> Manage Settings
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

        </div>
    );
};

export default CertificateDashboard;
