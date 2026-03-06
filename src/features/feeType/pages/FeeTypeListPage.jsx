import React, { useEffect, useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { feeTypeService } from "../api";
import {
    Plus,
    Search,
    Edit2,
    Trash2,
    RefreshCw,
    Tag,
    ToggleLeft,
    ToggleRight,
    ArrowUpDown,
    CheckCircle,
    XCircle,
    List,
    Hash,
} from "lucide-react";

const FeeTypeListPage = () => {
    const navigate = useNavigate();

    const [feeTypes, setFeeTypes] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [searchQuery, setSearchQuery] = useState("");
    const [togglingId, setTogglingId] = useState(null);

    const fetchFeeTypes = async (silent = false) => {
        try {
            silent ? setRefreshing(true) : setIsLoading(true);

            const response = await feeTypeService.getAll();

            setFeeTypes(Array.isArray(response) ? response : []);
        } catch {
            toast.error("Failed to fetch fee types");
        } finally {
            setIsLoading(false);
            setRefreshing(false);
        }
    };

    useEffect(() => {
        fetchFeeTypes();
    }, []);

    const handleToggleStatus = async (feeType) => {
        try {
            setTogglingId(feeType.id);

            const updatedStatus = !feeType.active;

            await feeTypeService.update(feeType.id, {
                ...feeType,
                active: updatedStatus,
            });

            setFeeTypes((prev) =>
                prev.map((ft) =>
                    ft.id === feeType.id ? { ...ft, active: updatedStatus } : ft
                )
            );

            toast.success(
                `Fee type ${updatedStatus ? "activated" : "deactivated"}`
            );
        } catch {
            toast.error("Failed to update status");
        } finally {
            setTogglingId(null);
        }
    };

    const handleDelete = async (id, name) => {
        if (!window.confirm(`Delete "${name}"?`)) return;

        try {
            await feeTypeService.delete(id);

            setFeeTypes((prev) => prev.filter((ft) => ft.id !== id));

            toast.success("Fee type deleted");
        } catch {
            toast.error("Failed to delete fee type");
        }
    };

    const filteredData = useMemo(() => {
        const q = searchQuery.toLowerCase();

        return feeTypes
            .filter((ft) => ft.name?.toLowerCase().includes(q))
            .sort((a, b) => (a.displayOrder || 0) - (b.displayOrder || 0));
    }, [feeTypes, searchQuery]);

    const activeCount = feeTypes.filter((f) => f.active).length;
    const inactiveCount = feeTypes.length - activeCount;

    return (
        <div className="container py-4">

            <div className="d-flex justify-content-between align-items-center mb-4">
                <div>
                    <h3 className="fw-bold d-flex align-items-center gap-2">
                        <Tag size={18} /> Fee Types
                    </h3>
                    <small className="text-muted">
                        Manage fee categories used in fee structures
                    </small>
                </div>

                <div className="d-flex gap-2">

                    <div className="input-group">
                        <span className="input-group-text">
                            <Search size={14} />
                        </span>

                        <input
                            className="form-control"
                            placeholder="Search fee types"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>

                    <button
                        className="btn btn-outline-secondary"
                        onClick={() => fetchFeeTypes(true)}
                    >
                        <RefreshCw size={16} />
                    </button>

                    <button
                        className="btn btn-primary d-flex align-items-center gap-1"
                        onClick={() => navigate("/admin/fee-types/new")}
                    >
                        <Plus size={16} /> Add
                    </button>

                </div>
            </div>

            <div className="row mb-4">

                <div className="col-md-4">
                    <div className="card shadow-sm">
                        <div className="card-body d-flex align-items-center gap-3">
                            <List size={22} />
                            <div>
                                <h5 className="mb-0">{feeTypes.length}</h5>
                                <small className="text-muted">Total Types</small>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="col-md-4">
                    <div className="card shadow-sm">
                        <div className="card-body d-flex align-items-center gap-3">
                            <CheckCircle size={22} />
                            <div>
                                <h5 className="mb-0">{activeCount}</h5>
                                <small className="text-muted">Active</small>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="col-md-4">
                    <div className="card shadow-sm">
                        <div className="card-body d-flex align-items-center gap-3">
                            <XCircle size={22} />
                            <div>
                                <h5 className="mb-0">{inactiveCount}</h5>
                                <small className="text-muted">Inactive</small>
                            </div>
                        </div>
                    </div>
                </div>

            </div>

            <div className="card shadow-sm">

                <div className="card-header d-flex justify-content-between">
                    <strong>All Fee Types</strong>

                    {searchQuery && (
                        <button
                            className="btn btn-sm btn-link"
                            onClick={() => setSearchQuery("")}
                        >
                            Clear Filter
                        </button>
                    )}
                </div>

                <div className="card-body p-0">

                    {isLoading ? (
                        <div className="p-4 text-center">Loading...</div>
                    ) : filteredData.length === 0 ? (
                        <div className="p-5 text-center">
                            <Tag size={40} className="mb-3" />
                            <h5>No fee types found</h5>
                        </div>
                    ) : (

                        <table className="table table-hover mb-0">

                            <thead className="table-light">
                                <tr>
                                    <th>Name</th>
                                    <th>Description</th>
                                    <th>
                                        <div className="d-flex align-items-center gap-1">
                                            <ArrowUpDown size={12} /> Order
                                        </div>
                                    </th>
                                    <th>Status</th>
                                    <th className="text-end">Actions</th>
                                </tr>
                            </thead>

                            <tbody>

                                {filteredData.map((row) => (

                                    <tr key={row.id}>

                                        <td className="fw-semibold">{row.name}</td>

                                        <td className="text-muted">
                                            {row.description || "—"}
                                        </td>

                                        <td>
                                            <span className="badge bg-light text-dark">
                                                <Hash size={10} /> {row.displayOrder ?? "—"}
                                            </span>
                                        </td>

                                        <td>

                                            <button
                                                className={`btn btn-sm ${row.active
                                                    ? "btn-success"
                                                    : "btn-warning"
                                                    }`}
                                                onClick={() => handleToggleStatus(row)}
                                                disabled={togglingId === row.id}
                                            >
                                                {row.active ? (
                                                    <ToggleRight size={14} />
                                                ) : (
                                                    <ToggleLeft size={14} />
                                                )}
                                                {" "}
                                                {row.active ? "Active" : "Inactive"}
                                            </button>

                                        </td>

                                        <td className="text-end">

                                            <div className="btn-group">

                                                <button
                                                    className="btn btn-sm btn-outline-primary"
                                                    onClick={() =>
                                                        navigate(`/admin/fee-types/${row.id}/edit`)
                                                    }
                                                >
                                                    <Edit2 size={14} />
                                                </button>

                                                <button
                                                    className="btn btn-sm btn-outline-danger"
                                                    onClick={() =>
                                                        handleDelete(row.id, row.name)
                                                    }
                                                >
                                                    <Trash2 size={14} />
                                                </button>

                                            </div>

                                        </td>

                                    </tr>

                                ))}

                            </tbody>

                        </table>

                    )}

                </div>

            </div>

        </div>
    );
};

export default FeeTypeListPage;