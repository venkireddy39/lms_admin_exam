import { apiFetch } from './apiFetch';

const BASE_URL = '/api/fee-management';

// Helper to construct full URL
const getUrl = (endpoint) => `${BASE_URL}${endpoint}`;

// ============================================
// FEE TYPE API
// ============================================

export const getAllFeeTypes = async () => {
    try {
        return await apiFetch('/api/fee-types');
    } catch (error) {
        console.error('Error fetching all fee types:', error);
        throw error;
    }
};

export const getActiveFeeTypes = async () => {
    try {
        return await apiFetch('/api/fee-types/active');
    } catch (error) {
        console.error('Error fetching active fee types:', error);
        throw error;
    }
};

export const createFeeType = async (feeTypeData) => {
    try {
        return await apiFetch('/api/fee-types', {
            method: 'POST',
            body: JSON.stringify(feeTypeData)
        });
    } catch (error) {
        console.error('Error creating fee type:', error);
        throw error;
    }
};

export const updateFeeType = async (id, feeTypeData) => {
    try {
        return await apiFetch(`/api/fee-types/${id}`, {
            method: 'PUT',
            body: JSON.stringify(feeTypeData)
        });
    } catch (error) {
        console.error('Error updating fee type:', error);
        throw error;
    }
};

export const deleteFeeType = async (id) => {
    try {
        return await apiFetch(`/api/fee-types/${id}`, {
            method: 'DELETE'
        });
    } catch (error) {
        console.error('Error deleting fee type:', error);
        throw error;
    }
};


// ============================================
// FEE DISCOUNT API
// ============================================

export const createFeeDiscount = async (discountData) => {
    try {
        return await apiFetch(getUrl('/fee-discounts'), {
            method: 'POST',
            body: JSON.stringify(discountData)
        });
    } catch (error) {
        console.error('Error creating fee discount:', error);
        throw error;
    }
};

export const getFeeDiscounts = async (params = {}) => {
    try {
        // Construct query string manually or use URLSearchParams if needed
        const queryString = new URLSearchParams(params).toString();
        const url = getUrl('/fee-discounts') + (queryString ? `?${queryString}` : '');
        return await apiFetch(url);
    } catch (error) {
        console.error('Error fetching fee discounts:', error);
        throw error;
    }
};

export const deleteFeeDiscount = async (discountId) => {
    try {
        return await apiFetch(getUrl(`/fee-discounts/${discountId}`), {
            method: 'DELETE'
        });
    } catch (error) {
        console.error('Error deleting fee discount:', error);
        throw error;
    }
};


// ============================================
// FEE SETTINGS API
// ============================================

export const getFeeSettings = async () => {
    try {
        return await apiFetch(getUrl('/master-settings'));
    } catch (error) {
        console.error('Error fetching fee settings:', error);
        throw error;
    }
};

export const saveFeeSettings = async (settings) => {
    try {
        return await apiFetch(getUrl('/master-settings'), {
            method: 'POST',
            body: JSON.stringify(settings)
        });
    } catch (error) {
        console.error('Error saving fee settings:', error);
        throw error;
    }
};

// ============================================
// AUDIT LOG API
// ============================================

export const getAuditLogs = async (params = {}) => {
    try {
        const queryString = new URLSearchParams(params).toString();
        const url = getUrl('/audit-logs') + (queryString ? `?${queryString}` : '');
        return await apiFetch(url);
    } catch (error) {
        console.error('Error fetching audit logs:', error);
        throw error;
    }
};

export const createAuditLog = async (logData) => {
    try {
        return await apiFetch(getUrl('/audit-logs'), {
            method: 'POST',
            body: JSON.stringify(logData)
        });
    } catch (error) {
        console.error('Error creating audit log:', error);
        throw error;
    }
};

