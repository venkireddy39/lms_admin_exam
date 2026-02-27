import apiClient from '../../services/apiClient';

export const feeStructureService = {
    getAll: () => apiClient.get('/api/fee-management/fee-structures'),
    getById: (id) => apiClient.get(`/api/fee-management/fee-structures/${id}`),
    getByBatch: (batchId) => apiClient.get(`/api/fee-management/fee-structures/batch/${batchId}`),
    create: (data) => apiClient.post('/api/fee-management/fee-structures', data),
    update: (id, data) => apiClient.put(`/api/fee-management/fee-structures/${id}`, data),
    delete: (id) => apiClient.delete(`/api/fee-management/fee-structures/${id}`),
};
