import api from "../../../services/api";

const apiFetch = async (url, options = {}) => {
    const method = options.method || "GET";
    let data = options.body;
    if (typeof data === "string") {
        try { data = JSON.parse(data); } catch (e) { }
    }
    let reqHeaders = { ...options.headers };
    if (data instanceof FormData) {
        // Remove Application/JSON explicitly so Axios generates the boundary
        delete reqHeaders['Content-Type'];
    }

    return await api({
        url,
        method,
        data,
        headers: Object.keys(reqHeaders).length > 0 ? reqHeaders : undefined,
        params: options.params
    });
};

export const examService = {

    isValidId: (id) => {
        if (!id || id === "undefined" || id === "preview" || id === "null") return false;
        return !isNaN(Number(id));
    },

    // --- Core Exams (REAL DB) ---

    getAllExams: async () => {
        try {
            const data = await apiFetch('/api/exams');
            if (Array.isArray(data)) {
                // Normalize IDs (some backends use examId or exam_id or examId)
                return data.map(exam => {
                    // Try to find the most likely ID field
                    const id = exam.id || exam.examId || exam.exam_id || exam.ExamId || exam.examid;
                    const totalQuestions = exam.totalQuestions ||
                        exam.questionCount ||
                        exam.questionsCount ||
                        exam.questions_count ||
                        exam.noOfQuestions ||
                        exam.no_of_questions ||
                        exam.total_questions ||
                        exam.question_count ||
                        (Array.isArray(exam.questions) ? exam.questions.length : 0) ||
                        (Array.isArray(exam.examQuestions) ? exam.examQuestions.length : 0) ||
                        (Array.isArray(exam.exam_questions) ? exam.exam_questions.length : 0);

                    const duration = exam.duration || exam.durationMinutes || exam.duration_minutes || exam.timeLimit || exam.time_limit || exam.duration_mins || exam.duration_minutes_total || 0;
                    return {
                        ...exam,
                        id: id,
                        totalQuestions: totalQuestions,
                        duration: duration
                    };
                });
            }
            return data;
        } catch (error) {
            console.error("Failed to fetch all exams:", error);
            return [];
        }
    },

    getExamById: async (id) => {
        if (!examService.isValidId(id)) {
            console.warn(`[ExamService] Skipping getExamById for invalid/preview ID: ${id}`);
            return null;
        }
        const exam = await apiFetch(`/api/exams/${id}`);

        if (exam) {
            // FALLBACK: If exam object has no questions, try fetching them explicitly
            if (!exam.questions || exam.questions.length === 0) {
                try {
                    const fetchedQuestions = await examService.getExamQuestions(id);
                    if (fetchedQuestions && fetchedQuestions.length > 0) {
                        exam.questions = fetchedQuestions;
                    }
                } catch (e) {
                    console.warn("Could not fetch separate questions for exam:", id);
                }
            }

            // Robust normalization
            const normalizedQuestions = (exam.questions || exam.examQuestions || []).map(q => ({
                ...q,
                id: q.id || q.questionId,
                question: q.questionText || q.question || q.text || "No text",
                type: (q.questionType || q.type || "MCQ").toLowerCase(),
                marks: q.marks || 1
            }));

            return {
                ...exam,
                id: exam.id || exam.examId || exam.exam_id || exam.ExamId || exam.examid,
                totalQuestions: exam.totalQuestions || exam.questionCount || exam.noOfQuestions || exam.no_of_questions || exam.total_questions || normalizedQuestions.length,
                duration: exam.duration || exam.durationMinutes || exam.duration_minutes || exam.timeLimit || exam.time_limit || exam.duration_mins || 60,
                questions: normalizedQuestions
            };
        }

        return exam;
    },

    createExam: async (examData) => {
        return await apiFetch('/api/exams', {
            method: 'POST',
            body: JSON.stringify(examData)
        });
    },

    updateExam: async (id, examData) => {
        return await apiFetch(`/api/exams/${id}`, {
            method: 'PUT',
            body: JSON.stringify(examData)
        });
    },

    deleteExam: async (id) => {
        return await apiFetch(`/api/exams/${id}`, {
            method: 'DELETE'
        });
    },

    getDeletedExams: async () => {
        try {
            const data = await apiFetch('/api/exams/deleted');
            return Array.isArray(data) ? data : [];
        } catch (error) {
            console.error("Failed to fetch deleted exams:", error);
            return [];
        }
    },

    hardDeleteExam: async (id) => {
        return await apiFetch(`/api/exams/${id}/hard`, {
            method: 'DELETE'
        });
    },

    restoreExam: async (id) => {
        return await apiFetch(`/api/exams/${id}/restore`, {
            method: 'PUT'
        });
    },

    publishExam: async (id) => {
        return await apiFetch(`/api/exams/${id}/publish`, { method: "PUT" });
    },

    getExamsByCourse: async (courseId) => {
        return await apiFetch(`/api/exams/course/${courseId}`);
    },

    getExamsByBatch: async (batchId) => {
        return await apiFetch(`/api/exams/batch/${batchId}`);
    },

    scheduleExam: async (scheduleData) => {
        try {
            return await apiFetch(`/api/exam-schedules`, {
                method: 'POST',
                body: JSON.stringify(scheduleData),
                headers: { "Content-Type": "application/json" }
            });
        } catch (e) {
            console.error("Backend scheduling failed", e);
            throw e;
        }
    },

    getExams: async () => examService.getAllExams(),
    getExamSettings: async (examId) => apiFetch(`/api/exams/${examId}/settings`),
    getExamDesign: async (examId) => apiFetch(`/api/exams/${examId}/design`),
    getExamProctoring: async (examId) => apiFetch(`/api/exams/${examId}/proctoring`),
    getExamGrading: async (examId) => apiFetch(`/api/exams/${examId}/grading`),

    // --- Student Operations (REAL DB via Attempt Controller) ---

    startExam: async (examId) => {
        return await apiFetch(`/api/exam-attempts/start/${examId}`, { method: 'POST' });
    },

    saveResponse: async (attemptId, responseData) => {
        // ExamResponseController: POST /api/exam-attempts/{attemptId}/responses
        return await api.post(`/api/exam-attempts/${attemptId}/responses`, responseData);
    },

    autoEvaluate: async (attemptId) => {
        // ExamResponseController: POST /api/exam-attempts/{attemptId}/responses/auto-evaluate
        return await apiFetch(`/api/exam-attempts/${attemptId}/responses/auto-evaluate`, {
            method: 'POST'
        });
    },

    submitExam: async (attemptId, responses) => {

        const promises = Object.entries(responses).map(([qIdx, ans]) => {
            // Transform frontend answer format to backend ExamResponse model
            // This requires mapping index to questionId if possible, or sending as is.
            // Assuming responses keys are QuestionIDs or we have a map.
            // For now, sending as generic payload.
            const payload = {
                examQuestionId: qIdx, // Ensure this matches backend expectation (ID vs Index)
                // selectedOptionId: ... (logic depends on q type)
                descriptiveAnswer: (typeof ans === 'string') ? ans : null,
                // codingSubmissionCode: ... 
            };
            return examService.saveResponse(attemptId, payload).catch(e => console.error(e));
        });

        await Promise.all(promises);

        // Trigger Submission
        try {
            console.warn("Legacy submitExam called. Ensure responses are saved.");
        } catch (e) { console.error("Submit failed", e); }
    },

    submitExamAttempt: async (examId, attemptId) => {
        // Correct URL: /api/exams/{examId}/attempts/{attemptId}/submit
        return await apiFetch(`/api/exams/${examId}/attempts/${attemptId}/submit`, {
            method: 'POST'
        });
    },

    getResponses: async (attemptId) => {
        return await apiFetch(`/api/exam-attempts/${attemptId}/responses`);
    },

    getExamResult: async (examId) => {
        return await apiFetch(`/api/exams/${examId}/result`);
    },

    // 1. SETTINGS (REAL CONTROLLER)
    saveSettings: async (examId, settingsData) => {
        return await apiFetch(`/api/exams/${examId}/settings`, {
            method: 'POST',
            body: JSON.stringify(settingsData)
        });
    },

    getExamSettings: async (examId) => {
        return await apiFetch(`/api/exams/${examId}/settings`);
    },

    // 2. DESIGN
    // Matches ExamDesignController: POST /upload with default params
    saveDesign: async (examId, designData) => {
        console.log("Saving Design Data:", designData);

        let opacity = designData.watermark_opacity;
        // Convert to 0-100 Integer if needed
        if (opacity !== undefined && opacity !== null) {
            const val = parseFloat(opacity);
            if (!isNaN(val)) {
                // If value is small decimal (e.g. 0.1), assume it's 0-1 scale -> convert to 0-100
                // If value > 1, assume it's already 0-100
                opacity = (val <= 1 && val > 0) ? Math.round(val * 100) : Math.round(val);
            } else {
                opacity = 10; // Default
            }
        } else {
            opacity = 10;
        }

        // Move text params to URL Query String to ensure @RequestParam picks them up
        const params = new URLSearchParams();
        params.append('orientation', designData.orientation || "PORTRAIT");
        params.append('watermarkType', designData.watermark_type || "TEXT");
        params.append('watermarkValue', designData.watermark_value || "");
        params.append('watermarkOpacity', opacity.toString());

        const formData = new FormData();
        // Force at least one field in FormData to ensure browser sends multipart header
        formData.append('orientation', designData.orientation || "PORTRAIT");
        // Append Only Files to Body
        if (designData.instituteLogo instanceof File || designData.instituteLogo instanceof Blob) {
            formData.append('instituteLogo', designData.instituteLogo);
        }
        if (designData.backgroundImage instanceof File || designData.backgroundImage instanceof Blob) {
            formData.append('backgroundImage', designData.backgroundImage);
        }

        return await apiFetch(`/api/exams/${examId}/design/upload?${params.toString()}`, {
            method: 'POST',
            body: formData,
            headers: { "Content-Type": null } // Boundary managed by browser
        });
    },

    getExamDesign: async (examId) => {
        return await apiFetch(`/api/exams/${examId}/design`);
    },

    saveProctoring: async (examId, proctoringData) => {
        return await apiFetch(`/api/exams/${examId}/proctoring`, {
            method: 'POST',
            body: JSON.stringify(proctoringData)
        });
    },

    getExamProctoring: async (examId) => {
        return await apiFetch(`/api/exams/${examId}/proctoring`);
    },

    saveGrading: async (examId, gradingData) => {
        return await apiFetch(`/api/exams/${examId}/grading`, {
            method: 'POST',
            body: JSON.stringify(gradingData)
        });
    },

    getExamGrading: async (examId) => {
        return await apiFetch(`/api/exams/${examId}/grading`);
    },

    saveNotification: async (examId, notificationData) => {
        // Safe access helper
        const getVal = (v1, v2) => (v1 !== undefined && v1 !== null) ? v1 : (v2 !== undefined && v2 !== null ? v2 : null);

        // Send BOTH camelCase and snake_case to satisfy backend mapping
        const payload = {
            examId: examId,
            // Standard fields
            ...notificationData,

            // Explicit Mappings (Camel)
            scheduledNotification: getVal(notificationData.scheduledNotification, notificationData.scheduled_notification),
            reminderBefore: getVal(notificationData.reminderBefore, notificationData.reminder_before),
            feedbackAfterExam: getVal(notificationData.feedbackAfterExam, notificationData.feedback_after_exam),

            // Explicit Mappings (Snake)
            scheduled_notification: getVal(notificationData.scheduledNotification, notificationData.scheduled_notification),
            reminder_before: getVal(notificationData.reminderBefore, notificationData.reminder_before),
            feedback_after_exam: getVal(notificationData.feedbackAfterExam, notificationData.feedback_after_exam)
        };

        return await apiFetch(`/api/exams/${examId}/notification`, {
            method: 'POST',
            body: JSON.stringify(payload)
        });
    },

    // --- Global Settings (Mocked) ---

    getGlobalSettings: async () => {
        return {
            defaults: { duration: 60, totalMarks: 100 },
            visuals: { orientation: "portrait" },
            attemptRules: { maxAttempts: 1 }
        };
    },

    saveGlobalSettings: async (settings) => {
        return { success: true };
    },

    // --- Question Management (REAL DB if supported, else Mock) ---
    // Assuming QuestionController exists? (Not provided by user, but let's assume standard CRUD works or default to ApiFetch)

    createQuestion: async (questionData) => {
        const qType = (questionData.type || questionData.questionType || "MCQ").toUpperCase();
        const dp = questionData.image || questionData.questionImageUrl;
        const hasImage = !!dp;

        // If it's a descriptive question without an image, send as JSON as requested by User
        if ((qType === 'DESCRIPTIVE' || qType === 'SHORT' || qType === 'LONG') && !hasImage) {
            const payload = {
                questionText: questionData.question || questionData.questionText || "Untitled Question",
                questionType: "DESCRIPTIVE",
                contentType: "TEXT",
                questionImageUrl: null
            };
            return await apiFetch('/api/questions', {
                method: 'POST',
                body: JSON.stringify(payload),
                headers: { "Content-Type": "application/json" }
            });
        }

        // Fallback to FormData for image/complex questions
        const formData = new FormData();

        // 1. Text Fields
        formData.append('questionText', questionData.question || questionData.questionText || "Untitled Question");
        formData.append('questionType', qType);
        formData.append('contentType', hasImage ? "TEXT_IMAGE" : "TEXT");

        // 2. Language Mapping (Coding)
        let lang = questionData.language ? questionData.language.toUpperCase() : null;
        if (lang === 'JAVASCRIPT') lang = 'JAVA'; // Backend enum fallback
        if (lang === 'C++') lang = 'CPP';
        if (lang === 'C#') lang = 'CSHARP'; // Assuming standard enum
        if (lang) formData.append('programmingLanguage', lang);

        if (questionData.modelAnswer) {
            formData.append('modelAnswer', questionData.modelAnswer);
        }
        if (questionData.keywords) {
            formData.append('keywords', questionData.keywords);
        }

        // 3. Image Handling (Base64 -> Blob)
        if (hasImage) {
            if (dp instanceof File || dp instanceof Blob) {
                formData.append('questionImage', dp);
            } else if (typeof dp === 'string' && dp.startsWith('data:')) {
                // Convert Base64 to Blob
                try {
                    const arr = dp.split(',');
                    const mime = arr[0].match(/:(.*?);/)[1];
                    const bstr = atob(arr[1]);
                    let n = bstr.length;
                    const u8arr = new Uint8Array(n);
                    while (n--) {
                        u8arr[n] = bstr.charCodeAt(n);
                    }
                    const blob = new Blob([u8arr], { type: mime });
                    formData.append('questionImage', blob, "question_image.png");
                } catch (e) {
                    console.warn("Base64 conversion failed", e);
                }
            }
        }

        return await apiFetch('/api/questions', {
            method: 'POST',
            body: formData
        });
    },

    getAllQuestions: async () => {
        const data = await apiFetch('/api/questions');
        return (data || []).map(q => ({
            ...q,
            id: q.questionId || q.id,
            question: q.questionText || q.question || q.text || "No text",
            type: (q.questionType || q.type || "MCQ").toLowerCase()
        }));
    },

    getQuestion: async (questionId) => {
        const q = await apiFetch(`/api/questions/${questionId}`);
        if (q) {
            return {
                ...q,
                id: q.questionId || q.id,
                question: q.questionText || q.question || q.text || "No text",
                type: (q.questionType || q.type || "MCQ").toLowerCase()
            };
        }
        return q;
    },

    updateQuestion: async (questionId, questionData) => {
        const payload = {
            ...questionData,
            questionText: questionData.question || questionData.questionText,
            questionType: (questionData.type || questionData.questionType || "MCQ").toUpperCase(),
            marks: questionData.marks || 1,
            isActive: true, // Force Active
            status: 'ACTIVE' // Force Status
        };
        return await apiFetch(`/api/questions/${questionId}`, {
            method: 'PUT',
            body: JSON.stringify(payload)
        });
    },

    deleteQuestion: async (questionId) => {
        return await apiFetch(`/api/questions/${questionId}`, {
            method: 'DELETE'
        });
    },

    // --- Question Options ---

    addQuestionOptions: async (questionId, options) => {
        // 1. Detect if any option has an image file
        const optionsWithImages = options.filter(opt => opt.image instanceof File || opt.optionImage instanceof File);
        const hasImages = optionsWithImages.length > 0;

        // --- FLOW A: TEXT ONLY (JSON) ---
        if (!hasImages) {
            console.log(`[ExamService] 🚀 Sending PURE JSON options for Q: ${questionId}`);
            const jsonPayload = options.map(opt => ({
                questionId: Number(questionId),
                optionText: typeof opt === 'string' ? opt : (opt.optionText || opt.text || ""),
                isCorrect: Boolean(opt.isCorrect ?? false)
            }));

            return await apiFetch(`/api/questions/${questionId}/options`, {
                method: 'POST',
                body: JSON.stringify(jsonPayload),
                headers: { "Content-Type": "application/json" }
            });
        }

        // --- FLOW B: WITH IMAGES (CLEAN MULTIPART) ---
        console.log(`[ExamService] 🖼️ Sending PURE MULTIPART (no empty blobs) for Q: ${questionId}`);
        const formData = new FormData();

        // 1. Append Text & Correctness for ALL options
        options.forEach(opt => {
            formData.append('optionText', String(opt.optionText || opt.text || ""));
            formData.append('isCorrect', String(Boolean(opt.isCorrect ?? false)));
        });

        // 2. Append ONLY existing images with their corresponding indices
        options.forEach((opt, index) => {
            const file = opt.optionImage || opt.image;
            if (file instanceof File) {
                formData.append('optionImage', file);
                formData.append('imageIndex', index); // NEW: Tells backend WHICH option this file belongs to
            }
        });

        return await apiFetch(`/api/questions/${questionId}/options/images`, {
            method: 'POST',
            body: formData
        });
    },

    getQuestionOptions: async (questionId) => {
        return await apiFetch(`/api/questions/${questionId}/options`);
    },

    updateQuestionOption: async (questionId, optionId, optionData) => {
        return await apiFetch(`/api/questions/${questionId}/options/${optionId}`, {
            method: 'PUT',
            body: JSON.stringify(optionData)
        });
    },

    deleteQuestionOption: async (questionId, optionId) => {
        try {
            await apiFetch(`/api/questions/${questionId}/options/${optionId}`, {
                method: 'DELETE'
            });
            return true;
        } catch (error) {
            console.error("Failed to delete option:", error);
            return false;
        }
    },

    // --- Exam Questions Linking ---

    addExamQuestions: async (examId, questions) => {
        console.log("Adding ExamQuestions Payload (Legacy):", JSON.stringify(questions, null, 2));
        return await apiFetch(`/api/exams/${examId}/questions`, {
            method: 'POST',
            body: JSON.stringify(questions)
        });
    },

    // --- Sections Binding (New Correct Flow) ---

    createQuestionSection: async (sectionData) => {
        return await apiFetch(`/api/sections`, {
            method: 'POST',
            body: JSON.stringify(sectionData)
        });
    },

    mapQuestionToSection: async (sectionId, questionId) => {
        return await apiFetch(`/api/sections/${sectionId}/questions/${questionId}`, {
            method: 'POST'
        });
    },

    addSectionToExam: async (examId, sectionId, sectionOrder = 1, shuffle = false) => {
        return await apiFetch(`/api/exams/${examId}/sections?sectionId=${sectionId}&sectionOrder=${sectionOrder}&shuffleQuestions=${shuffle}`, {
            method: 'POST'
        });
    },

    addQuestionsToExamSection: async (examSectionId, questions) => {
        return await apiFetch(`/api/sections/${examSectionId}/questions`, {
            method: 'POST',
            body: JSON.stringify(questions)
        });
    },

    getExamQuestions: async (examId) => {
        let data = [];
        try {
            // First, try to get questions directly linked to the exam via sections
            let allowedQuestionIds = new Set();
            try {
                const sections = await apiFetch(`/api/exams/${examId}/sections`);
                if (sections && Array.isArray(sections)) {
                    for (const sec of sections) {
                        try {
                            // Developer's verified endpoint: /api/sections/{sectionId}/questions
                            // We try both sectionId and examSectionId as fallback
                            const sId = sec.sectionId || sec.id || sec.examSectionId;
                            const qs = await apiFetch(`/api/sections/${sId}/questions`);
                            if (qs && Array.isArray(qs)) {
                                qs.forEach(q => {
                                    if (q.questionId) allowedQuestionIds.add(String(q.questionId));
                                    if (q.id) allowedQuestionIds.add(String(q.id));
                                });
                            }
                        } catch (err) {
                            console.warn(`[ExamService] Failed to fetch questions for section ${sec.examSectionId}`, err);
                        }
                    }
                }
            } catch (secErr) {
                console.warn("[ExamService] Could not fetch sections for filtering", secErr);
            }

            // As per Postman tests, Admin queries use the global question repository
            const allQs = await apiFetch(`/api/questions`);
            if (allQs && Array.isArray(allQs)) {
                if (allowedQuestionIds.size > 0) {
                    // Filter by the IDs found in the sections
                    data = allQs.filter(q => allowedQuestionIds.has(String(q.id || q.questionId)));
                } else {
                    // Deep Fallback: Filter questions manually looking for matching examId
                    data = allQs.filter(q => {
                        const rawData = String(JSON.stringify(q));
                        const lid1 = q.examId || (q.exam ? q.exam.id : null) || q.exam_id;
                        const lid2 = q.examQuestion?.examSection?.exam?.id || q.examQuestion?.examSection?.examId;
                        // Check explicit ids or if the stringified JSON contains "examId":2 or "exam":{"id":2
                        return String(lid1) === String(examId) || String(lid2) === String(examId) ||
                            rawData.includes(`"examId":${examId}`) || rawData.includes(`"exam_id":${examId}`) ||
                            rawData.includes(`"exam":{"id":${examId}`);
                    });
                    console.log(`[ExamService] Deep global fallback found ${data.length} questions for exam ${examId}`);
                }
            }
        } catch (e) {
            console.warn("[ExamService] Failed to load global questions", e);
        }

        // Ensure all questions have options loaded if missing
        const finalData = await Promise.all((data || []).map(async q => {
            // Check if 'q' wraps a 'question' object (ExamQuestion entity structure)
            const isWrapped = q.question && typeof q.question === 'object';
            const coreQ = isWrapped ? q.question : q;

            // Extract fields
            const examQuestionId = isWrapped ? (q.id || q.examQuestionId) : (q.id || q.questionId);
            const questionId = coreQ.id || coreQ.questionId;
            const finalId = examQuestionId || questionId;

            const qText = coreQ.questionText || coreQ.question || coreQ.text || q.questionText || (typeof q.question === 'string' ? q.question : "") || "No text";
            const qType = (coreQ.questionType || coreQ.type || q.questionType || q.type || "MCQ").toLowerCase();
            const qMarks = q.marks || coreQ.marks || 1;

            let qOptions = coreQ.options || q.options || [];

            // If options are empty but it's an MCQ, try fetching options directly
            if (qOptions.length === 0 && (qType === 'mcq' || qType === 'quiz') && questionId) {
                try {
                    // Developer's endpoint mapping
                    const fetchedOpts = await apiFetch(`/api/questions/${questionId}/options`);
                    if (fetchedOpts && Array.isArray(fetchedOpts)) {
                        qOptions = fetchedOpts;
                    }
                } catch (optErr) {
                    console.warn(`Failed to fetch options for Q ${questionId}`);
                }
            }

            return {
                ...q,
                id: finalId, // LearnerView uses this for submitting
                questionId: questionId, // Keep reference to real question ID
                question: qText,
                text: qText,
                type: qType,
                marks: qMarks,
                options: qOptions.map(opt => {
                    if (typeof opt === 'object' && opt !== null) {
                        return {
                            id: opt.optionId || opt.id,
                            text: opt.optionText || opt.text || "",
                            image: opt.optionImage || opt.optionImageUrl || opt.image || null,
                            isCorrect: opt.isCorrect || false
                        };
                    }
                    return { id: String(opt), text: String(opt) };
                })
            };
        }));

        return finalData;
    },

    getExamQuestionsView: async (examId) => {
        // Strategy 1: Try the specific "View" endpoint as requested
        try {
            const viewData = await apiFetch(`/api/exams/${examId}/questions/view`).catch(e => {
                console.warn(`[getExamQuestionsView] View endpoint failed, triggering fallback`);
                return null; // Return null on HTTP error to trigger fallback
            });

            if (viewData && viewData.length > 0) {
                return viewData.map(q => ({
                    ...q,
                    id: q.questionId || q.id,
                    question: q.questionText || q.question || q.text || "No text",
                    text: q.questionText || q.question || q.text || "No text",
                    type: (q.questionType || q.type || "MCQ").toLowerCase(),
                    marks: q.marks || 1,
                    options: (q.options || []).map(opt => ({
                        id: opt.optionId || opt.id || String(opt),
                        text: opt.optionText || opt.text || String(opt),
                        image: opt.optionImage || opt.image || null
                    }))
                }));
            }
        } catch (e) {
            console.warn("View endpoint threw exception, falling back to standard fetch", e);
        }

        // Fallback: Use the robust Main Strategy
        return await examService.getExamQuestions(examId);
    },

    // --- Student Exam Flow (Real Backend) ---
    // --- EXAM ATTEMPTS (Student) ---
    // Controller: /api/exams/{examId}/attempts

    startExamAttempt: async (examId, studentId) => {
        // ExamAttemptController: POST /api/exams/{examId}/attempts/start
        // Note: Backend might ignore studentId in body if using Auth, but we pass it as requested.
        return await api.post(`/api/exams/${examId}/attempts/start`, { studentId });
    },

    // Unified Save Response for all question types
    saveExamResponse: async (attemptId, { examQuestionId, selectedOptionId, descriptiveAnswer, codingSubmissionCode }) => {
        // ExamResponseController: POST /api/exam-attempts/{attemptId}/responses
        const payload = {
            examQuestionId: Number(examQuestionId),
            selectedOptionId: selectedOptionId ? Number(selectedOptionId) : null,
            descriptiveAnswer: descriptiveAnswer || null,
            codingSubmissionCode: codingSubmissionCode || null
        };
        return await api.post(`/api/exam-attempts/${attemptId}/responses`, payload);
    },

    submitExamAttempt: async (examId, attemptId) => {
        // ExamAttemptController: POST /api/exams/{examId}/attempts/{attemptId}/submit
        return await api.post(`/api/exams/${examId}/attempts/${attemptId}/submit`);
    },

    executeExamAttempt: async (attemptId) => {

        console.warn("executeExamAttempt needs examId. Make sure to pass it.");
    },

    getExamAttempt: async (examId, attemptId) => {
        // /api/exams/{examId}/attempts/{attemptId}
        return await apiFetch(`/api/exams/${examId}/attempts/${attemptId}`);
    },

    getExamResult: async (examId, attemptId) => {
        // /api/exams/{examId}/attempts/{attemptId}/result
        return await apiFetch(`/api/exams/${examId}/attempts/${attemptId}/result`);
    },

    updateExamQuestion: async (examId, examQuestionId, data) => {
        return await apiFetch(`/api/exams/${examId}/questions/${examQuestionId}`, {
            method: 'PUT',
            body: JSON.stringify(data)
        });
    },

    removeExamQuestion: async (examId, examQuestionId) => {
        return await apiFetch(`/api/exams/${examId}/questions/${examQuestionId}`, {
            method: 'DELETE'
        });
    },

    // --- Advanced Features (Descriptive & Coding) ---
    // Matches QuestionDescriptiveAnswerController

    saveDescriptiveAnswer: async (questionId, data) => {
        return await apiFetch(`/api/questions/${questionId}/descriptive-answer`, {
            method: 'POST',
            body: JSON.stringify({
                answerText: data.answerText,
                guidelines: data.guidelines
            }),
            headers: { "Content-Type": "application/json" }
        });
    },

    getDescriptiveAnswer: async (questionId) => {
        return await apiFetch(`/api/questions/${questionId}/descriptive-answer`);
    },

    deleteDescriptiveAnswer: async (questionId) => {
        try {
            await apiFetch(`/api/questions/${questionId}/descriptive-answer`, { method: 'DELETE' });
            return true;
        } catch (e) {
            return false;
        }
    },

    getDescriptiveResponsesForEvaluation: async (attemptId) => {
        return await apiFetch(`/api/exam-attempts/${attemptId}/descriptive-responses`);
    },

    getCodingResponsesForEvaluation: async (attemptId) => {
        return await apiFetch(`/api/exam-attempts/${attemptId}/responses/coding-responses`);
    },

    evaluateResponse: async (attemptId, responseId, marks) => {
        // Step 11: Manual Evaluation
        // POST /api/exam-attempts/{attemptId}/responses/{responseId}/evaluate?marks=X
        return await api.post(`/api/exam-attempts/${attemptId}/responses/${responseId}/evaluate?marks=${marks}`);
    },

    getDetailedResult: async (examId, attemptId) => {
        // Step 12: View Final Result
        // GET /api/exams/{examId}/attempts/{attemptId}/result
        return await apiFetch(`/api/exams/${examId}/attempts/${attemptId}/result`);
    },

    // --- Coding Execution (Real Backend) ---
    // Matches CodingExecutionController
    runCodingSubmission: async (responseId) => {
        // POST /api/exam-responses/{responseId}/run
        return await api.post(`/api/exam-responses/${responseId}/run`);
    },

    getCodingExecutionResults: async (responseId) => {
        // GET /api/exam-responses/{responseId}/execution-results
        return await api.get(`/api/exam-responses/${responseId}/execution-results`);
    },

    // Matches CodingTestCaseController: POST /api/questions/{qId}/coding-test-cases
    // Backend expects a LIST of test cases.
    createTestCases: async (qId, testCases) => {
        const payload = testCases.map(tc => ({
            inputData: tc.input || tc.inputData || "",
            expectedOutput: tc.output || tc.expectedOutput || "",
            hidden: Boolean(tc.hidden)
        }));

        return await apiFetch(`/api/questions/${qId}/coding-test-cases`, {
            method: 'POST',
            body: JSON.stringify(payload),
            headers: { "Content-Type": "application/json" }
        });
    },

    // Singular fallback (wraps in array)
    createTestCase: async (qId, data) => {
        return examService.createTestCases(qId, [data]);
    },

    getTestCases: async (qId) => apiFetch(`/api/questions/${qId}/coding-test-cases`),

    updateTestCase: async (qId, tId, data) => {
        return apiFetch(`/api/questions/${qId}/coding-test-cases/${tId}`, {
            method: 'PUT',
            body: JSON.stringify({
                inputData: data.input || data.inputData,
                expectedOutput: data.output || data.expectedOutput,
                hidden: data.hidden || false
            })
        });
    },

    deleteTestCase: async (qId, tId) => {
        return apiFetch(`/api/questions/${qId}/coding-test-cases/${tId}`, { method: 'DELETE' });
    },

    getExamPaper: async (examId) => {
        try {
            const [examData, questions] = await Promise.all([
                examService.getExamById(examId),
                examService.getExamQuestionsView(examId)
            ]);
            if (!examData) return null;
            return {
                ...examData,
                questions: questions || []
            };
        } catch (error) {
            console.error("getExamPaper failed:", error);
            // Minimal fallback
            return examService.getExamById(examId);
        }
    },

    getLeaderboard: async (scope = "global") => [],
    getReports: async () => apiFetch('/api/exams/reports'),
};
