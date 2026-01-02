import React, { useState } from 'react';
import {
  Users,
  DollarSign,
  TrendingUp,
  CreditCard,
  UserPlus,
  Calendar,
  Layout,
  Bell,
  Search
} from 'lucide-react';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

/* Components */
import StatCard from './components/StatCard';
import RecentActivity from './components/RecentActivity';
import WelcomeBanner from './components/WelcomeBanner';
import CourseList from './components/CourseList';
import InstructorList from './components/InstructorList';
import {
  EnrollmentChart,
  RevenueChart,
  PaymentStatusChart,
  YearlyGrowthChart
} from './components/DashboardCharts';

/* Data */
import {
  statsData,
  monthlyEnrollmentData,
  monthlyRevenueData,
  paymentStatusData,
  yearlyGrowthData,
  recentActivities,
  popularCourses,
  bestInstructors
} from './data';

import './Home.css';

const Home = () => {
  const [selectedMonth, setSelectedMonth] = useState('December');

  const handleNotification = () => {
    toast.info("You have 3 new notifications");
  };

  const handleSearchFocus = () => {
    // Logic for search focus if needed
  };

  return (
    <div className="dashboard-container">
      <ToastContainer position="top-right" autoClose={3000} hideProgressBar={false} newestOnTop={false} closeOnClick rtl={false} pauseOnFocusLoss draggable pauseOnHover />

      {/* Top Bar - Simplified since Navbar exists, but adding page specific controls if needed */}
      <div className="page-header">
        <h1 className="page-title">Dashboard</h1>
        <div className="header-actions">
          <div className="search-bar">
            <Search size={18} className="search-icon" />
            <input type="text" placeholder="Search..." onFocus={handleSearchFocus} />
          </div>
          <button className="action-btn" onClick={handleNotification}>
            <Bell size={20} />
            <span className="notification-dot"></span>
          </button>
          <div className="date-filter">
            <Calendar size={16} />
            <span>Today, 29 Dec</span>
          </div>
        </div>
      </div>

      {/* Hero Section */}
      <div className="dashboard-hero-grid">
        <div className="hero-banner">
          <WelcomeBanner />
        </div>
        <div className="hero-stats">
          <div className="mini-stat-card">
            <div className="mini-content">
              <p className="mini-label">Courses in Progress</p>
              <h3 className="mini-value">5</h3>
            </div>
            <div className="mini-chart">
              {/* Simple CSS Chart or Icon */}
              <div className="chart-bar" style={{ height: '40%' }}></div>
              <div className="chart-bar" style={{ height: '60%' }}></div>
              <div className="chart-bar" style={{ height: '80%' }}></div>
              <div className="chart-bar active" style={{ height: '50%' }}></div>
            </div>
          </div>
          <div className="mini-stat-card">
            <div className="mini-content">
              <p className="mini-label">Forum Discussion</p>
              <h3 className="mini-value">25</h3>
            </div>
            <div className="mini-chart">
              <div className="chart-line"></div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="dashboard-main-grid">
        {/* Left Column: Popular Courses */}
        <div className="grid-col-left">
          <CourseList courses={popularCourses} />
        </div>

        {/* Middle Column: Main Chart */}
        <div className="grid-col-center">
          <div className="chart-card-clean">
            <div className="chart-header-clean">
              <div>
                <h3>Monthly Progress</h3>
                <p>This is the latest improvement</p>
              </div>
              <button className="icon-btn-light"><Calendar size={16} /></button>
            </div>
            <div className="main-chart-wrapper">
              <RevenueChart data={monthlyRevenueData} /> {/* Using Revenue Chart component but logic applies to Progress */}
            </div>
          </div>
        </div>

        {/* Right Column: Best Instructors */}
        <div className="grid-col-right">
          <InstructorList instructors={bestInstructors} />
        </div>
      </div>

      {/* Secondary Stats Row */}
      <div className="stats-row-grid">
        <StatCard
          title="Total Students"
          value={statsData.totalStudents.toLocaleString()}
          icon={Users}
          trend="up"
          trendValue="15%"
          color="#3B82F6"
        />
        <StatCard
          title="Total Revenue"
          value={`$${statsData.totalRevenue.toLocaleString()}`}
          icon={DollarSign}
          trend="up"
          trendValue="12%"
          color="#10B981"
        />
        <StatCard
          title="Pending"
          value={`$${statsData.pendingAmount.toLocaleString()}`}
          icon={CreditCard}
          trend="down"
          trendValue="2%"
          color="#F59E0B"
        />
        <StatCard
          title="New Users"
          value={statsData.newStudents}
          icon={UserPlus}
          trend="up"
          trendValue="5%"
          color="#8B5CF6"
        />
      </div>

      {/* Bottom Section: Charts & Tables */}
      <div className="bottom-grid">
        <div className="bottom-card large">
          <h3 className="section-header">School Performance</h3>
          <div className="chart-area">
            <EnrollmentChart data={monthlyEnrollmentData} />
          </div>
        </div>
        <div className="bottom-card small">
          <h3 className="section-header">Overall Pass Percentage</h3>
          <div className="chart-area">
            <PaymentStatusChart data={paymentStatusData} />
          </div>
        </div>
      </div>

      <div className="activity-section">
        <RecentActivity students={recentActivities.students} payments={recentActivities.payments} />
      </div>

    </div>
  );
};

export default Home;