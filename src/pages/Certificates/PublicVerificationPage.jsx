import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { QRCodeCanvas } from "qrcode.react";

function PublicVerificationPage() {
    const { id } = useParams();
    const [certificate, setCertificate] = useState(null);
    const [status, setStatus] = useState("loading");

    useEffect(() => {
        // mock fetch for now representing backend verification
        const mock = {
            certificateId: id,
            studentName: "Ajay Kumar",
            courseName: "Java Full Stack Development",
            completionDate: "04 March 2026",
            instituteName: "Graphy LMS"
        };

        // In a real scenario, this would be an API call to verify if `id` exists and is valid.
        if (id) {
            setTimeout(() => {
                setCertificate(mock);
                setStatus("valid");
            }, 800); // Simulate network delay
        } else {
            setStatus("invalid");
        }
    }, [id]);

    return (
        <div className="container mt-5 animate-fade-in" style={{ maxWidth: '600px' }}>
            <div className="text-center mb-4">
                <Link to="/" className="text-decoration-none">
                    <h2 className="fw-bold text-primary">LMS Verification Portal</h2>
                </Link>
                <p className="text-muted">Verify the authenticity of any certificate.</p>
            </div>

            {status === "loading" && (
                <div className="text-center my-5">
                    <div className="spinner-border text-primary" role="status">
                        <span className="visually-hidden">Checking...</span>
                    </div>
                    <p className="mt-3 text-muted">Verifying certificate records...</p>
                </div>
            )}

            {status === "valid" && certificate && (
                <div className="card shadow-lg border-0 rounded-4 overflow-hidden">
                    <div className="bg-success text-white text-center py-3">
                        <h4 className="mb-0 fw-bold">✓ Valid Certificate</h4>
                    </div>
                    <div className="card-body p-5">
                        <div className="d-flex justify-content-between flex-wrap gap-4">
                            <div>
                                <h6 className="text-muted text-uppercase mb-1 small fw-bold">Issued To</h6>
                                <h4 className="fw-bold text-body mb-4">{certificate.studentName}</h4>

                                <h6 className="text-muted text-uppercase mb-1 small fw-bold">Course Completed</h6>
                                <p className="text-body fw-medium mb-4">{certificate.courseName}</p>

                                <div className="row g-3">
                                    <div className="col-6">
                                        <h6 className="text-muted text-uppercase mb-1 small fw-bold">Issue Date</h6>
                                        <p className="text-body fw-medium mb-0">{certificate.completionDate}</p>
                                    </div>
                                    <div className="col-6">
                                        <h6 className="text-muted text-uppercase mb-1 small fw-bold">Institute</h6>
                                        <p className="text-body fw-medium mb-0">{certificate.instituteName}</p>
                                    </div>
                                </div>
                            </div>

                            <div className="text-center pt-2">
                                <div className="bg-light p-3 rounded-4 d-inline-block border">
                                    <QRCodeCanvas
                                        value={`${window.location.origin}/verify/${certificate.certificateId}`}
                                        size={120}
                                        level="H"
                                    />
                                </div>
                                <div className="mt-3">
                                    <p className="mb-0 text-muted small fw-bold">Certificate ID</p>
                                    <p className="font-monospace text-body mb-0 bg-light px-2 py-1 rounded mt-1">{certificate.certificateId}</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {status === "invalid" && (
                <div className="alert alert-danger shadow-sm border-0 rounded-4 text-center p-4">
                    <h4 className="alert-heading fw-bold mb-3">Invalid Certificate</h4>
                    <p className="mb-0 text-body">We could not find a record matching this certificate ID.</p>
                </div>
            )}
        </div>
    );
}

export default PublicVerificationPage;
