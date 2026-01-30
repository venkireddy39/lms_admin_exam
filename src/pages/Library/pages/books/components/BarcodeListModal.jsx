import React from 'react';
import { X, QrCode, Printer } from 'lucide-react';

const BarcodeListModal = ({ book, onClose }) => {
    if (!book) return null;

    const API_BASE = import.meta.env.VITE_API_BASE || "http://localhost:9191";

    const handlePrint = () => {
        window.print();
    };

    return (
        <>
            <style>
                {`
                @media print {
                    body * {
                        visibility: hidden;
                    }
                    .print-area, .print-area * {
                        visibility: visible;
                    }
                    .print-area {
                        position: absolute;
                        left: 0;
                        top: 0;
                        width: 100%;
                    }
                    .no-print {
                        display: none !important;
                    }
                    .barcode-card {
                        break-inside: avoid;
                        page-break-inside: avoid;
                        margin-bottom: 20px;
                        border: 1px solid #ddd !important;
                        padding: 10px !important;
                        text-align: center;
                    }
                    .modal-backdrop, .modal {
                        position: static !important;
                        background: none !important;
                    }
                }
                `}
            </style>

            <div className="modal fade show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
                <div className="modal-dialog modal-lg modal-dialog-centered">
                    <div className="modal-content shadow-lg border-0">
                        <div className="modal-header bg-light no-print">
                            <h5 className="modal-title d-flex align-items-center">
                                <QrCode className="me-2 text-primary" size={24} />
                                Print Labels: {book.title}
                            </h5>
                            <button type="button" className="btn-close" onClick={onClose}></button>
                        </div>
                        <div className="modal-body p-4 print-area">
                            <div className="row g-4">
                                {(book.copies || []).length === 0 ? (
                                    <div className="col-12 text-center py-5 text-muted no-print">
                                        No barcodes found for this book.
                                    </div>
                                ) : (
                                    (book.copies || []).map((copy, index) => (
                                        <div key={copy.uuid || index} className="col-md-6 col-lg-4 col-print-6 barcode-card">
                                            <div className="text-center p-2 border rounded bg-white">
                                                <div className="small fw-bold mb-1 text-truncate">{book.title}</div>
                                                <div className="mb-2 d-flex justify-content-center">
                                                    <img
                                                        src={`${API_BASE}/library/qr-code?data=${encodeURIComponent(copy.barcode)}`}
                                                        alt="QR Code"
                                                        style={{ width: '120px', height: '120px' }}
                                                        className="img-fluid"
                                                        crossOrigin="anonymous"
                                                    />
                                                </div>
                                                <div className="fw-bold small" style={{ letterSpacing: '2px' }}>{copy.barcode}</div>
                                                <div className="text-muted" style={{ fontSize: '10px' }}>Library Property</div>
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>
                        </div>
                        <div className="modal-footer border-0 no-print">
                            <button type="button" className="btn btn-outline-secondary px-4" onClick={onClose}>Cancel</button>
                            <button
                                type="button"
                                className="btn btn-primary px-4 d-flex align-items-center"
                                onClick={handlePrint}
                                disabled={(book.copies || []).length === 0}
                            >
                                <Printer size={18} className="me-2" />
                                Print All Labels
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
};

export default BarcodeListModal;
