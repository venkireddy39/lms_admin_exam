import React from 'react';
import { X, Printer, Barcode as BarcodeIcon } from 'lucide-react';
// Now safe to import
import Barcode from 'react-barcode';

const BarcodeListModal = ({ book, onClose }) => {
    if (!book) return null;

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
                    
                    /* Hide everything by default, then show print-area */
                    #root > * {
                        display: none;
                    }

                    .print-area, .print-area * {
                        visibility: visible !important;
                        display: block; /* Fallback */
                    }
                    
                    /* Grid support inside print area */
                    .print-area .row {
                        display: grid !important;
                        grid-template-columns: repeat(3, 1fr) !important;
                        gap: 20px !important;
                    }

                    .print-area .col-md-6 {
                        width: auto !important;
                    }

                    .print-area {
                        position: fixed;
                        left: 0;
                        top: 0;
                        width: 100%;
                        min-height: 100vh;
                        z-index: 9999;
                        background: white;
                        margin: 0;
                        padding: 20px;
                    }
                    
                    .barcode-card {
                        border: 1px solid #000 !important;
                        break-inside: avoid;
                        page-break-inside: avoid;
                        padding: 15px;
                        display: flex;
                        flex-direction: column;
                        align-items: center;
                        justify-content: center;
                        background: white !important;
                        box-shadow: none !important;
                    }

                    .no-print, .modal-header, .modal-footer, .btn-close {
                        display: none !important;
                    }
                    
                    /* Reset Modal wrappers to not interfere */
                    .modal, .modal-dialog, .modal-content, .modal-body {
                        position: static !important;
                        display: block !important;
                        width: 100% !important;
                        height: auto !important;
                        border: none !important;
                        box-shadow: none !important;
                        background: transparent !important;
                        padding: 0 !important;
                        margin: 0 !important;
                        overflow: visible !important;
                        transform: none !important;
                    }
                }
                `}
            </style>

            <div className="modal fade show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
                <div className="modal-dialog modal-lg modal-dialog-centered">
                    <div className="modal-content shadow-lg border-0">
                        <div className="modal-header bg-light no-print">
                            <h5 className="modal-title d-flex align-items-center">
                                <BarcodeIcon className="me-2 text-primary" size={24} />
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
                                            <div className="text-center p-2 border rounded bg-white h-100 d-flex flex-column justify-content-center align-items-center">
                                                <div className="small fw-bold mb-1 text-truncate w-100">{book.title}</div>
                                                <div className="my-2 bg-white d-flex justify-content-center w-100">
                                                    <Barcode
                                                        value={copy.barcode}
                                                        width={1.5}
                                                        height={50}
                                                        fontSize={14}
                                                        margin={0}
                                                        displayValue={true}
                                                    />
                                                </div>
                                                <div className="text-muted small" style={{ fontSize: '10px', marginTop: '4px' }}>
                                                    Library Property
                                                </div>
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
