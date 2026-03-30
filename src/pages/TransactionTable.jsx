import { useState, useMemo, useEffect, useCallback, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  fetchTransactions,
  fetchTransactionStats,
  updateTransactionStatus,
  processRefund,
  deleteTransaction,
  bulkUpdateTransactions,
} from "../redux/transactionsSlice";
import {
  Search, Download, Filter, ChevronDown, X, ArrowUpRight,
  ArrowDownLeft, RefreshCw, AlertCircle, Hash, TrendingUp,
  CheckCircle, Clock, Trash2, MoreHorizontal, Eye, Ban,
  RotateCcw, ChevronLeft, ChevronRight, ChevronsLeft,
  ChevronsRight, AlertTriangle, Loader2, Calendar, DollarSign,
  SlidersHorizontal, CheckSquare, Square, Minus,
} from "lucide-react";

// ─── CONSTANTS ────────────────────────────────────────────────────────────────
const TYPE_OPTIONS = [
  { label: "All Types",           value: "" },
  { label: "Payment",             value: "payment" },
  { label: "Refund",              value: "refund" },
  { label: "Escrow Deposit",      value: "escrow_deposit" },
  { label: "Escrow Withdrawal",   value: "escrow_withdrawal" },
  { label: "Fee",                 value: "fee" },
  { label: "Penalty",             value: "penalty" },
  { label: "Adjustment",          value: "adjustment" },
];

const STATUS_OPTIONS = [
  { label: "All Statuses",  value: "" },
  { label: "Pending",       value: "pending" },
  { label: "Processing",    value: "processing" },
  { label: "Completed",     value: "completed" },
  { label: "Failed",        value: "failed" },
  { label: "Cancelled",     value: "cancelled" },
  { label: "Refunded",      value: "refunded" },
];

const PRIORITY_OPTIONS = [
  { label: "All Priorities", value: "" },
  { label: "Low",            value: "low" },
  { label: "Medium",         value: "medium" },
  { label: "High",           value: "high" },
  { label: "Urgent",         value: "urgent" },
];

const PAYMENT_METHOD_OPTIONS = [
  { label: "All Methods",     value: "" },
  { label: "Credit Card",     value: "credit_card" },
  { label: "Debit Card",      value: "debit_card" },
  { label: "Bank Transfer",   value: "bank_transfer" },
  { label: "PayPal",          value: "paypal" },
  { label: "Stripe",          value: "stripe" },
  { label: "Cash",            value: "cash" },
  { label: "Check",           value: "check" },
];

const CURRENCY_OPTIONS = [
  { label: "All Currencies", value: "" },
  { label: "USD",            value: "USD" },
  { label: "EUR",            value: "EUR" },
  { label: "GBP",            value: "GBP" },
  { label: "CAD",            value: "CAD" },
];

const LIMITS = [10, 25, 50, 100];

// ─── HELPERS ──────────────────────────────────────────────────────────────────
const fmt = (n) =>
  Number(n || 0).toLocaleString("en-US", {
    style: "currency", currency: "USD", minimumFractionDigits: 2,
  });

const fmtDate = (d) => {
  if (!d) return "—";
  return new Date(d).toLocaleString("en-US", {
    month: "short", day: "numeric", year: "numeric",
    hour: "2-digit", minute: "2-digit",
  });
};

const useDebounce = (value, delay = 400) => {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const t = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(t);
  }, [value, delay]);
  return debounced;
};

// ─── TYPE BADGE ───────────────────────────────────────────────────────────────
const TYPE_CFG = {
  payment:            { bg: "bg-blue-50",     text: "text-blue-700",    border: "border-blue-200",    icon: ArrowUpRight },
  refund:             { bg: "bg-emerald-50",  text: "text-emerald-700", border: "border-emerald-200", icon: ArrowDownLeft },
  escrow_deposit:     { bg: "bg-violet-50",   text: "text-violet-700",  border: "border-violet-200",  icon: ArrowDownLeft },
  escrow_withdrawal:  { bg: "bg-orange-50",   text: "text-orange-700",  border: "border-orange-200",  icon: ArrowUpRight },
  fee:                { bg: "bg-purple-50",   text: "text-purple-700",  border: "border-purple-200",  icon: Hash },
  penalty:            { bg: "bg-red-50",      text: "text-red-700",     border: "border-red-200",     icon: AlertCircle },
  adjustment:         { bg: "bg-amber-50",    text: "text-amber-700",   border: "border-amber-200",   icon: RefreshCw },
};

