import React, { useState } from 'react';
import { FiDollarSign, FiUsers, FiBarChart2, FiSettings, FiPlus, FiDownload, FiSearch, FiFilter } from 'react-icons/fi';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import './AffiliateMarketing.css';

const AffiliateMarketing = () => {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [searchTerm, setSearchTerm] = useState('');

  // Mock Chart Data
  const data = [
    { name: 'Jan', revenue: 4000 },
    { name: 'Feb', revenue: 3000 },
    { name: 'Mar', revenue: 2000 },
    { name: 'Apr', revenue: 2780 },
    { name: 'May', revenue: 1890 },
    { name: 'Jun', revenue: 2390 },
    { name: 'Jul', revenue: 3490 },
    { name: 'Aug', revenue: 5200 },
  ];

  return (
    <div className="affiliate-page">
      <header className="affiliate-header">
        <div className="page-title">
          <h1>Affiliate Program</h1>
          <p>Manage your partners, commissions, and payouts.</p>
        </div>
        <div className="marketing-actions">
          <button className={`btn-tab ${activeTab === 'dashboard' ? 'active' : ''}`} onClick={() => setActiveTab('dashboard')}>Dashboard</button>
          <button className={`btn-tab ${activeTab === 'affiliates' ? 'active' : ''}`} onClick={() => setActiveTab('affiliates')}>Affiliates</button>
          <button className={`btn-tab ${activeTab === 'payouts' ? 'active' : ''}`} onClick={() => setActiveTab('payouts')}>Payouts</button>
          <button className="btn-primary ms-3" style={{ display: 'flex', gap: 8, alignItems: 'center' }}><FiPlus /> Add Affiliate</button>
        </div>
      </header>

      {activeTab === 'dashboard' && (
        <>
          {/* Overview Cards */}
          <div className="affiliate-summary">
            <div className="summary-card highlight">
              <div>
                <div className="summary-label">Total Revenue Generated</div>
                <div className="summary-value">$45,200.00</div>
              </div>
              <div className="chart-placeholder" style={{ height: 100, width: '100%', marginTop: 20 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={data}>
                    <defs>
                      <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.8} />
                        <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <Area type="monotone" dataKey="revenue" stroke="#3b82f6" fillOpacity={1} fill="url(#colorRev)" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>
            <div className="summary-card">
              <div className="summary-label">Commissions Paid</div>
              <div className="summary-value">$8,450.00</div>
              <div style={{ marginTop: 'auto', fontSize: 13, color: '#16a34a' }}>
                <FiBarChart2 style={{ marginRight: 4 }} /> +15% vs last month
              </div>
            </div>
            <div className="summary-card">
              <div className="summary-label">Active Affiliates</div>
              <div className="summary-value">124</div>
              <div style={{ marginTop: 'auto', fontSize: 13, color: '#64748b' }}>
                <FiUsers style={{ marginRight: 4 }} /> 12 pending approval
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="affiliate-table-container">
            <div className="table-header">
              <h3>Top Performing Affiliates</h3>
              <div style={{ display: 'flex', gap: 12 }}>
                <button className="status-tag active" style={{ border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6 }}><FiDownload /> Download Report</button>
              </div>
            </div>

            <table className="aff-table">
              <thead>
                <tr>
                  <th>Affiliate Name</th>
                  <th>Referrals</th>
                  <th>Conversion Rate</th>
                  <th>Revenue Ref.</th>
                  <th>Commission</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {[1, 2, 3, 4, 5].map((i) => (
                  <tr key={i}>
                    <td>
                      <div className="affiliate-user">
                        <div className="user-avt">
                          {['JD', 'AS', 'MR', 'TK', 'PL'][i - 1]}
                        </div>
                        <div>
                          <div style={{ fontWeight: 600 }}>
                            {['John Doe', 'Anna Smith', 'Mike Ross', 'Tom King', 'Penny Lane'][i - 1]}
                          </div>
                          <div style={{ fontSize: 12, color: '#94a3b8' }}>ID: #{2000 + i}</div>
                        </div>
                      </div>
                    </td>
                    <td>{120 + i * 15}</td>
                    <td>{(2.5 + i * 0.4).toFixed(1)}%</td>
                    <td>${(5000 + i * 850).toLocaleString()}</td>
                    <td style={{ fontWeight: 700 }}>${(750 + i * 125).toLocaleString()}</td>
                    <td>
                      <span className={`status-tag ${i === 4 ? 'pending' : 'active'}`}>
                        {i === 4 ? 'Pending' : 'Active'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}

      {activeTab === 'affiliates' && (
        <div className="affiliate-table-container">
          <div className="users-controls mb-0" style={{ padding: '16px 24px' }}>
            <div className="search-box">
              <FiSearch />
              <input
                type="text"
                placeholder="Search affiliates..."
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
              />
            </div>
            <div className="filter-box">
              <FiFilter />
              <select><option>Status: All</option><option>Active</option><option>Pending</option></select>
            </div>
          </div>
          <table className="aff-table">
            <thead>
              <tr><th>Name</th><th>Date Joined</th><th>Link Clicks</th><th>Status</th><th>Actions</th></tr>
            </thead>
            <tbody>
              <tr><td colSpan="5" style={{ textAlign: 'center', padding: 40, color: '#94a3b8' }}>No affiliates found...</td></tr>
            </tbody>
          </table>
        </div>
      )}

      {/* Settings Section Preview */}
      {activeTab === 'dashboard' && (
        <>
          <h3 style={{ marginTop: 40, marginBottom: 16 }}>Commission Rules</h3>
          <div className="commission-settings">
            <div className="st-group">
              <label>Default Commission Rate (%)</label>
              <input type="number" className="st-input" placeholder="e.g. 15" defaultValue={15} />
            </div>
            <div className="st-group">
              <label>Minimum Payout Amount ($)</label>
              <input type="number" className="st-input" placeholder="e.g. 100" defaultValue={50} />
            </div>
            <button className="btn-save">Save Changes</button>
          </div>
        </>
      )}

    </div>
  )
}

export default AffiliateMarketing