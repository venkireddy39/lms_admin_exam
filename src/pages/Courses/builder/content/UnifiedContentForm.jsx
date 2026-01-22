
import React, { useState, useEffect } from 'react';
import { FiUploadCloud, FiLink, FiVideo, FiFileText, FiType, FiX } from 'react-icons/fi';

const UnifiedContentForm = ({ onSave, onCancel, initialData }) => {
    // Determine initial type (default to 'video')
    const [contentType, setContentType] = useState(initialData?.type || 'video');

    // Determine initial method (upload vs url)
    // If it's text/heading, method doesn't apply but we can ignore it.
    // If initialData has a url string but no file, default to 'url'.
    const [method, setMethod] = useState(initialData?.method || (initialData?.url ? 'url' : 'upload'));

    const [formData, setFormData] = useState({
        title: initialData?.title ?? '',
        description: initialData?.description ?? '',
        url: initialData?.url ?? '',
        file: initialData?.file ?? null
    });

    // Reset fields when content type changes (optional, but cleaner)
    useEffect(() => {
        if (!initialData) {
            // If adding new, maybe clear specific fields?
            // Actually keeping title/desc might be nice if user switches type.
            // But we should clear file/url if switching between PDF and Video to avoid confusion.
            // setFormData(prev => ({ ...prev, file: null, url: '' }));
        }
    }, [contentType]);

    const handleSubmit = (e) => {
        e.preventDefault();

        // Prepare final data based on type
        const finalData = {
            title: formData.title,
            description: formData.description,
            type: contentType, // 'video', 'pdf', 'heading' (mapped to TEXT in service)
            // Logic for file/url
        };

        if (contentType === 'heading') {
            // Headings don't use file/url but we adhere to our "Hack" where title = fileUrl
            // Service handles that mapping. We just pass title.
            finalData.method = 'text';
        } else {
            finalData.method = method;
            if (method === 'upload') {
                finalData.file = formData.file;
                finalData.fileName = formData.file ? formData.file.name : null;
                finalData.url = ""; // Clear URL if uploading
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
                // Auto-fill title if empty
                title: prev.title || file.name.replace(/\.[^/.]+$/, "")
            }));
        }
    };

    return (
        <form className="builder-form bg-white p-4 rounded shadow-sm" onSubmit={handleSubmit}>
            <div className="d-flex justify-content-between align-items-center mb-4 border-bottom pb-3">
                <h4 className="mb-0 fw-bold">{initialData ? 'Edit Content' : 'Add Content'}</h4>
                <button type="button" className="btn btn-sm btn-light rounded-circle" onClick={onCancel}>
                    <FiX />
                </button>
            </div>

            {/* 1. CONTENT TYPE SELECTOR (New "One Form" Requirement) */}
            <div className="form-group mb-4">
                <label className="form-label fw-bold small text-muted text-uppercase ls-1">Content Type</label>
                <div className="d-flex gap-2">
                    <button
                        type="button"
                        className={`btn flex-fill d-flex align-items-center justify-content-center p-3 border ${contentType === 'video' ? 'btn-primary bg-opacity-10 text-primary border-primary' : 'btn-light text-muted'}`}
                        onClick={() => setContentType('video')}
                    >
                        <FiVideo className="me-2" size={18} /> Video
                    </button>
                    <button
                        type="button"
                        className={`btn flex-fill d-flex align-items-center justify-content-center p-3 border ${contentType === 'pdf' ? 'btn-danger bg-opacity-10 text-danger border-danger' : 'btn-light text-muted'}`}
                        onClick={() => setContentType('pdf')}
                    >
                        <FiFileText className="me-2" size={18} /> PDF
                    </button>
                    <button
                        type="button"
                        className={`btn flex-fill d-flex align-items-center justify-content-center p-3 border ${contentType === 'heading' ? 'btn-dark bg-opacity-10 text-dark border-dark' : 'btn-light text-muted'}`}
                        onClick={() => setContentType('heading')}
                    >
                        <FiType className="me-2" size={18} /> Heading
                    </button>
                </div>
            </div>

            {/* 2. TITLE */}
            <div className="form-group mb-3">
                <label className="form-label fw-bold">Title <span className="text-danger">*</span></label>
                <input
                    type="text"
                    className="form-control"
                    required
                    value={formData.title || ''}
                    onChange={e => setFormData({ ...formData, title: e.target.value })}
                    placeholder={contentType === 'heading' ? "e.g. Section 1: Introduction" : "e.g. Lesson Title"}
                />
            </div>

            {/* 3. DESCRIPTION */}
            <div className="form-group mb-4">
                <label className="form-label fw-bold">Description</label>
                <textarea
                    className="form-control"
                    value={formData.description || ''}
                    onChange={e => setFormData({ ...formData, description: e.target.value })}
                    placeholder="Brief description..."
                    rows="2"
                />
            </div>

            {/* 4. SOURCE (Only for Video/PDF) */}
            {contentType !== 'heading' && (
                <div className="bg-light p-3 rounded mb-4 border">
                    <label className="form-label fw-bold small text-muted text-uppercase mb-3">Source</label>

                    {/* Source Toggle */}
                    <div className="btn-group w-100 mb-3" role="group">
                        <input
                            type="radio"
                            className="btn-check"
                            name="method"
                            id="u-method-upload"
                            checked={method === 'upload'}
                            onChange={() => setMethod('upload')}
                        />
                        <label className="btn btn-outline-secondary bg-white" htmlFor="u-method-upload">
                            <FiUploadCloud className="me-2" /> Upload File
                        </label>

                        <input
                            type="radio"
                            className="btn-check"
                            name="method"
                            id="u-method-url"
                            checked={method === 'url'}
                            onChange={() => setMethod('url')}
                        />
                        <label className="btn btn-outline-secondary bg-white" htmlFor="u-method-url">
                            <FiLink className="me-2" /> External URL
                        </label>
                    </div>

                    {/* Input Area */}
                    <div>
                        {method === 'url' ? (
                            <div>
                                <input
                                    type="url"
                                    className="form-control"
                                    required={method === 'url'}
                                    value={formData.url || ''}
                                    onChange={e => setFormData({ ...formData, url: e.target.value })}
                                    placeholder={contentType === 'video' ? "https://youtube.com/..." : "https://example.com/doc.pdf"}
                                />
                                <div className="form-text">Paste the full URL to the content.</div>
                            </div>
                        ) : (
                            <div className="file-upload-box border rounded bg-white p-4 text-center dashed-border">
                                <input
                                    type="file"
                                    id="unified-upload"
                                    accept={contentType === 'video' ? 'video/*' : 'application/pdf'}
                                    className="d-none"
                                    onChange={handleFileChange}
                                />
                                <label htmlFor="unified-upload" className="cursor-pointer text-primary w-100 h-100 d-block">
                                    <FiUploadCloud size={32} className="mb-2 d-block mx-auto text-secondary" />
                                    <span className="fw-bold d-block text-dark">{formData.file ? formData.file.name : `Click to Select ${contentType === 'video' ? 'Video' : 'PDF'}`}</span>
                                    <span className="small text-muted d-block mt-1">or drag and drop here</span>
                                </label>
                            </div>
                        )}
                    </div>
                </div>
            )}

            <div className="d-flex justify-content-end gap-2 pt-2 border-top">
                <button type="button" className="btn btn-light" onClick={onCancel}>Cancel</button>
                <button
                    type="submit"
                    className="btn btn-primary px-4"
                    disabled={
                        contentType !== 'heading' && (
                            (method === 'upload' && !formData.file && !initialData?.fileName) ||
                            (method === 'url' && !formData.url)
                        )
                    }
                >
                    {initialData ? 'Update Content' : 'Add Content'}
                </button>
            </div>
        </form>
    );
};

export default UnifiedContentForm;
