import React, { useState, useEffect } from "react";
import {
  FaCertificate,
  FaCog,
  FaLayerGroup,
  FaRobot,
  FaUserEdit,
  FaPalette,
  FaHome,
} from "react-icons/fa";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

// styles
import "./CertificateModule.css";

// data
import {
  initialTemplates,
  initialCertificates,
  initialPendingCertificates,
  initialAdminSettings,
} from "./data/sampleData";

// tabs
import CertificateDashboard from "./tabs/CertificateDashboard";
import CertificateSettings from "./tabs/CertificateSettings";
import History from "./tabs/History";
import ManualIssue from "./tabs/ManualIssue";
import AutomationRules from "./tabs/AutomationRules";
import PendingCertificates from "./tabs/PendingCertificates";

// editor
import DesignStudio from "./editor/DesignStudio";
import TemplateGallery from "./editor/TemplateGallery";
import PreviewModal from "./editor/PreviewModal";

// ------------------ CONSTANTS ------------------
const TABS = [
  { id: "dashboard", icon: FaHome, label: "Dashboard" },
  { id: "pending", icon: FaLayerGroup, label: "Pending" },
  { id: "templates", icon: FaPalette, label: "Templates" },
  { id: "issue", icon: FaUserEdit, label: "Manual Issue" },
  { id: "auto", icon: FaRobot, label: "Automation" },
  { id: "history", icon: FaCertificate, label: "History" },
  { id: "settings", icon: FaCog, label: "Admin Settings" },
];

