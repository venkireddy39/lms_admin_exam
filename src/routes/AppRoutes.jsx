import React, { Suspense, lazy } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import DashboardLayout from '../components/layout/DashboardLayOut';
import Loading from '../components/common/Loading';

// Lazy Load Pages for Performance Optimization
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
const AffiliateMarketing = lazy(() => import('../pages/AffiliateMarketing/AffiliateMarketing'));
const Users = lazy(() => import('../pages/Users/Users'));
const Settings = lazy(() => import('../pages/Settings/Settings'));
const NotFound = lazy(() => import('../pages/NotFound'));

const AppRoutes = () => {
  return (
    <Suspense fallback={<Loading />}>
      <Routes>
        {/* Main Application Routes wrapped in Dashboard Layout */}
        <Route element={<DashboardLayout />}>
          <Route path="/" element={<Home />} />

          <Route path="/courses" element={<Courses />} />
          <Route path="/courses/*" element={<Navigate to="/courses" replace />} />
          <Route path="/batches" element={<Batches />} />

          <Route path="/users" element={<Users />} />
          <Route path="/exams/*" element={<Exams />} />
          <Route path="/webinar/*" element={<Webinar />} />
          <Route path="/attendance" element={<Attendance />} />
          <Route path="/certificates" element={<Certificates />} />
          <Route path="/marketing" element={<Marketing />} />
          <Route path="/affiliatemarketing" element={<AffiliateMarketing />} />
          <Route path="/myapp" element={<MyApp />} />
          <Route path="/websites" element={<Websites />} />
          <Route path="/settings" element={<Settings />} />

          {/* Catch-all 404 Route */}
          <Route path="*" element={<NotFound />} />
        </Route>
      </Routes>
    </Suspense>
  )
}

export default AppRoutes
