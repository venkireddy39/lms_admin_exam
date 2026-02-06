import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { toast, ToastContainer } from "react-toastify";
import { motion, AnimatePresence } from "framer-motion";
import "react-toastify/dist/ReactToastify.css";

import SetupMode from "./components/SetupMode";
import EditorMode from "./components/EditorMode";
import PreviewMode from "./components/PreviewMode";
import { ExamService } from "../services/examService";
import { ExamSettingsService } from "../services/examSettingsService";
import { QuestionService } from "../services/questionService";
import { Loader2 } from "lucide-react";

const CreateExam = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEditMode = !!id;

  const [step, setStep] = useState(isEditMode ? "editor" : "setup");
  const [showPreview, setShowPreview] = useState(false);
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
    if (isEditMode) {
      fetchExamToEdit();
    }
  }, [id, isEditMode]);

  const fetchExamToEdit = async () => {
    setLoading(true);
    try {
      const examToEdit = await ExamService.getExamById(id);

      if (examToEdit) {
        // Fetch related entities (Fail-safe: If one fails, others should still load)
        const fetchSafe = async (fn, fallback) => {
          try { return await fn(id) || fallback; }
          catch (e) { console.warn("Sub-data load failed:", e); return fallback; }
        };

        const [settings, design, proctoring, grading, questions] = await Promise.all([
          fetchSafe(ExamService.getExamSettings, {}),
          fetchSafe(ExamService.getExamDesign, {}),
          fetchSafe(ExamService.getExamProctoring, {}),
          fetchSafe(ExamService.getExamGrading, {}),
          fetchSafe(ExamService.getExamQuestions, [])
        ]);

        console.log("Loaded Exam Content:", { examToEdit, questions });

        setExamData({
          ...examToEdit,
          settings: { ...examToEdit.settings, ...settings, ...grading },
          proctoring: { ...examToEdit.proctoring, ...proctoring },
          customAssets: { ...examToEdit.customAssets, ...design },
          questions: Array.isArray(questions) ? questions : []
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
      const corePayload = {
        title: examData.title,
        courseId: examData.courseId,
        batchId: examData.batchId,
        examType: examData.type.toUpperCase(),
        totalMarks: examData.totalMarks,
        durationMinutes: examData.duration,
        passPercentage: 40 // Default
      };

      let savedExam;
      if (isEditMode) {
        savedExam = await ExamService.updateExam(id, corePayload);
      } else {
        savedExam = await ExamService.saveExam(corePayload);
      }

      // Robust check for ID from backend (supports id, examId, exam_id)
      const examId = savedExam?.examId || savedExam?.exam_id || savedExam?.id || id;

      if (!examId) {
        throw new Error("Backend did not return a valid Exam ID. Check your ExamController save method.");
      }

      console.log("Exam saved successfully with ID:", examId);

      // 2. Parallel save of all configuration entities
      await Promise.all([
        // Table 3: exam_settings
        ExamSettingsService.saveSettings(examId, {
          attemptsAllowed: examData.settings.maxAttempts,
          negativeMarking: examData.settings.negativeMarking,
          negativeMarkValue: examData.settings.negativeMarkingPenalty || 0,
          shuffleQuestions: examData.settings.shuffleQuestions,
          shuffleOptions: examData.settings.shuffleOptions,
          allowLateEntry: examData.settings.allowLateEntry || false,
          networkMode: (examData.settings.networkStrictness || "LENIENT").toUpperCase()
        }),

        // Table 2: exam_design
        ExamSettingsService.saveDesign(examId, {
          orientation: (examData.customAssets?.orientation || "PORTRAIT").toUpperCase(),
          instituteLogo: examData.customAssets?.logo,
          backgroundImage: examData.customAssets?.bgImage,
          watermark_type: (typeof examData.customAssets?.watermark === 'string' && !examData.customAssets?.watermark.startsWith('data:')) ? 'TEXT' : 'IMAGE',
          watermark_value: examData.customAssets?.watermark,
          watermark_opacity: examData.customAssets?.watermarkOpacity || 0.1
        }),

        // Table 4: exam_proctoring
        ExamSettingsService.saveProctoring(examId, {
          enabled: examData.proctoring.enabled,
          cameraRequired: examData.proctoring.cameraRequired,
          systemCheckRequired: true,
          violationLimit: examData.proctoring.maxViolations || 5
        }),

        // Table 5: exam_grading
        ExamSettingsService.saveGrading(examId, {
          autoEvaluation: examData.settings.autoEvaluation ?? true,
          partialMarking: examData.settings.partialMarking,
          showResult: examData.settings.showResults,
          showRank: examData.settings.showRank,
          showPercentile: examData.settings.showPercentile
        }),

        // Table 6: exam_notification
        ExamSettingsService.saveNotification(examId, {
          scheduledNotification: examData.settings.scheduledNotification || false,
          reminderBefore: examData.settings.examReminder || "NONE",
          feedback_after_exam: examData.settings.collectFeedback || false
        })
      ]);

      // 3. Table 7: exam_question (Saving & Mapping Questions)
      if (examData.questions && examData.questions.length > 0) {

        // A. Persist new questions to Question Bank first
        const questionsWithIds = await Promise.all(examData.questions.map(async (q) => {
          // If it already has an ID, it's from the bank.
          if (q.id || q.questionId) return q;

          // Otherwise, CREATE it in the backend
          try {
            // Enrich with course context
            const savedQ = await QuestionService.createQuestion({
              ...q,
              courseId: examData.courseId
            });
            const newId = savedQ.id || savedQ.questionId || savedQ.question_id;

            // Save options separately if they exist (aligned with QuestionOption.java)
            if (q.options && q.options.length > 0) {
              const optionsWithCorrectness = q.options.map((opt, idx) => ({
                text: opt,
                isCorrect: idx === q.correctOption
              }));
              await QuestionService.saveOptions(newId, optionsWithCorrectness);
            }

            // Return original q merged with new ID
            return { ...q, id: newId };
          } catch (err) {
            console.error("Failed to auto-save new question:", q);
            throw new Error("Failed to save one or more new questions. Please try again.");
          }
        }));

        // B. Link questions to the Exam
        await ExamService.addExamQuestions(examId, questionsWithIds.map((q, i) => ({
          questionId: q.id || q.questionId,
          marks: q.marks || 1,
          questionOrder: i + 1
        })));
      }

      // 4. Publish if it's a final action
      await ExamService.publishExam(examId);

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
              onPreview={() => setShowPreview(true)}
              onBack={() => {
                if (window.confirm("Return to configuration? Unsaved editor changes will be lost if you leave this session.")) {
                  setStep("setup");
                }
              }}
            />
          </motion.div>
        )}
      </AnimatePresence>

      {showPreview && (
        <PreviewMode
          examData={examData}
          onClose={() => setShowPreview(false)}
        />
      )}
    </div>
  );
};

export default CreateExam;
