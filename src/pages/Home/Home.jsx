import React from 'react';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

/* Components */
import NeedsAttention from './components/NeedsAttention';
import RecentActivity from './components/RecentActivity';
import CourseList from './components/CourseList';
import BatchList from './components/BatchList';
import WebinarList from './components/WebinarList';
import { RevenueChart, EnrollmentChart, YearlyGrowthChart } from './components/DashboardCharts';
import StatCard from '../../components/common/StatCard';
import { Calendar, Users, UserPlus, BookOpen, DollarSign } from 'lucide-react';

/* Data */
import {
  statsData,
  upcomingWebinars,
  upcomingBatches,
  recentActivities,
  monthlyRevenueData,
  monthlyEnrollmentData,
  yearlyGrowthData,
  popularCourses
} from './data';

import './Home.css';

import { useNavigate } from 'react-router-dom';
import { useAuth } from '../Library/context/AuthContext';

const Home = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  React.useEffect(() => {
    if (user?.role === 'STUDENT') {
      navigate('/student/dashboard');
    }
  }, [user, navigate]);

  return (
    <div className="dashboard-container">
      <ToastContainer position="top-right" autoClose={3000} />

      {/* ================= SECTION 1: ADMIN COMMAND CENTER (ACTIONABLE) ================= */}

      {/* 1. TOP PRIORITY SUMMARY (Operational) */}
      <div className="row g-4 mb-4">
        <div className="col-12 col-md-6 col-xl-3">
          <StatCard
            title="Active Classes"
            value={statsData.activeClasses}
            icon={Calendar}
            trend="Now"
            trendLabel="Active Batches"
            iconBg="#dbeafe"
            iconColor="#2563eb"
          />
        </div>
        <div className="col-12 col-md-6 col-xl-3">
          <StatCard
            title="Today's Attendance"
            value={statsData.attendanceStatus}
            icon={Users}
            trend="+2%"
            trendLabel="vs Yesterday"
            iconBg="#d1fae5"
            iconColor="#059669"
          />
        </div>
        <div className="col-12 col-md-6 col-xl-3">
          <StatCard
            title="Total Students"
            value={statsData.totalStudents.toLocaleString()}
            icon={UserPlus}
            trend="5%"
            trendLabel="Growth"
            iconBg="#e0e7ff"
            iconColor="#4f46e5"
          />
        </div>
        <div className="col-12 col-md-6 col-xl-3">
          <StatCard
            title="Active Courses"
            value={statsData.totalCourses}
            icon={BookOpen}
            trend="All Time"
            trendLabel="Catalog"
            iconBg="#fef3c7"
            iconColor="#d97706"
          />
        </div>
      </div>

      <div className="row g-4 mb-4">
        <div className="col-12 col-md-6 col-xl-3">
          <StatCard
            title="Total Revenue"
            value={`$${statsData.totalRevenue.toLocaleString()}`}
            icon={DollarSign}
            trend="12%"
            trendLabel="vs last month"
            iconBg="#d1fae5"
            iconColor="#059669"
          />
        </div>
        <div className="col-12 col-md-6 col-xl-3">
          <StatCard
            title="Monthly Revenue"
            value={`$${statsData.monthlyRevenue.toLocaleString()}`}
            icon={DollarSign}
            trend="15%"
            trendLabel="vs prev month"
            iconBg="#dbeafe"
            iconColor="#2563eb"
          />
        </div>
        <div className="col-12 col-md-6 col-xl-3">
          <StatCard
            title="New Joiners"
            value={statsData.totalSignups}
            icon={UserPlus}
            trend="8%"
            trendLabel="this week"
            iconBg="#fef3c7"
            iconColor="#d97706"
          />
        </div>
        <div className="col-12 col-md-6 col-xl-3">
          <StatCard
            title="Pending Fees"
            value={`$${statsData.pendingAmount?.toLocaleString() || '0'}`}
            icon={DollarSign}
            trend="Action"
            trendLabel="Needs Attention"
            iconBg="#fee2e2"
            iconColor="#ef4444"
          />
        </div>
      </div>

      {/* Revenue Chart Full (Moved Up) */}
      <div className="row mt-4">
        <div className="col-12">
          <div className="chart-card-clean">
            <div className="chart-header-clean">
              <div>
                <h3>Monthly Revenue</h3>
                <p className="text-muted">Financial growth overview</p>
              </div>
              <div style={{ position: 'relative' }}>
                <button className="icon-btn-light">
                  <Calendar size={16} />
                </button>
                <input
                  type="month"
                  style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    width: '100%',
                    height: '100%',
                    opacity: 0,
                    cursor: 'pointer'
                  }}
                  onChange={(e) => toast.info(`Filtered revenue by: ${e.target.value}`)}
                  title="Filter by month"
                />
              </div>
            </div>
            <div className="main-chart-wrapper" style={{ height: '400px' }}>
              <RevenueChart data={monthlyRevenueData} />
            </div>
          </div>
        </div>
      </div>

      {/* Monthly Enrollment & Webinars */}
      <div className="row mt-4 g-4">
        <div className="col-12 col-lg-6">
          <div className="chart-card-clean h-100">
            <div className="chart-header-clean">
              <div>
                <h3>Monthly Enrollment</h3>
                <p className="text-muted">Student registration trends</p>
              </div>
              <button className="icon-btn-light">
                <Users size={16} />
              </button>
            </div>
            <div className="main-chart-wrapper">
              <EnrollmentChart data={monthlyEnrollmentData} />
            </div>
          </div>
        </div>

        <div className="col-12 col-lg-6">
          {/* Webinar List reused as 'Upcoming Webinars' panel */}
          <WebinarList webinars={upcomingWebinars} />
        </div>
      </div>

      {/* Needs Attention & Yearly Growth (Moved Down) */}
      <div className="row mt-4 g-4">
        <div className="col-12 col-lg-6">
          <div className="h-100">
            <NeedsAttention />
          </div>
        </div>

        <div className="col-12 col-lg-6">
          <div className="chart-card-clean h-100">
            <div className="chart-header-clean">
              <div>
                <h3>Yearly Student Growth</h3>
                <p className="text-muted">Enrollment trends by year</p>
              </div>
              <button className="icon-btn-light">
                <Users size={16} />
              </button>
            </div>
            <div className="main-chart-wrapper">
              <YearlyGrowthChart data={yearlyGrowthData} />
            </div>
          </div>
        </div>
      </div>

      {/* ================= RECENT ACTIVITY (Moved to Bottom) ================= */}
      <div className="row mt-4">
        <div className="col-12">
          <RecentActivity
            students={recentActivities.students}
            payments={recentActivities.payments}
          />
        </div>
      </div>

    </div>
  );
};

export default Home;
