import { apiFetch } from "../../../services/api";

/**
 * Late Fee Management API service
 * Syncs with backend LateFeeController and LateFeePenaltyController
 */
export const lateFeeService = {
    // ============================================
    // 1. CONFIG APIs (LateFeeController)
    // ============================================

    /**
     * Create a new late fee configuration
     */
    createConfig: async (configData) => {
        return apiFetch("/api/v1/fee-management/late-fee-configs", {
            method: "POST",
            body: JSON.stringify(configData),
        });
    },

    /**
     * Get all late fee configurations
     */
    getAllConfigs: async () => {
        return apiFetch("/api/v1/fee-management/late-fee-configs");
    },

    /**
     * Get only active configurations
     */
    getActiveConfigs: async () => {
        return apiFetch("/api/v1/fee-management/late-fee-configs/active");
    },

    /**
     * Get config by ID
     */
    getConfigById: async (id) => {
        return apiFetch(`/api/v1/fee-management/late-fee-configs/${id}`);
    },

    /**
     * Update configuration
     */
    updateConfig: async (id, configData) => {
        return apiFetch(`/api/v1/fee-management/late-fee-configs/${id}`, {
            method: "PUT",
            body: JSON.stringify(configData),
        });
    },

    /**
     * Delete configuration
     */
    deleteConfig: async (id) => {
        return apiFetch(`/api/v1/fee-management/late-fee-configs/${id}`, {
            method: "DELETE",
        });
    },

    // ============================================
    // 2. SLAB APIs (LateFeeController)
    // ============================================

    /**
     * Create a new slab for a config
     */
    createSlab: async (slabData) => {
        return apiFetch("/api/v1/fee-management/late-fee-slabs", {
            method: "POST",
            body: JSON.stringify(slabData),
        });
    },

    /**
     * Get slabs for a specific config
     */
    getSlabsByConfig: async (configId) => {
        return apiFetch(`/api/v1/fee-management/late-fee-slabs/config/${configId}`);
    },

    /**
     * Update slab
     */
    updateSlab: async (id, slabData) => {
        return apiFetch(`/api/v1/fee-management/late-fee-slabs/${id}`, {
            method: "PUT",
            body: JSON.stringify(slabData),
        });
    },

    /**
     * Delete slab
     */
    deleteSlab: async (id) => {
        return apiFetch(`/api/v1/fee-management/late-fee-slabs/${id}`, {
            method: "DELETE",
        });
    },

    // ============================================
    // 3. PENALTY APIs (LateFeePenaltyController)
    // ============================================

    /**
     * Create a manual penalty
     */
    createPenalty: async (penaltyData) => {
        return apiFetch("/api/v1/fee-management/late-fee-penalties", {
            method: "POST",
            body: JSON.stringify(penaltyData),
        });
    },

    /**
     * Get all penalties
     */
    getAllPenalties: async () => {
        return apiFetch("/api/v1/fee-management/late-fee-penalties");
    },

    /**
     * Get penalties for a specific installment
     */
    getPenaltiesByInstallment: async (installmentId) => {
        return apiFetch(`/api/v1/fee-management/late-fee-penalties/installment/${installmentId}`);
    },

    /**
     * Waive a penalty
     */
    waivePenalty: async (id) => {
        return apiFetch(`/api/v1/fee-management/late-fee-penalties/waive/${id}`, {
            method: "PUT",
        });
    },

    /**
     * Update penalty record
     */
    updatePenalty: async (id, penaltyData) => {
        return apiFetch(`/api/v1/fee-management/late-fee-penalties/${id}`, {
            method: "PUT",
            body: JSON.stringify(penaltyData),
        });
    },

    /**
     * Delete a penalty record
     */
    deletePenalty: async (id) => {
        return apiFetch(`/api/v1/fee-management/late-fee-penalties/${id}`, {
            method: "DELETE",
        });
    }
};

export default lateFeeService;
