import React, { Suspense, lazy } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import AdminLayout from '../components/layout/AdminLayout';
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
const AdminProfile = lazy(() => import('../pages/Users/AdminProfile'));
const NotFound = lazy(() => import('../pages/NotFound'));
const BatchBuilder = lazy(() => import('../pages/Batches/BatchBuilder'));
const CourseBuilder = lazy(() => import('../pages/Courses/CourseBuilder'));
const CourseOverview = lazy(() => import('../pages/Courses/CourseOverview'));
const CreateClass = lazy(() => import('../pages/Batches/CreateClass'));
const FeeManagementDashboard = lazy(() => import('../features/fee/pages/FeeManagementDashboard'));
// Legacy Fee imports logically removed or commented out to ensure clean architecture
// const FeeManagement = lazy(() => import('../pages/FeeManagement/fee'));
// const FeeCreate = lazy(() => import('../pages/FeeManagement/FeeCreate'));
// const InstallmentView = lazy(() => import('../pages/FeeManagement/InstallmentView'));
// const CreateFee = lazy(() => import('../pages/FeeManagement/CreateFee'));

// New Fee Modules
const FeeTypeListPage = lazy(() => import('../features/feeType/pages/FeeTypeListPage'));
const FeeTypeFormPage = lazy(() => import('../features/feeType/pages/FeeTypeFormPage'));
const FeeStructureListPage = lazy(() => import('../features/feeStructure/pages/FeeStructureListPage'));
const FeeStructureFormPage = lazy(() => import('../features/feeStructure/pages/FeeStructureFormPage'));
const FeeAllocationListPage = lazy(() => import('../features/feeAllocation/pages/FeeAllocationListPage'));
const FeeAllocationFormPage = lazy(() => import('../features/feeAllocation/pages/FeeAllocationFormPage'));
const FeeAllocationDetailPage = lazy(() => import('../features/feeAllocation/pages/FeeAllocationDetailPage'));
const LibraryApp = lazy(() => import('../pages/Library/App'));
const AffiliateRegister = lazy(() => import('../pages/Affiliates/AffiliateRegister'));
const AffiliatePortal = lazy(() => import('../pages/Affiliates/AffiliatePortal'));
const StudentDashboard = lazy(() => import('../pages/Student/Dashboard/StudentDashboard'));
const LoginPage = lazy(() => import('../pages/Login/LoginPage'));
const StudentCourses = lazy(() => import('../pages/Student/Courses/StudentCourses'));
const StudentBatches = lazy(() => import('../pages/Student/Batches/StudentBatches'));
const StudentAttendance = lazy(() => import('../pages/Student/Attendance/StudentAttendance'));
const StudentLibrary = lazy(() => import('../pages/Student/Library/StudentLibrary'));
const LearningContent = lazy(() => import('../pages/Student/LearningContent/LearningContent'));
const StudentLayout = lazy(() => import('../components/layout/StudentLayout'));
const StudentAssignments = lazy(() => import('../pages/Student/Assignments/StudentAssignments'));
const StudentGrades = lazy(() => import('../pages/Student/Grades/StudentGrades'));
const StudentCertificates = lazy(() => import('../pages/Student/Certificates/StudentCertificates'));
const StudentProfile = lazy(() => import('../pages/Student/Profile/StudentProfile'));
const StudentCalendar = lazy(() => import('../pages/Student/Calendar/StudentCalendar'));
const StudentExams = lazy(() => import('../pages/Student/Exams/StudentExams'));
const StudentNotifications = lazy(() => import('../pages/Student/Notifications/StudentNotifications'));
const StudentWebinars = lazy(() => import('../pages/Student/Webinars/StudentWebinars'));
const StudentTransport = lazy(() => import('../pages/Student/Transport/StudentTransport'));
const StudentHostel = lazy(() => import('../pages/Student/Hostel/StudentHostel'));
const StudentCommunication = lazy(() => import('../pages/Student/Communication/StudentCommunication'));
const StudentReports = lazy(() => import('../pages/Student/Reports/StudentReports'));
const StudentHelpDesk = lazy(() => import('../pages/Student/HelpDesk/StudentHelpDesk'));
const AutomationDashboard = lazy(() => import('../pages/Automation/AutomationDashboard'));
const StudentFeePage = lazy(() => import('../pages/Student/Fee/StudentFeePage'));
const ParentFeePage = lazy(() => import('../pages/Parent/Fee/ParentFeePage'));

const RootRedirect = () => {
  const { user, loading } = useAuth();

  if (loading) return <Loading />;

  const role = user?.role?.toUpperCase();

  if (role === 'STUDENT') {
    return <Navigate to="/student/dashboard" replace />;
  }
  if (role === 'PARENT') {
    return <Navigate to="/parent/dashboard" replace />;
  }
  if (role === 'ADMIN' || role === 'SUPER_ADMIN' || role === 'LIBRARIAN' || role === 'MARKETING_MANAGER' || role === 'INSTRUCTOR' || role === 'DRIVER' || role === 'CONDUCTOR') {
    return <Navigate to="/admin/dashboard" replace />;
  }
  return <Navigate to="/login" replace />;
};

