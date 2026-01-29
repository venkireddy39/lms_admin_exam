import React, { useEffect, useState } from 'react';
import {
    Users,
    BookOpen,
    AlertTriangle,
    TrendingUp,
    MoreHorizontal,
    ArrowUpRight,
    ArrowDownRight,
    Calendar,
    Clock
} from 'lucide-react';
import {
    ResponsiveContainer,
    AreaChart,
    Area,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip
} from 'recharts';
import { DashboardService } from '../services/api';
import './Dashboard.css';
import { useAuth } from '../context/AuthContext';


const Dashboard = () => {
    const { user } = useAuth();
    const [stats, setStats] = useState({
        totalResources: 0,
        activeIssues: 0,
        overdue: 0,
        digitalAccess: 0,
        activeMembers: 0,
        totalMembers: 0
    });
    const [trendData, setTrendData] = useState([]);
    const [recentActivity, setRecentActivity] = useState([]);
    const [loading, setLoading] = useState(true);


    useEffect(() => {
        const fetchDashboardData = async () => {
            setLoading(true);
            try {
                const results = await Promise.allSettled([
                    DashboardService.getSummary(),
                    DashboardService.getTrends(),
                    DashboardService.getRecentActivity()
                ]);

                const summary = results[0].status === 'fulfilled' ? results[0].value : {
                    totalResources: 0, activeIssues: 0, overdue: 0, digitalAccess: 0, activeMembers: 0, totalMembers: 0
                };
                const trends = results[1].status === 'fulfilled' ? results[1].value : [];
                const activity = results[2].status === 'fulfilled' ? results[2].value : [];

                setStats(summary);
                setTrendData(trends);
                setRecentActivity(activity);
            } catch (error) {
                console.error('Failed to fetch dashboard data:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchDashboardData();
    }, []);

    const StatsCard = ({ title, value, icon: Icon, trend, color, subValue }) => (
        <div className="card border-0 shadow-sm h-100 stats-card">
            <div className="card-body">
                <div className="d-flex justify-content-between align-items-start mb-3">
                    <div>
                        <p className="text-muted small text-uppercase fw-bold mb-1">{title}</p>
                        <h2 className="mb-0 fw-bold">{value}</h2>
                    </div>
                    <div className={`p-2 rounded-3 bg-${color}-subtle`}>
                        <Icon className={`text-${color}`} size={24} />
                    </div>
                </div>
                <div className="d-flex align-items-center">
                    <span className={`badge bg-${trend > 0 ? 'success' : 'danger'}-subtle text-${trend > 0 ? 'success' : 'danger'} me-2`}>
                        {trend > 0 ? <ArrowUpRight size={14} /> : <ArrowDownRight size={14} />}
                        {Math.abs(trend)}%
                    </span>
                    <span className="text-muted small">{subValue}</span>
                </div>
            </div>
        </div>
    );

    return (
        <div className="container-fluid p-4 dashboard-container">
            {/* Header */}
            <div className="d-flex justify-content-between align-items-center mb-4 fade-in">
                <div>
                    <h4 className="fw-bold mb-1">Dashboard Overview</h4>
                    <p className="text-muted mb-0">Welcome back, {user?.name}</p>
                </div>
                <div className="d-flex gap-2">
                    <button className="btn btn-white shadow-sm d-flex align-items-center">
                        <Calendar size={18} className="me-2 text-muted" />
                        <span className="text-muted">Last 30 Days</span>
                    </button>
                    <button className="btn btn-primary d-flex align-items-center">
                        <TrendingUp size={18} className="me-2" />
                        Download Report
                    </button>
                </div>
            </div>

            {/* Stats Grid */}
            <div className="row g-4 mb-4">
                <div className="col-xl-3 col-md-6 fade-in" style={{ animationDelay: '0.1s' }}>
                    <StatsCard
                        title="Total Titles"
                        value={stats.totalResources}
                        icon={BookOpen}
                        trend={12.5}
                        color="primary"
                        subValue="since last month"
                    />
                </div>
                <div className="col-xl-3 col-md-6 fade-in" style={{ animationDelay: '0.2s' }}>
                    <StatsCard
                        title="Active Issues"
                        value={stats.activeIssues}
                        icon={Clock}
                        trend={-2.4}
                        color="warning"
                        subValue="currently borrowed"
                    />
                </div>
                <div className="col-xl-3 col-md-6 fade-in" style={{ animationDelay: '0.3s' }}>
                    <StatsCard
                        title="Overdue Items"
                        value={stats.overdue}
                        icon={AlertTriangle}
                        trend={5.8}
                        color="danger"
                        subValue="needs attention"
                    />
                </div>
                <div className="col-xl-3 col-md-6 fade-in" style={{ animationDelay: '0.4s' }}>
                    <StatsCard
                        title="Active Members"
                        value={stats.activeMembers || 0}
                        icon={Users}
                        trend={0}
                        color="success"
                        subValue={`Total: ${stats.totalMembers || 0}`}
                    />
                </div>
            </div>

            {/* Charts Section */}
            <div className="row g-4 mb-4">
                <div className="col-lg-8 fade-in" style={{ animationDelay: '0.5s' }}>
                    <div className="card border-0 shadow-sm h-100">
                        <div className="card-header bg-transparent border-0 py-3 d-flex justify-content-between align-items-center">
                            <h6 className="fw-bold mb-0">Circulation Trends</h6>
                            <button className="btn btn-sm btn-light"><MoreHorizontal size={16} /></button>
                        </div>
                        <div className="card-body">
                            <div style={{ width: '100%', height: 300 }}>
                                {trendData.length > 0 ? (
                                    <ResponsiveContainer width="100%" height="100%">
                                        <AreaChart data={trendData}>
                                            <defs>
                                                <linearGradient id="colorIssues" x1="0" y1="0" x2="0" y2="1">
                                                    <stop offset="5%" stopColor="#0d6efd" stopOpacity={0.1} />
                                                    <stop offset="95%" stopColor="#0d6efd" stopOpacity={0} />
                                                </linearGradient>
                                            </defs>
                                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                                            <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#6c757d' }} dy={10} />
                                            <YAxis axisLine={false} tickLine={false} tick={{ fill: '#6c757d' }} />
                                            <Tooltip
                                                contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                                            />
                                            <Area
                                                type="monotone"
                                                dataKey="issues"
                                                stroke="#0d6efd"
                                                strokeWidth={3}
                                                fillOpacity={1}
                                                fill="url(#colorIssues)"
                                            />
                                        </AreaChart>
                                    </ResponsiveContainer>
                                ) : (
                                    <div className="d-flex align-items-center justify-content-center h-100 text-muted">
                                        No data available
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
                <div className="col-lg-4 fade-in" style={{ animationDelay: '0.6s' }}>
                    <div className="card border-0 shadow-sm h-100">
                        <div className="card-header bg-transparent border-0 py-3 d-flex justify-content-between align-items-center">
                            <h6 className="fw-bold mb-0">Recent Activity</h6>
                            <button className="btn btn-sm btn-link text-decoration-none p-0">View All</button>
                        </div>
                        <div className="card-body p-0">
                            <div className="list-group list-group-flush">
                                {recentActivity.map(activity => (
                                    <div key={activity.id} className="list-group-item px-4 py-3 border-0 d-flex align-items-center">
                                        <div className={`
                                            rounded-circle p-2 me-3 d-flex align-items-center justify-content-center
                                            ${activity.type === 'ISSUE' ? 'bg-primary-subtle text-primary' :
                                                activity.type === 'RETURN' ? 'bg-success-subtle text-success' : 'bg-warning-subtle text-warning'}
                                        `} style={{ width: 40, height: 40 }}>
                                            {activity.type === 'ISSUE' ? <BookOpen size={18} /> :
                                                activity.type === 'RETURN' ? <Clock size={18} /> : <Users size={18} />}
                                        </div>
                                        <div className="flex-grow-1">
                                            <div className="d-flex justify-content-between mb-1">
                                                <small className="fw-bold text-dark">{activity.user}</small>
                                                <small className="text-muted">{
                                                    new Date(activity.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })
                                                }</small>
                                            </div>
                                            <div className="small text-muted text-truncate" style={{ maxWidth: '200px' }}>
                                                {activity.type === 'ISSUE' ? 'Borrowed' :
                                                    activity.type === 'RETURN' ? 'Returned' : 'Accessed'}
                                                <span className="fw-medium text-dark ms-1">{activity.resource}</span>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Dashboard;
