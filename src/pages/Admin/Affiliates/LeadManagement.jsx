import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import affiliateService from '../../../services/affiliateService';
import apiClient from '../../../services/apiClient';
import { userService } from '../../Users/services/userService';
import { enrollmentService } from '../../Batches/services/enrollmentService';
import AddUserModal from '../../Users/components/AddUserModal';
import './LeadManagement.css';

const LeadManagement = () => {
  const navigate = useNavigate();
  const [leads, setLeads] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedLead, setSelectedLead] = useState(null);
  const [notes, setNotes] = useState([]);
  const [newNote, setNewNote] = useState('');

  // The lead currently being enrolled (opens AddUserModal)
  const [enrollLead, setEnrollLead] = useState(null);

  useEffect(() => { fetchLeads(); }, []);

  const fetchLeads = async () => {
    try {
      const data = await affiliateService.getAllLeads();
      setLeads(data || []);
    } catch (error) {
      console.error('Error fetching leads:', error);
      setLeads([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchNotes = async (leadId) => {
    try {
      const response = await apiClient.get(`/api/admin/leads/${leadId}/notes`);
      setNotes(response.data || []);
    } catch (error) {
      console.error('Error fetching notes:', error);
      setNotes([]);
    }
  };

  const handleAddNote = async (e) => {
    e.preventDefault();
    if (!newNote.trim()) return;
    try {
      await apiClient.post(`/api/admin/leads/${selectedLead.id}/notes`, { note: newNote, createdBy: 'ADMIN' });
      setNewNote('');
      fetchNotes(selectedLead.id);
    } catch (error) {
      alert('Error adding note');
    }
  };

  const handleStatusChange = async (id, newStatus) => {
    try {
      await affiliateService.updateLeadStatus(id, newStatus, 'ADMIN', 'Status updated by admin');
      fetchLeads();
    } catch (error) {
      alert('Error updating status');
    }
  };

  // Called after admin fills and submits the LearnerForm
  const handleStudentCreated = async (userData) => {
    const batchId = enrollLead?.batchId;
    try {
      // Step 1: Create student account
      const result = await userService.createUser({ ...userData, role: 'Student' });
      const studentId = result?.studentId || result?.id || result?.userId || result?.user?.userId;
      const userId = result?.user?.userId || result?.userId || result?.id || studentId;

      // Step 2: Explicitly enroll in the batch (backend doesn't auto-enroll from batchId)
      if (batchId && studentId) {
        try {
          await enrollmentService.addStudentToBatch({
            studentId: studentId,
            batchId: batchId,
            userId: userId
          });
        } catch (enrollErr) {
          console.warn('Batch enrollment error (non-critical):', enrollErr);
        }
      }

      // Step 3: Convert the lead (marks as ENROLLED, triggers commission)
      if (enrollLead) {
        try {
          await affiliateService.convertLead(enrollLead.id, studentId, 0);
        } catch (convErr) {
          console.warn('Lead conversion error (non-critical):', convErr);
        }
      }

      setEnrollLead(null);
      fetchLeads();

      // Step 4: Navigate to the batch control page
      if (batchId) {
        navigate(`/admin/batches/builder/${batchId}`);
      }
    } catch (err) {
      alert('Error creating student: ' + (err?.response?.data?.message || err.message || 'Unknown error'));
    }
  };

  if (loading) return (
    <div className="d-flex align-items-center justify-content-center py-5 text-muted">
      <span className="spinner-border spinner-border-sm me-2" /> Loading leads…
    </div>
  );

  return (
    <div className="container-fluid py-4">
      <div className="d-flex flex-column flex-md-row justify-content-between align-items-start align-items-md-center gap-3 mb-4">
        <div>
          <h2 className="h4 fw-bold mb-1 text-dark">Lead Management &amp; CRM</h2>
          <p className="text-muted small mb-0">Track referrals, add notes, and convert leads to enrollments.</p>
        </div>
        <button className="btn btn-primary px-4 rounded-3 shadow-sm" onClick={fetchLeads}>
          Refresh Data
        </button>
      </div>

      <div className="row">
        <div className={selectedLead ? 'col-md-8' : 'col-md-12'}>
          <div className="card shadow-sm border-0 rounded-4 overflow-hidden">
            <div className="card-body p-0">
              <div className="table-responsive">
                <table className="table table-hover align-middle mb-0">
                  <thead className="table-light">
                    <tr>
                      <th className="ps-4 py-3 text-muted fw-semibold small text-uppercase">Lead Details</th>
                      <th className="py-3 text-muted fw-semibold small text-uppercase">Source Info</th>
                      <th className="py-3 text-muted fw-semibold small text-uppercase">Status</th>
                      <th className="pe-4 py-3 text-muted fw-semibold small text-uppercase text-end">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {(Array.isArray(leads) ? leads : []).map(lead => (
                      <tr key={lead.id} className={selectedLead?.id === lead.id ? 'table-primary' : ''}>
                        <td className="ps-4">
                          <div className="d-flex align-items-center gap-3 py-2">
                            <div className="bg-primary bg-opacity-10 text-primary rounded-circle d-flex align-items-center justify-content-center fw-bold text-uppercase flex-shrink-0" style={{ width: 40, height: 40 }}>
                              {lead.name?.charAt(0)}
                            </div>
                            <div>
                              <div className="fw-bold text-dark">{lead.name}</div>
                              <div className="small text-muted d-flex flex-column gap-1">
                                <span>{lead.email}</span>
                                <span>{lead.mobile}</span>
                              </div>
                            </div>
                          </div>
                        </td>
                        <td>
                          <div className="fw-medium text-dark">Batch #{lead.batchId}</div>
                          <div className="d-flex align-items-center gap-2 mt-1">
                            <span className="badge bg-light text-dark border fw-normal" style={{ fontSize: '0.7rem' }}>{lead.leadSource || 'AFFILIATE'}</span>
                            <span className="badge bg-secondary bg-opacity-10 text-secondary border-0" style={{ fontSize: '0.7rem' }}>AFF-{lead.affiliateId}</span>
                          </div>
                          {lead.studentDiscountValue > 0 && (
                            <div className="text-success small mt-1">
                              <i className="bi bi-tag-fill me-1" />{lead.studentDiscountValue}% discount
                            </div>
                          )}
                        </td>
                        <td>
                          <span className={`badge border-0 px-2 py-1 bg-opacity-10 ${getStatusBadgeClass(lead.status)}`}>
                            {lead.status}
                          </span>
                        </td>
                        <td className="pe-4 text-end">
                          <div className="d-flex justify-content-end gap-2 align-items-center">
                            {lead.status !== 'ENROLLED' ? (
                              <select
                                className="form-select form-select-sm w-auto rounded-3 shadow-none border-light-subtle"
                                value={lead.status}
                                onChange={(e) => handleStatusChange(lead.id, e.target.value)}
                                style={{ minWidth: 120, fontSize: '0.8rem' }}
                              >
                                <option value="NEW">NEW</option>
                                <option value="CONTACTED">CONTACTED</option>
                                <option value="INTERESTED">INTERESTED</option>
                                <option value="REJECTED">REJECTED</option>
                                <option value="LOST">LOST</option>
                              </select>
                            ) : (
                              <span className="text-success small fw-bold me-2">
                                <i className="bi bi-check-circle-fill me-1" /> Completed
                              </span>
                            )}

                            {lead.status === 'INTERESTED' && (
                              <button
                                onClick={() => setEnrollLead(lead)}
                                className="btn btn-success btn-sm rounded-3 px-3 fw-bold"
                              >
                                Enroll
                              </button>
                            )}

                            <button
                              className={`btn btn-sm rounded-3 px-3 fw-semibold ${selectedLead?.id === lead.id ? 'btn-primary' : 'btn-light border text-dark'}`}
                              onClick={() => { setSelectedLead(lead); fetchNotes(lead.id); }}
                            >
                              Notes
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>

        {selectedLead && (
          <div className="col-md-4">
            <div className="card shadow border-0 rounded-4 sticky-top" style={{ top: '20px' }}>
              <div className="card-header bg-white border-bottom-0 d-flex justify-content-between align-items-center p-4 pb-0">
                <div>
                  <h5 className="mb-0 fw-bold border-bottom border-primary border-2 d-inline-block pb-1">Notes</h5>
                  <div className="text-muted small mt-1 text-truncate" style={{ maxWidth: 200 }}>{selectedLead.name}</div>
                </div>
                <button className="btn-close shadow-none" onClick={() => setSelectedLead(null)} />
              </div>
              <div className="card-body p-4">
                <form onSubmit={handleAddNote} className="mb-4">
                  <div className="input-group shadow-sm rounded-3 overflow-hidden">
                    <input type="text" className="form-control border-light-subtle py-2 px-3 shadow-none"
                      placeholder="Type a follow-up note..." value={newNote}
                      onChange={e => setNewNote(e.target.value)} style={{ fontSize: '0.9rem' }} />
                    <button className="btn btn-primary px-3 fw-bold" type="submit">Add</button>
                  </div>
                </form>
                <div className="notes-list overflow-auto pe-2" style={{ maxHeight: '400px' }}>
                  {(!Array.isArray(notes) || notes.length === 0) ? (
                    <div className="text-center py-5">
                      <div className="text-muted mb-2"><i className="bi bi-chat-square-dots fs-3 opacity-50" /></div>
                      <p className="text-muted small mb-0">No notes added yet.</p>
                    </div>
                  ) : notes.map(note => (
                    <div key={note.id} className="mb-3 p-3 bg-light rounded-4 border border-light-subtle position-relative">
                      <div className="position-absolute top-0 start-0 h-100 bg-primary rounded-start-4" style={{ width: '4px' }} />
                      <p className="mb-2 text-dark" style={{ fontSize: '0.9rem', lineHeight: 1.5 }}>{note.note}</p>
                      <div className="d-flex justify-content-between align-items-center text-muted" style={{ fontSize: '0.75rem' }}>
                        <span className="fw-medium"><i className="bi bi-person-circle me-1" />{note.createdBy}</span>
                        <span><i className="bi bi-clock me-1" />{new Date(note.createdAt).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' })}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* ── AddUserModal pre-filled from lead ── */}
      {enrollLead && (
        <AddUserModal
          setIsModalOpen={(open) => { if (!open) setEnrollLead(null); }}
          onAddUser={handleStudentCreated}
          initialUser={{
            role: 'Student',
            name: enrollLead.name,
            email: enrollLead.email,
            mobile: enrollLead.mobile,
            batchId: enrollLead.batchId
          }}
        />
      )}
    </div>
  );
};

const getStatusBadgeClass = (status) => {
  switch (status) {
    case 'NEW': return 'text-info bg-info';
    case 'CONTACTED': return 'text-warning bg-warning';
    case 'INTERESTED': return 'text-primary bg-primary';
    case 'ENROLLED': return 'text-success bg-success';
    case 'REJECTED': return 'text-danger bg-danger';
    case 'LOST': return 'text-secondary bg-secondary';
    default: return 'text-dark bg-light';
  }
};

export default LeadManagement;
