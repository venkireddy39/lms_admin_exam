import React, { useState, useEffect } from 'react';
import { FiDollarSign, FiUsers, FiBarChart2, FiSettings, FiPlus, FiDownload, FiSearch, FiFilter, FiLink, FiCopy, FiCheckCircle, FiAlertTriangle } from 'react-icons/fi';
import AffiliateForm from './components/AffiliateForm';
import AffiliateLinkForm from './components/AffiliateLinkForm';
import AffiliateDetails from './components/AffiliateDetails';
import LeadManagement from '../Admin/Affiliates/LeadManagement';
import SalesManagement from '../Admin/Affiliates/SalesManagement';
import affiliateService from '../../services/affiliateService';
import './Affiliates.css';

const Affiliates = () => {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [selectedAffiliate, setSelectedAffiliate] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');

  // Modal State
  const [showModal, setShowModal] = useState(false);
  const [showAssignmentModal, setShowAssignmentModal] = useState(false);

  // Data State
  const [affiliatesList, setAffiliatesList] = useState([]);
  const [loading, setLoading] = useState(true);

  // Fetch Affiliates on mount
  useEffect(() => {
    fetchAffiliates();
  }, []);

  const fetchAffiliates = async () => {
    try {
      setLoading(true);
      const data = await affiliateService.getAllAffiliates();
      console.log("[Affiliates] Fetched data:", typeof data);

      if (Array.isArray(data)) {
        setAffiliatesList(data);
      } else {
        console.warn("[Affiliates] Received non-array data from API:", data);
        setAffiliatesList([]);
      }
    } catch (error) {
      console.error('Failed to fetch affiliates', error);
      // fallback to empty list on error
      setAffiliatesList([]);
    } finally {
      setLoading(false);
    }
  };

  // Placeholder for real stats (to be connected to a metrics API)
  const stats = {
    totalRevenue: 0,
    commissionsPaid: 0,
    activeAffiliates: (affiliatesList || []).length,
    pendingAffiliates: (Array.isArray(affiliatesList) ? affiliatesList : []).filter(a => a?.status === 'PENDING').length
  };

  return (
    <div className="affiliate-page">
      <header className="affiliate-header">
        <div className="page-title">
          <h1>Affiliate Management</h1>
          <p>Partner management, commission tracking, and payouts.</p>
        </div>
        <div className="marketing-actions">
          <button className={`btn-tab ${activeTab === 'dashboard' ? 'active' : ''}`} onClick={() => setActiveTab('dashboard')}>Dashboard</button>
          <button className={`btn-tab ${activeTab === 'affiliates' ? 'active' : ''}`} onClick={() => setActiveTab('affiliates')}>Affiliates</button>
          <button className={`btn-tab ${activeTab === 'referrals' ? 'active' : ''}`} onClick={() => setActiveTab('referrals')}>Leads Tracker</button>
          <button className={`btn-tab ${activeTab === 'payouts' ? 'active' : ''}`} onClick={() => setActiveTab('payouts')}>P/L & Sales</button>
          <button className={`btn-tab ${activeTab === 'commission' ? 'active' : ''}`} onClick={() => setActiveTab('commission')}>Rules</button>
          <button className={`btn-tab ${activeTab === 'settings' ? 'active' : ''}`} onClick={() => setActiveTab('settings')}>Settings</button>
        </div>
      </header>

      {/* DASHBOARD TAB */}
      {activeTab === 'dashboard' && (
        <>
          <div className="affiliate-summary">
            <div className="summary-card highlight">
              <div>
                <div className="summary-label">Total Revenue Generated</div>
                <div className="summary-value">₹ {stats.totalRevenue.toLocaleString()}</div>
              </div>
              <div className="text-white text-opacity-50 small mt-4">
                <FiBarChart2 className="me-1" /> Metrics will update as links are shared
              </div>
            </div>
            <div className="summary-card">
              <div className="d-flex justify-content-between">
                <div>
                  <div className="summary-label">Commissions Paid</div>
                  <div className="summary-value">₹ {stats.commissionsPaid.toLocaleString()}</div>
                </div>
                <div className="p-2 rounded-circle bg-green-subtle text-green">
                  <FiDollarSign size={24} color="#16a34a" />
                </div>
              </div>
              <div style={{ marginTop: 'auto', fontSize: 13, color: '#16a34a' }}>
                <FiBarChart2 className="me-1" /> Accurate to current payouts
              </div>
            </div>
            <div className="summary-card">
              <div className="d-flex justify-content-between">
                <div>
                  <div className="summary-label">Active Affiliates</div>
                  <div className="summary-value">{stats.activeAffiliates}</div>
                </div>
                <div className="p-2 rounded-circle bg-blue-subtle text-blue">
                  <FiUsers size={24} color="#3b82f6" />
                </div>
              </div>
              <div style={{ marginTop: 'auto', fontSize: 13, color: '#64748b' }}>
                <span className="badge bg-warning-subtle text-warning">{stats.pendingAffiliates} Pending</span>
              </div>
            </div>
          </div>

          <div className="table-responsive bg-white rounded shadow-sm border p-0 overflow-auto" style={{ maxWidth: '100%' }}>
            <div className="table-header border-bottom px-4 py-3">
              <h5 className="mb-0 fw-bold text-dark">Top Performing Affiliates</h5>
            </div>
            <table className="table table-hover align-middle mb-0 min-w-800">
              <thead className="table-light">
                <tr>
                  <th className="ps-4">Affiliate Name</th>
                  <th>Type</th>
                  <th>Referrals</th>
                  <th>Revenue Ref.</th>
                  <th>Commission</th>
                  <th className="pe-4">Status</th>
                </tr>
              </thead>
              <tbody>
                {(Array.isArray(affiliatesList) && affiliatesList.length > 0) ? (
                  (Array.isArray(affiliatesList) ? affiliatesList : []).slice(0, 5).map((aff) => (
                    <tr key={aff.id}>
                      <td className="ps-4">
                        <div className="d-flex align-items-center gap-2">
                          <div className="bg-primary bg-opacity-10 text-primary rounded-circle d-flex align-items-center justify-content-center fw-bold text-uppercase" style={{ width: 32, height: 32, fontSize: '0.75rem' }}>
                            {aff.name.charAt(0)}
                          </div>
                          <div>
                            <div className="fw-bold text-dark text-sm">{aff.name}</div>
                            <div className="text-muted text-xs">{aff.systemCode || 'ID: ' + aff.id}</div>
                          </div>
                        </div>
                      </td>
                      <td>{aff.affiliateType || 'Individual'}</td>
                      <td className="fw-bold text-dark">0</td>
                      <td className="text-secondary">₹ 0</td>
                      <td className="fw-bold text-success">₹ 0</td>
                      <td className="pe-4">
                        <span className="badge bg-success bg-opacity-10 text-success">
                          {aff.status || 'ACTIVE'}
                        </span>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="6" className="text-center py-5 text-muted">
                      No data available
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </>
      )}

      {/* AFFILIATES TAB */}
      {activeTab === 'affiliates' && (
        <div className="affiliate-table-container">
          <div className="users-controls mb-0" style={{ padding: '16px 24px', display: 'flex', gap: 12 }}>
            <div className="search-box" style={{ flex: 1 }}>
              <FiSearch />
              <input type="text" placeholder="Search affiliates..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} />
            </div>
            <div className="filter-box">
              <select className="form-select" style={{ padding: '10px', borderRadius: 10, borderColor: '#e2e8f0' }}>
                <option>Type: All</option>
                <option>Individual</option>
                <option>Organization</option>
                <option>Influencer</option>
              </select>
            </div>
            <button className="btn-primary" style={{ display: 'flex', gap: 8, alignItems: 'center' }} onClick={() => setShowModal(true)}><FiPlus /> Add New</button>
          </div>
          <div className="table-responsive bg-white rounded shadow-sm border">
            <table className="table table-hover align-middle mb-0">
              <thead className="table-light">
                <tr>
                  <th className="ps-4">Name</th>
                  <th>Type</th>
                  <th>Referrals</th>
                  <th>Risk</th>
                  <th>Status</th>
                  <th className="text-end pe-4">Actions</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan="6" className="text-center py-4">Loading affiliates...</td>
                  </tr>
                ) : affiliatesList.length === 0 ? (
                  <tr>
                    <td colSpan="6" className="text-center py-4 text-muted">No affiliates found. Create your first one!</td>
                  </tr>
                ) : (Array.isArray(affiliatesList) ? affiliatesList : [])
                  .filter(a => a?.name?.toLowerCase().includes(searchTerm.toLowerCase()))
                  .map(aff => (
                    <tr key={aff.id} onClick={() => setSelectedAffiliate(aff)} style={{ cursor: 'pointer' }}>
                      <td className="ps-4">
                        <div className="d-flex align-items-center gap-3">
                          <div className="bg-primary bg-opacity-10 text-primary rounded-circle d-flex align-items-center justify-content-center fw-bold text-uppercase" style={{ width: 40, height: 40 }}>
                            {aff.name.charAt(0)}
                          </div>
                          <div>
                            <div className="fw-bold text-dark">{aff.name}</div>
                            <div className="small text-muted">{aff.email}</div>
                          </div>
                        </div>
                      </td>
                      <td>
                        <span className="badge bg-light text-dark border fw-normal">Individual</span>
                      </td>

                      <td className="fw-bold">0</td>
                      <td>
                        <span className="badge bg-success bg-opacity-10 text-success border-0">Low</span>
                      </td>
                      <td>
                        <span className="badge bg-success bg-opacity-10 text-success">
                          ACTIVE
                        </span>
                      </td>
                      <td className="text-end pe-4">
                        <button
                          className="btn btn-sm btn-outline-primary me-2"
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedAffiliate(aff);
                            setShowAssignmentModal(true);
                          }}
                        >
                          <FiLink className="me-1" /> Link
                        </button>
                        <button
                          className="btn btn-sm btn-outline-secondary"
                          onClick={(e) => { e.stopPropagation(); setSelectedAffiliate(aff); }}
                        >
                          View Details
                        </button>
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* REFERRALS TAB (Leads Tracker) */}
      {activeTab === 'referrals' && (
        <div className="bg-white rounded shadow-sm border p-3">
          <LeadManagement />
        </div>
      )}

      {/* PAYOUTS TAB (Sales Management) */}
      {activeTab === 'payouts' && (
        <div className="bg-white rounded shadow-sm border p-3">
          <SalesManagement />
        </div>
      )}

      {/* COMMISSION RULES TAB */}
      {activeTab === 'commission' && (
        <div className="row">
          <div className="col-md-8">
            <div className="card shadow-sm border-0">
              <div className="card-body">
                <div className="d-flex justify-content-between align-items-center mb-4">
                  <h5 className="mb-0">Link & Commission Rules</h5>
                  <button className="btn btn-primary d-flex align-items-center gap-2 px-4 shadow-sm" style={{ borderRadius: '10px' }} onClick={() => setShowAssignmentModal(true)}>
                    <FiLink size={18} /> Generate Tracking Link
                  </button>
                </div>
                <p className="text-muted">Define special commission structures for specific batches and affiliates.</p>

                {/* Mock Rules List */}
                <div className="p-3 bg-light rounded text-center text-muted">
                  No special rules configured. Default affiliate strategy applies.
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* SETTINGS TAB */}
      {activeTab === 'settings' && (
        <div className="commission-settings" style={{ maxWidth: 600 }}>
          <h3 className="mb-4">Affiliate Program Settings</h3>
          <div className="st-group">
            <label className="d-flex justify-content-between align-items-center mb-2">
              Enable Affiliate Program
              <div className="form-check form-switch">
                <input className="form-check-input" type="checkbox" defaultChecked />
              </div>
            </label>
            <p className="small text-muted">If disabled, new signups will be paused.</p>
          </div>
          <hr className="my-4" style={{ borderColor: '#f1f5f9' }} />
          <div className="st-group">
            <label>Global Default Commission (%)</label>
            <input type="number" className="st-input" placeholder="e.g. 15" defaultValue={15} />
          </div>
          <div className="st-group">
            <label>Minimum Payout Threshold ($)</label>
            <input type="number" className="st-input" placeholder="e.g. 50" defaultValue={50} />
          </div>
          <button className="btn-save">Save Configuration</button>
        </div>
      )}

      {/* AFFILIATE DETAILS MODAL */}
      {selectedAffiliate && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50" style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1050 }}>
          <div className="animate-scale-up w-full max-w-4xl" style={{ width: '100%', maxWidth: 800, maxHeight: '90vh' }}>
            <AffiliateDetails
              affiliate={selectedAffiliate}
              onClose={() => setSelectedAffiliate(null)}
            />
          </div>
        </div>
      )}

      {/* CREATE MODAL */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-60 d-flex align-items-center justify-content-center animate-fade-in" style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, zIndex: 1050, backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div className="bg-white rounded-5 shadow-2xl w-full max-w-2xl animate-scale-up-fast overflow-hidden" style={{ width: '95%', maxWidth: 650, maxHeight: '90vh' }}>
            <div className="p-0 h-100 overflow-auto">
              <AffiliateForm
                onSubmit={(data) => {
                  fetchAffiliates(); // Refresh list after creation
                  setShowModal(false);
                }}
                onCancel={() => setShowModal(false)}
              />
            </div>
          </div>
        </div>
      )}

      {/* BATCH ASSIGNMENT MODAL (Commission Rules) */}
      {showAssignmentModal && (
        <div className="fixed inset-0 bg-black bg-opacity-60 d-flex align-items-center justify-content-center animate-fade-in" style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, zIndex: 1050, backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div className="bg-white rounded-5 shadow-2xl w-full max-w-2xl animate-scale-up-fast overflow-hidden" style={{ width: '95%', maxWidth: 800, maxHeight: '92vh' }}>
            <AffiliateLinkForm
              initialAffiliate={selectedAffiliate}
              onSave={(data) => {
                console.log("Link Generated:", data);
              }}
              onCancel={() => {
                setShowAssignmentModal(false);
                setSelectedAffiliate(null);
              }}
            />
          </div>
        </div>
      )}
    </div>
  )
}

export default Affiliates;