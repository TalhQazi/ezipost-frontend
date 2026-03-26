import { useState, useEffect } from "react";
import {
  Info,
  AlertTriangle,
  AlertOctagon,
  ShieldAlert,
  Search,
  Filter,
  Download,
  ChevronDown,
  X,
  CheckCircle,
  Terminal,
  RefreshCw,
} from "lucide-react";
import Table from "../components/table";
import { useDispatch, useSelector } from "react-redux";
import { fetchAuditLogs, fetchAuditStats } from "../redux/auditSlice";

// ─── CONSTANTS ────────────────────────────────────────────────────────────────

const ALL_SEVERITY_OPTIONS = ["All Severities", "INFO", "WARNING", "ERROR", "CRITICAL"];
const PER_PAGE = 12;

// ─── SEVERITY CONFIG ──────────────────────────────────────────────────────────

const sevCfg = {
  INFO:     { pill: "bg-blue-50 text-blue-600 border-blue-200",     icon: Info,         iconBg: "bg-blue-50",   iconColor: "text-blue-500"   },
  WARNING:  { pill: "bg-amber-50 text-amber-600 border-amber-200",  icon: AlertTriangle, iconBg: "bg-amber-50",  iconColor: "text-amber-500"  },
  ERROR:    { pill: "bg-red-50 text-red-600 border-red-200",        icon: AlertOctagon,  iconBg: "bg-red-50",    iconColor: "text-red-500"    },
  CRITICAL: { pill: "bg-purple-50 text-purple-700 border-purple-200", icon: ShieldAlert, iconBg: "bg-purple-50", iconColor: "text-purple-600" },
  // backend lowercase variants
  low:      { pill: "bg-blue-50 text-blue-600 border-blue-200",     icon: Info,          iconBg: "bg-blue-50",   iconColor: "text-blue-500"   },
  medium:   { pill: "bg-amber-50 text-amber-600 border-amber-200",  icon: AlertTriangle, iconBg: "bg-amber-50",  iconColor: "text-amber-500"  },
  high:     { pill: "bg-red-50 text-red-600 border-red-200",        icon: AlertOctagon,  iconBg: "bg-red-50",    iconColor: "text-red-500"    },
  critical: { pill: "bg-purple-50 text-purple-700 border-purple-200", icon: ShieldAlert, iconBg: "bg-purple-50", iconColor: "text-purple-600" },
};

// ─── REUSABLE DROPDOWN ────────────────────────────────────────────────────────

