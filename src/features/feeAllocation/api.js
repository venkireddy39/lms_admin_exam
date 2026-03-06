import apiClient from '../../services/apiClient';

export const feeAllocationService = {
    getById: (id) => apiClient.get(`/api/v1/fee-management/fee-allocations/${id}`),
    getByUser: (userId) => apiClient.get(`/api/v1/fee-management/fee-allocations/user/${userId}`),
    getByBatch: (batchId) => apiClient.get(`/api/v1/fee-management/fee-allocations/batch/${batchId}`),
    create: (data) => apiClient.post('/api/v1/fee-management/fee-allocations', data), // Single allocation
    createBulk: (data) => apiClient.post('/api/v1/fee-management/fee-allocations/bulk', data),
    delete: (id) => apiClient.delete(`/api/v1/fee-management/fee-allocations/${id}`),
};

export const installmentService = {
    getByAllocation: (allocationId) => apiClient.get(`/api/v1/fee-management/installments/allocation/${allocationId}`),
    getOverdue: () => apiClient.get('/api/v1/fee-management/installments/overdue'),
    extendDueDate: (id, newDate) => apiClient.put(`/api/v1/fee-management/installments/${id}/extend?newDate=${newDate}`),
    override: (allocationId, data) => apiClient.put(`/api/v1/fee-management/installments/override/${allocationId}`, data),
};
