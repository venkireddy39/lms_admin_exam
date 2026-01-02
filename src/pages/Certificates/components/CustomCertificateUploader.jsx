import React, { useState } from 'react';
import { FaUpload, FaPlus, FaCode, FaArrowLeft, FaSave } from 'react-icons/fa';
import CertificateRenderer from './CertificateRenderer';

const Certificate = () => {
    const [view, setView] = useState('list'); // 'list' or 'upload'
    const [templates, setTemplates] = useState([
        { id: 1, name: 'Standard Certificate', layout: 'classic', customHtml: null }
    ]);

    // State for the new upload
    const [newCode, setNewCode] = useState('');
    const [newName, setNewName] = useState('My Custom Certificate');

    // Handle File Upload
    const handleFileUpload = (e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (ev) => setNewCode(ev.target.result);
            reader.readAsText(file);
        }
    };

    // Save Logic
    const handleSave = () => {
        const newTemplate = {
            id: Date.now(),
            name: newName,
            layout: 'custom-html',
            customHtml: newCode,
            orientation: 'landscape' // Default
        };
        setTemplates([...templates, newTemplate]);
        setView('list');
        setNewCode('');
    };

    return (
        <div className="container-fluid bg-light min-vh-100 p-0">
            {/* --- NAVBAR --- */}
            <nav className="navbar navbar-expand-lg navbar-dark bg-dark px-4 shadow-sm">
                <a className="navbar-brand fw-bold d-flex align-items-center gap-2" href="#">
                    <FaCode /> Custom Certificates
                </a>
                <div className="ms-auto">
                    {/* NAV BAR BUTTON AS REQUESTED */}
                    {view === 'list' && (
                        <button className="btn btn-primary d-flex align-items-center gap-2" onClick={() => setView('upload')}>
                            <FaPlus /> Upload New Code
                        </button>
                    )}
                </div>
            </nav>

            {/* --- CONTENT --- */}
            <div className="container py-5">

                {/* LIST VIEW */}
                {view === 'list' && (
                    <div className="row g-4">
                        {templates.map(template => (
                            <div key={template.id} className="col-md-6 col-lg-4">
                                <div className="card h-100 border-0 shadow-sm rounded-4 overflow-hidden hover-shadow transition">
                                    <div className="card-header bg-white border-bottom-0 pt-3 px-3">
                                        <h6 className="fw-bold mb-0 text-truncate">{template.name}</h6>
                                        <small className="text-muted">{template.layout === 'custom-html' ? 'Custom Code' : 'Standard'}</small>
                                    </div>
                                    <div className="card-body p-0 position-relative bg-secondary bg-opacity-10" style={{ height: '250px' }}>
                                        <div style={{ transform: 'scale(0.35)', transformOrigin: 'top left', width: '280%', height: '280%', position: 'absolute', top: 10, left: 10 }}>
                                            <CertificateRenderer
                                                template={template}
                                                data={{ recipientName: 'John Doe', courseName: 'Demo Course', date: '2025-01-01' }}
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                        {templates.length === 0 && (
                            <div className="col-12 text-center py-5 text-muted">
                                <h4>No Custom Certificates Found</h4>
                                <p>Click "Upload New Code" to add one.</p>
                            </div>
                        )}
                    </div>
                )}

                {/* UPLOAD VIEW */}
                {view === 'upload' && (
                    <div className="row justify-content-center">
                        <div className="col-lg-10">
                            <div className="card border-0 shadow-lg rounded-4 overflow-hidden">
                                <div className="card-header bg-white border-0 pt-4 px-4 d-flex justify-content-between align-items-center">
                                    <h4 className="fw-bold mb-0">Upload Custom Certificate Code</h4>
                                    <button className="btn btn-outline-secondary btn-sm" onClick={() => setView('list')}><FaArrowLeft /> Back</button>
                                </div>
                                <div className="card-body p-4">
                                    <div className="row g-4">
                                        {/* Editor Side */}
                                        <div className="col-md-5 d-flex flex-column gap-3">
                                            <div>
                                                <label className="form-label fw-bold">Template Name</label>
                                                <input className="form-control" value={newName} onChange={e => setNewName(e.target.value)} />
                                            </div>

                                            <div>
                                                <label className="form-label fw-bold d-flex justify-content-between">
                                                    HTML/CSS/JS Code
                                                    <label className="btn btn-sm btn-light py-0 border mb-0 text-primary">
                                                        <FaUpload className="me-1" /> Upload File
                                                        <input type="file" className="d-none" accept=".html,.txt" onChange={handleFileUpload} />
                                                    </label>
                                                </label>
                                                <textarea
                                                    className="form-control font-monospace mobile-font-size"
                                                    style={{ height: '300px', fontSize: '12px', backgroundColor: '#1e1e1e', color: '#00ff00' }}
                                                    value={newCode}
                                                    onChange={e => setNewCode(e.target.value)}
                                                    placeholder="Paste your HTML code here..."
                                                ></textarea>
                                                <small className="text-muted d-block mt-1">
                                                    Use placeholders: <code>{'{{recipientName}}'}</code>, <code>{'{{courseName}}'}</code>
                                                </small>
                                            </div>

                                            <button className="btn btn-success w-100 py-2 fw-bold" onClick={handleSave}>
                                                <FaSave className="me-2" /> Save to Certificates
                                            </button>
                                        </div>

                                        {/* Preview Side */}
                                        <div className="col-md-7">
                                            <label className="form-label fw-bold">Live Preview</label>
                                            <div className="border rounded-3 overflow-hidden shadow-sm bg-white" style={{ height: '400px', position: 'relative' }}>
                                                {newCode ? (
                                                    <CertificateRenderer
                                                        template={{ layout: 'custom-html', customHtml: newCode }}
                                                        data={{ recipientName: 'Preview Student', courseName: 'Preview Course', date: '2025-12-29' }}
                                                    />
                                                ) : (
                                                    <div className="d-flex align-items-center justify-content-center h-100 text-muted bg-light">
                                                        <p>Preview will appear here</p>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Certificate;
