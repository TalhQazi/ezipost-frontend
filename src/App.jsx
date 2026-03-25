import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import 'react-toastify/dist/ReactToastify.css';
import './index.css';
import AdminLayout from './layout/AdminLayout';
import Dashboard from './pages/Dashboard';
// import BankManagement from './components/BankManagement';
import AuditLog from './pages/AuditLogs';
import EscrowAccounts from './pages/EscrowAccounts';
import TransactionsTable from './pages/TransactionTable';
import MailProcessing from './pages/MailProcessing';
import RateConfig from './pages/RateConfig';
import Reports from './pages/Reports';
import Settings from './pages/Settings';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Main Admin Route */}
        <Route path="/" element={<AdminLayout />}>
          <Route index element={<Navigate to="/dashboard" replace />} />
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="mail-processing" element={<MailProcessing />} />
          {/* <Route path="bank" element={<BankManagement />} /> */}
          <Route path="escrow" element={<EscrowAccounts />} />
          <Route path="transactions" element={<TransactionsTable />} />
          <Route path="audit-logs" element={<AuditLog />} />
          <Route path="rate-configs" element={<RateConfig/>}/>
          <Route path='reports' element={<Reports/>} />
          <Route path='settings' element={<Settings/>}/>
          
          {/* Placeholder routes for menu items */}
          <Route path="*" element={
            <div className="p-8 text-center bg-white rounded-3xl shadow-sm border border-slate-100 min-h-[400px] flex flex-col items-center justify-center">
              <h2 className="text-2xl font-bold text-slate-800 mb-2 uppercase tracking-tight">Module Coming Soon</h2>
              <p className="text-slate-500">This feature is currently under active development. Check back later.</p>
            </div>
          } />
        </Route>

        {/* Auth routes (simulated) */}
        <Route path="/login" element={
          <div className="min-h-screen flex items-center justify-center bg-slate-50">
            <div className="bg-white p-8 rounded-3xl shadow-xl border border-slate-200 w-full max-w-md">
                <h1 className="text-2xl font-bold text-center text-primary mb-6">EzPost® Login</h1>
                <button 
                  onClick={() => window.location.href = '/dashboard'}
                  className="w-full bg-primary text-white p-3 rounded-xl font-bold shadow-lg shadow-primary/20"
                >
                  SIMULATE LOGIN
                </button>
            </div>
          </div>
        } />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
