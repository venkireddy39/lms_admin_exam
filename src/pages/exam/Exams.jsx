import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import ExamLayout from "./layouts/ExamLayout";
import ExamDashboard from "./dashboard/ExamDashboard";
import QuestionBank from "./question-bank/QuestionBank";
import CreateExam from "./create-exam/CreateExam";
import ExamSchedule from "./schedule/ExamSchedule";
import ReattemptRules from "./reattempt/ReattemptRules";
import ExamReports from "./reports/ExamReports";
import Leaderboard from "./leaderboard/Leaderboard";
import ExamPaperView from "./preview/ExamPaperView";

const Exams = () => {
    return (
        <Routes>
            <Route element={<ExamLayout />}>
                <Route path="/" element={<Navigate to="dashboard" replace />} />
                <Route path="dashboard" element={<ExamDashboard />} />
                <Route path="question-bank" element={<QuestionBank />} />
                <Route path="create-exam" element={<CreateExam />} />
                <Route path="edit-exam/:id" element={<CreateExam />} />
                <Route path="schedule" element={<ExamSchedule />} />
                <Route path="reattempt" element={<ReattemptRules />} />
                <Route path="reports" element={<ExamReports />} />
                <Route path="leaderboard" element={<Leaderboard />} />
                <Route path="view-paper/:id" element={<ExamPaperView />} />
            </Route>
        </Routes>
    );
};

export default Exams;
