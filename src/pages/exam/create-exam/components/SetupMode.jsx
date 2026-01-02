import React, { useState, useEffect } from 'react';
import { EXAM_TEMPLATES } from '../data/constants';
import { toast } from 'react-toastify';

const SetupMode = ({ onComplete, initialData }) => {
    // Phases: 'selection' | 'configuration'
    const [phase, setPhase] = useState(initialData ? 'configuration' : 'selection');

    // Configuration State
    const [config, setConfig] = useState({
        title: '',
        course: '',
        type: 'mixed',
        totalMarks: 100,
        duration: 60,
        ...initialData
    });

    const [assets, setAssets] = useState({
        bgImage: null,
        watermark: null,
        watermarkOpacity: 0.1,
        orientation: 'portrait',
        ...initialData?.customAssets
    });

    const [logoError, setLogoError] = useState(false);

    // Initial Data Load (if editing)
    useEffect(() => {
        if (initialData) {
            setConfig({
                title: initialData.title || '',
                course: initialData.course || '',
                type: initialData.type || 'mixed',
                totalMarks: initialData.targetMarks || 100,
                duration: initialData.duration || 60
            });
            if (initialData.customAssets) {
                setAssets({
                    bgImage: initialData.customAssets.bgImage,
                    watermark: initialData.customAssets.watermark,
                    watermarkOpacity: initialData.customAssets.watermarkOpacity ?? 0.1,
                    orientation: initialData.customAssets.orientation ?? 'portrait'
                });
            }
        }
    }, [initialData]);

    const handleSelection = (choice, template = null) => {
        if (choice === 'template' && template) {
            setConfig(prev => ({
                ...prev,
                title: template.title,
                course: template.course,
                type: template.questions.some(q => q.type === 'coding') ? 'coding' : 'mixed',
                // Keep default marks/duration or infer from template if added to data
            }));
            // Pass questions up via onComplete, but here just set Config phase
        } else if (choice === 'blank') {
            setConfig(prev => ({ ...prev, type: template })); // template is 'mixed'/'coding' string here
        }
        setPhase('configuration');
    };

    const handleAssetChange = (key, value) => {
        setAssets(prev => ({ ...prev, [key]: value }));
    };

    const handleFileChange = (e, key) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (ev) => {
                handleAssetChange(key, ev.target.result);
            };
            reader.readAsDataURL(file);
        }
    };

    const validateAndContinue = () => {
        if (!config.title.trim() || !config.course.trim()) {
            toast.error("Please enter Exam Title and Course.");
            return;
        }
        onComplete({ ...config, customAssets: assets });
    };

    if (phase === 'selection') {
        return (
            <div className="container py-5 animate-fade-in">
                <div className="text-center mb-5">
                    <h1 className="fw-bold display-6">Create New Exam</h1>
                    <p className="text-muted">Select a starting point for your assessment.</p>
                </div>

                <div className="row g-4 justify-content-center">
                    {/* Blank */}
                    <div className="col-md-5 col-lg-4">
                        <div className="card h-100 border-0 shadow-sm hover-lift cursor-pointer" onClick={() => handleSelection('blank', 'mixed')}>
                            <div className="card-body p-4 text-center">
                                <div className="bg-primary bg-opacity-10 text-primary rounded-circle d-inline-flex p-3 mb-3">
                                    <i className="bi bi-file-earmark-plus fs-1"></i>
                                </div>
                                <h5 className="fw-bold">Start from Scratch</h5>
                                <p className="text-muted small">Empty paper. You add the questions.</p>
                            </div>
                        </div>
                    </div>

                    {/* Templates */}
                    <div className="col-md-5 col-lg-4">
                        <div className="card h-100 border-0 shadow-sm">
                            <div className="card-header bg-white border-0 pt-4 pb-0 text-center">
                                <div className="bg-success bg-opacity-10 text-success rounded-circle d-inline-flex p-3 mb-2">
                                    <i className="bi bi-grid-1x2 fs-1"></i>
                                </div>
                                <h5 className="fw-bold">Use a Template</h5>
                            </div>
                            <div className="card-body p-3">
                                <div className="d-flex flex-column gap-2">
                                    {EXAM_TEMPLATES.map(t => (
                                        <button key={t.id} className="btn btn-light btn-sm text-start" onClick={() => handleSelection('template', t)}>
                                            <i className="bi bi-chevron-right me-2 text-muted"></i>{t.title}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="container py-4 animate-fade-in" style={{ maxWidth: '800px' }}>
            <div className="card border-0 shadow-lg rounded-4 overflow-hidden">
                <div className="card-header bg-white border-bottom p-4">
                    <div className="d-flex justify-content-between align-items-center">
                        <div>
                            <h4 className="fw-bold mb-1">Exam Configuration</h4>
                            <p className="text-muted small mb-0">Set up the details and design of your paper.</p>
                        </div>
                        {!initialData && (
                            <button className="btn btn-outline-secondary btn-sm" onClick={() => setPhase('selection')}>
                                <i className="bi bi-arrow-left me-1"></i> Back
                            </button>
                        )}
                    </div>
                </div>

                <div className="card-body p-4 p-md-5">
                    {/* 1. Details */}
                    <h6 className="fw-bold text-uppercase text-muted small ls-1 mb-3"><i className="bi bi-pencil-square me-2"></i>Basic Details</h6>
                    <div className="row g-3 mb-5">
                        <div className="col-md-6">
                            <label className="form-label small fw-bold">Exam Title</label>
                            <input className="form-control" value={config.title} onChange={(e) => setConfig({ ...config, title: e.target.value })} placeholder="e.g. Final Assessment" autoFocus />
                        </div>
                        <div className="col-md-6">
                            <label className="form-label small fw-bold">Course / Subject</label>
                            <input className="form-control" value={config.course} onChange={(e) => setConfig({ ...config, course: e.target.value })} placeholder="e.g. Mathematics" />
                        </div>
                        <div className="col-md-4">
                            <label className="form-label small fw-bold">Duration (Mins)</label>
                            <input type="number" className="form-control" value={config.duration} onChange={(e) => setConfig({ ...config, duration: e.target.value })} />
                        </div>
                        <div className="col-md-4">
                            <label className="form-label small fw-bold">Total Marks</label>
                            <input type="number" className="form-control" value={config.totalMarks} onChange={(e) => setConfig({ ...config, totalMarks: e.target.value })} />
                        </div>
                        <div className="col-md-4">
                            <label className="form-label small fw-bold">Type</label>
                            <select className="form-select" value={config.type} onChange={(e) => setConfig({ ...config, type: e.target.value })}>
                                <option value="mixed">Mixed</option>
                                <option value="quiz">Quiz (MCQ)</option>
                                <option value="coding">Coding</option>
                            </select>
                        </div>
                    </div>

                    {/* 2. Visuals */}
                    <h6 className="fw-bold text-uppercase text-muted small ls-1 mb-3"><i className="bi bi-palette me-2"></i>Paper Design (Optional)</h6>
                    <div className="bg-light p-4 rounded-3 mb-4">
                        <div className="row g-4">
                            <div className="col-md-6">
                                <label className="form-label small fw-bold d-block">Orientation</label>
                                <div className="btn-group w-100 bg-white shadow-sm rounded">
                                    <button
                                        className={`btn btn-sm ${assets.orientation === 'portrait' ? 'btn-dark' : 'btn-light'}`}
                                        onClick={() => handleAssetChange('orientation', 'portrait')}
                                    >
                                        <i className="bi bi-file-text me-2"></i>Portrait
                                    </button>
                                    <button
                                        className={`btn btn-sm ${assets.orientation === 'landscape' ? 'btn-dark' : 'btn-light'}`}
                                        onClick={() => handleAssetChange('orientation', 'landscape')}
                                    >
                                        <i className="bi bi-file-landscape me-2"></i>Landscape
                                    </button>
                                </div>
                            </div>

                            <div className="col-md-6">
                                <label className="form-label small fw-bold">Background Image</label>
                                <input type="file" className="form-control form-control-sm" accept="image/*" onChange={(e) => handleFileChange(e, 'bgImage')} />
                                <div className="form-text x-small">Texture or border (A4 ratio recommended).</div>
                            </div>

                            <div className="col-12 border-top pt-3">
                                <label className="form-label small fw-bold d-flex justify-content-between">
                                    <span>Watermark / Logo</span>
                                    {assets.watermark && <span className="text-muted fw-normal">Opacity: {Math.round(assets.watermarkOpacity * 100)}%</span>}
                                </label>

                                <div className="d-flex align-items-center gap-3 mb-2">
                                    <div className="form-check form-switch">
                                        <input
                                            className="form-check-input"
                                            type="checkbox"
                                            id="useInitLogo"
                                            checked={assets.watermark === localStorage.getItem('institute_logo') && !!localStorage.getItem('institute_logo')}
                                            onChange={(e) => {
                                                if (e.target.checked) {
                                                    const logo = localStorage.getItem('institute_logo');
                                                    if (logo) {
                                                        handleAssetChange('watermark', logo);
                                                        setLogoError(false);
                                                    } else {
                                                        setLogoError(true);
                                                        e.target.checked = false;
                                                    }
                                                } else {
                                                    handleAssetChange('watermark', null);
                                                    setLogoError(false);
                                                }
                                            }}
                                        />
                                        <label className="form-check-label small" htmlFor="useInitLogo">Use Institute Logo</label>
                                    </div>

                                    <div className="vr"></div>

                                    <input
                                        type="file"
                                        className="form-control form-control-sm w-auto"
                                        accept="image/*"
                                        onChange={(e) => handleFileChange(e, 'watermark')}
                                        disabled={assets.watermark && assets.watermark === localStorage.getItem('institute_logo')}
                                    />
                                </div>
                                {logoError && <div className="text-danger x-small mb-2"><i className="bi bi-exclamation-circle me-1"></i>Institute logo not found in settings.</div>}

                                {assets.watermark && (
                                    <input
                                        type="range"
                                        className="form-range"
                                        min="0" max="1" step="0.05"
                                        value={assets.watermarkOpacity}
                                        onChange={(e) => handleAssetChange('watermarkOpacity', parseFloat(e.target.value))}
                                    />
                                )}
                            </div>
                        </div>
                    </div>

                    <div className="d-flex justify-content-end pt-3">
                        <button className="btn btn-primary px-5 fw-bold shadow-sm rounded-pill" onClick={validateAndContinue}>
                            Continue to Editor <i className="bi bi-arrow-right ms-2"></i>
                        </button>
                    </div>

                </div>
            </div>
        </div>
    );
};

export default SetupMode;
