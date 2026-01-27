import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import MixedQuestionManager from './MixedQuestionManager';
import QuestionForm from '../../components/QuestionForm';
import SectionManager from './SectionManager';
import { toast } from 'react-toastify';

const EditorMode = ({ examData, setExamData, onSave, onPreview, onBack }) => {
    const navigate = useNavigate();
    const [zoom, setZoom] = useState(100);
    const [activeTab, setActiveTab] = useState('add'); // 'add' | 'settings'

    const {
        title, course, questions, customAssets, totalMarks, duration, type
    } = examData;

    const handleOnlinePreview = () => {
        if (questions.length === 0) {
            toast.warn("Please add some questions first.");
            return;
        }
        // Open in new tab? No, router is SPA.
        // It's better to navigate in same tab usually, or open new window.
        // Since SPA, simple navigate.
        navigate('/exams/simulation/mnc-preview', { state: { examData } });
    };


    const paperStyle = {
        width: customAssets.orientation === 'landscape' ? '1123px' : '794px',
        minHeight: customAssets.orientation === 'landscape' ? '794px' : '1123px',
        height: 'auto',
        backgroundColor: '#ffffff',
        backgroundImage: customAssets.bgImage ? `url(${customAssets.bgImage})` : 'none',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        position: 'relative',
        transform: `scale(${zoom / 100})`,
        transformOrigin: 'top center',
        transition: 'transform 0.2s ease, width 0.3s ease',
        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
        margin: '0 auto'
    };

    const addQuestion = (q) => {
        setExamData(prev => ({ ...prev, questions: [...prev.questions, q] }));
        toast.success("Question Added");
    };

    const removeQuestion = (idx) => {
        if (window.confirm("Remove this question?")) {
            setExamData(prev => ({
                ...prev,
                questions: prev.questions.filter((_, i) => i !== idx)
            }));
        }
    };

    const currentTotal = questions.reduce((acc, q) => acc + (q.marks || 0), 0);

    return (
        <div className="d-flex flex-column h-100" style={{ height: 'calc(100vh - 100px)' }}>
            {/* Toolbar */}
            <div className="bg-primary border-bottom px-4 py-3 d-flex justify-content-between align-items-center" style={{ zIndex: 10, boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}>
                <div className="d-flex align-items-center gap-3">
                    <button className="btn btn-light btn-sm shadow-sm" onClick={onBack} style={{ fontWeight: 600 }}>
                        <i className="bi bi-nut me-1"></i> Settings
                    </button>
                    <div className="vr" style={{ height: '24px', opacity: 0.3, background: '#fff' }}></div>
                    <div>
                        <h6 className="mb-0 fw-bold text-white">{title} <span className="fw-normal ms-2" style={{ opacity: 0.8 }}>| {course}</span></h6>
                        <small className="text-white" style={{ fontSize: '0.75rem', opacity: 0.7 }}><i className="bi bi-clock-history me-1"></i>Last saved: Just now</small>
                    </div>
                </div>

                <div className="d-flex align-items-center gap-3">
                    {/* Zoom Control */}
                    <div className="d-flex align-items-center bg-white bg-opacity-25 rounded px-3 py-1" style={{ backdropFilter: 'blur(10px)' }}>
                        <button className="btn btn-link btn-sm p-0 text-white" onClick={() => setZoom(z => Math.max(50, z - 10))}><i className="bi bi-dash"></i></button>
                        <span className="mx-2 small fw-bold text-white" style={{ minWidth: '40px', textAlign: 'center' }}>{zoom}%</span>
                        <button className="btn btn-link btn-sm p-0 text-white" onClick={() => setZoom(z => Math.min(150, z + 10))}><i className="bi bi-plus"></i></button>
                    </div>

                    <button className="btn btn-light btn-sm shadow-sm fw-medium" onClick={handleOnlinePreview}>
                        <i className="bi bi-eye me-1"></i> Preview
                    </button>
                    <button className="btn btn-success btn-sm shadow-sm fw-bold" onClick={onSave}>
                        <i className="bi bi-floppy me-1"></i> Save & Publish
                    </button>
                </div>
            </div>

            <div className="d-flex flex-grow-1 overflow-hidden">
                {/* Left Sidebar: Editor Tools */}
                <div className="bg-white border-end d-flex flex-column" style={{ width: '380px', zIndex: 5 }}>
                    <div className="p-3 bg-light border-bottom">
                        <div className="nav nav-pills nav-fill bg-white rounded p-1 border">
                            <button className={`nav-link py-1 x-small rounded-2 fw-bold ${activeTab === 'add' ? 'active shadow-sm' : 'text-muted'}`} onClick={() => setActiveTab('add')}>
                                <i className="bi bi-plus-lg me-1"></i> Add
                            </button>
                            <button className={`nav-link py-1 x-small rounded-2 fw-bold ${activeTab === 'sections' ? 'active shadow-sm' : 'text-muted'}`} onClick={() => setActiveTab('sections')}>
                                <i className="bi bi-collection me-1"></i> Sections
                            </button>
                            <button className={`nav-link py-1 x-small rounded-2 fw-bold ${activeTab === 'settings' ? 'active shadow-sm' : 'text-muted'}`} onClick={() => setActiveTab('settings')}>
                                <i className="bi bi-sliders me-1"></i> Settings
                            </button>
                        </div>
                    </div>

                    <div className="flex-grow-1 overflow-auto p-0 customize-scrollbar">
                        {activeTab === 'add' ? (
                            <div className="p-0">
                                {type === 'mixed' ? (
                                    <MixedQuestionManager onAdd={addQuestion} />
                                ) : (
                                    <div className="p-3">
                                        <QuestionForm type={type} onAdd={addQuestion} />
                                    </div>
                                )}
                            </div>
                        ) : activeTab === 'sections' ? (
                            <SectionManager
                                sections={examData.sections || []}
                                questions={examData.questions}
                                onSectionsUpdate={(newSections) => setExamData(prev => ({ ...prev, sections: newSections }))}
                            />
                        ) : (
                            <div className="p-4">
                                <h6 className="fw-bold text-muted text-uppercase small ls-1 mb-3">Paper Information</h6>
                                <ul className="list-group list-group-flush mb-4 small border rounded">
                                    <li className="list-group-item d-flex justify-content-between">
                                        <span>Total Questions</span>
                                        <span className="fw-bold">{questions.length}</span>
                                    </li>
                                    <li className="list-group-item d-flex justify-content-between">
                                        <span>Total Marks</span>
                                        <span className={`fw-bold ${currentTotal > totalMarks ? 'text-danger' : 'text-success'}`}>{currentTotal} / {totalMarks}</span>
                                    </li>
                                    <li className="list-group-item d-flex justify-content-between">
                                        <span>Duration</span>
                                        <span className="fw-bold">{duration} min</span>
                                    </li>
                                </ul>

                                <h6 className="fw-bold text-muted text-uppercase small ls-1 mb-3 mt-4">Exam Controls</h6>

                                {/* 1. Rules */}
                                <div className="mb-4">
                                    <label className="small fw-bold text-primary mb-2 d-block">Rules & Behaviour</label>
                                    <div className="card card-body p-3 bg-light border-0">
                                        <div className="form-check form-switch mb-2">
                                            <input
                                                className="form-check-input"
                                                type="checkbox"
                                                checked={examData.settings?.negativeMarking || false}
                                                onChange={(e) => setExamData(prev => ({ ...prev, settings: { ...prev.settings, negativeMarking: e.target.checked } }))}
                                            />
                                            <label className="form-check-label small">Negative Marking</label>
                                        </div>
                                        <div className="form-check form-switch mb-2">
                                            <input
                                                className="form-check-input"
                                                type="checkbox"
                                                checked={examData.settings?.autoSubmit || false}
                                                onChange={(e) => setExamData(prev => ({ ...prev, settings: { ...prev.settings, autoSubmit: e.target.checked } }))}
                                            />
                                            <label className="form-check-label small">Auto Submit</label>
                                        </div>
                                        <div className="form-check form-switch mb-2">
                                            <input
                                                className="form-check-input"
                                                type="checkbox"
                                                checked={examData.settings?.shuffleQuestions || false}
                                                onChange={(e) => setExamData(prev => ({ ...prev, settings: { ...prev.settings, shuffleQuestions: e.target.checked } }))}
                                            />
                                            <label className="form-check-label small">Shuffle Questions</label>
                                        </div>
                                        <div className="form-check form-switch">
                                            <input
                                                className="form-check-input"
                                                type="checkbox"
                                                checked={examData.settings?.allowResume || false}
                                                onChange={(e) => setExamData(prev => ({ ...prev, settings: { ...prev.settings, allowResume: e.target.checked } }))}
                                            />
                                            <label className="form-check-label small">Allow Resume</label>
                                        </div>
                                    </div>
                                </div>

                                {/* 2. Proctoring */}
                                <div className="mb-4">
                                    <div className="d-flex justify-content-between align-items-center mb-2">
                                        <label className="small fw-bold text-danger mb-0">Proctoring</label>
                                        <div className="form-check form-switch m-0">
                                            <input
                                                className="form-check-input"
                                                type="checkbox"
                                                checked={examData.proctoring?.enabled || false}
                                                onChange={(e) => setExamData(prev => ({ ...prev, proctoring: { ...prev.proctoring, enabled: e.target.checked } }))}
                                            />
                                        </div>
                                    </div>

                                    {examData.proctoring?.enabled && (
                                        <div className="card card-body p-3 bg-danger bg-opacity-10 border-0">
                                            <div className="form-check form-switch mb-2">
                                                <input
                                                    className="form-check-input"
                                                    type="checkbox"
                                                    checked={examData.proctoring?.cameraRequired || false}
                                                    onChange={(e) => setExamData(prev => ({ ...prev, proctoring: { ...prev.proctoring, cameraRequired: e.target.checked } }))}
                                                />
                                                <label className="form-check-label small">Camera Req.</label>
                                            </div>
                                            <div className="form-check form-switch mb-2">
                                                <input
                                                    className="form-check-input"
                                                    type="checkbox"
                                                    checked={examData.proctoring?.forceFullScreen || false}
                                                    onChange={(e) => setExamData(prev => ({ ...prev, proctoring: { ...prev.proctoring, forceFullScreen: e.target.checked } }))}
                                                />
                                                <label className="form-check-label small">Full Screen</label>
                                            </div>
                                            <div className="form-check form-switch">
                                                <input
                                                    className="form-check-input"
                                                    type="checkbox"
                                                    checked={examData.proctoring?.blockOnTabSwitch || false}
                                                    onChange={(e) => setExamData(prev => ({ ...prev, proctoring: { ...prev.proctoring, blockOnTabSwitch: e.target.checked } }))}
                                                />
                                                <label className="form-check-label small">Block Tab Switch</label>
                                            </div>
                                        </div>
                                    )}
                                </div>

                                {/* 3. Grading */}
                                <div className="mb-4">
                                    <label className="small fw-bold text-success mb-2 d-block">Grading</label>
                                    <div className="card card-body p-3 bg-success bg-opacity-10 border-0">
                                        <div className="form-check form-switch mb-2">
                                            <input
                                                className="form-check-input"
                                                type="checkbox"
                                                checked={examData.settings?.showResults || false}
                                                onChange={(e) => setExamData(prev => ({ ...prev, settings: { ...prev.settings, showResults: e.target.checked } }))}
                                            />
                                            <label className="form-check-label small">Show Results</label>
                                        </div>
                                        <div className="form-check form-switch">
                                            <input
                                                className="form-check-input"
                                                type="checkbox"
                                                checked={examData.settings?.autoEvaluation || false}
                                                onChange={(e) => setExamData(prev => ({ ...prev, settings: { ...prev.settings, autoEvaluation: e.target.checked } }))}
                                            />
                                            <label className="form-check-label small">Auto Evaluation</label>
                                        </div>
                                    </div>
                                </div>

                                <div className="p-3 bg-blue-50 text-primary rounded border border-blue-100 mb-3">
                                    <small><i className="bi bi-info-circle me-1"></i> Changes here update the main settings immediately.</small>
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* Main Area: Page Canvas */}
                <div className="flex-grow-1 bg-secondary bg-opacity-10 overflow-auto p-5 d-flex justify-content-center align-items-start">
                    {/* The Paper */}
                    <div className="bg-white text-black shadow-lg" style={paperStyle}>
                        {/* Watermark Overlay */}
                        {customAssets.watermark && (
                            <div className="position-absolute top-50 start-50 translate-middle"
                                style={{
                                    zIndex: 1,
                                    opacity: customAssets.watermarkOpacity,
                                    width: '50%',
                                    pointerEvents: 'none',
                                    userSelect: 'none'
                                }}>
                                <img src={customAssets.watermark} alt="" className="img-fluid opacity-50" />
                            </div>
                        )}

                        {/* Content Layer */}
                        <div className="position-relative p-5 h-100 d-flex flex-column" style={{ zIndex: 2 }}>
                            {/* Paper Header */}
                            <div className="text-center border-bottom border-dark pb-4 mb-4">
                                {customAssets.logo && (
                                    <img src={customAssets.logo} alt="Logo" className="mb-3" style={{ height: '60px', objectFit: 'contain' }} />
                                )}
                                <h1 className="fw-bold mb-2 text-uppercase display-6" style={{ letterSpacing: '2px' }}>{title}</h1>
                                <div className="d-flex justify-content-center gap-4 text-muted small fw-bold text-uppercase">
                                    <span>{course}</span>
                                    <span>•</span>
                                    <span>{duration} Minutes</span>
                                    <span>•</span>
                                    <span>Max Marks: {totalMarks}</span>
                                </div>

                                {examData.instructions && (
                                    <div className="mt-4 text-start bg-light p-3 rounded border border-light">
                                        <h6 className="fw-bold small text-uppercase mb-2 text-muted">Instructions:</h6>
                                        <p className="small mb-0 text-dark" style={{ whiteSpace: 'pre-line' }}>{examData.instructions}</p>
                                    </div>
                                )}
                            </div>

                            {/* Questions */}
                            <div className="flex-grow-1">
                                {questions.length === 0 ? (
                                    <div className="text-center text-muted py-5 border border-dashed rounded-3 bg-light">
                                        <p className="mb-0">Paper is empty. Add questions from the sidebar.</p>
                                    </div>
                                ) : (
                                    <div className="vstack gap-4">
                                        {questions.map((q, idx) => (
                                            <div key={idx} className="group position-relative hover-highlight p-2 rounded transition-all">
                                                <div className="d-flex justify-content-between align-items-start mb-2">
                                                    <span className="fw-bold me-2">{idx + 1}.</span>
                                                    <div className="flex-grow-1">
                                                        <span className="fw-bold">{q.question}</span>
                                                    </div>
                                                    <span className="fw-bold ms-3 float-end text-nowrap">[{q.marks} Marks]</span>
                                                </div>

                                                {q.image && <img src={q.image} alt="ref" className="img-fluid rounded mb-2 border" style={{ maxHeight: '150px' }} />}

                                                {/* Type specific view */}
                                                {q.type === 'quiz' && (
                                                    <div className="ps-3 border-start row g-2">
                                                        {q.options.map((o, i) => (
                                                            <div key={i} className="col-6">
                                                                <small className="text-muted">({String.fromCharCode(97 + i)}) {o}</small>
                                                            </div>
                                                        ))}
                                                    </div>
                                                )}

                                                {q.type === 'coding' && (
                                                    <div className="bg-light p-2 rounded font-monospace x-small border text-muted">
                                                        {q.starterCode ? q.starterCode.substring(0, 100) + '...' : '// Code space'}
                                                    </div>
                                                )}

                                                {/* Hover Action */}
                                                <button
                                                    onClick={() => removeQuestion(idx)}
                                                    className="btn btn-danger btn-sm position-absolute top-0 end-0 translate-middle-y opacity-0 group-hover-opacity-100 shadow-sm"
                                                    style={{ transform: 'translateX(50%)' }}
                                                >
                                                    <i className="bi bi-trash"></i>
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>

                            {/* Footer */}
                            <div className="mt-auto pt-4 text-center text-muted x-small border-top">
                                Page 1 of 1
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <style>
                {`
                .hover-highlight:hover { background-color: rgba(0,0,0,0.02); }
                .group-hover-opacity-100 { opacity: 1 !important; }
                .group:hover .opacity-0 { opacity: 1 !important; }
                `}
            </style>
        </div>
    );
};

export default EditorMode;
