import React from "react";
import { FiX, FiCheckCircle } from "react-icons/fi";
import "../styles/courses.css";

const hasValue = (v) =>
    v !== null && v !== undefined && String(v).trim() !== "";

const CourseDetailsModal = ({ isOpen, onClose, course }) => {
    if (!isOpen || !course) return null;

    const skills = hasValue(course.toolsCovered)
        ? course.toolsCovered
            .split(",")
            .map((s) => s.trim())
            .filter(Boolean)
        : [];

    return (
        <div className="modal-overlay-fixed">
            <div className="modal-box" style={{ maxWidth: "500px" }}>
                <div className="modal-head">
                    <h2>Course Overview</h2>
                    <button className="modal-close-btn" onClick={onClose}>
                        <FiX size={24} />
                    </button>
                </div>

                <div className="modal-body">

                    {/* Image */}
                    {hasValue(course.img) && (
                        <img
                            src={course.img}
                            alt={course.name || "Course image"}
                            style={{
                                width: "100%",
                                height: "180px",
                                objectFit: "cover",
                                borderRadius: "12px",
                                marginBottom: "16px"
                            }}
                        />
                    )}

                    {/* Course Name */}
                    {hasValue(course.name) && (
                        <h3
                            style={{
                                fontSize: "20px",
                                fontWeight: "bold",
                                marginBottom: "8px",
                                color: "#0f172a"
                            }}
                        >
                            {course.name}
                        </h3>
                    )}

                    {/* Short Description */}
                    {hasValue(course.desc) && (
                        <p
                            style={{
                                color: "#64748b",
                                fontSize: "14px",
                                lineHeight: "1.6",
                                marginBottom: "16px"
                            }}
                        >
                            {course.desc}
                        </p>
                    )}

                    {/* Detailed Overview */}
                    {hasValue(course.overview) && (
                        <div className="mb-6">
                            <h4
                                style={{
                                    fontSize: "16px",
                                    fontWeight: "600",
                                    marginBottom: "8px",
                                    color: "#1e293b"
                                }}
                            >
                                Course Overview
                            </h4>
                            <p
                                style={{
                                    color: "#475569",
                                    fontSize: "14px",
                                    lineHeight: "1.6",
                                    whiteSpace: "pre-wrap"
                                }}
                            >
                                {course.overview}
                            </p>
                        </div>
                    )}

                    {/* Tools & Skills */}
                    {skills.length > 0 && (
                        <div className="mb-6">
                            <h4
                                style={{
                                    fontSize: "16px",
                                    fontWeight: "600",
                                    marginBottom: "12px",
                                    color: "#1e293b"
                                }}
                            >
                                Tools & Skills Covered
                            </h4>

                            <div
                                style={{
                                    display: "grid",
                                    gridTemplateColumns: "1fr",
                                    gap: "8px"
                                }}
                            >
                                {skills.map((skill, idx) => (
                                    <div
                                        key={idx}
                                        style={{
                                            display: "flex",
                                            alignItems: "center",
                                            gap: "8px",
                                            fontSize: "14px",
                                            color: "#475569"
                                        }}
                                    >
                                        <FiCheckCircle size={16} color="#10b981" />
                                        <span>{skill}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                </div>
            </div>
        </div>
    );
};

export default React.memo(CourseDetailsModal);
