import React from "react";
import { FaDownload } from "react-icons/fa";
import CertificateRenderer from "../renderer/CertificateRenderer";


const PreviewModal = ({ previewCert, onClose, onExport, settings }) => {
    if (!previewCert) return null;

    const { template, data } = previewCert;

    return (
        <div
            className="position-fixed top-0 start-0 w-100 h-100 d-flex align-items-center justify-content-center animate-fade-in"
            style={{
                zIndex: 1050,
                background: "rgba(0,0,0,0.75)",
                backdropFilter: "blur(5px)"
            }}
        >
            <div
                className="bg-white rounded-4 shadow-lg overflow-hidden d-flex flex-column"
                style={{
                    width: "90%",
                    maxWidth: "1000px",
                    maxHeight: "90vh"
                }}
            >
                {/* ---------- Header ---------- */}
                <div className="p-3 border-bottom d-flex justify-content-between align-items-center">
                    <div>
                        <h5 className="mb-0 fw-bold">Certificate Preview</h5>
                        {data?.certificateId && (
                            <small className="text-muted">
                                ID: {data.certificateId}
                            </small>
                        )}
                    </div>
                    <button className="btn-close" onClick={onClose} />
                </div>

                {/* ---------- Content ---------- */}
                <div className="p-4 bg-light overflow-auto d-flex justify-content-center flex-grow-1">
                    <div
                        style={{
                            width: "100%",
                            maxWidth: "800px",
                            background: "#fff"
                        }}
                    >
                        <CertificateRenderer
                            template={template}
                            data={{ ...data, ...settings }}
                            mode="preview"
                        />
                    </div>
                </div>

                {/* ---------- Footer ---------- */}
                <div className="p-3 border-top d-flex justify-content-end gap-2">
                    <button className="btn btn-light" onClick={onClose}>
                        Close
                    </button>
                    <button
                        className="btn btn-primary"
                        onClick={() => onExport?.(previewCert)}
                    >
                        <FaDownload className="me-2" />
                        Export
                    </button>
                </div>
            </div>
        </div>
    );
};

export default PreviewModal;
