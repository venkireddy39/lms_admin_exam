import React, { useEffect } from 'react';

const PreviewMode = ({ examData, onClose }) => {
    const {
        title, course, questions, customAssets, totalMarks, duration
    } = examData;

    // Lock Body Scroll
    useEffect(() => {
        document.body.style.overflow = 'hidden';
        return () => { document.body.style.overflow = ''; };
    }, []);

    // Fixed styling to match PDF/Print output expectation
    const paperStyle = {
        width: customAssets.orientation === 'landscape' ? '1123px' : '794px',
        minHeight: customAssets.orientation === 'landscape' ? '794px' : '1123px',
        margin: '50px auto',
        backgroundColor: '#ffffff',
        backgroundImage: customAssets.bgImage ? `url(${customAssets.bgImage})` : 'none',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        position: 'relative',
        boxShadow: '0 0 50px rgba(0,0,0,0.5)',
        color: '#000',
        printColorAdjust: 'exact',
        WebkitPrintColorAdjust: 'exact'
    };

    return (
        <div className="position-fixed top-0 start-0 w-100 h-100 d-flex flex-column animate-fade-in" style={{ zIndex: 2000, background: '#333' }}>
            {/* Toolbar */}
            <div className="bg-dark text-white px-4 py-3 d-flex justify-content-between align-items-center shadow-sm">
                <div>
                    <h5 className="mb-0 fw-bold"><i className="bi bi-eye me-2 text-info"></i>Exam Preview</h5>
                </div>
                <div>
                    <span className="badge bg-secondary me-3">{customAssets.orientation === 'landscape' ? 'Landscape' : 'Portrait'} A4</span>
                    <button className="btn btn-light btn-sm rounded-pill px-4 fw-bold" onClick={onClose}>
                        Close Preview
                    </button>
                </div>
            </div>

            {/* Scrollable Canvas */}
            <div className="flex-grow-1 overflow-auto p-4 customize-scrollbar">

                <div style={paperStyle}>
                    {/* Watermark Overlay */}
                    {customAssets.watermark && (
                        <div className="position-absolute top-50 start-50 translate-middle"
                            style={{
                                zIndex: 0,
                                opacity: customAssets.watermarkOpacity,
                                width: '60%',
                                pointerEvents: 'none'
                            }}>
                            <img src={customAssets.watermark} alt="Watermark" className="img-fluid" />
                        </div>
                    )}

                    {/* Content Layer */}
                    <div className="position-relative p-5 h-100 d-flex flex-column" style={{ zIndex: 1, minHeight: 'inherit' }}>
                        {/* Header */}
                        <div className="text-center border-bottom border-dark pb-4 mb-4">
                            <h1 className="fw-bold mb-2 text-uppercase display-6" style={{ letterSpacing: '2px' }}>{title}</h1>
                            <div className="d-flex justify-content-center gap-4 text-muted small fw-bold text-uppercase">
                                <span>{course}</span>
                                <span>•</span>
                                <span>{duration} Minutes</span>
                                <span>•</span>
                                <span>Max Marks: {totalMarks}</span>
                            </div>
                        </div>

                        {/* Questions */}
                        <div className="flex-grow-1">
                            {questions.length === 0 ? (
                                <div className="text-center text-muted py-5">
                                    <p className="mb-0 fst-italic">-- No Questions Added --</p>
                                </div>
                            ) : (
                                <div className="vstack gap-4">
                                    {questions.map((q, idx) => (
                                        <div key={idx} className="mb-3 break-inside-avoid">
                                            <div className="d-flex justify-content-between align-items-start mb-2">
                                                <span className="fw-bold fs-5 me-3">{idx + 1}.</span>
                                                <div className="flex-grow-1">
                                                    <p className="fw-bold mb-2 fs-5">{q.question}</p>

                                                    {q.image && (
                                                        <div className="mb-3">
                                                            <img src={q.image} alt="Reference" className="img-fluid border rounded" style={{ maxHeight: '250px' }} />
                                                        </div>
                                                    )}

                                                    {q.type === 'quiz' && (
                                                        <div className="ps-3 border-start border-3 border-light">
                                                            {q.options.map((opt, i) => (
                                                                <div key={i} className="form-check mb-1">
                                                                    <input className="form-check-input" type="radio" disabled />
                                                                    <label className="form-check-label text-dark">{opt}</label>
                                                                </div>
                                                            ))}
                                                        </div>
                                                    )}

                                                    {q.type === 'coding' && (
                                                        <div className="bg-light p-3 rounded border font-monospace small text-muted">
                                                            {q.starterCode || '// Write your code here...'}
                                                        </div>
                                                    )}

                                                    {(q.type === 'short' || q.type === 'long') && (
                                                        <div className="border-bottom border-light mt-4" style={{ height: q.type === 'short' ? '50px' : '150px' }}></div>
                                                    )}
                                                </div>
                                                <span className="fw-bold ms-4 text-nowrap">[{q.marks}]</span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Footer */}
                        <div className="mt-auto pt-5 text-center text-muted x-small border-top">
                            <div className="row">
                                <div className="col-4 text-start">Candidate Name: _________________</div>
                                <div className="col-4">Page 1</div>
                                <div className="col-4 text-end">Signature: _________________</div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default PreviewMode;
