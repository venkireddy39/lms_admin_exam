import React from "react";
import {
    FiImage, FiInfo, FiUsers, FiLayers, FiMoreVertical,
    FiEdit2, FiTrash2, FiShare2, FiBookmark, FiPlus,
    FiClock
} from "react-icons/fi";

const PALETTE = [
    'primary', 'info', 'success', 'warning', 'danger', 'secondary'
];

const CourseCard = ({
    course = {},
    index,
    onEdit,
    onDelete,
    onManageContent,
    onViewLearners,
    onShowDetails,
    onShare,
    onBookmark,
    onCreateBatch
}) => {
    const [imgError, setImgError] = React.useState(false);
    const [menuOpen, setMenuOpen] = React.useState(false);

    const DEFAULT_IMAGE = "https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=600&q=80";
    const imageUrl = course?.courseImageUrl || course?.imageUrl || course?.img || course?.image;
    const displayImage = imgError || !imageUrl?.trim() ? DEFAULT_IMAGE : imageUrl;

    const accentColor = PALETTE[(Number(index) || 0) % PALETTE.length];
    const statusActive = course?.status === 'ACTIVE' || course?.active !== false;

    return (
        <div className="card h-100 shadow-sm border-0 course-card">
            {/* Image */}
            <div
                className="position-relative overflow-hidden"
                style={{ height: 190, cursor: "pointer" }}
                onClick={() => onCreateBatch?.(course.courseId || course.id, course.courseName || course.name)}
                title="Click to Create Batch"
            >
                <img
                    src={displayImage}
                    alt={course?.courseName || course?.name || "Course"}
                    onError={() => setImgError(true)}
                    className="w-100 h-100 course-card-img"
                    style={{ objectFit: "cover" }}
                />

                {/* Gradient overlay */}
                <div
                    className="position-absolute bottom-0 start-0 end-0"
                    style={{ height: "60%", background: "linear-gradient(to top, rgba(0,0,0,0.55), transparent)", pointerEvents: "none" }}
                />

                {/* Status badge */}
                <span className={`badge position-absolute bottom-0 start-0 m-2 bg-${statusActive ? 'success' : 'secondary'}`}>
                    {statusActive ? 'Active' : 'Inactive'}
                </span>

                {/* Hover overlay */}
                <div className="course-hover-overlay position-absolute top-0 start-0 w-100 h-100 d-flex align-items-center justify-content-center">
                    <div className="text-white text-center fw-bold">
                        <FiPlus size={22} />
                        <div className="small mt-1">Create Batch</div>
                    </div>
                </div>
            </div>

            {/* Accent bar */}
            <div className={`bg-${accentColor}`} style={{ height: 3 }} />

            {/* Top-right action buttons (absolutely positioned over card) */}
            <div className="position-absolute top-0 end-0 d-flex gap-1 p-2" style={{ zIndex: 10 }}>
                <button
                    className="btn btn-sm btn-light p-1 lh-1 rounded-2 shadow-sm"
                    onClick={e => { e.stopPropagation(); onBookmark?.(course.courseId || course.id); }}
                    title={course.isBookmarked ? "Remove Bookmark" : "Bookmark"}
                >
                    <FiBookmark
                        size={14}
                        fill={course.isBookmarked ? "#f59e0b" : "none"}
                        color={course.isBookmarked ? "#f59e0b" : "#6c757d"}
                    />
                </button>

                {/* Dropdown menu */}
                <div className="dropdown">
                    <button
                        className="btn btn-sm btn-light p-1 lh-1 rounded-2 shadow-sm"
                        onClick={e => { e.stopPropagation(); setMenuOpen(v => !v); }}
                    >
                        <FiMoreVertical size={14} />
                    </button>
                    {menuOpen && (
                        <ul className="dropdown-menu dropdown-menu-end show shadow border-0 rounded-3" style={{ minWidth: 160 }}>
                            <li>
                                <button className="dropdown-item d-flex align-items-center gap-2 small" onClick={() => { onShowDetails?.(course); setMenuOpen(false); }}>
                                    <FiInfo size={13} className="text-primary" /> View Details
                                </button>
                            </li>
                            <li>
                                <button className="dropdown-item d-flex align-items-center gap-2 small" onClick={() => { onShare?.(course); setMenuOpen(false); }}>
                                    <FiShare2 size={13} className="text-info" /> Share
                                </button>
                            </li>
                            <li>
                                <button className="dropdown-item d-flex align-items-center gap-2 small" onClick={() => { onEdit?.(course.courseId || course.id); setMenuOpen(false); }}>
                                    <FiEdit2 size={13} className="text-secondary" /> Edit
                                </button>
                            </li>
                            <li><hr className="dropdown-divider" /></li>
                            <li>
                                <button className="dropdown-item d-flex align-items-center gap-2 small text-danger" onClick={() => { onDelete?.(course.courseId || course.id); setMenuOpen(false); }}>
                                    <FiTrash2 size={13} /> Delete
                                </button>
                            </li>
                        </ul>
                    )}
                </div>
            </div>

            {/* Card body */}
            <div className="card-body d-flex flex-column pt-2 pb-2">
                <div className="d-flex justify-content-between align-items-start mb-1">
                    <h6 className="card-title fw-bold mb-0 text-truncate flex-grow-1 me-2" style={{ fontSize: 15 }}>
                        {course?.courseName || course?.name || "Untitled Course"}
                    </h6>
                    <button
                        className="btn btn-sm py-0 px-2 rounded-pill"
                        style={{ background: "#eef2ff", color: "#4f46e5", fontSize: 11, fontWeight: 700, whiteSpace: "nowrap" }}
                        onClick={() => onViewLearners?.(course.courseId || course.id)}
                        title="View Learners"
                    >
                        <FiUsers size={11} className="me-1" />
                        {course?.learnersCount || 0} Learners
                    </button>
                </div>

                {/* Meta chips */}
                <div className="d-flex gap-1 flex-wrap mb-2">
                    {course?.duration && (
                        <span className="badge bg-light text-secondary border d-flex align-items-center gap-1">
                            <FiClock size={10} /> {course.duration}
                        </span>
                    )}
                    {course?.courseFee && (
                        <span className="badge bg-success-subtle text-success border border-success-subtle">
                            ₹{Number(course.courseFee).toLocaleString()}
                        </span>
                    )}
                </div>

                <p className="card-text text-muted small flex-grow-1 mb-0 course-desc">
                    {course?.description || course?.desc || "No description provided."}
                </p>
            </div>

            {/* Card footer */}
            <div className="card-footer bg-white border-top d-flex gap-2 pt-2 pb-3">
                <button
                    className="btn btn-outline-secondary btn-sm flex-fill d-flex align-items-center justify-content-center gap-1"
                    onClick={() => onManageContent?.(course.courseId || course.id)}
                >
                    <FiLayers size={13} /> Course Builder
                </button>
                <button
                    className="btn btn-primary btn-sm flex-fill d-flex align-items-center justify-content-center gap-1"
                    onClick={() => onCreateBatch?.(course.courseId || course.id, course.courseName || course.name)}
                >
                    <FiPlus size={13} /> Create Batch
                </button>
            </div>
        </div>
    );
};

export default React.memo(CourseCard);
