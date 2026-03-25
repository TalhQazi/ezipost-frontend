import { useState, useMemo } from "react";
import {
  Search,
  Download,
  Filter,
  ChevronDown,
  X,
  ArrowUpRight,
  ArrowDownLeft,
  RefreshCw,
  AlertCircle,
  Hash,
  TrendingUp,
  CheckCircle,
  Clock,
} from "lucide-react";
import Table from "../components/table";

// ─── MOCK DATA ────────────────────────────────────────────────────────────────

const rawTransactions = [
  { id: "TXN-00100005", ref: "MMH09V0C7V", timestamp: "3/20/2026, 5:31:31 AM",  type: "Fee",        amount: 19.00,  escrow: "EA-005007", mailId: "MP00010335", status: "Failed"    },
  { id: "TXN-00100043", ref: "2BB7HR087X", timestamp: "3/19/2026, 9:24:35 PM",  type: "Adjustment", amount: 45.36,  escrow: "EA-005002", mailId: "MP00010685", status: "Completed" },
  { id: "TXN-00100008", ref: "Y97PB7K0WC", timestamp: "3/19/2026, 9:32:56 AM",  type: "Fee",        amount: 23.79,  escrow: "EA-005005", mailId: "MP00010850", status: "Pending"   },
  { id: "TXN-00100009", ref: "NCZ5ZW72TZ", timestamp: "3/18/2026, 2:43:41 PM",  type: "Adjustment", amount: 1.90,   escrow: "EA-005009", mailId: "MP00010595", status: "Failed"    },
  { id: "TXN-00100035", ref: "DTSM1JZNPP", timestamp: "3/18/2026, 12:55:13 PM", type: "Adjustment", amount: 6.42,   escrow: "EA-005014", mailId: "MP00010598", status: "Completed" },
  { id: "TXN-00100032", ref: "DZHSMZ6ZO8", timestamp: "3/17/2026, 9:57:14 PM",  type: "Refund",     amount: 32.16,  escrow: "EA-005004", mailId: "MP00010443", status: "Completed" },
  { id: "TXN-00100021", ref: "XKJP8C4M2W", timestamp: "3/17/2026, 4:10:05 PM",  type: "Debit",      amount: 58.00,  escrow: "EA-005001", mailId: "MP00010210", status: "Completed" },
  { id: "TXN-00100018", ref: "TLQR3F7N9B", timestamp: "3/17/2026, 11:23:44 AM", type: "Credit",     amount: 200.00, escrow: "EA-005003", mailId: "MP00010180", status: "Completed" },
  { id: "TXN-00100047", ref: "VWNE5D2K7J", timestamp: "3/16/2026, 7:45:18 PM",  type: "Fee",        amount: 12.50,  escrow: "EA-005006", mailId: "MP00010470", status: "Pending"   },
  { id: "TXN-00100030", ref: "CBPZ9Y1H6L", timestamp: "3/16/2026, 3:08:52 PM",  type: "Refund",     amount: 75.00,  escrow: "EA-005008", mailId: "MP00010300", status: "Completed" },
  { id: "TXN-00100011", ref: "MNQR6A8T3F", timestamp: "3/15/2026, 6:50:20 PM",  type: "Debit",      amount: 33.40,  escrow: "EA-005010", mailId: "MP00010110", status: "Failed"    },
  { id: "TXN-00100026", ref: "WKSH4P0M2G", timestamp: "3/15/2026, 1:17:39 PM",  type: "Adjustment", amount: 9.99,   escrow: "EA-005012", mailId: "MP00010260", status: "Pending"   },
  { id: "TXN-00100039", ref: "EZFV7C3N8X", timestamp: "3/14/2026, 10:34:07 AM", type: "Credit",     amount: 500.00, escrow: "EA-005000", mailId: "MP00010390", status: "Completed" },
  { id: "TXN-00100002", ref: "JHDM2R9K5T", timestamp: "3/14/2026, 8:21:55 AM",  type: "Fee",        amount: 4.75,   escrow: "EA-005013", mailId: "MP00010020", status: "Completed" },
  { id: "TXN-00100050", ref: "PZQW1B6N4V", timestamp: "3/13/2026, 5:56:30 PM",  type: "Debit",      amount: 87.20,  escrow: "EA-005015", mailId: "MP00010500", status: "Pending"   },
  { id: "TXN-00100015", ref: "RTYX8J2M7C", timestamp: "3/13/2026, 2:42:11 PM",  type: "Refund",     amount: 14.00,  escrow: "EA-005011", mailId: "MP00010150", status: "Completed" },
  { id: "TXN-00100044", ref: "KBFN3D9P1W", timestamp: "3/12/2026, 11:05:48 AM", type: "Adjustment", amount: 3.22,   escrow: "EA-005016", mailId: "MP00010440", status: "Failed"    },
  { id: "TXN-00100037", ref: "LCHQ7G4V0R", timestamp: "3/12/2026, 9:19:03 AM",  type: "Credit",     amount: 150.00, escrow: "EA-005002", mailId: "MP00010370", status: "Completed" },
  { id: "TXN-00100023", ref: "SMWZ5K1J8N", timestamp: "3/11/2026, 6:38:27 PM",  type: "Fee",        amount: 7.88,   escrow: "EA-005004", mailId: "MP00010230", status: "Pending"   },
  { id: "TXN-00100048", ref: "GNVY2T6H3Q", timestamp: "3/11/2026, 3:15:59 PM",  type: "Debit",      amount: 62.50,  escrow: "EA-005007", mailId: "MP00010480", status: "Completed" },
];

