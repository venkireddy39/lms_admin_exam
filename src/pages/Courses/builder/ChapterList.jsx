import React, { useState, useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import {
    FiPlus,
    FiMoreVertical,
    FiCheck,
    FiFolderPlus,
    FiEdit2,
    FiTrash2,
    FiFileText,
    FiChevronDown,
    FiChevronRight,
    FiVideo,
    FiType,
    FiLayout,
    FiLock,
    FiPlusCircle,
    FiArrowUp,
    FiArrowDown,
} from "react-icons/fi";

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

    /* ---------------- outside click ---------------- */

    useEffect(() => {
        const closeMenu = () => setMenuOpenId(null);
        // We use 'mousedown' on window to catch clicks anywhere, 
        // but we must ensure blocking stopPropagation doesn't kill it.
        // Actually, for Portals, clicking inside the portal might propagate to document.
        // Use a ref for the dropdown to detect click outside is better, but global click is easier for now.
        window.addEventListener("click", closeMenu);
        window.addEventListener("scroll", closeMenu, true); // Close on scroll
        return () => {
            window.removeEventListener("click", closeMenu);
            window.removeEventListener("scroll", closeMenu, true);
        };
    }, []);

    /* ---------------- auto expand active chapter ---------------- */

    useEffect(() => {
        if (activeChapterId) {
            setExpanded((prev) => ({ ...prev, [activeChapterId]: true }));
        }
    }, [activeChapterId]);

    /* ---------------- helpers ---------------- */

    const toggleExpand = (id) =>
        setExpanded((prev) => ({ ...prev, [id]: !prev[id] }));

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
        if (window.confirm("Delete this chapter and all its contents?")) {
            onDelete(id);
        }
        setMenuOpenId(null);
    };

    const getItemIcon = (type) => {
        switch (type) {
            case "video":
                return <FiVideo size={14} />;
            case "text":
                return <FiType size={14} />;
            case "heading":
                return <FiLayout size={14} />;
            case "pdf":
            default:
                return <FiFileText size={14} />;
        }
    };

    const handleMenuOpen = (e, id) => {
        e.stopPropagation();
        e.nativeEvent.stopImmediatePropagation(); // Prevent window click from closing immediately
        if (menuOpenId === id) {
            setMenuOpenId(null);
            return;
        }

        const rect = e.currentTarget.getBoundingClientRect();
        const screenWidth = window.innerWidth;
        const menuWidth = 200;

        // Calculate position: align right of menu with right of button, but keep on screen
        let left = rect.right - menuWidth + 10; // 10px buffer
        if (left < 10) left = 10;

        // If it goes off screen right?
        if (left + menuWidth > screenWidth) left = screenWidth - menuWidth - 20;

        setMenuPosition({
            top: rect.bottom + 5,
            left: left
        });
        setMenuOpenId(id);
    };

    /* ---------------- render ---------------- */

    return (
        <div className="chapter-list-sidebar">
            <div className="cl-header">
                <h3>Course Content</h3>
                {!isFreeMode && (
                    <button className="btn-icon-small" onClick={onAddChapter}>
                        <FiPlus />
                    </button>
                )}
            </div>

            {chapters.length === 0 && (
                <div className="empty-chapters text-center py-5">
                    <div className="text-muted mb-2 opacity-50"><FiLayout size={40} /></div>
                    <p className="text-muted mb-3 small">No chapters content yet.</p>
                    {!isFreeMode && (
                        <button className="btn btn-sm btn-outline-primary" onClick={onAddChapter}>
                            <FiPlus className="me-1" /> Add First Chapter
                        </button>
                    )}
                </div>
            )}

            {chapters.map((chapter) => {
                const isExpanded = expanded[chapter.id];
                const isActive = activeChapterId === chapter.id;

                return (
                    <React.Fragment key={chapter.id}>
                        <div className={`chapter-block ${isActive ? "active-block" : ""}`}>
                            {/* ---------- chapter header ---------- */}
                            <div
                                className={`chapter-item ${isActive ? "active" : ""}`}
                                onClick={() => onSelect(chapter.id)}
                            >
                                <button
                                    className="btn-expand-icon"
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        toggleExpand(chapter.id);
                                    }}
                                >
                                    <FiChevronRight className={`chevron-icon ${isExpanded ? 'rotate-90' : ''}`} />
                                </button>

                                <div className="ci-content">
                                    {editingId === chapter.id ? (
                                        <input
                                            autoFocus
                                            value={editValue}
                                            onChange={(e) => setEditValue(e.target.value)}
                                            onBlur={() => saveEdit(chapter.id)}
                                            onKeyDown={(e) =>
                                                e.key === "Enter" && saveEdit(chapter.id)
                                            }
                                        />
                                    ) : (
                                        <span className="ci-text">{chapter.title}</span>
                                    )}
                                </div>

                                {!isFreeMode && (
                                    <button
                                        className="btn-icon-menu"
                                        onClick={(e) => handleMenuOpen(e, chapter.id)}
                                    >
                                        <FiMoreVertical />
                                    </button>
                                )}
                            </div>

                            {/* ---------- nested items ---------- */}
                            {isExpanded && (
                                <div className="chapter-nested-items">
                                    {(chapter.contents || []).map((item) => {
                                        const isLocked = isFreeMode && !item.data?.isPreview;

                                        return (
                                            <div
                                                key={item.id}
                                                className={`tree-item ${activeContentId === item.id ? "active" : ""} ${isLocked ? "locked-item" : ""}`}
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    if (isLocked) return;
                                                    onSelectContent?.(chapter.id, item);
                                                }}
                                            >
                                                <div className="d-flex align-items-center flex-grow-1 overflow-hidden">
                                                    <span className="tree-icon">
                                                        {isLocked ? <FiLock size={12} /> : getItemIcon(item.type)}
                                                    </span>
                                                    <span className="tree-text text-truncate">
                                                        {item.title}
                                                        {item.data?.isPreview && (
                                                            <span className="preview-tag">Preview</span>
                                                        )}
                                                    </span>
                                                </div>

                                                {!isFreeMode && !isLocked && (
                                                    <button
                                                        className="btn-icon-subtle small hidden-until-hover"
                                                        onClick={(e) => handleMenuOpen(e, item.id)}
                                                    >
                                                        <FiMoreVertical size={12} />
                                                    </button>
                                                )}
                                            </div>
                                        );
                                    })}

                                    {!isFreeMode && (
                                        <button
                                            className="btn-tree-add"
                                            onClick={() => onAddItem(chapter.id)}
                                        >
                                            <FiPlus size={12} /> Add chapter item
                                        </button>
                                    )}
                                </div>
                            )}
                        </div>
                    </React.Fragment>
                );
            })}

            {!isFreeMode && (
                <div className="cl-footer">
                    <button className="btn-add-chapter-full" onClick={onAddChapter}>
                        <FiPlus /> Add New Chapter
                    </button>
                </div>
            )}

            {/* ---------------- DRAW PORTAL MENU ---------------- */}
            {menuOpenId && createPortal(
                <div
                    className="chapter-menu-dropdown"
                    style={{
                        position: 'fixed',
                        top: menuPosition.top,
                        left: menuPosition.left,
                        right: 'auto',
                        width: '200px', // Enforce width
                    }}
                    onClick={(e) => e.stopPropagation()}
                >
                    {/* Check if open ID is a chapter or item */}
                    {chapters.find(c => c.id === menuOpenId) ? (
                        /* CHAPTER MENU ITEMS */
                        <>
                            <button className="cmd-item" onClick={() => { onAddItem(menuOpenId); setMenuOpenId(null); }}>
                                <FiPlusCircle size={15} /> <span>Add chapter item</span>
                            </button>
                            <button className="cmd-item" onClick={() => {
                                const ch = chapters.find(c => c.id === menuOpenId);
                                if (ch) startEdit(ch);
                            }}>
                                <FiEdit2 size={15} /> <span>rename</span>
                            </button>
                            <button className="cmd-item" onClick={() => { onMoveChapter?.(menuOpenId, 'up'); setMenuOpenId(null); }}>
                                <FiArrowUp size={15} /> <span>Move up</span>
                            </button>
                            <button className="cmd-item" onClick={() => { onMoveChapter?.(menuOpenId, 'down'); setMenuOpenId(null); }}>
                                <FiArrowDown size={15} /> <span>Move down</span>
                            </button>
                            <button className="cmd-item danger" onClick={() => confirmDelete(menuOpenId)}>
                                <FiTrash2 size={15} /> <span>Remove</span>
                            </button>
                        </>
                    ) : (
                        /* CONTENT ITEM MENU ITEMS (Find the item) */
                        (() => {
                            // Helper to find the chapter and item from ID
                            let foundChapter = null;
                            let foundItem = null;
                            for (const c of chapters) {
                                const it = c.contents?.find(i => i.id === menuOpenId);
                                if (it) {
                                    foundChapter = c;
                                    foundItem = it;
                                    break;
                                }
                            }

                            if (!foundItem) return null;

                            return (
                                <>
                                    <button className="cmd-item" onClick={() => { onAddItem(foundChapter.id, foundItem.id); setMenuOpenId(null); }}>
                                        <FiPlusCircle size={15} /> <span>Add chapter item</span>
                                    </button>
                                    <button className="cmd-item" onClick={() => { onEditContent?.(foundChapter.id, foundItem); setMenuOpenId(null); }}>
                                        <FiEdit2 size={14} /> <span>Edit</span>
                                    </button>
                                    <button className="cmd-item" onClick={() => { onMoveContent?.(foundChapter.id, foundItem.id, 'up'); setMenuOpenId(null); }}>
                                        <FiArrowUp size={15} /> <span>Move up</span>
                                    </button>
                                    <button className="cmd-item" onClick={() => { onMoveContent?.(foundChapter.id, foundItem.id, 'down'); setMenuOpenId(null); }}>
                                        <FiArrowDown size={15} /> <span>Move down</span>
                                    </button>
                                    <div className="divider-h" />
                                    <button className="cmd-item danger" onClick={() => { onDeleteContent?.(foundChapter.id, foundItem.id); setMenuOpenId(null); }}>
                                        <FiTrash2 size={14} /> <span>Remove</span>
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