export const exportAuditLogs = async (format = 'csv', params = {}) => {
    try {
        const queryParams = { ...params, format };
        const queryString = new URLSearchParams(queryParams).toString();
        // blob response handling is specific, apiFetch handles json/text mainly.
        // If apiFetch doesn't support blob automatically, we might need a custom fetch here or extend apiFetch.
        // Checking apiFetch, it returns res.json() or res.text().
        // For blob download, we should probably stick to fetch directly or modify apiFetch.
        // For now, let's use direct fetch with auth header helper logic if possible, or try to use apiFetch as is.
        // It seems apiFetch doesn't support blob.
        // Let's implement a minimal fetch here.
        const token = localStorage.getItem("token");
        const fullUrl = getUrl(`/audit-logs/export?${queryString}`);
        const headers = { 'Content-Type': 'application/json' };
        if (token) headers.Authorization = `Bearer ${token}`;

        const response = await fetch(fullUrl, { headers });
        if (!response.ok) throw new Error('Export failed');
        return await response.blob();
    } catch (error) {
        console.error('Error exporting audit logs:', error);
        throw error;
    }
};

// ============================================
// BATCH INTEGRATION API
// ============================================

export const getAllBatches = async () => {
    try {
        // Base API is different for batches likely? Or is it under fee management? 
        // Original code used apiClient with base /api/fee-management, but then called /batches.
        // If it was apiClient.get('/batches'), it meant /api/fee-management/batches.
        return await apiFetch(getUrl('/batches'));
    } catch (error) {
        console.error('Error fetching batches:', error);
        throw error;
    }
};

export const getBatchesByCourse = async (courseId) => {
    try {
        return await apiFetch(getUrl(`/batches/course/${courseId}`));
    } catch (error) {
        console.error('Error fetching batches by course:', error);
        throw error;
    }
};

/**
 * Creates fee allocations in bulk for a list of users
 * @param {Object} bulkData { userIds: [], feeStructureId: number, discountIds: [], originalAmount: number, advancePayment: number }
 */
export const createBulkAllocation = async (bulkData) => {
    try {
        return await apiFetch(getUrl('/fee-allocations/bulk'), {
            method: 'POST',
            body: JSON.stringify(bulkData)
        });
    } catch (error) {
        console.error('Error creating bulk allocation:', error);
        throw error;
    }
};

// Legacy method adapter
export const createBatchFee = async (batchId, feeData) => {
    try {
        console.warn("createBatchFee is deprecated. Use createFee + createBulkAllocation.");
        throw new Error("createBatchFee is deprecated. Please use createFee structure.");
    } catch (error) {
        console.error('Error creating batch fee:', error);
        throw error;
    }
};

export const getBatchFees = async (batchId) => {
    try {
        // Original used baseURL: '/api' manually
        return await apiFetch(`/api/fee-structures/batch/${batchId}`);
    } catch (error) {
        console.error('Error fetching batch fees:', error);
        throw error;
    }
};

// ============================================
// STUDENTS API
// ============================================

export const getAllStudents = async () => {
    try {
        // Original used /api/fee-management/students (implicit base)
        return await apiFetch(getUrl('/students'));
    } catch (error) {
        console.error('Error fetching students:', error);
        throw error;
    }
};

export const getStudentById = async (studentId) => {
    try {
        return await apiFetch(getUrl(`/student/${studentId}`));
    } catch (error) {
        console.error('Error fetching student:', error);
        throw error;
    }
};

export const getStudentsByBatch = async (batchId) => {
    try {
        return await apiFetch(getUrl(`/batches/${batchId}/students`));
    } catch (error) {
        console.error('Error fetching students by batch:', error);
        throw error;
    }
};

// ============================================
// REFUNDS API
// ============================================

export const getAllRefunds = async () => {
    try {
        return await apiFetch(getUrl('/refunds'));
    } catch (error) {
        console.error('Error fetching refunds:', error);
        throw error;
    }
};

export const createRefund = async (refundData) => {
    try {
        return await apiFetch(getUrl('/refunds'), {
            method: 'POST',
            body: JSON.stringify(refundData)
        });
    } catch (error) {
        console.error('Error creating refund:', error);
        throw error;
    }
};

export const deleteRefund = async (refundId) => {
    try {
        return await apiFetch(getUrl(`/refunds/${refundId}`), {
            method: 'DELETE'
        });
    } catch (error) {
        console.error('Error deleting refund:', error);
        throw error;
    }
};

export const approveRefund = async (refundId, approvedBy) => {
    try {
        return await apiFetch(getUrl(`/refunds/${refundId}/approve?approvedBy=${approvedBy}`), {
            method: 'POST'
        });
    } catch (error) {
        console.error('Error approving refund:', error);
        throw error;
    }
};