const TYPE_FILTERS   = ["All Types",   "Fee", "Adjustment", "Refund", "Debit", "Credit"];
const STATUS_FILTERS = ["All Statuses","Completed", "Pending", "Failed"];
const PER_PAGE = 10;

// ─── HELPERS ──────────────────────────────────────────────────────────────────

const fmt = (n) =>
  n.toLocaleString("en-US", { style: "currency", currency: "USD", minimumFractionDigits: 2 });

// ─── TYPE BADGE ───────────────────────────────────────────────────────────────

const TypeBadge = ({ type }) => {
  const cfg = {
    Fee:        { bg: "bg-purple-50",  text: "text-purple-600",  border: "border-purple-200" },
    Adjustment: { bg: "bg-amber-50",   text: "text-amber-600",   border: "border-amber-200"  },
    Refund:     { bg: "bg-emerald-50", text: "text-emerald-600", border: "border-emerald-200"},
    Debit:      { bg: "bg-red-50",     text: "text-red-500",     border: "border-red-200"    },
    Credit:     { bg: "bg-blue-50",    text: "text-blue-600",    border: "border-blue-200"   },
  }[type] || { bg: "bg-slate-50", text: "text-slate-500", border: "border-slate-200" };

  const icons = {
    Fee:        <Hash size={10} />,
    Adjustment: <RefreshCw size={10} />,
    Refund:     <ArrowDownLeft size={10} />,
    Debit:      <ArrowUpRight size={10} />,
    Credit:     <ArrowDownLeft size={10} />,
  };

  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold border ${cfg.bg} ${cfg.text} ${cfg.border}`}>
      {icons[type]} {type}
    </span>
  );
};

// ─── STATUS BADGE ─────────────────────────────────────────────────────────────

const StatusBadge = ({ status }) => {
  const cfg = {
    Completed: { bg: "bg-slate-900", text: "text-white" },
    Pending:   { bg: "bg-slate-100", text: "text-slate-500" },
    Failed:    { bg: "bg-red-500",   text: "text-white"    },
  }[status] || { bg: "bg-slate-100", text: "text-slate-500" };

  return (
    <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-extrabold ${cfg.bg} ${cfg.text}`}>
      {status}
    </span>
  );
};

// ─── DROPDOWN ─────────────────────────────────────────────────────────────────

