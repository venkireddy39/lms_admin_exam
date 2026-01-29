import React, { useState } from 'react';
import { Save, Info } from 'lucide-react';
import { useToast } from '../../../context/ToastContext';
import { BookService } from '../../../services/api';

const AddEditResourceModal = ({
    resource,
    viewMode,
    existingResources = [],
    onClose,
    onSave
}) => {
    const toast = useToast();

    const isEdit = Boolean(resource?.id);
    const isPhysical = (resource?.type || viewMode) === 'PHYSICAL';

    /* ===================== STATE ===================== */

    const [categories, setCategories] = useState([]);
    const [categoriesLoading, setCategoriesLoading] = useState(false);
    const [categorySearch, setCategorySearch] = useState('');
    const [isCreatingCategory, setIsCreatingCategory] = useState(false);

    const [formData, setFormData] = useState({
        id: resource?.id,
        title: resource?.title || '',
        author: resource?.author || '',
        publisher: resource?.publisher || '',
        edition: resource?.edition || '',
        year: resource?.year || resource?.publicationYear || '', // Check both for safety
        language: resource?.language || '',
        category: resource?.category?.id || resource?.category || '',
        type: resource?.type || viewMode,

        // Physical only
        isbn: resource?.isbn || '',
        shelfLocation: resource?.shelfLocation || '',
        totalCopies: resource?.totalCopies || 1,

        // Digital only
        accessUrl: resource?.accessUrl || '',
        format: resource?.format || 'PDF'
    });

    React.useEffect(() => {
        const fetchCategories = async () => {
            setCategoriesLoading(true);
            try {
                const data = await BookService.getAllCategories();
                setCategories(data);

                // If editing, set search text to existing category name
                if (resource?.category) {
                    const matched = data.find(c => c.id === (resource.category.id || resource.category));
                    if (matched) setCategorySearch(matched.categoryName);
                }
            } catch (err) {
                console.error('Failed to fetch categories:', err);
            } finally {
                setCategoriesLoading(false);
            }
        };
        fetchCategories();
    }, [resource]);

    const handleChange = (key, value) => {
        setFormData(prev => ({ ...prev, [key]: value }));
    };

    const handleCreateCategory = async (name) => {
        setIsCreatingCategory(true);
        try {
            const newCat = await BookService.createCategory(name);
            const finalName = newCat.categoryName || newCat.name || name;

            setCategories(prev => [...prev, newCat]);
            handleChange('category', newCat.id);
            setCategorySearch(finalName);
            toast.success(`Category "${finalName}" created`);
        } catch (err) {
            toast.error('Failed to create category');
        } finally {
            setIsCreatingCategory(false);
        }
    };

    /* ===================== SUBMIT ===================== */

    const handleSubmit = async () => {
        // Required: title & author & category
        if (!formData.title.trim() || !formData.author.trim()) {
            toast.error('Title and Author are required.');
            return;
        }

        if (!formData.category) {
            toast.error('Category is required.');
            return;
        }

        const submitPayload = {
            ...formData,
            category: { id: formData.category }
        };

        if (isPhysical) {
            // Required: ISBN
            if (!formData.isbn.trim()) {
                toast.error('ISBN is required.');
                return;
            }

            // ISBN format (13 digits)
            const cleanIsbn = formData.isbn.replace(/-/g, '');
            if (!/^\d{13}$/.test(cleanIsbn)) {
                toast.error('ISBN must be a valid 13-digit number.');
                return;
            }

            // Required: Shelf
            if (!formData.shelfLocation.trim()) {
                toast.error('Shelf location is required.');
                return;
            }

            // Total copies only on create
            if (!isEdit && Number(formData.totalCopies) < 1) {
                toast.error('Total copies must be at least 1.');
                return;
            }

            submitPayload.isbn = cleanIsbn;
            submitPayload.totalCopies = !isEdit ? Number(formData.totalCopies) : undefined;
        }

        onSave(submitPayload);
    };

    /* ===================== CATEGORY SEARCH ===================== */

    /* ===================== CATEGORY SEARCH ===================== */

    // Safety check: ensure categories is an array and items have name/categoryName
    const validCategories = (categories || []).filter(c => c && (c.categoryName || c.name));

    const getCatName = (cat) => (cat.categoryName || cat.name || '');

    const filteredCategories = validCategories.filter(c =>
        getCatName(c).toLowerCase().includes((categorySearch || '').toLowerCase())
    );

    const exactMatch = validCategories.find(c =>
        getCatName(c).toLowerCase() === (categorySearch || '').toLowerCase()
    );

    /* ===================== UI ===================== */

    return (
        <div className="modal show d-block" style={{ background: 'rgba(0,0,0,0.5)' }}>
            <div className="modal-dialog modal-lg modal-dialog-centered">
                <div className="modal-content">

                    <div className="modal-header">
                        <h5 className="modal-title">
                            {isEdit ? 'Edit' : 'Add'} {isPhysical ? 'Book' : 'Digital Resource'}
                        </h5>
                        <button className="btn-close" onClick={onClose} />
                    </div>

                    <div className="modal-body">

                        {/* BASIC INFO */}
                        <h6 className="text-muted mb-3 border-bottom pb-2">
                            Basic Information
                        </h6>

                        <div className="row g-3 mb-4">
                            <div className="col-md-6">
                                <label className="form-label">
                                    Title <span className="text-danger">*</span>
                                </label>
                                <input
                                    className="form-control"
                                    placeholder="Enter book title"
                                    value={formData.title}
                                    onChange={e => handleChange('title', e.target.value)}
                                />
                            </div>

                            <div className="col-md-6">
                                <label className="form-label">
                                    Author <span className="text-danger">*</span>
                                </label>
                                <input
                                    className="form-control"
                                    placeholder="Enter author name"
                                    value={formData.author}
                                    onChange={e => handleChange('author', e.target.value)}
                                />
                            </div>

                            <div className="col-md-6">
                                <label className="form-label">Publisher</label>
                                <input
                                    className="form-control"
                                    value={formData.publisher}
                                    onChange={e => handleChange('publisher', e.target.value)}
                                />
                            </div>

                            <div className="col-md-6">
                                <label className="form-label">
                                    Category <span className="text-danger">*</span>
                                </label>
                                <div className="dropdown w-100">
                                    <input
                                        type="text"
                                        className="form-select text-start"
                                        placeholder="Type to search or add..."
                                        data-bs-toggle="dropdown"
                                        value={categorySearch}
                                        onChange={e => {
                                            const val = e.target.value;
                                            setCategorySearch(val);
                                            // Reset selected ID if typing manually, unless it's an exact match
                                            const match = validCategories.find(c => getCatName(c).toLowerCase() === val.toLowerCase());
                                            if (match) handleChange('category', match.id);
                                            else handleChange('category', '');
                                        }}
                                    />
                                    <ul className="dropdown-menu w-100 shadow-sm border-0 mt-1 overflow-auto" style={{ maxHeight: '200px' }}>
                                        {categoriesLoading ? (
                                            <li className="dropdown-item text-muted">Loading...</li>
                                        ) : (
                                            <>
                                                {filteredCategories.map(cat => (
                                                    <li key={cat.id}>
                                                        <button
                                                            className={`dropdown-item ${formData.category === cat.id ? 'active' : ''}`}
                                                            onClick={e => {
                                                                e.preventDefault();
                                                                handleChange('category', cat.id);
                                                                setCategorySearch(getCatName(cat));
                                                            }}
                                                        >
                                                            {getCatName(cat)}
                                                        </button>
                                                    </li>
                                                ))}

                                                {!exactMatch && categorySearch.trim().length > 0 && (
                                                    <li>
                                                        <button
                                                            className="dropdown-item text-primary fw-bold"
                                                            disabled={isCreatingCategory}
                                                            onClick={e => {
                                                                e.preventDefault();
                                                                handleCreateCategory(categorySearch);
                                                            }}
                                                        >
                                                            {isCreatingCategory ? 'Creating...' : `+ Create "${categorySearch}"`}
                                                        </button>
                                                    </li>
                                                )}

                                                {filteredCategories.length === 0 && !categorySearch && (
                                                    <li className="dropdown-item text-muted small">Type a name to search</li>
                                                )}
                                            </>
                                        )}
                                    </ul>
                                </div>
                            </div>

                            {/* RESTORED FIELDS */}
                            <div className="col-md-4">
                                <label className="form-label">Edition</label>
                                <input
                                    className="form-control"
                                    placeholder="e.g. 2nd"
                                    value={formData.edition}
                                    onChange={e => handleChange('edition', e.target.value)}
                                />
                            </div>
                            <div className="col-md-4">
                                <label className="form-label">Year</label>
                                <input
                                    className="form-control"
                                    type="number"
                                    placeholder="YYYY"
                                    value={formData.year}
                                    onChange={e => handleChange('year', e.target.value)}
                                />
                            </div>
                            <div className="col-md-4">
                                <label className="form-label">Language</label>
                                <input
                                    className="form-control"
                                    placeholder="English"
                                    value={formData.language}
                                    onChange={e => handleChange('language', e.target.value)}
                                />
                            </div>
                        </div>

                        {/* PHYSICAL */}
                        {isPhysical && (
                            <>
                                <h6 className="text-muted mb-3 border-bottom pb-2">
                                    Inventory Details
                                </h6>

                                <div className="row g-3">
                                    <div className="col-md-6">
                                        <label className="form-label">
                                            ISBN <span className="text-danger">*</span>
                                        </label>
                                        <input
                                            className="form-control"
                                            placeholder="ISBN-13"
                                            value={formData.isbn}
                                            onChange={e => handleChange('isbn', e.target.value)}
                                        />
                                    </div>

                                    <div className="col-md-6">
                                        <label className="form-label">
                                            Shelf Location <span className="text-danger">*</span>
                                        </label>
                                        <input
                                            className="form-control"
                                            placeholder="A1-B2"
                                            value={formData.shelfLocation}
                                            onChange={e => handleChange('shelfLocation', e.target.value)}
                                        />
                                    </div>

                                    {!isEdit && (
                                        <div className="col-12">
                                            <div className="card bg-light border-0">
                                                <div className="card-body">
                                                    <label className="form-label fw-bold">
                                                        Total Copies
                                                    </label>

                                                    <div className="d-flex align-items-center gap-3">
                                                        <input
                                                            type="number"
                                                            min="1"
                                                            className="form-control"
                                                            style={{ width: '120px' }}
                                                            value={formData.totalCopies}
                                                            onChange={e =>
                                                                handleChange('totalCopies', e.target.value)
                                                            }
                                                        />
                                                        <span className="text-muted small">
                                                            <Info size={14} className="me-1" />
                                                            Barcodes will be generated automatically
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </>
                        )}

                        {/* DIGITAL */}
                        {!isPhysical && (
                            <>
                                <h6 className="text-muted mb-3 border-bottom pb-2">
                                    Digital Access
                                </h6>

                                <div className="row g-3">
                                    <div className="col-md-12">
                                        <label className="form-label">Access URL</label>
                                        <input
                                            className="form-control"
                                            placeholder="https://..."
                                            value={formData.accessUrl}
                                            onChange={e => handleChange('accessUrl', e.target.value)}
                                        />
                                    </div>

                                    <div className="col-md-6">
                                        <label className="form-label">Format</label>
                                        <select
                                            className="form-select"
                                            value={formData.format}
                                            onChange={e => handleChange('format', e.target.value)}
                                        >
                                            <option value="PDF">PDF</option>
                                            <option value="EPUB">EPUB</option>
                                            <option value="VIDEO">Video</option>
                                            <option value="ONLINE">Online</option>
                                        </select>
                                    </div>
                                </div>
                            </>
                        )}
                    </div>

                    <div className="modal-footer">
                        <button className="btn btn-light" onClick={onClose}>
                            Cancel
                        </button>
                        <button className="btn btn-primary" onClick={handleSubmit}>
                            <Save size={16} className="me-2" />
                            {isEdit ? 'Save Changes' : 'Create Resource'}
                        </button>
                    </div>

                </div>
            </div>
        </div>
    );
};

export default AddEditResourceModal;