// ------------------ COMPONENT ------------------
const CertificateModule = () => {
  const [activeTab, setActiveTab] = useState("dashboard");

  const [templates, setTemplates] = useState(initialTemplates);
  const [certificates, setCertificates] = useState(initialCertificates);
  const [pendingCertificates, setPendingCertificates] = useState(initialPendingCertificates);
  const [adminSettings, setAdminSettings] = useState(initialAdminSettings);
  const [automationRules, setAutomationRules] = useState([]);

  // DEBUGGING
  useEffect(() => {
    console.log("Initial Import:", initialPendingCertificates);
    console.log("Current Pending State:", pendingCertificates);
  }, [pendingCertificates]);

  // TODO: API INTEGRATION - Fetch initial data
  useEffect(() => {
    // const fetchData = async () => {
    //   const [templatesRes, certsRes, pendingRes, settingsRes] = await Promise.all([
    //     fetch('/api/templates'),
    //     fetch('/api/certificates'),
    //     fetch('/api/certificates/pending'),
    //     fetch('/api/settings')
    //   ]);
    //   setTemplates(await templatesRes.json());
    //   ...
    // };
    // fetchData();
  }, []);

  // editor state
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState(null);

  // preview
  const [previewCert, setPreviewCert] = useState(null);

  // manual issue state
  const [issueData, setIssueData] = useState({
    recipientName: "",
    courseName: "",
    date: new Date().toISOString().split("T")[0],
    selectedTemplateId: "",
  });

  // ------------------ HELPERS ------------------
  const generateCertificateId = (courseName, date) => {
    const year = new Date(date).getFullYear();
    const code = courseName
      ? courseName.slice(0, 3).toUpperCase()
      : "GEN";
    return `CERT-${year}-${code}-${Math.floor(1000 + Math.random() * 9000)}`;
  };

  const handleIssueCertificate = (data) => {
    if (!data.recipientName) {
      toast.error("Recipient name is required");
      return;
    }

    const template = templates.find(
      (t) => t.id === data.selectedTemplateId
    );

    if (!template) {
      toast.error("Please select a template");
      return;
    }

    const certId = generateCertificateId(data.courseName, data.date);

    // TODO: API INTEGRATION - POST /api/certificates/issue
    // await axios.post('/api/certificates/issue', { ...data, templateId: template.id });

    setCertificates((prev) => [
      {
        id: Date.now(),
        template,
        data: { ...data, certificateId: certId },
        issuedAt: new Date().toISOString(),
      },
      ...prev,
    ]);

    toast.success(`Certificate ${certId} issued`);
    setActiveTab("history");
  };

  const handleApprove = (cert) => {
    // TODO: API INTEGRATION - POST /api/certificates/approve
    setCertificates((prev) => [
      {
        ...cert,
        id: Date.now(),
        issuedAt: new Date().toISOString(),
      },
      ...prev,
    ]);
    setPendingCertificates((prev) => prev.filter((c) => c.id !== cert.id));
    toast.success("Certificate approved");
  };

  const handleReject = (id) => {
    // TODO: API INTEGRATION - DELETE /api/certificates/pending/:id
    setPendingCertificates((prev) => prev.filter((c) => c.id !== id));
    toast.info("Certificate request rejected");
  };

  // ------------------ RENDER CONTENT ------------------
  const renderContent = () => {
    switch (activeTab) {
      case "dashboard":
        return (
          <CertificateDashboard
            certificates={certificates}
            templates={templates}
            onNavigate={setActiveTab}
          />
        );

      case "pending":
        return (
          <PendingCertificates
            pendingCertificates={pendingCertificates}
            onApprove={handleApprove}
            onReject={handleReject}
            settings={adminSettings}
          />
        );

      case "templates":
        if (!isEditorOpen) {
          return (
            <TemplateGallery
              templates={templates}
              onEdit={(template) => {
                setEditingTemplate(template);
                setIsEditorOpen(true);
              }}
              onCreate={(newTemplate) => {
                setEditingTemplate(newTemplate);
                setIsEditorOpen(true);
              }}
              onDelete={(id) => {
                setTemplates(prev => prev.filter(t => t.id !== id));
                toast.info("Template deleted");
              }}
            />
          );
        }

        return (
          <DesignStudio
            editingTemplate={editingTemplate}
            setEditingTemplate={setEditingTemplate}
            settings={adminSettings}
            setIsEditorOpen={setIsEditorOpen}
            handleTemplateSave={() => {
              // TODO: API INTEGRATION - PUT /api/templates/:id
              setTemplates((prev) =>
                prev.map((t) =>
                  t.id === editingTemplate.id ? editingTemplate : t
                )
              );
              setIsEditorOpen(false);
              toast.success("Template saved");
            }}
          />
        );

      case "issue":
        return (
          <ManualIssue
            issueData={issueData}
            setIssueData={setIssueData}
            templates={templates}
            onIssue={handleIssueCertificate}
            settings={adminSettings}
          />
        );

      case "history":
        return (
          <History
            certificates={certificates}
            onView={setPreviewCert}
            settings={adminSettings}
          />
        );

      case "auto":
        return (
          <AutomationRules
            autoRules={automationRules}
            setAutoRules={setAutomationRules}
            templates={templates}
            handleAutoRuleSave={(e) => {
              e.preventDefault();
              const formData = new FormData(e.target);
              const newRule = {
                id: Date.now(),
                course: formData.get("course"),
                templateId: formData.get("templateId"),
                trigger: "Progress = 100%"
              };
              // TODO: API INTEGRATION - POST /api/automation/rules
              setAutomationRules([...automationRules, newRule]);
              toast.success("Automation rule created");
              e.target.reset();
            }}
          />
        );

      case "settings":
        return (
          <CertificateSettings
            settings={adminSettings}
            onUpdateSettings={(newSettings) => {
              // TODO: API INTEGRATION - PUT /api/settings
              setAdminSettings(newSettings);
            }}
          />
        );

      default:
        return null;
    }
  };

  // ------------------ UI ------------------
  return (
    <div className="container-fluid min-vh-100 bg-light py-4">
      <ToastContainer position="top-right" autoClose={3000} />

      <div className="container">
        <h2 className="fw-bold mb-4">
          <FaLayerGroup /> Certificate Management
        </h2>

        <div className="bg-white p-2 rounded-pill mb-4 d-flex gap-2 overflow-auto">
          {TABS.map((tab) => (
            <button
              key={tab.id}
              className={`btn rounded-pill ${activeTab === tab.id
                ? "btn-primary"
                : "btn-outline-secondary"
                }`}
              onClick={() => setActiveTab(tab.id)}
            >
              <tab.icon className="me-1" />
              {tab.label}
            </button>
          ))}
        </div>

        {renderContent()}
      </div>

      <PreviewModal
        previewCert={previewCert}
        onClose={() => setPreviewCert(null)}
        settings={adminSettings}
      />
    </div>
  );
};

export default CertificateModule;
