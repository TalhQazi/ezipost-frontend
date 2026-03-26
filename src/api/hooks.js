import { useState, useEffect, useCallback } from 'react';
import apiService, { auditLogsApi, escrowAccountsApi, mailProcessingApi, rateConfigApi, reportsApi, transactionsApi, settingsApi, mailApi, healthApi } from './services';

// Generic hook for API calls with loading and error states
export const useApi = (apiCall, dependencies = []) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const execute = useCallback(async (...args) => {
    try {
      setLoading(true);
      setError(null);
      const result = await apiCall(...args);
      setData(result);
      return result;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [apiCall]);

  useEffect(() => {
    if (typeof apiCall === 'function' && dependencies.length > 0) {
      execute();
    }
  }, dependencies);

  return { data, loading, error, execute, refetch: execute };
};

// Pagination hook
export const usePagination = (apiCall, initialPage = 1, initialLimit = 50) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(initialPage);
  const [limit, setLimit] = useState(initialLimit);
  const [filters, setFilters] = useState({});

  const fetchPage = useCallback(async (pageNum = page, pageLimit = limit, currentFilters = filters) => {
    try {
      setLoading(true);
      setError(null);
      const result = await apiCall(pageNum, pageLimit, currentFilters);
      setData(result);
      return result;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [apiCall, page, limit, filters]);

  const nextPage = useCallback(() => {
    if (data?.pagination && page < data.pagination.pages) {
      setPage(page + 1);
    }
  }, [data, page]);

  const prevPage = useCallback(() => {
    if (page > 1) {
      setPage(page - 1);
    }
  }, [page]);

  const goToPage = useCallback((pageNum) => {
    setPage(pageNum);
  }, []);

  const updateFilters = useCallback((newFilters) => {
    setFilters(newFilters);
    setPage(1); // Reset to first page when filters change
  }, []);

  useEffect(() => {
    fetchPage();
  }, [fetchPage]);

  return {
    data,
    loading,
    error,
    page,
    limit,
    filters,
    pagination: data?.pagination,
    nextPage,
    prevPage,
    goToPage,
    setLimit,
    updateFilters,
    refetch: fetchPage
  };
};

// Search hook
export const useSearch = (apiCall, initialSearch = '') => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState(initialSearch);
  const [filters, setFilters] = useState({});

  const search = useCallback(async (term = searchTerm, currentFilters = filters) => {
    try {
      setLoading(true);
      setError(null);
      const result = await apiCall(term, currentFilters);
      setData(result);
      return result;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [apiCall, searchTerm, filters]);

  useEffect(() => {
    if (searchTerm || Object.keys(filters).length > 0) {
      search();
    }
  }, [search]);

  return {
    data,
    loading,
    error,
    searchTerm,
    filters,
    setSearchTerm,
    setFilters,
    search,
    clearSearch: () => {
      setSearchTerm('');
      setFilters({});
      setData(null);
    }
  };
};

// Specific hooks for each API service

// Audit Logs Hooks
export const useAuditLogs = (filters = {}) => {
  return usePagination(
    (page, limit, currentFilters) => auditLogsApi.getPaginatedAuditLogs(page, limit, currentFilters),
    1,
    50,
    filters
  );
};

export const useAuditLogsStats = () => {
  return useApi(auditLogsApi.getStats);
};

export const useAuditLog = (id) => {
  return useApi(() => auditLogsApi.getAuditLogById(id), [id]);
};

export const useAuditLogsSearch = (initialSearch = '') => {
  return useSearch(auditLogsApi.searchAuditLogs, initialSearch);
};

// Escrow Accounts Hooks
export const useEscrowAccounts = (filters = {}) => {
  return usePagination(
    (page, limit, currentFilters) => escrowAccountsApi.getEscrowAccounts(currentFilters),
    1,
    50,
    filters
  );
};

export const useEscrowAccountsStats = () => {
  return useApi(escrowAccountsApi.getStats);
};

export const useEscrowAccount = (id) => {
  return useApi(() => escrowAccountsApi.getEscrowAccountById(id), [id]);
};

export const useEscrowAccountsSearch = (initialSearch = '') => {
  return useSearch(escrowAccountsApi.searchEscrowAccounts, initialSearch);
};

// Mail Processing Hooks
export const useMailProcessing = (filters = {}) => {
  return usePagination(
    (page, limit, currentFilters) => mailProcessingApi.getMailProcessing(currentFilters),
    1,
    50,
    filters
  );
};

export const useMailProcessingStats = () => {
  return useApi(mailProcessingApi.getStats);
};

export const useMailProcessingRecord = (id) => {
  return useApi(() => mailProcessingApi.getMailProcessingById(id), [id]);
};

export const useMailProcessingSearch = (initialSearch = '') => {
  return useSearch(mailProcessingApi.searchMailProcessing, initialSearch);
};

// Rate Configuration Hooks
export const useRateConfigs = (filters = {}) => {
  return usePagination(
    (page, limit, currentFilters) => rateConfigApi.getRateConfigs(currentFilters),
    1,
    50,
    filters
  );
};

export const useRateConfigsStats = () => {
  return useApi(rateConfigApi.getStats);
};

export const useRateConfig = (id) => {
  return useApi(() => rateConfigApi.getRateConfigById(id), [id]);
};

export const useRateConfigsSearch = (initialSearch = '') => {
  return useSearch(rateConfigApi.searchRateConfigs, initialSearch);
};

export const useRateCalculation = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const calculateRate = useCallback(async (rateData) => {
    try {
      setLoading(true);
      setError(null);
      const result = await rateConfigApi.calculateRate(rateData);
      setData(result);
      return result;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  return { data, loading, error, calculateRate };
};

// Reports Hooks
export const useReports = (filters = {}) => {
  return usePagination(
    (page, limit, currentFilters) => reportsApi.getReports(currentFilters),
    1,
    50,
    filters
  );
};

export const useReportsStats = () => {
  return useApi(reportsApi.getStats);
};

export const useReport = (id) => {
  return useApi(() => reportsApi.getReportById(id), [id]);
};

export const useReportTemplates = () => {
  return useApi(reportsApi.getTemplates);
};

export const useReportsSearch = (initialSearch = '') => {
  return useSearch(reportsApi.searchReports, initialSearch);
};

export const useReportExecution = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const executeReport = useCallback(async (id) => {
    try {
      setLoading(true);
      setError(null);
      const result = await reportsApi.executeReport(id);
      setData(result);
      return result;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  return { data, loading, error, executeReport };
};

// Transactions Hooks
export const useTransactions = (filters = {}) => {
  return usePagination(
    (page, limit, currentFilters) => transactionsApi.getTransactions(currentFilters),
    1,
    50,
    filters
  );
};

export const useTransactionsStats = () => {
  return useApi(transactionsApi.getStats);
};

export const useTransaction = (id) => {
  return useApi(() => transactionsApi.getTransactionById(id), [id]);
};

export const useTransactionsSearch = (initialSearch = '') => {
  return useSearch(transactionsApi.searchTransactions, initialSearch);
};

// Settings Hooks
export const useSettings = (filters = {}) => {
  return useApi(() => settingsApi.getSettings(filters), [JSON.stringify(filters)]);
};

export const useSettingCategories = () => {
  return useApi(settingsApi.getCategories);
};

export const useSetting = (category, key) => {
  return useApi(() => settingsApi.getSettingByKey(category, key), [category, key]);
};

export const useSettingsSearch = (initialSearch = '') => {
  return useSearch(settingsApi.searchSettings, initialSearch);
};

// Mail Hooks (existing)
export const useMails = (filters = {}) => {
  return useApi(() => mailApi.getMails(filters), [JSON.stringify(filters)]);
};

export const useMailsSearch = (initialSearch = '') => {
  return useSearch(mailApi.searchMails, initialSearch);
};

// Health Check Hook
export const useHealth = () => {
  return useApi(healthApi.checkHealth);
};

// Mutation hooks for create/update/delete operations
export const useMutation = (apiCall) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [data, setData] = useState(null);

  const mutate = useCallback(async (...args) => {
    try {
      setLoading(true);
      setError(null);
      const result = await apiCall(...args);
      setData(result);
      return result;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [apiCall]);

  const reset = useCallback(() => {
    setData(null);
    setError(null);
    setLoading(false);
  }, []);

  return { data, loading, error, mutate, reset };
};

// Specific mutation hooks
export const useCreateAuditLog = () => {
  return useMutation(auditLogsApi.createAuditLog);
};

export const useCreateEscrowAccount = () => {
  return useMutation(escrowAccountsApi.createEscrowAccount);
};

export const useUpdateEscrowAccount = () => {
  return useMutation((id, data) => escrowAccountsApi.updateEscrowAccount(id, data));
};

export const useUpdateEscrowBalance = () => {
  return useMutation((id, data) => escrowAccountsApi.updateBalance(id, data));
};

export const useCreateMailProcessing = () => {
  return useMutation(mailProcessingApi.createMailProcessing);
};

export const useUpdateProcessingStep = () => {
  return useMutation((id, data) => mailProcessingApi.updateProcessingStep(id, data));
};

export const useAddIssue = () => {
  return useMutation((id, data) => mailProcessingApi.addIssue(id, data));
};

export const useResolveIssue = () => {
  return useMutation((id, data) => mailProcessingApi.resolveIssue(id, data));
};

export const useCreateRateConfig = () => {
  return useMutation(rateConfigApi.createRateConfig);
};

export const useUpdateRateConfig = () => {
  return useMutation((id, data) => rateConfigApi.updateRateConfig(id, data));
};

export const useCloneRateConfig = () => {
  return useMutation((id, data) => rateConfigApi.cloneRateConfig(id, data));
};

export const useCreateReport = () => {
  return useMutation(reportsApi.createReport);
};

export const useCreateTransaction = () => {
  return useMutation(transactionsApi.createTransaction);
};

export const useUpdateTransactionStatus = () => {
  return useMutation((id, data) => transactionsApi.updateStatus(id, data));
};

export const useProcessRefund = () => {
  return useMutation((id, data) => transactionsApi.processRefund(id, data));
};

export const useUpdateSetting = () => {
  return useMutation((category, key, data) => settingsApi.updateSetting(category, key, data));
};

export const useCreateMail = () => {
  return useMutation(mailApi.createMail);
};

export const useDeleteMail = () => {
  return useMutation(mailApi.deleteMail);
};
