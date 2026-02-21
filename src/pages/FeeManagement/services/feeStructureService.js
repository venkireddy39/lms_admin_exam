import { apiFetch } from "../../../services/api";

const BASE_URL = "/api/fee-management/fee-structures";

export const feeStructureService = {
    /**
     * Create a new FeeStructure
     * @param {Object} feeStructureData 
     * @returns {Promise<Object>} Created FeeStructure
     */
    createFeeStructure: async (feeStructureData) => {
        return apiFetch(BASE_URL, {
            method: "POST",
            body: JSON.stringify(feeStructureData),
        });
    },

    /**
     * Get all FeeStructures
     * @returns {Promise<Array>} List of FeeStructures
     */
    getAllFeeStructures: async () => {
        return apiFetch(BASE_URL);
    },

    /**
     * Get FeeStructure by ID
     * @param {number|string} id 
     * @returns {Promise<Object>} FeeStructure
     */
    getFeeStructureById: async (id) => {
        return apiFetch(`${BASE_URL}/${id}`);
    },

    /**
     * Get FeeStructures by Course ID
     * @param {number|string} courseId 
     * @returns {Promise<Array>} List of FeeStructures
     */
    getFeeStructuresByCourse: async (courseId) => {
        return apiFetch(`${BASE_URL}/course/${courseId}`);
    },

    /**
     * Get FeeStructures by Batch ID
     * @param {number|string} batchId 
     * @returns {Promise<Array>} List of FeeStructures
     */
    getFeeStructuresByBatch: async (batchId) => {
        return apiFetch(`${BASE_URL}/batch/${batchId}`);
    },

    /**
     * Get FeeStructures by Academic Year
     * @param {string} academicYear 
     * @returns {Promise<Array>} List of FeeStructures
     */
    getFeeStructuresByAcademicYear: async (academicYear) => {
        return apiFetch(`${BASE_URL}/academic-year/${academicYear}`);
    },

    /**
     * Update a FeeStructure
     * @param {number|string} id 
     * @param {Object} feeStructureData 
     * @returns {Promise<Object>} Updated FeeStructure
     */
    updateFeeStructure: async (id, feeStructureData) => {
        return apiFetch(`${BASE_URL}/${id}`, {
            method: "PUT",
            body: JSON.stringify(feeStructureData),
        });
    },

    /**
     * Soft delete a FeeStructure
     * @param {number|string} id 
     * @returns {Promise<void>}
     */
    deleteFeeStructure: async (id) => {
        return apiFetch(`${BASE_URL}/${id}`, {
            method: "DELETE",
        });
    },
};
