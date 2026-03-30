import { useState, useEffect, useMemo } from "react";
import {
  Landmark,
  BarChart3,
  ShieldAlert,
  BellRing,
  Wallet,
  Activity,
  Search,
  Plus,
  X,
  TrendingUp,
  Calendar,
  CreditCard,
  BarChart2,
  CheckCircle,
  ChevronRight,
  RefreshCw,
  Building2,
  Hash,
  Globe,
  Phone,
  Mail,
  AlertTriangle,
  BadgeCheck,
  Sparkles,
} from "lucide-react";
import { useDispatch, useSelector } from "react-redux";
import {
  fetchEscrowAccounts,
  fetchEscrowStats,
  updateEscrowBalance,
} from "../redux/escrowSlice";

// ─── HELPERS ──────────────────────────────────────────────────────────────────

const fmt = (n) =>
  Number(n || 0).toLocaleString("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
  });

const balancePct = (balance, min = 0, max = 50000) =>
  Math.min(100, Math.max(0, ((balance - min) / (max - min)) * 100));

// ─── STATUS BADGE ─────────────────────────────────────────────────────────────

const Badge = ({ status }) => {
  const cfg = {
    active: {
      cls: "bg-emerald-50 text-emerald-600 border-emerald-200",
      dot: "bg-emerald-500 animate-pulse",
      label: "Active",
    },
    inactive: {
      cls: "bg-slate-100 text-slate-500 border-slate-200",
      dot: "bg-slate-400",
      label: "Inactive",
    },
    suspended: {
      cls: "bg-yellow-50 text-yellow-600 border-yellow-200",
      dot: "bg-yellow-500",
      label: "Suspended",
    },
    frozen: {
      cls: "bg-blue-50 text-blue-600 border-blue-200",
      dot: "bg-blue-500",
      label: "Frozen",
    },
  }[status?.toLowerCase()] || {
    cls: "bg-slate-100 text-slate-500 border-slate-200",
    dot: "bg-slate-400",
    label: status,
  };

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border ${cfg.cls}`}
    >
      <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot}`} />
      {cfg.label}
    </span>
  );
};

// ─── ACCOUNT TYPE PILL ────────────────────────────────────────────────────────