export const rejectRefund = async (refundId, rejectedBy, reason) => {
    try {
        const queryParams = new URLSearchParams({ rejectedBy, reason }).toString();
        return await apiFetch(getUrl(`/refunds/${refundId}/reject?${queryParams}`), {
            method: 'POST'
        });
    } catch (error) {
        console.error('Error rejecting refund:', error);
        throw error;
    }
};

export const getRefundsByAllocationId = async (allocationId) => {
    try {
        return await apiFetch(getUrl(`/refunds/allocation/${allocationId}`));
    } catch (error) {
        console.error('Error fetching refunds by allocation:', error);
        throw error;
    }
};

// ============================================
// PAYMENTS API
// ============================================

export const getAllPayments = async () => {
    try {
        // Original used baseURL: '/api'
        return await apiFetch(getUrl('/payments'));
    } catch (error) {
        console.error('Error fetching payments:', error);
        throw error;
    }
};

export const getPaymentsByStudent = async (studentId) => {
    try {
        // Original used baseURL: '/api'
        return await apiFetch(getUrl(`/payments/history/${studentId}`));
    } catch (error) {
        console.error('Error fetching student payments:', error);
        throw error;
    }
};

export const createPayment = async (paymentData) => {
    try {
        // Original used baseURL: '/api'
        return await apiFetch(getUrl('/payments'), {
            method: 'POST',
            body: JSON.stringify(paymentData)
        });
    } catch (error) {
        console.error('Error creating payment:', error);
        throw error;
    }
};

export const recordManualPayment = async (params) => {
    try {
        // Original used baseURL: '/api' and params
        const queryParams = {
            ...params,
            manualDiscount: params.manualDiscount || 0
        };
        const queryString = new URLSearchParams(queryParams).toString();
        return await apiFetch(getUrl(`/payments/record-manual?${queryString}`), {
            method: 'POST'
        });
    } catch (error) {
        console.error('Error recording manual payment:', error);
        throw error;
    }
};

// ============================================
// INSTALLMENTS API
// ============================================

export const getAllInstallments = async () => {
    try {
        // Original used baseURL: '/api/installments'
        return await apiFetch(getUrl('/installments/overdue'));
    } catch (error) {
        console.error('Error fetching installments:', error);
        throw error;
    }
};

export const getStudentInstallments = async (allocationId) => {
    try {
        // Original used baseURL: '/api/installments'
        return await apiFetch(getUrl(`/installments/${allocationId}`));
    } catch (error) {
        console.error('Error fetching student installments:', error);
        throw error;
    }
};

export const createInstallmentPlan = async (allocationId, installments) => {
    try {
        // Original used baseURL: '/api/installments' and params allocationId
        return await apiFetch(getUrl(`/installments/student?allocationId=${allocationId}`), {
            method: 'POST',
            body: JSON.stringify(installments)
        });
    } catch (error) {
        console.error('Error creating installment plan:', error);
        throw error;
    }
};

export const overrideInstallmentPlan = async (allocationId, newPlans) => {
    try {
        // Original used baseURL: '/api/installments' and params
        return await apiFetch(getUrl(`/installments/override?allocationId=${allocationId}`), {
            method: 'POST',
            body: JSON.stringify(newPlans)
        });
    } catch (error) {
        console.error('Error overriding installment plan:', error);
        throw error;
    }
};

export const extendInstallmentDueDate = async (installmentId, newDueDate, reason) => {
    try {
        return await apiFetch(getUrl(`/installments/${installmentId}/extend`), {
            method: 'PUT',
            body: JSON.stringify({ newDueDate, reason })
        });
    } catch (error) {
        console.error('Error extending installment due date:', error);
        throw error;
    }
};

export const waiveLateFee = async (penaltyId, waivedBy) => {
    try {
        return await apiFetch(getUrl(`/penalties/waive/${penaltyId}?waivedBy=${waivedBy}`), {
            method: 'PUT'
        });
    } catch (error) {
        console.error('Error waiving late fee:', error);
        throw error;
    }
};