const TypeBadge = ({ type }) => {
  const cfg = TYPE_CFG[type] || { bg: "bg-slate-50", text: "text-slate-500", border: "border-slate-200", icon: Hash };
  const Icon = cfg.icon;
  const label = (TYPE_OPTIONS.find(o => o.value === type)?.label || type || "—").replace(/_/g, " ");
  return (
    <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold border ${cfg.bg} ${cfg.text} ${cfg.border} whitespace-nowrap`}>
      <Icon size={10} /> {label}
    </span>
  );
};

// ─── STATUS BADGE ─────────────────────────────────────────────────────────────
const STATUS_CFG = {
  completed:  { dot: "bg-emerald-400", bg: "bg-emerald-50",  text: "text-emerald-700", border: "border-emerald-200" },
  pending:    { dot: "bg-amber-400",   bg: "bg-amber-50",    text: "text-amber-700",   border: "border-amber-200" },
  processing: { dot: "bg-blue-400",    bg: "bg-blue-50",     text: "text-blue-700",    border: "border-blue-200" },
  failed:     { dot: "bg-red-400",     bg: "bg-red-50",      text: "text-red-700",     border: "border-red-200" },
  cancelled:  { dot: "bg-slate-400",   bg: "bg-slate-50",    text: "text-slate-600",   border: "border-slate-200" },
  refunded:   { dot: "bg-violet-400",  bg: "bg-violet-50",   text: "text-violet-700",  border: "border-violet-200" },
};

const StatusBadge = ({ status }) => {
  const cfg = STATUS_CFG[status] || STATUS_CFG.pending;
  const label = STATUS_OPTIONS.find(o => o.value === status)?.label || status || "—";
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold border ${cfg.bg} ${cfg.text} ${cfg.border} whitespace-nowrap`}>
      <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot}`} />
      {label}
    </span>
  );
};

// ─── PRIORITY BADGE ───────────────────────────────────────────────────────────
const PRIORITY_CFG = {
  low:    "text-slate-400",
  medium: "text-blue-500",
  high:   "text-orange-500",
  urgent: "text-red-600",
};
const PriorityDot = ({ priority }) => (
  <span className={`text-xs font-bold uppercase tracking-widest ${PRIORITY_CFG[priority] || "text-slate-400"}`}>
    {priority || "—"}
  </span>
);

// ─── DROPDOWN ─────────────────────────────────────────────────────────────────
const Dropdown = ({ value, onChange, options, placeholder, icon: Icon, className = "" }) => {
  const [open, setOpen] = useState(false);
  const ref = useRef();
  const selected = options.find(o => o.value === value);

  useEffect(() => {
    const handler = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  return (
    <div ref={ref} className={`relative ${className}`}>
      <button
        onClick={() => setOpen(o => !o)}
        className="flex items-center gap-2 px-3.5 py-2 bg-white border border-slate-200 rounded-xl text-sm font-semibold text-slate-700 hover:bg-slate-50 hover:border-slate-300 transition-all min-w-[150px] justify-between shadow-sm"
      >
        <div className="flex items-center gap-2 truncate">
          {Icon && <Icon size={14} className="text-slate-400 flex-shrink-0" />}
          <span className="truncate">{selected?.label || placeholder}</span>
        </div>
        <ChevronDown size={13} className={`text-slate-400 transition-transform flex-shrink-0 ${open ? "rotate-180" : ""}`} />
      </button>
      {open && (
        <div className="absolute left-0 mt-2 w-52 bg-white border border-slate-200 rounded-xl shadow-2xl z-50 overflow-hidden">
          {options.map(o => (
            <button
              key={o.value}
              onClick={() => { onChange(o.value); setOpen(false); }}
              className={`w-full text-left px-4 py-2.5 text-sm font-medium transition flex items-center justify-between hover:bg-slate-50
                ${value === o.value ? "bg-slate-50 text-slate-900 font-bold" : "text-slate-600"}`}
            >
              {o.label}
              {value === o.value && <CheckCircle size={13} className="text-emerald-500" />}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

// ─── STAT CARD ────────────────────────────────────────────────────────────────
const StatCard = ({ label, value, sub, icon: Icon, iconBg, iconColor, valueClass = "text-slate-900", loading }) => (
  <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5 hover:shadow-md transition-shadow">
    <div className="flex items-start justify-between mb-3">
      <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">{label}</p>
      <div className={`w-10 h-10 rounded-xl ${iconBg} flex items-center justify-center flex-shrink-0`}>
        <Icon size={18} className={iconColor} />
      </div>
    </div>
    {loading ? (
      <div className="h-8 w-24 bg-slate-100 rounded-lg animate-pulse" />
    ) : (
      <p className={`text-2xl font-extrabold leading-tight ${valueClass}`}>{value}</p>
    )}
    <p className="text-xs text-slate-400 font-medium mt-1">{sub}</p>
  </div>
);

// ─── ROW ACTIONS ──────────────────────────────────────────────────────────────
const RowActions = ({ transaction, onView, onStatusChange, onRefund, onDelete }) => {
  const [open, setOpen] = useState(false);
  const ref = useRef();

  useEffect(() => {
    const handler = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const actions = [
    { label: "View Details", icon: Eye, onClick: () => onView(transaction), always: true },
    { label: "Mark Completed", icon: CheckCircle, onClick: () => onStatusChange(transaction._id, "completed"), show: ["pending","processing"] },
    { label: "Mark Failed",    icon: AlertTriangle, onClick: () => onStatusChange(transaction._id, "failed"),    show: ["pending","processing"] },
    { label: "Process Refund", icon: RotateCcw, onClick: () => onRefund(transaction), show: ["completed"] },
    { label: "Cancel",         icon: Ban, onClick: () => onStatusChange(transaction._id, "cancelled"), show: ["pending","processing"] },
    { label: "Delete",         icon: Trash2, onClick: () => onDelete(transaction._id), always: true, danger: true },
  ].filter(a => a.always || (a.show && a.show.includes(transaction.status)));

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen(o => !o)}
        className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition"
      >
        <MoreHorizontal size={16} />
      </button>
      {open && (
        <div className="absolute right-0 mt-1 w-44 bg-white border border-slate-200 rounded-xl shadow-2xl z-50 overflow-hidden">
          {actions.map((a, i) => {
            const Icon = a.icon;
            return (
              <button
                key={i}
                onClick={() => { a.onClick(); setOpen(false); }}
                className={`w-full text-left px-3.5 py-2.5 text-xs font-semibold flex items-center gap-2 transition hover:bg-slate-50
                  ${a.danger ? "text-red-500 hover:bg-red-50" : "text-slate-600"}`}
              >
                <Icon size={13} /> {a.label}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
};

// ─── TRANSACTION DETAIL MODAL ─────────────────────────────────────────────────
const TransactionModal = ({ transaction, onClose }) => {
  if (!transaction) return null;
  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[100] flex items-center justify-center p-4" onClick={onClose}>
      <div
        className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto"
        onClick={e => e.stopPropagation()}
      >
        <div className="flex items-center justify-between p-6 border-b border-slate-100">
          <div>
            <h2 className="text-lg font-extrabold text-slate-900">{transaction.transactionId}</h2>
            <p className="text-xs text-slate-400 mt-0.5">Mail ID: {transaction.mailId} · {transaction.trackingNumber}</p>
          </div>
          <button onClick={onClose} className="p-2 rounded-xl hover:bg-slate-100 transition text-slate-400 hover:text-slate-600">
            <X size={18} />
          </button>
        </div>
        <div className="p-6 space-y-5">
          {/* Status row */}
          <div className="flex flex-wrap gap-3">
            <StatusBadge status={transaction.status} />
            <TypeBadge type={transaction.transactionType} />
            <PriorityDot priority={transaction.priority} />
          </div>

          {/* Amount */}
          <div className="bg-slate-50 rounded-xl p-4 flex items-center justify-between">
            <div>
              <p className="text-xs text-slate-400 font-semibold uppercase tracking-wide">Amount</p>
              <p className="text-3xl font-extrabold text-slate-900 mt-1">{fmt(transaction.amount)}</p>
              <p className="text-xs text-slate-400">{transaction.currency}</p>
            </div>
            {transaction.paymentMethod && (
              <div className="text-right">
                <p className="text-xs text-slate-400 font-semibold uppercase tracking-wide">Payment Method</p>
                <p className="text-sm font-bold text-slate-700 mt-1">{transaction.paymentMethod?.replace(/_/g, " ") || "—"}</p>
              </div>
            )}
          </div>

          {/* Dates */}
          <div className="grid grid-cols-2 gap-3">
            {[
              { label: "Created",   value: fmtDate(transaction.createdAt) },
              { label: "Updated",   value: fmtDate(transaction.updatedAt) },
              { label: "Completed", value: fmtDate(transaction.completedDate) },
              { label: "Due Date",  value: fmtDate(transaction.dueDate) },
            ].map(({ label, value }) => (
              <div key={label} className="bg-slate-50 rounded-xl p-3">
                <p className="text-xs text-slate-400 font-semibold uppercase tracking-wide">{label}</p>
                <p className="text-sm font-bold text-slate-700 mt-0.5">{value}</p>
              </div>
            ))}
          </div>

          {/* Escrow */}
          {transaction.escrowAccount?.accountId && (
            <div>
              <p className="text-xs text-slate-400 font-semibold uppercase tracking-wide mb-2">Escrow Account</p>
              <div className="bg-slate-50 rounded-xl p-3 flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-violet-100 flex items-center justify-center">
                  <Hash size={14} className="text-violet-600" />
                </div>
                <div>
                  <p className="text-sm font-bold text-slate-800">{transaction.escrowAccount.accountName || transaction.escrowAccount.accountId}</p>
                  <p className="text-xs text-slate-400 font-mono">{transaction.escrowAccount.accountNumber}</p>
                </div>
              </div>
            </div>
          )}

          {/* Parties */}
          {(transaction.parties?.payer?.name || transaction.parties?.payee?.name) && (
            <div className="grid grid-cols-2 gap-3">
              {["payer", "payee"].map(role => {
                const p = transaction.parties?.[role];
                if (!p?.name) return null;
                return (
                  <div key={role} className="bg-slate-50 rounded-xl p-3">
                    <p className="text-xs text-slate-400 font-semibold uppercase tracking-wide">{role}</p>
                    <p className="text-sm font-bold text-slate-800 mt-0.5">{p.name}</p>
                    {p.email && <p className="text-xs text-slate-500">{p.email}</p>}
                  </div>
                );
              })}
            </div>
          )}

          {/* Fees */}
          {transaction.fees?.length > 0 && (
            <div>
              <p className="text-xs text-slate-400 font-semibold uppercase tracking-wide mb-2">Fees ({transaction.fees.length})</p>
              <div className="space-y-1.5">
                {transaction.fees.map((f, i) => (
                  <div key={i} className="flex items-center justify-between bg-slate-50 rounded-xl px-3 py-2">
                    <span className="text-xs font-semibold text-slate-600">{f.feeType?.replace(/_/g, " ")} — {f.feeDescription || ""}</span>
                    <span className="text-xs font-extrabold text-slate-800">{fmt(f.feeAmount)}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Timeline */}
          {transaction.timeline?.length > 0 && (
            <div>
              <p className="text-xs text-slate-400 font-semibold uppercase tracking-wide mb-2">Timeline</p>
              <div className="space-y-1.5 max-h-40 overflow-y-auto">
                {[...transaction.timeline].reverse().map((t, i) => (
                  <div key={i} className="flex items-start gap-3 bg-slate-50 rounded-xl p-3">
                    <div className="w-2 h-2 rounded-full bg-slate-300 mt-1 flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <StatusBadge status={t.status} />
                        <span className="text-xs text-slate-400">{fmtDate(t.timestamp)}</span>
                      </div>
                      {t.notes && <p className="text-xs text-slate-500 mt-1">{t.notes}</p>}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Notes */}
          {transaction.notes && (
            <div className="bg-amber-50 border border-amber-100 rounded-xl p-3">
              <p className="text-xs text-amber-600 font-semibold uppercase tracking-wide mb-1">Notes</p>
              <p className="text-sm text-amber-800">{transaction.notes}</p>
            </div>
          )}

          {/* Failure Reason */}
          {transaction.failureReason && (
            <div className="bg-red-50 border border-red-100 rounded-xl p-3">
              <p className="text-xs text-red-500 font-semibold uppercase tracking-wide mb-1">Failure Reason</p>
              <p className="text-sm text-red-700">{transaction.failureReason}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// ─── CONFIRM MODAL ────────────────────────────────────────────────────────────
const ConfirmModal = ({ open, title, message, onConfirm, onCancel, danger }) => {
  if (!open) return null;
  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[110] flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6">
        <div className={`w-12 h-12 rounded-2xl flex items-center justify-center mb-4 ${danger ? "bg-red-50" : "bg-amber-50"}`}>
          <AlertTriangle size={22} className={danger ? "text-red-500" : "text-amber-500"} />
        </div>
        <h3 className="text-base font-extrabold text-slate-900">{title}</h3>
        <p className="text-sm text-slate-500 mt-1.5">{message}</p>
        <div className="flex gap-3 mt-5">
          <button onClick={onCancel} className="flex-1 px-4 py-2.5 rounded-xl border border-slate-200 text-sm font-bold text-slate-600 hover:bg-slate-50 transition">
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className={`flex-1 px-4 py-2.5 rounded-xl text-sm font-extrabold text-white transition ${danger ? "bg-red-500 hover:bg-red-600" : "bg-slate-900 hover:bg-slate-800"}`}
          >
            Confirm
          </button>
        </div>
      </div>
    </div>
  );
};

// ─── ADVANCED FILTERS PANEL ───────────────────────────────────────────────────
const AdvancedFilters = ({ filters, onChange, onReset }) => {
  return (
    <div className="bg-white border border-slate-100 rounded-2xl shadow-sm p-5">
      <div className="flex items-center justify-between mb-4">
        <p className="text-sm font-extrabold text-slate-800">Advanced Filters</p>
        <button onClick={onReset} className="text-xs font-bold text-slate-400 hover:text-slate-600 transition">Reset all</button>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
        {/* Date Range */}
        <div>
          <label className="text-xs font-semibold text-slate-500 mb-1.5 block">Start Date</label>
          <input
            type="date"
            value={filters.startDate}
            onChange={e => onChange("startDate", e.target.value)}
            className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-700 font-medium focus:outline-none focus:ring-2 focus:ring-slate-200"
          />
        </div>
        <div>
          <label className="text-xs font-semibold text-slate-500 mb-1.5 block">End Date</label>
          <input
            type="date"
            value={filters.endDate}
            onChange={e => onChange("endDate", e.target.value)}
            className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-700 font-medium focus:outline-none focus:ring-2 focus:ring-slate-200"
          />
        </div>
        {/* Amount Range */}
        <div>
          <label className="text-xs font-semibold text-slate-500 mb-1.5 block">Min Amount ($)</label>
          <input
            type="number"
            min="0"
            value={filters.minAmount}
            onChange={e => onChange("minAmount", e.target.value)}
            placeholder="0.00"
            className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-700 font-medium focus:outline-none focus:ring-2 focus:ring-slate-200"
          />
        </div>
        <div>
          <label className="text-xs font-semibold text-slate-500 mb-1.5 block">Max Amount ($)</label>
          <input
            type="number"
            min="0"
            value={filters.maxAmount}
            onChange={e => onChange("maxAmount", e.target.value)}
            placeholder="99999.00"
            className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-700 font-medium focus:outline-none focus:ring-2 focus:ring-slate-200"
          />
        </div>
        {/* Payment Method */}
        <div>
          <label className="text-xs font-semibold text-slate-500 mb-1.5 block">Payment Method</label>
          <Dropdown value={filters.paymentMethod} onChange={v => onChange("paymentMethod", v)} options={PAYMENT_METHOD_OPTIONS} className="w-full" />
        </div>
        {/* Currency */}
        <div>
          <label className="text-xs font-semibold text-slate-500 mb-1.5 block">Currency</label>
          <Dropdown value={filters.currency} onChange={v => onChange("currency", v)} options={CURRENCY_OPTIONS} className="w-full" />
        </div>
        {/* Priority */}
        <div>
          <label className="text-xs font-semibold text-slate-500 mb-1.5 block">Priority</label>
          <Dropdown value={filters.priority} onChange={v => onChange("priority", v)} options={PRIORITY_OPTIONS} className="w-full" />
        </div>
        {/* Has Escrow */}
        <div>
          <label className="text-xs font-semibold text-slate-500 mb-1.5 block">Escrow</label>
          <Dropdown
            value={filters.hasEscrow}
            onChange={v => onChange("hasEscrow", v)}
            options={[{ label: "Any", value: "" }, { label: "Has Escrow", value: "true" }, { label: "No Escrow", value: "false" }]}
            className="w-full"
          />
        </div>
      </div>
    </div>
  );
};

// ─── TABLE SKELETON ───────────────────────────────────────────────────────────
const TableSkeleton = ({ rows = 8 }) => (
  <div className="divide-y divide-slate-50">
    {Array.from({ length: rows }).map((_, i) => (
      <div key={i} className="flex items-center gap-4 px-5 py-4 animate-pulse">
        <div className="w-5 h-5 bg-slate-100 rounded" />
        <div className="flex-1 space-y-1.5">
          <div className="h-3.5 bg-slate-100 rounded w-32" />
          <div className="h-3 bg-slate-100 rounded w-24" />
        </div>
        <div className="h-3.5 bg-slate-100 rounded w-20" />
        <div className="h-6 bg-slate-100 rounded-full w-20" />
        <div className="h-3.5 bg-slate-100 rounded w-16" />
        <div className="h-6 bg-slate-100 rounded-full w-24" />
        <div className="h-6 bg-slate-100 rounded-full w-16" />
        <div className="w-7 h-7 bg-slate-100 rounded-lg" />
      </div>
    ))}
  </div>
);

// ─── MAIN PAGE ────────────────────────────────────────────────────────────────
const Transactions = () => {
  const dispatch = useDispatch();
  const { transactions, pagination, stats, loading, updating, refunding } = useSelector(
    (s) => s.transactions
  );

  // Filters
  const [search,        setSearch]        = useState("");
  const [typeFilter,    setTypeFilter]    = useState("");
  const [statusFilter,  setStatusFilter]  = useState("");
  const [showAdvanced,  setShowAdvanced]  = useState(false);
  const [advFilters,    setAdvFilters]    = useState({
    paymentMethod: "", currency: "", minAmount: "", maxAmount: "",
    startDate: "", endDate: "", priority: "", hasEscrow: "",
  });
  const [page,          setPage]          = useState(1);
  const [limit,         setLimit]         = useState(10);

  // UI State
  const [selectedIds,   setSelectedIds]   = useState([]);
  const [viewTx,        setViewTx]        = useState(null);
  const [confirmAction, setConfirmAction] = useState(null); // { type, payload }
  const [sortCol,       setSortCol]       = useState("createdAt");
  const [sortDir,       setSortDir]       = useState("desc");

  const debouncedSearch = useDebounce(search, 400);

  // Fetch on filter/page change
  const loadData = useCallback(() => {
    dispatch(fetchTransactions({
      search: debouncedSearch,
      transactionType: typeFilter,
      status: statusFilter,
      page,
      limit,
      ...advFilters,
    }));
  }, [dispatch, debouncedSearch, typeFilter, statusFilter, page, limit, advFilters]);

  useEffect(() => { loadData(); }, [loadData]);

  useEffect(() => {
    dispatch(fetchTransactionStats());
  }, [dispatch]);

  // Reset page on filter change
  useEffect(() => { setPage(1); setSelectedIds([]); },
    [debouncedSearch, typeFilter, statusFilter, advFilters]);

  // ── Stats
  const totalTx     = stats?.totalTransactions ?? 0;
  const totalAmt    = stats?.totalAmount       ?? 0;
  const completedC  = stats?.completedCount    ?? 0;
  const pendingC    = stats?.pendingCount      ?? 0;
  const failedC     = stats?.failedCount       ?? 0;

  // ── Advanced filter change
  const handleAdvChange = (key, val) => {
    setAdvFilters(f => ({ ...f, [key]: val }));
  };
  const resetAdvFilters = () => {
    setAdvFilters({ paymentMethod: "", currency: "", minAmount: "", maxAmount: "", startDate: "", endDate: "", priority: "", hasEscrow: "" });
  };
  const hasAdvFilters = Object.values(advFilters).some(Boolean);
  const hasAnyFilter  = search || typeFilter || statusFilter || hasAdvFilters;

  const resetAll = () => {
    setSearch(""); setTypeFilter(""); setStatusFilter(""); resetAdvFilters();
  };

  // ── Export CSV
  const handleExport = () => {
    const toExport = selectedIds.length ? transactions.filter(t => selectedIds.includes(t._id)) : transactions;
    const header = "Transaction ID,Mail ID,Tracking,Type,Amount,Currency,Status,Priority,Payment Method,Created";
    const rows = toExport.map(t =>
      [t.transactionId, t.mailId, t.trackingNumber, t.transactionType,
       t.amount, t.currency, t.status, t.priority, t.paymentMethod,
       new Date(t.createdAt).toLocaleDateString()].join(",")
    );
    const blob = new Blob([[header, ...rows].join("\n")], { type: "text/csv" });
    const url  = URL.createObjectURL(blob);
    const a    = document.createElement("a"); a.href = url; a.download = "transactions.csv"; a.click();
    URL.revokeObjectURL(url);
  };

  // ── Row selection
  const allSelected  = transactions.length > 0 && selectedIds.length === transactions.length;
  const someSelected = selectedIds.length > 0 && !allSelected;

  const toggleAll = () => {
    setSelectedIds(allSelected ? [] : transactions.map(t => t._id));
  };
  const toggleRow = (id) => {
    setSelectedIds(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);
  };

  // ── Actions
  const handleStatusChange = (id, status) => {
    setConfirmAction({ type: "status", payload: { id, status } });
  };

  const handleRefund = (tx) => {
    setConfirmAction({ type: "refund", payload: tx });
  };

  const handleDelete = (id) => {
    setConfirmAction({ type: "delete", payload: id });
  };

  const handleBulkAction = (action) => {
    if (!selectedIds.length) return;
    setConfirmAction({ type: "bulk", payload: { ids: selectedIds, action } });
  };

  const executeConfirm = async () => {
    const { type, payload } = confirmAction;
    if (type === "status") {
      await dispatch(updateTransactionStatus({ id: payload.id, statusData: { status: payload.status, notes: `Status updated to ${payload.status}`, updatedBy: "admin" } }));
    } else if (type === "refund") {
      await dispatch(processRefund({ id: payload._id, refundData: { refundAmount: payload.amount, refundReason: "Manual refund", refundMethod: "original", processedBy: "admin" } }));
    } else if (type === "delete") {
      await dispatch(deleteTransaction(payload));
    } else if (type === "bulk") {
      await dispatch(bulkUpdateTransactions({ transactionIds: payload.ids, updates: { status: payload.action }, updatedBy: "admin" }));
      setSelectedIds([]);
    }
    setConfirmAction(null);
    loadData();
  };

  const { page: curPage, pages: totalPages, total } = pagination || {};

  // Table columns
  const COLS = [
    { key: "transactionId", label: "TRANSACTION", sortable: true },
    { key: "createdAt",     label: "DATE",         sortable: true },
    { key: "transactionType", label: "TYPE",        sortable: false },
    { key: "amount",        label: "AMOUNT",        sortable: true },
    { key: "escrowAccount", label: "ESCROW",        sortable: false },
    { key: "mailId",        label: "MAIL ID",       sortable: true },
    { key: "status",        label: "STATUS",        sortable: true },
    { key: "priority",      label: "PRIORITY",      sortable: false },
    { key: "_actions",      label: "",              sortable: false },
  ];

  const handleSort = (col) => {
    if (!col.sortable) return;
    if (sortCol === col.key) setSortDir(d => d === "asc" ? "desc" : "asc");
    else { setSortCol(col.key); setSortDir("asc"); }
  };

  const SortIcon = ({ col }) => {
    if (!col.sortable) return null;
    if (sortCol !== col.key) return <ChevronDown size={12} className="text-slate-300 ml-1" />;
    return sortDir === "asc"
      ? <ChevronDown size={12} className="text-slate-600 ml-1 rotate-180" />
      : <ChevronDown size={12} className="text-slate-600 ml-1" />;
  };

  // ── Confirm modal config
  const confirmCfg = confirmAction ? {
    title: confirmAction.type === "delete" ? "Delete Transaction" :
           confirmAction.type === "refund" ? "Process Refund" :
           confirmAction.type === "bulk"   ? `Bulk Update (${confirmAction.payload.ids.length})` :
           "Update Status",
    message: confirmAction.type === "delete" ? "This action cannot be undone. The transaction will be permanently removed." :
             confirmAction.type === "refund" ? `Process a refund of ${fmt(confirmAction.payload?.amount)} for transaction ${confirmAction.payload?.transactionId}?` :
             confirmAction.type === "bulk"   ? `Update ${confirmAction.payload.ids.length} transactions to "${confirmAction.payload.action}"?` :
             `Change status to "${confirmAction.payload?.status}"?`,
    danger: confirmAction.type === "delete",
  } : {};

  return (
    <div className="min-h-screen bg-slate-50 p-4 md:p-6 space-y-5">

      {/* ── HEADER ── */}
      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-extrabold text-slate-900 tracking-tight">Transaction History</h1>
          <p className="text-slate-400 text-sm mt-1 font-medium">
            Complete ledger of all escrow transactions
            {total !== undefined && <span className="ml-2 font-bold text-slate-600">({total?.toLocaleString()} total)</span>}
          </p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={loadData}
            disabled={loading}
            className="flex items-center gap-2 px-4 py-2.5 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 rounded-xl text-sm font-bold shadow-sm transition"
          >
            <RefreshCw size={14} className={loading ? "animate-spin" : ""} />
            Refresh
          </button>
          <button
            onClick={handleExport}
            className="flex items-center gap-2 px-5 py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-sm font-extrabold shadow-lg transition"
          >
            <Download size={15} />
            {selectedIds.length ? `Export (${selectedIds.length})` : "Export CSV"}
          </button>
        </div>
      </div>

      {/* ── STAT CARDS ── */}
      <div className="grid grid-cols-2 xl:grid-cols-5 gap-3 md:gap-4">
        <StatCard label="Total"     value={totalTx.toLocaleString()} sub={`${limit} per page`}       icon={Hash}         iconBg="bg-slate-100"    iconColor="text-slate-600"   loading={loading} />
        <StatCard label="Amount"    value={fmt(totalAmt)}            sub="All transactions"           icon={TrendingUp}   iconBg="bg-blue-50"      iconColor="text-blue-500"    loading={loading} />
        <StatCard label="Completed" value={completedC.toLocaleString()} sub="Successfully processed" icon={CheckCircle}  iconBg="bg-emerald-50"   iconColor="text-emerald-500" valueClass="text-emerald-600" loading={loading} />
        <StatCard label="Pending"   value={pendingC.toLocaleString()} sub="Awaiting processing"      icon={Clock}        iconBg="bg-amber-50"     iconColor="text-amber-500"   valueClass="text-amber-600"   loading={loading} />
        <StatCard label="Failed"    value={failedC.toLocaleString()} sub="Require attention"         icon={AlertCircle}  iconBg="bg-red-50"       iconColor="text-red-500"     valueClass="text-red-600"     loading={loading} />
      </div>

      {/* ── FILTERS BAR ── */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-3 md:p-4">
        <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center">
          {/* Search */}
          <div className="flex-1 flex items-center gap-3 bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5">
            <Search size={15} className="text-slate-400 flex-shrink-0" />
            <input
              type="text"
              placeholder="Search ID, tracking, mail ID..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="bg-transparent outline-none text-sm text-slate-700 placeholder-slate-400 w-full font-medium"
            />
            {search && (
              <button onClick={() => setSearch("")} className="text-slate-300 hover:text-slate-500 transition">
                <X size={14} />
              </button>
            )}
          </div>

          <div className="flex gap-2 flex-wrap">
            <Dropdown value={typeFilter}   onChange={setTypeFilter}   options={TYPE_OPTIONS}   icon={Filter} />
            <Dropdown value={statusFilter} onChange={setStatusFilter} options={STATUS_OPTIONS} icon={Filter} />
            <button
              onClick={() => setShowAdvanced(v => !v)}
              className={`flex items-center gap-1.5 px-3.5 py-2 border rounded-xl text-sm font-bold transition shadow-sm
                ${showAdvanced || hasAdvFilters ? "bg-slate-900 text-white border-slate-900" : "bg-white text-slate-600 border-slate-200 hover:bg-slate-50"}`}
            >
              <SlidersHorizontal size={14} />
              Filters {hasAdvFilters && `(${Object.values(advFilters).filter(Boolean).length})`}
            </button>
            {hasAnyFilter && (
              <button
                onClick={resetAll}
                className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold text-slate-500 hover:text-slate-700 bg-slate-50 border border-slate-200 rounded-xl hover:bg-slate-100 transition"
              >
                <X size={12} /> Clear
              </button>
            )}
          </div>
        </div>
      </div>

      {/* ── ADVANCED FILTERS ── */}
      {showAdvanced && (
        <AdvancedFilters filters={advFilters} onChange={handleAdvChange} onReset={resetAdvFilters} />
      )}

      {/* ── BULK ACTION BAR ── */}
      {selectedIds.length > 0 && (
        <div className="bg-slate-900 text-white rounded-2xl px-5 py-3 flex flex-wrap items-center gap-3">
          <span className="text-sm font-bold">{selectedIds.length} selected</span>
          <div className="flex gap-2 ml-auto">
            {[
              { label: "Mark Completed", action: "completed", icon: CheckCircle },
              { label: "Mark Failed",    action: "failed",    icon: AlertTriangle },
              { label: "Cancel",         action: "cancelled", icon: Ban },
            ].map(a => {
              const Icon = a.icon;
              return (
                <button
                  key={a.action}
                  onClick={() => handleBulkAction(a.action)}
                  disabled={updating}
                  className="flex items-center gap-1.5 px-3.5 py-1.5 bg-white/10 hover:bg-white/20 rounded-xl text-xs font-bold transition"
                >
                  <Icon size={12} /> {a.label}
                </button>
              );
            })}
            <button onClick={() => setSelectedIds([])} className="p-1.5 text-white/50 hover:text-white transition">
              <X size={14} />
            </button>
          </div>
        </div>
      )}

      {/* ── TABLE ── */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-black text-white">
              <tr className="border-b border-slate-800">
                {/* Checkbox */}
                <th className="px-5 py-3.5 w-10">
                  <button onClick={toggleAll} className="text-slate-400 hover:text-white transition">
                    {allSelected ? <CheckSquare size={16} className="text-white" /> :
                     someSelected ? <Minus size={16} className="text-slate-300" /> :
                     <Square size={16} />}
                  </button>
                </th>
                {COLS.map(col => (
                  <th
                    key={col.key}
                    onClick={() => handleSort(col)}
                    className={`px-4 py-3.5 text-xs font-bold text-white/70 uppercase tracking-wider whitespace-nowrap
                      ${col.sortable ? "cursor-pointer hover:text-white select-none" : ""}`}
                  >
                    <span className="flex items-center">
                      {col.label}
                      <SortIcon col={col} />
                    </span>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {loading ? (
                <tr><td colSpan={COLS.length + 1}><TableSkeleton rows={limit} /></td></tr>
              ) : transactions.length === 0 ? (
                <tr>
                  <td colSpan={COLS.length + 1} className="py-20 text-center">
                    <div className="flex flex-col items-center gap-3">
                      <div className="w-14 h-14 rounded-2xl bg-slate-100 flex items-center justify-center">
                        <Search size={22} className="text-slate-400" />
                      </div>
                      <p className="text-slate-500 font-semibold">No transactions found</p>
                      <p className="text-slate-400 text-sm">Try adjusting your filters</p>
                      {hasAnyFilter && (
                        <button onClick={resetAll} className="mt-1 text-sm font-bold text-blue-600 hover:text-blue-700 transition">
                          Clear filters
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ) : (
                transactions.map(t => {
                  const isSelected = selectedIds.includes(t._id);
                  const isMoney    = ["refund","escrow_deposit"].includes(t.transactionType);
                  return (
                    <tr
                      key={t._id}
                      className={`hover:bg-slate-50/70 transition-colors group ${isSelected ? "bg-blue-50/40" : ""}`}
                    >
                      {/* Checkbox */}
                      <td className="px-5 py-3.5">
                        <button onClick={() => toggleRow(t._id)} className="text-slate-300 hover:text-slate-600 transition">
                          {isSelected ? <CheckSquare size={16} className="text-blue-600" /> : <Square size={16} />}
                        </button>
                      </td>
                      {/* Transaction ID */}
                      <td className="px-4 py-3.5">
                        <div>
                          <p className="font-extrabold text-slate-900 text-sm font-mono">{t.transactionId}</p>
                          <p className="text-xs text-slate-400 mt-0.5 font-mono">{t.trackingNumber}</p>
                        </div>
                      </td>
                      {/* Date */}
                      <td className="px-4 py-3.5 whitespace-nowrap">
                        <p className="text-xs text-slate-600 font-medium">{fmtDate(t.createdAt)}</p>
                      </td>
                      {/* Type */}
                      <td className="px-4 py-3.5">
                        <TypeBadge type={t.transactionType} />
                      </td>
                      {/* Amount */}
                      <td className="px-4 py-3.5 whitespace-nowrap">
                        <span className={`font-extrabold text-sm ${isMoney ? "text-emerald-600" : "text-slate-800"}`}>
                          {isMoney ? "+" : ""}{fmt(t.amount)}
                        </span>
                        <p className="text-xs text-slate-400 font-mono">{t.currency}</p>
                      </td>
                      {/* Escrow */}
                      <td className="px-4 py-3.5">
                        {t.escrowAccount?.accountId ? (
                          <div className="flex items-center gap-1.5">
                            <div className="w-1.5 h-1.5 rounded-full bg-violet-400 flex-shrink-0" />
                            <span className="text-xs text-slate-600 font-mono font-semibold">{t.escrowAccount.accountId}</span>
                          </div>
                        ) : (
                          <span className="text-xs text-slate-300">—</span>
                        )}
                      </td>
                      {/* Mail ID */}
                      <td className="px-4 py-3.5">
                        <span className="text-xs text-slate-500 font-mono font-medium">{t.mailId}</span>
                      </td>
                      {/* Status */}
                      <td className="px-4 py-3.5">
                        <StatusBadge status={t.status} />
                      </td>
                      {/* Priority */}
                      <td className="px-4 py-3.5">
                        <PriorityDot priority={t.priority} />
                      </td>
                      {/* Actions */}
                      <td className="px-4 py-3.5">
                        <RowActions
                          transaction={t}
                          onView={setViewTx}
                          onStatusChange={handleStatusChange}
                          onRefund={handleRefund}
                          onDelete={handleDelete}
                        />
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* ── PAGINATION ── */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 px-5 py-4 border-t border-slate-100">
          {/* Per-page + info */}
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <span className="text-xs text-slate-400 font-medium">Rows:</span>
              <select
                value={limit}
                onChange={e => { setLimit(Number(e.target.value)); setPage(1); }}
                className="text-xs font-bold text-slate-700 bg-slate-50 border border-slate-200 rounded-lg px-2 py-1.5 focus:outline-none"
              >
                {LIMITS.map(l => <option key={l} value={l}>{l}</option>)}
              </select>
            </div>
            <p className="text-xs text-slate-400 font-medium">
              {total ? (
                <>
                  <span className="font-bold text-slate-700">
                    {Math.min((curPage - 1) * limit + 1, total)}–{Math.min(curPage * limit, total)}
                  </span> of <span className="font-bold text-slate-700">{total?.toLocaleString()}</span>
                </>
              ) : "No results"}
            </p>
          </div>

          {/* Page buttons */}
          <div className="flex items-center gap-1">
            <button onClick={() => setPage(1)} disabled={page <= 1 || loading}
              className="p-1.5 rounded-lg text-slate-400 hover:bg-slate-100 disabled:opacity-30 disabled:cursor-not-allowed transition">
              <ChevronsLeft size={15} />
            </button>
            <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page <= 1 || loading}
              className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold text-slate-600 hover:bg-slate-100 disabled:opacity-30 disabled:cursor-not-allowed transition">
              <ChevronLeft size={13} /> Prev
            </button>

            {/* Page numbers */}
            {totalPages && Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
              let p;
              if (totalPages <= 5) p = i + 1;
              else if (curPage <= 3) p = i + 1;
              else if (curPage >= totalPages - 2) p = totalPages - 4 + i;
              else p = curPage - 2 + i;
              return (
                <button
                  key={p}
                  onClick={() => setPage(p)}
                  disabled={loading}
                  className={`w-8 h-8 rounded-lg text-xs font-bold transition disabled:cursor-not-allowed
                    ${curPage === p ? "bg-slate-900 text-white shadow-sm" : "text-slate-500 hover:bg-slate-100"}`}
                >
                  {p}
                </button>
              );
            })}

            <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page >= totalPages || loading}
              className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold text-slate-600 hover:bg-slate-100 disabled:opacity-30 disabled:cursor-not-allowed transition">
              Next <ChevronRight size={13} />
            </button>
            <button onClick={() => setPage(totalPages)} disabled={page >= totalPages || loading}
              className="p-1.5 rounded-lg text-slate-400 hover:bg-slate-100 disabled:opacity-30 disabled:cursor-not-allowed transition">
              <ChevronsRight size={15} />
            </button>
          </div>
        </div>
      </div>

      {/* ── MODALS ── */}
      <TransactionModal transaction={viewTx} onClose={() => setViewTx(null)} />
      <ConfirmModal
        open={!!confirmAction}
        title={confirmCfg.title}
        message={confirmCfg.message}
        danger={confirmCfg.danger}
        onConfirm={executeConfirm}
        onCancel={() => setConfirmAction(null)}
      />
    </div>
  );
};

export default Transactions;

// import { useState, useMemo } from "react";
// import {
//   Search,
//   Download,
//   Filter,
//   ChevronDown,
//   X,
//   ArrowUpRight,
//   ArrowDownLeft,
//   RefreshCw,
//   AlertCircle,
//   Hash,
//   TrendingUp,
//   CheckCircle,
//   Clock,
// } from "lucide-react";
// import Table from "../components/table";

// // ─── MOCK DATA ────────────────────────────────────────────────────────────────

// const rawTransactions = [
//   { id: "TXN-00100005", ref: "MMH09V0C7V", timestamp: "3/20/2026, 5:31:31 AM",  type: "Fee",        amount: 19.00,  escrow: "EA-005007", mailId: "MP00010335", status: "Failed"    },
//   { id: "TXN-00100043", ref: "2BB7HR087X", timestamp: "3/19/2026, 9:24:35 PM",  type: "Adjustment", amount: 45.36,  escrow: "EA-005002", mailId: "MP00010685", status: "Completed" },
//   { id: "TXN-00100008", ref: "Y97PB7K0WC", timestamp: "3/19/2026, 9:32:56 AM",  type: "Fee",        amount: 23.79,  escrow: "EA-005005", mailId: "MP00010850", status: "Pending"   },
//   { id: "TXN-00100009", ref: "NCZ5ZW72TZ", timestamp: "3/18/2026, 2:43:41 PM",  type: "Adjustment", amount: 1.90,   escrow: "EA-005009", mailId: "MP00010595", status: "Failed"    },
//   { id: "TXN-00100035", ref: "DTSM1JZNPP", timestamp: "3/18/2026, 12:55:13 PM", type: "Adjustment", amount: 6.42,   escrow: "EA-005014", mailId: "MP00010598", status: "Completed" },
//   { id: "TXN-00100032", ref: "DZHSMZ6ZO8", timestamp: "3/17/2026, 9:57:14 PM",  type: "Refund",     amount: 32.16,  escrow: "EA-005004", mailId: "MP00010443", status: "Completed" },
//   { id: "TXN-00100021", ref: "XKJP8C4M2W", timestamp: "3/17/2026, 4:10:05 PM",  type: "Debit",      amount: 58.00,  escrow: "EA-005001", mailId: "MP00010210", status: "Completed" },
//   { id: "TXN-00100018", ref: "TLQR3F7N9B", timestamp: "3/17/2026, 11:23:44 AM", type: "Credit",     amount: 200.00, escrow: "EA-005003", mailId: "MP00010180", status: "Completed" },
//   { id: "TXN-00100047", ref: "VWNE5D2K7J", timestamp: "3/16/2026, 7:45:18 PM",  type: "Fee",        amount: 12.50,  escrow: "EA-005006", mailId: "MP00010470", status: "Pending"   },
//   { id: "TXN-00100030", ref: "CBPZ9Y1H6L", timestamp: "3/16/2026, 3:08:52 PM",  type: "Refund",     amount: 75.00,  escrow: "EA-005008", mailId: "MP00010300", status: "Completed" },
//   { id: "TXN-00100011", ref: "MNQR6A8T3F", timestamp: "3/15/2026, 6:50:20 PM",  type: "Debit",      amount: 33.40,  escrow: "EA-005010", mailId: "MP00010110", status: "Failed"    },
//   { id: "TXN-00100026", ref: "WKSH4P0M2G", timestamp: "3/15/2026, 1:17:39 PM",  type: "Adjustment", amount: 9.99,   escrow: "EA-005012", mailId: "MP00010260", status: "Pending"   },
//   { id: "TXN-00100039", ref: "EZFV7C3N8X", timestamp: "3/14/2026, 10:34:07 AM", type: "Credit",     amount: 500.00, escrow: "EA-005000", mailId: "MP00010390", status: "Completed" },
//   { id: "TXN-00100002", ref: "JHDM2R9K5T", timestamp: "3/14/2026, 8:21:55 AM",  type: "Fee",        amount: 4.75,   escrow: "EA-005013", mailId: "MP00010020", status: "Completed" },
//   { id: "TXN-00100050", ref: "PZQW1B6N4V", timestamp: "3/13/2026, 5:56:30 PM",  type: "Debit",      amount: 87.20,  escrow: "EA-005015", mailId: "MP00010500", status: "Pending"   },
//   { id: "TXN-00100015", ref: "RTYX8J2M7C", timestamp: "3/13/2026, 2:42:11 PM",  type: "Refund",     amount: 14.00,  escrow: "EA-005011", mailId: "MP00010150", status: "Completed" },
//   { id: "TXN-00100044", ref: "KBFN3D9P1W", timestamp: "3/12/2026, 11:05:48 AM", type: "Adjustment", amount: 3.22,   escrow: "EA-005016", mailId: "MP00010440", status: "Failed"    },
//   { id: "TXN-00100037", ref: "LCHQ7G4V0R", timestamp: "3/12/2026, 9:19:03 AM",  type: "Credit",     amount: 150.00, escrow: "EA-005002", mailId: "MP00010370", status: "Completed" },
//   { id: "TXN-00100023", ref: "SMWZ5K1J8N", timestamp: "3/11/2026, 6:38:27 PM",  type: "Fee",        amount: 7.88,   escrow: "EA-005004", mailId: "MP00010230", status: "Pending"   },
//   { id: "TXN-00100048", ref: "GNVY2T6H3Q", timestamp: "3/11/2026, 3:15:59 PM",  type: "Debit",      amount: 62.50,  escrow: "EA-005007", mailId: "MP00010480", status: "Completed" },
// ];

// const TYPE_FILTERS   = ["All Types",   "Escrow Debit", "Adjustment", "Refund", "Adjustment",];
// const STATUS_FILTERS = ["All Statuses","Completed", "Pending", "Failed", "Reversed"];
// const PER_PAGE = 10;

// // ─── HELPERS ──────────────────────────────────────────────────────────────────

// const fmt = (n) =>
//   n.toLocaleString("en-US", { style: "currency", currency: "USD", minimumFractionDigits: 2 });

// // ─── TYPE BADGE ───────────────────────────────────────────────────────────────

// const TypeBadge = ({ type }) => {
//   const cfg = {
//     Fee:        { bg: "bg-purple-50",  text: "text-purple-600",  border: "border-purple-200" },
//     Adjustment: { bg: "bg-amber-50",   text: "text-amber-600",   border: "border-amber-200"  },
//     Refund:     { bg: "bg-emerald-50", text: "text-emerald-600", border: "border-emerald-200"},
//     Debit:      { bg: "bg-red-50",     text: "text-red-500",     border: "border-red-200"    },
//     Credit:     { bg: "bg-blue-50",    text: "text-blue-600",    border: "border-blue-200"   },
//   }[type] || { bg: "bg-slate-50", text: "text-slate-500", border: "border-slate-200" };

//   const icons = {
//     Fee:        <Hash size={10} />,
//     Adjustment: <RefreshCw size={10} />,
//     Refund:     <ArrowDownLeft size={10} />,
//     Debit:      <ArrowUpRight size={10} />,
//     Credit:     <ArrowDownLeft size={10} />,
//   };

//   return (
//     <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold border ${cfg.bg} ${cfg.text} ${cfg.border}`}>
//       {icons[type]} {type}
//     </span>
//   );
// };

