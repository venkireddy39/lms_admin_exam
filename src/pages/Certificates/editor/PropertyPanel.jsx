import React from 'react';
import {
    FaMagic,
    FaArrowUp,
    FaArrowDown,
    FaTrash,
    FaBold,
    FaAlignLeft,
    FaAlignCenter,
    FaAlignRight
} from 'react-icons/fa';

const PropertyPanel = ({
    selectedEl,
    updateElement,
    updateStyle,
    reorderElement,
    removeElement
}) => {
    if (!selectedEl) {
        return (
            <div className="card p-3 text-muted text-center h-100 d-flex flex-column align-items-center justify-content-center">
                <FaMagic className="mb-2 fs-4" />
                <p className="small">Select an element to edit properties</p>
            </div>
        );
    }

    return (
        <div className="card p-3">
            <h6 className="fw-bold mb-3">Edit Element</h6>

            <div className="row g-2 mb-3">
                <div className="col-6">
                    <label className="form-label small fw-bold mb-0">X (px)</label>
                    <input
                        type="number"
                        className="form-control form-control-sm"
                        value={Math.round(selectedEl.x)}
                        onChange={(e) => updateElement(selectedEl.id, "x", parseInt(e.target.value))}
                    />
                </div>
                <div className="col-6">
                    <label className="form-label small fw-bold mb-0">Y (px)</label>
                    <input
                        type="number"
                        className="form-control form-control-sm"
                        value={Math.round(selectedEl.y)}
                        onChange={(e) => updateElement(selectedEl.id, "y", parseInt(e.target.value))}
                    />
                </div>
                <div className="col-6">
                    <label className="form-label small fw-bold mb-0">Width (px)</label>
                    <input
                        type="number"
                        className="form-control form-control-sm"
                        value={Math.round(selectedEl.w)}
                        onChange={(e) => updateElement(selectedEl.id, "w", parseInt(e.target.value))}
                    />
                </div>
                {selectedEl.h !== undefined && (
                    <div className="col-6">
                        <label className="form-label small fw-bold mb-0">Height (px)</label>
                        <input
                            type="number"
                            className="form-control form-control-sm"
                            value={Math.round(selectedEl.h)}
                            onChange={(e) => updateElement(selectedEl.id, "h", parseInt(e.target.value))}
                        />
                    </div>
                )}
            </div>
            <hr className="my-2" />

            {selectedEl.type === "text" && (
                <div className="mb-3">
                    <label className="form-label small fw-bold">Content</label>
                    <textarea
                        className="form-control mb-2"
                        rows="3"
                        value={selectedEl.content}
                        onChange={(e) => updateElement(selectedEl.id, "content", e.target.value)}
                    />

                    <label className="form-label small fw-bold">Font Size (px)</label>
                    <input
                        type="number"
                        className="form-control mb-2"
                        value={parseInt(selectedEl.style?.fontSize) || 20}
                        onChange={(e) => updateStyle(selectedEl.id, "fontSize", `${e.target.value}px`)}
                    />

                    <label className="form-label small fw-bold">Color</label>
                    <input
                        type="color"
                        className="form-control form-control-color w-100 mb-2"
                        value={selectedEl.style?.color || "#000000"}
                        onChange={(e) => updateStyle(selectedEl.id, "color", e.target.value)}
                    />

                    <label className="form-label small fw-bold">Format</label>
                    <div className="btn-group w-100 mb-2">
                        <button
                            className={`btn btn-sm ${selectedEl.style?.fontWeight === 'bold' ? 'btn-dark' : 'btn-outline-secondary'}`}
                            onClick={() => updateStyle(selectedEl.id, "fontWeight", selectedEl.style?.fontWeight === 'bold' ? 'normal' : 'bold')}
                            title="Bold"
                        >
                            <FaBold />
                        </button>
                        <button
                            className={`btn btn-sm ${(!selectedEl.style?.textAlign || selectedEl.style?.textAlign === 'left') ? 'btn-dark' : 'btn-outline-secondary'}`}
                            onClick={() => updateStyle(selectedEl.id, "textAlign", 'left')}
                            title="Align Left"
                        >
                            <FaAlignLeft />
                        </button>
                        <button
                            className={`btn btn-sm ${selectedEl.style?.textAlign === 'center' ? 'btn-dark' : 'btn-outline-secondary'}`}
                            onClick={() => updateStyle(selectedEl.id, "textAlign", 'center')}
                            title="Align Center"
                        >
                            <FaAlignCenter />
                        </button>
                        <button
                            className={`btn btn-sm ${selectedEl.style?.textAlign === 'right' ? 'btn-dark' : 'btn-outline-secondary'}`}
                            onClick={() => updateStyle(selectedEl.id, "textAlign", 'right')}
                            title="Align Right"
                        >
                            <FaAlignRight />
                        </button>
                    </div>
                </div>
            )}

            {selectedEl.type === "image" && (
                <div className="mb-3">
                    <label className="form-label small fw-bold">Upload Image (Replaces current)</label>
                    <input
                        type="file"
                        className="form-control mb-2"
                        accept="image/*"
                        onChange={(e) => {
                            const file = e.target.files[0];
                            if (file) {
                                const reader = new FileReader();
                                reader.onload = (ev) => updateElement(selectedEl.id, "src", ev.target.result);
                                reader.readAsDataURL(file);
                            }
                        }}
                    />
                    <label className="form-label small fw-bold">Opacity</label>
                    <input
                        type="range"
                        className="form-range mb-2"
                        min="0"
                        max="1"
                        step="0.1"
                        value={selectedEl.style?.opacity ?? 1}
                        onChange={(e) => updateStyle(selectedEl.id, "opacity", e.target.value)}
                    />
                </div>
            )}

            {selectedEl.type === "qr" && (
                <div className="mb-3">
                    <div className="alert alert-info py-2 px-3 small">
                        This QR code will be generated dynamically during issuance using the verification URL.
                    </div>
                </div>
            )}

            <hr className="my-2" />
            <div className="d-flex gap-2">
                <button className="btn btn-secondary btn-sm flex-fill d-flex align-items-center justify-content-center gap-1" onClick={() => reorderElement("up")} title="Bring Forward">
                    <FaArrowUp /> Up
                </button>
                <button className="btn btn-secondary btn-sm flex-fill d-flex align-items-center justify-content-center gap-1" onClick={() => reorderElement("down")} title="Send Backward">
                    <FaArrowDown /> Down
                </button>
            </div>
            <button className="btn btn-danger btn-sm w-100 mt-2 d-flex align-items-center justify-content-center gap-2" onClick={() => removeElement(selectedEl.id)}>
                <FaTrash /> Delete Element
            </button>
        </div>
    );
};

export default PropertyPanel;
