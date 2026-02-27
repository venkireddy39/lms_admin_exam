import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { feeStructureService } from '../api';
import Table from '../../../components/common/Table';
import { Plus, Search, Filter, BookOpen, Layers, Edit2, Eye } from 'lucide-react';
import '../../fee/FeeManagement.css';

const FeeStructureListPage = () => {
    const navigate = useNavigate();
    const [structures, setStructures] = useState([]);
    const [isLoading, setIsLoading] = useState(true);

    const fetchStructures = async () => {
        try {
            setIsLoading(true);
            const response = await feeStructureService.getAll();
            setStructures(response.data || []);
        } catch (error) {
            toast.error(error.message || 'Failed to fetch fee structures');
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchStructures();
    }, []);

    const columns = [
        {
            header: 'Structure Name',
            accessor: 'name',
            render: (row) => (
                <div className="flex flex-col">
                    <span className="font-bold text-gray-800">{row.name}</span>
                    <span className="text-xs text-gray-500 font-medium">AY: {row.academicYear}</span>
                </div>
            )
        },
        {
            header: 'Target',
            accessor: 'courseName',
            render: (row) => (
                <div className="flex flex-col">
                    <div className="flex items-center gap-2">
                        <BookOpen size={14} className="text-indigo-400" />
                        <span className="text-sm font-semibold">{row.courseName || `Course ID: ${row.courseId}`}</span>
                    </div>
                    {row.batchName && (
                        <div className="flex items-center gap-2 mt-1">
                            <Layers size={14} className="text-emerald-400" />
                            <span className="text-xs text-gray-500 font-medium">{row.batchName}</span>
                        </div>
                    )}
                </div>
            )
        },
        {
            header: 'Financials',
            accessor: 'totalAmount',
            render: (row) => (
                <div className="flex flex-col">
                    <span className="font-bold text-indigo-600">₹{row.totalAmount?.toLocaleString()}</span>
                    <span className="text-xs text-gray-400 font-medium">{row.installmentCount} Installments</span>
                </div>
            )
        },
        {
            header: 'Status',
            accessor: 'active',
            render: (row) => (
                <span
                    className={`fee-badge ${row.active ? 'fee-badge-success' : 'fee-badge-error'}`}
                >
                    {row.active ? 'Active' : 'Archived'}
                </span>
            ),
        },
    ];

    const renderActions = (row) => (
        <div className="flex gap-2 justify-end">
            <button
                onClick={() => navigate(`/admin/fee-structures/${row.id}/edit`)}
                className="fee-btn-secondary p-2 rounded-lg hover:bg-indigo-50 hover:text-indigo-600 transition-all border-0 shadow-none"
                title="Edit Structure"
            >
                <Edit2 size={16} />
            </button>
            <button
                className="fee-btn-secondary p-2 rounded-lg hover:bg-gray-100 transition-all border-0 shadow-none"
                title="View Details"
            >
                <Eye size={16} />
            </button>
        </div>
    );

    return (
        <div className="fee-form-container min-h-screen p-4 md:p-8">
            <div className="max-w-7xl mx-auto">
                <div className="fee-card mb-8 animate-in fade-in transition-all">
                    <div className="fee-card-header flex-col md:flex-row items-center gap-6">
                        <div className="flex flex-col">
                            <h1 className="text-2xl font-black text-gray-800 tracking-tight">Fee Architecture</h1>
                            <p className="text-sm text-gray-500 font-medium mt-1">Manage and configure fee plans across all academic offerings</p>
                        </div>
                        <div className="flex gap-3 w-full md:w-auto ml-auto">
                            <div className="relative flex-grow md:flex-grow-0 min-w-[200px]">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                                <input
                                    type="text"
                                    placeholder="Search structures..."
                                    className="fee-input pl-10 h-10 py-0 text-sm"
                                />
                            </div>
                            <button
                                onClick={() => navigate('/admin/fee-structures/new')}
                                className="fee-btn-primary h-10 py-0 px-4 flex items-center gap-2"
                            >
                                <Plus size={18} /> New Plan
                            </button>
                        </div>
                    </div>
                </div>

                <div className="fee-card overflow-hidden animate-in slide-in-from-bottom-2 duration-300 shadow-md border-0">
                    <Table
                        columns={columns}
                        data={structures || []}
                        actions={renderActions}
                        isLoading={isLoading}
                    />
                </div>
            </div>
        </div>
    );
};

export default FeeStructureListPage;
