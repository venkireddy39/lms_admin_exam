import React, { useState, useEffect } from "react";
import { createPortal } from "react-dom";

const ChapterList = ({
    chapters = [],
    activeChapterId,
    activeContentId,
    onSelect,
    onSelectContent,
    onAddItem,
    onAddChapter,
    onUpdateTitle,
    onDelete,
    onEditContent,
    onDeleteContent,
    onQuickAdd,
    onMoveChapter,
    onMoveContent,
    isFreeMode = false,
}) => {
    const [expanded, setExpanded] = useState({});
    const [editingId, setEditingId] = useState(null);
    const [editValue, setEditValue] = useState("");
    const [menuOpenId, setMenuOpenId] = useState(null);
    const [menuPosition, setMenuPosition] = useState({ top: 0, left: 0 });

    useEffect(() => {
        const closeMenu = () => setMenuOpenId(null);
        window.addEventListener("click", closeMenu);
        window.addEventListener("scroll", closeMenu, true);
        return () => {
            window.removeEventListener("click", closeMenu);
            window.removeEventListener("scroll", closeMenu, true);
        };
    }, []);

    useEffect(() => {
        if (activeChapterId) {
            setExpanded((prev) => ({ ...prev, [activeChapterId]: true }));
        }
    }, [activeChapterId]);

    const toggleExpand = (id) => setExpanded((prev) => ({ ...prev, [id]: !prev[id] }));

    const startEdit = (chapter) => {
        setEditingId(chapter.id);
        setEditValue(chapter.title || "");
        setMenuOpenId(null);
    };

    const saveEdit = (id) => {
        if (!editValue.trim() || editingId !== id) return;
        onUpdateTitle(id, editValue.trim());
        setEditingId(null);
    };

    const confirmDelete = (id) => {
        if (window.confirm("Are you sure you want to delete this chapter?")) {
            onDelete(id);
        }
        setMenuOpenId(null);
    };

    const getItemIconClass = (type) => {
        switch (type) {
            case "video": return "bi-camera-video";
            case "pdf": return "bi-file-earmark-pdf";
            case "quiz": return "bi-question-circle";
            case "assignment": return "bi-pencil-square";
            case "heading": return "bi-layout-text-sidebar";
            default: return "bi-file-text";
        }
    };

    const handleMenuOpen = (e, id) => {
        e.stopPropagation();
        if (menuOpenId === id) {
            setMenuOpenId(null);
            return;
        }
        const rect = e.currentTarget.getBoundingClientRect();
        setMenuPosition({ top: rect.bottom + 5, left: rect.left - 150 });
        setMenuOpenId(id);
    };

    return (
        <div className="d-flex flex-column h-100 bg-white border-end shadow-sm">
            <div className="p-3 border-bottom bg-light">
                <h6 className="mb-0 fw-bold text-dark text-uppercase small ls-1">Course Content</h6>
            </div>

            <div className="flex-grow-1 overflow-auto">
                {chapters.length === 0 ? (
                    <div className="text-center p-4 py-5 text-muted">
                        <i className="bi bi-folder2-open display-6 opacity-25 d-block mb-3"></i>
                        <p className="small mb-0 text-muted">No content found.</p>
                    </div>
                ) : (
                    <div className="list-group list-group-flush">
                        {chapters.map((chapter) => {
                            const isExpanded = expanded[chapter.id];
                            const isActive = activeChapterId === chapter.id;

                            return (
                                <div key={chapter.id} className="border-bottom-0">
                                    <div
                                        className={`list-group-item list-group-item-action d-flex align-items-center py-2 px-3 border-0 transition-all ${isActive ? 'bg-primary bg-opacity-10 text-primary fw-bold' : ''}`}
                                        onClick={() => onSelect(chapter.id)}
                                        style={{ borderLeft: isActive ? '4px solid #0d6efd' : '4px solid transparent', cursor: 'pointer' }}
                                    >
                                        <button
                                            className="btn btn-link btn-sm p-0 me-2 text-muted text-decoration-none"
                                            onClick={(e) => { e.stopPropagation(); toggleExpand(chapter.id); }}
                                        >
                                            <i className={`bi bi-chevron-${isExpanded ? 'down' : 'right'} small`}></i>
                                        </button>

                                        <div className="flex-grow-1 overflow-hidden">
                                            {editingId === chapter.id ? (
                                                <input
                                                    autoFocus
                                                    className="form-control form-control-sm"
                                                    value={editValue}
                                                    onChange={(e) => setEditValue(e.target.value)}
                                                    onBlur={() => saveEdit(chapter.id)}
                                                    onKeyDown={(e) => e.key === "Enter" && saveEdit(chapter.id)}
                                                    onClick={(e) => e.stopPropagation()}
                                                />
                                            ) : (
                                                <span className="small text-truncate d-block">{chapter.title}</span>
                                            )}
                                        </div>

                                        {!isFreeMode && (
                                            <button className="btn btn-sm text-muted p-0 ms-2" onClick={(e) => handleMenuOpen(e, chapter.id)}>
                                                <i className="bi bi-three-dots-vertical"></i>
                                            </button>
                                        )}
                                    </div>

                                    {isExpanded && (
                                        <div className="bg-light bg-opacity-25 pb-1">
                                            {(chapter.contents || []).map((item) => {
                                                const isItemActive = activeContentId === item.id;
                                                return (
                                                    <div
                                                        key={item.id}
                                                        className={`d-flex align-items-center py-1 px-4 ms-2 small transition-all cursor-pointer ${isItemActive ? 'text-primary fw-bold' : 'text-muted'}`}
                                                        onClick={(e) => { e.stopPropagation(); onSelectContent?.(chapter.id, item); }}
                                                    >
                                                        <i className={`bi ${getItemIconClass(item.type)} me-2`}></i>
                                                        <span className="text-truncate flex-grow-1">{item.title}</span>
                                                        {!isFreeMode && (
                                                            <button className="btn btn-sm text-muted p-0 ms-1 opacity-50" onClick={(e) => handleMenuOpen(e, item.id)}>
                                                                <i className="bi bi-three-dots-vertical" style={{ fontSize: '10px' }}></i>
                                                            </button>
                                                        )}
                                                    </div>
                                                );
                                            })}
                                            {!isFreeMode && (
                                                <button
                                                    className="btn btn-link btn-sm text-decoration-none ms-4 ps-3 py-1 text-primary small d-flex align-items-center gap-1 opacity-75 hover-opacity-100"
                                                    onClick={(e) => { e.stopPropagation(); onAddItem(chapter.id); }}
                                                >
                                                    <i className="bi bi-plus-circle"></i> Add item
                                                </button>
                                            )}
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>

            {!isFreeMode && (
                <div className="p-3 border-top mt-auto bg-light">
                    <button className="btn btn-primary w-100 btn-sm shadow-sm font-weight-bold d-flex align-items-center justify-content-center gap-2" onClick={onAddChapter}>
                        <i className="bi bi-plus-lg"></i> Add Chapter
                    </button>
                </div>
            )}

            {menuOpenId && createPortal(
                <div className="dropdown-menu show shadow border p-1" style={{ position: 'fixed', top: menuPosition.top, left: menuPosition.left, minWidth: '160px', zIndex: 2000 }}>
                    {chapters.find(c => c.id === menuOpenId) ? (
                        <>
                            <button className="dropdown-item py-2 small d-flex align-items-center gap-2" onClick={() => { onAddItem(menuOpenId); setMenuOpenId(null); }}>
                                <i className="bi bi-plus-circle text-primary"></i> Add Content
                            </button>
                            <button className="dropdown-item py-2 small d-flex align-items-center gap-2" onClick={() => { const ch = chapters.find(c => c.id === menuOpenId); if (ch) startEdit(ch); }}>
                                <i className="bi bi-pencil text-muted"></i> Rename
                            </button>
                            <div className="dropdown-divider"></div>
                            <button className="dropdown-item py-2 small d-flex align-items-center gap-2 text-danger" onClick={() => confirmDelete(menuOpenId)}>
                                <i className="bi bi-trash"></i> Delete
                            </button>
                        </>
                    ) : (
                        (() => {
                            let foundChapter = null;
                            let foundItem = null;
                            for (const c of chapters) {
                                const it = c.contents?.find(i => i.id === menuOpenId);
                                if (it) { foundChapter = c; foundItem = it; break; }
                            }
                            if (!foundItem) return null;
                            return (
                                <>
                                    <button className="dropdown-item py-2 small d-flex align-items-center gap-2" onClick={() => { onEditContent?.(foundChapter.id, foundItem); setMenuOpenId(null); }}>
                                        <i className="bi bi-pencil text-muted"></i> Edit Item
                                    </button>
                                    <div className="dropdown-divider"></div>
                                    <button className="dropdown-item py-2 small d-flex align-items-center gap-2 text-danger" onClick={() => { onDeleteContent?.(foundChapter.id, foundItem.id); setMenuOpenId(null); }}>
                                        <i className="bi bi-trash"></i> Remove
                                    </button>
                                </>
                            );
                        })()
                    )}
                </div>,
                document.body
            )}
        </div>
    );
};

export default ChapterList;
