import api from '../../services/api';

export const feeTypeService = {
    getAll: () => api.get('/api/v1/fee-types'),
    getActive: () => api.get('/api/v1/fee-types/active'),
    getById: (id) => api.get(`/api/v1/fee-types/${id}`),
    create: (data) => api.post('/api/v1/fee-types', data),
    update: (id, data) => api.put(`/api/v1/fee-types/${id}`, data),
    delete: (id) => api.delete(`/api/v1/fee-types/${id}`),
};
