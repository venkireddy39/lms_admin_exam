
import React, { Suspense, lazy } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import DashboardLayout from '../components/layout/DashboardLayOut';
import Loading from '../components/common/Loading';
import { useAuth } from '../pages/Library/context/AuthContext';

// Lazy Load Pages
const Home = lazy(() => import('../pages/Home/Home'));
const Batches = lazy(() => import('../pages/Batches/Batches'));
const Courses = lazy(() => import('../pages/Courses/Courses'));
const Webinar = lazy(() => import('../pages/Webinar/Webinar'));
const Exams = lazy(() => import('../pages/exam/Exams'));
const Marketing = lazy(() => import('../pages/Marketing/Marketing'));
const MyApp = lazy(() => import('../pages/MyApp/MyApp'));
const Websites = lazy(() => import('../pages/Websites/Websites'));
const Certificates = lazy(() => import('../pages/Certificates/CertificateModule'));
const Attendance = lazy(() => import('../pages/Attendance/Attendance'));
const Affiliates = lazy(() => import('../pages/Affiliates/Affiliates'));
const Users = lazy(() => import('../pages/Users/Users'));
const Settings = lazy(() => import('../pages/Settings/Settings'));
const NotFound = lazy(() => import('../pages/NotFound'));
const BatchBuilder = lazy(() => import('../pages/Batches/BatchBuilder'));
const CourseBuilder = lazy(() => import('../pages/Courses/CourseBuilder'));
const CourseOverview = lazy(() => import('../pages/Courses/CourseOverview'));
const CreateClass = lazy(() => import('../pages/Batches/CreateClass'));
const FeeManagement = lazy(() => import('../pages/FeeManagement/fee'));
const CreateFee = lazy(() => import('../pages/FeeManagement/CreateFee'));
const LibraryApp = lazy(() => import('../pages/Library/App'));
const AffiliateRegister = lazy(() => import('../pages/Affiliates/AffiliateRegister'));
const AffiliatePortal = lazy(() => import('../pages/Affiliates/AffiliatePortal'));
const StudentDashboard = lazy(() => import('../pages/Student/StudentDashboard'));
const LoginPage = lazy(() => import('../pages/Login/LoginPage'));
const StudentCourses = lazy(() => import('../pages/Student/StudentCourses'));
const StudentBatches = lazy(() => import('../pages/Student/StudentBatches'));
const StudentAttendance = lazy(() => import('../pages/Student/StudentAttendance'));
const StudentLibrary = lazy(() => import('../pages/Student/StudentLibrary'));
const LearningContent = lazy(() => import('../pages/Student/LearningContent'));
const StudentLayout = lazy(() => import('../components/layout/StudentLayout'));

const RootRedirect = () => {
  const { user, loading } = useAuth();

  if (loading) return <Loading />;

  if (user?.role === 'STUDENT') {
    return <Navigate to="/student/dashboard" replace />;
  }
  return <Navigate to="/dashboard" replace />;
};

