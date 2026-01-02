import React, { useState } from "react";
import {
  FaMagic,
  FaPlus,
  FaImage,
  FaFont,
  FaTrash,
  FaCheck,
  FaRibbon,
  FaStamp,
  FaSignature,
  FaTint,
  FaArrowUp,
  FaArrowDown,
  FaBold,
  FaAlignLeft,
  FaAlignCenter,
  FaAlignRight
} from "react-icons/fa";
import CertificateRenderer from "../renderer/CertificateRenderer";

const DesignStudio = ({
  editingTemplate,
  setEditingTemplate,
  handleTemplateSave,
  setIsEditorOpen,
  settings
}) => {
  const [selectedId, setSelectedId] = useState(null);

  /* ---------- THEME ---------- */
  const updateTheme = (key, val) => {
    setEditingTemplate(prev => ({
      ...prev,
      theme: { ...prev.theme, [key]: val }
    }));
  };

  const removeBackgroundImage = () => {
    setEditingTemplate(prev => ({
      ...prev,
      theme: {
        ...prev.theme,
        backgroundImage: ""
      }
    }));
  };

  const handleBgUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = ev => updateTheme("backgroundImage", ev.target.result);
    reader.readAsDataURL(file);

    e.target.value = "";
  };

  /* ---------- ELEMENTS ---------- */
  const addElement = (type) => {
    let el = {
      id: Date.now().toString(),
      type: "text",
      x: 50,
      y: 50,
      w: 200,
      h: 50,
      content: "",
      src: "",
      style: {
        fontSize: "20px",
        color: "#000",
        textAlign: "left",
        fontWeight: "normal",
        opacity: 1
      }
    };

    if (type === "text") {
      el = { ...el, w: 400, content: "New Text" };
    }
    if (type === "image") {
      el = { ...el, type: "image", w: 200, h: 200, src: "https://via.placeholder.com/150" };
    }
    if (type === "ribbon") {
      el = { ...el, type: "image", w: 100, h: 100, src: "https://cdn-icons-png.flaticon.com/512/5980/5980315.png", x: 800, y: 50 };
    }
    if (type === "stamp") {
      el = { ...el, type: "image", w: 120, h: 120, src: settings?.sealImage || "https://cdn-icons-png.flaticon.com/512/1152/1152750.png", x: 800, y: 500 };
    }
    if (type === "signature") {
      el = { ...el, type: "image", w: 200, h: 80, src: settings?.directorSignature || "https://upload.wikimedia.org/wikipedia/commons/thumb/e/e4/Signature_sample.svg/1200px-Signature_sample.svg.png", x: 600, y: 550 };
    }
    if (type === "watermark") {
      el = { ...el, type: "image", w: 500, h: 500, src: settings?.logo || "https://via.placeholder.com/500?text=LOGO", x: 250, y: 100, style: { ...el.style, opacity: 0.1 } };
    }

    setEditingTemplate(prev => ({
      ...prev,
      elements: [...prev.elements, el]
    }));
    setSelectedId(el.id);
  };

  const updateElement = (id, key, val) => {
    setEditingTemplate(prev => ({
      ...prev,
      elements: prev.elements.map(el =>
        el.id === id ? { ...el, [key]: val } : el
      )
    }));
  };

  const updateStyle = (id, key, val) => {
    setEditingTemplate(prev => ({
      ...prev,
      elements: prev.elements.map(el =>
        el.id === id
          ? { ...el, style: { ...el.style, [key]: val } }
          : el
      )
    }));
  };

  const removeElement = (id) => {
    setEditingTemplate(prev => ({
      ...prev,
      elements: prev.elements.filter(el => el.id !== id)
    }));
    if (selectedId === id) setSelectedId(null);
  };

  const reorderElement = (dir) => {
    if (!selectedId) return;

    setEditingTemplate(prev => {
      const idx = prev.elements.findIndex(e => e.id === selectedId);
      if (idx === -1) return prev;

      const els = [...prev.elements];
      if (dir === "up" && idx < els.length - 1) {
        [els[idx], els[idx + 1]] = [els[idx + 1], els[idx]];
      }
      if (dir === "down" && idx > 0) {
        [els[idx], els[idx - 1]] = [els[idx - 1], els[idx]];
      }
      return { ...prev, elements: els };
    });
  };

  const selectedEl = editingTemplate.elements.find(e => e.id === selectedId);

  /* ---------- RENDER ---------- */
  return (
    <div className="row g-3 h-100">

      {/* LEFT */}
      <div className="col-lg-3 d-flex flex-column gap-3">

        <div className="card p-3" style={{ maxHeight: "40vh", overflowY: "auto" }}>
          <h6 className="fw-bold mb-3">Canvas Settings</h6>
          <input
            className="form-control mb-2"
            value={editingTemplate.name}
            onChange={e => setEditingTemplate({ ...editingTemplate, name: e.target.value })}
            placeholder="Template Name"
          />

          <div className="mb-2">
            <label className="form-label small fw-bold">Orientation</label>
            <div className="btn-group w-100">
              <button
                className={`btn btn-sm ${editingTemplate.page?.orientation === 'landscape' ? 'btn-dark' : 'btn-outline-secondary'}`}
                onClick={() => setEditingTemplate(prev => ({ ...prev, page: { ...prev.page, orientation: 'landscape' } }))}
              >
                Landscape
              </button>
              <button
                className={`btn btn-sm ${editingTemplate.page?.orientation === 'portrait' ? 'btn-dark' : 'btn-outline-secondary'}`}
                onClick={() => setEditingTemplate(prev => ({ ...prev, page: { ...prev.page, orientation: 'portrait' } }))}
              >
                Portrait
              </button>
            </div>
          </div>
          <div className="mb-2">
            <label className="form-label small fw-bold">Background</label>
            <input type="file" className="form-control mb-1" accept="image/*" onChange={handleBgUpload} />
            {editingTemplate.theme.backgroundImage && (
              <button className="btn btn-sm btn-outline-danger w-100" onClick={removeBackgroundImage}>
                Remove BG
              </button>
            )}
          </div>
          <div className="mb-2">
            <label className="form-label small fw-bold">Font Family</label>
            <select
              className="form-select"
              value={editingTemplate.theme.fontFamily}
              onChange={e => updateTheme("fontFamily", e.target.value)}
            >
              <option value="'Inter', sans-serif">Inter</option>
              <option value="'Playfair Display', serif">Playfair</option>
              <option value="'Roboto', sans-serif">Roboto</option>
              <option value="'Orbitron', sans-serif">Orbitron</option>
            </select>
          </div>
          <div className="form-check form-switch">
            <input
              className="form-check-input"
              type="checkbox"
              checked={editingTemplate.theme.showGrid || false}
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
            value={editingTemplate.theme.watermark?.type || "none"}
            onChange={(e) => setEditingTemplate(prev => ({
              ...prev,
              theme: {
                ...prev.theme,
                watermark: { type: e.target.value, opacity: 0.1, isRepeated: true, text: "DRAFT", color: "rgba(0,0,0,0.1)" }
              }
            }))}
          >
            <option value="none">None</option>
            <option value="text">Text Pattern</option>
            <option value="image">Image Pattern</option>
          </select>

          {editingTemplate.theme.watermark?.type === "text" && (
            <div className="d-flex flex-column gap-2">
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
            </div>
          )}

          {editingTemplate.theme.watermark?.type === "image" && (
            <div className="d-flex flex-column gap-2">
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
              <div className="form-check form-switch">
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
            value={editingTemplate.theme.border?.type || "none"}
            onChange={(e) => updateTheme("border", { ...editingTemplate.theme.border, type: e.target.value })}
          >
            <option value="none">None</option>
            <option value="classic">Classic (Solid)</option>
            <option value="modern">Modern (Double)</option>
            <option value="premium">Premium (3D Frame)</option>
            <option value="dashed">Dashed</option>
            <option value="dotted">Dotted</option>
          </select>

          {editingTemplate.theme.border?.type && editingTemplate.theme.border.type !== "none" && (
            <div className="d-flex flex-column gap-2">
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

              <div>
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

        <div className="card p-3 flex-grow-1 overflow-auto">
          <h6 className="fw-bold mb-2">Add Elements</h6>
          <div className="d-grid gap-2">
            <button className="btn btn-outline-secondary text-start" onClick={() => addElement("text")}><FaFont className="me-2" /> Text Block</button>
            <button className="btn btn-outline-secondary text-start" onClick={() => addElement("image")}><FaImage className="me-2" /> Image / Logo</button>
            <button className="btn btn-outline-secondary text-start" onClick={() => addElement("signature")}><FaSignature className="me-2" /> Signature</button>
            <button className="btn btn-outline-secondary text-start" onClick={() => addElement("stamp")}><FaStamp className="me-2" /> Stamp / Seal</button>
          </div>
        </div>
      </div>

      {/* CENTER */}
      <div className="col-lg-6">
        <CertificateRenderer
          template={editingTemplate}
          data={{ recipientName: "John Doe", courseName: "React Mastery", date: "2025-12-25", ...settings }}
          isDesigning
          onUpdateTemplate={setEditingTemplate}
          onSelectElement={setSelectedId}
          selectedId={selectedId}
        />
      </div>

      {/* RIGHT */}
      <div className="col-lg-3">
        {selectedEl ? (
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
                <label className="form-label small fw-bold mb-0">Width</label>
                <input
                  type="number"
                  className="form-control form-control-sm"
                  value={Math.round(selectedEl.w)}
                  onChange={(e) => updateElement(selectedEl.id, "w", parseInt(e.target.value))}
                />
              </div>
              {selectedEl.h !== undefined && (
                <div className="col-6">
                  <label className="form-label small fw-bold mb-0">Height</label>
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
              <>
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
              </>
            )}

            {selectedEl.type === "image" && (
              <>
                <label className="form-label small fw-bold">Upload Image</label>
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
              </>
            )}

            <hr />
            <div className="d-flex gap-2">
              <button className="btn btn-secondary btn-sm flex-fill" onClick={() => reorderElement("up")} title="Bring Forward">
                <FaArrowUp /> Layer Up
              </button>
              <button className="btn btn-secondary btn-sm flex-fill" onClick={() => reorderElement("down")} title="Send Backward">
                <FaArrowDown /> Layer Down
              </button>
            </div>
            <button className="btn btn-danger btn-sm w-100 mt-2" onClick={() => removeElement(selectedEl.id)}>
              <FaTrash /> Delete Element
            </button>
          </div>
        ) : (
          <div className="card p-3 text-muted text-center">
            <FaMagic className="mb-2 fs-4" />
            <p className="small">Select an element to edit properties</p>
          </div>
        )}
      </div>

      {/* FOOTER */}
      <div className="col-12 text-end">
        <button className="btn btn-secondary me-2" onClick={() => setIsEditorOpen(false)}>Discard</button>
        <button className="btn btn-success" onClick={handleTemplateSave}><FaCheck /> Save</button>
      </div>
    </div>
  );
};

export default DesignStudio;
