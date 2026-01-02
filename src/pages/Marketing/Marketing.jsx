import React, { useState } from 'react';
import { FiTrendingUp, FiMail, FiTag, FiUsers, FiPlus, FiArrowRight, FiPieChart, FiSend } from 'react-icons/fi';
import './Marketing.css';

const Marketing = () => {
  const [activeTab, setActiveTab] = useState('overview');

  return (
    <div className="marketing-page">
      <header className="marketing-header">
        <div className="page-title">
          <h1>Marketing Hub</h1>
          <p>Manage campaigns, track performance, and grow your audience.</p>
        </div>
        <div className="marketing-actions">
          <button className="btn-secondary">View Reports</button>
          <button className="btn-primary"><FiPlus /> Create Campaign</button>
        </div>
      </header>

      {/* Stats Overview */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon-wrapper" style={{ background: '#eff6ff', color: '#3b82f6' }}>
            <FiMail />
          </div>
          <span className="stat-label">Total Emails Sent</span>
          <span className="stat-value">124,500</span>
          <span className="stat-trend trend-up"><FiTrendingUp /> +12% this month</span>
        </div>
        <div className="stat-card">
          <div className="stat-icon-wrapper" style={{ background: '#f0fdf4', color: '#16a34a' }}>
            <FiUsers />
          </div>
          <span className="stat-label">New Leads</span>
          <span className="stat-value">8,432</span>
          <span className="stat-trend trend-up"><FiTrendingUp /> +5.4% this month</span>
        </div>
        <div className="stat-card">
          <div className="stat-icon-wrapper" style={{ background: '#fff7ed', color: '#ea580c' }}>
            <FiTag />
          </div>
          <span className="stat-label">Coupons Redeemed</span>
          <span className="stat-value">1,205</span>
          <span className="stat-trend trend-down"><FiArrowRight style={{ transform: 'rotate(45deg)' }} /> -2.1% this month</span>
        </div>
        <div className="stat-card">
          <div className="stat-icon-wrapper" style={{ background: '#fafaef', color: '#ca8a04' }}>
            <FiPieChart />
          </div>
          <span className="stat-label">Conversion Rate</span>
          <span className="stat-value">3.2%</span>
          <span className="stat-trend trend-up"><FiTrendingUp /> +0.8% this month</span>
        </div>
      </div>

      {/* Tabs */}
      <div className="marketing-tabs">
        <button
          className={`tab-btn ${activeTab === 'overview' ? 'active' : ''}`}
          onClick={() => setActiveTab('overview')}
        >
          Overview
        </button>
        <button
          className={`tab-btn ${activeTab === 'campaigns' ? 'active' : ''}`}
          onClick={() => setActiveTab('campaigns')}
        >
          Email Campaigns
        </button>
        <button
          className={`tab-btn ${activeTab === 'coupons' ? 'active' : ''}`}
          onClick={() => setActiveTab('coupons')}
        >
          Coupons & Discounts
        </button>
        <button
          className={`tab-btn ${activeTab === 'automations' ? 'active' : ''}`}
          onClick={() => setActiveTab('automations')}
        >
          Automations
        </button>
      </div>

      {/* Content Area */}
      <div className="campaigns-section">
        <div className="section-header">
          <h3>Active Campaigns</h3>
          <button style={{ background: 'none', border: 'none', color: '#3b82f6', fontWeight: 600, cursor: 'pointer' }}>View All</button>
        </div>

        <div className="campaign-list">
          {[1, 2, 3].map((i) => (
            <div className="campaign-card" key={i}>
              <div className="campaign-info">
                <div className="campaign-icon">
                  <FiSend size={20} />
                </div>
                <div className="campaign-details">
                  <h4>{i === 1 ? 'Summer Sale Blast' : i === 2 ? 'New Course Launch' : 'Weekly Newsletter'}</h4>
                  <div className="campaign-meta">
                    <span>Email Campaign</span>
                    <span>•</span>
                    <span>Sent: {new Date().toLocaleDateString()}</span>
                  </div>
                </div>
              </div>

              <div className="campaign-stats">
                <div className="c-stat">
                  <span className="c-stat-val">45%</span>
                  <span className="c-stat-label">Open Rate</span>
                </div>
                <div className="c-stat">
                  <span className="c-stat-val">12%</span>
                  <span className="c-stat-label">Click Rate</span>
                </div>
                <div className="c-stat">
                  <span className={`status-badge ${i === 3 ? 'scheduled' : 'active'}`}>
                    {i === 3 ? 'Scheduled' : 'Active'}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export default Marketing