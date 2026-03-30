import React from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

import AdminLayout from "./layout/AdminLayout";
import Dashboard from "./pages/Dashboard";
import AuditLog from "./pages/AuditLogs";
import EscrowAccounts from "./pages/EscrowAccounts";
import TransactionsTable from "./pages/TransactionTable";
import MailProcessing from "./pages/MailProcessing";
import RateConfig from "./pages/RateConfig";
import Reports from "./pages/Reports";
import Settings from "./pages/Settings";
import Login from "./pages/Login";
import Logout from "./pages/Logout";
import ProtectedRoute from "./layout/ProtectedRoute";
import './index.css';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* ✅ Default → Login */}
        <Route path="/" element={<Navigate to="/login" />} />

        {/* ✅ Login */}
        <Route path="/login" element={<Login />} />

        {/* ✅ Logout */}
        <Route path="/logout" element={<Logout />} />

        {/* ✅ Protected Admin Routes */}
        <Route
          path="/"
          element={
            <ProtectedRoute>
              <AdminLayout />
            </ProtectedRoute>
          }
        >
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="mail-processing" element={<MailProcessing />} />
          <Route path="escrow" element={<EscrowAccounts />} />
          <Route path="transactions" element={<TransactionsTable />} />
          <Route path="audit-logs" element={<AuditLog />} />
          <Route path="rate-configs" element={<RateConfig />} />
          <Route path="reports" element={<Reports />} />
          <Route path="settings" element={<Settings />} />
        </Route>

        <Route path="*" element={<Navigate to="/login" />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;


// import React from 'react';
// import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
// import 'react-toastify/dist/ReactToastify.css';
// import './index.css';
// import AdminLayout from './layout/AdminLayout';
// import Dashboard from './pages/Dashboard';
// import AuditLog from './pages/AuditLogs';
// import EscrowAccounts from './pages/EscrowAccounts';
// import TransactionsTable from './pages/TransactionTable';
// import MailProcessing from './pages/MailProcessing';
// import RateConfig from './pages/RateConfig';
// import Reports from './pages/Reports';
// import Settings from './pages/Settings';
// import Login from './pages/Login';
// import Logout from './pages/Logout';

// function App() {
//   return (
//     <BrowserRouter>
//       <Routes>
//         {/* ── AUTH ROUTES (outside AdminLayout) ── */}
//         <Route path="/login"  element={<Login />} />
//         <Route path="/logout" element={<Logout />} />

//         {/* ── ADMIN ROUTES ── */}
//         <Route path="/" element={<AdminLayout />}>
//           <Route index element={<Navigate to="/dashboard" replace />} />
//           <Route path="dashboard"       element={<Dashboard />} />
//           <Route path="mail-processing" element={<MailProcessing />} />
//           <Route path="escrow"          element={<EscrowAccounts />} />
//           <Route path="transactions"    element={<TransactionsTable />} />
//           <Route path="audit-logs"      element={<AuditLog />} />
//           <Route path="rate-configs"    element={<RateConfig />} />
//           <Route path="reports"         element={<Reports />} />
//           <Route path="settings"        element={<Settings />} />

//           {/* Coming soon fallback */}
//           <Route
//             path="*"
//             element={
//               <div className="p-8 text-center bg-white rounded-3xl shadow-sm border border-slate-100 min-h-[400px] flex flex-col items-center justify-center">
//                 <h2 className="text-2xl font-bold text-slate-800 mb-2 uppercase tracking-tight">
//                   Module Coming Soon
//                 </h2>
//                 <p className="text-slate-500">
//                   This feature is currently under active development. Check back later.
//                 </p>
//               </div>
//             }
//           />
//         </Route>
//       </Routes>
//     </BrowserRouter>
//   );
// }

// export default App;
