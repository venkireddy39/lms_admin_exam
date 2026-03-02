import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../Library/context/AuthContext';
import { useToast } from '../../Library/context/ToastContext';
import { studentService } from '../../../services/studentService';
import apiFetch, { getUrl } from '../../../services/api';
import {
    StatCard,
    QuickAction,
    CourseCard,
    XpWidget,
    ActivityTimeline
} from '../components/StudentDashboardComponents';
import {
    BookOpen,
    Users,
    Calendar,
    Video,
    BarChart2,
    Bus,
    Home,
    MessageCircle,
    ChevronRight,
    DollarSign,
    AlertCircle,
    CheckCircle
} from 'lucide-react';

import '../StudentDashboard.css';

const StudentDashboard = () => {
    const { user } = useAuth();
    const toast = useToast();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);

    const handleFakeAction = (action) => {
        toast.info(`${action} feature coming soon!`);
    };

    const [dashboardData, setDashboardData] = useState({
        courses: [],
        batches: [],
        attendance: [],
        stats: {
            coursesCount: 0,
            batchesCount: 0,
            attendancePct: 0
        },
        fee: {
            allocation: null,
            installments: [],
            hasOverdue: false,
            nextInstallment: null
        }
    });

    useEffect(() => {
        const fetchAllData = async () => {
            setLoading(true);
            try {
                // 1. Fetch academic data
                const [myCourses, myBatches, myAttendance] = await Promise.all([
                    studentService.getMyCourses() || [],
                    studentService.getMyBatches() || [],
                    studentService.getMyAttendance() || []
                ]);

                // Calculate Attendance %
                const attArray = Array.isArray(myAttendance) ? myAttendance : [];
                const totalAtt = attArray.length;
                const present = attArray.filter(a => (a.status || '').toLowerCase() === 'present').length;
                const attPercent = totalAtt > 0 ? Math.round((present / totalAtt) * 100) : 0;

                // 2. Fetch fee data atomically
                let allocationObj = null;
                let installmentsArr = [];
                let hasOverdue = false;
                let nextInstallment = null;

                try {
                    const allocRes = await apiFetch(getUrl('/fee-allocations/me'));
                    if (allocRes && allocRes.id) {
                        allocationObj = allocRes;

                        try {
                            const instRes = await apiFetch(getUrl(`/installments/${allocRes.id}`));
                            installmentsArr = Array.isArray(instRes) ? instRes : [];

                            // Check for overdue
                            hasOverdue = installmentsArr.some(i => i.status === 'OVERDUE');

                            // Find next pending
                            const pending = installmentsArr.filter(i => i.status === 'PENDING');
                            pending.sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate));
                            if (pending.length > 0) {
                                nextInstallment = pending[0];
                            }
                        } catch (err) {
                            console.error("Failed to fetch installments for dashboard", err);
                        }
                    }
                } catch (err) {
                    console.error("Failed to fetch fee allocation for dashboard", err);
                }

                setDashboardData({
                    courses: Array.isArray(myCourses) ? myCourses : [],
                    batches: Array.isArray(myBatches) ? myBatches : [],
                    attendance: attArray,
                    stats: {
                        coursesCount: Array.isArray(myCourses) ? myCourses.length : 0,
                        batchesCount: Array.isArray(myBatches) ? myBatches.length : 0,
                        attendancePct: attPercent
                    },
                    fee: {
                        allocation: allocationObj,
                        installments: installmentsArr,
                        hasOverdue,
                        nextInstallment
                    }
                });
            } catch (e) {
                console.error("Dashboard Load Error:", e);
                toast.error("Failed to load dashboard data");
            } finally {
                setLoading(false);
            }
        };

        if (user?.userId || user?.id) {
            fetchAllData();
        }
    }, [user, toast]);

    // Derived State
    const learnerProfile = {
        level: user?.level || "Learner",
        xp: user?.xp || 0,
        nextLevelXp: user?.nextLevelXp || 1000,
        role: user?.role || "Student",
        badges: user?.badges || [
            { icon: "🏆", name: "Fast Learner" },
            { icon: "⭐", name: "Top Performer" }
        ]
    };

    const scheduleItems = (dashboardData.batches || []).slice(0, 3).map((batch, i) => ({
        time: i === 0 ? "09:00 AM" : (i === 1 ? "11:30 AM" : "02:00 PM"),
        title: batch.batchName || batch.name || "Scheduled Session",
        type: "Batch Session",
        instructor: batch.instructorName || "Faculty"
    }));

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
        <div className="student-dashboard-page container-fluid px-0 text-body">
            {/* Top-level Overdue Alert */}
            {dashboardData.fee.hasOverdue && (
                <div className="alert alert-danger d-flex align-items-center mb-4 border-0 shadow-sm rounded-4" role="alert">
                    <AlertCircle className="me-3" size={24} />
                    <div>
                        <h6 className="alert-heading fw-bold mb-1">Payment Overdue</h6>
                        <p className="mb-0 small">You have overdue fee installments. Please clear your dues immediately to avoid penalties.</p>
                    </div>
                    <button className="btn btn-sm btn-danger ms-auto fw-bold px-3 rounded-pill" onClick={() => navigate('/student/fee')}>
                        Pay Now
                    </button>
                </div>
            )}

            {/* Header */}
            <div className="d-md-flex align-items-center justify-content-between mb-5">
                <div>
                    <h2 className="fw-bold text-body mb-1">Dashboard Overview</h2>
                    <p className="text-muted mb-0">Welcome back, <span className="text-primary fw-bold">{user?.name || 'Student'}</span>! Track your learning progress here.</p>
                </div>
            </div>

            {/* Stats Row */}
            <div className="row g-4 mb-5">
                <div className="col-12 col-md-4">
                    <StatCard
                        label="My Courses"
                        value={dashboardData.stats.coursesCount}
                        icon={BookOpen}
                        color="99, 102, 241"
                    />
                </div>
                <div className="col-12 col-md-4">
                    <StatCard
                        label="Active Batches"
                        value={dashboardData.stats.batchesCount}
                        icon={Users}
                        color="168, 85, 247"
                    />
                </div>
                <div className="col-12 col-md-4">
                    <StatCard
                        label="Attendance"
                        value={`${dashboardData.stats.attendancePct}%`}
                        icon={Calendar}
                        color="16, 185, 129"
                    />
                </div>
            </div>

            <div className="row g-4 g-xl-5">
                {/* Main Content Area */}
                <div className="col-12 col-lg-8">
                    {/* Fee Summary Widget */}
                    <section className="mb-5">
                        <div className="d-flex justify-content-between align-items-center mb-4">
                            <h4 className="fw-bold m-0 text-body">Fee Highlights</h4>
                            <button className="btn btn-link text-primary p-0 text-decoration-none small fw-bold d-flex align-items-center gap-1 transition-all hover-translate-x" onClick={() => navigate('/student/fee')}>
                                View Details <ChevronRight size={16} />
                            </button>
                        </div>

                        {!dashboardData.fee.allocation ? (
                            <div className="card border-0 shadow-sm p-4 text-center rounded-4" style={{ background: 'var(--surface)' }}>
                                <p className="text-muted mb-0 mt-2">No fee structure allocated yet.</p>
                            </div>
                        ) : (
                            <div className="row g-4">
                                {/* Card 1 - Fee Summary */}
                                <div className="col-12 col-md-6">
                                    <div className="card border-0 shadow-sm p-4 rounded-4 h-100" style={{ background: 'linear-gradient(135deg, var(--surface) 0%, #f8f9fa 100%)' }}>
                                        <div className="d-flex align-items-center justify-content-between mb-3">
                                            <h6 className="fw-bold text-dark mb-0">Total Payable</h6>
                                            <div className="p-2 bg-primary bg-opacity-10 text-primary rounded-circle"><DollarSign size={18} /></div>
                                        </div>
                                        <h3 className="fw-bold text-primary mb-4">₹{Number(dashboardData.fee.allocation.payableAmount || 0).toFixed(2)}</h3>

                                        <div className="d-flex justify-content-between align-items-center mb-2">
                                            <span className="text-muted small">Advance Paid</span>
                                            <span className="fw-bold text-success">₹{Number(dashboardData.fee.allocation.advancePayment || 0).toFixed(2)}</span>
                                        </div>
                                        <div className="d-flex justify-content-between align-items-center pt-2 border-top border-light">
                                            <span className="text-muted small">Remaining</span>
                                            <span className="fw-bold text-danger">₹{Number(dashboardData.fee.allocation.remainingAmount || 0).toFixed(2)}</span>
                                        </div>
                                    </div>
                                </div>

                                {/* Card 2 - Next Installment */}
                                <div className="col-12 col-md-6">
                                    <div className="card border-0 shadow-sm p-4 rounded-4 h-100 bg-white">
                                        <div className="d-flex align-items-center justify-content-between mb-3">
                                            <h6 className="fw-bold text-dark mb-0">Upcoming Due</h6>
                                            <div className="p-2 bg-warning bg-opacity-10 text-warning rounded-circle"><Calendar size={18} /></div>
                                        </div>

                                        {dashboardData.fee.nextInstallment ? (
                                            <>
                                                <h3 className="fw-bold text-dark mb-2">₹{Number(dashboardData.fee.nextInstallment.amount || dashboardData.fee.nextInstallment.installmentAmount || 0).toFixed(2)}</h3>
                                                <p className="text-muted small mb-4">
                                                    Due on: <strong>{new Date(dashboardData.fee.nextInstallment.dueDate).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}</strong>
                                                </p>
                                                <button className="btn btn-sm btn-outline-primary fw-bold w-100 rounded-pill" onClick={() => navigate('/student/fee')}>
                                                    Manage Payments
                                                </button>
                                            </>
                                        ) : dashboardData.fee.installments.length > 0 && dashboardData.fee.installments.every(i => i.status === 'PAID') ? (
                                            <div className="text-center mt-3">
                                                <div className="d-inline-flex bg-success bg-opacity-10 text-success p-3 rounded-circle mb-3"><CheckCircle size={32} /></div>
                                                <p className="fw-bold text-success mb-0">All dues cleared!</p>
                                            </div>
                                        ) : (
                                            <p className="text-muted small mt-2">No pending installments scheduled.</p>
                                        )}
                                    </div>
                                </div>
                            </div>
                        )}
                    </section>

                    <section className="mb-5">
                        <div className="d-flex justify-content-between align-items-center mb-4">
                            <h4 className="fw-bold m-0 text-body">Continue Learning</h4>
                        </div>
                        <div className="row g-4">
                            {dashboardData.courses.length > 0 ? (
                                dashboardData.courses.slice(0, 2).map((course, idx) => (
                                    <div className="col-12 col-md-6" key={course.courseId || idx}>
                                        <CourseCard
                                            course={{
                                                ...course,
                                                progress: course.progress || 0,
                                                priority: idx === 0 ? 'High' : 'Medium'
                                            }}
                                            onNavigate={() => navigate(`/student/courses`)}
                                        />
                                    </div>
                                ))
                            ) : (
                                <div className="col-12">
                                    <div className="card border-dashed p-5 text-center text-muted rounded-4" style={{ background: 'var(--hover-bg)' }}>
                                        <BookOpen size={48} className="mb-3 opacity-25" />
                                        <h5 className="fw-bold">No courses enrolled yet</h5>
                                        <button className="btn btn-primary mt-3 px-4 rounded-pill fw-bold" onClick={() => navigate('/student/courses')}>Browse Catalog</button>
                                    </div>
                                </div>
                            )}
                        </div>
                    </section>
                </div>

                {/* Sidebar area */}
                <div className="col-12 col-lg-4">
                    <section className="mb-5">
                        <XpWidget user={learnerProfile} />
                    </section>

                    <section className="mb-5">
                        <div className="d-flex align-items-center justify-content-between mb-4">
                            <h5 className="fw-bold m-0 text-body">Today's Schedule</h5>
                        </div>
                        <ActivityTimeline items={scheduleItems.length > 0 ? scheduleItems : [
                            { time: "TBD", title: "No classes scheduled", type: "Stay tuned", instructor: "-" }
                        ]} />
                    </section>

                    <section className="mb-5">
                        <div className="d-flex align-items-center justify-content-between mb-4">
                            <h5 className="fw-bold m-0 text-body">Quick Links</h5>
                        </div>
                        <div className="row g-3">
                            <div className="col-6">
                                <QuickAction icon={Video} label="Join Class" color="239, 68, 68" onClick={() => handleFakeAction('Join Class')} />
                            </div>
                            <div className="col-6">
                                <QuickAction icon={Calendar} label="Attendance" color="16, 185, 129" onClick={() => navigate('/student/attendance')} />
                            </div>
                            <div className="col-6">
                                <QuickAction icon={MessageCircle} label="Messages" color="139, 92, 246" onClick={() => navigate('/student/communication')} />
                            </div>
                            <div className="col-6">
                                <QuickAction icon={BookOpen} label="Library" color="99, 102, 241" onClick={() => navigate('/student/library')} />
                            </div>
                        </div>
                    </section>
                </div>
            </div>
        </div>
    );
};

export default StudentDashboard;
