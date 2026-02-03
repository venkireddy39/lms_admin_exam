import React from 'react';
import { motion } from 'framer-motion';
import {
    Play,
    Award,
    Zap,
    Clock,
    TrendingUp,
    ChevronRight,
    FileText,
    Video,
    Upload,
    BarChart2
} from 'lucide-react';

export const StatCard = ({ label, value, icon: Icon, color, delay = 0 }) => (
    <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay }}
        className="glass-card stat-card"
    >
        <div className="stat-icon-wrapper" style={{ background: `rgba(${color}, 0.1)`, color: `rgb(${color})` }}>
            <Icon size={24} />
        </div>
        <div>
            <div className="stat-label">{label}</div>
            <div className="stat-value">{value}</div>
        </div>
    </motion.div>
);

export const QuickAction = ({ icon: Icon, label, color, onClick }) => (
    <motion.button
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        onClick={onClick}
        className="quick-action-btn"
    >
        <div className="action-icon" style={{ background: `rgba(${color}, 0.1)`, color: `rgb(${color})` }}>
            <Icon size={20} />
        </div>
        <span className="text-sm font-medium">{label}</span>
    </motion.button>
);

export const CourseCard = ({ course, onNavigate }) => (
    <div className="glass-card course-card-premium">
        <div className="d-flex justify-content-between align-items-start mb-3">
            <div className="p-2 rounded-3 bg-primary bg-opacity-10 text-primary">
                <Play size={20} />
            </div>
            <span className={`course-badge bg-${course.priority === 'High' ? 'danger' : 'success'} bg-opacity-25 text-${course.priority === 'High' ? 'danger' : 'success'}`}>
                {course.priority || 'Active'}
            </span>
        </div>

        <h5 className="fw-bold mb-1 text-white">{course.title}</h5>
        <p className="text-secondary small mb-3">{course.instructor || 'LMS Faculty'}</p>

        <div className="mt-auto">
            <div className="d-flex justify-content-between small text-secondary mb-2">
                <span>Progress</span>
                <span className="text-white">{course.progress}%</span>
            </div>
            <div className="progress-bar-premium mb-3">
                <div
                    className="progress-fill bg-primary"
                    style={{ width: `${course.progress}%` }}
                />
            </div>

            <div className="d-flex align-items-center justify-content-between pt-3 border-top border-white border-opacity-10">
                <div className="d-flex align-items-center text-secondary small">
                    <Zap size={14} className="text-warning me-1" />
                    <span className="text-truncate" style={{ maxWidth: '120px' }}>{course.nextLesson || 'Next: Introduction'}</span>
                </div>
                <button
                    onClick={() => onNavigate(course.id)}
                    className="btn btn-sm btn-link p-0 text-primary"
                >
                    <ChevronRight size={20} />
                </button>
            </div>
        </div>
    </div>
);

export const XpWidget = ({ user }) => (
    <div className="glass-card xp-widget p-4">
        <div className="d-flex justify-content-between align-items-center mb-3">
            <div className="d-flex align-items-center gap-3">
                <div className="p-2 bg-warning bg-opacity-20 rounded-3 text-warning">
                    <Award size={24} />
                </div>
                <div>
                    <h6 className="fw-bold mb-0 text-white">Level: {user?.level || '1'}</h6>
                    <span className="text-white-50 small">{user?.role || 'Learner'}</span>
                </div>
            </div>
            <div className="text-end">
                <div className="h4 fw-bold mb-0 text-white">{user?.xp || '0'}</div>
                <span className="text-uppercase small text-white-50" style={{ fontSize: '10px', letterSpacing: '1px' }}>Total XP</span>
            </div>
        </div>

        <div className="mb-4">
            <div className="d-flex justify-content-between small text-white-50 mb-1">
                <span>Next Rank</span>
                <span>{Math.round((user?.xp || 0) / (user?.nextLevelXp || 1000) * 100)}%</span>
            </div>
            <div className="progress-bar-premium" style={{ height: '6px' }}>
                <div
                    className="progress-fill bg-warning"
                    style={{ width: `${(user?.xp || 0) / (user?.nextLevelXp || 1000) * 100}%` }}
                />
            </div>
        </div>

        <div className="row g-2">
            {(user?.badges || []).slice(0, 3).map((badge, i) => (
                <div key={i} className="col-4">
                    <div className="badge-item">
                        <div className="fs-4 mb-1">{badge.icon || '⭐'}</div>
                        <div className="text-white-50" style={{ fontSize: '9px' }}>{badge.name}</div>
                    </div>
                </div>
            ))}
        </div>
    </div>
);

export const ActivityTimeline = ({ items }) => (
    <div className="mt-2">
        {items.map((item, i) => (
            <div key={i} className="timeline-item">
                <div className="timeline-dot" />
                <div className="glass-card p-3 ms-2">
                    <div className="d-flex justify-content-between align-items-start">
                        <div>
                            <span className="text-primary small font-monospace d-block mb-1">{item.time}</span>
                            <h6 className="fw-bold mb-1 text-white">{item.title}</h6>
                            <p className="text-secondary small mb-0">{item.instructor || item.type}</p>
                        </div>
                        <button className="btn btn-sm btn-link text-secondary p-0">
                            <ChevronRight size={18} />
                        </button>
                    </div>
                </div>
            </div>
        ))}
    </div>
);
