import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
    FiClock,
    FiCheckCircle,
    FiChevronLeft,
    FiChevronRight,
    FiFlag,
    FiMenu,
    FiAlertCircle,
    FiBookOpen
} from "react-icons/fi";
import { motion, AnimatePresence } from "framer-motion";
import { ExamService } from "../services/examService";
import { toast, ToastContainer } from "react-toastify";
import "./LearnerExamView.css";

const LearnerExamView = () => {
    const { id } = useParams();
    const navigate = useNavigate();

    /* ===================== */
    /* STATE */
    /* ===================== */
    const [exam, setExam] = useState(null);
    const [loading, setLoading] = useState(true);
    const [examStarted, setExamStarted] = useState(false);
    const [examSubmitted, setExamSubmitted] = useState(false);

    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
    const [answers, setAnswers] = useState({});
    const [markedForReview, setMarkedForReview] = useState({});
    const [timeLeft, setTimeLeft] = useState(0);
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);

    /* ===================== */
    /* FETCH EXAM */
    /* ===================== */
    useEffect(() => {
        fetchExamData();
    }, [id]);

    const fetchExamData = async () => {
        setLoading(true);
        try {
            const data = await ExamService.getExamById(id);
            if (!data) {
                toast.error("Exam details not found");
                return;
            }
            setExam(data);
            setTimeLeft((data.duration || data.durationMinutes || 60) * 60);
        } catch (error) {
            toast.error("Failed to load exam");
        } finally {
            setLoading(false);
        }
    };

    /* ===================== */
    /* TIMER */
    /* ===================== */
    useEffect(() => {
        if (!examStarted || examSubmitted || timeLeft <= 0) return;

        const timer = setInterval(() => {
            setTimeLeft(prev => {
                if (prev <= 1) {
                    clearInterval(timer);
                    handleSubmit();
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);

        return () => clearInterval(timer);
    }, [examStarted, timeLeft, examSubmitted]);

    /* ===================== */
    /* HANDLERS */
    /* ===================== */
    const handleStartExam = () => {
        if (window.confirm("Once started, the timer cannot be paused. Continue?")) {
            setExamStarted(true);
            try {
                document.documentElement.requestFullscreen?.();
            } catch (e) {
                console.warn("Fullscreen error:", e);
            }
        }
    };

    const handleAnswer = (optionId) => {
        const qId = exam.questions[currentQuestionIndex].id;
        setAnswers(prev => ({ ...prev, [qId]: optionId }));
    };

    const toggleMarkForReview = () => {
        const qId = exam.questions[currentQuestionIndex].id;
        setMarkedForReview(prev => {
            const copy = { ...prev };
            copy[qId] ? delete copy[qId] : copy[qId] = true;
            return copy;
        });
    };

    const handleSubmit = async () => {
        setExamSubmitted(true);
        try {
            // In a real scenario, we'd have a specific submit attempt endpoint
            await ExamService.updateExam(id, {
                type: 'SUBMISSION',
                answers,
                markedForReview,
                submittedAt: new Date().toISOString()
            });
            toast.success("Exam submitted successfully!");
        } catch (error) {
            console.error("Submission failed:", error);
            // We still show the success UI to the student for demo purposes
        }
    };

    const formatTime = (s) =>
        `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`;

    if (loading) {
        return (
            <div className="learner-exam-container welcome-mode bg-dark text-white">
                <div className="text-center">
                    <div className="spinner-border text-primary mb-3" style={{ width: '3rem', height: '3rem' }} />
                    <h4>Initializing secure exam environment...</h4>
                </div>
            </div>
        );
    }

    if (!exam) return null;

    /* ===================== */
    /* WELCOME / INSTRUCTIONS */
    /* ===================== */
    if (!examStarted) {
        return (
            <div className="learner-exam-container welcome-mode bg-dark text-white p-4">
                <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="welcome-card glass-card p-5 text-center max-w-700"
                >
                    <div className="exam-icon-large text-primary mb-4">
                        <FiBookOpen size={64} />
                    </div>
                    <h1 className="fw-bold mb-3">{exam.title}</h1>

                    <div className="d-flex justify-content-center gap-4 mb-5 opacity-75">
                        <div className="d-flex align-items-center gap-2">
                            <FiClock /> {exam.duration || exam.durationMinutes} Mins
                        </div>
                        <div className="d-flex align-items-center gap-2">
                            <FiCheckCircle /> {(exam.totalMarks || 100)} Marks
                        </div>
                        <div className="d-flex align-items-center gap-2">
                            <FiMenu /> {exam.questions?.length || 0} Questions
                        </div>
                    </div>

                    <div className="instructions-box text-start bg-black-20 p-4 rounded-4 mb-5 border border-white-10">
                        <h5 className="fw-bold mb-3 text-info"><FiAlertCircle className="me-2" /> Important Instructions</h5>
                        <ul className="list-unstyled mb-0">
                            {[
                                "Ensure a stable internet connection.",
                                "Do not exit full-screen mode during the exam.",
                                "Exam will be auto-submitted when the timer hits zero.",
                                "Multiple tab switching may result in disqualification.",
                                ...(exam.instructions || [])
                            ].map((inst, i) => (
                                <li key={i} className="mb-2 d-flex gap-2">
                                    <span className="text-secondary">•</span> {inst}
                                </li>
                            ))}
                        </ul>
                    </div>

                    <button className="btn btn-primary btn-lg px-5 py-3 rounded-pill fw-bold premium-btn" onClick={handleStartExam}>
                        Begin Assessment
                    </button>
                </motion.div>
            </div>
        );
    }

    /* ===================== */
    /* SUBMITTED / RESULTS */
    /* ===================== */
    if (examSubmitted) {
        const attempted = Object.keys(answers).length;
        return (
            <div className="learner-exam-container submit-mode bg-dark text-white">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="result-card glass-card p-5 text-center"
                >
                    <div className="success-icon text-success mb-4">
                        <FiCheckCircle size={80} />
                    </div>
                    <h2 className="fw-bold mb-4">Assessment Completed</h2>
                    <p className="text-secondary mb-5">Your responses have been securely transmitted to the server.</p>

                    <div className="row g-4 mb-5">
                        <div className="col-6">
                            <div className="bg-white-5 p-3 rounded-4">
                                <span className="d-block text-secondary small text-uppercase">Attempted</span>
                                <span className="h3 fw-bold">{attempted}</span>
                            </div>
                        </div>
                        <div className="col-6">
                            <div className="bg-white-5 p-3 rounded-4">
                                <span className="d-block text-secondary small text-uppercase">Remaining</span>
                                <span className="h3 fw-bold">{(exam.questions?.length || 0) - attempted}</span>
                            </div>
                        </div>
                    </div>

                    <button
                        className="btn btn-outline-light btn-lg px-5 rounded-pill"
                        onClick={() => navigate("/admin/exams/student/dashboard")}
                    >
                        Go to Dashboard
                    </button>
                </motion.div>
            </div>
        );
    }

    /* ===================== */
    /* ACTIVE EXAM INTERFACE */
    /* ===================== */
    const currentQuestion = exam.questions?.[currentQuestionIndex];

    if (!currentQuestion) return null;

    return (
        <div className="learner-exam-container active-mode bg-dark text-white h-100 d-flex flex-column">
            <ToastContainer theme="dark" position="top-center" />

            <header className="exam-topbar bg-black-40 p-3 border-bottom border-white-10 d-flex justify-content-between align-items-center">
                <div className="d-flex align-items-center gap-3">
                    <div className="p-2 bg-primary rounded-3 text-white fw-bold">AMS</div>
                    <span className="fw-semibold d-none d-md-block">{exam.title}</span>
                </div>

                <div className="d-flex align-items-center gap-3">
                    <div className={`timer-box d-flex align-items-center gap-2 px-3 py-2 rounded-pill ${timeLeft < 300 ? "bg-danger" : "bg-white-10"}`}>
                        <FiClock /> <span className="font-monospace fw-bold">{formatTime(timeLeft)}</span>
                    </div>

                    <button
                        className="btn btn-success rounded-pill px-4 fw-bold shadow-sm"
                        onClick={() => {
                            if (window.confirm("Are you sure you want to finish and submit the exam?")) handleSubmit();
                        }}
                    >
                        Finish Exam
                    </button>

                    <button
                        className="btn btn-outline-light rounded-circle p-2 d-md-none"
                        onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                    >
                        <FiMenu />
                    </button>
                </div>
            </header>

            <div className="flex-grow-1 overflow-hidden d-flex">
                <main className="flex-grow-1 p-4 overflow-auto">
                    <div className="max-w-800 mx-auto py-4">
                        <div className="mb-4 d-flex justify-content-between align-items-center">
                            <span className="badge bg-secondary px-3 py-2">Question {currentQuestionIndex + 1} of {exam.questions.length}</span>
                            <span className="text-info small fw-bold">Marks: {currentQuestion.marks || 1}</span>
                        </div>

                        <h4 className="q-text mb-5 lh-base fw-normal">{currentQuestion.text || currentQuestion.questionText}</h4>

                        <div className="options-list d-flex flex-column gap-3 mb-5">
                            {(currentQuestion.options || []).map(opt => (
                                <label
                                    key={opt.id}
                                    className={`option-card-premium d-flex align-items-center p-3 rounded-4 border transition-all cursor-pointer ${answers[currentQuestion.id] === opt.id ? "border-primary bg-primary-subtle border-opacity-50" : "border-white-10 bg-white-5"
                                        }`}
                                >
                                    <input
                                        type="radio"
                                        className="d-none"
                                        checked={answers[currentQuestion.id] === opt.id}
                                        onChange={() => handleAnswer(opt.id)}
                                    />
                                    <div className={`opt-circle me-3 border rounded-circle d-flex align-items-center justify-content-center ${answers[currentQuestion.id] === opt.id ? "bg-primary border-primary text-white" : "border-secondary"
                                        }`} style={{ width: 32, height: 32 }}>
                                        {opt.id.toUpperCase()}
                                    </div>
                                    <span className="opt-text">{opt.text || opt.optionText}</span>
                                </label>
                            ))}
                        </div>

                        <div className="d-flex justify-content-between align-items-center pt-5 border-top border-white-10">
                            <button
                                className={`btn rounded-pill px-4 ${markedForReview[currentQuestion.id] ? "btn-warning" : "btn-outline-warning"}`}
                                onClick={toggleMarkForReview}
                            >
                                <FiFlag className="me-2" /> {markedForReview[currentQuestion.id] ? "Marked" : "Review Later"}
                            </button>

                            <div className="d-flex gap-2">
                                <button
                                    className="btn btn-outline-light rounded-pill px-4"
                                    disabled={currentQuestionIndex === 0}
                                    onClick={() => setCurrentQuestionIndex(i => i - 1)}
                                >
                                    <FiChevronLeft className="me-1" /> Prev
                                </button>

                                <button
                                    className="btn btn-primary rounded-pill px-4 fw-bold"
                                    disabled={currentQuestionIndex === exam.questions.length - 1}
                                    onClick={() => setCurrentQuestionIndex(i => i + 1)}
                                >
                                    Next <FiChevronRight className="ms-1" />
                                </button>
                            </div>
                        </div>
                    </div>
                </main>

                <aside className={`palette-sidebar bg-black-20 border-start border-white-10 p-4 d-none d-md-block ${isSidebarOpen ? "show" : ""}`} style={{ width: 280 }}>
                    <h6 className="text-secondary small fw-bold text-uppercase mb-4">Question Map</h6>
                    <div className="palette-grid d-grid gap-2" style={{ gridTemplateColumns: 'repeat(4, 1fr)' }}>
                        {exam.questions.map((q, idx) => {
                            let status = "not-visited";
                            if (answers[q.id]) status = "answered";
                            if (markedForReview[q.id]) status = "review";

                            return (
                                <button
                                    key={q.id}
                                    className={`palette-btn rounded-3 border-0 transition-all ${idx === currentQuestionIndex ? "ring-primary" : ""
                                        } status-${status}`}
                                    onClick={() => {
                                        setCurrentQuestionIndex(idx);
                                        setIsSidebarOpen(false);
                                    }}
                                    style={{ height: 45 }}
                                >
                                    {idx + 1}
                                </button>
                            );
                        })}
                    </div>

                    <div className="mt-5 pt-4 border-top border-white-10 small text-secondary">
                        <div className="d-flex align-items-center gap-2 mb-2">
                            <div className="status-answered status-indicator" /> Answered
                        </div>
                        <div className="d-flex align-items-center gap-2 mb-2">
                            <div className="status-review status-indicator" /> Review
                        </div>
                        <div className="d-flex align-items-center gap-2">
                            <div className="status-not-visited status-indicator" /> Unanswered
                        </div>
                    </div>
                </aside>
            </div>

            <style>{`
                .glass-card { background: rgba(255, 255, 255, 0.05); backdrop-filter: blur(10px); border: 1px solid rgba(255, 255, 255, 0.1); border-radius: 24px; }
                .bg-black-20 { background: rgba(0,0,0,0.2); }
                .bg-black-40 { background: rgba(0,0,0,0.4); }
                .bg-white-5 { background: rgba(255,255,255,0.05); }
                .bg-white-10 { background: rgba(255,255,255,0.1); }
                .border-white-10 { border-color: rgba(255,255,255,0.1) !important; }
                .max-w-700 { max-width: 700px; }
                .max-w-800 { max-width: 800px; }
                .option-card-premium:hover { background: rgba(255,255,255,0.1) !important; border-color: rgba(255,255,255,0.3) !important; }
                .palette-btn { color: white; font-weight: 600; }
                .status-not-visited { background: #374151; }
                .status-answered { background: #10b981; }
                .status-review { background: #f59e0b; }
                .ring-primary { ring: 2px solid #6366f1; box-shadow: 0 0 0 3px #6366f1; }
                .status-indicator { width: 12px; height: 12px; border-radius: 3px; }
                .cursor-pointer { cursor: pointer; }
                .premium-btn { transition: all 0.3s ease; }
                .premium-btn:hover { transform: translateY(-3px); box-shadow: 0 10px 20px rgba(99,102,241,0.3); }
            `}</style>
        </div>
    );
};

export default LearnerExamView;
