import React, { useState } from 'react';
import {
  FaCertificate, FaCog, FaLayerGroup, FaRobot, FaUserEdit, FaPalette,
  FaHome
} from 'react-icons/fa';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

// --- Styles & Data ---
import './Certificates.css';
import { initialTemplates, initialCertificates, initialPendingCertificates, initialAdminSettings } from './data';

// --- Helper Components ---
import CertificateDashboard from './tabs/CertificateDashboard';
import CertificateSettings from './tabs/CertificateSettings';
import History from './tabs/History';
import PreviewModal from '../components/PreviewModal';

// --- Tabs ---
import DesignStudio from '../tabs/DesignStudio';
import TemplateGallery from '../tabs/TemplateGallery';
import ManualIssue from './tabs/ManualIssue';
import AutomationRules from './tabs/AutomationRules';
import PendingCertificates from './tabs/PendingCertificates';

// --- Constants ---
const TABS = [
  { id: 'dashboard', icon: FaHome, label: "Dashboard" },
  { id: 'pending', icon: FaLayerGroup, label: "Pending List" },
  { id: 'templates', icon: FaPalette, label: "Design Templates" },
  { id: 'issue', icon: FaUserEdit, label: "Manual Issue" },
  { id: 'auto', icon: FaRobot, label: "Automation" },
  { id: 'my-certs', icon: FaCertificate, label: "History" },
  { id: 'admin-settings', icon: FaCog, label: "Admin Settings" },
];

