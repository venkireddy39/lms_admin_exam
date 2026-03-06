import { apiFetch, getUrl } from '../../../services/api';

/**
 * Fee Module API service
 */
export const feeApi = {
    // --- Configuration (Admin) ---

    getFeeTypes: async () => {
        return await apiFetch('/api/v1/fee-types');
    },

    getActiveFeeTypes: async () => {
        return await apiFetch('/api/v1/fee-types/active');
    },

    createFeeStructure: async (data) => {
        return await apiFetch('/api/v1/fee-management/fee-structures', {
            method: 'POST',
            body: JSON.stringify(data)
        });
    },

    getFeeStructuresByCourse: async (courseId) => {
        return await apiFetch(`/api/v1/fee-management/fee-structures/course/${courseId}`);
    },

    getFeeStructuresByBatch: async (batchId) => {
        return await apiFetch(`/api/v1/fee-management/fee-structures/batch/${batchId}`);
    },

    getAllFeeStructures: async () => {
        return await apiFetch('/api/v1/fee-management/fee-structures');
    },

    // --- Allocations & Student View ---

    allocateFee: async (data) => {
        return await apiFetch('/api/v1/fee-management/fee-allocations', {
            method: 'POST',
            body: JSON.stringify(data)
        });
    },

    getStudentAllocation: async (allocationId) => {
        return await apiFetch(`/api/v1/fee-management/fee-allocations/${allocationId}`);
    },

    getStudentInstallments: async (allocationId) => {
        return await apiFetch(`/api/v1/fee-management/installments/${allocationId}`);
    },

    getAllFeeAllocations: async () => {
        return await apiFetch('/api/v1/fee-management/fee-allocations');
    },

    // --- Actions (Payments, Discounts, Penalties) ---

    recordPayment: async (allocationId, data) => {
        return await apiFetch(`/api/v1/fee-management/payments/${allocationId}`, {
            method: 'POST',
            body: JSON.stringify(data)
        });
    },

    applyDiscount: async (allocationId, data) => {
        return await apiFetch(`/api/v1/fee-management/discounts/${allocationId}`, {
            method: 'POST',
            body: JSON.stringify(data)
        });
    },

    applyPenalty: async (data) => {
        return await apiFetch('/api/v1/fee-management/late-fee-penalties', {
            method: 'POST',
            body: JSON.stringify(data)
        });
    }
};
