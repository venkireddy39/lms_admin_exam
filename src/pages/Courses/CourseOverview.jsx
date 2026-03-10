import React, { useEffect, useState } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import { courseService } from "./services/courseService";
import { topicService } from "./services/topicService";
import { FiClock, FiUsers, FiAward, FiCheckCircle, FiLock, FiPlayCircle, FiFileText, FiChevronDown, FiChevronUp, FiBookOpen, FiEye } from "react-icons/fi";

const CourseOverview = () => {
    const { id, shareCode } = useParams();
    const navigate = useNavigate();
    const location = useLocation();

    const [course, setCourse] = useState(null);
    const [curriculum, setCurriculum] = useState([]);
    const [loading, setLoading] = useState(true);
    const [imgError, setImgError] = useState(false);
    const [expandedTopics, setExpandedTopics] = useState({});

    const BACKEND_URL = import.meta.env.VITE_BACKEND_URL;

    const query = new URLSearchParams(location.search);
    const refCode = query.get("ref");

    useEffect(() => {
        if (refCode) {
            // Store ref code in session/cookie for 30 days
            localStorage.setItem("affiliate_ref", refCode);
            // In a real app, use a proper cookie with expiry
        }
    }, [refCode]);

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

                // Fetch Curriculum
                try {
                    const topicsData = await topicService.getTopics(data.courseId);
                    const enriched = await Promise.all((topicsData || []).map(async (t) => {
                        const contents = await topicService.getContents(t.topicId);
                        return { ...t, contents };
                    }));
                    setCurriculum(enriched);
                    
                    // Expand first topic by default
                    if (enriched.length > 0) {
                        setExpandedTopics({ [enriched[0].topicId]: true });
                    }
                } catch (e) {
                    console.warn("Curriculum fetch failed", e);
                }

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
                                const storedRef = localStorage.getItem("affiliate_ref") || refCode;
                                if (storedRef) {
                                    // If affiliate lead, go to specialized apply page
                                    navigate(`/apply?ref=${storedRef}&courseId=${id}`);
                                } else if (localStorage.getItem("token")) {
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
                                fontWeight: "700",
                                fontSize: "16px"
                            }}
                        >
                            {isDisabled ? "Course Disabled" : (localStorage.getItem("affiliate_ref") || refCode ? "Enroll Now" : (localStorage.getItem("token") ? "Access Course" : "Login to Enroll"))}
                        </button>
                    </div>
                </div>
            </section>

            {/* What you'll learn */}
            {course.topics.length > 0 && (
                <section style={{ maxWidth: 1100, margin: "60px auto", padding: "0 40px" }}>
                    <h2 style={{ marginBottom: 24, fontWeight: "700" }}>What you'll learn</h2>
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
                        {course.topics.map((t, i) => (
                            <div key={i} style={{ display: "flex", gap: 12, alignItems: "center", background: "#fff", padding: "16px", borderRadius: "12px", border: "1px solid #e2e8f0" }}>
                                <FiCheckCircle color="#10b981" size={20} />
                                <span style={{ color: "#334155", fontWeight: "500" }}>{t}</span>
                            </div>
                        ))}
                    </div>
                </section>
            )}

            {/* Curriculum */}
            {curriculum.length > 0 && (
                <section style={{ maxWidth: 1100, margin: "60px auto", padding: "0 40px" }}>
                    <h2 style={{ marginBottom: 24, fontWeight: "700" }}>Course Content</h2>
                    <div style={{ background: "#fff", borderRadius: "16px", border: "1px solid #e2e8f0", overflow: "hidden", boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)" }}>
                        {curriculum.map((topic, idx) => {
                            const isExpanded = expandedTopics[topic.topicId];
                            return (
                                <div key={topic.topicId} style={{ borderBottom: idx === curriculum.length - 1 ? "none" : "1px solid #e2e8f0" }}>
                                    <div 
                                        onClick={() => setExpandedTopics(prev => ({ ...prev, [topic.topicId]: !prev[topic.topicId] }))}
                                        style={{ padding: "20px 24px", display: "flex", justifyContent: "space-between", alignItems: "center", cursor: "pointer", background: isExpanded ? "#f1f5f9" : "#fff", transition: "all 0.2s" }}
                                    >
                                        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                                            <FiBookOpen className={isExpanded ? "text-primary" : "text-secondary"} />
                                            <span style={{ fontWeight: "600", color: "#1e293b" }}>{topic.topicName}</span>
                                        </div>
                                        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                                            <small className="text-muted">{topic.contents?.length || 0} items</small>
                                            {isExpanded ? <FiChevronUp /> : <FiChevronDown />}
                                        </div>
                                    </div>
                                    
                                    {isExpanded && (
                                        <div style={{ padding: "8px 0", background: "#fff" }}>
                                            {topic.contents?.map((content) => {
                                                const isVideo = (content.contentType || '').toUpperCase() === 'VIDEO';
                                                const isPdf = (content.contentType || '').toUpperCase() === 'PDF';
                                                const canPreview = content.isPreview;

                                                const handleItemClick = () => {
                                                    if (!canPreview) return;
                                                    const raw = content.fileUrl || content.url;
                                                    if (!raw) return;
                                                    
                                                    let final = raw;
                                                    if (!raw.startsWith('http')) {
                                                        const apiBase = import.meta.env.MODE === 'development' ? '' : (import.meta.env.VITE_APP_API_URL || '');
                                                        const cleanBase = apiBase.endsWith('/') ? apiBase.slice(0, -1) : apiBase;
                                                        const cleanPath = raw.startsWith('/') ? raw : `/${raw}`;
                                                        final = `${cleanBase}${cleanPath}`;
                                                    }
                                                    window.open(final, '_blank');
                                                };

                                                return (
                                                    <div 
                                                        key={content.contentId} 
                                                        onClick={handleItemClick}
                                                        style={{ 
                                                            display: "flex", 
                                                            justifyContent: "space-between", 
                                                            alignItems: "center", 
                                                            padding: "12px 24px 12px 52px",
                                                            cursor: canPreview ? "pointer" : "default",
                                                            transition: "all 0.2s",
                                                            borderLeft: "4px solid transparent"
                                                        }}
                                                        onMouseEnter={(e) => { if (canPreview) e.currentTarget.style.background = "#f8fafc"; }}
                                                        onMouseLeave={(e) => { e.currentTarget.style.background = "transparent"; }}
                                                    >
                                                        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                                                            {isVideo ? <FiPlayCircle className="text-primary" /> : isPdf ? <FiFileText className="text-danger" /> : <FiLock className="text-muted" />}
                                                            <span style={{ color: canPreview ? "#334155" : "#64748b", fontWeight: "500", fontSize: "14px" }}>
                                                                {content.contentTitle}
                                                            </span>
                                                        </div>
                                                        <div style={{ display: "flex", gap: 8 }}>
                                                            {canPreview ? (
                                                                <span style={{ fontSize: '10px', background: "#dcfce7", color: "#166534", padding: "2px 8px", borderRadius: "10px", fontWeight: "600" }}>FREE PREVIEW</span>
                                                            ) : (
                                                                <FiLock size={14} className="text-muted" />
                                                            )}
                                                        </div>
                                                    </div>
                                                );
                                            })}
                                            {(!topic.contents || topic.contents.length === 0) && (
                                                <div style={{ padding: "12px 52px", color: "#94a3b8", fontSize: "14px", fontStyle: "italic" }}>No content added yet.</div>
                                            )}
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                </section>
            )}
        </div>
    );
};

export default CourseOverview;