const Dropdown = ({ value, onChange, options }) => {
  const [open, setOpen] = useState(false);
  return (
    <div className="relative">
      <button
        onClick={() => setOpen((o) => !o)}
        className="flex items-center gap-2 px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold text-slate-700 hover:bg-slate-100 transition min-w-[170px] justify-between"
      >
        <div className="flex items-center gap-2">
          <Filter size={13} className="text-slate-400" />
          {value}
        </div>
        <ChevronDown size={13} className={`text-slate-400 transition-transform ${open ? "rotate-180" : ""}`} />
      </button>
      {open && (
        <div className="absolute left-0 mt-2 w-56 bg-white border border-slate-200 rounded-xl shadow-2xl z-30 overflow-hidden max-h-64 overflow-y-auto">
          {options.map((o) => (
            <button
              key={o}
              onClick={() => { onChange(o); setOpen(false); }}
              className={`w-full text-left px-4 py-2.5 text-sm transition flex items-center justify-between
                ${value === o ? "bg-slate-50 font-bold text-slate-900" : "text-slate-600 hover:bg-slate-50 font-medium"}`}
            >
              {o}
              {value === o && <CheckCircle size={12} className="text-emerald-500" />}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

// ─── SEVERITY BADGE ───────────────────────────────────────────────────────────

const SeverityBadge = ({ sev }) => {
  const key = sev?.toUpperCase() || "INFO";
  const cfg = sevCfg[sev] || sevCfg[key] || sevCfg["INFO"];
  const Icon = cfg.icon;
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-extrabold border ${cfg.pill}`}>
      <Icon size={11} />
      {sev?.toUpperCase()}
    </span>
  );
};

// ─── EVENT TYPE PILL ──────────────────────────────────────────────────────────

const EventPill = ({ type }) => (
  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-slate-100 text-slate-600 text-xs font-mono font-semibold border border-slate-200">
    <Terminal size={10} />
    {type}
  </span>
);

// ─── STAT CARD ────────────────────────────────────────────────────────────────

const StatCard = ({ icon: Icon, iconBg, iconColor, label, value, valClass = "text-slate-900" }) => (
  <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5 flex items-center gap-4 hover:shadow-md transition-shadow">
    <div className={`w-14 h-14 rounded-2xl ${iconBg} flex items-center justify-center flex-shrink-0`}>
      <Icon size={26} className={iconColor} />
    </div>
    <div>
      <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-0.5">{label}</p>
      <p className={`text-3xl font-extrabold leading-tight ${valClass}`}>{value ?? 0}</p>
    </div>
  </div>
);

// ─── MAIN PAGE ────────────────────────────────────────────────────────────────

const AuditLogs = () => {
  const [search, setSearch]       = useState("");
  const [sevFilter, setSevFilter] = useState("All Severities");
  const [page, setPage]           = useState(1);

  const dispatch = useDispatch();
  const { logs = [], stats = {}, pagination = {}, loading } = useSelector((state) => state.audit);

  // Fetch logs whenever search / severity / page changes
  useEffect(() => {
    dispatch(
      fetchAuditLogs({
        search,
        severity: sevFilter !== "All Severities" ? sevFilter.toLowerCase() : "",
        page,
        limit: PER_PAGE,
      })
    );
  }, [search, sevFilter, page, dispatch]);

  // Fetch stats once on mount
  useEffect(() => {
    dispatch(fetchAuditStats());
  }, [dispatch]);

  const totalPages   = pagination.pages || 1;
  const totalRecords = pagination.total || 0;
  const hasFilters   = search || sevFilter !== "All Severities";

  // ── Export (exports current page results from backend) ──
  const handleExport = () => {
    const header = "Log ID,Timestamp,Action,Severity,Status,User ID,IP Address,Resource,Details";
    const rows = logs.map((l) =>
      `${l._id},"${new Date(l.timestamp).toLocaleString()}",${l.action},${l.severity},${l.status},${l.userId},${l.ipAddress || "-"},${l.resource},"${JSON.stringify(l.details || {})}"`
    );
    const blob = new Blob([[header, ...rows].join("\n")], { type: "text/csv" });
    const url  = URL.createObjectURL(blob);
    const a    = document.createElement("a");
    a.href = url;
    a.download = "audit_logs.csv";
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleRefresh = () => {
    dispatch(fetchAuditLogs({ search, severity: sevFilter !== "All Severities" ? sevFilter.toLowerCase() : "", page, limit: PER_PAGE }));
    dispatch(fetchAuditStats());
  };

  // ── Stats from backend ──
  const statCards = [
    { label: "Low",      value: stats.lowCount,      icon: Info,          iconBg: "bg-blue-50",   iconColor: "text-blue-500",   valClass: "text-slate-900"  },
    { label: "Medium",   value: stats.mediumCount,   icon: AlertTriangle, iconBg: "bg-amber-50",  iconColor: "text-amber-500",  valClass: "text-slate-900"  },
    { label: "High",     value: stats.highCount,     icon: AlertOctagon,  iconBg: "bg-red-50",    iconColor: "text-red-500",    valClass: "text-red-500"    },
    { label: "Critical", value: stats.criticalCount, icon: ShieldAlert,   iconBg: "bg-purple-50", iconColor: "text-purple-600", valClass: "text-purple-600" },
  ];

  const total = (stats.lowCount || 0) + (stats.mediumCount || 0) + (stats.highCount || 0) + (stats.criticalCount || 0);

  const severityBar = [
    { pct: total ? ((stats.lowCount      || 0) / total) * 100 : 0, color: "bg-blue-400",   label: "Low",      count: stats.lowCount      || 0 },
    { pct: total ? ((stats.mediumCount   || 0) / total) * 100 : 0, color: "bg-amber-400",  label: "Medium",   count: stats.mediumCount   || 0 },
    { pct: total ? ((stats.highCount     || 0) / total) * 100 : 0, color: "bg-red-400",    label: "High",     count: stats.highCount     || 0 },
    { pct: total ? ((stats.criticalCount || 0) / total) * 100 : 0, color: "bg-purple-500", label: "Critical", count: stats.criticalCount || 0 },
  ];

  return (
    <div className="min-h-screen bg-slate-50 p-6 space-y-6">

      {/* ── HEADER ── */}
      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Audit Logs & Compliance</h1>
          <p className="text-slate-400 text-sm mt-1 font-medium">Immutable record of all system activities</p>
        </div>
        <div className="flex items-center gap-3 self-start">
          <button
            onClick={handleRefresh}
            className="flex items-center gap-2 px-4 py-2.5 bg-white border border-slate-200 text-slate-600 rounded-xl text-sm font-semibold hover:bg-slate-50 transition shadow-sm"
          >
            <RefreshCw size={14} /> Refresh
          </button>
          <button
            onClick={handleExport}
            className="flex items-center gap-2 px-5 py-2.5 bg-slate-900 hover:bg-slate-700 text-white rounded-xl text-sm font-extrabold shadow-lg transition"
          >
            <Download size={15} /> Export Logs
          </button>
        </div>
      </div>

      {/* ── STAT CARDS ── */}
      <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
        {statCards.map((c, i) => (
          <StatCard key={i} {...c} />
        ))}
      </div>

      {/* ── SEVERITY BREAKDOWN BAR ── */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-4">
        <div className="flex items-center justify-between mb-3">
          <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Severity Distribution</p>
          <p className="text-xs text-slate-400 font-medium">{total} total events</p>
        </div>
        <div className="flex h-3 rounded-full overflow-hidden gap-0.5">
          {severityBar.map((s, i) => (
            <div key={i} className={`${s.color} rounded-full transition-all`} style={{ width: `${s.pct}%` }} />
          ))}
        </div>
        <div className="flex items-center gap-5 mt-3 flex-wrap">
          {severityBar.map((s, i) => (
            <div key={i} className="flex items-center gap-1.5 text-xs text-slate-500">
              <span className={`w-2.5 h-2.5 rounded-full ${s.color}`}></span>
              <span className="font-semibold">{s.label}</span>
              <span className="font-bold text-slate-700">({s.count})</span>
            </div>
          ))}
        </div>
      </div>

      {/* ── FILTERS ── */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-4 flex flex-col sm:flex-row gap-3 items-stretch sm:items-center">
        <div className="flex-1 flex items-center gap-3 bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5">
          <Search size={15} className="text-slate-400 flex-shrink-0" />
          <input
            type="text"
            placeholder="Search by action, resource, user..."
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            className="bg-transparent outline-none text-sm text-slate-700 placeholder-slate-400 w-full font-medium"
          />
          {search && (
            <button onClick={() => setSearch("")} className="text-slate-300 hover:text-slate-500 transition">
              <X size={14} />
            </button>
          )}
        </div>
        <div className="flex gap-2 flex-wrap">
          <Dropdown
            value={sevFilter}
            onChange={(v) => { setSevFilter(v); setPage(1); }}
            options={ALL_SEVERITY_OPTIONS}
          />
          {hasFilters && (
            <button
              onClick={() => { setSearch(""); setSevFilter("All Severities"); setPage(1); }}
              className="flex items-center gap-1.5 px-4 py-2.5 text-xs font-bold text-slate-500 hover:text-slate-700 bg-slate-50 border border-slate-200 rounded-xl hover:bg-slate-100 transition"
            >
              <X size={12} /> Clear
            </button>
          )}
        </div>
      </div>

      {/* Results hint */}
      {hasFilters && (
        <p className="text-xs text-slate-400 font-medium -mt-2 px-1">
          {totalRecords} result{totalRecords !== 1 ? "s" : ""}
          {search && <> for <span className="font-bold text-slate-600">"{search}"</span></>}
        </p>
      )}

      {/* ── TABLE ── */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden p-4">

        {loading ? (
          <div className="flex items-center justify-center py-16">
            <div className="flex flex-col items-center gap-3">
              <div className="w-8 h-8 border-4 border-slate-200 border-t-slate-700 rounded-full animate-spin" />
              <p className="text-sm text-slate-400 font-medium">Loading logs...</p>
            </div>
          </div>
        ) : logs.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-slate-400">
            <ShieldAlert size={40} className="mb-3 opacity-30" />
            <p className="text-sm font-semibold">No audit logs found</p>
            <p className="text-xs mt-1">Try adjusting your search or filters</p>
          </div>
        ) : (
          <Table
            data={logs}
            columns={[
              {
                key: "_id",
                label: "LOG ID",
                render: (log) => (
                  <p className="font-extrabold text-slate-900 text-xs tracking-tight font-mono">
                    {String(log._id).slice(-8).toUpperCase()}
                  </p>
                ),
              },
              {
                key: "timestamp",
                label: "TIMESTAMP",
                render: (log) => (
                  <span className="text-slate-500 text-xs font-medium whitespace-nowrap">
                    {new Date(log.timestamp).toLocaleString("en-US")}
                  </span>
                ),
              },
              {
                key: "action",
                label: "ACTION",
                render: (log) => <EventPill type={log.action} />,
              },
              {
                key: "severity",
                label: "SEVERITY",
                render: (log) => <SeverityBadge sev={log.severity} />,
              },
              {
                key: "status",
                label: "STATUS",
                render: (log) => {
                  const statusCfg = {
                    success: "bg-emerald-50 text-emerald-600 border-emerald-200",
                    failure: "bg-red-50 text-red-600 border-red-200",
                    warning: "bg-amber-50 text-amber-600 border-amber-200",
                  };
                  return (
                    <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold border ${statusCfg[log.status] || "bg-slate-50 text-slate-500 border-slate-200"}`}>
                      {log.status}
                    </span>
                  );
                },
              },
              {
                key: "userId",
                label: "USER / SERVICE",
                render: (log) => (
                  <p className="text-slate-700 text-xs font-semibold">{log.userId}</p>
                ),
              },
              {
                key: "ipAddress",
                label: "IP ADDRESS",
                render: (log) => (
                  <span className="text-slate-500 font-mono text-xs font-medium whitespace-nowrap">
                    {log.ipAddress || "—"}
                  </span>
                ),
              },
              {
                key: "resource",
                label: "RESOURCE",
                render: (log) => (
                  <div className="max-w-xs">
                    <p className="text-slate-600 text-xs font-medium">{log.resource}</p>
                    {log.resourceId && (
                      <p className="text-xs text-slate-400 mt-0.5 font-mono">ID: {log.resourceId}</p>
                    )}
                  </div>
                ),
              },
            ]}
          />
        )}

        {/* ── PAGINATION ── */}
        {!loading && logs.length > 0 && (
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 px-5 py-4 border-t border-slate-100">
            <p className="text-xs text-slate-400 font-medium">
              Showing{" "}
              <span className="font-bold text-slate-700">
                {totalRecords === 0 ? 0 : (page - 1) * PER_PAGE + 1}
              </span>
              {" "}–{" "}
              <span className="font-bold text-slate-700">
                {Math.min(page * PER_PAGE, totalRecords)}
              </span>
              {" "}of{" "}
              <span className="font-bold text-slate-700">{totalRecords}</span> logs
            </p>

            <div className="flex items-center gap-1">
              <button
                onClick={() => setPage(1)}
                disabled={page === 1}
                className="px-2.5 py-1.5 rounded-lg text-xs font-bold text-slate-500 hover:bg-slate-100 disabled:opacity-30 disabled:cursor-not-allowed transition"
              >«</button>
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                className="px-3 py-1.5 rounded-lg text-xs font-semibold text-slate-600 hover:bg-slate-100 disabled:opacity-30 disabled:cursor-not-allowed transition"
              >← Prev</button>

              {Array.from({ length: Math.min(totalPages, 7) }, (_, i) => {
                let p;
                if (totalPages <= 7)           p = i + 1;
                else if (page <= 4)            p = i + 1;
                else if (page >= totalPages - 3) p = totalPages - 6 + i;
                else                           p = page - 3 + i;
                return (
                  <button
                    key={p}
                    onClick={() => setPage(p)}
                    className={`w-8 h-8 rounded-lg text-xs font-bold transition
                      ${page === p ? "bg-slate-900 text-white shadow-sm" : "text-slate-500 hover:bg-slate-100"}`}
                  >{p}</button>
                );
              })}

              <button
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page === totalPages || totalPages === 0}
                className="px-3 py-1.5 rounded-lg text-xs font-semibold text-slate-600 hover:bg-slate-100 disabled:opacity-30 disabled:cursor-not-allowed transition"
              >Next →</button>
              <button
                onClick={() => setPage(totalPages)}
                disabled={page === totalPages || totalPages === 0}
                className="px-2.5 py-1.5 rounded-lg text-xs font-bold text-slate-500 hover:bg-slate-100 disabled:opacity-30 disabled:cursor-not-allowed transition"
              >»</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AuditLogs;