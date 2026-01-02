import React from 'react';
import { FaRobot, FaTrash } from 'react-icons/fa';

const AutomationRules = ({
    autoRules,
    setAutoRules,
    handleAutoRuleSave,
    templates
}) => {
    return (
        <div className="row g-4 animate-fade-in">
            <div className="col-lg-4">
                <div className="card border-0 shadow-sm rounded-4 h-100">
                    <div className="card-header bg-white border-0 pt-4 px-4">
                        <h5 className="fw-bold"><FaRobot className="me-2 text-info" />Automation Rules</h5>
                        <p className="text-secondary small">Automatically issue certificates when students complete a course.</p>
                    </div>
                    <div className="card-body p-4">
                        <form onSubmit={handleAutoRuleSave}>
                            <div className="mb-3">
                                <label className="form-label small fw-bold">Select Course</label>
                                <select className="form-select" name="course">
                                    <option>React Masterclass</option>
                                    <option>JavaScript Fundamentals</option>
                                    <option>Python for Data Science</option>
                                </select>
                            </div>
                            <div className="mb-3">
                                <label className="form-label small fw-bold">Certificate Template to Use</label>
                                <select className="form-select" name="templateId">
                                    {templates.map(t => (<option key={t.id} value={t.id}>{t.name}</option>))}
                                </select>
                            </div>
                            <div className="mb-4">
                                <label className="form-label small fw-bold">Trigger Event</label>
                                <input className="form-control bg-light" value="When Progress = 100%" disabled />
                            </div>
                            <button className="btn btn-dark w-100">Create Rule</button>
                        </form>
                    </div>
                </div>
            </div>
            <div className="col-lg-8">
                <div className="card border-0 shadow-sm rounded-4">
                    <div className="card-header bg-white border-0 pt-4 px-4">
                        <h6 className="fw-bold">Active Rules</h6>
                    </div>
                    <div className="card-body">
                        {autoRules.length === 0 ? (
                            <div className="text-center text-muted py-5">
                                <FaRobot size={32} className="opacity-25 mb-2" />
                                <p>No automation rules set.</p>
                            </div>
                        ) : (
                            <table className="table table-hover align-middle">
                                <thead className="bg-light">
                                    <tr>
                                        <th className="border-0 ps-3 rounded-start">Course</th>
                                        <th className="border-0">Template</th>
                                        <th className="border-0">Status</th>
                                        <th className="border-0 rounded-end text-end pe-3">Action</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {autoRules.map(rule => (
                                        <tr key={rule.id}>
                                            <td className="ps-3 fw-medium">{rule.course}</td>
                                            <td><span className="badge bg-light text-dark border">{templates.find(t => t.id === rule.templateId)?.name || 'Unknown'}</span></td>
                                            <td><span className="badge bg-success-subtle text-success rounded-pill">Active</span></td>
                                            <td className="text-end pe-3">
                                                <button className="btn btn-sm btn-icon btn-light text-danger" onClick={() => setAutoRules(autoRules.filter(r => r.id !== rule.id))}><FaTrash /></button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AutomationRules;
