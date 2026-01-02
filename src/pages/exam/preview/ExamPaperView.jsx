import React, { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const ExamPaperView = () => {
    const { id } = useParams();
    const navigate = useNavigate();

    const [exam, setExam] = useState(null);
    const [answers, setAnswers] = useState({});
    const [timeLeft, setTimeLeft] = useState(0);
    const [submitted, setSubmitted] = useState(false);
    const [executionStatus, setExecutionStatus] = useState({});
    const [consoleOutput, setConsoleOutput] = useState({});

    // Timer Logic
    useEffect(() => {
        if (exam && !submitted && timeLeft > 0) {
            const timer = setInterval(() => {
                setTimeLeft(prev => {
                    if (prev <= 1) {
                        clearInterval(timer);
                        handleSubmit(); // Auto-submit
                        return 0;
                    }
                    return prev - 1;
                });
            }, 1000);
            return () => clearInterval(timer);
        }
    }, [exam, submitted, timeLeft]);

    useEffect(() => {
        const exams = JSON.parse(localStorage.getItem("exams")) || [];
        const foundExam = exams.find(e => String(e.id) === String(id));

        if (foundExam) {
            setExam(foundExam);
            // Initialize timer in seconds
            setTimeLeft(foundExam.duration * 60);

            // Initialize answers structure
            const initialAnswers = {};
            foundExam.questions.forEach((q, i) => {
                initialAnswers[i] = q.type === 'coding' ? (q.starterCode || '') : '';
            });
            setAnswers(initialAnswers);
        }
    }, [id]);

    const handleAnswerChange = (index, value) => {
        setAnswers(prev => ({
            ...prev,
            [index]: value
        }));
    };

    const handleRunCode = (index, code) => {
        if (!code) {
            toast.warning("Please write some code first!");
            return;
        }
        setExecutionStatus(prev => ({ ...prev, [index]: 'running' }));
        setConsoleOutput(prev => ({ ...prev, [index]: 'Compiling and executing...' }));

        // Simulate execution delay
        setTimeout(() => {
            const isSuccess = Math.random() > 0.3; // 70% success rate for simulation
            if (isSuccess) {
                setExecutionStatus(prev => ({ ...prev, [index]: 'success' }));
                setConsoleOutput(prev => ({ ...prev, [index]: '> Output:\nHello World!\n[Tests]\nTest Case 1: Passed ✅\nTest Case 2: Passed ✅\n\nResult: Success' }));
            } else {
                setExecutionStatus(prev => ({ ...prev, [index]: 'error' }));
                setConsoleOutput(prev => ({ ...prev, [index]: '> Output:\nReferenceError: x is not defined\n    at main.js:4:5\n\n[Tests]\nTest Case 1: Failed ❌' }));
            }
        }, 1500);
    };

    const handleSubmit = () => {
        setSubmitted(true);
        window.scrollTo(0, 0);
        toast.info("Exam Submitted Successfully!");
        // Here you would typically save to DB/Local Storage
    };

    const formatTime = (seconds) => {
        const m = Math.floor(seconds / 60);
        const s = seconds % 60;
        return `${m}:${s < 10 ? '0' : ''}${s}`;
    };

    if (!exam) {
        return (
            <div className="container py-5 text-center">
                <div className="spinner-border text-primary mb-3"></div>
                <h3 className="text-muted">Loading Assessment...</h3>
            </div>
        );
    }

    const isCodingTheme = exam.type === 'coding' || exam.questions.some(q => q.type === 'coding');
    // Live Exam Rule: No Background Image, but Watermark permitted
    const watermark = exam.customAssets?.watermark;
    const watermarkOpacity = exam.customAssets?.watermarkOpacity || 0.1;

    return (
        <div className="min-vh-100 pb-5 position-relative" style={{
            fontFamily: "'Inter', sans-serif",
            background: isCodingTheme ? "#0f172a" : "#f8f9fa",
            color: isCodingTheme ? "#e2e8f0" : "#212529"
        }}>
            <ToastContainer />

            {/* Watermark (Live Exam Mode) */}
            {watermark && (
                <div className="position-fixed top-50 start-50 translate-middle pointer-events-none user-select-none"
                    style={{
                        zIndex: 0,
                        opacity: watermarkOpacity,
                        width: '50%',
                        pointerEvents: 'none'
                    }}>
                    <img src={watermark} alt="" className="img-fluid opacity-50" />
                </div>
            )}

            {/* Sticky Header with Timer */}
            <div className={`sticky-top shadow-sm px-4 py-3 d-flex justify-content-between align-items-center ${isCodingTheme ? 'bg-dark border-bottom border-secondary' : 'bg-white'}`} style={{ zIndex: 1020 }}>
                <div>
                    <h5 className={`mb-0 fw-bold ${isCodingTheme ? 'text-white' : 'text-primary'}`}>{exam.title}</h5>
                    <small className={isCodingTheme ? 'text-secondary' : 'text-muted'}>{exam.course}</small>
                </div>

                {!submitted ? (
                    <div className={`d-flex align-items-center px-4 py-2 rounded-pill fw-bold fs-5 ${timeLeft < 300 ? 'bg-danger text-white' : isCodingTheme ? 'bg-secondary text-white' : 'bg-primary text-white'}`}>
                        <i className="bi bi-stopwatch me-2"></i>
                        {formatTime(timeLeft)}
                    </div>
                ) : (
                    <div className="badge bg-success px-3 py-2 fs-6">Submitted</div>
                )}
            </div>

            <div className="container py-5 position-relative" style={{ maxWidth: '900px', zIndex: 1 }}>

                {/* Intro Card */}
                {!submitted && (
                    <div className={`card border-0 shadow-sm mb-4 ${isCodingTheme ? 'bg-dark text-white border-secondary' : ''}`}>
                        <div className="card-body p-4">
                            <div className="d-flex align-items-center gap-3">
                                <div className="bg-primary bg-opacity-10 text-primary rounded-circle p-3">
                                    <i className="bi bi-info-circle fs-4"></i>
                                </div>
                                <div>
                                    <h6 className="fw-bold mb-1">Instructions</h6>
                                    <p className={`small mb-0 ${isCodingTheme ? 'text-white-50' : 'text-muted'}`}>
                                        You are about to start. Please answer all {exam.questions.length} questions.
                                        Don't refresh the page.
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Questions List */}
                <div className="vstack gap-4">
                    {exam.questions.map((q, index) => (
                        <div key={index} className={`card border-0 shadow-sm overflow-hidden ${isCodingTheme ? 'bg-dark text-white border-secondary' : ''}`} style={{ borderRadius: '15px' }}>
                            <div className={`card-header border-0 py-3 px-4 ${isCodingTheme ? 'bg-secondary bg-opacity-25' : 'bg-light'}`}>
                                <div className="d-flex justify-content-between align-items-center">
                                    <span className={`badge ${isCodingTheme ? 'bg-primary' : 'bg-dark'}`}>Q{index + 1}</span>
                                    <span className={`fw-bold small ${isCodingTheme ? 'text-info' : 'text-muted'}`}>{q.marks} Marks</span>
                                </div>
                            </div>

                            <div className="card-body p-4">
                                <h5 className="fw-bold mb-4" style={{ lineHeight: '1.6' }}>{q.question}</h5>

                                {q.image && (
                                    <div className="mb-4 text-center bg-light rounded p-3">
                                        <img src={q.image} alt="Question Reference" className="img-fluid rounded shadow-sm" style={{ maxHeight: '300px' }} />
                                    </div>
                                )}

                                {/* --- RENDER BASED ON TYPE --- */}

                                {/* 1. QUIZ (MCQ) */}
                                {q.type === 'quiz' && (
                                    <div className="vstack gap-2">
                                        {q.options.map((opt, optIndex) => (
                                            <label key={optIndex} className={`d-flex align-items-center p-3 rounded border transition-all cursor-pointer ${answers[index] === optIndex ? (isCodingTheme ? 'border-primary bg-primary bg-opacity-10' : 'border-primary bg-blue-50') : (isCodingTheme ? 'border-secondary' : 'border-light hover-bg-light')
                                                }`}>
                                                <input
                                                    type="radio"
                                                    name={`q-${index}`}
                                                    className="form-check-input me-3"
                                                    checked={answers[index] === optIndex}
                                                    onChange={() => handleAnswerChange(index, optIndex)}
                                                    disabled={submitted}
                                                />
                                                <span className={isCodingTheme ? 'text-light' : 'text-dark'}>{opt}</span>
                                            </label>
                                        ))}
                                    </div>
                                )}

                                {/* 2. CODING */}
                                {q.type === 'coding' && (
                                    <div className="d-flex flex-column gap-3">
                                        <div className="d-flex justify-content-between align-items-center">
                                            <span className="badge bg-secondary">{q.language || 'Code'}</span>
                                            <div className="d-flex gap-2">
                                                <button
                                                    className="btn btn-sm btn-outline-secondary"
                                                    onClick={() => handleAnswerChange(index, q.starterCode || '')}
                                                    disabled={executionStatus[index] === 'running' || submitted}
                                                >
                                                    <i className="bi bi-arrow-counterclockwise me-1"></i> Reset
                                                </button>
                                                <button
                                                    className="btn btn-sm btn-success fw-bold"
                                                    onClick={() => handleRunCode(index, answers[index])}
                                                    disabled={executionStatus[index] === 'running' || submitted}
                                                >
                                                    {executionStatus[index] === 'running' ? (
                                                        <><span className="spinner-border spinner-border-sm me-1"></span>Running...</>
                                                    ) : (
                                                        <><i className="bi bi-play-fill me-1"></i>Run Code</>
                                                    )}
                                                </button>
                                            </div>
                                        </div>

                                        <textarea
                                            className={`form-control font-monospace border-0 p-3 ${isCodingTheme ? 'bg-black text-white' : 'bg-dark text-white'}`}
                                            rows="10"
                                            value={answers[index]}
                                            onChange={(e) => handleAnswerChange(index, e.target.value)}
                                            disabled={submitted}
                                            spellCheck="false"
                                            style={{ fontSize: '14px', lineHeight: '1.5', tabSize: 4 }}
                                        ></textarea>

                                        {/* Console Output Simulation */}
                                        {(executionStatus[index] || consoleOutput[index]) && (
                                            <div className={`rounded p-3 mt-0 ${executionStatus[index] === 'error' ? 'bg-danger bg-opacity-10 border border-danger text-danger' : 'bg-black bg-opacity-50 border border-secondary text-info'}`} style={{ fontFamily: "monospace", fontSize: "0.85rem", whiteSpace: "pre-wrap" }}>
                                                <div className="mb-1 opacity-50 x-small text-uppercase ls-1">Console Output</div>
                                                {consoleOutput[index]}
                                            </div>
                                        )}
                                    </div>
                                )}

                                {/* 3. SHORT / LONG ANSWER */}
                                {(q.type === 'short' || q.type === 'long') && (
                                    <textarea
                                        className={`form-control ${isCodingTheme ? 'bg-black text-white border-secondary' : 'bg-light border-0'}`}
                                        rows={q.type === 'short' ? 3 : 6}
                                        placeholder="Type your answer here..."
                                        value={answers[index]}
                                        onChange={(e) => handleAnswerChange(index, e.target.value)}
                                        disabled={submitted}
                                    ></textarea>
                                )}

                                {/* 4. ABACUS */}
                                {q.type === 'abacus' && (
                                    <div className="row align-items-center g-3">
                                        <div className="col-auto">
                                            <label className="col-form-label fw-bold">Answer:</label>
                                        </div>
                                        <div className="col-auto">
                                            <input
                                                type="number"
                                                className={`form-control fs-4 fw-bold text-center ${isCodingTheme ? 'bg-secondary text-white border-0' : 'bg-light border-primary'}`}
                                                style={{ width: '150px' }}
                                                placeholder="0"
                                                value={answers[index]}
                                                onChange={(e) => handleAnswerChange(index, e.target.value)}
                                                disabled={submitted}
                                            />
                                        </div>
                                        <div className="col-auto">
                                            <button className="btn btn-outline-secondary btn-sm disabled opacity-50" title="Virtual Numpad (Coming Soon)">
                                                <i className="bi bi-grid-3x3 me-1"></i> Virtual Keypad
                                            </button>
                                        </div>
                                    </div>
                                )}

                            </div>
                        </div>
                    ))}
                </div>

                {/* Submit Action */}
                {!submitted && (
                    <div className="mt-5 text-center">
                        <button
                            className="btn btn-primary btn-lg px-5 py-3 fw-bold rounded-pill shadow-lg hover-scale"
                            onClick={() => {
                                if (window.confirm("Are you sure you want to final submit? You cannot change answers after this.")) {
                                    handleSubmit();
                                }
                            }}
                        >
                            Submit Assessment <i className="bi bi-arrow-right ms-2"></i>
                        </button>
                    </div>
                )}

                {submitted && (
                    <div className="mt-5 text-center animate-fade-in">
                        <div className="alert alert-success d-inline-block px-5 py-3 rounded-4 shadow-sm">
                            <h4 className="fw-bold mb-2"><i className="bi bi-check-circle-fill me-2"></i>Submission Received!</h4>
                            <p className="mb-3">Your responses have been recorded.</p>
                            <button className="btn btn-outline-success btn-sm" onClick={() => navigate('/exams/dashboard')}>Return to Dashboard</button>
                        </div>
                    </div>
                )}

            </div>
        </div>
    );
};

export default ExamPaperView;

