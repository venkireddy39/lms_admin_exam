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



// api
import { certificateService } from "../../services/certificateService";

// tabs
import CertificateDashboard from "./tabs/CertificateDashboard";
import CertificateSettings from "./tabs/CertificateSettings";
import History from "./tabs/History";
import ManualIssue from "./tabs/ManualIssue";
import AutomationRules from "./tabs/AutomationRules";
import PendingCertificates from "./tabs/PendingCertificates";

// editor
import CanvasEditor from "./editor/CanvasEditor";
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

  const [templates, setTemplates] = useState([]);
  const [certificates, setCertificates] = useState([]);
  const [pendingCertificates, setPendingCertificates] = useState([]);
  const [adminSettings, setAdminSettings] = useState({
    // Organization Details
    instituteName: "",
    subTitle: "",
    instituteAddress: "",
    website: "",
    email: "",
    logo: null,

    // Signatures & Stamps
    directorSignature: null,
    instructorSignature: null,
    sealImage: null,

    // Certificate ID Configuration
    certIdPrefix: "LMS",
    certIdIncludeYear: true,
    certIdAutoIncrement: true,

    // Eligibility Rules
    eligibilityCompletion: true,
    eligibilityExamPassed: false,
    eligibilityMinScore: 0,
    requireFeePaid: true,

    // System Options
    enableVerification: true,
    allowPdfDownload: true,
    allowSharing: true,
    allowReissue: false
  });
  const [automationRules, setAutomationRules] = useState([]);



  // Fetch initial data
  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        // Fetch Certificates
        const certsRes = await certificateService.getAllCertificates();
        // Defensive check: in case API returns { data: [...] } instead of directly an array
        const certsArray = Array.isArray(certsRes) ? certsRes : (certsRes?.data || []);
        setCertificates(certsArray);

        // Fetch Templates (Assuming you will add this to certificateService)
        // const tempRes = await certificateService.getAllTemplates();
        // const tempArray = Array.isArray(tempRes) ? tempRes : (tempRes?.data || []);
        // setTemplates(tempArray);

        // Fetch Pending (Assuming you will add this to certificateService)
        // const pendingRes = await certificateService.getPendingCertificates();
        // const pendingArray = Array.isArray(pendingRes) ? pendingRes : (pendingRes?.data || []);
        // setPendingCertificates(pendingArray);

      } catch (error) {
        console.error("Error fetching initial data:", error);
        toast.error("Failed to load certificate data");
      }
    };
    fetchInitialData();
  }, []);

  // editor state
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState(null);

  // preview
  const [previewCert, setPreviewCert] = useState(null);

  // manual issue state
  const [issueData, setIssueData] = useState({
    studentName: "",
    courseName: "",
    date: new Date().toISOString().split("T")[0],
    instituteName: adminSettings.instituteName || "",
    selectedTemplateId: "",
    certificateId: `LMS-${Math.floor(Math.random() * 100000)}`,
  });

  // Keep manual issue institute name synced if admin changes it but hasn't typed in manual issue
  useEffect(() => {
    setIssueData(prev => ({
      ...prev,
      instituteName: adminSettings.instituteName || prev.instituteName
    }));
  }, [adminSettings.instituteName]);// ------------------ HELPERS ------------------
  const generateCertificateId = (courseName, date) => {
    const { certIdPrefix, certIdIncludeYear, certIdAutoIncrement } = adminSettings;
    const yearStr = certIdIncludeYear ? `-${new Date(date).getFullYear()}` : "";
    const randStr = certIdAutoIncrement ? `-${Math.floor(1000 + Math.random() * 9000)}` : `-${Math.floor(1000 + Math.random() * 9000)}`;
    // In a real backend, auto increment would fetch the next ID. Here we just mock it with random for now.

    return `${certIdPrefix}${yearStr}${randStr}`;
  };

  const handleIssueCertificate = async (data) => {
    if (!data.studentName) {
      toast.error("Student name is required");
      return;
    }

    const template = templates.find(
      (t) => t.id === data.selectedTemplateId
    );

    if (!template) {
      toast.error("Please select a template");
      return;
    }

    try {
      const resp = await certificateService.manualGenerate({
        userId: 1, // DUMMY USER ID - MUST BE REPLACED WITH REAL SELECTION LATER
        targetType: "COURSE", // Assume COURSE for manual issue right now
        targetId: 1, // DUMMY TARGET ID
        studentName: data.recipientName,
        studentEmail: "student@example.com", // DUMMY EMAIL
        eventTitle: data.courseName || "General Event",
        score: 100
      });

      setCertificates((prev) => [resp, ...prev]);

      toast.success(`Certificate issued successfully`);
      setActiveTab("history");
    } catch (error) {
      console.error("Error issuing certificate:", error);
      toast.error("Failed to issue certificate");
    }
  };

  const handleApprove = async (cert) => {
    try {
      // TODO: API INTEGRATION - POST /api/certificates/approve
      // await certificateService.approveCertificate(cert.id);

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
    } catch (error) {
      toast.error("Error approving certificate");
    }
  };

  const handleReject = async (id) => {
    try {
      // TODO: API INTEGRATION - DELETE /api/certificates/pending/:id
      // await certificateService.rejectCertificate(id);

      setPendingCertificates((prev) => prev.filter((c) => c.id !== id));
      toast.info("Certificate request rejected");
    } catch (error) {
      toast.error("Error rejecting certificate");
    }
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
          <CanvasEditor
            editingTemplate={editingTemplate}
            setEditingTemplate={setEditingTemplate}
            settings={adminSettings}
            setIsEditorOpen={setIsEditorOpen}
            handleTemplateSave={() => {
              // TODO: API INTEGRATION - PUT /api/templates/:id
              setTemplates((prev) => {
                const exists = prev.find((t) => t.id === editingTemplate.id);
                if (exists) {
                  return prev.map((t) =>
                    t.id === editingTemplate.id ? editingTemplate : t
                  );
                }
                return [...prev, editingTemplate];
              });
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
            handleAutoRuleSave={(ruleData) => {
              const newRule = {
                id: Date.now(),
                ...ruleData,
                status: 'Active'
              };
              // TODO: API INTEGRATION - POST /api/automation/rules
              setAutomationRules([...automationRules, newRule]);
              toast.success("Automation rule created successfully");
            }}
          />
        );

      case "settings":
        return (
          <CertificateSettings
            adminSettings={adminSettings}
            setAdminSettings={setAdminSettings}
          />
        );

      default:
        return null;
    }
  };

  // ------------------ UI ------------------
  return (
    <div className="container-fluid bg-light min-vh-100">
      <ToastContainer position="top-right" autoClose={3000} />

      <div className="container py-4">

        {/* Page Header */}
        <div className="d-flex justify-content-between align-items-center mb-4">
          <div>
            <h4 className="fw-bold mb-0">
              <FaLayerGroup className="me-2 text-primary" />
              Certificate Management
            </h4>
            <small className="text-muted">Manage, issue, and track all certificates</small>
          </div>
          <button
            className="btn btn-primary"
            onClick={() => setActiveTab("issue")}
          >
            <FaUserEdit className="me-2" /> Issue Certificate
          </button>
        </div>

        {/* Nav Tabs */}
        <div className="card border-0 shadow-sm mb-4">
          <div className="card-body p-2">
            <ul className="nav nav-pills gap-1 flex-wrap" role="tablist">
              {TABS.map((tab) => (
                <li key={tab.id} className="nav-item" role="presentation">
                  <button
                    className={`nav-link d-flex align-items-center gap-2 ${activeTab === tab.id ? "active" : "text-muted"
                      }`}
                    onClick={() => setActiveTab(tab.id)}
                    type="button"
                  >
                    <tab.icon size={14} />
                    {tab.label}
                  </button>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Tab Content */}
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
