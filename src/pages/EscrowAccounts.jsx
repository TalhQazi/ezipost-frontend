import { useState, useMemo } from "react";
import {
  Landmark,
  BarChart3,
  ShieldAlert,
  BellRing,
  Wallet,
  Activity,
  AlertTriangle,
  TrendingDown,
  Search,
  Plus,
  X,
  TrendingUp,
  Calendar,
  CreditCard,
  BarChart2,
  CheckCircle,
  ChevronRight,
} from "lucide-react";

// ─── MOCK DATA ────────────────────────────────────────────────────────────────

const initialAccounts = [
  { id: "EA-005000", customer: "Enterprise Customer 001", balance: 15361.05, threshold: 5000, monthlyUsage: 5475.11, utilization: 26.3, lastActivity: "3/19/2026", transactions: 423, status: "Active" },
  { id: "EA-005001", customer: "Enterprise Customer 002", balance: 10268.84, threshold: 5000, monthlyUsage: 510.62,  utilization: 4.7,  lastActivity: "3/15/2026", transactions: 490, status: "Active" },
  { id: "EA-005002", customer: "Enterprise Customer 003", balance: 34877.46, threshold: 5000, monthlyUsage: 9800.00, utilization: 54.2, lastActivity: "3/20/2026", transactions: 812, status: "Active" },
  { id: "EA-005003", customer: "Enterprise Customer 004", balance: 11403.09, threshold: 5000, monthlyUsage: 2100.50, utilization: 18.4, lastActivity: "3/18/2026", transactions: 310, status: "Active" },
  { id: "EA-005004", customer: "Enterprise Customer 005", balance: 3200.00,  threshold: 5000, monthlyUsage: 4500.00, utilization: 78.1, lastActivity: "3/20/2026", transactions: 654, status: "Low Balance" },
  { id: "EA-005005", customer: "Enterprise Customer 006", balance: 67890.12, threshold: 5000, monthlyUsage: 12000.00,utilization: 35.6, lastActivity: "3/17/2026", transactions: 921, status: "Active" },
  { id: "EA-005006", customer: "Enterprise Customer 007", balance: 8100.75,  threshold: 5000, monthlyUsage: 1050.00, utilization: 9.1,  lastActivity: "3/14/2026", transactions: 145, status: "Active" },
  { id: "EA-005007", customer: "Enterprise Customer 008", balance: 22540.00, threshold: 5000, monthlyUsage: 6300.00, utilization: 41.8, lastActivity: "3/20/2026", transactions: 577, status: "Active" },
];

// ─── HELPERS ──────────────────────────────────────────────────────────────────

const fmt = (n) =>
  n.toLocaleString("en-US", { style: "currency", currency: "USD", minimumFractionDigits: 2 });

const balancePct = (balance, threshold, max = 50000) =>
  Math.min(100, (balance / max) * 100);

// ─── STATUS BADGE ─────────────────────────────────────────────────────────────

