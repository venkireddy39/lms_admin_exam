import apiClient from '../../services/apiClient';

export const feeTypeService = {
    getAll: () => apiClient.get('/api/fee-types'),
    getActive: () => apiClient.get('/api/fee-types/active'),
    getById: (id) => apiClient.get(`/api/fee-types/${id}`),
    create: (data) => apiClient.post('/api/fee-types', data),
    update: (id, data) => apiClient.put(`/api/fee-types/${id}`, data),
    delete: (id) => apiClient.delete(`/api/fee-types/${id}`),
};
