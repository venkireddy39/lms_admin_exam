import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { feeTypeService } from '../api';
import Table from '../../../components/common/Table';

const FeeTypeListPage = () => {
    const navigate = useNavigate();
    const [feeTypes, setFeeTypes] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');

    const fetchFeeTypes = async () => {
        try {
            setIsLoading(true);
            const response = await feeTypeService.getAll();
            setFeeTypes(response.data || []);
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to fetch fee types');
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchFeeTypes();
    }, []);

    const handleToggleStatus = async (feeType) => {
        try {
            const updatedStatus = !feeType.active;
            await feeTypeService.update(feeType.id, { ...feeType, active: updatedStatus });
            toast.success('Status updated successfully');
            setFeeTypes((prev) =>
                prev.map((ft) => (ft.id === feeType.id ? { ...ft, active: updatedStatus } : ft))
            );
        } catch (error) {
            toast.error('Failed to update status');
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm('Are you sure you want to delete this fee type?')) {
            try {
                await feeTypeService.delete(id);
                toast.success('Fee type deleted successfully');
                setFeeTypes(feeTypes.filter((ft) => ft.id !== id));
            } catch (error) {
                toast.error('Failed to delete fee type');
            }
        }
    };

    const filteredData = feeTypes
        .filter((ft) =>
            ft.name?.toLowerCase().includes(searchQuery.toLowerCase())
        )
        .sort((a, b) => (a.displayOrder || 0) - (b.displayOrder || 0));

    const columns = [
        { header: 'Name', accessor: 'name' },
        { header: 'Description', accessor: 'description' },
        { header: 'Display Order', accessor: 'displayOrder' },
        {
            header: 'Status',
            accessor: 'active',
            render: (row) => (
                <button
                    onClick={() => handleToggleStatus(row)}
                    className={`btn btn-sm ${row.active ? 'btn-success' : 'btn-secondary'} rounded-pill px-3`}
                >
                    {row.active ? 'Active' : 'Inactive'}
                </button>
            ),
        },
    ];

    const renderActions = (row) => (
        <div className="d-flex gap-2">
            <button
                onClick={() => navigate(`/admin/fee-types/${row.id}/edit`)}
                className="btn btn-sm btn-outline-primary"
            >
                <i className="bi bi-pencil-square"></i> Edit
            </button>
            <button
                onClick={() => handleDelete(row.id)}
                className="btn btn-sm btn-outline-danger"
            >
                <i className="bi bi-trash"></i> Delete
            </button>
        </div>
    );

    return (
        <div className="container-fluid py-4">
            <div className="d-flex justify-content-between align-items-center mb-4">
                <h2 className="mb-0 text-dark">Fee Types</h2>
                <button
                    onClick={() => navigate('/admin/fee-types/new')}
                    className="btn btn-primary shadow-sm"
                >
                    <i className="bi bi-plus-lg me-1"></i> Add Fee Type
                </button>
            </div>

            <div className="row mb-4">
                <div className="col-md-4">
                    <div className="input-group">
                        <span className="input-group-text bg-white"><i className="bi bi-search"></i></span>
                        <input
                            type="text"
                            placeholder="Search by name..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="form-control"
                        />
                    </div>
                </div>
            </div>

            <Table
                columns={columns}
                data={filteredData || []}
                actions={renderActions}
                isLoading={isLoading}
            />
        </div>
    );
};

export default FeeTypeListPage;