// // ─── STATUS BADGE ─────────────────────────────────────────────────────────────

// const StatusBadge = ({ status }) => {
//   const cfg = {
//     Completed: { bg: "bg-slate-900", text: "text-white" },
//     Pending:   { bg: "bg-slate-100", text: "text-slate-500" },
//     Failed:    { bg: "bg-red-500",   text: "text-white"    },
//   }[status] || { bg: "bg-slate-100", text: "text-slate-500" };

//   return (
//     <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-extrabold ${cfg.bg} ${cfg.text}`}>
//       {status}
//     </span>
//   );
// };

// // ─── DROPDOWN ─────────────────────────────────────────────────────────────────

// const Dropdown = ({ value, onChange, options, icon: Icon }) => {
//   const [open, setOpen] = useState(false);
//   return (
//     <div className="relative">
//       <button
//         onClick={() => setOpen(o => !o)}
//         className="flex items-center gap-2 px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold text-slate-700 hover:bg-slate-100 transition min-w-[150px] justify-between"
//       >
//         <div className="flex items-center gap-2">
//           {Icon && <Icon size={14} className="text-slate-400" />}
//           {value}
//         </div>
//         <ChevronDown size={13} className={`text-slate-400 transition-transform ${open ? "rotate-180" : ""}`} />
//       </button>
//       {open && (
//         <div className="absolute left-0 mt-2 w-48 bg-white border border-slate-200 rounded-xl shadow-xl z-20 overflow-hidden">
//           {options.map(o => (
//             <button
//               key={o}
//               onClick={() => { onChange(o); setOpen(false); }}
//               className={`w-full text-left px-4 py-2.5 text-sm font-medium transition flex items-center justify-between
//                 ${value === o ? "bg-slate-50 text-slate-900 font-bold" : "text-slate-600 hover:bg-slate-50"}`}
//             >
//               {o}
//               {value === o && <CheckCircle size={13} className="text-emerald-500" />}
//             </button>
//           ))}
//         </div>
//       )}
//     </div>
//   );
// };

