import { useState, useMemo } from "react";
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
  Shield,
  Terminal,
  RefreshCw,
  ChevronRight,
} from "lucide-react";
import Table from "../components/table";

// ─── MOCK DATA ────────────────────────────────────────────────────────────────

const EVENT_TYPES = [
  "escrow.refund", "mail.failed", "auth.login", "auth.logout", "rate.updated",
  "escrow.debit", "mail.processed", "escrow.credit", "system.backup", "user.created",
  "rate.deleted", "mail.pending", "escrow.alert", "system.error", "auth.failed",
];

const SEVERITIES = ["INFO", "WARNING", "ERROR", "CRITICAL"];

const USERS = [
  "operator@ezpost.com", "system", "admin@ezpost.com", "service@ezpost.com",
  "audit@ezpost.com", "postage-engine", "escrow-service", "notify-service",
];

const IP_POOL = [
  "192.168.233.199", "192.168.118.241", "10.0.0.45", "10.0.1.12",
  "172.16.0.8", "192.168.1.100", "10.10.0.55", "127.0.0.1",
];

const seed = (i) => {
  const sev = SEVERITIES[i % 4];
  const evt = EVENT_TYPES[i % EVENT_TYPES.length];
  return {
    id:        `LOG-0100${String(i).padStart(4, "0")}`,
    timestamp: new Date(2026, 2, 20 - (i % 7), 23 - (i % 12), (i * 7) % 60, (i * 13) % 60)
                 .toLocaleString("en-US"),
    eventType: evt,
    severity:  sev,
    user:      USERS[i % USERS.length],
    ip:        IP_POOL[i % IP_POOL.length],
    desc:      `${evt} - ${sev.toLowerCase()} level event`,
    txnRef:    sev === "ERROR" || sev === "CRITICAL" ? `TXN-001${String(i * 3).padStart(5, "0")}` : null,
  };
};

const allLogs = Array.from({ length: 100 }, (_, i) => seed(i + 1));

const ALL_EVENT_OPTIONS    = ["All Events",     ...Array.from(new Set(allLogs.map(l => l.eventType)))];
const ALL_SEVERITY_OPTIONS = ["All Severities", "INFO", "WARNING", "ERROR", "CRITICAL"];
const PER_PAGE = 12;

// ─── SEVERITY CONFIG ──────────────────────────────────────────────────────────

const sevCfg = {
  INFO:     { pill: "bg-blue-50 text-blue-600 border-blue-200",     icon: Info,         iconBg: "bg-blue-50",   iconColor: "text-blue-500",   row: "" },
  WARNING:  { pill: "bg-amber-50 text-amber-600 border-amber-200",  icon: AlertTriangle,iconBg: "bg-amber-50",  iconColor: "text-amber-500",  row: "" },
  ERROR:    { pill: "bg-red-50 text-red-600 border-red-200",        icon: AlertOctagon, iconBg: "bg-red-50",    iconColor: "text-red-500",    row: "bg-red-50/30" },
  CRITICAL: { pill: "bg-purple-50 text-purple-700 border-purple-200",icon: ShieldAlert, iconBg: "bg-purple-50", iconColor: "text-purple-600", row: "bg-purple-50/20" },
};

// ─── REUSABLE DROPDOWN ────────────────────────────────────────────────────────

