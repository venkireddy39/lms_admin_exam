import React from 'react';
import { FaCertificate, FaUserGraduate, FaChartLine, FaClock, FaPlus, FaPalette } from 'react-icons/fa';
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const CertificateDashboard = ({ certificates, templates, onNavigate }) => {
    // 1. Calculate Stats
    const totalIssued = certificates.length;
    const totalTemplates = templates.length;

    const issuedThisMonth = certificates.filter(c => {
        const d = new Date(c.issuedAt);
        const now = new Date();
        return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
    }).length;

    // Get most recent certificate
    const recentCert = certificates.length > 0 ? certificates[0] : null;

    // Group by Course (Simple aggregation)
    const courseStats = certificates.reduce((acc, curr) => {
        const course = curr.data.courseName || "Unknown";
        acc[course] = (acc[course] || 0) + 1;
        return acc;
    }, {});

    const topCourse = Object.keys(courseStats).reduce((a, b) => courseStats[a] > courseStats[b] ? a : b, "N/A");

    // Prepare Pie Chart Data
    const pieData = Object.keys(courseStats).map(key => ({
        name: key,
        value: courseStats[key]
    }));

    const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8'];

    return (
        <div className="animate-fade-in text-start"> {/* text-start ensures left alignment like admin panels usually are */}

            {/* Stats Cards Row */}
            <div className="row g-4 mb-5">
                <div className="col-md-3">
                    <div className="card border-0 shadow-sm rounded-4 h-100 bg-primary text-white position-relative overflow-hidden">
                        <div className="card-body p-4">
                            <div className="d-flex justify-content-between align-items-start">
                                <div>
                                    <p className="mb-1 opacity-75 fw-medium">Total Issued</p>
                                    <h3 className="fw-bold mb-0">{totalIssued}</h3>
                                </div>
                                <div className="p-2 bg-white bg-opacity-25 rounded-3">
                                    <FaCertificate size={24} />
                                </div>
                            </div>
                            <div className="mt-4 small d-flex align-items-center">
                                <span className="badge bg-white text-primary me-2">+12%</span>
                                <span className="opacity-75">vs last month</span>
                            </div>
                        </div>
                        {/* Decorative Circle */}
                        <div className="position-absolute top-0 end-0 bg-white opacity-10 rounded-circle" style={{ width: '100px', height: '100px', margin: '-20px' }}></div>
                    </div>
                </div>

                <div className="col-md-3">
                    <div className="card border-0 shadow-sm rounded-4 h-100 bg-dark text-white position-relative overflow-hidden">
                        <div className="card-body p-4">
                            <div className="d-flex justify-content-between align-items-start">
                                <div>
                                    <p className="mb-1 opacity-75 fw-medium">Issued This Month</p>
                                    <h3 className="fw-bold mb-0">{issuedThisMonth}</h3>
                                </div>
                                <div className="p-2 bg-white bg-opacity-25 rounded-3">
                                    <FaChartLine size={24} />
                                </div>
                            </div>
                            <div className="mt-4 small d-flex align-items-center">
                                <span className="badge bg-success text-white me-2">Active</span>
                                <span className="opacity-75">issuance period</span>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="col-md-3">
                    <div className="card border-0 shadow-sm rounded-4 h-100 bg-white text-dark position-relative overflow-hidden border-start border-4 border-info">
                        <div className="card-body p-4">
                            <div className="d-flex justify-content-between align-items-start">
                                <div>
                                    <p className="text-muted mb-1 fw-medium">Top Course</p>
                                    <h5 className="fw-bold mb-0 text-truncate" style={{ maxWidth: '150px' }} title={topCourse}>{topCourse}</h5>
                                </div>
                                <div className="p-2 bg-light rounded-3 text-info">
                                    <FaUserGraduate size={24} />
                                </div>
                            </div>
                            <div className="mt-4 small text-muted">
                                Most popular certification
                            </div>
                        </div>
                    </div>
                </div>

                <div className="col-md-3">
                    <div className="card border-0 shadow-sm rounded-4 h-100 bg-white text-dark position-relative overflow-hidden border-start border-4 border-warning">
                        <div className="card-body p-4">
                            <div className="d-flex justify-content-between align-items-start">
                                <div>
                                    <p className="text-muted mb-1 fw-medium">Templates</p>
                                    <h3 className="fw-bold mb-0">{totalTemplates}</h3>
                                </div>
                                <div className="p-2 bg-light rounded-3 text-warning">
                                    <FaPalette size={24} />
                                </div>
                            </div>
                            <div className="mt-4 small text-muted">
                                Available designs
                            </div>
                        </div>
                    </div>
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
                                                            {cert.data.recipientName.charAt(0)}
                                                        </div>
                                                        {cert.data.recipientName}
                                                    </div>
                                                </td>
                                                <td className="small text-muted">{cert.data.courseName}</td>
                                                <td className="small text-muted">{new Date(cert.issuedAt).toLocaleDateString()}</td>
                                                <td><span className="badge bg-success bg-opacity-10 text-success rounded-pill px-3">Issued</span></td>
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
                            <div className="card-body p-2" style={{ height: '300px' }}>
                                <ResponsiveContainer width="100%" height="100%">
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
                                    <FaPlus className="me-2" /> Issue New Certificate
                                </button>
                                <button className="btn btn-white border w-100 mb-3 py-2 shadow-sm" onClick={() => onNavigate('templates')}>
                                    <FaPalette className="me-2" /> Design Template
                                </button>
                                <button className="btn btn-white border w-100 py-2 shadow-sm" onClick={() => onNavigate('settings')}>
                                    <FaClock className="me-2" /> Manage Settings
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
