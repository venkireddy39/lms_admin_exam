import React, { useState, useEffect } from 'react';
import { FiBookOpen, FiClock, FiAward, FiPlayCircle, FiCalendar, FiArrowRight, FiRefreshCw } from "react-icons/fi";
import { useAuth } from '../../Library/context/AuthContext';
import { apiFetch } from '../../../services/api';
import AdmitCardModal from '../../Home/components/AdmitCardModal';
import FaceVerificationModal from '../../Home/components/FaceVerificationModal';
import '../../Home/Home.css';

const StudentDashboard = () => {
    const { user } = useAuth();
    const [activeTab, setActiveTab] = useState('courses');
    const [selectedExamForCard, setSelectedExamForCard] = useState(null);
    const [showFaceVerify, setShowFaceVerify] = useState(false);
    
    const [dashboardData, setDashboardData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Use current user ID or fallback to 19 as per user request
    const studentId = user?.userId || user?.id || 19;

    useEffect(() => {
        fetchDashboardData();
    }, [studentId]);

    const fetchDashboardData = async () => {
        setLoading(true);
        setError(null);
        try {
            // Using the endpoint provided by the user
            const data = await apiFetch(`/api/student/dashboard/${studentId}`);
            setDashboardData(data);
        } catch (err) {
            console.error("Failed to fetch dashboard data:", err);
            setError("Unable to load dashboard. Using offline preview.");
            // Keep existing null or fallback to mock data if needed?
            // For now, let's just show the error.
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="d-flex flex-column justify-content-center align-items-center vh-100 bg-light">
                <div className="spinner-border text-primary mb-3" role="status">
                    <span className="visually-hidden">Loading...</span>
                </div>
                <p className="text-muted fw-semibold">Preparing your learning workspace...</p>
            </div>
        );
    }

    if (error && !dashboardData) {
        return (
            <div className="container p-5 text-center">
                <div className="card shadow-sm border-0 p-5 rounded-4">
                    <div className="mb-4">
                        <FiRefreshCw size={48} className="text-warning mb-3" />
                        <h2 className="fw-bold">Connection Issue</h2>
                        <p className="text-muted">We couldn't reach the student service at the moment.</p>
                        <code className="d-block bg-light p-2 mb-3">Endpoint: /api/student/dashboard/{studentId}</code>
                    </div>
                    <button className="btn btn-primary px-4 py-2" onClick={fetchDashboardData}>
                        Try Again
                    </button>
                    <p className="mt-4 small text-muted">Please ensure the student management service is running on port 5151.</p>
                </div>
            </div>
        );
    }

    // Map Backend Data to UI Components (with fallbacks to mock if needed)
    const studentInfo = dashboardData?.student || {
        name: user?.firstName || "Student",
        course: "Enrolled Program",
        image: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60",
    };

    const enrolledCourses = dashboardData?.enrolledCourses || [];
    const upcomingEvents = dashboardData?.upcomingEvents || [];
    const availableExams = dashboardData?.availableExams || [];
    const stats = dashboardData?.stats || {
        courses: enrolledCourses.length,
        certificates: 0,
        learningHours: "0h",
        attendance: "0%"
    };

    return (
        <div className="learner-dashboard animate-fade-in p-4">
            {/* Welcome Section */}
            <div className="learner-welcome-banner mb-5">
                <div className="welcome-text">
                    <h1>Welcome back, <span className="highlight-text">{studentInfo.name.split(' ')[0]}!</span> 👋</h1>
                    <p>You have <strong>{upcomingEvents.length} tasks</strong> pending for today. Let's keep up the momentum!</p>
                    {enrolledCourses.length > 0 && (
                        <button className="btn-resume">
                            <FiPlayCircle className="me-2" /> Resume Learning
                        </button>
                    )}
                </div>
                <div className="welcome-stats">
                    <div className="l-stat-item">
                        <div className="icon-box bg-blue-subtle text-blue">
                            <FiBookOpen />
                        </div>
                        <div>
                            <h4>{stats.courses}</h4>
                            <span>Courses</span>
                        </div>
                    </div>
                    <div className="l-stat-item">
                        <div className="icon-box bg-green-subtle text-green">
                            <FiAward />
                        </div>
                        <div>
                            <h4>{stats.certificates}</h4>
                            <span>Certificates</span>
                        </div>
                    </div>
                    <div className="l-stat-item">
                        <div className="icon-box bg-orange-subtle text-orange">
                            <FiClock />
                        </div>
                        <div>
                            <h4>{stats.learningHours}</h4>
                            <span>Learning</span>
                        </div>
                    </div>
                    <div className="l-stat-item">
                        <div className="icon-box bg-purple-subtle text-purple">
                            <FiCalendar />
                        </div>
                        <div>
                            <h4>{stats.attendance}</h4>
                            <span>Attendance</span>
                        </div>
                    </div>
                </div>
            </div>

            <div className="dashboard-grid-layout">
                {/* Left Column: My Courses & Exams */}
                <div className="main-content-col">
                    {/* Tabs */}
                    <div className="d-flex align-items-center gap-4 border-bottom mb-4 pb-1">
                        <button
                            className={`btn-tab ${activeTab === 'courses' ? 'active' : ''}`}
                            onClick={() => setActiveTab('courses')}
                        >
                            My Courses
                        </button>
                        <button
                            className={`btn-tab ${activeTab === 'exams' ? 'active' : ''}`}
                            onClick={() => setActiveTab('exams')}
                        >
                            Exams & Quizzes
                            {availableExams.some(e => e.status === 'live') && <span className="badge-dot"></span>}
                        </button>
                    </div>

                    {activeTab === 'courses' && (
                        <div className="my-courses-grid animate-slide-up">
                            {enrolledCourses.length === 0 ? (
                                <div className="text-center p-5 text-muted">
                                    <FiBookOpen size={48} className="mb-3 opacity-25" />
                                    <p>No enrolled courses found.</p>
                                </div>
                            ) : enrolledCourses.map(course => (
                                <div key={course.id} className="course-progress-card">
                                    <div className="c-image">
                                        <img src={course.image || "https://images.unsplash.com/photo-1517694712202-14dd9538aa97?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60"} alt={course.title} />
                                    </div>
                                    <div className="c-details">
                                        <h4 className="c-title">{course.title}</h4>
                                        <p className="c-instructor">by {course.instructor}</p>

                                        <div className="c-progress">
                                            <div className="progress-info">
                                                <span>{course.progress}% Complete</span>
                                                <span>{course.completedLessons}/{course.totalLessons} Lessons</span>
                                            </div>
                                            <div className="progress-bar-track">
                                                <div
                                                    className="progress-bar-fill"
                                                    style={{ width: `${course.progress}%`, background: course.progress === 100 ? '#10b981' : '#3b82f6' }}
                                                ></div>
                                            </div>
                                        </div>

                                        <div className="c-footer">
                                            <span className="last-access"><FiClock className="me-1" /> {course.lastAccessed || 'Never'}</span>
                                            <button className="btn-continue">
                                                {course.progress === 0 ? 'Start' : 'Continue'} <FiArrowRight />
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}

                    {activeTab === 'exams' && (
                        <div className="animate-slide-up">
                            {availableExams.length === 0 ? (
                                <div className="text-center p-5 text-muted">
                                    <FiAward size={48} className="mb-3 opacity-25" />
                                    <p>No exams currently available.</p>
                                </div>
                            ) : (
                                <div className="d-flex flex-column gap-3">
                                    {availableExams.map(exam => (
                                        <div key={exam.id} className={`exam-card ${exam.status === 'live' ? 'border-primary shadow-sm' : ''}`}>
                                            <div className="d-flex justify-content-between align-items-start">
                                                <div>
                                                    <div className="d-flex align-items-center gap-2 mb-1">
                                                        {exam.status === 'live' && <span className="badge bg-danger bg-opacity-10 text-danger px-2 py-1 rounded-pill x-small fw-bold">● LIVE</span>}
                                                        {exam.status === 'upcoming' && <span className="badge bg-warning bg-opacity-10 text-warning px-2 py-1 rounded-pill x-small fw-bold">UPCOMING</span>}
                                                        {exam.status === 'completed' && <span className="badge bg-secondary bg-opacity-10 text-secondary px-2 py-1 rounded-pill x-small fw-bold">COMPLETED</span>}
                                                        <span className="text-muted small fw-bold text-uppercase">{exam.course}</span>
                                                    </div>
                                                    <h5 className="fw-bold mb-1">{exam.title}</h5>
                                                    <div className="d-flex gap-3 text-muted small mt-2">
                                                        <span><FiCalendar className="me-1" /> {exam.date}</span>
                                                        <span><FiClock className="me-1" /> {exam.duration}</span>
                                                        <span><FiAward className="me-1" /> {exam.marks} Marks</span>
                                                    </div>
                                                </div>
                                                <div className="text-end">
                                                    <div className="mb-2">
                                                        <span className="small text-muted d-block">Attempts</span>
                                                        <span className="fw-bold">{exam.attemptsUsed} / {exam.attemptsMax === 'unlimited' ? '∞' : exam.attemptsMax}</span>
                                                    </div>

                                                    <div className="d-flex gap-2 justify-content-end">
                                                        {(exam.status === 'live' || exam.status === 'upcoming') && (
                                                            <button
                                                                className="btn btn-light btn-sm"
                                                                onClick={() => setSelectedExamForCard(exam)}
                                                                title="View Admit Card"
                                                            >
                                                                <i className="bi bi-qr-code"></i>
                                                            </button>
                                                        )}

                                                        {exam.status === 'live' && (
                                                            <button
                                                                className="btn btn-primary btn-sm fw-bold px-4"
                                                                onClick={() => setShowFaceVerify(true)}
                                                            >
                                                                Join Exam
                                                            </button>
                                                        )}
                                                        {exam.status === 'upcoming' && (
                                                            <button className="btn btn-outline-secondary btn-sm px-4" disabled>Starts Soon</button>
                                                        )}
                                                        {exam.status === 'completed' && (
                                                            <button className="btn btn-light btn-sm text-primary px-4">View Result</button>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    )}
                </div>

                {/* Right Column: Schedule & Quick Actions */}
                <div className="sidebar-col">
                    {/* Schedule */}
                    <div className="dashboard-card mb-4">
                        <div className="card-header-simple">
                            <h3><FiCalendar className="me-2" /> Upcoming Schedule</h3>
                        </div>
                        <div className="schedule-list">
                            {upcomingEvents.length === 0 ? (
                                <p className="text-muted small p-4 mb-0">No upcoming events found.</p>
                            ) : upcomingEvents.map(event => (
                                <div key={event.id} className="schedule-item">
                                    <div className="date-box">
                                        <span className="event-type-dot"></span>
                                    </div>
                                    <div className="event-info">
                                        <h5>{event.title}</h5>
                                        <span className="event-time">{event.time}</span>
                                        <span className={`event-badge ${event.type === 'Exam' ? 'badge-red' : 'badge-blue'}`}>
                                            {event.type}
                                        </span>
                                    </div>
                                </div>
                            ))}
                        </div>
                        <button className="btn-block-outline mt-3 mx-3 mb-3">View Full Calendar</button>
                    </div>

                    {/* Quick Stats / Achievements */}
                    <div className="dashboard-card bg-gradient-primary text-white">
                        <div className="p-4">
                            <h3 className="mb-3">Weekly Goal</h3>
                            <div className="d-flex align-items-end gap-2 mb-2">
                                <h1 className="mb-0 display-4 fw-bold">{stats.goalCurrent || '0'}</h1>
                                <span className="mb-2 opacity-75">/ {stats.goalMax || '5'} hrs</span>
                            </div>
                            <p className="small opacity-75 mb-3">You're making progress! Keep it up to reach your weekly learning goal.</p>
                            <div className="progress-white mb-0">
                                <div className="fill" style={{ width: `${(parseFloat(stats.goalCurrent || 0) / parseFloat(stats.goalMax || 5)) * 100}%` }}></div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <AdmitCardModal
                isOpen={!!selectedExamForCard}
                onClose={() => setSelectedExamForCard(null)}
                exam={selectedExamForCard}
                student={studentInfo}
            />

            <FaceVerificationModal
                isOpen={showFaceVerify}
                onClose={() => setShowFaceVerify(false)}
                onVerified={() => {
                    setShowFaceVerify(false);
                    alert("Verification Successful! Redirecting to Exam...");
                }}
            />

            <style>{`
                .learner-welcome-banner {
                    background: white;
                    border-radius: 16px;
                    padding: 32px;
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05);
                    border: 1px solid #e2e8f0;
                }
                .highlight-text { color: #4f46e5; }
                .welcome-text h1 { font-size: 28px; font-weight: 800; color: #0f172a; margin-bottom: 8px; }
                .welcome-text p { color: #64748b; margin-bottom: 24px; }
                .btn-resume { 
                    background: #4f46e5; color: white; border: none; padding: 10px 24px; 
                    border-radius: 8px; font-weight: 600; display: flex; align-items: center; 
                    cursor: pointer; transition: transform 0.2s;
                }
                .btn-resume:hover { transform: translateY(-2px); background: #4338ca; }

                .welcome-stats { display: flex; gap: 32px; }
                .l-stat-item { display: flex; align-items: center; gap: 16px; }
                .l-stat-item .icon-box { 
                    width: 48px; height: 48px; border-radius: 12px; 
                    display: flex; align-items: center; justify-content: center; font-size: 24px; 
                }
                .l-stat-item h4 { font-size: 20px; font-weight: 700; margin: 0; color: #0f172a; }
                .l-stat-item span { font-size: 13px; color: #64748b; }

                .dashboard-grid-layout {
                    display: grid; grid-template-columns: 1fr 340px; gap: 24px;
                }

                .course-progress-card {
                    background: white; border-radius: 12px; padding: 16px; border: 1px solid #e2e8f0;
                    display: flex; gap: 20px; margin-bottom: 16px; transition: all 0.2s;
                }
                .course-progress-card:hover { transform: translateY(-2px); box-shadow: 0 10px 15px -3px rgba(0,0,0,0.05); }
                .c-image img { width: 140px; height: 100px; border-radius: 8px; object-fit: cover; }
                .c-details { flex: 1; display: flex; flex-direction: column; justify-content: center; }
                .c-title { font-size: 16px; font-weight: 700; margin: 0 0 4px 0; color: #0f172a; }
                .c-instructor { font-size: 13px; color: #64748b; margin-bottom: 12px; }
                
                .c-progress { margin-bottom: 12px; }
                .progress-info { display: flex; justify-content: space-between; font-size: 12px; color: #475569; margin-bottom: 6px; font-weight: 500; }
                .progress-bar-track { height: 6px; background: #f1f5f9; border-radius: 10px; overflow: hidden; }
                .progress-bar-fill { height: 100%; border-radius: 10px; transition: width 0.5s; }

                .c-footer { display: flex; justify-content: space-between; align-items: center; }
                .last-access { font-size: 12px; color: #94a3b8; display: flex; align-items: center; }
                .btn-continue { background: none; border: none; color: #4f46e5; font-weight: 600; font-size: 13px; cursor: pointer; display: flex; align-items: center; gap: 4px; }
                .btn-continue:hover { text-decoration: underline; }

                .dashboard-card { background: white; border-radius: 12px; border: 1px solid #e2e8f0; overflow: hidden; }
                .card-header-simple { padding: 16px; border-bottom: 1px solid #f1f5f9; }
                .card-header-simple h3 { font-size: 16px; font-weight: 700; margin: 0; display: flex; align-items: center; }
                .schedule-list { padding: 16px; }
                .schedule-item { display: flex; gap: 12px; margin-bottom: 16px; padding-bottom: 16px; border-bottom: 1px dashed #f1f5f9; }
                .schedule-item:last-child { margin-bottom: 0; padding-bottom: 0; border: none; }
                .event-info h5 { font-size: 14px; font-weight: 600; margin: 0 0 4px 0; }
                .event-time { font-size: 12px; color: #64748b; display: block; margin-bottom: 4px; }
                .event-badge { font-size: 11px; padding: 2px 8px; border-radius: 4px; font-weight: 600; }
                .badge-blue { background: #eff6ff; color: #3b82f6; }
                .badge-red { background: #fef2f2; color: #ef4444; }

                .bg-blue-subtle { background: #eff6ff; } .text-blue { color: #3b82f6; }
                .bg-green-subtle { background: #dcfce7; } .text-green { color: #16a34a; }
                .bg-orange-subtle { background: #ffedd5; } .text-orange { color: #c2410c; }
                .bg-purple-subtle { background: #f3e8ff; } .text-purple { color: #9333ea; }

                .btn-block-outline { width: 100%; padding: 10px; border: 1px solid #e2e8f0; border-radius: 8px; color: #475569; font-weight: 600; cursor: pointer; }
                .btn-block-outline:hover { background: #f8fafc; }

                .progress-white { background: rgba(255,255,255,0.2); height: 6px; border-radius: 10px; overflow: hidden; }
                .progress-white .fill { background: white; height: 100%; border-radius: 10px; }

                .bg-gradient-primary { background: linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%); }

                @media (max-width: 1024px) {
                    .dashboard-grid-layout { grid-template-columns: 1fr; }
                    .sidebar-col { display: grid; grid-template-columns: 1fr 1fr; gap: 24px; }
                }
                @media (max-width: 768px) {
                    .learner-welcome-banner { flex-direction: column; align-items: flex-start; gap: 24px; }
                    .welcome-stats { width: 100%; justify-content: space-between; flex-wrap: wrap; }
                    .sidebar-col { grid-template-columns: 1fr; }
                    .course-progress-card { flex-direction: column; }
                    .c-image img { width: 100%; height: 160px; }
                    .c-footer { flex-wrap: wrap; gap: 12px; }
                }

                .btn-tab {
                    background: none; border: none; padding: 8px 0; margin-right: 0;
                    color: #64748b; font-weight: 600; font-size: 15px; position: relative;
                    cursor: pointer; transition: color 0.2s;
                }
                .btn-tab:hover { color: #0f172a; }
                .btn-tab.active { color: #0f172a; }
                .btn-tab.active::after {
                    content: ''; position: absolute; bottom: -2px; left: 0; width: 100%; height: 2px; background: #0f172a; border-radius: 2px;
                }
                .badge-dot {
                    width: 6px; height: 6px; background: #ef4444; border-radius: 50%;
                    display: inline-block; vertical-align: top; margin-left: 4px;
                }

                .exam-card { 
                    background: white; border: 1px solid #e2e8f0; border-radius: 12px; padding: 20px; 
                    transition: all 0.2s;
                }
                .exam-card:hover { transform: translateY(-2px); box-shadow: 0 4px 6px -1px rgba(0,0,0,0.05); }
                .x-small { font-size: 11px; }
            `}</style>
        </div>
    );
};

export default StudentDashboard;
