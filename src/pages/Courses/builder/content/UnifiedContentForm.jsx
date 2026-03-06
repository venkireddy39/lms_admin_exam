import React, { useState, useEffect } from 'react';

const UnifiedContentForm = ({ onSave, onCancel, initialData }) => {
    const [contentType, setContentType] = useState(initialData?.type || 'video');
    const [method, setMethod] = useState(initialData?.method || (initialData?.url ? 'url' : 'upload'));

    const [formData, setFormData] = useState({
        title: initialData?.title ?? '',
        description: initialData?.description ?? '',
        url: initialData?.url ?? '',
        file: initialData?.file ?? null
    });

    const handleSubmit = (e) => {
        e.preventDefault();
        const finalData = {
            title: formData.title,
            description: formData.description,
            type: contentType,
        };

        if (contentType === 'heading') {
            finalData.method = 'text';
        } else {
            finalData.method = method;
            if (method === 'upload') {
                finalData.file = formData.file;
                finalData.fileName = formData.file ? formData.file.name : (initialData?.fileName || null);
                finalData.url = "";
            } else {
                finalData.url = formData.url;
                finalData.file = null;
            }
        }

        onSave(finalData);
    };

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setFormData(prev => ({
                ...prev,
                file,
                title: prev.title || file.name.replace(/\.[^/.]+$/, "")
            }));
        }
    };

    return (
        <form onSubmit={handleSubmit} className="row g-3">
            {/* Type Selection */}
            <div className="col-12">
                <label className="form-label fw-bold small text-muted text-uppercase mb-2">Content Type</label>
                <div className="d-flex flex-wrap gap-2">
                    {[
                        { id: 'video', label: 'Video', icon: 'bi-camera-video' },
                        { id: 'pdf', label: 'PDF', icon: 'bi-file-earmark-pdf' },
                        { id: 'quiz', label: 'Quiz', icon: 'bi-question-circle' },
                        { id: 'assignment', label: 'Assignment', icon: 'bi-pencil-square' },
                        { id: 'heading', label: 'Heading', icon: 'bi-layout-text-sidebar' }
                    ].map(type => (
                        <button
                            key={type.id}
                            type="button"
                            className={`btn flex-fill py-2 px-3 border d-flex align-items-center justify-content-center gap-2 rounded-3 transition-all ${contentType === type.id ? 'btn-primary border-primary shadow-sm' : 'btn-light border-light-subtle text-muted'}`}
                            onClick={() => setContentType(type.id)}
                        >
                            <i className={`bi ${type.icon}`}></i>
                            <span className="fw-medium">{type.label}</span>
                        </button>
                    ))}
                </div>
            </div>

            {/* Basic Info */}
            <div className="col-12 mt-4">
                <label className="form-label fw-bold">Title <span className="text-danger">*</span></label>
                <input
                    type="text"
                    className="form-control form-control-lg rounded-3 border-light-subtle"
                    required
                    value={formData.title}
                    onChange={e => setFormData({ ...formData, title: e.target.value })}
                    placeholder={contentType === 'heading' ? "Section Title (e.g. Introduction)" : "Lesson Title"}
                />
            </div>

            <div className="col-12">
                <label className="form-label fw-bold">Description</label>
                <textarea
                    className="form-control rounded-3 border-light-subtle"
                    rows="3"
                    value={formData.description}
                    onChange={e => setFormData({ ...formData, description: e.target.value })}
                    placeholder="Briefly describe what students will learn..."
                />
            </div>

            {/* Source Selection (Not for Heading) */}
            {contentType !== 'heading' && (
                <div className="col-12 mt-4">
                    <div className="p-3 bg-light rounded-4 border border-light-subtle">
                        <label className="form-label fw-bold small text-muted text-uppercase mb-3">Material Source</label>

                        <div className="btn-group w-100 mb-4 bg-white rounded-3 p-1 shadow-sm" role="group">
                            <input
                                type="radio"
                                className="btn-check"
                                name="method"
                                id="method-upload"
                                checked={method === 'upload'}
                                onChange={() => setMethod('upload')}
                            />
                            <label className="btn btn-outline-primary border-0 rounded-3 py-2" htmlFor="method-upload">
                                <i className="bi bi-cloud-upload me-2"></i> Upload File
                            </label>

                            <input
                                type="radio"
                                className="btn-check"
                                name="method"
                                id="method-url"
                                checked={method === 'url'}
                                onChange={() => setMethod('url')}
                            />
                            <label className="btn btn-outline-primary border-0 rounded-3 py-2" htmlFor="method-url">
                                <i className="bi bi-link-45deg me-2"></i> External URL
                            </label>
                        </div>

                        {method === 'url' ? (
                            <div className="animate-fade-in">
                                <input
                                    type="url"
                                    className="form-control rounded-3"
                                    required={method === 'url'}
                                    value={formData.url}
                                    onChange={e => setFormData({ ...formData, url: e.target.value })}
                                    placeholder="https://example.com/..."
                                />
                                <div className="form-text ms-1 mt-2 small opacity-75">Paste the link to your video (YouTube/Vimeo) or PDF document.</div>
                            </div>
                        ) : (
                            <div className="file-upload-wrapper animate-fade-in">
                                <div className="border border-2 border-dashed rounded-4 p-4 text-center bg-white cursor-pointer hover-bg-light transition-all"
                                    onClick={() => document.getElementById('file-upload-input').click()}>
                                    <input
                                        type="file"
                                        id="file-upload-input"
                                        className="d-none"
                                        accept={contentType === 'video' ? 'video/*' : contentType === 'pdf' ? 'application/pdf' : '*/*'}
                                        onChange={handleFileChange}
                                    />
                                    <i className="bi bi-file-earmark-arrow-up display-6 text-primary mb-2 d-block"></i>
                                    <h6 className="mb-1 text-dark fw-bold">
                                        {formData.file ? formData.file.name : (initialData?.fileName ? initialData.fileName : 'Choose file or drag here')}
                                    </h6>
                                    <p className="text-muted small mb-0">Max size 50MB (Recommended)</p>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* Actions */}
            <div className="col-12 mt-4 d-flex justify-content-end gap-2 pt-3 border-top">
                <button type="button" className="btn btn-light rounded-pill px-4 fw-medium" onClick={onCancel}>Cancel</button>
                <button
                    type="submit"
                    className="btn btn-primary rounded-pill px-5 fw-bold shadow-sm"
                    disabled={
                        contentType !== 'heading' && (
                            (method === 'upload' && !formData.file && !initialData?.fileName) ||
                            (method === 'url' && !formData.url)
                        )
                    }
                >
                    {initialData ? 'Update Content' : 'Save Content'}
                </button>
            </div>
        </form>
    );
};

export default UnifiedContentForm;
