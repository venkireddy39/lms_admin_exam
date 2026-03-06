import { apiFetch } from "../../../services/api";

const BASE_URL = "/api/v1/fee-types";

export const feeTypeService = {
    /**
     * Create a new FeeType
     * @param {Object} feeTypeData 
     * @returns {Promise<Object>} Created FeeType
     */
    createFeeType: async (feeTypeData) => {
        return apiFetch(BASE_URL, {
            method: "POST",
            body: JSON.stringify(feeTypeData),
        });
    },

    /**
     * Get all FeeTypes
     * @returns {Promise<Array>} List of FeeTypes
     */
    getAllFeeTypes: async () => {
        return apiFetch(BASE_URL);
    },

    /**
     * Get only active FeeTypes
     * @returns {Promise<Array>} List of active FeeTypes
     */
    getActiveFeeTypes: async () => {
        return apiFetch(`${BASE_URL}/active`);
    },

    /**
     * Get FeeType by ID
     * @param {number|string} id 
     * @returns {Promise<Object>} FeeType
     */
    getFeeTypeById: async (id) => {
        return apiFetch(`${BASE_URL}/${id}`);
    },

    /**
     * Update a FeeType
     * @param {number|string} id 
     * @param {Object} feeTypeData 
     * @returns {Promise<Object>} Updated FeeType
     */
    updateFeeType: async (id, feeTypeData) => {
        return apiFetch(`${BASE_URL}/${id}`, {
            method: "PUT",
            body: JSON.stringify(feeTypeData),
        });
    },

    /**
     * Soft delete a FeeType
     * @param {number|string} id 
     * @returns {Promise<void>}
     */
    deleteFeeType: async (id) => {
        return apiFetch(`${BASE_URL}/${id}`, {
            method: "DELETE",
        });
    },
};
