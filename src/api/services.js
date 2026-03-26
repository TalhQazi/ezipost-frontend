import apiService from './ezpost.api';

// Audit Logs API Service
export const auditLogsApi = {
  // Get all audit logs with filtering
  getAuditLogs: async (filters = {}) => {
    return apiService.get('/audit-logs', filters);
  },

  // Get audit log statistics
  getStats: async () => {
    return apiService.get('/audit-logs/stats');
  },

  // Create audit log entry
  createAuditLog: async (auditData) => {
    return apiService.post('/audit-logs', auditData);
  },

  // Get audit log by ID
  getAuditLogById: async (id) => {
    return apiService.get(`/audit-logs/${id}`);
  },

  // Delete audit log
  deleteAuditLog: async (id) => {
    return apiService.delete(`/audit-logs/${id}`);
  },

  // Search audit logs
  searchAuditLogs: async (searchTerm, filters = {}) => {
    return apiService.search('/audit-logs', searchTerm, filters);
  },

  // Get paginated audit logs
  getPaginatedAuditLogs: async (page = 1, limit = 50, filters = {}) => {
    return apiService.getPaginated('/audit-logs', page, limit, filters);
  }
};

// Escrow Accounts API Service
export const escrowAccountsApi = {
  // Get all escrow accounts
  getEscrowAccounts: async (filters = {}) => {
    return apiService.get('/escrow-accounts', filters);
  },

  // Get escrow account statistics
  getStats: async () => {
    return apiService.get('/escrow-accounts/stats');
  },

  // Create escrow account
  createEscrowAccount: async (accountData) => {
    return apiService.post('/escrow-accounts', accountData);
  },

  // Get escrow account by ID
  getEscrowAccountById: async (id) => {
    return apiService.get(`/escrow-accounts/${id}`);
  },

  // Update escrow account
  updateEscrowAccount: async (id, accountData) => {
    return apiService.put(`/escrow-accounts/${id}`, accountData);
  },

  // Update escrow balance
  updateBalance: async (id, balanceData) => {
    return apiService.patch(`/escrow-accounts/${id}/balance`, balanceData);
  },

  // Delete escrow account
  deleteEscrowAccount: async (id) => {
    return apiService.delete(`/escrow-accounts/${id}`);
  },

  // Search escrow accounts
  searchEscrowAccounts: async (searchTerm, filters = {}) => {
    return apiService.search('/escrow-accounts', searchTerm, filters);
  }
};

// Mail Processing API Service
export const mailProcessingApi = {
  // Get all mail processing records
  getMailProcessing: async (filters = {}) => {
    return apiService.get('/mail-processing', filters);
  },

  // Get mail processing statistics
  getStats: async () => {
    return apiService.get('/mail-processing/stats');
  },

  // Create mail processing record
  createMailProcessing: async (processingData) => {
    return apiService.post('/mail-processing', processingData);
  },

  // Get mail processing record by ID
  getMailProcessingById: async (id) => {
    return apiService.get(`/mail-processing/${id}`);
  },

  // Update mail processing record
  updateMailProcessing: async (id, processingData) => {
    return apiService.put(`/mail-processing/${id}`, processingData);
  },

  // Update processing step
  updateProcessingStep: async (id, stepData) => {
    return apiService.patch(`/mail-processing/${id}/step`, stepData);
  },

  // Add issue
  addIssue: async (id, issueData) => {
    return apiService.patch(`/mail-processing/${id}/issue`, issueData);
  },

  // Resolve issue
  resolveIssue: async (id, resolutionData) => {
    return apiService.patch(`/mail-processing/${id}/issue/resolve`, resolutionData);
  },

  // Upload document
  uploadDocument: async (id, documentData) => {
    return apiService.patch(`/mail-processing/${id}/document`, documentData);
  },

  // Delete mail processing record
  deleteMailProcessing: async (id) => {
    return apiService.delete(`/mail-processing/${id}`);
  },

  // Search mail processing records
  searchMailProcessing: async (searchTerm, filters = {}) => {
    return apiService.search('/mail-processing', searchTerm, filters);
  }
};

// Rate Configuration API Service
export const rateConfigApi = {
  // Get all rate configurations
  getRateConfigs: async (filters = {}) => {
    return apiService.get('/rate-config', filters);
  },

  // Calculate shipping rate
  calculateRate: async (rateData) => {
    return apiService.get('/rate-config/calculate', rateData);
  },

  // Get rate configuration statistics
  getStats: async () => {
    return apiService.get('/rate-config/stats');
  },

  // Create rate configuration
  createRateConfig: async (configData) => {
    return apiService.post('/rate-config', configData);
  },

  // Get rate configuration by ID
  getRateConfigById: async (id) => {
    return apiService.get(`/rate-config/${id}`);
  },

  // Update rate configuration
  updateRateConfig: async (id, configData) => {
    return apiService.put(`/rate-config/${id}`, configData);
  },

  // Clone rate configuration
  cloneRateConfig: async (id, cloneData) => {
    return apiService.post(`/rate-config/${id}/clone`, cloneData);
  },

  // Delete rate configuration
  deleteRateConfig: async (id) => {
    return apiService.delete(`/rate-config/${id}`);
  },

  // Search rate configurations
  searchRateConfigs: async (searchTerm, filters = {}) => {
    return apiService.search('/rate-config', searchTerm, filters);
  }
};

