import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Upload } from 'lucide-react';
import { BookService } from '../../services/api';
import { useToast } from '../../context/ToastContext';
import { useAuth } from '../../context/AuthContext';

// Child Components
import ResourceTabs from './components/ResourceTabs';
import ResourceFilters from './components/ResourceFilters';
import ResourceTable from './components/ResourceTable';
import AddEditResourceModal from './components/AddEditResourceModal';
import ImportResourcesModal from './components/ImportResourcesModal';
import DeleteConfirmModal from './components/DeleteConfirmModal';

import './BookList.css';

const BookList = () => {
    const toast = useToast();
    const navigate = useNavigate();
    const { hasPermission } = useAuth();
    const canManage = hasPermission('MANAGE_BOOKS');

    /* ===================== STATE ===================== */

    const [resources, setResources] = useState([]);
    const [loading, setLoading] = useState(true);
    const [viewMode, setViewMode] = useState('PHYSICAL');

    const [searchTerm, setSearchTerm] = useState('');
    const [filterCategory, setFilterCategory] = useState('ALL');

    const [selectedResource, setSelectedResource] = useState(null);
    const [showImportModal, setShowImportModal] = useState(false);
    const [deleteTargetId, setDeleteTargetId] = useState(null);

    /* ===================== LOAD ===================== */

    useEffect(() => {
        loadResources();
    }, []);

    const loadResources = async () => {
        setLoading(true);
        try {
            const data = await BookService.getAllResources();
            setResources(data);
        } catch (err) {
            console.error(err);
            toast.error('Failed to load resources');
        } finally {
            setLoading(false);
        }
    };

    /* ===================== ACTIONS ===================== */

    const handleAddClick = () => {
        setSelectedResource({
            type: viewMode,
            category: 'Software Engineering'
        });
    };

    const handleEditClick = (resource) => {
        if (!canManage) return;
        setSelectedResource({ ...resource });
    };

    const handleDeleteClick = (resource) => {
        if (!canManage) return;
        setDeleteTargetId(resource.id);
    };

    const handleIssueBook = (resource) => {
        navigate('/library/issues/new', {
            state: { preSelectedBook: resource }
        });
    };

    const handleConfirmDelete = async () => {
        try {
            await BookService.deleteResource(deleteTargetId);
            setResources(prev => prev.filter(r => r.id !== deleteTargetId));
            toast.success('Resource deleted');
        } catch (err) {
            console.error(err);
            toast.error('Delete failed');
        } finally {
            setDeleteTargetId(null);
        }
    };

    /* ===================== SAVE ===================== */

    const handleSaveResource = async (resourceData) => {
        try {
            // UI NEVER sends copies or barcodes for new creation logic (handled by backend)
            // For updates, we just send standard metadata
            const { copies, barcode, ...payload } = resourceData;

            if (payload.id) {
                /* ---------- UPDATE BOOK METADATA ---------- */
                const updated = await BookService.updateResource(payload.id, payload);

                setResources(prev =>
                    prev.map(r =>
                        r.id === updated.id
                            ? { ...r, ...updated } // preserve copies from backend if not returned
                            : r
                    )
                );

                toast.success('Resource updated');
            } else {
                /* ---------- CREATE BOOK ---------- */
                const created = await BookService.createResource({
                    ...payload,
                    type: payload.type || viewMode
                });

                setResources(prev => [...prev, created]);
                toast.success('Resource created');
            }

            setSelectedResource(null);
        } catch (err) {
            console.error(err);
            toast.error('Save failed');
        }
    };

    /* ===================== IMPORT ===================== */

    const handleImport = (file) => {
        toast.info(`Importing ${file.name}...`);
        setTimeout(() => {
            toast.success('Import completed');
            setShowImportModal(false);
            loadResources();
        }, 1000);
    };

    /* ===================== FILTERING ===================== */

    const filteredResources = resources.filter(res => {
        if (res.type !== viewMode) return false;

        const term = searchTerm.toLowerCase();

        const matchesSearch =
            (res.title || '').toLowerCase().includes(term) ||
            (res.author || '').toLowerCase().includes(term) ||
            (res.category?.categoryName || '').toLowerCase().includes(term) ||
            (res.isbn || '').includes(term) ||
            (res.copies || []).some(c => (c.barcode || '').toLowerCase().includes(term));

        const matchesCategory =
            filterCategory === 'ALL' || res.category?.categoryName === filterCategory;

        return matchesSearch && matchesCategory;
    });

    const uniqueCategories = [
        ...new Set(resources.map(r => r.category?.categoryName).filter(Boolean))
    ];

    /* ===================== RENDER ===================== */

    return (
        <div className="container-fluid p-4">

            {/* Header */}
            <div className="d-flex justify-content-between align-items-center mb-4">
                <div>
                    <h2 className="h3 mb-1">Resource Management</h2>
                    <p className="text-muted">Manage physical books and digital assets</p>
                </div>

                {canManage && (
                    <div className="d-flex gap-2">
                        <button
                            className="btn btn-outline-secondary"
                            onClick={() => setShowImportModal(true)}
                        >
                            <Upload size={18} className="me-2" />
                            Import CSV
                        </button>

                        <button
                            className="btn btn-primary"
                            onClick={handleAddClick}
                        >
                            <Plus size={18} className="me-2" />
                            Add {viewMode === 'PHYSICAL' ? 'Book' : 'Resource'}
                        </button>
                    </div>
                )}
            </div>

            {/* Main Card */}
            <div className="card shadow-sm border-0">
                <ResourceTabs
                    viewMode={viewMode}
                    setViewMode={setViewMode}
                />

                <div className="card-body">
                    <ResourceFilters
                        searchTerm={searchTerm}
                        setSearchTerm={setSearchTerm}
                        filterCategory={filterCategory}
                        setFilterCategory={setFilterCategory}
                        categories={uniqueCategories}
                    />

                    <ResourceTable
                        resources={filteredResources}
                        loading={loading}
                        viewMode={viewMode}
                        onEdit={handleEditClick}
                        onDelete={handleDeleteClick}
                        onIssue={handleIssueBook}
                        canManage={canManage}
                    />
                </div>
            </div>

            {/* Modals */}
            {showImportModal && (
                <ImportResourcesModal
                    show={showImportModal}
                    onClose={() => setShowImportModal(false)}
                    onImport={handleImport}
                />
            )}

            {selectedResource && (
                <AddEditResourceModal
                    resource={selectedResource}
                    viewMode={viewMode}
                    existingResources={resources}
                    onClose={() => setSelectedResource(null)}
                    onSave={handleSaveResource}
                />
            )}

            {deleteTargetId && (
                <DeleteConfirmModal
                    show={!!deleteTargetId}
                    resourceType={selectedResource?.type}
                    hasCopies={selectedResource?.copies?.length > 0}
                    onCancel={() => setDeleteTargetId(null)}
                    onConfirm={handleConfirmDelete}
                />

            )}
        </div>
    );
};

export default BookList;