const AppRoutes = () => {
  return (
    <Suspense fallback={<Loading />}>
      <Routes>

        {/* ================= PUBLIC ROUTES ================= */}
        <Route path="/login" element={<LoginPage />} />
        <Route path="/course-overview/:id" element={<CourseOverview />} />
        <Route path="/share/:shareCode" element={<CourseOverview />} />
        <Route path="/affiliate/join" element={<AffiliateRegister />} />

        {/* ================= STUDENT PORTAL (VERTICAL LAYOUT) ================= */}
        <Route element={<StudentLayout />}>
          <Route path="/student">
            <Route index element={<Navigate to="/student/dashboard" replace />} />
            <Route path="dashboard" element={<StudentDashboard />} />
            <Route path="courses" element={<StudentCourses />} />
            <Route path="batches" element={<StudentBatches />} />
            <Route path="attendance" element={<StudentAttendance />} />
            <Route path="library" element={<StudentLibrary />} />
            <Route path="content" element={<LearningContent />} />
            <Route path="exams" element={<div className="p-4"><h2 className="text-white">Exams</h2><p className="text-secondary">Coming soon...</p></div>} />
            <Route path="assignments" element={<div className="p-4"><h2 className="text-white">Assignments</h2><p className="text-secondary">Coming soon...</p></div>} />
            <Route path="grades" element={<div className="p-4"><h2 className="text-white">Grades</h2><p className="text-secondary">Coming soon...</p></div>} />
            <Route path="calendar" element={<div className="p-4"><h2 className="text-white">Calendar</h2><p className="text-secondary">Coming soon...</p></div>} />
            <Route path="communication" element={<div className="p-4"><h2 className="text-white">Communication</h2><p className="text-secondary">Coming soon...</p></div>} />
            <Route path="profile" element={<div className="p-4"><h2 className="text-white">Profile</h2><p className="text-secondary">Coming soon...</p></div>} />
            <Route path="certificates" element={<div className="p-4"><h2 className="text-white">Certificates</h2><p className="text-secondary">Coming soon...</p></div>} />
            <Route path="support" element={<div className="p-4"><h2 className="text-white">Support</h2><p className="text-secondary">Coming soon...</p></div>} />
            <Route path="*" element={<NotFound />} />
          </Route>
        </Route>

        {/* ================= ADMIN/GENERAL DASHBOARD ROUTES ================= */}
        <Route element={<DashboardLayout />}>

          {/* 🔴 ROLE-AWARE ROOT REDIRECT */}
          <Route path="/" element={<RootRedirect />} />

          {/* ✅ REAL DASHBOARD ROUTE */}
          <Route path="/dashboard" element={<Home />} />

          {/* ... existing routes ... */}

          <Route path="/affiliates" element={<Affiliates />} />
          <Route path="/affiliate/portal" element={<AffiliatePortal />} />
          <Route path="/academics">
            <Route index element={<Navigate to="/courses" replace />} />
            <Route path="courses" element={<Navigate to="/courses" replace />} />
            <Route path="batches" element={<Navigate to="/batches" replace />} />
            <Route path="webinars" element={<Navigate to="/webinar" replace />} />
            <Route path="attendance" element={<Navigate to="/attendance" replace />} />
            <Route path="certificates" element={<Navigate to="/certificates" replace />} />
          </Route>

          {/* ===== ORIGINAL MODULE ROUTES ===== */}
          <Route path="/courses" element={<Courses />} />
          <Route path="/courses/builder/:id" element={<CourseBuilder />} />
          <Route path="/courses/*" element={<Navigate to="/courses" replace />} />

          <Route path="/batches" element={<Batches />} />
          <Route path="/batches/builder/:id" element={<BatchBuilder />} />
          <Route path="/batches/:id/create-class" element={<CreateClass />} />

          <Route path="/webinar/*" element={<Webinar />} />
          <Route path="/attendance/*" element={<Attendance />} />
          <Route path="/certificates" element={<Certificates />} />

          {/* ===== FINANCE ===== */}
          <Route path="/fee" element={<FeeManagement />} />
          <Route path="/fee/create" element={<CreateFee />} />

          {/* ===== LIBRARY ===== */}
          <Route path="/library/*" element={<LibraryApp />} />

          {/* ===== USERS ===== */}
          <Route path="/users/*" element={<Users />} />

          {/* ===== EXAMS ===== */}
          <Route path="/exams/*" element={<Exams />} />

          {/* ===== OTHER MODULES ===== */}
          <Route path="/marketing" element={<Marketing />} />

          <Route path="/myapp" element={<MyApp />} />
          <Route path="/websites" element={<Websites />} />
          <Route path="/settings" element={<Settings />} />

          {/* ===== 404 ===== */}
          <Route path="*" element={<NotFound />} />

        </Route>
      </Routes>
    </Suspense>
  );
};

export default AppRoutes;
