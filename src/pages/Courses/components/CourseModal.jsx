import React, { useState } from "react";
import {
    FiX, FiChevronDown, FiChevronUp, FiImage, FiUpload,
    FiBook, FiClock, FiDollarSign, FiTool, FiAlignLeft,
    FiAward, FiCalendar, FiSmartphone, FiBookmark, FiShare2, FiAlertCircle,
} from "react-icons/fi";

// ─── Toggle Switch ──────────────────────────────────────────────────────────
const Toggle = ({ checked, onChange, label, id }) => (
    <div className="d-flex justify-content-between align-items-center py-2 border-bottom">
        <label htmlFor={id} className="form-label mb-0 fw-semibold small">{label}</label>
        <div className="form-check form-switch mb-0">
            <input
                className="form-check-input"
                type="checkbox"
                role="switch"
                id={id}
                checked={checked}
                onChange={(e) => onChange(e.target.checked)}
                style={{ width: 40, height: 22, cursor: "pointer" }}
            />
        </div>
    </div>
);

// ─── Main Modal ─────────────────────────────────────────────────────────────
const CourseModal = ({ isOpen, onClose, formData, handleInputChange, handleImageChange, handleSave, isEdit }) => {
    const [showAdvanced, setShowAdvanced] = useState(false);
    const [error, setError] = useState("");
    const [saving, setSaving] = useState(false);

    React.useEffect(() => {
        if (isEdit && isOpen) {
            if (formData.showValidity || formData.allowOfflineMobile || formData.certificateProvided || formData.allowBookmark) {
                setShowAdvanced(true);
            }
        }
        if (!isOpen) { setError(""); setSaving(false); }
    }, [isOpen, isEdit]);

    if (!isOpen) return null;

    const onSave = async () => {
        if (!formData.courseName?.trim()) { setError("Course name is required."); return; }
        setError(""); setSaving(true);
        try { await handleSave(); } finally { setSaving(false); }
    };

    const handleToggle = (name, value) =>
        handleInputChange({ target: { name, value, type: "toggle" } });

    return (
        <>
            {/* Backdrop */}
            <div
                className="modal-backdrop fade show"
                style={{ zIndex: 1050 }}
                onClick={onClose}
            />

            {/* Modal */}
            <div
                className="modal fade show d-block"
                role="dialog"
                aria-modal="true"
                style={{ zIndex: 1055 }}
            >
                <div className="modal-dialog modal-lg modal-dialog-centered modal-dialog-scrollable">
                    <div className="modal-content border-0 rounded-4 shadow-lg">

                        {/* Header */}
                        <div className="modal-header border-bottom">
                            <div>
                                <h5 className="modal-title fw-bold mb-0">
                                    {isEdit ? "✏️ Edit Course" : "🚀 Create New Course"}
                                </h5>
                                <small className="text-muted">
                                    {isEdit ? "Update course details below" : "Fill in the details to publish a new course"}
                                </small>
                            </div>
                            <button type="button" className="btn-close" onClick={onClose} aria-label="Close" />
                        </div>

                        {/* Body */}
                        <div className="modal-body px-4 py-3">

                            {/* Error */}
                            {error && (
                                <div className="alert alert-danger d-flex align-items-center gap-2 py-2 small mb-3">
                                    <FiAlertCircle size={15} /> {error}
                                </div>
                            )}

                            {/* Basic Info */}
                            <p className="text-uppercase fw-bold text-muted small mb-3 d-flex align-items-center gap-1">
                                <FiBook size={12} /> Basic Information
                            </p>

                            {/* Course Name */}
                            <div className="mb-3">
                                <label className="form-label fw-semibold small">
                                    <FiBook className="me-1" />Course Name <span className="text-danger">*</span>
                                </label>
                                <input
                                    type="text"
                                    className="form-control"
                                    name="courseName"
                                    value={formData.courseName || ""}
                                    onChange={handleInputChange}
                                    placeholder="e.g. Advanced React Patterns"
                                    autoFocus
                                />
                            </div>

                            {/* Description */}
                            <div className="mb-3">
                                <label className="form-label fw-semibold small">
                                    <FiAlignLeft className="me-1" />Description
                                </label>
                                <textarea
                                    className="form-control"
                                    name="description"
                                    rows={3}
                                    value={formData.description || ""}
                                    onChange={handleInputChange}
                                    placeholder="This course covers..."
                                />
                                <div className="form-text">Briefly describe what this course is about.</div>
                            </div>

                            {/* Tools Covered */}
                            <div className="mb-3">
                                <label className="form-label fw-semibold small">
                                    <FiTool className="me-1" />Tools Covered
                                </label>
                                <input
                                    type="text"
                                    className="form-control"
                                    name="toolsCovered"
                                    value={formData.toolsCovered || ""}
                                    onChange={handleInputChange}
                                    placeholder="React, Node.js, Docker, Git"
                                />
                                <div className="form-text">Comma-separated list of tools/technologies</div>
                            </div>

                            {/* Fee + Duration */}
                            <div className="row g-3 mb-3">
                                <div className="col-6">
                                    <label className="form-label fw-semibold small">
                                        <FiDollarSign className="me-1" />Course Fee
                                    </label>
                                    <div className="d-flex gap-2 mb-2">
                                        <button
                                            type="button"
                                            className={`btn btn-sm flex-grow-1 ${(!formData.courseFee || Number(formData.courseFee) === 0) && formData.courseFee !== "" ? "btn-success" : "btn-outline-secondary"}`}
                                            onClick={() => handleInputChange({ target: { name: "courseFee", value: 0 } })}
                                        >
                                            Free
                                        </button>
                                        <button
                                            type="button"
                                            className={`btn btn-sm flex-grow-1 ${(formData.courseFee === "" || Number(formData.courseFee) > 0) ? "btn-primary" : "btn-outline-secondary"}`}
                                            onClick={() => {
                                                if (Number(formData.courseFee) === 0 && formData.courseFee !== "") {
                                                    handleInputChange({ target: { name: "courseFee", value: "" } });
                                                }
                                            }}
                                        >
                                            Paid
                                        </button>
                                    </div>
                                    {(formData.courseFee === "" || Number(formData.courseFee) > 0) && (
                                        <div className="input-group input-group-sm animate-fade-in shadow-sm">
                                            <span className="input-group-text bg-light border-end-0">₹</span>
                                            <input
                                                type="number"
                                                className="form-control border-start-0 ps-0"
                                                name="courseFee"
                                                value={formData.courseFee}
                                                onChange={handleInputChange}
                                                min="0"
                                                step="0.01"
                                                placeholder="Enter amount"
                                            />
                                        </div>
                                    )}
                                </div>
                                <div className="col-6">
                                    <label className="form-label fw-semibold small">
                                        <FiClock className="me-1" />Duration
                                    </label>
                                    <input
                                        type="text"
                                        className="form-control"
                                        name="duration"
                                        value={formData.duration || ""}
                                        onChange={handleInputChange}
                                        placeholder="e.g. 3 Months / 40 Hours"
                                    />
                                </div>
                            </div>

                            {/* Status */}
                            <div className="mb-3">
                                <label className="form-label fw-semibold small">Course Status</label>
                                <div className="d-flex gap-2">
                                    {["ACTIVE", "DISABLED"].map((s) => (
                                        <label
                                            key={s}
                                            className={`btn btn-sm ${formData.status === s
                                                ? s === "ACTIVE" ? "btn-success" : "btn-danger"
                                                : "btn-outline-secondary"}`}
                                            style={{ cursor: "pointer" }}
                                        >
                                            <input
                                                type="radio"
                                                name="status"
                                                value={s}
                                                checked={formData.status === s}
                                                onChange={handleInputChange}
                                                className="d-none"
                                            />
                                            {s === "ACTIVE" ? "✅ Active" : "⛔ Disabled"}
                                        </label>
                                    ))}
                                </div>
                            </div>

                            {/* Cover Image */}
                            <hr className="my-3" />
                            <p className="text-uppercase fw-bold text-muted small mb-3 d-flex align-items-center gap-1">
                                <FiImage size={12} /> Cover Image
                            </p>
                            <div className="mb-3">
                                <label className="form-label fw-semibold small">
                                    <FiUpload className="me-1" />Upload Course Thumbnail
                                </label>
                                {formData.imgPreview && (
                                    <img
                                        src={formData.imgPreview}
                                        alt="Preview"
                                        className="d-block mb-2 rounded-3 border"
                                        style={{ maxHeight: 160, objectFit: "cover", width: "100%" }}
                                    />
                                )}
                                <input
                                    type="file"
                                    accept="image/*"
                                    className="form-control"
                                    id="courseImageFile"
                                    onChange={handleImageChange}
                                />
                                <div className="form-text">PNG / JPG / WEBP – recommended 800×450px</div>
                            </div>

                            {/* Advanced Settings Toggle */}
                            <button
                                type="button"
                                className="btn btn-outline-secondary btn-sm w-100 d-flex align-items-center justify-content-center gap-2 mb-2"
                                onClick={() => setShowAdvanced((p) => !p)}
                            >
                                {showAdvanced ? <FiChevronUp size={15} /> : <FiChevronDown size={15} />}
                                {showAdvanced ? "Hide" : "Show"} Advanced Settings
                            </button>

                            {/* Advanced Panel */}
                            {showAdvanced && (
                                <div className="border rounded-3 p-3 bg-light">
                                    <Toggle
                                        id="certificateProvided"
                                        label={<><FiAward className="me-1 text-warning" />Certificate on Completion</>}
                                        checked={!!formData.certificateProvided}
                                        onChange={(val) => handleToggle("certificateProvided", val)}
                                    />
                                    <Toggle
                                        id="showValidity"
                                        label={<><FiCalendar className="me-1 text-primary" />Show Course Validity</>}
                                        checked={!!formData.showValidity}
                                        onChange={(val) => handleToggle("showValidity", val)}
                                    />
                                    {formData.showValidity && (
                                        <div className="input-group input-group-sm my-2">
                                            <input
                                                type="number"
                                                className="form-control"
                                                name="validityInDays"
                                                value={formData.validityInDays || ""}
                                                onChange={handleInputChange}
                                                placeholder="e.g. 365"
                                                min="1"
                                            />
                                            <span className="input-group-text">days validity</span>
                                        </div>
                                    )}
                                    <Toggle
                                        id="allowOfflineMobile"
                                        label={<><FiSmartphone className="me-1 text-purple" />Allow Offline / Mobile Access</>}
                                        checked={!!formData.allowOfflineMobile}
                                        onChange={(val) => handleToggle("allowOfflineMobile", val)}
                                    />
                                    <Toggle
                                        id="allowBookmark"
                                        label={<><FiBookmark className="me-1 text-pink" />Allow Bookmark</>}
                                        checked={!!formData.allowBookmark}
                                        onChange={(val) => handleToggle("allowBookmark", val)}
                                    />
                                    <Toggle
                                        id="shareEnabled"
                                        label={<><FiShare2 className="me-1 text-success" />Enable Course Sharing</>}
                                        checked={formData.shareEnabled !== false}
                                        onChange={(val) => handleToggle("shareEnabled", val)}
                                    />
                                    {isEdit && formData.shareCode && (
                                        <div className="d-flex align-items-center gap-2 mt-2 small text-muted">
                                            <FiShare2 size={13} /> Share Code:
                                            <span className="badge bg-secondary">{formData.shareCode}</span>
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>

                        {/* Footer */}
                        <div className="modal-footer border-top">
                            <button type="button" className="btn btn-outline-secondary" onClick={onClose}>
                                Cancel
                            </button>
                            <button type="button" className="btn btn-dark" onClick={onSave} disabled={saving}>
                                {saving ? "Saving…" : isEdit ? "💾 Update Course" : "🚀 Create Course"}
                            </button>
                        </div>

                    </div>
                </div>
            </div>
        </>
    );
};

export default React.memo(CourseModal);
