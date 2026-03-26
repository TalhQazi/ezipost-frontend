import { useState, useMemo, useEffect } from "react";
import {
  FileCheck,
  CreditCard,
  ShieldX,
  History,
  CheckCircle,
  Download,
  Filter,
  Search,
  ChevronDown,
} from "lucide-react";
import Table from "../components/table";
import { useDispatch, useSelector } from "react-redux";
import { fetchMails } from "../redux/mailSlice";

const STATUS_FILTERS = ["All Statuses", "Processed", "Escrow Used", "Failed", "Pending"];

// ─── STATUS BADGE ─────────────────────────────────────────────────────────────

const StatusBadge = ({ status }) => {
  const cfg = {
    Processed:     { bg: "bg-emerald-50", text: "text-emerald-600", border: "border-emerald-200", dot: "bg-emerald-500" },
    "Escrow Used": { bg: "bg-yellow-50",  text: "text-yellow-600",  border: "border-yellow-200",  dot: "bg-yellow-500"  },
    Failed:        { bg: "bg-red-50",     text: "text-red-600",     border: "border-red-200",     dot: "bg-red-500"     },
    Pending:       { bg: "bg-blue-50",    text: "text-blue-600",    border: "border-blue-200",    dot: "bg-blue-400"    },
  }[status] || {};

  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border ${cfg.bg} ${cfg.text} ${cfg.border}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot}`}></span>
      {status}
    </span>
  );
};

// ─── STAT CARD ────────────────────────────────────────────────────────────────

const StatCard = ({ icon: Icon, iconBg, iconColor, label, value }) => (
  <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5 flex items-center gap-4 hover:shadow-md transition-shadow">
    <div className={`w-14 h-14 rounded-2xl ${iconBg} flex items-center justify-center flex-shrink-0`}>
      <Icon size={24} className={iconColor} />
    </div>
    <div>
      <p className="text-sm text-slate-400 font-medium">{label}</p>
      <p className="text-3xl font-extrabold text-slate-800 leading-tight">{value}</p>
    </div>
  </div>
);

// ─── MAIN PAGE ────────────────────────────────────────────────────────────────

const MailProcessing = () => {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All Statuses");
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [page, setPage] = useState(1);
  const PER_PAGE = 10;

  const dispatch = useDispatch();
  const { mails = [], loading } = useSelector((state) => state.mail);

  useEffect(() => {
    dispatch(fetchMails({ search, status: statusFilter }));
  }, [search, statusFilter, dispatch]);

  // ── Counts (derived from all mails from Redux) ──
  const counts = useMemo(() => ({
    processed:  mails.filter(m => m.status === "Processed").length,
    escrowUsed: mails.filter(m => m.status === "Escrow Used").length,
    failed:     mails.filter(m => m.status === "Failed").length,
    pending:    mails.filter(m => m.status === "Pending").length,
  }), [mails]);

  // ── Client-side filtering (if backend doesn't filter) ──
  const filtered = useMemo(() => {
    return mails.filter(m => {
      const matchesStatus =
        statusFilter === "All Statuses" || m.status === statusFilter;
      const matchesSearch =
        !search ||
        m.id?.toLowerCase().includes(search.toLowerCase()) ||
        m.tracking?.toLowerCase().includes(search.toLowerCase());
      return matchesStatus && matchesSearch;
    });
  }, [mails, search, statusFilter]);

  const paginated = filtered.slice((page - 1) * PER_PAGE, page * PER_PAGE);
  const totalPages = Math.ceil(filtered.length / PER_PAGE);

  const handleExport = () => {
    const header = "Mail ID,Tracking,Time,Class,Paid,Required,Shortfall,Escrow Account,Status";
    const rows = filtered.map(m =>
      `${m.id},${m.tracking},${m.time},${m.mailClass},$${m.paid},$${m.required},$${m.shortfall},${m.escrow || "-"},${m.status}`
    );
    const csv = [header, ...rows].join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "mail_processing.csv";
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="min-h-screen bg-slate-50 p-6 space-y-6">

      {/* ── HEADER ── */}
      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Mail Processing</h1>
          <p className="text-slate-400 text-sm mt-1">Real-time monitoring of mail piece processing</p>
        </div>
        <button
          onClick={handleExport}
          className="flex items-center gap-2 px-5 py-2.5 bg-slate-900 hover:bg-slate-700 text-white rounded-xl text-sm font-bold shadow-md transition self-start"
        >
          <Download size={15} /> Export Data
        </button>
      </div>

      {/* ── STAT CARDS ── */}
      <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
        <StatCard icon={FileCheck} iconBg="bg-emerald-50" iconColor="text-emerald-500" label="Processed"   value={counts.processed}  />
        <StatCard icon={CreditCard} iconBg="bg-yellow-50" iconColor="text-yellow-500" label="Escrow Used" value={counts.escrowUsed} />
        <StatCard icon={ShieldX}    iconBg="bg-red-50"    iconColor="text-red-500"    label="Failed"      value={counts.failed}     />
        <StatCard icon={History}    iconBg="bg-blue-50"   iconColor="text-blue-500"   label="Pending"     value={counts.pending}    />
      </div>

      {/* ── SEARCH & FILTER ── */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-4 flex flex-col sm:flex-row gap-3">
        <div className="flex-1 flex items-center gap-3 bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5">
          <Search size={16} className="text-slate-400 flex-shrink-0" />
          <input
            type="text"
            placeholder="Search by tracking number or ID..."
            value={search}
            onChange={e => { setSearch(e.target.value); setPage(1); }}
            className="bg-transparent outline-none text-sm text-slate-700 placeholder-slate-400 w-full"
          />
        </div>

        {/* Status Dropdown */}
        <div className="relative">
          <button
            onClick={() => setDropdownOpen(o => !o)}
            className="flex items-center gap-2 px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold text-slate-700 hover:bg-slate-100 transition min-w-[160px] justify-between"
          >
            <div className="flex items-center gap-2">
              <Filter size={14} className="text-slate-400" />
              {statusFilter}
            </div>
            <ChevronDown size={14} className={`text-slate-400 transition-transform ${dropdownOpen ? "rotate-180" : ""}`} />
          </button>

          {dropdownOpen && (
            <div className="absolute right-0 mt-2 w-48 bg-white border border-slate-200 rounded-xl shadow-xl z-20 overflow-hidden">
              {STATUS_FILTERS.map(f => (
                <button
                  key={f}
                  onClick={() => { setStatusFilter(f); setDropdownOpen(false); setPage(1); }}
                  className={`w-full text-left px-4 py-2.5 text-sm font-medium transition flex items-center justify-between
                    ${statusFilter === f ? "bg-slate-50 text-slate-900" : "text-slate-600 hover:bg-slate-50"}`}
                >
                  {f}
                  {statusFilter === f && <CheckCircle size={14} className="text-emerald-500" />}
                </button>
              ))}
            </div>
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
              label: "MAIL ID",
              render: (m) => <span className="font-bold text-slate-800 whitespace-nowrap">{m.id}</span>,
            },
            {
              key: "tracking",
              label: "TRACKING",
              render: (m) => <span className="text-slate-500 font-mono text-xs">{m.tracking}</span>,
            },
            {
              key: "time",
              label: "TIME",
              render: (m) => <span className="text-slate-500 whitespace-nowrap">{m.time}</span>,
            },
            {
              key: "mailClass",
              label: "CLASS",
              render: (m) => <span className="text-slate-700 font-medium">{m.mailClass}</span>,
            },
            {
              key: "paid",
              label: "PAID",
              render: (m) => <span className="text-slate-700 font-semibold">${m.paid.toFixed(2)}</span>,
            },
            {
              key: "required",
              label: "REQUIRED",
              render: (m) => <span className="text-slate-700 font-semibold">${m.required.toFixed(2)}</span>,
            },
            {
              key: "shortfall",
              label: "SHORTFALL",
              render: (m) => (
                <span className={`font-semibold ${m.shortfall > 0 ? "text-red-500" : "text-slate-400"}`}>
                  {m.shortfall > 0
                    ? `$${m.shortfall.toFixed(2)}`
                    : m.shortfall < 0
                    ? `$${m.shortfall.toFixed(2)}`
                    : "$0.00"}
                </span>
              ),
            },
            {
              key: "escrow",
              label: "ESCROW ACCOUNT",
              render: (m) => (
                <span className="text-slate-500 text-xs font-mono">
                  {m.escrow || <span className="text-slate-300">—</span>}
                </span>
              ),
            },
            {
              key: "status",
              label: "STATUS",
              render: (m) => <StatusBadge status={m.status} />,
            },
          ]}
        />

        {/* ── PAGINATION ── */}
        <div className="flex items-center justify-between px-5 py-4 border-t border-slate-100">
          <p className="text-xs text-slate-400 font-medium">
            Showing{" "}
            <span className="font-bold text-slate-600">
              {filtered.length === 0 ? 0 : (page - 1) * PER_PAGE + 1}
            </span>
            –
            <span className="font-bold text-slate-600">
              {Math.min(page * PER_PAGE, filtered.length)}
            </span>{" "}
            of{" "}
            <span className="font-bold text-slate-600">{filtered.length}</span> records
          </p>
          <div className="flex items-center gap-1">
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
          </div>
        </div>
      </div>
    </div>
  );
};

export default MailProcessing;