// // ─── MAIN PAGE ────────────────────────────────────────────────────────────────

// const Transactions = () => {
//   const [search,       setSearch]       = useState("");
//   const [typeFilter,   setTypeFilter]   = useState("All Types");
//   const [statusFilter, setStatusFilter] = useState("All Statuses");
//   const [page,         setPage]         = useState(1);

//   const filtered = useMemo(() => {
//     return rawTransactions.filter(t => {
//       const q = search.toLowerCase();
//       const matchSearch = !q ||
//         t.id.toLowerCase().includes(q) ||
//         t.ref.toLowerCase().includes(q) ||
//         t.escrow.toLowerCase().includes(q) ||
//         t.mailId.toLowerCase().includes(q);
//       const matchType   = typeFilter   === "All Types"    || t.type   === typeFilter;
//       const matchStatus = statusFilter === "All Statuses" || t.status === statusFilter;
//       return matchSearch && matchType && matchStatus;
//     });
//   }, [search, typeFilter, statusFilter]);

//   const paginated  = filtered.slice((page - 1) * PER_PAGE, page * PER_PAGE);
//   const totalPages = Math.ceil(filtered.length / PER_PAGE);

//   const totalAmount = filtered.reduce((s, t) => s + t.amount, 0);
//   const completed   = filtered.filter(t => t.status === "Completed").length;
//   const pending     = filtered.filter(t => t.status === "Pending").length;
//   const failed      = filtered.filter(t => t.status === "Failed").length;

