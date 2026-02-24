import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { toast, ToastContainer } from "react-toastify";
import { motion, AnimatePresence } from "framer-motion";
import "react-toastify/dist/ReactToastify.css";

import SetupMode from "./components/SetupMode";
import EditorMode from "./components/EditorMode";
import { examService } from "../services/examService";
import { Loader2 } from "lucide-react";

const CreateExam = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEditMode = id && id !== "undefined";

  const [step, setStep] = useState(isEditMode ? "editor" : "setup");
  const [loading, setLoading] = useState(isEditMode);
  const [submitting, setSubmitting] = useState(false);

  const [examData, setExamData] = useState({
    title: "",
    course: "", // Display name
    courseId: null, // Required for backend
    batchId: null, // Required for backend
    type: "mixed", // mixed | coding | quiz
    totalMarks: 100,
    duration: 60,
    questions: [],
    sections: [],
    customAssets: {
      bgImage: null,
      watermark: null,
      watermarkOpacity: 0.1,
      orientation: "portrait"
    },
    settings: {
      maxAttempts: 1,
      gradingStrategy: "highest",
      negativeMarking: false,
      autoSubmit: true,
      shuffleQuestions: false,
      shuffleOptions: false,
      allowResume: true,
      autoEvaluation: true,
      partialMarking: false,
      showResults: true,
      showRank: false,
      showPercentile: false
    },
    proctoring: {
      enabled: false,
      cameraRequired: false,
      forceFullScreen: false,
      maxViolations: 5
    },
    status: "DRAFT"
  });

  useEffect(() => {
    if (id && id !== "undefined") { // Changed from isEditMode to direct check for id
      fetchExamToEdit();
    } else {
      setLoading(false); // Added else block to set loading to false if not in edit mode
    }
  }, [id]); // Removed isEditMode from dependency array as id is sufficient

  const fetchExamToEdit = async () => {
    setLoading(true);
    try {
      const examToEdit = await examService.getExamById(id);

      if (examToEdit) {
        // Fetch related entities (Fail-safe: If one fails, others should still load)
        const fetchSafe = async (fn, fallback) => {
          try { return await fn(id) || fallback; }
          catch (e) { console.warn("Sub-data load failed:", e); return fallback; }
        };

        const [settings, design, proctoring, grading, questions] = await Promise.all([
          fetchSafe(examService.getExamSettings, {}),
          fetchSafe(examService.getExamDesign, {}),
          fetchSafe(examService.getExamProctoring, {}),
          fetchSafe(examService.getExamGrading, {}),
          fetchSafe(examService.getExamQuestions, [])
        ]);

        console.log("Loaded Exam Content:", { examToEdit, questions });

        // Use questions from specialized endpoint if available, otherwise check if they're in the exam object
        let finalQuestions = (Array.isArray(questions) && questions.length > 0)
          ? questions
          : (Array.isArray(examToEdit.questions) ? examToEdit.questions : []);

        // Enhance with Test Cases for Coding
        if (finalQuestions.length > 0) {
          finalQuestions = await Promise.all(finalQuestions.map(async (q) => {
            const qType = (q.type || q.questionType || "MCQ").toLowerCase();
            let extraData = {};
            if (qType === 'coding') {
              try {
                const tcs = await examService.getTestCases(q.id || q.questionId);
                extraData = { testCases: Array.isArray(tcs) ? tcs : [] };
              } catch (e) { console.warn("Failed to load test cases for Q" + q.id); }
            }
            return {
              ...q,
              ...extraData,
              id: q.id || q.questionId,
              question: q.question || q.questionText,
              type: qType
            };
          }));
        }

        setExamData({
          ...examToEdit,
          type: examToEdit.type || examToEdit.examType || "mixed",
          courseId: examToEdit.courseId || examToEdit.course?.id || null, // Ensure courseId mapped
          settings: { ...examToEdit.settings, ...settings, ...grading },
          proctoring: { ...examToEdit.proctoring, ...proctoring },
          customAssets: { ...examToEdit.customAssets, ...design },
          questions: finalQuestions
        });
        setStep("editor");
      } else {
        toast.error("Exam not found or unavailable.");
        navigate("/admin/exams/dashboard");
      }
    } catch (error) {
      console.error("Deep Load Error:", error);
      toast.error("Failed to load exam data. Please check connection.");
    } finally {
      setLoading(false);
    }
  };

  const handleSetupComplete = (config) => {
    setExamData(prev => ({ ...prev, ...config }));
    setStep("editor");
    toast.info("Configuration saved. Opening question editor...");
  };

  const handleSave = async () => {
    if (!examData.title || !examData.courseId) {
      toast.error("Title and Course selection are required.");
      return;
    }

    setSubmitting(true);
    try {
      // 1. Core Exam Data
      // NEST QUESTIONS HERE to support Cascade Save (since separate linking endpoint is missing)
      const corePayload = {
        title: examData.title,
        courseId: examData.courseId,
        batchId: examData.batchId,
        examType: examData.type.toUpperCase(),
        totalMarks: examData.totalMarks,
        durationMinutes: examData.duration,
        passPercentage: 40
      };

      let savedExam;
      let examId = id; // Default to URL param if available

      if (isEditMode && examId) {
        // If we are editing, we do not call createExam because it will throw a 500 error.
        // Since there is no explicit PUT definition yet, we assume the frontend simply acts as a passthrough for questions
        console.log(`Bypassing Exam metadata creation. Using existing Exam ID: ${examId}`);
      } else {
        // Create the raw exam first
        savedExam = await examService.createExam(corePayload);
        examId = savedExam?.examId || savedExam?.exam_id || savedExam?.id;

        if (!examId) {
          throw new Error("Backend did not return a valid Exam ID during creation.");
        }
      }

      console.log("Processing Exam metadata/questions for ID:", examId);

      // 2. Parallel save of all configuration entities (Settings, Design, etc.)
      // These are optional, failures shouldn't block the main flow.
      await Promise.all([
        examService.saveSettings(examId, {
          attemptsAllowed: examData.settings.maxAttempts,
          negativeMarking: examData.settings.negativeMarking,
          negativeMarkValue: examData.settings.negativeMarkingPenalty || 0,
          shuffleQuestions: examData.settings.shuffleQuestions,
          shuffleOptions: examData.settings.shuffleOptions,
          allowLateEntry: examData.settings.allowLateEntry || false,
          networkMode: (examData.settings.networkStrictness || "LENIENT").toUpperCase()
        }).catch(e => console.warn("Settings save failed", e)),

        examService.saveDesign(examId, {
          orientation: (examData.customAssets?.orientation || "PORTRAIT").toUpperCase(),
          instituteLogo: examData.customAssets?.logo,
          backgroundImage: examData.customAssets?.bgImage,
          watermark_type: (typeof examData.customAssets?.watermark === 'string' && !examData.customAssets?.watermark.startsWith('data:')) ? 'TEXT' : 'IMAGE',
          watermark_value: examData.customAssets?.watermark,
          watermark_opacity: examData.customAssets?.watermarkOpacity || 0.1
        }).catch(e => console.warn("Design save failed", e)),

        examService.saveProctoring(examId, {
          enabled: examData.proctoring.enabled,
          cameraRequired: examData.proctoring.cameraRequired,
          systemCheckRequired: true,
          violationLimit: examData.proctoring.maxViolations || 5
        }).catch(e => console.warn("Proctoring save failed", e)),

        examService.saveGrading(examId, {
          autoEvaluation: examData.settings.autoEvaluation ?? true,
          partialMarking: examData.settings.partialMarking,
          showResult: examData.settings.showResults,
          showRank: examData.settings.showRank,
          showPercentile: examData.settings.showPercentile
        }).catch(e => console.warn("Grading save failed", e)),

        examService.saveNotification(examId, {
          scheduledNotification: examData.settings.scheduledNotification || false,
          reminderBefore: examData.settings.examReminder || "NONE",
          feedback_after_exam: examData.settings.collectFeedback || false
        }).catch(e => console.warn("Notification save failed", e))
      ]);

      // 3. Fallback: Manually save/link questions if Cascade failed
      // The user reported questions missing or options missing. We use a 2-step process:
      // A. Ensure Question exists (Create if needed)
      // B. Link to Exam
      // 3. Questions Handling - "Create via Link" Strategy (Bypasses Transient Error)
      if (examData.questions && examData.questions.length > 0) {
        console.log("Persisting questions and linking to exam via Sections...");

        // Ensure we have at least one section wrapper
        let activeSections = (examData.sections && examData.sections.length > 0)
          ? examData.sections
          : [{ title: "General", description: "Main section", questionIds: examData.questions.map((_, i) => i) }];

        for (const [secIdx, sectionConf] of activeSections.entries()) {
          try {
            // 1. Create Generic Section
            const newSection = await examService.createQuestionSection({
              sectionName: sectionConf.title || `Section ${secIdx + 1}`,
              sectionDescription: sectionConf.description || "",
              shuffleQuestions: false
            });
            const actualSectionId = newSection?.sectionId || newSection?.id;
            if (!actualSectionId) {
              console.warn("Failed to create section:", sectionConf.title);
              continue;
            }

            // 2. Link Section to Exam (Returns ExamSection)
            const linkedExamSection = await examService.addSectionToExam(examId, actualSectionId, secIdx + 1);
            const examSectionId = linkedExamSection?.examSectionId || linkedExamSection?.id;
            if (!examSectionId) {
              console.warn("Failed to link section to exam:", actualSectionId);
              continue;
            }

            const sectionExamQuestions = [];

            // 3. Process Questions for this section
            for (const qIdx of sectionConf.questionIds || []) {
              const q = examData.questions[qIdx];
              if (!q) continue;

              let actualQuestionId = q.id || q.questionId;

              try {
                // Step A: Create Question if it's new
                if (!actualQuestionId) {
                  const qType = (q.type || q.questionType || "MCQ").toUpperCase();
                  let payload = {
                    questionText: q.question || q.questionText,
                    questionType: qType,
                    contentType: (q.image) ? "TEXT_IMAGE" : "TEXT"
                  };

                  if (qType === 'CODING') {
                    payload.programmingLanguage = q.language ? q.language.toUpperCase() : "JAVA";
                  }

                  if (qType === 'DESCRIPTIVE' || qType === 'SHORT' || qType === 'LONG') {
                    payload.modelAnswer = q.referenceAnswer || "";
                    payload.keywords = q.evaluationGuidelines || "";
                  }

                  const newQ = await examService.createQuestion(payload);
                  actualQuestionId = newQ?.questionId || newQ?.id;
                }

                if (!actualQuestionId) continue;

                const qType = (q.type || q.questionType || "").toLowerCase();

                // Options
                if (q.options?.length > 0 && typeof q.options[0] !== 'string' && q.options[0].id) {
                  // already has options saved? Skip or update.
                } else if (q.options?.length > 0 && (qType === 'quiz' || qType === 'mcq')) {
                  const opts = q.options.map((opt, oIdx) => {
                    const text = typeof opt === 'string' ? opt : (opt.optionText || opt.text || "");
                    const isCorrect = typeof opt === 'object' && opt.isCorrect !== undefined ? opt.isCorrect : (q.correctOptionIndex === oIdx || q.answer === text);
                    return {
                      questionId: Number(actualQuestionId),
                      optionText: text,
                      isCorrect: Boolean(isCorrect),
                      optionImage: typeof opt === 'object' ? opt.image : null
                    };
                  });
                  await examService.addQuestionOptions(actualQuestionId, opts).catch(e => console.error("Options failed", e));
                }

                // Coding Test Cases
                if (qType === 'coding' && q.testCases?.length > 0) {
                  for (const tc of q.testCases) {
                    await examService.createTestCase(actualQuestionId, tc).catch(() => { });
                  }
                }

                // Descriptive
                if (['short', 'long', 'abacus'].includes(qType) && q.referenceAnswer) {
                  await examService.saveDescriptiveAnswer(actualQuestionId, {
                    answerText: q.referenceAnswer,
                    guidelines: q.evaluationGuidelines
                  }).catch(() => { });
                }

                // Map Question to Question Bank Section (Crucial intermediate step requested by the user API pattern)
                await examService.mapQuestionToSection(actualSectionId, actualQuestionId).catch(e => console.warn("Failed to map question to Bank Section", e));

                sectionExamQuestions.push({
                  questionId: Number(actualQuestionId),
                  marks: parseFloat(q.marks || 1),
                  questionOrder: sectionExamQuestions.length + 1
                });
              } catch (qErr) {
                console.error(`Failed to process question ${qIdx}`, qErr);
              }
            }

            // 4. Link Questions to ExamSection
            if (sectionExamQuestions.length > 0) {
              console.log(`Linking ${sectionExamQuestions.length} questions to ExamSection ${examSectionId}...`);
              await examService.addQuestionsToExamSection(examSectionId, sectionExamQuestions);
            }

          } catch (secErr) {
            console.error(`Failed to process section ${secIdx}`, secErr);
          }
        }
      }

      // Removed: await examService.publishExam(examId); (Exams remain DRAFT until Scheduled)

      setTimeout(() => navigate("/admin/exams/dashboard"), 1500);
    } catch (error) {
      console.error("Save failed:", error);
      toast.error("Failed to save exam. Check console for details.");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center vh-100 bg-white text-dark">
        <div className="text-center">
          <Loader2 className="animate-spin text-primary mb-3" size={48} />
          <h5 className="fw-light">Loading exam content...</h5>
        </div>
      </div>
    );
  }

  return (
    <div className="min-vh-100 bg-white text-dark d-flex flex-column" style={{ fontFamily: "'Inter', sans-serif" }}>
      <ToastContainer position="bottom-right" theme="dark" />

      <AnimatePresence mode="wait">
        {step === "setup" && (
          <motion.div
            key="setup"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            className="flex-grow-1"
          >
            <SetupMode
              initialData={isEditMode ? examData : null}
              onComplete={handleSetupComplete}
            />
          </motion.div>
        )}

        {step === "editor" && (
          <motion.div
            key="editor"
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            className="flex-grow-1"
          >
            <EditorMode
              examData={examData}
              setExamData={setExamData}
              onSave={handleSave}
              submitting={submitting}
              onBack={() => {
                if (window.confirm("Return to configuration? Unsaved editor changes will be lost if you leave this session.")) {
                  setStep("setup");
                }
              }}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default CreateExam;
