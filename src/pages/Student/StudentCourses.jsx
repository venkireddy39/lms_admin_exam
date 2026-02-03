import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { studentService } from '../../services/studentService';
import {
    Search,
    Filter,
    BookOpen,
    Play,
    Clock,
    MoreVertical,
    CheckCircle,
    User
} from 'lucide-react';
import './StudentDashboard.css'; // Reuse core glass styles
import './StudentCourses.css';

const StudentCourses = () => {
    const navigate = useNavigate();
    const [courses, setCourses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('All');
    const [searchQuery, setSearchQuery] = useState('');

    const tabs = ['All', 'In Progress', 'Completed', 'Waitlisted'];

    useEffect(() => {
        const fetchCourses = async () => {
            try {
                const data = await studentService.getMyCourses();
                setCourses(Array.isArray(data) ? data : []);
            } catch (error) {
                console.error("Failed to fetch courses", error);
            } finally {
                setLoading(false);
            }
        };

        fetchCourses();
    }, []);

    const filteredCourses = courses.filter(course => {
        const matchesFilter = filter === 'All' ||
            (filter === 'In Progress' && course.progress < 100) ||
            (filter === 'Completed' && course.progress === 100);

        const matchesSearch = course.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
            course.instructor?.toLowerCase().includes(searchQuery.toLowerCase());

        return matchesFilter && matchesSearch;
    });

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
            {/* Header Section */}
            <div className="row mb-4 align-items-end g-3">
                <div className="col-12 col-md">
                    <h2 className="fw-bold mb-1">My Learning Journey</h2>
                    <p className="text-secondary mb-0">Track your progress and continue where you left off.</p>
                </div>

                <div className="col-12 col-md-auto d-flex gap-2">
                    <div className="glass-card d-flex align-items-center px-3 py-2" style={{ maxWidth: '300px' }}>
                        <Search size={18} className="text-secondary me-2" />
                        <input
                            type="text"
                            placeholder="Search courses..."
                            className="bg-transparent border-0 text-white outline-none small"
                            style={{ outline: 'none' }}
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>
                    <button className="glass-card p-2 text-secondary">
                        <Filter size={18} />
                    </button>
                </div>
            </div>

            {/* Tabs */}
            <div className="filter-tabs mb-4">
                {tabs.map(tab => (
                    <button
                        key={tab}
                        className={`filter-tab ${filter === tab ? 'active' : ''}`}
                        onClick={() => setFilter(tab)}
                    >
                        {tab}
                    </button>
                ))}
            </div>

            {/* Course Grid */}
            <div className="course-grid">
                {filteredCourses.map((course, idx) => (
                    <div className="glass-card course-card-premium" key={course.id || idx}>
                        <div className="course-img-wrapper">
                            <img src={course.thumbnail || `https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=800&q=80`} alt={course.title} />
                            <div className="course-overlay">
                                <div className="instructor-badge">
                                    <User size={12} />
                                    <span>{course.instructor || 'Instructor'}</span>
                                </div>
                            </div>
                        </div>

                        <div className="course-content">
                            <div className="d-flex justify-content-between align-items-start mb-2">
                                <h5 className="course-title-premium" title={course.title}>
                                    {course.title}
                                </h5>
                                <button className="btn btn-sm btn-link text-secondary p-0">
                                    <MoreVertical size={18} />
                                </button>
                            </div>

                            <div className="progress-container-premium">
                                <div className="d-flex justify-content-between small text-secondary mb-2">
                                    <span>Progress</span>
                                    <span className="text-white fw-bold">{course.progress}%</span>
                                </div>
                                <div className="progress-bar-premium">
                                    <div
                                        className="progress-fill bg-primary shadow-sm"
                                        style={{
                                            width: `${course.progress}%`,
                                            boxShadow: '0 0 10px rgba(99, 102, 241, 0.5)'
                                        }}
                                    />
                                </div>
                            </div>

                            <div className="course-stats-premium">
                                <span className="d-flex align-items-center">
                                    <BookOpen size={14} className="me-1" />
                                    {course.completedLessons}/{course.totalLessons} Lessons
                                </span>
                                {course.progress === 100 ? (
                                    <span className="text-success fw-bold d-flex align-items-center">
                                        <CheckCircle size={14} className="me-1" />
                                        Completed
                                    </span>
                                ) : (
                                    <button
                                        className="btn-continue"
                                        onClick={() => navigate(`/student/courses`)}
                                    >
                                        <Play size={12} className="me-1" fill="currentColor" />
                                        Resume
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>
                ))}

                {filteredCourses.length === 0 && (
                    <div className="col-12 py-5 text-center">
                        <div className="glass-card p-5">
                            <BookOpen size={48} className="text-secondary opacity-25 mb-3" />
                            <h5 className="text-secondary">No courses found matching your criteria</h5>
                            <button
                                className="btn btn-link text-primary mt-2"
                                onClick={() => { setFilter('All'); setSearchQuery(''); }}
                            >
                                Clear all filters
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default StudentCourses;

