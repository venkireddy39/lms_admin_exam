import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { toast } from 'react-toastify';

import { examService } from "../services/examService";
import { useAuth } from '../../Library/context/AuthContext';

// Extracted Components
import ExamHeader from './components/ExamHeader';
import SectionSelector from './components/SectionSelector';
import QuestionArea from './components/QuestionArea';
import SidebarPalette from './components/SidebarPalette';
import SectionTransitionModal from './components/SectionTransitionModal';
import InstructionView from './components/InstructionView';

import './MNCExamView.css';

const MNCExamView = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const location = useLocation();
    const { user } = useAuth();

    // --- Core State ---
    const [examData, setExamData] = useState(null);
    const [sections, setSections] = useState([]);
    const [activeSectionId, setActiveSectionId] = useState(null);
    const [currentQIndex, setCurrentQIndex] = useState(0);

    const [answers, setAnswers] = useState({});
    const [statusMap, setStatusMap] = useState({});
    const [timeLeft, setTimeLeft] = useState(0);
    const [isInstructionMode, setIsInstructionMode] = useState(true);
    const [agreed, setAgreed] = useState(false);

    const [showSectionTransition, setShowSectionTransition] = useState(false);
    const [nextSectionToStart, setNextSectionToStart] = useState(null);

    // --- Execution State ---
    const [executing, setExecuting] = useState(false);
    const [executionResults, setExecutionResults] = useState(null);
    const [attemptId, setAttemptId] = useState(null);

    const isPreview = useMemo(() => {
        return id === "PREVIEW" ||
            String(id).toLowerCase().includes("preview") ||
            location.pathname.toLowerCase().includes("preview") ||
            location.pathname.toLowerCase().includes("simulation");
    }, [id, location]);

    // --- Memoized Values ---
    const activeSection = useMemo(() =>
        sections.find(s => s.id === activeSectionId) || sections[0]
        , [sections, activeSectionId]);

    const currentQ = useMemo(() =>
        activeSection?.questions[currentQIndex]
        , [activeSection, currentQIndex]);

    // --- Fetch Data ---
    useEffect(() => {
        const loadInitialData = async () => {
            let loadedExam = null;

            if (examService.isValidId(id)) {
                try {
                    const [incoming, settingsData, fetchedQuestions] = await Promise.all([
                        examService.getExamById(id),
                        examService.getExamSettings(id).catch(() => ({})),
                        examService.getExamQuestions(id).catch(() => [])
                    ]);

                    if (incoming) {
                        const rawQuestions = (Array.isArray(fetchedQuestions) && fetchedQuestions.length > 0)
                            ? fetchedQuestions
                            : (incoming.questions || []);

                        const transformedQuestions = await Promise.all(rawQuestions.map(async (q, idx) => {
                            const qType = (q.type || q.questionType || "mcq").toLowerCase();
                            let testCases = [];
                            if (qType === 'coding') {
                                try {
                                    const tcs = await examService.getTestCases(q.id || q.questionId);
                                    testCases = Array.isArray(tcs) ? tcs : [];
                                } catch (e) { }
                            } else {
                                testCases = q.testCases || q.codingTestCases || [];
                            }

                            return {
                                id: q.id || q.questionId || idx + 1,
                                text: q.question || q.text || q.questionText || "Untitled Question",
                                type: qType,
                                starterCode: q.starterCode || q.code || "",
                                language: q.language || q.programmingLanguage || 'javascript',
                                testCases: testCases.map(tc => ({
                                    id: tc.testCaseId || tc.id,
                                    input: tc.input || tc.inputData || "",
                                    output: tc.output || tc.expectedOutput || "",
                                    hidden: tc.hidden || false
                                })),
                                options: q.options ? q.options.map((opt, oIdx) => ({
                                    id: opt.optionId || opt.id || String.fromCharCode(65 + oIdx),
                                    text: opt.optionText || opt.text || opt
                                })) : [],
                                marks: q.marks || 1,
                                negative: settingsData?.negativeMarking ? (settingsData.negativeMarkingPenalty || 0) : 0
                            };
                        }));

                        loadedExam = {
                            id: incoming.id || id,
                            title: incoming.title || "Exam Paper",
                            candidateName: user?.name || user?.username || "Candidate",
                            durationMinutes: incoming.duration || incoming.durationMinutes || 60,
                            questions: transformedQuestions,
                            instructions: incoming.instructions,
                            sections: incoming.sections
                        };
                    }
                } catch (error) {
                    console.error("Failed to fetch MNC exam data:", error);
                    toast.error("Failed to load exam. Please check your connection.");
                }
            } else if (location.state?.examData) {
                // Preview Fallback
                const incoming = location.state.examData;
                const transformedQuestions = (incoming.questions || []).map((q, idx) => ({
                    id: idx + 1,
                    text: q.question,
                    type: q.type,
                    starterCode: q.starterCode,
                    language: q.language || 'javascript',
                    testCases: q.testCases || [],
                    options: q.options ? q.options.map((opt, oIdx) => ({
                        id: String.fromCharCode(65 + oIdx),
                        text: typeof opt === 'string' ? opt : (opt.text || ""),
                        image: typeof opt === 'object' ? (opt.image || opt.optionImage) : null
                    })) : [],
                    marks: q.marks || 1,
                    negative: incoming.settings?.negativeMarking ? (incoming.settings.negativeMarkingPenalty || 0) : 0
                }));

                loadedExam = {
                    id: "PREVIEW",
                    title: incoming.title || "Exam Preview",
                    candidateName: user?.name || "Preview Candidate",
                    durationMinutes: incoming.duration || 60,
                    questions: transformedQuestions,
                    instructions: incoming.instructions,
                    sections: incoming.sections
                };
            }

            if (!loadedExam) return;

            setExamData(loadedExam);
            setTimeLeft(loadedExam.durationMinutes * 60);

            // Build sections
            const sectionArray = (loadedExam.sections && loadedExam.sections.length > 0)
                ? loadedExam.sections.map((section, idx) => {
                    const isString = typeof section === 'string';
                    return {
                        id: (isString ? `sec-${idx}` : section.id) || `sec-${idx}`,
                        name: (isString ? section : section.title) || `Section ${idx + 1}`,
                        questions: (isString ? loadedExam.questions : (section.questionIds || []).map(qIdx => loadedExam.questions[qIdx])).filter(Boolean)
                    };
                })
                : [{ id: 'sec-0', name: 'Main Section', questions: loadedExam.questions }];

            setSections(sectionArray);
            setActiveSectionId(sectionArray[0]?.id);

            const initialStatus = {};
            loadedExam.questions.forEach(q => { initialStatus[q.id] = 'not-visited'; });
            setStatusMap(initialStatus);
        };

        loadInitialData();
    }, [id, location.state, user]);

    // --- Coding Test Case Fetcher (No Mutation) ---
    useEffect(() => {
        if (currentQ?.type === 'coding' && (!currentQ.testCases || currentQ.testCases.length === 0)) {
            const fetchTC = async () => {
                try {
                    const tcs = await examService.getTestCases(currentQ.id);
                    if (Array.isArray(tcs)) {
                        const mapped = tcs.map(tc => ({
                            id: tc.testCaseId || tc.id,
                            input: tc.inputData,
                            output: tc.expectedOutput,
                            hidden: tc.hidden
                        }));
                        // Update sections immutably
                        setSections(prev => prev.map(sec => ({
                            ...sec,
                            questions: sec.questions.map(q => q.id === currentQ.id ? { ...q, testCases: mapped } : q)
                        })));
                    }
                } catch (e) { console.warn("TC fetch failed", e); }
            };
            fetchTC();
        }
    }, [currentQ]);

    // --- Timer ---
    useEffect(() => {
        if (isInstructionMode || timeLeft <= 0) return;
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
    }, [isInstructionMode, timeLeft]);

    // --- Status Tracker ---
    useEffect(() => {
        if (isInstructionMode || !currentQ) return;
        setStatusMap(prev => {
            if (prev[currentQ.id] === 'not-visited') {
                return { ...prev, [currentQ.id]: 'not-answered' };
            }
            return prev;
        });
    }, [currentQ, isInstructionMode]);

    // --- Handlers ---
    const formatTime = (seconds) => {
        const h = Math.floor(seconds / 3600);
        const m = Math.floor((seconds % 3600) / 60);
        const s = seconds % 60;
        return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
    };

    const handleStartExam = async () => {
        if (!agreed) return;

        // Skip backend session init for PREVIEW mode/Simulation
        if (isPreview) {
            if (document.documentElement.requestFullscreen) {
                document.documentElement.requestFullscreen().catch(() => { });
            }
            setAttemptId("SIMULATION_ID");
            setIsInstructionMode(false);
            return;
        }

        try {
            const userId = user?.id || user?.userId || null;
            if (!userId) {
                toast.error("User session not found. Please log in again.");
                return;
            }
            const attempt = await examService.startExamAttempt(examData.id, userId);
            if (attempt?.attemptId || attempt?.id) {
                setAttemptId(attempt.attemptId || attempt.id);
                toast.success("Exam started successfully.");
            } else {
                throw new Error("Invalid response from server.");
            }
        } catch (e) {
            console.error("Session init failed", e);
            toast.error(e.message || "Failed to start exam session.");
            return;
        }

        if (document.documentElement.requestFullscreen) {
            document.documentElement.requestFullscreen().catch(() => { });
        }
        setIsInstructionMode(false);
    };

    const handleAnswerChange = (val) => {
        setAnswers(prev => ({ ...prev, [currentQ.id]: val }));
    };

    const handleSaveAndNext = async () => {
        const answer = answers[currentQ.id];

        // --- Validation ---
        if (answer === undefined || answer === null || (typeof answer === 'string' && answer.trim() === '')) {
            toast.warning("Please provide an answer before saving.");
            return;
        }

        if (attemptId) {
            // Mock for Simulation
            if (attemptId === "SIMULATION_ID") {
                setStatusMap(prev => ({ ...prev, [currentQ.id]: 'answered' }));
                moveToNext();
                return;
            }

            try {
                const payload = {
                    examQuestionId: currentQ.id,
                    selectedOptionId: (currentQ.type === 'mcq' || currentQ.type === 'quiz') ? answer : null,
                    descriptiveAnswer: ['descriptive', 'short', 'long', 'fill'].includes(currentQ.type) ? answer : null,
                    codingSubmissionCode: currentQ.type === 'coding' ? answer : null
                };

                await examService.saveExamResponse(attemptId, payload);
                setStatusMap(prev => ({ ...prev, [currentQ.id]: 'answered' }));
                moveToNext();
            } catch (e) {
                console.error("Save failed", e);
                toast.error("Failed to save answer. " + (e.message || ""));
            }
        } else {
            toast.error("No active session found.");
        }
    };

    const handleMarkForReview = () => {
        const answer = answers[currentQ.id];
        setStatusMap(prev => ({ ...prev, [currentQ.id]: answer ? 'marked-answered' : 'marked' }));
        moveToNext();
    };

    const handleClearResponse = () => {
        setAnswers(prev => {
            const next = { ...prev };
            delete next[currentQ.id];
            return next;
        });
        setStatusMap(prev => ({ ...prev, [currentQ.id]: 'not-answered' }));
    };

    const moveToNext = () => {
        if (currentQIndex < activeSection.questions.length - 1) {
            setCurrentQIndex(prev => prev + 1);
        } else {
            const currentSecIdx = sections.findIndex(s => s.id === activeSectionId);
            if (currentSecIdx < sections.length - 1) {
                setNextSectionToStart(sections[currentSecIdx + 1]);
                setShowSectionTransition(true);
            } else {
                toast.info("End of final section reached.");
            }
        }
    };

    const handleRunCode = async () => {
        if (!currentQ || !attemptId || executing) return;

        const code = answers[currentQ.id] || currentQ.starterCode;

        // --- Validation ---
        if (!code || code.trim() === "") {
            toast.warning("Please enter some code before running.");
            return;
        }

        setExecuting(true);
        setExecutionResults(null);

        // Mock Execution for Simulation
        if (attemptId === "SIMULATION_ID") {
            setTimeout(() => {
                const mockResults = (currentQ.testCases || []).map((tc, i) => ({
                    input: tc.input || "Sample Input",
                    expected: tc.output || "Sample Output",
                    actual: tc.output || "Sample Output",
                    passed: true
                }));

                if (mockResults.length === 0) {
                    mockResults.push({ input: "Default", expected: "Output", actual: "Output", passed: true });
                }

                setExecutionResults({ results: mockResults, allPassed: true });
                setExecuting(false);
                toast.success("Preview Code Execution Successful");
            }, 1500);
            return;
        }

        try {
            const payload = {
                examQuestionId: currentQ.id,
                codingSubmissionCode: code
            };
            const saved = await examService.saveExamResponse(attemptId, payload);

            if (saved?.responseId) {
                await examService.runCodingSubmission(saved.responseId);
                pollExecution(saved.responseId);
            } else {
                throw new Error("Failed to initialize execution context.");
            }
        } catch (e) {
            setExecuting(false);
            console.error("Run code failed", e);
            toast.error(e.message || "Code execution trigger failed.");
        }
    };

    const pollExecution = async (responseId, attempts = 0) => {
        if (attempts > 10) {
            setExecuting(false);
            toast.error("Execution timed out.");
            return;
        }
        try {
            const results = await examService.getCodingExecutionResults(responseId);
            if (results?.length > 0) {
                const uiResults = results.map(r => {
                    const tc = currentQ.testCases?.find(t => String(t.id) === String(r.testCaseId));
                    return {
                        input: tc?.input || "Hidden",
                        expected: tc?.output || "Hidden",
                        actual: r.actualOutput || r.errorMessage || "No Output",
                        passed: r.passed
                    };
                });
                setExecutionResults({ results: uiResults, allPassed: results.every(r => r.passed) });
                setExecuting(false);
            } else {
                setTimeout(() => pollExecution(responseId, attempts + 1), 1000);
            }
        } catch (e) {
            setExecuting(false);
        }
    };

    const handleSubmit = async () => {
        if (!attemptId) {
            toast.error("No active session found.");
            return;
        }

        // --- Question requirements validation ---
        const answeredCount = Object.values(statusMap).filter(s => s === 'answered' || s === 'marked-answered').length;
        if (answeredCount === 0) {
            const confirm = window.confirm("You haven't answered any questions. Are you sure you want to submit?");
            if (!confirm) return;
        }

        try {
            if (attemptId === "SIMULATION_ID") {
                toast.success("Simulation Submitted Successfully (Mock)!");
                if (document.fullscreenElement) {
                    document.exitFullscreen().catch(() => { });
                }
                setTimeout(() => navigate('/admin/exams/dashboard'), 1500);
                return;
            }

            await examService.submitExamAttempt(examData.id, attemptId);
            toast.success("Exam Submitted Successfully!");

            if (document.fullscreenElement) {
                document.exitFullscreen().catch(() => { });
            }
            navigate('/admin/exams/dashboard');
        } catch (e) {
            console.error("Submit failed", e);
            toast.error(e.message || "Failed to submit exam.");
        }
    };

    // --- UI Calculations ---
    const counts = useMemo(() => {
        const c = { answered: 0, notAnswered: 0, notVisited: 0, marked: 0, markedAnswered: 0 };
        Object.values(statusMap).forEach(s => { if (c[s] !== undefined) c[s]++; });
        // Correcting map keys if they don't match exactly
        c.notAnswered = Object.values(statusMap).filter(s => s === 'not-answered').length;
        c.notVisited = Object.values(statusMap).filter(s => s === 'not-visited').length;
        return c;
    }, [statusMap]);

    if (!examData) return <div className="p-5 text-center">Loading MNC Exam Simulation...</div>;

    if (isInstructionMode) {
        return (
            <InstructionView
                examData={examData}
                agreed={agreed}
                setAgreed={setAgreed}
                onStart={handleStartExam}
            />
        );
    }

    return (
        <div className="mnc-container">
            <ExamHeader
                examTitle={examData.title}
                timeLeft={timeLeft}
                formatTime={formatTime}
                onShowInstructions={() => setIsInstructionMode(true)}
                onViewQuestionPaper={() => window.open(`/admin/exams/full-paper/${examData.id}`, '_blank')}
            />

            <div className="mnc-layout">
                <QuestionArea
                    currentQIndex={currentQIndex}
                    currentQ={currentQ}
                    activeSection={activeSection}
                    answers={answers}
                    onAnswerChange={handleAnswerChange}
                    onRunCode={handleRunCode}
                    executing={executing}
                    executionResults={executionResults}
                    testCases={currentQ?.testCases}
                    onMarkForReview={handleMarkForReview}
                    onClearResponse={handleClearResponse}
                    onSaveAndNext={handleSaveAndNext}
                />

                <SidebarPalette
                    candidateName={examData.candidateName}
                    counts={counts}
                    activeSection={activeSection}
                    statusMap={statusMap}
                    currentQIndex={currentQIndex}
                    onSelectQuestion={setCurrentQIndex}
                    onSubmit={handleSubmit}
                />
            </div>

            <SectionTransitionModal
                show={showSectionTransition}
                completedSectionName={activeSection?.name}
                nextSectionName={nextSectionToStart?.name}
                onContinue={() => {
                    setActiveSectionId(nextSectionToStart.id);
                    setCurrentQIndex(0);
                    setShowSectionTransition(false);
                    setNextSectionToStart(null);
                }}
            />
        </div>
    );
};

export default MNCExamView;
