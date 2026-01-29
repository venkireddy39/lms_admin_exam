import React from 'react';
import { Edit, Trash2, Book as BookIcon, Globe, BookOpen } from 'lucide-react'; // Refreshing import

const ResourceTable = ({
    resources,
    loading,
    viewMode,
    onEdit,
    onDelete,
    onIssue,
    canManage = false
}) => {
    return (
        <div className="table-responsive">
            <table className="table table-hover align-middle">
                <thead className="table-light">
                    <tr>
                        <th>Resource</th>
                        <th>Category</th>

                        {viewMode === 'PHYSICAL' ? (
                            <>
                                <th>ISBN</th>
                                <th>Location</th>
                                <th>Availability</th>
                                <th>Copies</th>
                            </>
                        ) : (
                            <>
                                <th>Type & Format</th>
                                <th>Access</th>
                                <th>License Expiry</th>
                                <th>Concurrent Usage</th>
                            </>
                        )}

                        {canManage && <th className="text-end">Actions</th>}
                    </tr>
                </thead>

                <tbody>
                    {loading && (
                        <tr>
                            <td colSpan={canManage ? 7 : 6} className="text-center py-4">
                                Loading resources...
                            </td>
                        </tr>
                    )}

                    {!loading && resources.length === 0 && (
                        <tr>
                            <td colSpan={canManage ? 7 : 6} className="text-center py-4 text-muted">
                                No resources found.
                            </td>
                        </tr>
                    )}

                    {!loading &&
                        resources.map((res) => {
                            const totalCopies = res.copies?.length || res.totalCopies || 0;
                            const availableCopies =
                                res.copies?.filter(c => c.status === 'AVAILABLE').length ??
                                res.availableCopies ??
                                0;

                            return (
                                <tr key={res.id}>
                                    {/* RESOURCE INFO */}
                                    <td>
                                        <div className="d-flex align-items-center">
                                            <div
                                                className="bg-light d-flex align-items-center justify-content-center me-3 rounded"
                                                style={{ width: 40, height: 50 }}
                                            >
                                                {res.cover ? (
                                                    <img
                                                        src={res.cover}
                                                        alt=""
                                                        className="w-100 h-100 object-fit-cover"
                                                    />
                                                ) : (
                                                    <BookIcon size={20} className="text-secondary" />
                                                )}
                                            </div>
                                            <div>
                                                <div className="fw-bold">{res.title}</div>
                                                <div className="small text-muted">{res.author}</div>
                                            </div>
                                        </div>
                                    </td>

                                    <td>
                                        <span className="badge bg-light text-dark border">
                                            {res.category?.categoryName || res.category || 'General'}
                                        </span>
                                    </td>

                                    {viewMode === 'PHYSICAL' ? (
                                        <>
                                            <td>{res.isbn || '-'}</td>

                                            <td>{res.shelfLocation || '-'}</td>

                                            <td>
                                                <span
                                                    className={`badge rounded-pill ${availableCopies > 0
                                                        ? 'bg-success'
                                                        : 'bg-danger'
                                                        }`}
                                                >
                                                    {availableCopies > 0 ? 'Available' : 'Unavailable'}
                                                </span>
                                            </td>

                                            <td>
                                                <span
                                                    className={
                                                        availableCopies === 0
                                                            ? 'fw-bold text-danger'
                                                            : 'fw-bold'
                                                    }
                                                >
                                                    {availableCopies}
                                                </span>
                                                <span className="text-muted small">
                                                    {' '}
                                                    / {totalCopies}
                                                </span>
                                            </td>
                                        </>
                                    ) : (
                                        <>
                                            <td>
                                                <div className="d-flex flex-column">
                                                    <span>{res.digitalType || 'E-BOOK'}</span>
                                                    <span className="badge bg-info text-dark w-auto mt-1">
                                                        {res.format}
                                                    </span>
                                                </div>
                                            </td>

                                            <td>
                                                {res.accessUrl ? (
                                                    <a
                                                        href={res.accessUrl}
                                                        target="_blank"
                                                        rel="noreferrer"
                                                        className="text-decoration-none d-flex align-items-center"
                                                    >
                                                        <Globe size={14} className="me-1" />
                                                        Access
                                                    </a>
                                                ) : (
                                                    '-'
                                                )}
                                            </td>

                                            <td>{res.licenseExpiry || '-'}</td>

                                            <td>
                                                <strong>{res.activeAccess || 0}</strong>
                                                <span className="text-muted small mx-1">/</span>
                                                {res.concurrentAccessLimit || 0}
                                            </td>
                                        </>
                                    )}

                                    {/* ACTIONS */}
                                    {canManage && (
                                        <td className="text-end">
                                            <div className="btn-group btn-group-sm">
                                                <button
                                                    className="btn btn-outline-primary"
                                                    onClick={() => onIssue && onIssue(res)}
                                                    disabled={!onIssue || (availableCopies === 0 && viewMode === 'PHYSICAL')}
                                                    title={availableCopies === 0 && viewMode === 'PHYSICAL' ? "No copies available" : "Issue Book"}
                                                >
                                                    <BookOpen size={16} />
                                                </button>
                                                <button
                                                    className="btn btn-outline-secondary"
                                                    onClick={() => onEdit(res)}
                                                    title="Edit"
                                                >
                                                    <Edit size={16} />
                                                </button>
                                                <button
                                                    className="btn btn-outline-danger"
                                                    onClick={() =>
                                                        onDelete(res, {
                                                            hasCopies: totalCopies > 0
                                                        })
                                                    }
                                                    title="Delete"
                                                >
                                                    <Trash2 size={16} />
                                                </button>
                                            </div>
                                        </td>
                                    )}
                                </tr>
                            );
                        })}
                </tbody>
            </table>
        </div>
    );
};

export default ResourceTable;
