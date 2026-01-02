import React from "react";
import { FaPlus, FaEdit, FaTrash } from "react-icons/fa";
import CertificateRenderer from "../renderer/CertificateRenderer";

const TemplateGallery = ({ templates, onCreate, onEdit, onDelete }) => {
  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h4 className="mb-0">My Templates</h4>
        <button
          className="btn btn-primary"
          onClick={() =>
            onCreate({
              id: Date.now().toString(),
              name: "New Template",
              page: { type: "A4", orientation: "landscape" },
              theme: {
                backgroundImage: "",
                fontFamily: "'Inter', sans-serif",
                textColor: "#1F2937"
              },
              elements: []
            })
          }
        >
          <FaPlus className="me-2" /> Create New Design
        </button>
      </div>

      <div className="row g-4">
        {templates.map((t) => (
          <div key={t.id} className="col-md-6 col-xl-4">
            <div className="card h-100 shadow-sm hover-shadow transition-all">
              <div className="card-header bg-white border-bottom-0 pt-3 px-3 d-flex justify-content-between align-items-center">
                <h6 className="fw-bold mb-0 text-truncate">{t.name}</h6>
                {onDelete && (
                  <button
                    className="btn btn-sm btn-outline-danger p-1 border-0"
                    title="Delete Template"
                    onClick={(e) => {
                      e.stopPropagation();
                      if (window.confirm('Delete this template?')) onDelete(t.id);
                    }}
                  >
                    <FaTrash size={14} />
                  </button>
                )}
              </div>

              <div
                className="card-body p-0 position-relative bg-light overflow-hidden d-flex align-items-center justify-content-center"
                style={{ height: "250px", cursor: "pointer" }}
                onClick={() => onEdit(t)}
              >
                {/* 
                  Container for the renderer. 
                  We let the renderer auto-scale to this container's width. 
                  We add a wrapper with some padding so it doesn't touch edges.
                */}
                <div className="w-100 px-3">
                  <CertificateRenderer
                    template={t}
                    data={{
                      recipientName: "Sample Student",
                      courseName: "Sample Course",
                      date: new Date().toISOString(),
                      certificateId: "PREVIEW-123"
                    }}
                    isDesigning={false}
                  />
                </div>

                {/* Overlay on hover could go here if requested, but simple is fine for now */}
              </div>

              <div className="card-footer bg-white border-top-0 p-3 text-end">
                <button
                  className="btn btn-sm btn-outline-primary w-100"
                  onClick={() => onEdit(t)}
                >
                  <FaEdit className="me-2" /> Edit Design
                </button>
              </div>
            </div>
          </div>
        ))}

        {templates.length === 0 && (
          <div className="col-12 text-center py-5 text-muted">
            <p>No templates found. Create one to get started!</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default TemplateGallery;
