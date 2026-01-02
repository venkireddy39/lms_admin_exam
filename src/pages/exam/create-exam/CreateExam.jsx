import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

import SetupMode from "./components/SetupMode";
import EditorMode from "./components/EditorMode";
import PreviewMode from "./components/PreviewMode";

const CreateExam = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEditMode = !!id;

  // Global Orchestrator State
  // If edit mode, jump straight to editor. Else start at setup.
  const [step, setStep] = useState(isEditMode ? "editor" : "setup");
  const [showPreview, setShowPreview] = useState(false);

  const [examData, setExamData] = useState({
    title: "",
    course: "",
    type: "mixed", // mixed | coding | quiz
    totalMarks: 100,
    duration: 60,
    questions: [],
    customAssets: {
      bgImage: null,
      watermark: null,
      watermarkOpacity: 0.1,
      orientation: "portrait"
    },
    settings: {
      maxAttempts: "1",
      gradingStrategy: "highest",
      cooldownPeriod: "0",
      allowReattemptCondition: "always"
    },
    status: "DRAFT"
  });

  // Load Existing Data
  useEffect(() => {
    if (isEditMode) {
      const savedExams = JSON.parse(localStorage.getItem("exams") || "[]");
      const examToEdit = savedExams.find((e) => e.id.toString() === id);

      if (examToEdit) {
        setExamData({
          ...examToEdit,
          // Ensure compatibility with potentially missing fields
          customAssets: examToEdit.customAssets || {
            bgImage: null, watermark: null, watermarkOpacity: 0.1, orientation: 'portrait'
          }
        });
        setStep("editor"); // Skip setup for edits
      } else {
        toast.error("Exam not found!");
        navigate("/exams/dashboard");
      }
    }
  }, [id, isEditMode, navigate]);

  // Handler: Setup Complete
  const handleSetupComplete = (config) => {
    setExamData(prev => ({
      ...prev,
      ...config, // Merges title, course, type, duration, totalMarks, customAssets
    }));
    setStep("editor");
    toast.success("Setup Complete! Entering Editor...");
  };

  // Handler: Save Exam
  const handleSave = () => {
    if (!examData.title || !examData.course) {
      toast.error("Title and Course are required.");
      return;
    }
    if (examData.questions.length === 0) {
      toast.warn("Please add at least one question.");
      return;
    }

    const payload = {
      ...examData,
      id: isEditMode ? parseInt(id) : Date.now(),
      dateCreated: isEditMode ? examData.dateCreated : new Date().toISOString(),
      status: 'published' // Auto publish or update
    };

    const existingExams = JSON.parse(localStorage.getItem("exams")) || [];
    let updatedExams;

    if (isEditMode) {
      updatedExams = existingExams.map(e => e.id.toString() === id ? payload : e);
    } else {
      updatedExams = [...existingExams, payload];
    }

    localStorage.setItem("exams", JSON.stringify(updatedExams));
    toast.success(isEditMode ? "Exam Updated Successfully!" : "Exam Created & Published!");

    setTimeout(() => {
      navigate("/exams/dashboard");
    }, 1500);
  };

  // Render Logic
  return (
    <div className="min-vh-100 bg-light d-flex flex-column font-sans" style={{ fontFamily: "'Inter', sans-serif" }}>
      <ToastContainer position="bottom-right" theme="colored" />

      {/* 1. SETUP MODE */}
      {step === "setup" && (
        <SetupMode
          initialData={isEditMode ? examData : null}
          onComplete={handleSetupComplete}
        />
      )}

      {/* 2. EDITOR MODE (ADMIN) */}
      {step === "editor" && (
        <EditorMode
          examData={examData}
          setExamData={setExamData}
          onSave={handleSave}
          onPreview={() => setShowPreview(true)}
          onBack={() => {
            if (window.confirm("Go back to Setup? Unsaved changes in editor are kept in memory but not saved to disk.")) {
              setStep("setup");
            }
          }}
        />
      )}

      {/* 3. PREVIEW MODE (READ ONLY OVERLAY) */}
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