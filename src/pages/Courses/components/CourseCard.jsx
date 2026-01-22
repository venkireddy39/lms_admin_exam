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
    FiBookmark
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
    onBookmark
}) => {
    const [imgError, setImgError] = React.useState(false);

    const DEFAULT_IMAGE =
        "https://images.unsplash.com/photo-1517694712202-14dd9538aa97";

    const displayImage =
        imgError || !course?.img?.trim()
            ? DEFAULT_IMAGE
            : course.img;

    return (
        <div className="card shadow-sm h-100">

            {/* Image */}
            <img
                src={displayImage}
                className="card-img-top"
                alt={course?.name || "Course image"}
                style={{ height: "200px", objectFit: "cover" }}
                onError={() => setImgError(true)}
            />

            {/* Bookmark Overlay */}
            <button
                className="btn btn-light rounded-circle shadow-sm"
                style={{
                    position: "absolute",
                    top: "10px",
                    right: "10px",
                    width: "32px",
                    height: "32px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    zIndex: 10,
                    border: "none"
                }}
                onClick={(e) => {
                    e.stopPropagation();
                    onBookmark?.(course.id);
                }}
                title={course.isBookmarked ? "Remove Bookmark" : "Bookmark Course"}
            >
                <FiBookmark
                    fill={course.isBookmarked ? "#f59e0b" : "none"}
                    color={course.isBookmarked ? "#f59e0b" : "#64748b"}
                />
            </button>

            <div className="card-body d-flex flex-column">

                {/* Header */}
                <div className="d-flex justify-content-between align-items-start mb-2">

                    <div className="d-flex align-items-center gap-2">
                        <h6 className="mb-0 fw-semibold">
                            {course?.name || "Untitled Course"}
                        </h6>

                        {/* Info */}
                        <FiInfo
                            className="text-secondary"
                            title="View Course Details"
                            style={{ cursor: "pointer" }}
                            onClick={() => onShowDetails?.(course)}
                        />
                    </div>

                    {/* Dropdown */}
                    <div className="dropdown">
                        <button
                            className="btn btn-sm btn-light"
                            data-bs-toggle="dropdown"
                        >
                            <FiMoreVertical />
                        </button>

                        <ul className="dropdown-menu dropdown-menu-end">
                            <li>
                                <button
                                    className="dropdown-item"
                                    onClick={() => onShare?.(course)}
                                >
                                    <FiShare2 className="me-2" /> Share
                                </button>
                            </li>
                            <li>
                                <button
                                    className="dropdown-item"
                                    onClick={() => onEdit?.(course.id)}
                                >
                                    <FiEdit2 className="me-2" /> Edit
                                </button>
                            </li>
                            <li>
                                <button
                                    className="dropdown-item text-danger"
                                    onClick={() => onDelete?.(course.id)}
                                >
                                    <FiTrash2 className="me-2" /> Delete
                                </button>
                            </li>
                        </ul>
                    </div>
                </div>

                {/* Learners count */}
                <div className="d-flex align-items-center text-muted mb-2">
                    <FiUsers className="me-1" />
                    <small>
                        {typeof course?.learnersCount === "number"
                            ? course.learnersCount
                            : 0}{" "}
                        learners
                    </small>
                </div>

                {/* Description (hidden if empty) */}
                {course?.desc && (
                    <p className="text-muted small flex-grow-1">
                        {course.desc.length > 80
                            ? course.desc.slice(0, 80) + "..."
                            : course.desc}
                    </p>
                )}

                {/* Actions */}
                <div className="d-flex gap-2 mt-3">
                    <button
                        className="btn btn-secondary btn-sm w-100"
                        onClick={() => onManageContent?.(course.id)}
                    >
                        <FiLayers className="me-1" /> Course Content
                    </button>

                    <button
                        className="btn btn-outline-secondary btn-sm w-100"
                        onClick={() => onViewLearners?.(course.id)}
                    >
                        <FiUsers className="me-1" /> Learners
                    </button>
                </div>
            </div>
        </div>
    );
};

export default React.memo(CourseCard);
