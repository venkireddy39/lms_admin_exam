import React from 'react';
import { FaFont, FaImage, FaSignature, FaStamp } from 'react-icons/fa';

const DragElements = ({
    editingTemplate,
    setEditingTemplate,
    updateTheme,
    removeBackgroundImage,
    handleBgUpload,
    addElement
}) => {
    return (
        <div className="d-flex flex-column gap-3">
            {/* CANVAS SETTINGS */}
            <div className="card p-3" style={{ maxHeight: "40vh", overflowY: "auto" }}>
                <h6 className="fw-bold mb-3">Canvas Settings</h6>
                <input
                    className="form-control mb-2"
                    value={editingTemplate?.name || ''}
                    onChange={e => setEditingTemplate({ ...editingTemplate, name: e.target.value })}
                    placeholder="Template Name"
                />

                <div className="mb-2">
                    <label className="form-label small fw-bold">Orientation</label>
                    <div className="btn-group w-100">
                        <button
                            className={`btn btn-sm ${editingTemplate?.page?.orientation === 'landscape' ? 'btn-dark' : 'btn-outline-secondary'}`}
                            onClick={() => setEditingTemplate(prev => ({ ...prev, page: { ...prev.page, orientation: 'landscape' } }))}
                        >
                            Landscape
                        </button>
                        <button
                            className={`btn btn-sm ${editingTemplate?.page?.orientation === 'portrait' ? 'btn-dark' : 'btn-outline-secondary'}`}
                            onClick={() => setEditingTemplate(prev => ({ ...prev, page: { ...prev.page, orientation: 'portrait' } }))}
                        >
                            Portrait
                        </button>
                    </div>
                </div>
                <div className="mb-2">
                    <label className="form-label small fw-bold">Background Image</label>
                    <input type="file" className="form-control mb-1" accept="image/*" onChange={handleBgUpload} />
                    {editingTemplate?.theme?.backgroundImage && (
                        <button className="btn btn-sm btn-outline-danger w-100 mt-2" onClick={removeBackgroundImage}>
                            Remove Background
                        </button>
                    )}
                </div>
                <div className="mb-2">
                    <label className="form-label small fw-bold">Font Family</label>
                    <select
                        className="form-select"
                        value={editingTemplate?.theme?.fontFamily || "'Inter', sans-serif"}
                        onChange={e => updateTheme("fontFamily", e.target.value)}
                    >
                        <option value="'Inter', sans-serif">Inter</option>
                        <option value="'Playfair Display', serif">Playfair Display</option>
                        <option value="'Roboto', sans-serif">Roboto</option>
                        <option value="'Orbitron', sans-serif">Orbitron</option>
                        <option value="'Courier New', Courier, monospace">Courier New</option>
                    </select>
                </div>
                <div className="form-check form-switch mt-2">
                    <input
                        className="form-check-input"
                        type="checkbox"
                        checked={editingTemplate?.theme?.showGrid || false}
                        onChange={(e) => updateTheme("showGrid", e.target.checked)}
                    />
                    <label className="form-check-label small fw-bold">Show Design Grid</label>
                </div>
            </div>

            {/* WATERMARK SETTINGS */}
            <div className="card p-3">
                <h6 className="fw-bold mb-2">Watermark</h6>
                <select
                    className="form-select mb-2"
                    value={editingTemplate?.theme?.watermark?.type || "none"}
                    onChange={(e) => setEditingTemplate(prev => ({
                        ...prev,
                        theme: {
                            ...prev.theme,
                            watermark: { type: e.target.value, opacity: 0.1, isRepeated: true, text: "DRAFT", color: "#000000" }
                        }
                    }))}
                >
                    <option value="none">None</option>
                    <option value="text">Text Pattern</option>
                    <option value="image">Image Pattern</option>
                </select>

                {editingTemplate?.theme?.watermark?.type === "text" && (
                    <div className="d-flex flex-column gap-2 mt-2">
                        <input
                            className="form-control"
                            placeholder="Watermark Text"
                            value={editingTemplate.theme.watermark.text || ""}
                            onChange={(e) => updateTheme("watermark", { ...editingTemplate.theme.watermark, text: e.target.value })}
                        />
                        <div className="d-flex align-items-center gap-2">
                            <input
                                type="color"
                                className="form-control form-control-color"
                                value={editingTemplate.theme.watermark.color || "#000000"}
                                onChange={(e) => updateTheme("watermark", { ...editingTemplate.theme.watermark, color: e.target.value })}
                            />
                            <div className="form-check form-switch ms-2">
                                <input
                                    className="form-check-input"
                                    type="checkbox"
                                    checked={editingTemplate.theme.watermark.isRepeated !== false}
                                    onChange={(e) => updateTheme("watermark", { ...editingTemplate.theme.watermark, isRepeated: e.target.checked })}
                                />
                                <label className="form-check-label small">Repeated</label>
                            </div>
                        </div>
                        <label className="form-label small fw-bold mt-1">Opacity</label>
                        <input
                            type="range"
                            className="form-range"
                            min="0"
                            max="1"
                            step="0.05"
                            value={editingTemplate.theme.watermark.opacity || 0.1}
                            onChange={(e) => updateTheme("watermark", { ...editingTemplate.theme.watermark, opacity: parseFloat(e.target.value) })}
                        />
                    </div>
                )}

                {editingTemplate?.theme?.watermark?.type === "image" && (
                    <div className="d-flex flex-column gap-2 mt-2">
                        <input
                            type="file"
                            className="form-control"
                            accept="image/*"
                            onChange={(e) => {
                                const file = e.target.files[0];
                                if (file) {
                                    const reader = new FileReader();
                                    reader.onload = ev => updateTheme("watermark", { ...editingTemplate.theme.watermark, src: ev.target.result });
                                    reader.readAsDataURL(file);
                                }
                            }}
                        />
                        <div className="form-check form-switch mt-1">
                            <input
                                className="form-check-input"
                                type="checkbox"
                                checked={editingTemplate.theme.watermark.isRepeated !== false}
                                onChange={(e) => updateTheme("watermark", { ...editingTemplate.theme.watermark, isRepeated: e.target.checked })}
                            />
                            <label className="form-check-label small">Tile Image</label>
                        </div>
                        <label className="form-label small fw-bold mt-1">Opacity</label>
                        <input
                            type="range"
                            className="form-range"
                            min="0"
                            max="1"
                            step="0.05"
                            value={editingTemplate.theme.watermark.opacity || 0.1}
                            onChange={(e) => updateTheme("watermark", { ...editingTemplate.theme.watermark, opacity: parseFloat(e.target.value) })}
                        />
                    </div>
                )}
            </div>

            {/* BORDER SETTINGS */}
            <div className="card p-3">
                <h6 className="fw-bold mb-2">Border Settings</h6>
                <select
                    className="form-select mb-2"
                    value={editingTemplate?.theme?.border?.type || "none"}
                    onChange={(e) => updateTheme("border", { ...editingTemplate.theme.border, type: e.target.value })}
                >
                    <option value="none">None</option>
                    <option value="classic">Classic (Solid)</option>
                    <option value="modern">Modern (Double)</option>
                    <option value="premium">Premium (3D Frame)</option>
                    <option value="dashed">Dashed</option>
                    <option value="dotted">Dotted</option>
                </select>

                {editingTemplate?.theme?.border?.type && editingTemplate.theme.border.type !== "none" && (
                    <div className="d-flex flex-column gap-2 mt-2">
                        <div className="d-flex align-items-center gap-2">
                            <input
                                type="color"
                                className="form-control form-control-color"
                                value={editingTemplate.theme.border.color || "#000000"}
                                onChange={(e) => updateTheme("border", { ...editingTemplate.theme.border, color: e.target.value })}
                                title="Border Color"
                            />
                            <div className="flex-grow-1">
                                <label className="form-label small fw-bold mb-0">Thickness</label>
                                <input
                                    type="range"
                                    className="form-range"
                                    min="1"
                                    max="50"
                                    value={editingTemplate.theme.border.width || 5}
                                    onChange={(e) => updateTheme("border", { ...editingTemplate.theme.border, width: parseInt(e.target.value) })}
                                />
                            </div>
                        </div>

                        <div className="mt-2">
                            <label className="form-label small fw-bold mb-0">Corner Radius</label>
                            <input
                                type="range"
                                className="form-range"
                                min="0"
                                max="100"
                                value={editingTemplate.theme.border.radius || 0}
                                onChange={(e) => updateTheme("border", { ...editingTemplate.theme.border, radius: parseInt(e.target.value) })}
                            />
                        </div>
                    </div>
                )}
            </div>

            {/* ADD ELEMENTS TOOLBAR */}
            <div className="card p-3">
                <h6 className="fw-bold mb-2">Add Elements</h6>
                <div className="d-grid gap-2">
                    <button className="btn btn-outline-secondary text-start" onClick={() => addElement("text")}>
                        <FaFont className="me-2" /> Text Block
                    </button>
                    <button className="btn btn-outline-secondary text-start" onClick={() => addElement("image")}>
                        <FaImage className="me-2" /> Image / Logo
                    </button>
                    <button className="btn btn-outline-secondary text-start" onClick={() => addElement("signature")}>
                        <FaSignature className="me-2" /> Signature
                    </button>
                    <button className="btn btn-outline-secondary text-start" onClick={() => addElement("stamp")}>
                        <FaStamp className="me-2" /> Stamp / Seal
                    </button>
                    <button className="btn btn-outline-secondary text-start" onClick={() => addElement("qr")}>
                        <span className="me-2 fw-bold" style={{ fontFamily: 'monospace' }}>QR</span> Verification QR
                    </button>
                    <div className="mt-2 text-muted small">
                        <strong>Dynamic Variables:</strong><br />
                        {`{{studentName}}`}, {`{{courseName}}`}, {`{{certificateId}}`}, {`{{issueDate}}`}, {`{{instituteName}}`}
                    </div>
                </div>
            </div>

        </div>
    );
};

export default DragElements;