//   const handleExport = () => {
//     const header = "Transaction ID,Ref,Timestamp,Type,Amount,Escrow Account,Mail ID,Status";
//     const rows   = filtered.map(t =>
//       `${t.id},${t.ref},${t.timestamp},${t.type},${fmt(t.amount)},${t.escrow},${t.mailId},${t.status}`
//     );
//     const blob = new Blob([[header, ...rows].join("\n")], { type: "text/csv" });
//     const url  = URL.createObjectURL(blob);
//     const a    = document.createElement("a");
//     a.href = url; a.download = "transactions.csv"; a.click();
//     URL.revokeObjectURL(url);
//   };

//   const resetFilters = () => {
//     setSearch(""); setTypeFilter("All Types"); setStatusFilter("All Statuses"); setPage(1);
//   };
//   const hasFilters = search || typeFilter !== "All Types" || statusFilter !== "All Statuses";

//   return (
//     <div className="min-h-screen bg-slate-50 p-6 space-y-6">

//       {/* ── HEADER ── */}
//       <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
//         <div>
//           <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Transaction History</h1>
//           <p className="text-slate-400 text-sm mt-1 font-medium">Complete ledger of all escrow transactions</p>
//         </div>
//         <button
//           onClick={handleExport}
//           className="flex items-center gap-2 px-5 py-2.5 bg-slate-900 hover:bg-slate-700 text-white rounded-xl text-sm font-extrabold shadow-lg transition self-start"
//         >
//           <Download size={15} /> Export Transactions
//         </button>
//       </div>

