import apiClient from './apiClient';

const ADMIN_API_URL = '/api/admin';
const AFFILIATE_API_URL = '/api/affiliates';
const PORTAL_API_URL = '/api/affiliate/me';

const affiliateService = {

  // === AFFILIATE MANAGEMENT ===

  createAffiliate: async (affiliateData) => {
    const response = await apiClient.post(`${ADMIN_API_URL}/affiliates`, affiliateData);
    return response.data;
  },

  getAllAffiliates: async () => {
    const response = await apiClient.get(`${ADMIN_API_URL}/affiliates`);
    return response.data;
  },

  getAffiliateMetrics: async (id) => {
    const response = await apiClient.get(`${AFFILIATE_API_URL}/metrics/${id}`);
    return response.data;
  },

  getAffiliateLinks: async (id) => {
    const response = await apiClient.get(`${AFFILIATE_API_URL}/links/${id}`);
    return response.data;
  },

  getAffiliateLeads: async (id) => {
    const response = await apiClient.get(`${AFFILIATE_API_URL}/leads/${id}`);
    return response.data;
  },

  getAffiliateDetails: async (id) => {
    const response = await apiClient.get(`${AFFILIATE_API_URL}/${id}`);
    return response.data;
  },

  generateLink: async (data) => {
    const response = await apiClient.post(`${ADMIN_API_URL}/affiliate-links`, data);
    return response.data;
  },

  getLinkDetails: async (code) => {
    const response = await apiClient.get(`${AFFILIATE_API_URL}/link/${code}`);
    return response.data;
  },

  // === LEAD MANAGEMENT ===

  getAllLeads: async () => {
    const response = await apiClient.get(`${ADMIN_API_URL}/leads`);
    return response.data;
  },

  submitLead: async (leadData) => {
    const response = await apiClient.post(`${AFFILIATE_API_URL}/lead`, leadData);
    return response.data;
  },

  updateLeadStatus: async (id, status, changedBy, reason) => {
    const response = await apiClient.post(`${ADMIN_API_URL}/leads/${id}/status`, { status, changedBy, reason });
    return response.data;
  },

  convertLead: async (id, studentId, batchPrice) => {
    const response = await apiClient.post(`${ADMIN_API_URL}/leads/${id}/convert`, { studentId, batchPrice });
    return response.data;
  },

  // === SALES & COMMISSION MANAGEMENT ===

  getAllSales: async () => {
    const response = await apiClient.get(`${ADMIN_API_URL}/sales`);
    return response.data;
  },

  approveSale: async (id, approvedBy) => {
    const response = await apiClient.post(`${ADMIN_API_URL}/sales/${id}/approve?approvedBy=${encodeURIComponent(approvedBy)}`);
    return response.data;
  },

  cancelSale: async (id, reason) => {
    const response = await apiClient.post(`${ADMIN_API_URL}/sales/${id}/cancel?reason=${encodeURIComponent(reason)}`);
    return response.data;
  },

  markSaleAsPaid: async (id, referenceId) => {
    const response = await apiClient.post(`${ADMIN_API_URL}/sales/${id}/pay?referenceId=${encodeURIComponent(referenceId)}`);
    return response.data;
  },

  // === WALLET MANAGEMENT ===

  getAllWallets: async () => {
    const response = await apiClient.get(`${ADMIN_API_URL}/wallets`);
    return response.data;
  },

  getWallet: async (affiliateId) => {
    const response = await apiClient.get(`${ADMIN_API_URL}/wallets/${affiliateId}`);
    return response.data;
  },

  getWalletTransactions: async (affiliateId) => {
    const response = await apiClient.get(`${ADMIN_API_URL}/wallets/${affiliateId}/transactions`);
    return response.data;
  },

  // === PORTAL (SESSION-BASED) ===

  getPortalWallet: async (userId) => {
    const response = await apiClient.get(`${PORTAL_API_URL}/wallet`, { params: { userId } });
    return response.data;
  },

  getPortalSales: async (userId) => {
    const response = await apiClient.get(`${PORTAL_API_URL}/sales`, { params: { userId } });
    return response.data;
  },

  getPortalTransactions: async (userId) => {
    const response = await apiClient.get(`${PORTAL_API_URL}/transactions`, { params: { userId } });
    return response.data;
  },

};

export default affiliateService;
