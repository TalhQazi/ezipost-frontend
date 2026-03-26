# Frontend API Integration Guide

## Overview

This guide shows how to integrate the Ezipost frontend with the backend API using the provided API services and React hooks.

## Quick Start

### 1. API Configuration

The base API service is configured in `src/api/ezpost.api.js`:

```javascript
const API_BASE_URL = 'http://localhost:5000/api';
```

Make sure your backend server is running on port 5000.

### 2. Import API Services

```javascript
import apiService, { 
  auditLogsApi, 
  escrowAccountsApi, 
  mailProcessingApi,
  rateConfigApi,
  reportsApi,
  transactionsApi,
  settingsApi,
  mailApi 
} from '../api/services';
```

### 3. Use React Hooks

```javascript
import { 
  useAuditLogs, 
  useEscrowAccounts, 
  useCreateEscrowAccount 
} from '../api/hooks';
```

## API Services Usage

### Basic API Calls

```javascript
// Get all audit logs
const logs = await auditLogsApi.getAuditLogs({ page: 1, limit: 50 });

// Create escrow account
const account = await escrowAccountsApi.createEscrowAccount({
  accountNumber: 'ACC123',
  accountName: 'Test Account',
  bankName: 'Test Bank',
  balance: 1000,
  currency: 'USD',
  createdBy: 'admin'
});

// Search transactions
const results = await transactionsApi.searchTransactions('payment', {
  status: 'completed'
});
```

### Using React Hooks

```javascript
function MyComponent() {
  // Get paginated audit logs with filters
  const {
    data: logsData,
    loading,
    error,
    page,
    pagination,
    nextPage,
    prevPage,
    goToPage,
    updateFilters
  } = useAuditLogs({
    severity: 'high',
    status: 'failure'
  });

  // Create new escrow account
  const { mutate: createAccount, loading: createLoading } = useCreateEscrowAccount();

  const handleCreateAccount = async (accountData) => {
    try {
      await createAccount(accountData);
      // Success handling
    } catch (error) {
      // Error handling
    }
  };

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div>
      {/* Render logs data */}
      {logsData?.logs?.map(log => (
        <div key={log._id}>{log.action}</div>
      ))}
      
      {/* Pagination controls */}
      <button onClick={prevPage} disabled={page === 1}>Previous</button>
      <span>Page {page} of {pagination?.pages}</span>
      <button onClick={nextPage} disabled={page >= pagination?.pages}>Next</button>
    </div>
  );
}
```

## Available Hooks

### Data Fetching Hooks

- `useAuditLogs(filters)` - Get paginated audit logs
- `useEscrowAccounts(filters)` - Get escrow accounts
- `useMailProcessing(filters)` - Get mail processing records
- `useRateConfigs(filters)` - Get rate configurations
- `useReports(filters)` - Get reports
- `useTransactions(filters)` - Get transactions
- `useSettings(filters)` - Get system settings
- `useMails(filters)` - Get mail records

### Statistics Hooks

- `useAuditLogsStats()` - Get audit log statistics
- `useEscrowAccountsStats()` - Get escrow account statistics
- `useMailProcessingStats()` - Get mail processing statistics
- `useRateConfigsStats()` - Get rate configuration statistics
- `useReportsStats()` - Get report statistics
- `useTransactionsStats()` - Get transaction statistics

### Search Hooks

- `useAuditLogsSearch(initialSearch)` - Search audit logs
- `useEscrowAccountsSearch(initialSearch)` - Search escrow accounts
- `useMailProcessingSearch(initialSearch)` - Search mail processing
- `useRateConfigsSearch(initialSearch)` - Search rate configs
- `useReportsSearch(initialSearch)` - Search reports
- `useTransactionsSearch(initialSearch)` - Search transactions
- `useSettingsSearch(initialSearch)` - Search settings

### Mutation Hooks

- `useCreateAuditLog()` - Create audit log
- `useCreateEscrowAccount()` - Create escrow account
- `useUpdateEscrowAccount()` - Update escrow account
- `useUpdateEscrowBalance()` - Update escrow balance
- `useCreateMailProcessing()` - Create mail processing
- `useUpdateProcessingStep()` - Update processing step
- `useAddIssue()` - Add issue to mail processing
- `useResolveIssue()` - Resolve issue
- `useCreateRateConfig()` - Create rate configuration
- `useUpdateRateConfig()` - Update rate configuration
- `useCloneRateConfig()` - Clone rate configuration
- `useCreateReport()` - Create report
- `useCreateTransaction()` - Create transaction
- `useUpdateTransactionStatus()` - Update transaction status
- `useProcessRefund()` - Process refund
- `useUpdateSetting()` - Update setting
- `useCreateMail()` - Create mail
- `useDeleteMail()` - Delete mail

## Pagination Hook

The `usePagination` hook provides a complete pagination solution:

```javascript
const {
  data,
  loading,
  error,
  page,
  limit,
  filters,
  pagination,
  nextPage,
  prevPage,
  goToPage,
  setLimit,
  updateFilters,
  refetch
} = usePagination(apiCall, initialPage, initialLimit, initialFilters);
```

## Search Hook

The `useSearch` hook provides search functionality:

```javascript
const {
  data,
  loading,
  error,
  searchTerm,
  filters,
  setSearchTerm,
  setFilters,
  search,
  clearSearch
} = useSearch(apiCall, initialSearch);
```

## Mutation Hook

The `useMutation` hook for create/update/delete operations:

```javascript
const { data, loading, error, mutate, reset } = useMutation(apiCall);

const handleSubmit = async () => {
  try {
    const result = await mutate(data);
    // Handle success
  } catch (error) {
    // Handle error
  }
};
```

## Error Handling

All hooks include built-in error handling:

