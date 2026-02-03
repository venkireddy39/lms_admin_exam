import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../Library/context/AuthContext';
import { studentService } from '../../services/studentService';
import {
    StatCard,
    QuickAction,
    CourseCard,
    XpWidget,
    ActivityTimeline
} from './components/StudentDashboardComponents';
import {
    BookOpen,
    Users,
    Calendar,
    Book,
    Play,
    Upload,
    Video,
    BarChart2,
    Bell,
    Search,
    FileText
} from 'lucide-react';
import './StudentDashboard.css';

const StudentDashboard = () => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);

    const [dashboardData, setDashboardData] = useState({
        courses: [],
        batches: [],
        attendance: [],
        books: [],
        assignments: [],
        stats: {
            coursesCount: 0,
            batchesCount: 0,
            attendancePct: 0,
            booksCount: 0,
            assignmentsCount: 0
        }
    });

    useEffect(() => {
        const loadDashboardData = async () => {
            setLoading(true);
            try {
                const [myCourses, myBatches, myAttendance, myBooks, myAssignments] = await Promise.all([
                    studentService.getMyCourses(),
                    studentService.getMyBatches(),
                    studentService.getMyAttendance(),
                    studentService.getMyLibraryBooks(),
                    studentService.getAssignments()
                ]);

                // Calculate Attendance %
                const totalAtt = Array.isArray(myAttendance) ? myAttendance.length : 0;
                const present = Array.isArray(myAttendance) ? myAttendance.filter(a => a.status === 'Present').length : 0;
                const attPercent = totalAtt > 0 ? Math.round((present / totalAtt) * 100) : 0;

                setDashboardData({
                    courses: Array.isArray(myCourses) ? myCourses : [],
                    batches: Array.isArray(myBatches) ? myBatches : [],
                    attendance: Array.isArray(myAttendance) ? myAttendance : [],
                    books: Array.isArray(myBooks) ? myBooks : [],
                    assignments: Array.isArray(myAssignments) ? myAssignments : [],
                    stats: {
                        coursesCount: Array.isArray(myCourses) ? myCourses.length : 0,
                        batchesCount: Array.isArray(myBatches) ? myBatches.length : 0,
                        attendancePct: attPercent,
                        booksCount: Array.isArray(myBooks) ? myBooks.length : 0,
                        assignmentsCount: Array.isArray(myAssignments) ? myAssignments.length : 0
                    }
                });
            } catch (e) {
                console.error("Failed to load dashboard data", e);
            } finally {
                setLoading(false);
            }
        };

        loadDashboardData();
    }, []);

    // Learner profile derived from real user data
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

    // Simplified schedule from batches if available
    const [scheduleItems, setScheduleItems] = useState([
        { time: "09:00 AM", title: "Upcoming Session", type: "Live Class", instructor: "Loading..." },
    ]);

    useEffect(() => {
        if (dashboardData.batches.length > 0) {
            const batchItems = dashboardData.batches.slice(0, 3).map((batch, i) => ({
                time: i === 0 ? "09:00 AM" : (i === 1 ? "11:30 AM" : "02:00 PM"),
                title: batch.batchName || batch.name,
                type: "Batch Session",
                instructor: batch.instructorName || "Faculty"
            }));
            setScheduleItems(batchItems);
        }
    }, [dashboardData.batches]);

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
            <div className="row mb-4 align-items-center">
                <div className="col">
                    <h2 className="fw-bold mb-1">Welcome back, {user?.name?.split(' ')[0] || 'Learner'}! 👋</h2>
                    <p className="text-secondary mb-0">You have {dashboardData.stats.coursesCount} active courses and {dashboardData.stats.assignmentsCount} pending assignments.</p>
                </div>
                <div className="col-auto d-none d-md-flex gap-2">
                    <button className="btn btn-outline-secondary btn-sm rounded-circle p-2">
                        <Search size={18} />
                    </button>
                    <button className="btn btn-outline-secondary btn-sm rounded-circle p-2 position-relative">
                        <Bell size={18} />
                        <span className="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger" style={{ fontSize: '8px', padding: '3px 5px' }}>
                            2
                        </span>
                    </button>
                </div>
            </div>

            {/* Stats Row */}
            <div className="row g-4 mb-5">
                <div className="col-12 col-sm-6 col-xl-3">
                    <StatCard label="My Courses" value={dashboardData.stats.coursesCount} icon={BookOpen} color="99, 102, 241" delay={0.1} />
                </div>
                <div className="col-12 col-sm-6 col-xl-3">
                    <StatCard label="Active Batches" value={dashboardData.stats.batchesCount} icon={Users} color="168, 85, 247" delay={0.2} />
                </div>
                <div className="col-12 col-sm-6 col-xl-3">
                    <StatCard label="Attendance" value={`${dashboardData.stats.attendancePct}%`} icon={Calendar} color="16, 185, 129" delay={0.3} />
                </div>
                <div className="col-12 col-sm-6 col-xl-3">
                    <StatCard label="Library Books" value={dashboardData.stats.booksCount} icon={Book} color="245, 158, 11" delay={0.4} />
                </div>
            </div>

            <div className="row g-5">
                {/* Main Content Area */}
                <div className="col-12 col-lg-8">

                    {/* Courses Section */}
                    <section className="mb-5">
                        <div className="d-flex justify-content-between align-items-center mb-4">
                            <h4 className="fw-bold m-0">Continue Learning</h4>
                            <button className="btn btn-link text-primary p-0 text-decoration-none small fw-bold" onClick={() => navigate('/student/courses')}>
                                View All
                            </button>
                        </div>
                        <div className="row g-4">
                            {dashboardData.courses.length > 0 ? (
                                dashboardData.courses.slice(0, 2).map((course, idx) => (
                                    <div className="col-12 col-md-6" key={course.id || idx}>
                                        <CourseCard
                                            course={{
                                                ...course,
                                                progress: course.progress || 75,
                                                priority: idx === 0 ? 'High' : 'Medium'
                                            }}
                                            onNavigate={(id) => navigate(`/student/courses`)}
                                        />
                                    </div>
                                ))
                            ) : (
                                <div className="col-12">
                                    <div className="glass-card p-5 text-center text-secondary">
                                        <BookOpen size={48} className="mb-3 opacity-25" />
                                        <h5>No courses enrolled yet</h5>
                                        <button className="btn btn-primary mt-3 px-4">Browse Catalog</button>
                                    </div>
                                </div>
                            )}
                        </div>
                    </section>

                    {/* Today's Schedule timeline */}
                    <section>
                        <div className="d-flex justify-content-between align-items-center mb-4">
                            <h4 className="fw-bold m-0">Today's Schedule</h4>
                            <span className="badge bg-primary bg-opacity-10 text-primary rounded-pill px-3">
                                {scheduleItems.length} Sessions
                            </span>
                        </div>
                        <ActivityTimeline items={scheduleItems} />
                    </section>

                </div>

                {/* Sidebar area */}
                <div className="col-12 col-lg-4">

                    {/* Gamification Widget */}
                    <section className="mb-5">
                        <XpWidget user={learnerProfile} />
                    </section>

                    {/* Quick Actions */}
                    <section className="mb-5">
                        <h5 className="fw-bold mb-4">Quick Actions</h5>
                        <div className="row g-3">
                            <div className="col-6">
                                <QuickAction icon={Video} label="Join Class" color="239, 68, 68" onClick={() => { }} />
                            </div>
                            <div className="col-6">
                                <QuickAction icon={Upload} label="Submit" color="168, 85, 247" onClick={() => { }} />
                            </div>
                            <div className="col-6">
                                <QuickAction icon={FileText} label="Assignments" color="16, 185, 129" onClick={() => navigate('/student/courses')} />
                            </div>
                            <div className="col-6">
                                <QuickAction icon={BarChart2} label="Reports" color="59, 130, 246" onClick={() => navigate('/student/attendance')} />
                            </div>
                        </div>
                    </section>

                    {/* Upcoming Deadlines */}
                    <section>
                        <h5 className="fw-bold mb-4">Deadlines</h5>
                        <div className="d-flex flex-column gap-3">
                            {dashboardData.assignments.length > 0 ? (
                                dashboardData.assignments.slice(0, 3).map((asgn, idx) => (
                                    <div key={asgn.id || idx} className={`glass-card p-3 ${idx === 0 ? 'border-danger border-opacity-25' : ''}`}>
                                        <div className="d-flex justify-content-between align-items-center mb-2">
                                            <span className={`badge ${idx === 0 ? 'bg-danger' : 'bg-primary'} bg-opacity-10 text-${idx === 0 ? 'danger' : 'primary'} small`}>
                                                {idx === 0 ? 'URGENT' : 'UPCOMING'}
                                            </span>
                                            <span className="text-secondary small">{asgn.dueDate || 'Soon'}</span>
                                        </div>
                                        <h6 className="fw-bold mb-2 text-white">{asgn.title || asgn.name}</h6>
                                        <button className="btn btn-sm w-100 btn-light bg-white bg-opacity-10 text-white border-white border-opacity-10">
                                            {idx === 0 ? 'Prepare Now' : 'Submit Now'}
                                        </button>
                                    </div>
                                ))
                            ) : (
                                <div className="glass-card p-4 text-center text-secondary small">
                                    No upcoming deadlines
                                </div>
                            )}
                        </div>
                    </section>

                </div>
            </div>
        </div>
    );
};

export default StudentDashboard;

