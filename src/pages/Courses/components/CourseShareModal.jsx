import React from "react";
import { FiX, FiCopy } from "react-icons/fi";
import { FaWhatsapp, FaTelegramPlane, FaEnvelope } from "react-icons/fa";
import { QRCodeCanvas } from "qrcode.react";
import { courseService } from "../services/courseService";

const CourseShareModal = ({ isOpen, onClose, course }) => {
    const [enabled, setEnabled] = React.useState(true);
    const [loading, setLoading] = React.useState(false);
    const [error, setError] = React.useState("");

    React.useEffect(() => {
        if (course) {
            setEnabled(course.shareEnabled !== false);
            setError("");
        }
    }, [course]);

    if (!isOpen || !course) return null;

    const isCourseDisabled = course.status === "DISABLED";

    const baseUrl = window.location.origin;

    const shareUrl = course.shareCode
        ? `${baseUrl}/share/${course.shareCode}`
        : `${baseUrl}/course-overview/${course.id}`;

    const handleCopy = async () => {
        try {
            await navigator.clipboard.writeText(shareUrl);
        } catch {
            console.warn("Clipboard copy failed");
        }
    };

    const handleSocialShare = (platform) => {
        if (!enabled || isCourseDisabled) return;

        const text = `Check out this course: ${course.name || "Course"}`;
        let url = "";

        if (platform === "whatsapp") {
            url = `https://wa.me/?text=${encodeURIComponent(text + " " + shareUrl)}`;
        }
        if (platform === "telegram") {
            url = `https://t.me/share/url?url=${encodeURIComponent(
                shareUrl
            )}&text=${encodeURIComponent(text)}`;
        }
        if (platform === "email") {
            url = `mailto:?subject=${encodeURIComponent(text)}&body=${encodeURIComponent(
                shareUrl
            )}`;
        }

        if (url) window.open(url, "_blank");
    };

    const handleToggle = async (e) => {
        if (isCourseDisabled) return;

        const nextState = e.target.checked;
        setLoading(true);
        setError("");

        try {
            await courseService.updateCourse(course.id, {
                shareEnabled: nextState,
            });
            setEnabled(nextState);
        } catch (err) {
            console.error("Share toggle failed", err);
            setError("Failed to update sharing status");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="modal-overlay">
            <div className="modal-content" style={{ width: 400, textAlign: "center" }}>
                <div className="modal-header">
                    <h2>Share Course</h2>
                    <button className="close-btn" onClick={onClose}>
                        <FiX size={20} />
                    </button>
                </div>

                <div
                    className="share-body"
                    style={{
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "center",
                        gap: 24,
                    }}
                >
                    {/* Status Warning */}
                    {isCourseDisabled && (
                        <p style={{ fontSize: 13, color: "#dc2626", margin: 0 }}>
                            Sharing is disabled because this course is inactive.
                        </p>
                    )}

                    {/* Toggle */}
                    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                        <span style={{ fontSize: 14, fontWeight: 500 }}>
                            Enable Sharing
                        </span>
                        <label style={{ position: "relative", width: 40, height: 24 }}>
                            <input
                                type="checkbox"
                                checked={enabled}
                                disabled={isCourseDisabled || loading}
                                onChange={handleToggle}
                                style={{ opacity: 0 }}
                            />
                            <span
                                style={{
                                    position: "absolute",
                                    inset: 0,
                                    backgroundColor: enabled ? "#2563eb" : "#cbd5f5",
                                    borderRadius: 34,
                                    cursor: "pointer",
                                }}
                            >
                                <span
                                    style={{
                                        position: "absolute",
                                        width: 16,
                                        height: 16,
                                        left: enabled ? 20 : 4,
                                        top: 4,
                                        background: "#fff",
                                        borderRadius: "50%",
                                        transition: "0.3s",
                                    }}
                                />
                            </span>
                        </label>
                    </div>

                    {enabled && !isCourseDisabled ? (
                        <>
                            <div style={{ opacity: loading ? 0.5 : 1 }}>
                                <QRCodeCanvas value={shareUrl} size={200} />
                            </div>

                            <div style={{ display: "flex", width: "100%", gap: 8 }}>
                                <input
                                    readOnly
                                    value={shareUrl}
                                    style={{
                                        flex: 1,
                                        padding: 10,
                                        borderRadius: 8,
                                        background: "#f1f5f9",
                                        border: "1px solid #cbd5e1",
                                        fontSize: 13,
                                    }}
                                />
                                <button onClick={handleCopy}>
                                    <FiCopy />
                                </button>
                            </div>

                            <div style={{ display: "flex", gap: 16 }}>
                                <button onClick={() => handleSocialShare("whatsapp")}>
                                    <FaWhatsapp />
                                </button>
                                <button onClick={() => handleSocialShare("telegram")}>
                                    <FaTelegramPlane />
                                </button>
                                <button onClick={() => handleSocialShare("email")}>
                                    <FaEnvelope />
                                </button>
                            </div>

                            <p style={{ fontSize: 13, color: "#64748b" }}>
                                Scan QR or copy link to share.
                            </p>
                        </>
                    ) : (
                        <p style={{ fontSize: 14, color: "#94a3b8" }}>
                            Sharing is currently disabled.
                        </p>
                    )}

                    {error && (
                        <p style={{ fontSize: 13, color: "#dc2626", margin: 0 }}>
                            {error}
                        </p>
                    )}
                </div>
            </div>
        </div>
    );
};

export default React.memo(CourseShareModal);