const Dropdown = ({ value, onChange, options }) => {
  const [open, setOpen] = useState(false);
  return (
    <div className="relative">
      <button
        onClick={() => setOpen(o => !o)}
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
          {options.map(o => (
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
  const c = sevCfg[sev];
  const Icon = c.icon;
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-extrabold border ${c.pill}`}>
      <Icon size={11} />
      {sev}
    </span>
  );
};

// ─── EVENT TYPE PILL ─────────────────────────────────────────────────────────

const EventPill = ({ type }) => (
  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-slate-100 text-slate-600 text-xs font-mono font-semibold border border-slate-200">
    <Terminal size={10} />
    {type}
  </span>
);

// ─── MAIN PAGE ────────────────────────────────────────────────────────────────

const AuditLogs = () => {
  const [search,    setSearch]    = useState("");
  const [evtFilter, setEvtFilter] = useState("All Events");
  const [sevFilter, setSevFilter] = useState("All Severities");
  const [page,      setPage]      = useState(1);

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return allLogs.filter(l => {
      const matchSearch = !q ||
        l.id.toLowerCase().includes(q) ||
        l.eventType.toLowerCase().includes(q) ||
        l.user.toLowerCase().includes(q) ||
        l.ip.includes(q) ||
        l.desc.toLowerCase().includes(q);
      const matchEvt = evtFilter === "All Events"      || l.eventType === evtFilter;
      const matchSev = sevFilter === "All Severities"  || l.severity  === sevFilter;
      return matchSearch && matchEvt && matchSev;
    });
  }, [search, evtFilter, sevFilter]);

  const paginated  = filtered.slice((page - 1) * PER_PAGE, page * PER_PAGE);
  const totalPages = Math.ceil(filtered.length / PER_PAGE);
  const hasFilters = search || evtFilter !== "All Events" || sevFilter !== "All Severities";

  const counts = useMemo(() => ({
    info:     allLogs.filter(l => l.severity === "INFO").length,
    warning:  allLogs.filter(l => l.severity === "WARNING").length,
    error:    allLogs.filter(l => l.severity === "ERROR").length,
    critical: allLogs.filter(l => l.severity === "CRITICAL").length,
  }), []);

  const handleExport = () => {
    const header = "Log ID,Timestamp,Event Type,Severity,User/Service,IP Address,Description";
    const rows   = filtered.map(l =>
      `${l.id},"${l.timestamp}",${l.eventType},${l.severity},${l.user},${l.ip},"${l.desc}"`
    );
    const blob = new Blob([[header, ...rows].join("\n")], { type: "text/csv" });
    const url  = URL.createObjectURL(blob);
    const a    = document.createElement("a");
    a.href = url; a.download = "audit_logs.csv"; a.click();
    URL.revokeObjectURL(url);
  };

  const statCards = [
    { label: "Info",     value: counts.info,     icon: Info,          iconBg: "bg-blue-50",   iconColor: "text-blue-500",   valClass: "text-slate-900" },
    { label: "Warnings", value: counts.warning,  icon: AlertTriangle, iconBg: "bg-amber-50",  iconColor: "text-amber-500",  valClass: "text-slate-900" },
    { label: "Errors",   value: counts.error,    icon: AlertOctagon,  iconBg: "bg-red-50",    iconColor: "text-red-500",    valClass: "text-red-500"   },
    { label: "Critical", value: counts.critical, icon: ShieldAlert,   iconBg: "bg-purple-50", iconColor: "text-purple-600", valClass: "text-purple-600"},
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
            onClick={() => window.location.reload()}
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
        {statCards.map((c, i) => {
          const Icon = c.icon;
          return (
            <div key={i} className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5 flex items-center gap-4 hover:shadow-md transition-shadow">
              <div className={`w-14 h-14 rounded-2xl ${c.iconBg} flex items-center justify-center flex-shrink-0`}>
                <Icon size={26} className={c.iconColor} />
              </div>
              <div>
                <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-0.5">{c.label}</p>
                <p className={`text-3xl font-extrabold leading-tight ${c.valClass}`}>{c.value}</p>
              </div>
            </div>
          );
        })}
      </div>

      {/* ── SEVERITY BREAKDOWN BAR ── */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-4">
        <div className="flex items-center justify-between mb-3">
          <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Severity Distribution</p>
          <p className="text-xs text-slate-400 font-medium">{allLogs.length} total events</p>
        </div>
        <div className="flex h-3 rounded-full overflow-hidden gap-0.5">
          {[
            { pct: (counts.info / allLogs.length) * 100,     color: "bg-blue-400"   },
            { pct: (counts.warning / allLogs.length) * 100,  color: "bg-amber-400"  },
            { pct: (counts.error / allLogs.length) * 100,    color: "bg-red-400"    },
            { pct: (counts.critical / allLogs.length) * 100, color: "bg-purple-500" },
          ].map((s, i) => (
            <div key={i} className={`${s.color} rounded-full transition-all`} style={{ width: `${s.pct}%` }} />
          ))}
        </div>
        <div className="flex items-center gap-5 mt-3">
          {[
            { label: "Info",     color: "bg-blue-400",   count: counts.info     },
            { label: "Warning",  color: "bg-amber-400",  count: counts.warning  },
            { label: "Error",    color: "bg-red-400",    count: counts.error    },
            { label: "Critical", color: "bg-purple-500", count: counts.critical },
          ].map((s, i) => (
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
            placeholder="Search logs..."
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
          <Dropdown value={evtFilter} onChange={v => { setEvtFilter(v); setPage(1); }} options={ALL_EVENT_OPTIONS}    />
          <Dropdown value={sevFilter} onChange={v => { setSevFilter(v); setPage(1); }} options={ALL_SEVERITY_OPTIONS} />
          {hasFilters && (
            <button
              onClick={() => { setSearch(""); setEvtFilter("All Events"); setSevFilter("All Severities"); setPage(1); }}
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
          {filtered.length} result{filtered.length !== 1 ? "s" : ""}
          {search && <> for <span className="font-bold text-slate-600">"{search}"</span></>}
        </p>
      )}


      {/* ── TABLE ── */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden p-4">
        <Table
          data={paginated}
          columns={[
            {
              key: "id",
              label: "LOG ID",
              render: (log) => <p className="font-extrabold text-slate-900 text-sm tracking-tight">{log.id}</p>,
            },
            {
              key: "timestamp",
              label: "TIMESTAMP",
              render: (log) => <span className="text-slate-500 text-xs font-medium whitespace-nowrap">{log.timestamp}</span>,
            },
            {
              key: "eventType",
              label: "EVENT TYPE",
              render: (log) => <EventPill type={log.eventType} />,
            },
            {
              key: "severity",
              label: "SEVERITY",
              render: (log) => <SeverityBadge sev={log.severity} />,
            },
            {
              key: "user",
              label: "USER / SERVICE",
              render: (log) => <p className="text-slate-700 text-xs font-semibold">{log.user}</p>,
            },
            {
              key: "ip",
              label: "IP ADDRESS",
              render: (log) => <span className="text-slate-500 font-mono text-xs font-medium whitespace-nowrap">{log.ip}</span>,
            },
            {
              key: "desc",
              label: "DESCRIPTION",
              render: (log) => (
                <div className="max-w-xs">
                  <p className="text-slate-600 text-xs font-medium leading-snug">{log.desc}</p>
                  {log.txnRef && (
                    <p className="text-xs text-slate-400 mt-0.5 font-mono">TXN: {log.txnRef}</p>
                  )}
                </div>
              ),
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
            <span className="font-bold text-slate-700">{filtered.length}</span> logs
          </p>

          <div className="flex items-center gap-1">
            <button
              onClick={() => setPage(1)}
              disabled={page === 1}
              className="px-2.5 py-1.5 rounded-lg text-xs font-bold text-slate-500 hover:bg-slate-100 disabled:opacity-30 disabled:cursor-not-allowed transition"
            >«</button>
            <button
              onClick={() => setPage(p => Math.max(1, p - 1))}
              disabled={page === 1}
              className="px-3 py-1.5 rounded-lg text-xs font-semibold text-slate-600 hover:bg-slate-100 disabled:opacity-30 disabled:cursor-not-allowed transition"
            >← Prev</button>

            {Array.from({ length: Math.min(totalPages, 7) }, (_, i) => {
              let p;
              if (totalPages <= 7) {
                p = i + 1;
              } else if (page <= 4) {
                p = i + 1;
              } else if (page >= totalPages - 3) {
                p = totalPages - 6 + i;
              } else {
                p = page - 3 + i;
              }
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
              onClick={() => setPage(p => Math.min(totalPages, p + 1))}
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
      </div>
    </div>
  );
};

export default AuditLogs;