//       {/* ── STAT CARDS ── */}
//       <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
//         {[
//           {
//             label: "Total Transactions",
//             value: filtered.length.toString(),
//             valClass: "text-slate-900",
//             sub: `${rawTransactions.length} total records`,
//             icon: Hash,
//             iconBg: "bg-slate-100",
//             iconColor: "text-slate-600",
//           },
//           {
//             label: "Total Amount",
//             value: fmt(totalAmount),
//             valClass: "text-slate-900",
//             sub: "Filtered transactions",
//             icon: TrendingUp,
//             iconBg: "bg-blue-50",
//             iconColor: "text-blue-500",
//           },
//           {
//             label: "Completed",
//             value: completed.toString(),
//             valClass: "text-emerald-500",
//             sub: `${failed} failed`,
//             icon: CheckCircle,
//             iconBg: "bg-emerald-50",
//             iconColor: "text-emerald-500",
//           },
//           {
//             label: "Pending",
//             value: pending.toString(),
//             valClass: "text-amber-500",
//             sub: "Awaiting processing",
//             icon: Clock,
//             iconBg: "bg-amber-50",
//             iconColor: "text-amber-500",
//           },
//         ].map((c, i) => {
//           const Icon = c.icon;
//           return (
//             <div key={i} className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5 hover:shadow-md transition-shadow">
//               <div className="flex items-start justify-between mb-3">
//                 <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">{c.label}</p>
//                 <div className={`w-10 h-10 rounded-xl ${c.iconBg} flex items-center justify-center`}>
//                   <Icon size={18} className={c.iconColor} />
//                 </div>
//               </div>
//               <p className={`text-2xl font-extrabold leading-tight ${c.valClass}`}>{c.value}</p>
//               <p className="text-xs text-slate-400 font-medium mt-1">{c.sub}</p>
//             </div>
//           );
//         })}
//       </div>

