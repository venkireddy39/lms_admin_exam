import apiClient from './apiClient';

// Base API Path for Admin Affiliate operations
const ADMIN_API_URL = '/api/admin';
const AFFILIATE_API_URL = '/api/affiliates';
const PORTAL_API_URL = '/api/affiliate/me';

const affiliateService = {
  // === AFFILIATE MANAGEMENT ===

  createAffiliate: async (affiliateData) => {
    try {
      const response = await apiClient.post(`${ADMIN_API_URL}/affiliates`, affiliateData);
      return response.data;
    } catch (error) {
      console.error('Error creating affiliate:', error);
      throw error;
    }
  },

  getAllAffiliates: async () => {
    try {
      const response = await apiClient.get(`${ADMIN_API_URL}/affiliates`);
      return response.data;
    } catch (error) {
      console.error('Error fetching affiliates:', error);
      throw error;
    }
  },

  getAffiliateMetrics: async (id) => {
    try {
      const response = await apiClient.get(`${AFFILIATE_API_URL}/metrics/${id}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching affiliate metrics:', error);
      throw error;
    }
  },

  getAffiliateLinks: async (id) => {
    try {
      const response = await apiClient.get(`${AFFILIATE_API_URL}/links/${id}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching affiliate links:', error);
      throw error;
    }
  },

  getAffiliateLeads: async (id) => {
    try {
      const response = await apiClient.get(`${AFFILIATE_API_URL}/leads/${id}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching affiliate leads:', error);
      throw error;
    }
  },

  getAffiliateDetails: async (id) => {
    try {
      const response = await apiClient.get(`${AFFILIATE_API_URL}/${id}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching affiliate details:', error);
      throw error;
    }
  },

  generateLink: async (data) => {
    try {
      const response = await apiClient.post(`${ADMIN_API_URL}/affiliate-links`, data);
      return response.data;
    } catch (error) {
      console.error('Error generating affiliate link:', error);
      throw error;
    }
  },

  getLinkDetails: async (code) => {
    try {
      const response = await apiClient.get(`${AFFILIATE_API_URL}/link/${code}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching link details:', error);
      throw error;
    }
  },

  // === LEAD MANAGEMENT ===

  getAllLeads: async () => {
    try {
      const response = await apiClient.get(`${ADMIN_API_URL}/leads`);
      return response.data;
    } catch (error) {
      console.error('Error fetching leads:', error);
      throw error;
    }
  },

  submitLead: async (leadData) => {
    try {
      const response = await apiClient.post(`${AFFILIATE_API_URL}/lead`, leadData);
      return response.data;
    } catch (error) {
      console.error('Error submitting lead:', error);
      throw error;
    }
  },

  updateLeadStatus: async (id, status, changedBy, reason) => {
    try {
      const response = await apiClient.post(`${ADMIN_API_URL}/leads/${id}/status`, { status, changedBy, reason });
      return response.data;
    } catch (error) {
      console.error('Error updating lead status:', error);
      throw error;
    }
  },

  convertLead: async (id, studentId, batchPrice) => {
    try {
      const response = await apiClient.post(`${ADMIN_API_URL}/leads/${id}/convert`, { studentId, batchPrice });
      return response.data;
    } catch (error) {
      console.error('Error converting lead:', error);
      throw error;
    }
  },

  // === SALES & COMMISSION MANAGEMENT ===

  getAllSales: async () => {
    try {
      const response = await apiClient.get(`${ADMIN_API_URL}/sales`);
      return response.data;
    } catch (error) {
      console.error('Error fetching sales:', error);
      throw error;
    }
  },

  approveSale: async (id, approvedBy) => {
    try {
      const response = await apiClient.post(`${ADMIN_API_URL}/sales/${id}/approve?approvedBy=${encodeURIComponent(approvedBy)}`);
      return response.data;
    } catch (error) {
      console.error('Error approving sale:', error);
      throw error;
    }
  },

  cancelSale: async (id, reason) => {
    try {
      const response = await apiClient.post(`${ADMIN_API_URL}/sales/${id}/cancel?reason=${encodeURIComponent(reason)}`);
      return response.data;
    } catch (error) {
      console.error('Error cancelling sale:', error);
      throw error;
    }
  },

  markSaleAsPaid: async (id, referenceId) => {
    try {
      const response = await apiClient.post(`${ADMIN_API_URL}/sales/${id}/pay?referenceId=${encodeURIComponent(referenceId)}`);
      return response.data;
    } catch (error) {
      console.error('Error marking sale as paid:', error);
      throw error;
    }
  },

  // === WALLET MANAGEMENT ===

  getAllWallets: async () => {
    try {
      const response = await apiClient.get(`${ADMIN_API_URL}/wallets`);
      return response.data;
    } catch (error) {
      console.error('Error fetching all wallets:', error);
      throw error;
    }
  },

  getWallet: async (affiliateId) => {
    try {
      const response = await apiClient.get(`${ADMIN_API_URL}/wallets/${affiliateId}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching wallet:', error);
      throw error;
    }
  },

  getWalletTransactions: async (affiliateId) => {
    try {
      const response = await apiClient.get(`${ADMIN_API_URL}/wallets/${affiliateId}/transactions`);
      return response.data;
    } catch (error) {
      console.error('Error fetching wallet transactions:', error);
      throw error;
    }
  },

  // === PORTAL (SESSION-BASED) ===

  getPortalWallet: async (userId) => {
    try {
      const response = await apiClient.get(`${PORTAL_API_URL}/wallet`, { params: { userId } });
      return response.data;
    } catch (error) {
      console.error('Error fetching portal wallet:', error);
      throw error;
    }
  },

  getPortalSales: async (userId) => {
    try {
      const response = await apiClient.get(`${PORTAL_API_URL}/sales`, { params: { userId } });
      return response.data;
    } catch (error) {
      console.error('Error fetching portal sales:', error);
      throw error;
    }
  },

  getPortalTransactions: async (userId) => {
    try {
      const response = await apiClient.get(`${PORTAL_API_URL}/transactions`, { params: { userId } });
      return response.data;
    } catch (error) {
      console.error('Error fetching portal transactions:', error);
      throw error;
    }
  },

};

export default affiliateService;
