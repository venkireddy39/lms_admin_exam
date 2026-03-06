import apiClient from '../../services/apiClient';

export const feeStructureService = {
    getAll: () => apiClient.get('/api/v1/fee-management/fee-structures'),
    getById: (id) => apiClient.get(`/api/v1/fee-management/fee-structures/${id}`),
    getByBatch: (batchId) => apiClient.get(`/api/v1/fee-management/fee-structures/batch/${batchId}`),
    create: (data) => apiClient.post('/api/v1/fee-management/fee-structures', data),
    update: (id, data) => apiClient.put(`/api/v1/fee-management/fee-structures/${id}`, data),
    delete: (id) => apiClient.delete(`/api/v1/fee-management/fee-structures/${id}`),
};
