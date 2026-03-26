import React, { useState, useEffect } from 'react';
import { healthApi, auditLogsApi, escrowAccountsApi } from '../api/services';

const ApiTest = () => {
  const [testResults, setTestResults] = useState({});
  const [loading, setLoading] = useState(false);

  const runTests = async () => {
    setLoading(true);
    const results = {};

    // Test 1: Health Check
    try {
      const health = await healthApi.checkHealth();
      results.health = { status: 'success', data: health };
    } catch (error) {
      results.health = { status: 'error', message: error.message };
    }

    // Test 2: Get Audit Logs
    try {
      const logs = await auditLogsApi.getAuditLogs({ page: 1, limit: 5 });
      results.auditLogs = { status: 'success', count: logs.logs?.length || 0 };
    } catch (error) {
      results.auditLogs = { status: 'error', message: error.message };
    }

    // Test 3: Get Audit Logs Stats
    try {
      const stats = await auditLogsApi.getStats();
      results.auditLogsStats = { status: 'success', data: stats };
    } catch (error) {
      results.auditLogsStats = { status: 'error', message: error.message };
    }

    // Test 4: Get Escrow Accounts
    try {
      const accounts = await escrowAccountsApi.getEscrowAccounts({ page: 1, limit: 5 });
      results.escrowAccounts = { status: 'success', count: accounts.accounts?.length || 0 };
    } catch (error) {
      results.escrowAccounts = { status: 'error', message: error.message };
    }

    // Test 5: Get Escrow Accounts Stats
    try {
      const stats = await escrowAccountsApi.getStats();
      results.escrowAccountsStats = { status: 'success', data: stats };
    } catch (error) {
      results.escrowAccountsStats = { status: 'error', message: error.message };
    }

    setTestResults(results);
    setLoading(false);
  };

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">API Connection Test</h1>
      
      <div className="mb-6">
        <button
          onClick={runTests}
          disabled={loading}
          className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
        >
          {loading ? 'Testing...' : 'Run API Tests'}
        </button>
      </div>

      {Object.keys(testResults).length > 0 && (
        <div className="space-y-4">
          <h2 className="text-xl font-semibold">Test Results</h2>
          
          {Object.entries(testResults).map(([testName, result]) => (
            <div key={testName} className="border rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-medium">{testName.replace(/([A-Z])/g, ' $1').trim()}</h3>
                <span className={`px-2 py-1 rounded text-sm ${
                  result.status === 'success' 
                    ? 'bg-green-100 text-green-800' 
                    : 'bg-red-100 text-red-800'
                }`}>
                  {result.status}
                </span>
              </div>
              
              {result.status === 'success' ? (
                <div className="text-sm text-gray-600">
                  {result.data ? (
                    <pre className="bg-gray-100 p-2 rounded overflow-x-auto">
                      {JSON.stringify(result.data, null, 2)}
                    </pre>
                  ) : (
                    <span>Count: {result.count}</span>
                  )}
                </div>
              ) : (
                <div className="text-sm text-red-600">
                  Error: {result.message}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      <div className="mt-8 p-4 bg-blue-50 rounded-lg">
        <h3 className="font-medium mb-2">API Endpoints Tested:</h3>
        <ul className="text-sm space-y-1">
          <li>• GET /health</li>
          <li>• GET /api/audit-logs</li>
          <li>• GET /api/audit-logs/stats</li>
          <li>• GET /api/escrow-accounts</li>
          <li>• GET /api/escrow-accounts/stats</li>
        </ul>
      </div>
    </div>
  );
};

export default ApiTest;
