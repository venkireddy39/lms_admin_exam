import apiClient from '../../services/apiClient';

export const feeAllocationService = {
    getById: (id) => apiClient.get(`/api/fee-management/fee-allocations/${id}`),
    getByUser: (userId) => apiClient.get(`/api/fee-management/fee-allocations/user/${userId}`),
    getByBatch: (batchId) => apiClient.get(`/api/fee-management/fee-allocations/batch/${batchId}`),
    create: (data) => apiClient.post('/api/fee-management/fee-allocations', data), // Single allocation
    createBulk: (data) => apiClient.post('/api/fee-management/fee-allocations/bulk', data),
    delete: (id) => apiClient.delete(`/api/fee-management/fee-allocations/${id}`),
};

export const installmentService = {
    getByAllocation: (allocationId) => apiClient.get(`/api/fee-management/installments/allocation/${allocationId}`),
    getOverdue: () => apiClient.get('/api/fee-management/installments/overdue'),
    extendDueDate: (id, newDate) => apiClient.put(`/api/fee-management/installments/${id}/extend?newDate=${newDate}`),
    override: (allocationId, data) => apiClient.put(`/api/fee-management/installments/override/${allocationId}`, data),
};