export const createBatchInstallmentPlan = async (batchId, template, userIds = [], totalAmount, courseId, advance, adminDiscount, additionalDiscount, gstRate) => {
    try {
        return await apiFetch(getUrl('/installments/batch'), {
            method: 'POST',
            body: JSON.stringify({
                batchId,
                template,
                userIds,
                totalAmount,
                courseId,
                advance,
                adminDiscount,
                additionalDiscount,
                gstRate
            })
        });
    } catch (error) {
        console.error('Error creating batch installment plan:', error);
        throw error;
    }
};

// ============================================
// FEE CREATION & STRUCTURE API
// ============================================

export const createFee = async (feeData) => {
    try {
        // Original used baseURL: '/api'
        return await apiFetch(getUrl('/fee-structures'), {
            method: 'POST',
            body: JSON.stringify(feeData)
        });
    } catch (error) {
        console.error('Error creating fee structure:', error);
        throw error;
    }
};

export const createFeeAllocation = async (allocationData) => {
    try {
        // Original used baseURL: '/api'
        return await apiFetch(getUrl('/fee-allocations'), {
            method: 'POST',
            body: JSON.stringify(allocationData)
        });
    } catch (error) {
        console.error('Error creating fee allocation:', error);
        throw error;
    }
};

export const getFeeAllocationsByBatch = async (batchId) => {
    try {
        // Original used baseURL: '/api'
        return await apiFetch(getUrl(`/fee-allocations/batch/${batchId}`));
    } catch (error) {
        console.error('Error fetching fee allocations by batch:', error);
        throw error;
    }
};

export const getAllFeeAllocations = async () => {
    try {
        // Original used baseURL: '/api'
        return await apiFetch(getUrl('/fee-allocations'));
    } catch (error) {
        console.error('Error fetching all fee allocations:', error);
        throw error;
    }
};

export const updateFeeAllocation = async (id, allocationData) => {
    try {
        // Original used baseURL: '/api'
        return await apiFetch(getUrl(`/fee-allocations/${id}`), {
            method: 'PUT',
            body: JSON.stringify(allocationData)
        });
    } catch (error) {
        console.error('Error updating fee allocation:', error);
        throw error;
    }
};

export const getStudentFee = async (userId) => {
    try {
        // Original used baseURL: '/api'
        return await apiFetch(getUrl(`/fee-allocations/user/${userId}`));
    } catch (error) {
        console.error('Error fetching student fee allocations:', error);
        throw error;
    }
};

export const getAllFeeStructures = async () => {
    try {
        // Original used baseURL: '/api'
        return await apiFetch(getUrl('/fee-structures'));
    } catch (error) {
        console.error('Error fetching all fee structures:', error);
        throw error;
    }
};

// ============================================
// DASHBOARD/REPORTS API
// ============================================

export const getDashboardStats = async () => {
    try {
        return await apiFetch(getUrl('/dashboard/stats'));
    } catch (error) {
        console.error('Error fetching dashboard stats:', error);
        throw error;
    }
};

export const getCollectionReport = async (params = {}) => {
    try {
        const queryString = new URLSearchParams(params).toString();
        const url = getUrl('/reports/collection') + (queryString ? `?${queryString}` : '');
        return await apiFetch(url);
    } catch (error) {
        console.error('Error fetching collection report:', error);
        throw error;
    }
};

export default {
    // Settings
    getFeeSettings,
    saveFeeSettings,

    // Fee Types
    getAllFeeTypes,
    getActiveFeeTypes,
    createFeeType,
    updateFeeType,
    deleteFeeType,

    // Audit Logs
    getAuditLogs,
    createAuditLog,
    exportAuditLogs,

    // Batches
    getAllBatches,
    getBatchesByCourse,
    createBatchFee,
    getBatchFees,

    // Students
    getAllStudents,
    getStudentById,
    getStudentsByBatch,

    // Refunds
    getAllRefunds,
    createRefund,
    deleteRefund,
    approveRefund,
    rejectRefund,
    getRefundsByAllocationId,

    // Payments
    getAllPayments,
    getPaymentsByStudent,
    createPayment,

    // Installments
    getAllInstallments,
    getStudentInstallments,
    createInstallmentPlan,
    waiveLateFee,

    // Fee Creation
    createFee,
    getStudentFee,
    createFeeAllocation,
    getAllFeeAllocations,
    getFeeAllocationsByBatch,
    updateFeeAllocation,
    recordManualPayment,

    // Dashboard
    getDashboardStats,
    getCollectionReport,
};
