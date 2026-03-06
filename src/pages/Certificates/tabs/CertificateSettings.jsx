import React from 'react';
import { toast, ToastContainer } from 'react-toastify';
import { Tabs, Tab } from 'react-bootstrap';

const CertificateSettings = ({ adminSettings, setAdminSettings }) => {

    // Helper to extract file object instead of dataURL (per user instructions "Upload files to server or cloud storage. Save only file URL in admin settings.")
    // Note: Since we don't have a backend upload route yet, we'll keep the object in state so the user can wire it up later,
    // although previewing it directly from a File object requires URL.createObjectURL.
    // For simplicity and matching the user's prompt exactly, we'll just store the e.target.files[0] instance.

    const handleSave = () => {
        console.log("Saving Admin Settings Payload:", adminSettings);
        toast.success("System settings saved successfully!");
        // TODO: Wire up actual API POST/PUT call here
    };

    return (
        <div className="card border-0 shadow-sm rounded-4 animate-fade-in" style={{ minHeight: '80vh' }}>
            <div className="card-header bg-white border-0 pt-4 px-4 d-flex justify-content-between align-items-center mb-2">
                <h5 className="fw-bold mb-0">Admin Panel Configuration</h5>
                <button className="btn btn-success fw-bold px-4" onClick={handleSave}>
                    Save System Settings
                </button>
            </div>

            <div className="card-body px-4">
                <Tabs defaultActiveKey="org" id="certificate-admin-tabs" className="mb-4">

                    {/* 1. Organization Details */}
                    <Tab eventKey="org" title="Organization Details">
                        <div className="row g-4 mt-2">
                            <div className="col-md-6">
                                <label className="form-label small fw-bold">Institute Name</label>
                                <input
                                    className="form-control"
                                    value={adminSettings.instituteName}
                                    onChange={(e) => setAdminSettings({ ...adminSettings, instituteName: e.target.value })}
                                />
                            </div>
                            <div className="col-md-6">
                                <label className="form-label small fw-bold">Subtitle</label>
                                <input
                                    className="form-control"
                                    value={adminSettings.subTitle}
                                    onChange={(e) => setAdminSettings({ ...adminSettings, subTitle: e.target.value })}
                                />
                            </div>
                            <div className="col-md-6">
                                <label className="form-label small fw-bold">Website</label>
                                <input
                                    className="form-control"
                                    value={adminSettings.website}
                                    onChange={(e) => setAdminSettings({ ...adminSettings, website: e.target.value })}
                                />
                            </div>
                            <div className="col-md-6">
                                <label className="form-label small fw-bold">Email</label>
                                <input
                                    type="email"
                                    className="form-control"
                                    value={adminSettings.email}
                                    onChange={(e) => setAdminSettings({ ...adminSettings, email: e.target.value })}
                                />
                            </div>
                            <div className="col-md-12">
                                <label className="form-label small fw-bold">Address</label>
                                <textarea
                                    className="form-control"
                                    rows="3"
                                    value={adminSettings.instituteAddress}
                                    onChange={(e) => setAdminSettings({ ...adminSettings, instituteAddress: e.target.value })}
                                />
                            </div>
                            <div className="col-md-6">
                                <label className="form-label small fw-bold">Logo</label>
                                <input
                                    type="file"
                                    className="form-control"
                                    onChange={(e) => setAdminSettings({ ...adminSettings, logo: e.target.files[0] })}
                                />
                            </div>
                        </div>
                    </Tab>

                    {/* 2. Certificate ID Configuration */}
                    <Tab eventKey="idconfig" title="ID Configuration">
                        <div className="row g-4 mt-2">
                            <div className="col-md-6">
                                <label className="form-label small fw-bold">Certificate ID Prefix</label>
                                <input
                                    className="form-control text-uppercase"
                                    value={adminSettings.certIdPrefix}
                                    onChange={(e) => setAdminSettings({ ...adminSettings, certIdPrefix: e.target.value.toUpperCase() })}
                                />
                                <small className="text-muted d-block mt-1">Example: LMS-</small>
                            </div>
                            <div className="col-md-12">
                                <div className="form-check mb-3">
                                    <input
                                        type="checkbox"
                                        id="includeYear"
                                        className="form-check-input"
                                        checked={adminSettings.certIdIncludeYear}
                                        onChange={(e) => setAdminSettings({ ...adminSettings, certIdIncludeYear: e.target.checked })}
                                    />
                                    <label htmlFor="includeYear" className="form-check-label">
                                        Include Year in Certificate ID (e.g., LMS-2026-...)
                                    </label>
                                </div>
                                <div className="form-check">
                                    <input
                                        type="checkbox"
                                        id="autoInc"
                                        className="form-check-input"
                                        checked={adminSettings.certIdAutoIncrement}
                                        onChange={(e) => setAdminSettings({ ...adminSettings, certIdAutoIncrement: e.target.checked })}
                                    />
                                    <label htmlFor="autoInc" className="form-check-label">
                                        Auto Increment ID
                                    </label>
                                </div>
                            </div>
                        </div>
                    </Tab>

                    {/* 3. Signatures Tab */}
                    <Tab eventKey="signatures" title="Signatures">
                        <div className="row g-4 mt-2">
                            <div className="col-md-4">
                                <div className="p-3 border rounded bg-light border-dashed">
                                    <label className="form-label small fw-bold">Director Signature</label>
                                    <input
                                        type="file"
                                        className="form-control form-control-sm"
                                        onChange={(e) => setAdminSettings({ ...adminSettings, directorSignature: e.target.files[0] })}
                                    />
                                </div>
                            </div>
                            <div className="col-md-4">
                                <div className="p-3 border rounded bg-light border-dashed">
                                    <label className="form-label small fw-bold">Instructor Signature</label>
                                    <input
                                        type="file"
                                        className="form-control form-control-sm"
                                        onChange={(e) => setAdminSettings({ ...adminSettings, instructorSignature: e.target.files[0] })}
                                    />
                                </div>
                            </div>
                            <div className="col-md-4">
                                <div className="p-3 border rounded bg-light border-dashed">
                                    <label className="form-label small fw-bold">Organization Seal</label>
                                    <input
                                        type="file"
                                        className="form-control form-control-sm"
                                        onChange={(e) => setAdminSettings({ ...adminSettings, sealImage: e.target.files[0] })}
                                    />
                                </div>
                            </div>
                        </div>
                    </Tab>

                    {/* 4. Rules & Eligibility */}
                    <Tab eventKey="rules" title="Rules & Eligibility">
                        <div className="row mt-3">
                            <div className="col-md-8">
                                <div className="card border shadow-sm">
                                    <div className="card-header bg-light fw-bold text-primary">
                                        Auto-Generation Requirements
                                    </div>
                                    <div className="card-body">
                                        <div className="form-check mb-3">
                                            <input
                                                type="checkbox"
                                                id="reqComp"
                                                checked={adminSettings.eligibilityCompletion}
                                                onChange={(e) => setAdminSettings({ ...adminSettings, eligibilityCompletion: e.target.checked })}
                                                className="form-check-input"
                                            />
                                            <label htmlFor="reqComp" className="form-check-label fw-medium">
                                                Require 100% Course Completion
                                            </label>
                                            <small className="d-block text-muted">Certificate will check student progress before issuing.</small>
                                        </div>

                                        <div className="form-check mb-3">
                                            <input
                                                type="checkbox"
                                                id="reqExam"
                                                checked={adminSettings.eligibilityExamPassed}
                                                onChange={(e) => setAdminSettings({ ...adminSettings, eligibilityExamPassed: e.target.checked })}
                                                className="form-check-input"
                                            />
                                            <label htmlFor="reqExam" className="form-check-label fw-medium">
                                                Final Exam Passed
                                            </label>
                                        </div>

                                        <div className="mb-4" style={{ maxWidth: '250px' }}>
                                            <label className="form-label small fw-bold">Minimum Score (%)</label>
                                            <input
                                                type="number"
                                                className="form-control"
                                                min="0" max="100"
                                                value={adminSettings.eligibilityMinScore}
                                                onChange={(e) => {
                                                    let val = parseInt(e.target.value);
                                                    if (val < 0) val = 0;
                                                    if (val > 100) val = 100;
                                                    setAdminSettings({ ...adminSettings, eligibilityMinScore: val });
                                                }}
                                            />
                                        </div>

                                        <div className="form-check mt-3 p-3 bg-danger bg-opacity-10 border border-danger rounded">
                                            <input
                                                type="checkbox"
                                                id="reqFee"
                                                checked={adminSettings.requireFeePaid}
                                                onChange={(e) => setAdminSettings({ ...adminSettings, requireFeePaid: e.target.checked })}
                                                className="form-check-input"
                                            />
                                            <label htmlFor="reqFee" className="form-check-label fw-bold text-danger">
                                                Generate only if fee_status = PAID
                                            </label>
                                            <small className="d-block text-danger opacity-75">Blocks certificate generation for accounts with pending fee installments.</small>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </Tab>

                    {/* 5. System Options */}
                    <Tab eventKey="options" title="System Options">
                        <div className="row mt-3">
                            <div className="col-md-6">
                                <div className="card border shadow-sm">
                                    <div className="card-body">
                                        <div className="form-check mb-3">
                                            <input
                                                type="checkbox"
                                                id="enVerify"
                                                checked={adminSettings.enableVerification}
                                                onChange={(e) => setAdminSettings({ ...adminSettings, enableVerification: e.target.checked })}
                                                className="form-check-input"
                                            />
                                            <label htmlFor="enVerify" className="form-check-label">
                                                Enable Verification URL (Adds QR code validation)
                                            </label>
                                        </div>

                                        <div className="form-check mb-3">
                                            <input
                                                type="checkbox"
                                                id="enPdf"
                                                checked={adminSettings.allowPdfDownload}
                                                onChange={(e) => setAdminSettings({ ...adminSettings, allowPdfDownload: e.target.checked })}
                                                className="form-check-input"
                                            />
                                            <label htmlFor="enPdf" className="form-check-label">
                                                Allow PDF Download (Student portal)
                                            </label>
                                        </div>

                                        <div className="form-check mb-3">
                                            <input
                                                type="checkbox"
                                                id="enShare"
                                                checked={adminSettings.allowSharing}
                                                onChange={(e) => setAdminSettings({ ...adminSettings, allowSharing: e.target.checked })}
                                                className="form-check-input"
                                            />
                                            <label htmlFor="enShare" className="form-check-label">
                                                Allow Social Sharing (LinkedIn, Twitter)
                                            </label>
                                        </div>

                                        <div className="form-check">
                                            <input
                                                type="checkbox"
                                                id="enReissue"
                                                checked={adminSettings.allowReissue}
                                                onChange={(e) => setAdminSettings({ ...adminSettings, allowReissue: e.target.checked })}
                                                className="form-check-input"
                                            />
                                            <label htmlFor="enReissue" className="form-check-label">
                                                Allow Certificate Reissue
                                            </label>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </Tab>
                </Tabs>
            </div>
            {/* Keeping ToastContainer in case they render it inside here, although it is likely in App/Module level too */}
            <ToastContainer position="top-right" autoClose={3000} />
        </div>
    );
};

export default CertificateSettings;
