import React from 'react';
import { FaDownload } from 'react-icons/fa';
import CertificateRenderer from '../renderer/CertificateRenderer';

const ManualIssue = ({
    issueData,
    setIssueData,
    templates,
    handleIssueCertificate,
    settings
}) => {
    return (
        <div className="row g-4 animate-fade-in">
            <div className="col-lg-5">
                <div className="card border-0 shadow-sm rounded-4">
                    <div className="card-header bg-white border-0 pt-4 px-4">
                        <h5 className="fw-bold">Issue New Certificate</h5>
                    </div>
                    <div className="card-body p-4">
                        <div className="mb-3">
                            <label className="form-label small fw-bold">Select Template</label>
                            <select className="form-select" value={issueData.selectedTemplateId}
                                onChange={e => setIssueData({ ...issueData, selectedTemplateId: e.target.value })}>
                                {templates.map(t => (<option key={t.id} value={t.id}>{t.name}</option>))}
                            </select>
                        </div>
                        <div className="mb-3">
                            <label className="form-label small fw-bold">Recipient Name</label>
                            <input className="form-control" placeholder="e.g. Jane Doe"
                                value={issueData.recipientName} onChange={e => setIssueData({ ...issueData, recipientName: e.target.value })} />
                        </div>
                        <div className="mb-3">
                            <label className="form-label small fw-bold">Course Title</label>
                            <input className="form-control" placeholder="e.g. Advanced AI"
                                value={issueData.courseName} onChange={e => setIssueData({ ...issueData, courseName: e.target.value })} />
                        </div>
                        <div className="row g-2 mb-4">
                            <div className="col-md-6">
                                <label className="form-label small fw-bold">Date</label>
                                <input type="date" className="form-control"
                                    value={issueData.date} onChange={e => setIssueData({ ...issueData, date: e.target.value })} />
                            </div>
                            <div className="col-md-6">
                                <label className="form-label small fw-bold">Issuer Title</label>
                                <input className="form-control" placeholder="Instructr Name"
                                    value={issueData.instructorName} onChange={e => setIssueData({ ...issueData, instructorName: e.target.value })} />
                            </div>
                        </div>
                        <div className="mb-4 text-center">
                            <small className="text-muted d-block mb-1">Generated ID</small>
                            <span className="badge bg-light text-primary border py-2 px-3 fs-6 font-monospace">{issueData.certificateId}</span>
                        </div>
                        <button className="btn btn-primary w-100 py-2 fw-bold" onClick={handleIssueCertificate}>
                            <FaDownload className="me-2" /> Generate & Issue
                        </button>
                    </div>
                </div>
            </div>
            <div className="col-lg-7">
                <div className="text-center text-muted py-5 border rounded-4 border-dashed bg-white">
                    <div style={{ width: '90%', margin: '0 auto' }}>
                        <CertificateRenderer
                            template={templates.find(t => t.id === issueData.selectedTemplateId)}
                            data={{ ...issueData, ...settings }}
                        />
                    </div>
                    <p className="mt-3 small">Real-time Preview</p>
                </div>
            </div>
        </div>
    );
};

export default ManualIssue;