const Badge = ({ status }) => {
  const cfg = {
    Active:       "bg-emerald-50 text-emerald-600 border-emerald-200",
    "Low Balance":"bg-yellow-50 text-yellow-600 border-yellow-200",
    Inactive:     "bg-slate-100 text-slate-500 border-slate-200",
  }[status] || "bg-slate-100 text-slate-500 border-slate-200";

  return (
    <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border ${cfg}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${status === "Active" ? "bg-emerald-500 animate-pulse" : status === "Low Balance" ? "bg-yellow-500" : "bg-slate-400"}`}></span>
      {status}
    </span>
  );
};

// ─── ADD FUNDS MODAL ──────────────────────────────────────────────────────────

const AddFundsModal = ({ accounts, onClose, onAdd }) => {
  const [accountId, setAccountId] = useState(accounts[0]?.id || "");
  const [amount, setAmount]       = useState("1000.00");
  const [ref, setRef]             = useState("");
  const [loading, setLoading]     = useState(false);
  const [success, setSuccess]     = useState(false);

  const handleSubmit = () => {
    if (!accountId || !amount || isNaN(parseFloat(amount))) return;
    setLoading(true);
    setTimeout(() => {
      onAdd(accountId, parseFloat(amount));
      setSuccess(true);
      setTimeout(onClose, 1200);
    }, 800);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={onClose} />

      {/* Modal */}
      <div className="relative bg-white rounded-3xl shadow-2xl w-full max-w-md mx-4 overflow-hidden">
        {/* Top accent */}
        <div className="h-1 w-full bg-gradient-to-r from-emerald-400 via-blue-400 to-violet-400" />

        <div className="p-7">
          {/* Header */}
          <div className="flex items-start justify-between mb-6">
            <div>
              <h2 className="text-xl font-extrabold text-slate-900">Add Funds to Escrow Account</h2>
              <p className="text-slate-400 text-sm mt-1">Select an account and specify the amount to add</p>
            </div>
            <button onClick={onClose} className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center hover:bg-slate-200 transition">
              <X size={15} className="text-slate-500" />
            </button>
          </div>

          {success ? (
            <div className="flex flex-col items-center py-8 gap-3">
              <div className="w-16 h-16 rounded-full bg-emerald-50 flex items-center justify-center">
                <CheckCircle size={36} className="text-emerald-500" />
              </div>
              <p className="font-bold text-slate-800 text-lg">Funds Added Successfully!</p>
              <p className="text-slate-400 text-sm">{fmt(parseFloat(amount))} added to {accountId}</p>
            </div>
          ) : (
            <div className="space-y-5">
              {/* Account ID */}
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">Account ID</label>
                <div className="relative">
                  <select
                    value={accountId}
                    onChange={e => setAccountId(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-semibold text-slate-800 appearance-none outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                  >
                    {accounts.map(a => (
                      <option key={a.id} value={a.id}>{a.id} — {a.customer}</option>
                    ))}
                  </select>
                  <ChevronRight size={14} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 rotate-90 pointer-events-none" />
                </div>
              </div>

              {/* Amount */}
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">Amount</label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-bold text-sm">$</span>
                  <input
                    type="number"
                    value={amount}
                    onChange={e => setAmount(e.target.value)}
                    placeholder="1000.00"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-8 pr-4 py-3 text-sm font-semibold text-slate-800 outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                  />
                </div>
                {/* Quick amounts */}
                <div className="flex gap-2 mt-2">
                  {[500, 1000, 5000, 10000].map(v => (
                    <button
                      key={v}
                      onClick={() => setAmount(String(v))}
                      className={`flex-1 py-1.5 rounded-lg text-xs font-bold border transition
                        ${parseFloat(amount) === v ? "bg-slate-900 text-white border-slate-900" : "bg-slate-50 text-slate-500 border-slate-200 hover:bg-slate-100"}`}
                    >
                      ${v >= 1000 ? `${v/1000}k` : v}
                    </button>
                  ))}
                </div>
              </div>

              {/* Reference */}
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">Reference Number</label>
                <input
                  type="text"
                  value={ref}
                  onChange={e => setRef(e.target.value)}
                  placeholder="Payment reference"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-semibold text-slate-800 outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                />
              </div>

              {/* CTA */}
              <button
                onClick={handleSubmit}
                disabled={loading}
                className="w-full py-3.5 bg-slate-900 hover:bg-slate-700 text-white rounded-xl font-extrabold text-sm shadow-lg transition flex items-center justify-center gap-2 disabled:opacity-60"
              >
                {loading ? (
                  <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <><Plus size={16} /> Add Funds</>
                )}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// ─── ACCOUNT CARD ─────────────────────────────────────────────────────────────

const AccountCard = ({ account }) => {
  const pct = balancePct(account.balance, account.threshold);
  const isLow = account.status === "Low Balance";
  const barColor = isLow ? "bg-yellow-400" : pct > 60 ? "bg-emerald-500" : "bg-blue-500";

  return (
    <div className={`bg-white rounded-2xl border shadow-sm hover:shadow-lg transition-all duration-200 p-6 flex flex-col gap-4 group
      ${isLow ? "border-yellow-200" : "border-slate-100"}`}>

      {/* Top row */}
      <div className="flex items-start justify-between">
        <div>
          <p className="text-lg font-extrabold text-slate-900 tracking-tight">{account.id}</p>
          <p className="text-sm text-slate-400 mt-0.5 font-medium">{account.customer}</p>
        </div>
        <Badge status={account.status} />
      </div>

      {/* Balance */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs text-slate-400 font-semibold uppercase tracking-wider">Balance</span>
          <span className="text-xl font-extrabold text-slate-900">{fmt(account.balance)}</span>
        </div>

        {/* Progress bar */}
        <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
          <div
            className={`h-full rounded-full transition-all duration-700 ${barColor}`}
            style={{ width: `${pct}%` }}
          />
        </div>
        <p className="text-xs text-slate-400 mt-1.5 font-medium">Threshold: {fmt(account.threshold)}</p>
      </div>

      {/* Divider */}
      <div className="border-t border-slate-50" />

      {/* Stats grid */}
      <div className="grid grid-cols-2 gap-3">
        <div className="bg-slate-50 rounded-xl p-3">
          <p className="text-xs text-slate-400 font-semibold mb-1 flex items-center gap-1.5">
            <BarChart2 size={11} /> Monthly Usage
          </p>
          <p className="text-sm font-extrabold text-slate-800">{fmt(account.monthlyUsage)}</p>
        </div>
        <div className="bg-slate-50 rounded-xl p-3">
          <p className="text-xs text-slate-400 font-semibold mb-1 flex items-center gap-1.5">
            <Activity size={11} /> Utilization
          </p>
          <p className={`text-sm font-extrabold ${account.utilization > 60 ? "text-yellow-600" : "text-slate-800"}`}>
            {account.utilization}%
          </p>
        </div>
        <div className="bg-slate-50 rounded-xl p-3">
          <p className="text-xs text-slate-400 font-semibold mb-1 flex items-center gap-1.5">
            <Calendar size={11} /> Last Activity
          </p>
          <p className="text-sm font-extrabold text-slate-800">{account.lastActivity}</p>
        </div>
        <div className="bg-slate-50 rounded-xl p-3">
          <p className="text-xs text-slate-400 font-semibold mb-1 flex items-center gap-1.5">
            <CreditCard size={11} /> Transactions
          </p>
          <p className="text-sm font-extrabold text-slate-800">{account.transactions.toLocaleString()}</p>
        </div>
      </div>
    </div>
  );
};

// ─── MAIN PAGE ────────────────────────────────────────────────────────────────

const EscrowAccounts = () => {
  const [accounts, setAccounts]     = useState(initialAccounts);
  const [search, setSearch]         = useState("");
  const [showModal, setShowModal]   = useState(false);

  const totalBalance   = accounts.reduce((s, a) => s + a.balance, 0);
  const monthlyUsage   = accounts.reduce((s, a) => s + a.monthlyUsage, 0);
  const lowBalAlerts   = accounts.filter(a => a.status === "Low Balance").length;
  const criticalAccts  = accounts.filter(a => a.balance < a.threshold * 0.5).length;

  const filtered = useMemo(() =>
    accounts.filter(a =>
      a.id.toLowerCase().includes(search.toLowerCase()) ||
      a.customer.toLowerCase().includes(search.toLowerCase())
    ), [accounts, search]);

  const handleAddFunds = (id, amount) => {
    setAccounts(prev =>
      prev.map(a =>
        a.id === id
          ? { ...a, balance: a.balance + amount, status: a.balance + amount >= a.threshold ? "Active" : a.status }
          : a
      )
    );
  };

  const statCards = [
    {
      label: "Total Escrow Balance",
      value: fmt(totalBalance),
      sub: "Across all accounts",
      icon: Landmark,
      iconBg: "bg-blue-50",
      iconColor: "text-blue-500",
      subColor: "text-slate-400",
    },
    {
      label: "Monthly Usage",
      value: fmt(monthlyUsage),
      sub: "+15.3% vs last month",
      icon: BarChart3,
      iconBg: "bg-emerald-50",
      iconColor: "text-emerald-500",
      subColor: "text-emerald-500",
      subIcon: <TrendingUp size={12} />,
    },
    {
      label: "Low Balance Alerts",
      value: lowBalAlerts.toString(),
      sub: lowBalAlerts > 0 ? "Needs attention" : "All accounts healthy",
      icon: BellRing,
      iconBg: "bg-yellow-50",
      iconColor: "text-yellow-500",
      subColor: lowBalAlerts > 0 ? "text-yellow-500" : "text-emerald-500",
    },
    {
      label: "Critical Accounts",
      value: criticalAccts.toString(),
      sub: criticalAccts > 0 ? "Immediate action" : "No critical accounts",
      icon: ShieldAlert,
      iconBg: "bg-red-50",
      iconColor: "text-red-500",
      subColor: criticalAccts > 0 ? "text-red-500" : "text-emerald-500",
    },
  ];

  return (
    <div className="min-h-screen bg-slate-50 p-6 space-y-6">

      {/* ── HEADER ── */}
      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">
            Escrow Account Management
          </h1>
          <p className="text-slate-400 text-sm mt-1 font-medium">
            Monitor and manage customer escrow accounts
          </p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="flex items-center gap-2 px-5 py-2.5 bg-slate-900 hover:bg-slate-700 text-white rounded-xl text-sm font-extrabold shadow-lg transition self-start"
        >
          <Plus size={16} /> Add Funds
        </button>
      </div>

      {/* ── STAT CARDS ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        {statCards.map((card, i) => {
          const Icon = card.icon;
          return (
            <div key={i} className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5 hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between mb-3">
                <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">{card.label}</p>
                <div className={`w-11 h-11 rounded-2xl ${card.iconBg} flex items-center justify-center`}>
                  <Icon size={22} className={card.iconColor} />
                </div>
              </div>
              <p className="text-2xl font-extrabold text-slate-900 leading-tight">{card.value}</p>
              <p className={`text-xs font-semibold mt-1.5 flex items-center gap-1 ${card.subColor}`}>
                {card.subIcon}{card.sub}
              </p>
            </div>
          );
        })}
      </div>

      {/* ── SEARCH ── */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm px-5 py-3.5 flex items-center gap-3">
        <Search size={16} className="text-slate-400 flex-shrink-0" />
        <input
          type="text"
          placeholder="Search by account ID or customer name..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="flex-1 bg-transparent text-sm text-slate-700 placeholder-slate-400 outline-none font-medium"
        />
        {search && (
          <button onClick={() => setSearch("")} className="text-slate-300 hover:text-slate-500 transition">
            <X size={15} />
          </button>
        )}
      </div>

      {/* ── RESULTS COUNT ── */}
      {search && (
        <p className="text-xs text-slate-400 font-medium -mt-2 px-1">
          {filtered.length} result{filtered.length !== 1 ? "s" : ""} for <span className="font-bold text-slate-600">"{search}"</span>
        </p>
      )}

      {/* ── ACCOUNT GRID ── */}
      {filtered.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm py-20 flex flex-col items-center gap-3">
          <div className="w-14 h-14 rounded-full bg-slate-100 flex items-center justify-center">
            <Search size={22} className="text-slate-300" />
          </div>
          <p className="font-bold text-slate-500">No accounts found</p>
          <p className="text-sm text-slate-400">Try a different search term</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {filtered.map(account => (
            <AccountCard key={account.id} account={account} />
          ))}
        </div>
      )}

      {/* ── MODAL ── */}
      {showModal && (
        <AddFundsModal
          accounts={accounts}
          onClose={() => setShowModal(false)}
          onAdd={handleAddFunds}
        />
      )}
    </div>
  );
};

export default EscrowAccounts;