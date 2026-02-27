import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { feeAllocationService } from '../api';
import Table from '../../../components/common/Table';

const FeeAllocationListPage = () => {
    const navigate = useNavigate();
    const [allocations, setAllocations] = useState([]);
    const [isLoading, setIsLoading] = useState(true);

    const fetchAllocations = async () => {
        try {
            setIsLoading(true);
            const response = await feeAllocationService.getAll();
            setAllocations(response.data || []);
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to fetch allocations');
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchAllocations();
    }, []);

    const columns = [
        { header: 'Student ID', accessor: 'studentId' },
        { header: 'Batch ID', accessor: 'batchId' },
        { header: 'Payable Amount', accessor: 'payableAmount' },
        { header: 'Remaining Amount', accessor: 'remainingAmount' },
        {
            header: 'Status',
            accessor: 'status',
            render: (row) => (
                <span
                    className={`px-2 py-1 rounded text-xs font-semibold ${row.status === 'PAID'
                        ? 'bg-green-100 text-green-800'
                        : row.status === 'PARTIAL'
                            ? 'bg-yellow-100 text-yellow-800'
                            : 'bg-red-100 text-red-800'
                        }`}
                >
                    {row.status || 'PENDING'}
                </span>
            ),
        },
    ];

    const renderActions = (row) => (
        <div className="flex gap-2 justify-end">
            <button
                onClick={() => navigate(`/admin/fee-allocations/${row.id}`)}
                className="text-indigo-600 hover:text-indigo-900 font-medium"
            >
                View Details
            </button>
        </div>
    );

    return (
        <div className="p-6">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold text-gray-800">Student Fee Allocations</h1>
                <button
                    onClick={() => navigate('/admin/fee-allocations/new')}
                    className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-md font-medium transition-colors"
                >
                    + Create Allocation
                </button>
            </div>

            <Table
                columns={columns}
                data={allocations || []}
                actions={renderActions}
                isLoading={isLoading}
            />
        </div>
    );
};

export default FeeAllocationListPage;