// Reports API Service
export const reportsApi = {
  // Get all reports
  getReports: async (filters = {}) => {
    return apiService.get('/reports', filters);
  },

  // Get report templates
  getTemplates: async () => {
    return apiService.get('/reports/templates');
  },

  // Get report statistics
  getStats: async () => {
    return apiService.get('/reports/stats');
  },

  // Create report
  createReport: async (reportData) => {
    return apiService.post('/reports', reportData);
  },

  // Get report by ID
  getReportById: async (id) => {
    return apiService.get(`/reports/${id}`);
  },

  // Update report
  updateReport: async (id, reportData) => {
    return apiService.put(`/reports/${id}`, reportData);
  },

  // Execute report
  executeReport: async (id) => {
    return apiService.post(`/reports/${id}/execute`);
  },

  // Delete report
  deleteReport: async (id) => {
    return apiService.delete(`/reports/${id}`);
  },

  // Search reports
  searchReports: async (searchTerm, filters = {}) => {
    return apiService.search('/reports', searchTerm, filters);
  }
};

// Transactions API Service
export const transactionsApi = {
  // Get all transactions
  getTransactions: async (filters = {}) => {
    return apiService.get('/transactions', filters);
  },

  // Get transaction statistics
  getStats: async () => {
    return apiService.get('/transactions/stats');
  },

  // Create transaction
  createTransaction: async (transactionData) => {
    return apiService.post('/transactions', transactionData);
  },

  // Get transaction by ID
  getTransactionById: async (id) => {
    return apiService.get(`/transactions/${id}`);
  },

  // Update transaction
  updateTransaction: async (id, transactionData) => {
    return apiService.put(`/transactions/${id}`, transactionData);
  },

  // Update transaction status
  updateStatus: async (id, statusData) => {
    return apiService.patch(`/transactions/${id}/status`, statusData);
  },

  // Process refund
  processRefund: async (id, refundData) => {
    return apiService.patch(`/transactions/${id}/refund`, refundData);
  },

  // Add fee
  addFee: async (id, feeData) => {
    return apiService.patch(`/transactions/${id}/fee`, feeData);
  },

  // Upload document
  uploadDocument: async (id, documentData) => {
    return apiService.patch(`/transactions/${id}/document`, documentData);
  },

  // Bulk update transactions
  bulkUpdate: async (bulkData) => {
    return apiService.patch('/transactions/bulk', bulkData);
  },

  // Delete transaction
  deleteTransaction: async (id) => {
    return apiService.delete(`/transactions/${id}`);
  },

  // Search transactions
  searchTransactions: async (searchTerm, filters = {}) => {
    return apiService.search('/transactions', searchTerm, filters);
  }
};

// Settings API Service
export const settingsApi = {
  // Get all settings
  getSettings: async (filters = {}) => {
    return apiService.get('/settings', filters);
  },

  // Get setting categories
  getCategories: async () => {
    return apiService.get('/settings/categories');
  },

  // Get setting by key
  getSettingByKey: async (category, key) => {
    return apiService.get(`/settings/${category}/${key}`);
  },

  // Create or update setting
  upsertSetting: async (category, key, settingData) => {
    return apiService.post(`/settings/${category}/${key}`, settingData);
  },

  // Update setting
  updateSetting: async (category, key, settingData) => {
    return apiService.put(`/settings/${category}/${key}`, settingData);
  },

  // Delete setting
  deleteSetting: async (category, key) => {
    return apiService.delete(`/settings/${category}/${key}`);
  },

  // Bulk update settings
  bulkUpdate: async (bulkData) => {
    return apiService.post('/settings/bulk', bulkData);
  },

  // Export settings
  exportSettings: async (filters = {}) => {
    return apiService.get('/settings/export', filters);
  },

  // Import settings
  importSettings: async (importData) => {
    return apiService.post('/settings/import', importData);
  },

  // Reset settings
  resetSettings: async (resetData) => {
    return apiService.post('/settings/reset', resetData);
  },

  // Validate setting
  validateSetting: async (validationData) => {
    return apiService.get('/settings/validate', validationData);
  },

  // Search settings
  searchSettings: async (searchTerm, filters = {}) => {
    return apiService.search('/settings', searchTerm, filters);
  }
};

// Mail API Service (existing)
export const mailApi = {
  // Get all mails
  getMails: async (filters = {}) => {
    return apiService.get('/mail', filters);
  },

  // Create mail
  createMail: async (mailData) => {
    return apiService.post('/mail', mailData);
  },

  // Delete mail
  deleteMail: async (id) => {
    return apiService.delete(`/mail/${id}`);
  },

  // Search mails
  searchMails: async (searchTerm, filters = {}) => {
    return apiService.search('/mail', searchTerm, filters);
  }
};

// Health check API
export const healthApi = {
  checkHealth: async () => {
    return apiService.get('/health');
  }
};

// Export all APIs
export default {
  auditLogs: auditLogsApi,
  escrowAccounts: escrowAccountsApi,
  mailProcessing: mailProcessingApi,
  rateConfig: rateConfigApi,
  reports: reportsApi,
  transactions: transactionsApi,
  settings: settingsApi,
  mail: mailApi,
  health: healthApi
};