//       {/* ── FILTERS ── */}
//       <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-4 flex flex-col sm:flex-row gap-3 items-stretch sm:items-center">
//         {/* Search */}
//         <div className="flex-1 flex items-center gap-3 bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5">
//           <Search size={15} className="text-slate-400 flex-shrink-0" />
//           <input
//             type="text"
//             placeholder="Search transactions..."
//             value={search}
//             onChange={e => { setSearch(e.target.value); setPage(1); }}
//             className="bg-transparent outline-none text-sm text-slate-700 placeholder-slate-400 w-full font-medium"
//           />
//           {search && (
//             <button onClick={() => setSearch("")} className="text-slate-300 hover:text-slate-500 transition">
//               <X size={14} />
//             </button>
//           )}
//         </div>

//         <div className="flex gap-2 flex-wrap">
//           <Dropdown value={typeFilter}   onChange={v => { setTypeFilter(v);   setPage(1); }} options={TYPE_FILTERS}   icon={Filter} />
//           <Dropdown value={statusFilter} onChange={v => { setStatusFilter(v); setPage(1); }} options={STATUS_FILTERS} icon={Filter} />
//           {hasFilters && (
//             <button
//               onClick={resetFilters}
//               className="flex items-center gap-1.5 px-4 py-2.5 text-xs font-bold text-slate-500 hover:text-slate-700 bg-slate-50 border border-slate-200 rounded-xl hover:bg-slate-100 transition"
//             >
//               <X size={12} /> Clear
//             </button>
//           )}
//         </div>
//       </div>


