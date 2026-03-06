import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useCourseBuilder } from './hooks/useCourseBuilder';
import ChapterList from './builder/ChapterList';
import UnifiedContentForm from './builder/content/UnifiedContentForm';

const CourseBuilder = () => {
    const { id } = useParams();
    const navigate = useNavigate();

    const {
        courseData,
        activeChapterId,
        addChapter,
        updateChapterTitle,
        deleteChapter,
        selectChapter,
        addContent,
        deleteContent,
        updateContent
    } = useCourseBuilder(id);

    const [activeForm, setActiveForm] = useState(null);
    const [editingItem, setEditingItem] = useState(null);
    const [selectedContentId, setSelectedContentId] = useState(null);
    const [isUploading, setIsUploading] = useState(false);

    const activeChapter = courseData.chapters.find(c => c.id === activeChapterId);

    const getItemIconClass = (type) => {
        switch (type) {
            case "video": return "bi-camera-video";
            case "pdf": return "bi-file-earmark-pdf";
            case "quiz": return "bi-question-circle";
            case "assignment": return "bi-pencil-square";
            default: return "bi-file-earmark-text";
        }
    };

    const handleSave = async (data) => {
        setIsUploading(true);
        try {
            if (editingItem) {
                await updateContent(activeChapterId, editingItem.id, data);
                setEditingItem(null);
            } else {
                await addContent(activeChapterId, data.type || 'video', data);
            }
            setActiveForm(null);
            setSelectedContentId(null);
        } catch (error) {
            console.error("Save failed:", error);
            alert("Failed to save content. Please try again.");
        } finally {
            setIsUploading(false);
        }
    };

    return (
        <div className="container-fluid bg-light min-vh-100 p-0 overflow-hidden d-flex flex-column">
            {/* Header / Navbar */}
            <nav className="navbar navbar-dark bg-dark px-3 py-2 shadow-sm flex-shrink-0" style={{ height: '60px' }}>
                <div className="container-fluid">
                    <div className="d-flex align-items-center">
                        <button className="btn btn-link link-light p-0 me-3" onClick={() => navigate(-1)}>
                            <i className="bi bi-arrow-left fs-5"></i>
                        </button>
                        <span className="navbar-brand mb-0 h1 fs-5 fw-bold text-truncate" style={{ maxWidth: '400px' }}>
                            {courseData.title}
                        </span>
                    </div>
                    <div className="ms-auto d-flex gap-2">
                        <button className="btn btn-outline-light btn-sm px-3 rounded-pill fw-medium">Preview</button>
                        <button className="btn btn-primary btn-sm px-4 rounded-pill fw-bold shadow-sm">Publish</button>
                    </div>
                </div>
            </nav>

            <div className="row g-0 flex-grow-1 overflow-hidden">
                {/* SIDEBAR (Course Content) - 3 Columns Desktop */}
                <aside className="col-12 col-md-4 col-lg-3 border-end bg-white d-flex flex-column h-100 shadow-sm" style={{ zIndex: 10 }}>
                    <ChapterList
                        chapters={courseData.chapters}
                        activeChapterId={activeChapterId}
                        activeContentId={selectedContentId}
                        onSelect={selectChapter}
                        onSelectContent={(chId, item) => setSelectedContentId(item.id)}
                        onAddChapter={addChapter}
                        onUpdateTitle={updateChapterTitle}
                        onDelete={deleteChapter}
                        onAddItem={() => { setEditingItem(null); setActiveForm('content'); }}
                        onEditContent={(chId, item) => { setEditingItem(item); setActiveForm('content'); }}
                        onDeleteContent={(chId, itemId) => { if (window.confirm("Are you sure?")) deleteContent(chId, itemId); }}
                    />
                </aside>

                {/* MAIN CONTENT AREA - 9 Columns Desktop */}
                <main className="col-12 col-md-8 col-lg-9 bg-light overflow-auto p-3 p-md-4">
                    {!activeChapter ? (
                        <div className="h-100 d-flex align-items-center justify-content-center">
                            <div className="text-center p-5 bg-white rounded-4 shadow-sm border" style={{ maxWidth: '450px' }}>
                                <i className="bi bi-folder2-open display-1 text-primary opacity-25 mb-4"></i>
                                <h3 className="fw-bold">Course Builder</h3>
                                <p className="text-muted mb-4 small">Select or create a chapter from the sidebar to start organized your curriculum materials.</p>
                                <button className="btn btn-primary px-4 py-2 rounded-pill fw-bold shadow-sm" onClick={addChapter}>
                                    <i className="bi bi-plus-lg me-2"></i> Add Chapter
                                </button>
                            </div>
                        </div>
                    ) : (
                        <div className="container-fluid p-0">
                            {/* Chapter Info Header */}
                            <div className="card shadow-sm border-0 rounded-3 mb-4 bg-white overflow-hidden">
                                <div className="card-body p-4 d-flex justify-content-between align-items-center">
                                    <div>
                                        <h4 className="fw-bold mb-1 d-flex align-items-center gap-2">
                                            <i className="bi bi-folder-fill text-primary"></i>
                                            {activeChapter.title}
                                        </h4>
                                        <div className="d-flex align-items-center gap-2">
                                            <span className="badge bg-light text-dark border px-2 py-1">{activeChapter.contents.length} Items</span>
                                            <small className="text-muted">| Curriculum Management</small>
                                        </div>
                                    </div>
                                    <button
                                        className="btn btn-primary rounded-pill px-4 shadow-sm fw-bold d-flex align-items-center gap-2"
                                        onClick={() => { setEditingItem(null); setActiveForm('content'); }}
                                    >
                                        <i className="bi bi-plus-lg fs-6"></i> Add Item
                                    </button>
                                </div>
                            </div>

                            {/* Curriculum Items */}
                            <div className="d-flex flex-column gap-3 mb-5">
                                {activeChapter.contents.length === 0 ? (
                                    <div className="text-center py-5 bg-white rounded-4 border border-dashed text-muted shadow-sm">
                                        <i className="bi bi-card-list display-4 opacity-25 mb-3 d-block"></i>
                                        <p className="mb-0 fw-medium">No items in this chapter yet.</p>
                                        <p className="small mb-0 opacity-75">Click 'Add Item' to insert videos, PDFs or documents.</p>
                                    </div>
                                ) : (
                                    activeChapter.contents.map((item) => (
                                        <div key={item.id} className="card border-0 shadow-sm rounded-3 transition-all hover-bg-light border-start border-4"
                                            style={{ borderLeftColor: item.type === 'video' ? '#0d6efd' : '#6c757d' }}>
                                            <div className="card-body p-3">
                                                <div className="d-flex align-items-center gap-3">
                                                    <div className={`rounded-3 p-3 bg-opacity-10 d-flex align-items-center justify-content-center ${item.type === 'video' ? 'bg-primary text-primary' : 'bg-secondary text-secondary'}`} style={{ width: '52px', height: '52px' }}>
                                                        <i className={`bi ${getItemIconClass(item.type)} fs-4`}></i>
                                                    </div>
                                                    <div className="flex-grow-1 overflow-hidden">
                                                        <div className="d-flex align-items-center gap-2 mb-1">
                                                            <h6 className="mb-0 fw-bold text-truncate">{item.title}</h6>
                                                            {item.data?.isPreview && <span className="badge bg-success small py-0 px-2" style={{ fontSize: '9px' }}>FREE</span>}
                                                        </div>
                                                        <p className="text-muted small mb-0 text-truncate opacity-75">{item.data?.description || 'Learn and grow with this lesson material.'}</p>
                                                    </div>
                                                    <div className="dropdown">
                                                        <button className="btn btn-light btn-sm border-0 rounded-circle shadow-none" data-bs-toggle="dropdown">
                                                            <i className="bi bi-three-dots"></i>
                                                        </button>
                                                        <ul className="dropdown-menu dropdown-menu-end shadow border-0 p-2">
                                                            <li>
                                                                <button className="dropdown-item rounded d-flex align-items-center gap-2 py-2" onClick={() => { setEditingItem(item); setActiveForm('content'); }}>
                                                                    <i className="bi bi-pencil small text-muted"></i> Edit Item
                                                                </button>
                                                            </li>
                                                            <li><hr className="dropdown-divider mx-2" /></li>
                                                            <li>
                                                                <button className="dropdown-item rounded d-flex align-items-center gap-2 py-2 text-danger" onClick={() => { if (window.confirm("Delete item?")) deleteContent(activeChapterId, item.id); }}>
                                                                    <i className="bi bi-trash small"></i> Remove
                                                                </button>
                                                            </li>
                                                        </ul>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>
                        </div>
                    )}
                </main>
            </div>

            {/* Content Form Modal Overlay */}
            {(activeForm === 'content' || editingItem) && (
                <div className="position-fixed top-0 start-0 w-100 h-100 bg-dark bg-opacity-75 d-flex align-items-center justify-content-center px-3" style={{ zIndex: 1070 }}>
                    <div className="bg-white rounded-4 shadow-lg p-0 border overflow-hidden w-100 zoom-in" style={{ maxWidth: '600px', transform: 'scale(1)' }}>
                        <div className="px-4 py-3 bg-light border-bottom d-flex justify-content-between align-items-center">
                            <h5 className="mb-0 fw-bold">{editingItem ? 'Edit Content' : 'Add New Content'}</h5>
                            <button className="btn-close shadow-none" onClick={() => { setActiveForm(null); setEditingItem(null); }}></button>
                        </div>
                        <div className="p-4 overflow-auto" style={{ maxHeight: '80vh' }}>
                            {isUploading ? (
                                <div className="text-center py-5">
                                    <div className="spinner-border text-primary" role="status"></div>
                                    <p className="mt-3 text-muted fw-bold">Processing content...</p>
                                </div>
                            ) : (
                                <UnifiedContentForm
                                    key={editingItem ? editingItem.id : 'new'}
                                    onSave={handleSave}
                                    onCancel={() => { setActiveForm(null); setEditingItem(null); }}
                                    initialData={editingItem ? {
                                        ...editingItem.data,
                                        title: editingItem.title,
                                        type: editingItem.type
                                    } : null}
                                />
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default CourseBuilder;
