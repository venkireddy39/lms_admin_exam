import React, { useState, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useCourseBuilder } from './hooks/useCourseBuilder';

import {
    FiArrowLeft,
    FiSave,
    FiEye,
    FiPlusCircle,
    FiTrash2,
    FiMoreVertical,
    FiEdit2,
    FiVideo,
    FiFileText,
    FiLayout
} from 'react-icons/fi';

import ChapterList from './builder/ChapterList';
import ContentTypeSelector from './builder/content/ContentTypeSelector';
import VideoForm from './builder/content/video/VideoForm';
import PdfForm from './builder/content/pdf/PdfForm';
import HeadingForm from './builder/content/heading/HeadingForm';

import './styles/CourseBuilder.css';

const ALLOWED_TYPES = ['video', 'pdf', 'heading'];

const CourseBuilder = () => {
    const { id } = useParams();
    const navigate = useNavigate();

    const {
        courseData,
        activeChapterId,
        isSelectorOpen,
        setIsSelectorOpen,
        addChapter,
        updateChapterTitle,
        deleteChapter,
        selectChapter,
        addContent,
        deleteContent,
        updateContent
    } = useCourseBuilder(id);

    const [activeForm, setActiveForm] = useState(null);
    const [expandedItemId, setExpandedItemId] = useState(null);
    const [contentMenuOpenId, setContentMenuOpenId] = useState(null);
    const [editingItem, setEditingItem] = useState(null);
    const [selectedContentId, setSelectedContentId] = useState(null);
    const [insertionPoint, setInsertionPoint] = useState(null); // { chapterId, afterId }

    const activeChapter = courseData.chapters.find(c => c.id === activeChapterId);

    const groupedContents = useMemo(() => {
        if (!activeChapter) return [];

        // Always show all content, don't filter by selectedContentId
        const contentsToProcess = activeChapter.contents;

        const groups = [];
        let current = { heading: null, items: [] };

        contentsToProcess.forEach(item => {
            if (item.type === 'heading') {
                if (current.heading || current.items.length) groups.push(current);
                current = { heading: item, items: [] };
            } else {
                current.items.push(item);
            }
        });

        groups.push(current);
        return groups;
    }, [activeChapter, selectedContentId]);

    const handleContentSelect = (type) => {
        if (!ALLOWED_TYPES.includes(type)) return;
        setActiveForm(type);
        setIsSelectorOpen(false);
        setEditingItem(null);
        setSelectedContentId(null);
    };

    const handleSave = (data) => {
        if (editingItem) {
            updateContent(activeChapterId, editingItem.id, data);
            setEditingItem(null);
        } else {
            // Check if we have a specific insertion point
            const targetChapterId = insertionPoint?.chapterId || activeChapterId;
            const insertAfterId = insertionPoint?.afterId || null;

            addContent(targetChapterId, activeForm, data, insertAfterId);
        }
        setActiveForm(null);
        setSelectedContentId(null);
        setInsertionPoint(null); // Reset
    };

    const handleContentClick = (chapterId, item) => {
        if (activeChapterId !== chapterId) {
            selectChapter(chapterId);
        }
        setSelectedContentId(item.id);
        setEditingItem(null);
        setActiveForm(null);
    };

    const handleContentEdit = (chapterId, item) => {
        if (activeChapterId !== chapterId) {
            selectChapter(chapterId);
        }
        setEditingItem(item);
        setActiveForm(item.type);
        setSelectedContentId(null);
    };

    const handleContentDelete = (chapterId, itemId) => {
        if (window.confirm("Are you sure you want to delete this item?")) {
            deleteContent(chapterId, itemId);
            if (selectedContentId === itemId) setSelectedContentId(null);
            if (editingItem?.id === itemId) setEditingItem(null);
        }
    };

    const handleQuickAdd = (chapterId, type) => {
        if (activeChapterId !== chapterId) {
            selectChapter(chapterId);
        }
        setActiveForm(type);
        setEditingItem(null);
        setSelectedContentId(null);
    };

    const moveChapter = (chapterId, direction) => {
        setCourseData(prev => {
            const index = prev.chapters.findIndex(c => c.id === chapterId);
            if (index === -1) return prev;

            const newChapters = [...prev.chapters];
            if (direction === 'up' && index > 0) {
                [newChapters[index], newChapters[index - 1]] = [newChapters[index - 1], newChapters[index]];
            } else if (direction === 'down' && index < newChapters.length - 1) {
                [newChapters[index], newChapters[index + 1]] = [newChapters[index + 1], newChapters[index]];
            }

            return { ...prev, chapters: newChapters };
        });
    };

    const moveContent = (chapterId, itemId, direction) => {
        setCourseData(prev => {
            const chapterIndex = prev.chapters.findIndex(c => c.id === chapterId);
            if (chapterIndex === -1) return prev;

            const chapter = prev.chapters[chapterIndex];
            const itemIndex = chapter.contents.findIndex(i => i.id === itemId);
            if (itemIndex === -1) return prev;

            const newContents = [...chapter.contents];
            if (direction === 'up' && itemIndex > 0) {
                [newContents[itemIndex], newContents[itemIndex - 1]] = [newContents[itemIndex - 1], newContents[itemIndex]];
            } else if (direction === 'down' && itemIndex < newContents.length - 1) {
                [newContents[itemIndex], newContents[itemIndex + 1]] = [newContents[itemIndex + 1], newContents[itemIndex]];
            }

            const newChapters = [...prev.chapters];
            newChapters[chapterIndex] = { ...chapter, contents: newContents };
            return { ...prev, chapters: newChapters };
        });
    };

    const handleSidebarAddItem = (chapterId, afterId = null) => {
        if (activeChapterId !== chapterId) {
            selectChapter(chapterId);
        }
        setInsertionPoint({ chapterId, afterId });
        setIsSelectorOpen(true);
    };

    const handleChapterMainSelect = (chapterId) => {
        selectChapter(chapterId);
        setSelectedContentId(null);
    };

    const displayedContents = useMemo(() => {
        if (!selectedContentId) return groupedContents;

        const result = [];
        for (const group of groupedContents) {
            // Check if heading matches
            if (group.heading?.id === selectedContentId) {
                result.push({ heading: group.heading, items: [] });
            }
            // Check items
            const itemMatch = group.items.find(i => i.id === selectedContentId);
            if (itemMatch) {
                result.push({ heading: null, items: [itemMatch] });
            }
        }
        return result;
    }, [groupedContents, selectedContentId]);

    return (
        <div className="course-builder-layout">
            {/* HEADER */}
            <header className="cb-header">
                <div className="cb-header-left">
                    <button className="btn-icon" onClick={() => navigate('/courses')}>
                        <FiArrowLeft />
                    </button>
                    <h2>{courseData.title}</h2>
                </div>
                <div className="cb-header-actions">
                    <button className="btn-secondary"><FiEye /> Preview</button>
                    <button className="btn-primary"><FiSave /> Save</button>
                </div>
            </header>

            <div className="cb-workspace">
                {/* SIDEBAR */}
                <aside className="cb-sidebar">
                    <ChapterList
                        chapters={courseData.chapters}
                        activeChapterId={activeChapterId}
                        activeContentId={editingItem?.id || selectedContentId}
                        onSelect={handleChapterMainSelect}
                        onSelectContent={handleContentClick}
                        onEditContent={handleContentEdit}
                        onDeleteContent={handleContentDelete}
                        onAddItem={handleSidebarAddItem}
                        onQuickAdd={handleQuickAdd}
                        onAddChapter={addChapter}
                        onUpdateTitle={updateChapterTitle}
                        onDelete={deleteChapter}
                        onMoveChapter={moveChapter}
                        onMoveContent={moveContent}
                    />
                </aside>

                {/* MAIN */}
                <main className="cb-main">
                    {!activeChapter ? (
                        <div className="no-chapter-selected">
                            <h3>No chapter selected</h3>
                            <button className="btn-primary" onClick={addChapter}>
                                Create Chapter
                            </button>
                        </div>
                    ) : (
                        <>
                            <div className="chapter-header">
                                <h1>{activeChapter.title}</h1>
                                <button
                                    className="btn-primary"
                                    onClick={() => setIsSelectorOpen(true)}
                                >
                                    <FiPlusCircle /> Add Item
                                </button>
                            </div>

                            {/* CONTENT LIST */}
                            {displayedContents.map((group, i) => (
                                <div key={i} className="section-block">
                                    {group.heading && (
                                        <div className="content-item-card heading-card">
                                            <div className="d-flex justify-content-between align-items-start">
                                                <div>
                                                    <h4 className="mb-1 fw-bold">{group.heading.title}</h4>
                                                    {group.heading.data?.subtext && (
                                                        <p className="text-muted small mb-0">{group.heading.data.subtext}</p>
                                                    )}
                                                </div>

                                                <div style={{ position: 'relative' }}>
                                                    <button
                                                        className="btn-icon-subtle"
                                                        onClick={() =>
                                                            setContentMenuOpenId(
                                                                contentMenuOpenId === group.heading.id ? null : group.heading.id
                                                            )
                                                        }
                                                    >
                                                        <FiMoreVertical />
                                                    </button>

                                                    {contentMenuOpenId === group.heading.id && (
                                                        <div className="chapter-menu-dropdown">
                                                            <button
                                                                onClick={() => {
                                                                    setEditingItem(group.heading);
                                                                    setActiveForm('heading');
                                                                    setContentMenuOpenId(null);
                                                                }}
                                                            >
                                                                <FiEdit2 /> Edit
                                                            </button>
                                                            <button
                                                                className="danger"
                                                                onClick={() => deleteContent(activeChapterId, group.heading.id)}
                                                            >
                                                                <FiTrash2 /> Remove
                                                            </button>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    )}

                                    {group.items.map(item => (
                                        <div key={item.id} className="content-item-card">
                                            <div className="cic-header">
                                                <span>{item.type}</span>
                                                <h4>
                                                    {item.title}
                                                    {item.data?.isPreview && (
                                                        <span style={{
                                                            fontSize: '11px',
                                                            marginLeft: '8px',
                                                            color: '#10b981',
                                                            background: '#ecfdf5',
                                                            padding: '2px 6px',
                                                            borderRadius: '4px',
                                                            border: '1px solid #a7f3d0'
                                                        }}>
                                                            Preview Enabled
                                                        </span>
                                                    )}
                                                </h4>

                                                <button
                                                    className="btn-icon-subtle"
                                                    onClick={() =>
                                                        setContentMenuOpenId(
                                                            contentMenuOpenId === item.id ? null : item.id
                                                        )
                                                    }
                                                >
                                                    <FiMoreVertical />
                                                </button>

                                                {contentMenuOpenId === item.id && (
                                                    <div className="chapter-menu-dropdown">
                                                        <button
                                                            onClick={() => {
                                                                // Toggle Preview
                                                                updateContent(activeChapterId, item.id, { isPreview: !item.data?.isPreview });
                                                                setContentMenuOpenId(null);
                                                            }}
                                                        >
                                                            {item.data?.isPreview ? 'Disable Preview' : 'Enable Preview'}
                                                        </button>
                                                        <button
                                                            onClick={() => {
                                                                setEditingItem(item);
                                                                setActiveForm(item.type);
                                                                setContentMenuOpenId(null);
                                                            }}
                                                        >
                                                            <FiEdit2 /> Edit
                                                        </button>
                                                        <button
                                                            className="danger"
                                                            onClick={() => deleteContent(activeChapterId, item.id)}
                                                        >
                                                            <FiTrash2 /> Remove
                                                        </button>
                                                    </div>
                                                )}
                                            </div>

                                            {/* PREVIEW */}
                                            {/* PREVIEW */}
                                            {item.type === 'video' && item.data.file && (
                                                selectedContentId === item.id ? (
                                                    <video
                                                        controls
                                                        width="100%"
                                                        src={URL.createObjectURL(item.data.file)}
                                                        className="rounded"
                                                    />
                                                ) : (
                                                    <div className="p-4 text-center bg-light rounded cursor-pointer" onClick={() => handleContentClick(activeChapterId, item)}>
                                                        <div className="text-muted"><FiVideo size={24} className="mb-2" /></div>
                                                        <button className="btn btn-sm btn-outline-primary">View Video</button>
                                                    </div>
                                                )
                                            )}

                                            {item.type === 'pdf' && item.data.file && (
                                                selectedContentId === item.id ? (
                                                    <iframe
                                                        src={URL.createObjectURL(item.data.file)}
                                                        width="100%"
                                                        height="500px"
                                                        title={item.title}
                                                        className="rounded border"
                                                    />
                                                ) : (
                                                    <div className="p-4 text-center bg-light rounded cursor-pointer" onClick={() => handleContentClick(activeChapterId, item)}>
                                                        <div className="text-muted"><FiFileText size={24} className="mb-2" /></div>
                                                        <button className="btn btn-sm btn-outline-primary">Click to View PDF</button>
                                                    </div>
                                                )
                                            )}
                                        </div>
                                    ))}
                                </div>
                            ))}

                            {/* FORMS */}
                            {/* FORMS - Render in Modal */}
                            {activeForm && (
                                <div className="cts-overlay">
                                    <div className="builder-form-container" style={{ width: '100%', maxWidth: '600px', margin: 0 }}>
                                        {activeForm === 'video' && (
                                            <VideoForm
                                                onSave={handleSave}
                                                onCancel={() => setActiveForm(null)}
                                                initialData={editingItem?.data}
                                            />
                                        )}

                                        {activeForm === 'pdf' && (
                                            <PdfForm
                                                onSave={handleSave}
                                                onCancel={() => setActiveForm(null)}
                                                initialData={editingItem?.data}
                                            />
                                        )}

                                        {activeForm === 'heading' && (
                                            <HeadingForm
                                                onSave={handleSave}
                                                onCancel={() => setActiveForm(null)}
                                                initialData={editingItem?.data}
                                            />
                                        )}
                                    </div>
                                </div>
                            )}

                            {isSelectorOpen && (
                                <ContentTypeSelector
                                    onSelect={handleContentSelect}
                                    onClose={() => setIsSelectorOpen(false)}
                                />
                            )}
                        </>
                    )}
                </main>
            </div>
        </div>
    );
};

export default CourseBuilder;