//       {/* ── TABLE ── */}
//       <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden p-4">
//         <Table
//           data={paginated}
//           columns={[
//             {
//               key: "id",
//               label: "TRANSACTION ID",
//               render: (t) => (
//                 <div>
//                   <p className="font-extrabold text-slate-900 text-sm">{t.id}</p>
//                   <p className="text-xs text-slate-400 font-mono mt-0.5">Ref: {t.ref}</p>
//                 </div>
//               ),
//             },
//             {
//               key: "timestamp",
//               label: "TIMESTAMP",
//               render: (t) => <span className="text-slate-500 text-xs font-medium whitespace-nowrap">{t.timestamp}</span>,
//             },
//             {
//               key: "type",
//               label: "TYPE",
//               render: (t) => <TypeBadge type={t.type} />,
//             },
//             {
//               key: "amount",
//               label: "AMOUNT",
//               render: (t) => (
//                 <span className={`font-extrabold text-sm ${
//                   t.type === "Refund" || t.type === "Credit" ? "text-emerald-600" : "text-slate-800"
//                 }`}>
//                   {t.type === "Refund" || t.type === "Credit" ? "+" : ""}{fmt(t.amount)}
//                 </span>
//               ),
//             },
//             {
//               key: "escrow",
//               label: "ESCROW ACCOUNT",
//               render: (t) => (
//                 <div className="flex items-center gap-2">
//                   <div className={`w-2 h-2 rounded-full ${t.status === "Failed" ? "bg-red-400" : "bg-emerald-400"}`} />
//                   <span className="text-slate-600 font-semibold text-xs">{t.escrow}</span>
//                 </div>
//               ),
//             },
//             {
//               key: "mailId",
//               label: "MAIL ID",
//               render: (t) => <span className="text-slate-500 font-mono text-xs font-medium">{t.mailId}</span>,
//             },
//             {
//               key: "status",
//               label: "STATUS",
//               render: (t) => <StatusBadge status={t.status} />,
//             },
//           ]}
//         />

//         {/* ── PAGINATION ── */}
//         <div className="flex flex-col sm:flex-row items-center justify-between gap-3 px-5 py-4 border-t border-slate-100">
//           <p className="text-xs text-slate-400 font-medium">
//             Showing{" "}
//             <span className="font-bold text-slate-700">{Math.min((page - 1) * PER_PAGE + 1, filtered.length)}</span>
//             {" "}–{" "}
//             <span className="font-bold text-slate-700">{Math.min(page * PER_PAGE, filtered.length)}</span>
//             {" "}of{" "}
//             <span className="font-bold text-slate-700">{filtered.length}</span> transactions
//           </p>

//           <div className="flex items-center gap-1">
//             <button
//               onClick={() => setPage(1)}
//               disabled={page === 1}
//               className="px-2.5 py-1.5 rounded-lg text-xs font-bold text-slate-500 hover:bg-slate-100 disabled:opacity-30 disabled:cursor-not-allowed transition"
//             >
//               «
//             </button>
//             <button
//               onClick={() => setPage(p => Math.max(1, p - 1))}
//               disabled={page === 1}
//               className="px-3 py-1.5 rounded-lg text-xs font-semibold text-slate-600 hover:bg-slate-100 disabled:opacity-30 disabled:cursor-not-allowed transition"
//             >
//               ← Prev
//             </button>
//             {Array.from({ length: totalPages }, (_, i) => i + 1).map(p => (
//               <button
//                 key={p}
//                 onClick={() => setPage(p)}
//                 className={`w-8 h-8 rounded-lg text-xs font-bold transition
//                   ${page === p ? "bg-slate-900 text-white shadow-sm" : "text-slate-500 hover:bg-slate-100"}`}
//               >
//                 {p}
//               </button>
//             ))}
//             <button
//               onClick={() => setPage(p => Math.min(totalPages, p + 1))}
//               disabled={page === totalPages || totalPages === 0}
//               className="px-3 py-1.5 rounded-lg text-xs font-semibold text-slate-600 hover:bg-slate-100 disabled:opacity-30 disabled:cursor-not-allowed transition"
//             >
//               Next →
//             </button>
//             <button
//               onClick={() => setPage(totalPages)}
//               disabled={page === totalPages || totalPages === 0}
//               className="px-2.5 py-1.5 rounded-lg text-xs font-bold text-slate-500 hover:bg-slate-100 disabled:opacity-30 disabled:cursor-not-allowed transition"
//             >
//               »
//             </button>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default Transactions;