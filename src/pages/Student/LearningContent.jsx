/* src/pages/Student/LearningContent.jsx */
import React, { useState, useEffect } from 'react';
import { useParams, useLocation } from 'react-router-dom';
import { studentService } from '../../services/studentService';
import {
    Play,
    Share2,
    ChevronRight,
    Check,
    Clock,
    Maximize,
    Volume2,
    Settings,
    MessageSquare,
    FileText,
    Download
} from 'lucide-react';
import './LearningContent.css';

const LearningContent = () => {
    const { id } = useParams();
    const location = useLocation();

    const [loading, setLoading] = useState(true);
    const [courseInfo, setCourseInfo] = useState(null);
    const [lessons, setLessons] = useState([]);
    const [activeLesson, setActiveLesson] = useState(0);
    const [activeTab, setActiveTab] = useState('Discussion');

    useEffect(() => {
        const fetchContent = async () => {
            setLoading(true);
            try {
                let courseId = id;

                // If no ID in URL, try to get first course
                if (!courseId) {
                    const courses = await studentService.getMyCourses();
                    if (courses && courses.length > 0) {
                        courseId = courses[0].courseId || courses[0].id;
                    }
                }

                if (courseId) {
                    const content = await studentService.getCourseContent(courseId);
                    if (content) {
                        setCourseInfo(content.course || content);
                        setLessons(content.lessons || content.contents || []);
                    }
                }
            } catch (error) {
                console.error("Failed to load learning content", error);
            } finally {
                setLoading(false);
            }
        };

        fetchContent();
    }, [id]);

    const courseProgress = courseInfo?.progress || 0;

    if (loading) {
        return (
            <div className="d-flex justify-content-center align-items-center" style={{ height: '70vh' }}>
                <div className="spinner-border text-primary" role="status">
                    <span className="visually-hidden">Loading...</span>
                </div>
            </div>
        );
    }

    if (!courseInfo && !loading) {
        return (
            <div className="glass-card p-5 text-center text-white">
                <FileText size={48} className="mb-3 opacity-25" />
                <h3>No Content Available</h3>
                <p className="text-secondary">We couldn't find any content for this course yet.</p>
            </div>
        );
    }

    const currentLesson = lessons[activeLesson] || { title: "Selecting Lesson...", duration: "00:00" };

    return (
        <div className="learning-content-page">
            {/* TOP HEADER */}
            <header className="content-header-dark">
                <div className="breadcrumb-dark">
                    {courseInfo?.courseName || courseInfo?.title || 'Course'} <span>/</span> {currentLesson.moduleName || 'Module 1'}
                </div>
                <div className="lesson-title-area">
                    <h2>{currentLesson.contentTitle || currentLesson.title}</h2>
                    <div className="d-flex gap-3">
                        <button className="btn btn-outline-light btn-sm d-flex align-items-center gap-2 rounded-pill px-3">
                            <Share2 size={14} /> Share
                        </button>
                        <button
                            className="btn btn-primary btn-sm d-flex align-items-center gap-2 rounded-pill px-4"
                            onClick={() => setActiveLesson(prev => Math.min(lessons.length - 1, prev + 1))}
                        >
                            Next Lesson <ChevronRight size={14} />
                        </button>
                    </div>
                </div>
            </header>

            <div className="content-main-layout">
                {/* VIDEO & DETAIL AREA */}
                <div className="video-player-section">
                    <div className="video-container-premium">
                        {currentLesson.fileUrl ? (
                            <img
                                src={currentLesson.thumbnail || "https://images.unsplash.com/photo-1633356122544-f134324a6cee?w=1200"}
                                className="video-preview-img"
                                alt="Lesson Preview"
                            />
                        ) : (
                            <div className="d-flex flex-column align-items-center justify-content-center h-100 text-secondary">
                                <Play size={64} className="mb-3 opacity-10" />
                                <span>No Video Content</span>
                            </div>
                        )}

                        <div className="custom-video-controls">
                            <div className="video-progress-bar">
                                <div className="video-progress-fill" style={{ width: '0%' }}></div>
                            </div>
                            <div className="video-control-btns">
                                <Play size={20} fill="white" />
                                <Volume2 size={20} />
                                <span className="small">00:00 / {currentLesson.duration || '00:00'}</span>
                                <div className="ms-auto d-flex gap-3">
                                    <Settings size={20} />
                                    <Maximize size={20} />
                                </div>
                            </div>
                        </div>

                        {currentLesson.fileUrl && (
                            <div className="position-absolute top-50 start-50 translate-middle">
                                <div className="bg-primary rounded-circle p-4 shadow-lg" style={{ cursor: 'pointer' }}>
                                    <Play size={40} fill="white" />
                                </div>
                            </div>
                        )}
                    </div>

                    {/* CONTENT TABS */}
                    <div className="content-tabs-area">
                        <nav className="premium-tab-nav">
                            {['Discussion', 'Resources', 'Transcript'].map(tab => (
                                <button
                                    key={tab}
                                    className={`premium-tab-btn ${activeTab === tab ? 'active' : ''}`}
                                    onClick={() => setActiveTab(tab)}
                                >
                                    {tab}
                                </button>
                            ))}
                        </nav>

                        <div className="tab-content-pane">
                            {activeTab === 'Discussion' && (
                                <div className="discussion-mock">
                                    <div className="d-flex gap-3 mb-4">
                                        <div className="rounded-circle bg-secondary d-flex align-items-center justify-content-center text-white" style={{ width: 40, height: 40, fontSize: 12 }}>
                                            Me
                                        </div>
                                        <div className="flex-grow-1">
                                            <input type="text" className="form-control bg-transparent border-secondary text-white" placeholder="Add a comment..." />
                                        </div>
                                    </div>
                                    <p className="small text-secondary">Be the first to comment on this lesson.</p>
                                </div>
                            )}
                            {activeTab === 'Resources' && (
                                <div className="resources-list">
                                    {currentLesson.resources?.length > 0 ? currentLesson.resources.map((res, i) => (
                                        <div key={i} className="d-flex align-items-center justify-content-between p-3 bg-white bg-opacity-5 rounded-3 mb-2">
                                            <div className="d-flex align-items-center gap-2">
                                                <FileText className="text-primary" size={20} />
                                                <span>{res.name || 'Resource File'}</span>
                                            </div>
                                            <Download size={18} className="text-secondary" />
                                        </div>
                                    )) : (
                                        <div className="text-center text-secondary py-4 small">No resources attached to this lesson.</div>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* LESSON SIDEBAR */}
                <aside className="course-content-sidebar">
                    <div className="sidebar-header-premium">
                        <h6 className="fw-bold mb-3">Course Content</h6>
                        <div className="progress-info">
                            <div className="d-flex justify-content-between small mb-1">
                                <span>{courseProgress}% Complete</span>
                            </div>
                            <div className="progress" style={{ height: 6, background: 'rgba(255,255,255,0.1)' }}>
                                <div className="progress-bar bg-success" style={{ width: `${courseProgress}%` }}></div>
                            </div>
                        </div>
                    </div>

                    <div className="sidebar-lessons-list">
                        <div className="lesson-group-title">Course Modules</div>
                        {lessons.length > 0 ? lessons.map((lesson, index) => (
                            <div
                                key={lesson.id || index}
                                className={`lesson-item-premium ${activeLesson === index ? 'active' : ''}`}
                                onClick={() => setActiveLesson(index)}
                            >
                                <div className="lesson-check">
                                    {lesson.isCompleted ? (
                                        <Check size={12} className="text-success" strokeWidth={4} />
                                    ) : (
                                        <span className="small" style={{ fontSize: 10 }}>{index + 1}</span>
                                    )}
                                </div>
                                <div className="lesson-info-text">
                                    <span className="lesson-name">{lesson.contentTitle || lesson.title}</span>
                                    <span className="lesson-duration">{lesson.duration || '00:00'}</span>
                                </div>
                            </div>
                        )) : (
                            <div className="p-3 text-center text-secondary small">Empty Module</div>
                        )}
                    </div>

                    <div className="sidebar-footer-notes">
                        <div className="notes-header">
                            <span className="fw-bold small">My Notes</span>
                            <span className="text-primary x-small" style={{ cursor: 'pointer', fontSize: 11 }}>Export PDF</span>
                        </div>
                        <div className="glass-card p-2 bg-white bg-opacity-5 rounded">
                            <textarea
                                className="bg-transparent border-0 text-white w-100"
                                style={{ fontSize: 11, outline: 'none', resize: 'none', minHeight: 60 }}
                                placeholder="Write your notes here..."
                            />
                        </div>
                    </div>
                </aside>
            </div>
        </div>
    );
};

export default LearningContent;
