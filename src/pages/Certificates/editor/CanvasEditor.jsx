import React, { useState } from "react";
import { FaCheck } from "react-icons/fa";
import CertificateRenderer from "../renderer/CertificateRenderer";
import DragElements from "./DragElements";
import PropertyPanel from "./PropertyPanel";

const CanvasEditor = ({
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
                color: "#000000",
                textAlign: "left",
                fontWeight: "normal",
                opacity: 1
            }
        };

        if (type === "text") {
            el = { ...el, w: 300, content: "{{studentName}}" };
        }
        if (type === "image") {
            el = { ...el, type: "image", w: 150, h: 150, src: "https://via.placeholder.com/150" };
        }
        if (type === "signature") {
            el = { ...el, type: "image", w: 200, h: 80, src: settings?.directorSignature || "https://upload.wikimedia.org/wikipedia/commons/thumb/e/e4/Signature_sample.svg/1200px-Signature_sample.svg.png", x: 600, y: 550 };
        }
        if (type === "stamp") {
            el = { ...el, type: "image", w: 120, h: 120, src: settings?.sealImage || "https://cdn-icons-png.flaticon.com/512/1152/1152750.png", x: 800, y: 500 };
        }
        if (type === "qr") {
            el = { ...el, type: "qr", w: 100, h: 100, x: 50, y: 550 };
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

    const selectedEl = editingTemplate.elements?.find(e => e.id === selectedId);

    return (
        <div className="row g-3 h-100">
            {/* LEFT: Toolbar & Document Properties */}
            <div className="col-lg-3">
                <DragElements
                    editingTemplate={editingTemplate}
                    setEditingTemplate={setEditingTemplate}
                    updateTheme={updateTheme}
                    removeBackgroundImage={removeBackgroundImage}
                    handleBgUpload={handleBgUpload}
                    addElement={addElement}
                />
            </div>

            {/* CENTER: Canvas Editor */}
            <div className="col-lg-6">
                <CertificateRenderer
                    template={editingTemplate}
                    data={{
                        studentName: "John Doe",
                        courseName: "React Mastery",
                        issueDate: new Date().toLocaleDateString('en-GB'),
                        certificateId: "CERT-2026-001",
                        instituteName: settings?.instituteName || "LMS Academy",
                        ...settings
                    }}
                    isDesigning={true}
                    onUpdateTemplate={setEditingTemplate}
                    onSelectElement={setSelectedId}
                    selectedId={selectedId}
                />
            </div>

            {/* RIGHT: Properties Panel */}
            <div className="col-lg-3">
                <PropertyPanel
                    selectedEl={selectedEl}
                    updateElement={updateElement}
                    updateStyle={updateStyle}
                    reorderElement={reorderElement}
                    removeElement={removeElement}
                />
            </div>

            {/* FOOTER: Actions */}
            <div className="col-12 mt-4 text-end">
                <button className="btn btn-outline-secondary me-2 px-4 shadow-sm" onClick={() => setIsEditorOpen(false)}>Discard</button>
                <button className="btn btn-success px-5 shadow-sm" onClick={handleTemplateSave}><FaCheck className="me-2" /> Save Template</button>
            </div>
        </div>
    );
};

export default CanvasEditor;