const Dropdown = ({ value, onChange, options, icon: Icon }) => {
  const [open, setOpen] = useState(false);
  return (
    <div className="relative">
      <button
        onClick={() => setOpen(o => !o)}
        className="flex items-center gap-2 px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold text-slate-700 hover:bg-slate-100 transition min-w-[150px] justify-between"
      >
        <div className="flex items-center gap-2">
          {Icon && <Icon size={14} className="text-slate-400" />}
          {value}
        </div>
        <ChevronDown size={13} className={`text-slate-400 transition-transform ${open ? "rotate-180" : ""}`} />
      </button>
      {open && (
        <div className="absolute left-0 mt-2 w-48 bg-white border border-slate-200 rounded-xl shadow-xl z-20 overflow-hidden">
          {options.map(o => (
            <button
              key={o}
              onClick={() => { onChange(o); setOpen(false); }}
              className={`w-full text-left px-4 py-2.5 text-sm font-medium transition flex items-center justify-between
                ${value === o ? "bg-slate-50 text-slate-900 font-bold" : "text-slate-600 hover:bg-slate-50"}`}
            >
              {o}
              {value === o && <CheckCircle size={13} className="text-emerald-500" />}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

// ─── MAIN PAGE ────────────────────────────────────────────────────────────────

const Transactions = () => {
  const [search,       setSearch]       = useState("");
  const [typeFilter,   setTypeFilter]   = useState("All Types");
  const [statusFilter, setStatusFilter] = useState("All Statuses");
  const [page,         setPage]         = useState(1);

  const filtered = useMemo(() => {
    return rawTransactions.filter(t => {
      const q = search.toLowerCase();
      const matchSearch = !q ||
        t.id.toLowerCase().includes(q) ||
        t.ref.toLowerCase().includes(q) ||
        t.escrow.toLowerCase().includes(q) ||
        t.mailId.toLowerCase().includes(q);
      const matchType   = typeFilter   === "All Types"    || t.type   === typeFilter;
      const matchStatus = statusFilter === "All Statuses" || t.status === statusFilter;
      return matchSearch && matchType && matchStatus;
    });
  }, [search, typeFilter, statusFilter]);

  const paginated  = filtered.slice((page - 1) * PER_PAGE, page * PER_PAGE);
  const totalPages = Math.ceil(filtered.length / PER_PAGE);

  const totalAmount = filtered.reduce((s, t) => s + t.amount, 0);
  const completed   = filtered.filter(t => t.status === "Completed").length;
  const pending     = filtered.filter(t => t.status === "Pending").length;
  const failed      = filtered.filter(t => t.status === "Failed").length;

  const handleExport = () => {
    const header = "Transaction ID,Ref,Timestamp,Type,Amount,Escrow Account,Mail ID,Status";
    const rows   = filtered.map(t =>
      `${t.id},${t.ref},${t.timestamp},${t.type},${fmt(t.amount)},${t.escrow},${t.mailId},${t.status}`
    );
    const blob = new Blob([[header, ...rows].join("\n")], { type: "text/csv" });
    const url  = URL.createObjectURL(blob);
    const a    = document.createElement("a");
    a.href = url; a.download = "transactions.csv"; a.click();
    URL.revokeObjectURL(url);
  };

  const resetFilters = () => {
    setSearch(""); setTypeFilter("All Types"); setStatusFilter("All Statuses"); setPage(1);
  };
  const hasFilters = search || typeFilter !== "All Types" || statusFilter !== "All Statuses";

  return (
    <div className="min-h-screen bg-slate-50 p-6 space-y-6">

      {/* ── HEADER ── */}
      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Transaction History</h1>
          <p className="text-slate-400 text-sm mt-1 font-medium">Complete ledger of all escrow transactions</p>
        </div>
        <button
          onClick={handleExport}
          className="flex items-center gap-2 px-5 py-2.5 bg-slate-900 hover:bg-slate-700 text-white rounded-xl text-sm font-extrabold shadow-lg transition self-start"
        >
          <Download size={15} /> Export Transactions
        </button>
      </div>

      {/* ── STAT CARDS ── */}
      <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
        {[
          {
            label: "Total Transactions",
            value: filtered.length.toString(),
            valClass: "text-slate-900",
            sub: `${rawTransactions.length} total records`,
            icon: Hash,
            iconBg: "bg-slate-100",
            iconColor: "text-slate-600",
          },
          {
            label: "Total Amount",
            value: fmt(totalAmount),
            valClass: "text-slate-900",
            sub: "Filtered transactions",
            icon: TrendingUp,
            iconBg: "bg-blue-50",
            iconColor: "text-blue-500",
          },
          {
            label: "Completed",
            value: completed.toString(),
            valClass: "text-emerald-500",
            sub: `${failed} failed`,
            icon: CheckCircle,
            iconBg: "bg-emerald-50",
            iconColor: "text-emerald-500",
          },
          {
            label: "Pending",
            value: pending.toString(),
            valClass: "text-amber-500",
            sub: "Awaiting processing",
            icon: Clock,
            iconBg: "bg-amber-50",
            iconColor: "text-amber-500",
          },
        ].map((c, i) => {
          const Icon = c.icon;
          return (
            <div key={i} className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5 hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between mb-3">
                <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">{c.label}</p>
                <div className={`w-10 h-10 rounded-xl ${c.iconBg} flex items-center justify-center`}>
                  <Icon size={18} className={c.iconColor} />
                </div>
              </div>
              <p className={`text-2xl font-extrabold leading-tight ${c.valClass}`}>{c.value}</p>
              <p className="text-xs text-slate-400 font-medium mt-1">{c.sub}</p>
            </div>
          );
        })}
      </div>

      {/* ── FILTERS ── */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-4 flex flex-col sm:flex-row gap-3 items-stretch sm:items-center">
        {/* Search */}
        <div className="flex-1 flex items-center gap-3 bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5">
          <Search size={15} className="text-slate-400 flex-shrink-0" />
          <input
            type="text"
            placeholder="Search transactions..."
            value={search}
            onChange={e => { setSearch(e.target.value); setPage(1); }}
            className="bg-transparent outline-none text-sm text-slate-700 placeholder-slate-400 w-full font-medium"
          />
          {search && (
            <button onClick={() => setSearch("")} className="text-slate-300 hover:text-slate-500 transition">
              <X size={14} />
            </button>
          )}
        </div>

        <div className="flex gap-2 flex-wrap">
          <Dropdown value={typeFilter}   onChange={v => { setTypeFilter(v);   setPage(1); }} options={TYPE_FILTERS}   icon={Filter} />
          <Dropdown value={statusFilter} onChange={v => { setStatusFilter(v); setPage(1); }} options={STATUS_FILTERS} icon={Filter} />
          {hasFilters && (
            <button
              onClick={resetFilters}
              className="flex items-center gap-1.5 px-4 py-2.5 text-xs font-bold text-slate-500 hover:text-slate-700 bg-slate-50 border border-slate-200 rounded-xl hover:bg-slate-100 transition"
            >
              <X size={12} /> Clear
            </button>
          )}
        </div>
      </div>


      {/* ── TABLE ── */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden p-4">
        <Table
          data={paginated}
          columns={[
            {
              key: "id",
              label: "TRANSACTION ID",
              render: (t) => (
                <div>
                  <p className="font-extrabold text-slate-900 text-sm">{t.id}</p>
                  <p className="text-xs text-slate-400 font-mono mt-0.5">Ref: {t.ref}</p>
                </div>
              ),
            },
            {
              key: "timestamp",
              label: "TIMESTAMP",
              render: (t) => <span className="text-slate-500 text-xs font-medium whitespace-nowrap">{t.timestamp}</span>,
            },
            {
              key: "type",
              label: "TYPE",
              render: (t) => <TypeBadge type={t.type} />,
            },
            {
              key: "amount",
              label: "AMOUNT",
              render: (t) => (
                <span className={`font-extrabold text-sm ${
                  t.type === "Refund" || t.type === "Credit" ? "text-emerald-600" : "text-slate-800"
                }`}>
                  {t.type === "Refund" || t.type === "Credit" ? "+" : ""}{fmt(t.amount)}
                </span>
              ),
            },
            {
              key: "escrow",
              label: "ESCROW ACCOUNT",
              render: (t) => (
                <div className="flex items-center gap-2">
                  <div className={`w-2 h-2 rounded-full ${t.status === "Failed" ? "bg-red-400" : "bg-emerald-400"}`} />
                  <span className="text-slate-600 font-semibold text-xs">{t.escrow}</span>
                </div>
              ),
            },
            {
              key: "mailId",
              label: "MAIL ID",
              render: (t) => <span className="text-slate-500 font-mono text-xs font-medium">{t.mailId}</span>,
            },
            {
              key: "status",
              label: "STATUS",
              render: (t) => <StatusBadge status={t.status} />,
            },
          ]}
        />

        {/* ── PAGINATION ── */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 px-5 py-4 border-t border-slate-100">
          <p className="text-xs text-slate-400 font-medium">
            Showing{" "}
            <span className="font-bold text-slate-700">{Math.min((page - 1) * PER_PAGE + 1, filtered.length)}</span>
            {" "}–{" "}
            <span className="font-bold text-slate-700">{Math.min(page * PER_PAGE, filtered.length)}</span>
            {" "}of{" "}
            <span className="font-bold text-slate-700">{filtered.length}</span> transactions
          </p>

          <div className="flex items-center gap-1">
            <button
              onClick={() => setPage(1)}
              disabled={page === 1}
              className="px-2.5 py-1.5 rounded-lg text-xs font-bold text-slate-500 hover:bg-slate-100 disabled:opacity-30 disabled:cursor-not-allowed transition"
            >
              «
            </button>
            <button
              onClick={() => setPage(p => Math.max(1, p - 1))}
              disabled={page === 1}
              className="px-3 py-1.5 rounded-lg text-xs font-semibold text-slate-600 hover:bg-slate-100 disabled:opacity-30 disabled:cursor-not-allowed transition"
            >
              ← Prev
            </button>
            {Array.from({ length: totalPages }, (_, i) => i + 1).map(p => (
              <button
                key={p}
                onClick={() => setPage(p)}
                className={`w-8 h-8 rounded-lg text-xs font-bold transition
                  ${page === p ? "bg-slate-900 text-white shadow-sm" : "text-slate-500 hover:bg-slate-100"}`}
              >
                {p}
              </button>
            ))}
            <button
              onClick={() => setPage(p => Math.min(totalPages, p + 1))}
              disabled={page === totalPages || totalPages === 0}
              className="px-3 py-1.5 rounded-lg text-xs font-semibold text-slate-600 hover:bg-slate-100 disabled:opacity-30 disabled:cursor-not-allowed transition"
            >
              Next →
            </button>
            <button
              onClick={() => setPage(totalPages)}
              disabled={page === totalPages || totalPages === 0}
              className="px-2.5 py-1.5 rounded-lg text-xs font-bold text-slate-500 hover:bg-slate-100 disabled:opacity-30 disabled:cursor-not-allowed transition"
            >
              »
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Transactions;