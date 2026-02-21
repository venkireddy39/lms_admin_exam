import React from "react";
import {
    FiImage,
    FiInfo,
    FiUsers,
    FiLayers,
    FiMoreVertical,
    FiEdit2,
    FiTrash2,
    FiShare2,
    FiBookmark,
    FiPlus
} from "react-icons/fi";

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

    const DEFAULT_IMAGE =
        "https://images.unsplash.com/photo-1517694712202-14dd9538aa97";

    const imageUrl = course?.courseImageUrl || course?.imageUrl || course?.img || course?.image;

    const displayImage =
        imgError || !imageUrl?.trim()
            ? DEFAULT_IMAGE
            : imageUrl;

    return (
        <div className="course-card-item">
            {/* Image Section */}
            <div className="card-image-wrapper">
                <img
                    src={displayImage}
                    alt={course?.name || "Course image"}
                    onError={() => setImgError(true)}
                />
            </div>

            {/* Bookmark Overlay placed outside to avoid overflow:hidden clipping */}
            <div className="card-badges">
                <button
                    className="badge-pill bg-white border-0 shadow-sm"
                    onClick={(e) => {
                        e.stopPropagation();
                        onBookmark?.(course.id);
                    }}
                    style={{ padding: '8px', width: '36px', height: '36px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                    title={course.isBookmarked ? "Remove Bookmark" : "Bookmark Course"}
                >
                    <FiBookmark
                        fill={course.isBookmarked ? "#f59e0b" : "none"}
                        color={course.isBookmarked ? "#f59e0b" : "#64748b"}
                        size={18}
                    />
                </button>

                {/* Status Pill (if needed, otherwise we use the dropdown for actions) */}
                <div className="dropdown">
                    <button
                        className="badge-pill bg-white border-0 shadow-sm"
                        data-bs-toggle="dropdown"
                        style={{ padding: '8px', width: '36px', height: '36px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                    >
                        <FiMoreVertical size={18} />
                    </button>

                    <ul className="dropdown-menu dropdown-menu-end shadow border-0">
                        <li>
                            <button className="dropdown-item py-2" onClick={() => onShare?.(course)}>
                                <FiShare2 className="me-2 text-primary" /> Share
                            </button>
                        </li>
                        <li>
                            <button className="dropdown-item py-2" onClick={() => onEdit?.(course.id)}>
                                <FiEdit2 className="me-2 text-secondary" /> Edit
                            </button>
                        </li>
                        <li><hr className="dropdown-divider" /></li>
                        <li>
                            <button className="dropdown-item py-2 text-danger" onClick={() => onDelete?.(course.id)}>
                                <FiTrash2 className="me-2" /> Delete
                            </button>
                        </li>
                    </ul>
                </div>
            </div>

            <div className="card-content-body">
                {/* Header */}
                <div className="card-header-row d-flex justify-content-between align-items-start">
                    <div>
                        <h3 className="card-title-text" title={course?.name}>
                            {course?.name || "Untitled Course"}
                        </h3>
                        <span className="card-trainer-text">
                            <FiInfo
                                size={14}
                                className="me-1 text-primary"
                                style={{ cursor: 'pointer' }}
                                onClick={() => onShowDetails?.(course)}
                            />
                            View Details
                        </span>
                    </div>
                </div>

                {/* Meta / Stats */}
                <div className="d-flex align-items-center gap-3 mb-3">
                    <div className="d-flex align-items-center text-muted small" onClick={() => onViewLearners?.(course.id)} style={{ cursor: 'pointer' }}>
                        <FiUsers className="me-1 text-primary" />
                        <span className="text-primary text-decoration-underline">{course?.learnersCount || 0} Learners</span>
                    </div>
                </div>

                {/* Description */}
                <p className="card-desc-text" style={{
                    display: '-webkit-box',
                    WebkitLineClamp: 2,
                    WebkitBoxOrient: 'vertical',
                    overflow: 'hidden',
                    minHeight: '40px'
                }}>
                    {(course?.description || course?.desc) || "No description provided for this course."}
                </p>

                {/* Footer Actions */}
                <div className="card-footer-actions mt-auto">
                    <button
                        className="action-btn-card edit"
                        onClick={() => onManageContent?.(course.id)}
                    >
                        <FiLayers size={14} /> Course Builder
                    </button>
                    <button
                        className="action-btn-card"
                        onClick={() => {
                            onCreateBatch?.(course.id, course.name);
                        }}
                        style={{ background: '#eff6ff', border: '1px solid #dbeafe', color: '#2563eb' }}
                    >
                        <FiPlus size={14} /> Create Batch
                    </button>
                </div>
            </div>
        </div>
    );
};

export default React.memo(CourseCard);
