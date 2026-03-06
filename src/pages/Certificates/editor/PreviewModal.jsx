import React, { useRef, useState } from "react";
import { FaDownload, FaSpinner } from "react-icons/fa";
import CertificateRenderer from "../renderer/CertificateRenderer";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";


const PreviewModal = ({ previewCert, onClose, settings }) => {
    const certRef = useRef(null);
    const [isExporting, setIsExporting] = useState(false);

    if (!previewCert) return null;

    // The backend certificate has top level properties, but the UI renderer expects a `data` object
    // Also `template` might be null depending on how manual generation stores it right now.
    const { template } = previewCert;
    const data = previewCert.data || previewCert; // Fallback if data is not nested

    const handleDownload = async () => {
        if (!certRef.current) return;
        setIsExporting(true);
        try {
            const element = document.getElementById("certificate-preview");

            const canvas = await html2canvas(element, {
                scale: 2,
                useCORS: true,
                logging: false
            });

            const imgData = canvas.toDataURL("image/png");

            const pdf = new jsPDF({
                orientation: "landscape",
                unit: "px",
                format: [canvas.width, canvas.height]
            });

            pdf.addImage(imgData, "PNG", 0, 0, canvas.width, canvas.height);
            pdf.save(`Certificate_${data?.certificateId || 'Download'}.pdf`);
        } catch (error) {
            console.error("Error generating PDF:", error);
            alert("Failed to export PDF.");
        } finally {
            setIsExporting(false);
        }
    };

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
                        ref={certRef}
                        id="certificate-preview"
                        style={{
                            width: "1000px",
                            height: "707px",
                            padding: "40px",
                            background: "#ffffff"
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
                    <button className="btn btn-light" onClick={onClose} disabled={isExporting}>
                        Close
                    </button>
                    <button
                        className="btn btn-primary d-flex align-items-center"
                        onClick={handleDownload}
                        disabled={isExporting}
                    >
                        {isExporting ? <FaSpinner className="me-2 fa-spin" /> : <FaDownload className="me-2" />}
                        {isExporting ? "Exporting..." : "Download PDF"}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default PreviewModal;
