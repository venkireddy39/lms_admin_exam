import React, { useEffect, useState } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import {
    FiClock,
    FiUsers,
    FiAward,
    FiCheckCircle,
    FiLock,
} from "react-icons/fi";
import { courseService } from "./services/courseService";

const CourseOverview = () => {
    const { id, shareCode } = useParams();
    const navigate = useNavigate();
    const location = useLocation();

    const [course, setCourse] = useState(null);
    const [loading, setLoading] = useState(true);
    const [imgError, setImgError] = useState(false);

    const BACKEND_URL = import.meta.env.VITE_BACKEND_URL;

    const getFullImageUrl = (url) => {
        if (!url) return null;
        if (url.startsWith("http") || url.startsWith("blob:")) return url;
        return `${BACKEND_URL}${url.startsWith("/") ? "" : "/"}${url}`;
    };

    useEffect(() => {
        const load = async () => {
            try {
                const data = shareCode
                    ? await courseService.getCourseByShareCode(shareCode)
                    : await courseService.getCourseById(id);

                setCourse({
                    id: data.courseId,
                    name: data.courseName,
                    desc: data.description || "",
                    duration: data.duration || "",
                    price: data.courseFee ? `₹${data.courseFee}` : "Free",
                    img: getFullImageUrl(data.courseImageUrl),
                    topics: data.toolsCovered
                        ? data.toolsCovered.split(",").map((t) => t.trim()).filter(Boolean)
                        : [],
                    status: data.status || "ACTIVE",
                    certificateEnabled: !!data.certificateProvided,
                });
            } catch (err) {
                console.error("Failed to load course", err);
            } finally {
                setLoading(false);
            }
        };

        load();
    }, [id, shareCode]);

    if (loading) {
        return <div style={{ padding: 60 }}>Loading course…</div>;
    }

    if (!course) {
        return <div style={{ padding: 60 }}>Course not found</div>;
    }

    const isDisabled = course.status === "DISABLED";

    return (
        <div style={{ background: "#f8fafc", minHeight: "100vh" }}>
            {/* Header */}
            <header
                style={{
                    padding: "20px 40px",
                    background: "#fff",
                    borderBottom: "1px solid #e2e8f0",
                    display: "flex",
                    justifyContent: "space-between",
                }}
            >
                <strong>LMS Platform</strong>
                <div>
                    {localStorage.getItem("token") ? (
                        <button
                            onClick={() => navigate("/admin/dashboard")}
                            style={{ padding: "8px 16px", background: "#f1f5f9", border: "none", borderRadius: "8px", cursor: "pointer", fontWeight: "600" }}
                        >
                            Go to Dashboard
                        </button>
                    ) : (
                        <button
                            onClick={() => navigate("/login", { state: { from: location.pathname } })}
                            style={{ padding: "8px 16px", background: "#2563eb", color: "#fff", border: "none", borderRadius: "8px", cursor: "pointer", fontWeight: "600" }}
                        >
                            Login
                        </button>
                    )}
                </div>
            </header>

            {/* Hero */}
            <section style={{ background: "#0f172a", color: "#fff", padding: 60 }}>
                <div style={{ maxWidth: 1100, margin: "0 auto", display: "grid", gridTemplateColumns: "1.5fr 1fr", gap: 40 }}>
                    <div>
                        <h1 style={{ fontSize: 42 }}>{course.name}</h1>

                        {course.desc && (
                            <p style={{ color: "#94a3b8", marginTop: 16 }}>
                                {course.desc}
                            </p>
                        )}

                        <div style={{ display: "flex", gap: 24, marginTop: 24 }}>
                            {course.duration && (
                                <span><FiClock /> {course.duration}</span>
                            )}
                            {course.certificateEnabled && (
                                <span><FiAward /> Certificate</span>
                            )}
                        </div>

                        {isDisabled && (
                            <p style={{ color: "#f87171", marginTop: 16 }}>
                                This course is currently unavailable.
                            </p>
                        )}
                    </div>

                    {/* Card */}
                    <div style={{ background: "#fff", borderRadius: 16, padding: 24 }}>
                        <img
                            src={
                                imgError || !course.img
                                    ? "https://images.unsplash.com/photo-1633356122544-f134324a6cee"
                                    : course.img
                            }
                            onError={() => setImgError(true)}
                            alt={course.name}
                            style={{ width: "100%", height: 220, objectFit: "cover", borderRadius: 12 }}
                        />

                        <h2 style={{ marginTop: 16 }}>{course.price}</h2>

                        <button
                            disabled={isDisabled}
                            onClick={() => {
                                if (localStorage.getItem("token")) {
                                    // If already logged in, go to course viewer or dashboard
                                    navigate(`/admin/courses`);
                                } else {
                                    navigate("/login", { state: { from: location.pathname } });
                                }
                            }}
                            style={{
                                width: "100%",
                                marginTop: 16,
                                padding: 14,
                                background: isDisabled ? "#94a3b8" : "#2563eb",
                                color: "#fff",
                                border: "none",
                                borderRadius: 10,
                                cursor: isDisabled ? "not-allowed" : "pointer",
                            }}
                        >
                            {isDisabled ? "Course Disabled" : (localStorage.getItem("token") ? "Access Course" : "Login to Enroll")}
                        </button>
                    </div>
                </div>
            </section>

            {/* What you'll learn */}
            {course.topics.length > 0 && (
                <section style={{ maxWidth: 1100, margin: "60px auto", padding: "0 40px" }}>
                    <h2>What you'll learn</h2>
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginTop: 24 }}>
                        {course.topics.map((t, i) => (
                            <div key={i} style={{ display: "flex", gap: 8 }}>
                                <FiCheckCircle color="#10b981" />
                                <span>{t}</span>
                            </div>
                        ))}
                    </div>
                </section>
            )}
        </div>
    );
};

export default CourseOverview;