```javascript
const { data, loading, error } = useAuditLogs();

if (error) {
  return (
    <div className="error-message">
      Error loading data: {error}
    </div>
  );
}
```

## Loading States

All hooks provide loading states:

```javascript
const { loading } = useAuditLogs();

if (loading) {
  return <div className="loading-spinner">Loading...</div>;
}
```

## Filter Examples

### Audit Logs Filters

```javascript
const filters = {
  search: 'login',
  severity: 'high',
  status: 'failure',
  startDate: '2024-01-01T00:00:00Z',
  endDate: '2024-01-31T23:59:59Z',
  userId: 'admin'
};
```

### Escrow Accounts Filters

```javascript
const filters = {
  search: 'test',
  status: 'active',
  accountType: 'business',
  currency: 'USD',
  minBalance: 1000,
  maxBalance: 50000
};
```

### Transactions Filters

```javascript
const filters = {
  search: 'payment',
  transactionType: 'payment',
  status: 'completed',
  paymentMethod: 'credit_card',
  minAmount: 100,
  maxAmount: 1000,
  startDate: '2024-01-01',
  endDate: '2024-01-31',
  hasEscrow: true
};
```

## Example Components

### Audit Logs Table

```javascript
import { useAuditLogs, useAuditLogsStats } from '../api/hooks';

function AuditLogsTable() {
  const {
    data: logsData,
    loading,
    error,
    page,
    pagination,
    nextPage,
    prevPage,
    goToPage,
    updateFilters
  } = useAuditLogs({ severity: 'high' });

  const { data: stats } = useAuditLogsStats();

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div>
      {/* Stats Cards */}
      <div className="stats-grid">
        <div>Total Logs: {stats?.totalLogs}</div>
        <div>Success: {stats?.successCount}</div>
        <div>Failures: {stats?.failureCount}</div>
      </div>

      {/* Logs Table */}
      <table>
        <thead>
          <tr>
            <th>Timestamp</th>
            <th>User</th>
            <th>Action</th>
            <th>Severity</th>
          </tr>
        </thead>
        <tbody>
          {logsData?.logs?.map(log => (
            <tr key={log._id}>
              <td>{new Date(log.timestamp).toLocaleString()}</td>
              <td>{log.userId}</td>
              <td>{log.action}</td>
              <td>{log.severity}</td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Pagination */}
      <div className="pagination">
        <button onClick={prevPage} disabled={page === 1}>Previous</button>
        <span>Page {page} of {pagination?.pages}</span>
        <button onClick={nextPage} disabled={page >= pagination?.pages}>Next</button>
      </div>
    </div>
  );
}
```

### Escrow Account Form

```javascript
import { useCreateEscrowAccount } from '../api/hooks';

function CreateEscrowAccountForm() {
  const { mutate: createAccount, loading, error } = useCreateEscrowAccount();
  const [formData, setFormData] = useState({
    accountNumber: '',
    accountName: '',
    bankName: '',
    balance: 0,
    currency: 'USD'
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await createAccount({
        ...formData,
        createdBy: 'admin'
      });
      // Reset form or show success message
    } catch (error) {
      // Handle error
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <input
        type="text"
        placeholder="Account Number"
        value={formData.accountNumber}
        onChange={(e) => setFormData({...formData, accountNumber: e.target.value})}
        required
      />
      <input
        type="text"
        placeholder="Account Name"
        value={formData.accountName}
        onChange={(e) => setFormData({...formData, accountName: e.target.value})}
        required
      />
      <input
        type="text"
        placeholder="Bank Name"
        value={formData.bankName}
        onChange={(e) => setFormData({...formData, bankName: e.target.value})}
        required
      />
      <input
        type="number"
        placeholder="Balance"
        value={formData.balance}
        onChange={(e) => setFormData({...formData, balance: parseFloat(e.target.value)})}
        required
      />
      <button type="submit" disabled={loading}>
        {loading ? 'Creating...' : 'Create Account'}
      </button>
      {error && <div className="error">Error: {error}</div>}
    </form>
  );
}
```

## Testing the API

### Health Check

```javascript
import { healthApi } from '../api/services';

// Test connection
const testConnection = async () => {
  try {
    const health = await healthApi.checkHealth();
    console.log('API is healthy:', health);
  } catch (error) {
    console.error('API connection failed:', error);
  }
};
```

### Test Data Fetching

```javascript
import { auditLogsApi } from '../api/services';

const testAuditLogs = async () => {
  try {
    const logs = await auditLogsApi.getAuditLogs({ page: 1, limit: 10 });
    console.log('Audit logs:', logs);
  } catch (error) {
    console.error('Error fetching audit logs:', error);
  }
};
```

## Best Practices

1. **Error Boundaries**: Wrap components in error boundaries to handle API errors gracefully
2. **Loading States**: Always show loading indicators during API calls
3. **Caching**: Implement caching for frequently accessed data
4. **Optimistic Updates**: Update UI optimistically for better user experience
5. **Retry Logic**: Implement retry logic for failed requests
6. **Debouncing**: Debounce search inputs to reduce API calls

## Troubleshooting

### Common Issues

1. **CORS Errors**: Ensure backend has CORS enabled
2. **Connection Refused**: Check if backend server is running
3. **404 Errors**: Verify API endpoints and URLs
4. **Authentication**: Add authentication headers if required
5. **Network Issues**: Check network connectivity

### Debug Tips

1. Use browser dev tools to inspect API requests
2. Check console for error messages
3. Verify API response format
4. Test endpoints with tools like Postman
5. Check backend server logs

## Next Steps

1. Add authentication to API calls
2. Implement real-time updates with WebSockets
3. Add data validation on frontend
4. Implement offline support
5. Add comprehensive error handling
6. Create reusable API components