const AppRoutes = () => {
  return (
    <Suspense fallback={<Loading />}>
      <Routes>

        {/* ================= PUBLIC ROUTES ================= */}
        <Route path="/login" element={<LoginPage />} />
        <Route path="/" element={<RootRedirect />} />
        <Route path="/course-overview/:id" element={<CourseOverview />} />
        <Route path="/share/:shareCode" element={<CourseOverview />} />
        <Route path="/affiliate/join" element={<AffiliateRegister />} />

        {/* ================= STUDENT PORTAL ================= */}
        <Route element={<StudentLayout />}>
          <Route path="/student">
            <Route index element={<Navigate to="/student/dashboard" replace />} />
            <Route path="dashboard" element={<StudentDashboard />} />
            <Route path="courses" element={<StudentCourses />} />
            <Route path="batches" element={<StudentBatches />} />
            <Route path="attendance" element={<StudentAttendance />} />
            <Route path="library" element={<StudentLibrary />} />
            <Route path="content/:id?" element={<LearningContent />} />
            <Route path="assignments" element={<StudentAssignments />} />
            <Route path="grades" element={<StudentGrades />} />
            <Route path="exams" element={<StudentExams />} />
            <Route path="calendar" element={<StudentCalendar />} />
            <Route path="webinars" element={<StudentWebinars />} />
            <Route path="transport" element={<StudentTransport />} />
            <Route path="hostel" element={<StudentHostel />} />

            <Route path="communication" element={<StudentCommunication />} />
            <Route path="reports" element={<StudentReports />} />
            <Route path="support" element={<StudentHelpDesk />} />
            <Route path="profile" element={<StudentProfile />} />
            <Route path="certificates" element={<StudentCertificates />} />
            <Route path="notifications" element={<StudentNotifications />} />

            {/* New Student Fee View */}
            <Route path="fee" element={<StudentFeePage />} />

            <Route path="*" element={<NotFound />} />
          </Route>
        </Route>

        {/* ================= ADMIN PORTAL ================= */}
        <Route path="/admin" element={<AdminLayout />}>
          <Route index element={<Navigate to="/admin/dashboard" replace />} />
          <Route path="dashboard" element={<Home />} />

          <Route path="courses" element={<Courses />} />
          <Route path="courses/builder/:id" element={<CourseBuilder />} />

          <Route path="batches" element={<Batches />} />
          <Route path="batches/builder/:id" element={<BatchBuilder />} />
          <Route path="batches/:id/create-class" element={<CreateClass />} />

          <Route path="attendance/*" element={<Attendance />} />
          <Route path="exams/*" element={<Exams />} />
          <Route path="library/*" element={<LibraryApp />} />
          <Route path="users" element={<Users />} />
          <Route path="fee" element={<FeeManagementDashboard />} />
          {/* Legacy isolated module routes removed since Dashboard handles config and ledger views */}
          {/* <Route path="fee/create" element={<FeeCreate />} /> */}
          {/* <Route path="fee/allocation/:id" element={<InstallmentView />} /> */}

          {/* New Fee Modules Routes */}
          <Route path="fee-types" element={<FeeTypeListPage />} />
          <Route path="fee-types/new" element={<FeeTypeFormPage />} />
          <Route path="fee-types/:id/edit" element={<FeeTypeFormPage />} />

          <Route path="fee-structures" element={<FeeStructureListPage />} />
          <Route path="fee-structures/new" element={<FeeStructureFormPage />} />
          <Route path="fee-structures/:id/edit" element={<FeeStructureFormPage />} />

          <Route path="fee-allocations" element={<FeeAllocationListPage />} />
          <Route path="fee-allocations/new" element={<FeeAllocationFormPage />} />
          <Route path="fee-allocations/:id" element={<FeeAllocationDetailPage />} />

          <Route path="marketing" element={<Marketing />} />
          <Route path="affiliates" element={<Affiliates />} />
          <Route path="affiliate/portal" element={<AffiliatePortal />} />
          <Route path="certificates" element={<Certificates />} />
          <Route path="settings" element={<Settings />} />
          <Route path="webinar" element={<Webinar />} />
          <Route path="profile" element={<AdminProfile />} />
          <Route path="automation" element={<AutomationDashboard />} />

          <Route path="academics">
            <Route index element={<Navigate to="/admin/courses" replace />} />
            <Route path="courses" element={<Navigate to="/admin/courses" replace />} />
            <Route path="batches" element={<Navigate to="/admin/batches" replace />} />
            <Route path="webinars" element={<Navigate to="/admin/webinar" replace />} />
            <Route path="attendance" element={<Navigate to="/admin/attendance" replace />} />
          </Route>

          <Route path="*" element={<NotFound />} />
        </Route>

        {/* ================= PARENT PORTAL ================= */}
        <Route path="/parent" element={<AdminLayout />}> {/* Re-using AdminLayout temporarily, or could be ParentLayout */}
          <Route index element={<Navigate to="/parent/dashboard" replace />} />
          <Route path="dashboard" element={<div>Parent Dashboard Coming Soon</div>} />

          {/* New Parent Fee View */}
          <Route path="fee" element={<ParentFeePage />} />
          <Route path="fee/pay" element={<ParentFeePage />} />

          <Route path="*" element={<NotFound />} />
        </Route>

        {/* Legacy redirect for old dashboard path */}
        <Route path="/dashboard" element={<Navigate to="/admin/dashboard" replace />} />

        {/* ===== 404 ===== */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Suspense>
  );
};

export default AppRoutes;