const Certificates = () => {
  // Navigation State
  const [activeTab, setActiveTab] = useState('dashboard');

  // Application Data State
  const [templates, setTemplates] = useState(initialTemplates);
  const [myCertificates, setMyCertificates] = useState(initialCertificates);
  const [pendingCertificates, setPendingCertificates] = useState(initialPendingCertificates);
  const [autoRules, setAutoRules] = useState([]);
  const [adminSettings, setAdminSettings] = useState(initialAdminSettings);

  // Template Designer State
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState({
    name: "New Custom Design",
    page: { type: "A4", orientation: "landscape" },
    theme: {
      backgroundImage: "",
      fontFamily: "'Inter', sans-serif",
      textColor: "#000000"
    },
    elements: [
      { id: "e1", type: "text", x: 100, y: 60, w: 800, h: 50, content: "CERTIFICATE OF COMPLETION", style: { fontSize: "40px", fontWeight: "bold", textAlign: "center", color: "#1e293b" } },
      { id: "e2", type: "text", x: 100, y: 140, w: 800, h: 30, content: "This is to certify that", style: { fontSize: "18px", textAlign: "center", color: "#64748b" } },
      { id: "e3", type: "text", x: 100, y: 190, w: 800, h: 60, content: "{{recipientName}}", style: { fontSize: "48px", fontWeight: "bold", textAlign: "center", color: "#d97706", fontFamily: "'Playfair Display', serif" } },
      { id: "e4", type: "text", x: 150, y: 280, w: 700, h: 50, content: "has successfully completed the course requirements for {{courseName}}.", style: { fontSize: "18px", textAlign: "center", lineHeight: "1.5" } },

      // Footer: Date of Issue
      { id: "e_date", type: "text", x: 100, y: 520, w: 250, h: 40, content: "Date of Issue: {{date}}", style: { fontSize: "14px", textAlign: "left", fontWeight: "bold" } },

      // Footer: Signature Area
      { id: "e_sig_img", type: "image", x: 650, y: 480, w: 200, h: 60, src: "https://upload.wikimedia.org/wikipedia/commons/thumb/e/e4/Signature_sample.svg/1200px-Signature_sample.svg.png", style: { opacity: 1 } },
      { id: "e_sig_text", type: "text", x: 650, y: 550, w: 200, h: 30, content: "Program Director", style: { fontSize: "16px", fontWeight: "bold", textAlign: "center", borderTop: "2px solid #333" } },

      // Footer: Validation / Check Content
      { id: "e_verify", type: "text", x: 300, y: 620, w: 400, h: 30, content: "Verify at: example.com/verify/{{certificateId}}", style: { fontSize: "10px", textAlign: "center", color: "#94a3b8" } }
    ]
  });

  // Manual Issue State
  const [issueData, setIssueData] = useState({
    recipientName: "",
    courseName: "",
    date: new Date().toISOString().split('T')[0],
    signatureText: "Authorized Sig.",
    instructorName: "Program Director",
    selectedTemplateId: 't1',
    certificateId: "CERT-" + Math.random().toString(36).substr(2, 9).toUpperCase()
  });

  // Preview State
  const [previewCert, setPreviewCert] = useState(null);

  // --- Handlers ---

  const handleTemplateSave = () => {
    const newTemplate = { ...editingTemplate, id: `custom-${Date.now()}` };
    setTemplates([...templates, newTemplate]);
    setIsEditorOpen(false);
    toast.success("Design Saved as New Template!");
  };

  const generateCertificateID = (courseName, date) => {
    const year = new Date(date).getFullYear();
    const courseCode = courseName ? courseName.substring(0, 3).toUpperCase() : "GEN";
    const randomSeq = Math.floor(1000 + Math.random() * 9000);
    return `CERT-${year}-${courseCode}-${randomSeq}`;
  };

  const handleIssueCertificate = () => {
    if (!issueData.recipientName) return toast.error("Recipient Name is required");
    const selectedTemp = templates.find(t => t.id === issueData.selectedTemplateId) || templates[0];
    const freshId = generateCertificateID(issueData.courseName, issueData.date);

    const newCert = {
      id: Date.now(),
      data: { ...issueData, certificateId: freshId },
      template: selectedTemp,
      issuedAt: new Date().toISOString()
    };
    setMyCertificates([newCert, ...myCertificates]);
    toast.success(`Certificate ${freshId} Issued Successfully!`);
    setActiveTab('my-certs');
    setIssueData(prev => ({ ...prev, recipientName: "", certificateId: generateCertificateID(prev.courseName, prev.date) }));
  };

  const handleApproveCert = (cert) => {
    const freshId = generateCertificateID(cert.data.courseName, cert.data.date);
    const approvedCert = {
      ...cert,
      id: Date.now(),
      data: { ...cert.data, certificateId: freshId },
      issuedAt: new Date().toISOString()
    };
    setMyCertificates([approvedCert, ...myCertificates]);
    setPendingCertificates(prev => prev.filter(c => c.id !== cert.id));
    toast.success(`Request Approved! Certificate ${freshId} Issued.`);
  };

  const handleRejectCert = (id) => {
    setPendingCertificates(prev => prev.filter(c => c.id !== id));
    toast.info("Certificate Request Rejected.");
  };

  const handleAutoRuleSave = (e) => {
    e.preventDefault();
    const pd = new FormData(e.target);
    setAutoRules([...autoRules, { id: Date.now(), course: pd.get('course'), templateId: pd.get('templateId'), status: true }]);
    toast.success("Automation Rule Active!");
    e.target.reset();
  };

  const handleDeleteCertificate = (id) => {
    setMyCertificates(prev => prev.filter(c => c.id !== id));
  };

  // --- Render Functions for Tabs ---

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return (
          <CertificateDashboard
            certificates={myCertificates}
            templates={templates}
            onNavigate={setActiveTab}
          />
        );
      case 'pending':
        return (
          <PendingCertificates
            pendingCertificates={pendingCertificates}
            onApprove={handleApproveCert}
            onReject={handleRejectCert}
          />
        );
      case 'templates':
        return !isEditorOpen ? (
          <TemplateGallery
            templates={templates}
            setIsEditorOpen={setIsEditorOpen}
            setEditingTemplate={setEditingTemplate}
          />
        ) : (
          <DesignStudio
            editingTemplate={editingTemplate}
            setEditingTemplate={setEditingTemplate}
            handleTemplateSave={handleTemplateSave}
            setIsEditorOpen={setIsEditorOpen}
            settings={adminSettings}
          />
        );
      case 'issue':
        return (
          <ManualIssue
            issueData={issueData}
            setIssueData={setIssueData}
            templates={templates}
            handleIssueCertificate={handleIssueCertificate}
          />
        );
      case 'auto':
        return (
          <AutomationRules
            autoRules={autoRules}
            setAutoRules={setAutoRules}
            handleAutoRuleSave={handleAutoRuleSave}
            templates={templates}
          />
        );
      case 'my-certs':
        return (
          <History
            certificates={myCertificates}
            onView={(cert) => setPreviewCert(cert)}
            onDelete={handleDeleteCertificate}
          />
        );
      case 'admin-settings':
        return (
          <CertificateSettings
            settings={adminSettings}
            onUpdateSettings={setAdminSettings}
          />
        );
      default:
        return null;
    }
  };

  return (
    <div className="container-fluid min-vh-100 bg-light py-4" style={{ fontFamily: "'Inter', sans-serif" }}>
      <ToastContainer />
      <div className="container">

        {/* Header */}
        <div className="mb-5">
          <h2 className="fw-bold text-dark d-flex align-items-center gap-2">
            <FaLayerGroup className="text-primary" /> Certificate Management
          </h2>
          <p className="text-muted">Design, Automate, and Issue certificates for your learners.</p>
        </div>

        {/* Custom Tabs Navigation */}
        <div className="bg-white p-1 rounded-pill shadow-sm d-inline-flex mb-4">
          {TABS.map(tab => (
            <button
              key={tab.id}
              className={`btn rounded-pill px-4 fw-medium d-flex align-items-center gap-2 ${activeTab === tab.id ? 'btn-primary shadow-sm' : 'btn-white text-secondary'}`}
              onClick={() => { setActiveTab(tab.id); setIsEditorOpen(false); }}
            >
              <tab.icon size={16} />
              {tab.label}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        {renderContent()}

      </div>

      {/* Preview Modal */}
      <PreviewModal
        previewCert={previewCert}
        onClose={() => setPreviewCert(null)}
      />

    </div>
  );
}

export default Certificates;