const TypePill = ({ type }) => {
  const cfg =
    {
      checking: "bg-violet-50 text-violet-600 border-violet-200",
      savings: "bg-teal-50 text-teal-600 border-teal-200",
      business: "bg-indigo-50 text-indigo-600 border-indigo-200",
    }[type?.toLowerCase()] || "bg-slate-100 text-slate-500 border-slate-200";

  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-lg text-xs font-semibold border capitalize ${cfg}`}
    >
      {type}
    </span>
  );
};

// ─── ADD FUNDS MODAL ──────────────────────────────────────────────────────────

const AddFundsModal = ({ accounts, onClose, onAdd, updating }) => {
  const [accountId, setAccountId] = useState("");
  const [amount, setAmount] = useState("");
  const [reference, setReference] = useState("");
  const [success, setSuccess] = useState(false);
  const [addedAmount, setAddedAmount] = useState(0);
  const [addedAccount, setAddedAccount] = useState("");

  const handleSubmit = async () => {
    if (!accountId.trim() || !amount || isNaN(parseFloat(amount))) return;
    const result = await onAdd(
      accountId.trim(),
      parseFloat(amount),
      reference || "Manual credit"
    );
    if (result) {
      setAddedAmount(parseFloat(amount));
      setAddedAccount(accountId.trim());
      setSuccess(true);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-slate-900/50 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95 duration-200">

        {success ? (
          /* ── SUCCESS STATE ── */
          <div className="flex flex-col items-center justify-center px-8 py-12 text-center">
            {/* Animated checkmark circle */}
            <div className="relative mb-6">
              <div className="w-20 h-20 rounded-full bg-emerald-50 flex items-center justify-center">
                <div className="w-16 h-16 rounded-full bg-emerald-100 flex items-center justify-center">
                  <CheckCircle
                    size={40}
                    className="text-emerald-500"
                    strokeWidth={1.8}
                  />
                </div>
              </div>
              {/* Pulse rings */}
              <span className="absolute inset-0 rounded-full bg-emerald-200 opacity-30 animate-ping" />
            </div>

            <h2 className="text-2xl font-extrabold text-slate-900 mb-2">
              Funds Added!
            </h2>
            <p className="text-slate-500 text-sm leading-relaxed mb-1">
              <span className="font-bold text-slate-800">{fmt(addedAmount)}</span>{" "}
              has been successfully credited to
            </p>
            <p className="text-sm font-bold text-slate-700 bg-slate-100 rounded-xl px-4 py-2 mt-1 font-mono tracking-wide">
              {addedAccount}
            </p>

            {/* Divider */}
            <div className="w-full h-px bg-slate-100 my-6" />

            <div className="flex gap-3 w-full">
              <button
                onClick={() => {
                  setSuccess(false);
                  setAccountId("");
                  setAmount("");
                  setReference("");
                }}
                className="flex-1 py-3 border border-slate-200 text-slate-600 rounded-xl text-sm font-bold hover:bg-slate-50 transition"
              >
                Add Another
              </button>
              <button
                onClick={onClose}
                className="flex-1 py-3 bg-slate-900 hover:bg-slate-700 text-white rounded-xl text-sm font-bold transition"
              >
                Done
              </button>
            </div>
          </div>
        ) : (
          /* ── FORM STATE ── */
          <>
            {/* Header */}
            <div className="flex items-start justify-between px-7 pt-7 pb-5">
              <div>
                <h2 className="text-xl font-extrabold text-slate-900 leading-tight">
                  Add Funds to Escrow Account
                </h2>
                <p className="text-slate-400 text-sm mt-1">
                  Select an account and specify the amount to add
                </p>
              </div>
              <button
                onClick={onClose}
                className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center hover:bg-slate-200 transition flex-shrink-0 mt-0.5"
              >
                <X size={15} className="text-slate-500" />
              </button>
            </div>

            {/* Divider */}
            <div className="h-px bg-slate-100 mx-7" />

            {/* Form */}
            <div className="px-7 py-6 space-y-5">

              {/* Account Selection */}
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">
                  Select Account
                </label>
                <input
                  type="text"
                  value={accountId}
                  onChange={(e) => setAccountId(e.target.value)}
                  placeholder="Enter account number..."
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-semibold text-slate-800 outline-none focus:ring-2 focus:ring-slate-900 focus:border-transparent transition"
                />
              </div>

              {/* Amount */}
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">
                  Amount
                </label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-bold text-sm select-none">
                    $
                  </span>
                  <input
                    type="number"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    placeholder="Enter amount (e.g. 1000.00)"
                    min="0"
                    step="0.01"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-8 pr-4 py-3 text-sm font-semibold text-slate-800 placeholder-slate-300 outline-none focus:ring-2 focus:ring-slate-900 focus:border-transparent transition"
                  />
                </div>
              </div>

              {/* Reference Number */}
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">
                  Reference Number
                </label>
                <input
                  type="text"
                  value={reference}
                  onChange={(e) => setReference(e.target.value)}
                  placeholder="Payment reference"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-semibold text-slate-800 placeholder-slate-300 outline-none focus:ring-2 focus:ring-slate-900 focus:border-transparent transition"
                />
              </div>

              {/* Submit */}
              <button
                onClick={handleSubmit}
                disabled={updating || !accountId.trim() || !amount}
                className="w-full py-3.5 bg-slate-900 hover:bg-slate-700 disabled:bg-slate-300 disabled:cursor-not-allowed text-white rounded-xl font-extrabold text-sm transition flex items-center justify-center gap-2"
              >
                {updating ? (
                  <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <>
                    <Plus size={16} />
                    Add Funds
                  </>
                )}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

// ─── ACCOUNT CARD ─────────────────────────────────────────────────────────────

const AccountCard = ({ account }) => {
  const pct = balancePct(account.balance, account.minimumBalance || 0);
  const isLow =
    account.status === "suspended" ||
    account.balance <= (account.minimumBalance || 0) * 1.2;
  const barColor =
    account.status === "frozen"
      ? "bg-blue-400"
      : account.status === "suspended"
      ? "bg-yellow-400"
      : pct > 60
      ? "bg-emerald-500"
      : "bg-blue-500";

  return (
    <div
      className={`bg-white rounded-2xl border shadow-sm hover:shadow-lg transition-all duration-200 p-6 flex flex-col gap-4
      ${isLow ? "border-yellow-200" : "border-slate-100"}`}
    >
      {/* Top row */}
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <p className="text-base font-extrabold text-slate-900 tracking-tight truncate">
              {account.accountName}
            </p>
            <TypePill type={account.accountType} />
          </div>
          <p className="text-xs text-slate-400 mt-0.5 font-mono">
            {account.accountNumber}
          </p>
        </div>
        <Badge status={account.status} />
      </div>

      {/* Balance bar */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs text-slate-400 font-semibold uppercase tracking-wider">
            Balance
          </span>
          <span className="text-xl font-extrabold text-slate-900">
            {fmt(account.balance)}
          </span>
        </div>
        <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
          <div
            className={`h-full rounded-full transition-all duration-700 ${barColor}`}
            style={{ width: `${pct}%` }}
          />
        </div>
        <div className="flex justify-between mt-1.5">
          <p className="text-xs text-slate-400 font-medium">
            Min: {fmt(account.minimumBalance || 0)}
          </p>
          {account.maximumBalance && (
            <p className="text-xs text-slate-400 font-medium">
              Max: {fmt(account.maximumBalance)}
            </p>
          )}
        </div>
      </div>

      <div className="border-t border-slate-50" />

      {/* Info grid */}
      <div className="grid grid-cols-2 gap-3">
        <div className="bg-slate-50 rounded-xl p-3">
          <p className="text-xs text-slate-400 font-semibold mb-1 flex items-center gap-1.5">
            <Building2 size={11} /> Bank
          </p>
          <p className="text-sm font-extrabold text-slate-800 truncate">
            {account.bankName}
          </p>
        </div>
        <div className="bg-slate-50 rounded-xl p-3">
          <p className="text-xs text-slate-400 font-semibold mb-1 flex items-center gap-1.5">
            <Globe size={11} /> Currency
          </p>
          <p className="text-sm font-extrabold text-slate-800">
            {account.currency}
          </p>
        </div>
        {account.routingNumber && (
          <div className="bg-slate-50 rounded-xl p-3">
            <p className="text-xs text-slate-400 font-semibold mb-1 flex items-center gap-1.5">
              <Hash size={11} /> Routing No.
            </p>
            <p className="text-sm font-extrabold text-slate-800 font-mono">
              {account.routingNumber}
            </p>
          </div>
        )}
        {account.contactEmail && (
          <div className="bg-slate-50 rounded-xl p-3">
            <p className="text-xs text-slate-400 font-semibold mb-1 flex items-center gap-1.5">
              <Mail size={11} /> Contact
            </p>
            <p className="text-sm font-extrabold text-slate-800 truncate">
              {account.contactEmail}
            </p>
          </div>
        )}
        <div className="bg-slate-50 rounded-xl p-3">
          <p className="text-xs text-slate-400 font-semibold mb-1 flex items-center gap-1.5">
            <Calendar size={11} /> Created
          </p>
          <p className="text-sm font-extrabold text-slate-800">
            {new Date(account.createdAt).toLocaleDateString("en-US")}
          </p>
        </div>
        <div className="bg-slate-50 rounded-xl p-3">
          <p className="text-xs text-slate-400 font-semibold mb-1 flex items-center gap-1.5">
            <CreditCard size={11} /> Created By
          </p>
          <p className="text-sm font-extrabold text-slate-800 truncate">
            {account.createdBy}
          </p>
        </div>
      </div>

      {/* Notes */}
      {account.notes && (
        <p className="text-xs text-slate-400 font-medium bg-slate-50 rounded-xl px-3 py-2 border border-slate-100 leading-relaxed">
          {account.notes}
        </p>
      )}
    </div>
  );
};

// ─── MAIN PAGE ────────────────────────────────────────────────────────────────

const EscrowAccounts = () => {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatus] = useState("");
  const [showModal, setShowModal] = useState(false);

  const dispatch = useDispatch();
  const {
    accounts = [],
    stats = {},
    loading,
    updating,
  } = useSelector((state) => state.escrow);

  useEffect(() => {
    dispatch(fetchEscrowAccounts({ search, status: statusFilter }));
  }, [search, statusFilter, dispatch]);

  useEffect(() => {
    dispatch(fetchEscrowStats());
  }, [dispatch]);

  const handleRefresh = () => {
    dispatch(fetchEscrowAccounts({ search, status: statusFilter }));
    dispatch(fetchEscrowStats());
  };

  const handleAddFunds = async (id, amount, description) => {
    const result = await dispatch(
      updateEscrowBalance({
        id,
        balanceData: { amount, transactionType: "credit", description },
      })
    );
    if (updateEscrowBalance.fulfilled.match(result)) {
      dispatch(fetchEscrowStats());
      return true;
    }
    return false;
  };

  const lowBalAlerts = accounts.filter(
    (a) =>
      a.balance <= (a.minimumBalance || 0) * 1.2 && a.status === "active"
  ).length;
  const frozenCount = stats.frozenAccounts || 0;
  const suspendedCount = stats.suspendedAccounts || 0;

  const statCards = [
    {
      label: "Total Escrow Balance",
      value: fmt(stats.totalBalance || 0),
      sub: `Avg: ${fmt(stats.averageBalance || 0)}`,
      icon: Landmark,
      iconBg: "bg-blue-50",
      iconColor: "text-blue-500",
      subColor: "text-slate-400",
    },
    {
      label: "Active Accounts",
      value: String(stats.activeAccounts || 0),
      sub: `${stats.totalAccounts || 0} total accounts`,
      icon: BarChart3,
      iconBg: "bg-emerald-50",
      iconColor: "text-emerald-500",
      subColor: "text-emerald-500",
      subIcon: <TrendingUp size={12} />,
    },
    {
      label: "Low Balance Alerts",
      value: String(lowBalAlerts),
      sub: lowBalAlerts > 0 ? "Needs attention" : "All balances healthy",
      icon: BellRing,
      iconBg: "bg-yellow-50",
      iconColor: "text-yellow-500",
      subColor: lowBalAlerts > 0 ? "text-yellow-500" : "text-emerald-500",
    },
    {
      label: "Suspended / Frozen",
      value: String(suspendedCount + frozenCount),
      sub:
        suspendedCount + frozenCount > 0
          ? "Immediate action needed"
          : "No issues",
      icon: ShieldAlert,
      iconBg: "bg-red-50",
      iconColor: "text-red-500",
      subColor:
        suspendedCount + frozenCount > 0 ? "text-red-500" : "text-emerald-500",
    },
  ];

  const STATUS_TABS = [
    { label: "All", value: "" },
    { label: "Active", value: "active" },
    { label: "Inactive", value: "inactive" },
    { label: "Suspended", value: "suspended" },
    { label: "Frozen", value: "frozen" },
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
        <div className="flex items-center gap-3 self-start">

          <button
            onClick={() => setShowModal(true)}
            className="flex items-center gap-2 px-5 py-2.5 bg-slate-900 hover:bg-slate-700 text-white rounded-xl text-sm font-extrabold shadow-lg transition"
          >
            <Plus size={16} /> Add Funds
          </button>
        </div>
      </div>

      {/* ── STAT CARDS ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        {statCards.map((card, i) => {
          const Icon = card.icon;
          return (
            <div
              key={i}
              className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5 hover:shadow-md transition-shadow"
            >
              <div className="flex items-start justify-between mb-3">
                <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                  {card.label}
                </p>
                <div
                  className={`w-11 h-11 rounded-2xl ${card.iconBg} flex items-center justify-center`}
                >
                  <Icon size={22} className={card.iconColor} />
                </div>
              </div>
              <p className="text-2xl font-extrabold text-slate-900 leading-tight">
                {card.value}
              </p>
              <p
                className={`text-xs font-semibold mt-1.5 flex items-center gap-1 ${card.subColor}`}
              >
                {card.subIcon}
                {card.sub}
              </p>
            </div>
          );
        })}
      </div>

      {/* ── SEARCH & STATUS FILTER ── */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-4 flex flex-col gap-3">
        <div className="flex items-center gap-3 bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5">
          <Search size={16} className="text-slate-400 flex-shrink-0" />
          <input
            type="text"
            placeholder="Search by account number, name, or bank..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="flex-1 bg-transparent text-sm text-slate-700 placeholder-slate-400 outline-none font-medium"
          />
          {search && (
            <button
              onClick={() => setSearch("")}
              className="text-slate-300 hover:text-slate-500 transition"
            >
              <X size={15} />
            </button>
          )}
        </div>

        <div className="flex gap-2 flex-wrap">
          {STATUS_TABS.map((tab) => (
            <button
              key={tab.value}
              onClick={() => setStatus(tab.value)}
              className={`px-4 py-1.5 rounded-xl text-xs font-bold border transition
                ${
                  statusFilter === tab.value
                    ? "bg-slate-900 text-white border-slate-900 shadow-sm"
                    : "bg-slate-50 text-slate-500 border-slate-200 hover:bg-slate-100"
                }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* ── RESULTS COUNT ── */}
      {(search || statusFilter) && !loading && (
        <p className="text-xs text-slate-400 font-medium -mt-2 px-1">
          {accounts.length} result{accounts.length !== 1 ? "s" : ""}
          {search && (
            <>
              {" "}
              for{" "}
              <span className="font-bold text-slate-600">"{search}"</span>
            </>
          )}
        </p>
      )}

      {/* ── ACCOUNT GRID ── */}
      {loading ? (
        <div className="flex items-center justify-center py-20">
          <div className="flex flex-col items-center gap-3">
            <div className="w-8 h-8 border-4 border-slate-200 border-t-slate-700 rounded-full animate-spin" />
            <p className="text-sm text-slate-400 font-medium">
              Loading accounts...
            </p>
          </div>
        </div>
      ) : accounts.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm py-20 flex flex-col items-center gap-3">
          <div className="w-14 h-14 rounded-full bg-slate-100 flex items-center justify-center">
            <Search size={22} className="text-slate-300" />
          </div>
          <p className="font-bold text-slate-500">No accounts found</p>
          <p className="text-sm text-slate-400">
            Try adjusting your search or filter
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {accounts.map((account) => (
            <AccountCard key={account._id} account={account} />
          ))}
        </div>
      )}

      {/* ── ADD FUNDS MODAL ── */}
      {showModal && (
        <AddFundsModal
          accounts={accounts}
          updating={updating}
          onClose={() => setShowModal(false)}
          onAdd={handleAddFunds}
        />
      )}
    </div>
  );
};

export default EscrowAccounts;