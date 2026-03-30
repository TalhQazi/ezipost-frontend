import { useState, useEffect, useCallback, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  fetchReports,
  fetchReportStats,
  fetchReportTemplates,
  createReport,
  executeReport,
  updateReport,
  deleteReport,
} from "../redux/reportsSlice";
import {
  AreaChart, Area, BarChart, Bar, LineChart, Line,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  PieChart, Pie, Cell,
} from "recharts";

// ─── ICONS ────────────────────────────────────────────────────────────────────
const Ico = ({ d, size = 16, className = "" }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none"
    stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round"
    className={className}>
    {Array.isArray(d) ? d.map((p, i) => <path key={i} d={p} />) : <path d={d} />}
  </svg>
);

const IC = {
  download:   "M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4 M7 10l5 5 5-5 M12 15V3",
  calendar:   "M3 9h18M8 2v4M16 2v4M3 6a2 2 0 012-2h14a2 2 0 012 2v14a2 2 0 01-2 2H5a2 2 0 01-2-2V6z",
  refresh:    "M23 4v6h-6 M1 20v-6h6 M3.51 9a9 9 0 0114.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0020.49 15",
  plus:       "M12 5v14M5 12h14",
  search:     "M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0",
  filter:     "M22 3H2l8 9.46V19l4 2v-8.54L22 3",
  x:          "M18 6L6 18M6 6l12 12",
  play:       "M5 3l14 9-14 9V3z",
  trash:      "M3 6h18M8 6V4h8v2M19 6l-1 14H6L5 6",
  edit:       "M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7 M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z",
  eye:        "M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z M12 9a3 3 0 100 6 3 3 0 000-6z",
  check:      "M20 6L9 17l-5-5",
  alert:      "M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z M12 9v4M12 17h.01",
  clock:      "M12 2a10 10 0 100 20A10 10 0 0012 2z M12 6v6l4 2",
  chart:      "M18 20V10M12 20V4M6 20v-6",
  file:       "M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z M14 2v6h6",
  mail:       ["M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z", "M22 6l-10 7L2 6"],
  escrow:     "M21 16V8a2 2 0 00-1-1.73l-7-4a2 2 0 00-2 0l-7 4A2 2 0 003 8v8a2 2 0 001 1.73l7 4a2 2 0 002 0l7-4A2 2 0 0021 16z",
  chevDown:   "M6 9l6 6 6-6",
  chevRight:  "M9 18l6-6-6-6",
  star:       "M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z",
  settings:   "M12 15a3 3 0 100-6 3 3 0 000 6z M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-4 0v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83-2.83l.06-.06A1.65 1.65 0 004.68 15a1.65 1.65 0 00-1.51-1H3a2 2 0 010-4h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 012.83-2.83l.06.06A1.65 1.65 0 009 4.68a1.65 1.65 0 001-1.51V3a2 2 0 014 0v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 2.83l-.06.06A1.65 1.65 0 0019.4 9a1.65 1.65 0 001.51 1H21a2 2 0 010 4h-.09a1.65 1.65 0 00-1.51 1z",
};

// ─── HELPERS ──────────────────────────────────────────────────────────────────
const fmtDate = (d) => {
  if (!d) return "—";
  return new Date(d).toLocaleString("en-US", { month: "short", day: "numeric", year: "numeric", hour: "2-digit", minute: "2-digit" });
};
const fmtDateShort = (d) => {
  if (!d) return "—";
  return new Date(d).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
};

const COLORS = {
  blue:   "#3b82f6",
  green:  "#10b981",
  amber:  "#f59e0b",
  red:    "#ef4444",
  violet: "#8b5cf6",
  slate:  "#64748b",
};
const PIE_COLORS = [COLORS.blue, COLORS.green, COLORS.amber, COLORS.red, COLORS.violet];

// Recharts custom tooltip
const CustomTooltip = ({ active, payload, label, prefix = "", suffix = "" }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-white border border-gray-200 rounded-xl shadow-xl p-3 text-xs min-w-[140px]">
      <p className="font-bold text-gray-700 mb-2">{label}</p>
      {payload.map((p, i) => (
        <p key={i} style={{ color: p.color || p.stroke }} className="font-semibold mb-0.5">
          {p.name}: {prefix}{typeof p.value === "number" ? p.value.toLocaleString() : p.value}{suffix}
        </p>
      ))}
    </div>
  );
};

// ─── BADGE COMPONENTS ─────────────────────────────────────────────────────────
const StatusBadge = ({ status }) => {
  const cfg = {
    active:   { bg: "bg-emerald-50", text: "text-emerald-700", border: "border-emerald-200", dot: "bg-emerald-400" },
    inactive: { bg: "bg-slate-50",   text: "text-slate-500",   border: "border-slate-200",   dot: "bg-slate-300" },
    draft:    { bg: "bg-amber-50",   text: "text-amber-700",   border: "border-amber-200",   dot: "bg-amber-400" },
  }[status] || { bg: "bg-slate-50", text: "text-slate-500", border: "border-slate-200", dot: "bg-slate-300" };

  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold border ${cfg.bg} ${cfg.text} ${cfg.border}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot}`} />
      {status?.charAt(0).toUpperCase() + status?.slice(1)}
    </span>
  );
};

const TypeBadge = ({ type }) => {
  const cfg = {
    financial:   { bg: "bg-blue-50",   text: "text-blue-700",   border: "border-blue-200" },
    operational: { bg: "bg-green-50",  text: "text-green-700",  border: "border-green-200" },
    audit:       { bg: "bg-violet-50", text: "text-violet-700", border: "border-violet-200" },
    performance: { bg: "bg-amber-50",  text: "text-amber-700",  border: "border-amber-200" },
    custom:      { bg: "bg-slate-50",  text: "text-slate-600",  border: "border-slate-200" },
  }[type] || { bg: "bg-slate-50", text: "text-slate-600", border: "border-slate-200" };

  return (
    <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-[11px] font-bold border ${cfg.bg} ${cfg.text} ${cfg.border}`}>
      {type?.charAt(0).toUpperCase() + type?.slice(1)}
    </span>
  );
};

const RunStatusBadge = ({ status }) => {
  if (!status) return <span className="text-xs text-gray-300">Never run</span>;
  const cfg = {
    success: { icon: IC.check, color: "text-emerald-600", bg: "bg-emerald-50" },
    failed:  { icon: IC.alert, color: "text-red-500",     bg: "bg-red-50" },
    running: { icon: IC.clock, color: "text-blue-500",    bg: "bg-blue-50" },
  }[status] || {};
  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-lg text-[11px] font-bold ${cfg.bg} ${cfg.color}`}>
      <Ico d={cfg.icon} size={10} /> {status}
    </span>
  );
};

// ─── STAT CARD ────────────────────────────────────────────────────────────────
const StatCard = ({ label, value, sub, iconD, iconBg, iconColor, valueColor = "text-gray-800", loading }) => (
  <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 hover:shadow-md transition-shadow">
    <div className="flex items-start justify-between mb-3">
      <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-widest">{label}</p>
      <div className={`w-10 h-10 rounded-xl ${iconBg} flex items-center justify-center flex-shrink-0`}>
        <Ico d={iconD} size={17} className={iconColor} />
      </div>
    </div>
    {loading
      ? <div className="h-8 w-24 bg-gray-100 rounded-lg animate-pulse" />
      : <p className={`text-2xl font-extrabold leading-tight ${valueColor}`}>{value ?? "—"}</p>
    }
    <p className="text-[11px] text-gray-400 font-medium mt-1">{sub}</p>
  </div>
);

// ─── DROPDOWN ─────────────────────────────────────────────────────────────────
const Dropdown = ({ value, onChange, options, placeholder = "Select", icon }) => {
  const [open, setOpen] = useState(false);
  const ref = useRef();
  const selected = options.find(o => o.value === value);

  useEffect(() => {
    const h = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener("mousedown", h);
    return () => document.removeEventListener("mousedown", h);
  }, []);

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen(o => !o)}
        className="flex items-center gap-2 px-3.5 py-2 bg-white border border-gray-200 rounded-xl text-sm font-semibold text-gray-700 hover:bg-gray-50 transition min-w-[150px] justify-between shadow-sm"
      >
        <div className="flex items-center gap-2 truncate">
          {icon && <Ico d={icon} size={13} className="text-gray-400 flex-shrink-0" />}
          <span className="truncate">{selected?.label || placeholder}</span>
        </div>
        <Ico d={IC.chevDown} size={13} className={`text-gray-400 flex-shrink-0 transition-transform ${open ? "rotate-180" : ""}`} />
      </button>
      {open && (
        <div className="absolute left-0 mt-2 w-52 bg-white border border-gray-200 rounded-xl shadow-2xl z-50 overflow-hidden">
          {options.map(o => (
            <button
              key={o.value}
              onClick={() => { onChange(o.value); setOpen(false); }}
              className={`w-full text-left px-4 py-2.5 text-sm font-medium transition flex items-center justify-between hover:bg-gray-50 ${value === o.value ? "bg-gray-50 font-bold text-gray-900" : "text-gray-600"}`}
            >
              {o.label}
              {value === o.value && <Ico d={IC.check} size={12} className="text-emerald-500" />}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

// ─── CREATE REPORT MODAL ──────────────────────────────────────────────────────
const CreateReportModal = ({ open, onClose, onSubmit, templates, creating }) => {
  const [form, setForm] = useState({
    reportName: "", reportType: "financial", description: "", dataSource: "mail",
    format: "json", status: "active", createdBy: "admin",
    parameters: { startDate: "", endDate: "", groupBy: [], sortBy: { field: "", order: "desc" } },
    schedule: { enabled: false, frequency: "daily", recipients: [] },
  });
  const [recipientInput, setRecipientInput] = useState("");

  if (!open) return null;

  const set = (key, val) => setForm(f => ({ ...f, [key]: val }));
  const setParam = (key, val) => setForm(f => ({ ...f, parameters: { ...f.parameters, [key]: val } }));

  const handleSubmit = () => {
    if (!form.reportName.trim()) return;
    const payload = { ...form };
    if (payload.parameters.startDate) payload.parameters.startDate = new Date(payload.parameters.startDate);
    if (payload.parameters.endDate)   payload.parameters.endDate   = new Date(payload.parameters.endDate);
    onSubmit(payload);
  };

  const fromTemplate = (tpl) => {
    setForm(f => ({
      ...f,
      reportName: tpl.name,
      reportType: tpl.type,
      description: tpl.description,
      dataSource: tpl.dataSource,
      parameters: {
        startDate: tpl.parameters.startDate ? tpl.parameters.startDate.toISOString().slice(0, 10) : "",
        endDate:   tpl.parameters.endDate   ? tpl.parameters.endDate.toISOString().slice(0, 10)   : "",
        groupBy: tpl.parameters.groupBy || [],
        sortBy: tpl.parameters.sortBy || { field: "", order: "desc" },
      },
    }));
  };

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[100] flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between p-6 border-b border-gray-100">
          <div>
            <h2 className="text-lg font-extrabold text-gray-900">Create New Report</h2>
            <p className="text-xs text-gray-400 mt-0.5">Configure your report parameters and schedule</p>
          </div>
          <button onClick={onClose} className="p-2 rounded-xl hover:bg-gray-100 transition text-gray-400"><Ico d={IC.x} size={18} /></button>
        </div>

        <div className="p-6 space-y-5">
          {/* Templates */}
          {templates?.length > 0 && (
            <div>
              <p className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-2">Quick Templates</p>
              <div className="flex gap-2 flex-wrap">
                {templates.map((t, i) => (
                  <button key={i} onClick={() => fromTemplate(t)}
                    className="px-3 py-1.5 text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-200 rounded-xl hover:bg-blue-100 transition">
                    {t.name}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Basic Info */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="sm:col-span-2">
              <label className="block text-xs font-bold text-gray-500 mb-1.5 uppercase tracking-wide">Report Name *</label>
              <input value={form.reportName} onChange={e => set("reportName", e.target.value)}
                placeholder="e.g. Monthly Revenue Summary"
                className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm text-gray-800 font-medium focus:outline-none focus:ring-2 focus:ring-blue-200" />
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-500 mb-1.5 uppercase tracking-wide">Report Type</label>
              <Dropdown value={form.reportType} onChange={v => set("reportType", v)}
                options={[
                  { label: "Financial",   value: "financial" },
                  { label: "Operational", value: "operational" },
                  { label: "Audit",       value: "audit" },
                  { label: "Performance", value: "performance" },
                  { label: "Custom",      value: "custom" },
                ]} />
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-500 mb-1.5 uppercase tracking-wide">Data Source</label>
              <Dropdown value={form.dataSource} onChange={v => set("dataSource", v)}
                options={[
                  { label: "Mail",             value: "mail" },
                  { label: "Transactions",     value: "transactions" },
                  { label: "Audit Logs",       value: "audit_logs" },
                  { label: "Escrow Accounts",  value: "escrow_accounts" },
                  { label: "Rate Configs",     value: "rate_configs" },
                  { label: "Mail Processing",  value: "mail_processing" },
                ]} />
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-500 mb-1.5 uppercase tracking-wide">Output Format</label>
              <Dropdown value={form.format} onChange={v => set("format", v)}
                options={[
                  { label: "JSON",  value: "json" },
                  { label: "CSV",   value: "csv" },
                  { label: "PDF",   value: "pdf" },
                  { label: "Excel", value: "excel" },
                ]} />
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-500 mb-1.5 uppercase tracking-wide">Status</label>
              <Dropdown value={form.status} onChange={v => set("status", v)}
                options={[
                  { label: "Active",   value: "active" },
                  { label: "Inactive", value: "inactive" },
                  { label: "Draft",    value: "draft" },
                ]} />
            </div>
            <div className="sm:col-span-2">
              <label className="block text-xs font-bold text-gray-500 mb-1.5 uppercase tracking-wide">Description</label>
              <textarea value={form.description} onChange={e => set("description", e.target.value)}
                rows={2} placeholder="Brief description of this report..."
                className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm text-gray-800 font-medium focus:outline-none focus:ring-2 focus:ring-blue-200 resize-none" />
            </div>
          </div>

          {/* Parameters */}
          <div className="border-t border-gray-100 pt-4">
            <p className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-3">Date Range Parameters</p>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-gray-500 mb-1">Start Date</label>
                <input type="date" value={form.parameters.startDate} onChange={e => setParam("startDate", e.target.value)}
                  className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-200" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-500 mb-1">End Date</label>
                <input type="date" value={form.parameters.endDate} onChange={e => setParam("endDate", e.target.value)}
                  className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-200" />
              </div>
            </div>
          </div>

          {/* Schedule */}
          <div className="border-t border-gray-100 pt-4">
            <div className="flex items-center justify-between mb-3">
              <p className="text-xs font-bold text-gray-500 uppercase tracking-widest">Schedule</p>
              <button
                onClick={() => set("schedule", { ...form.schedule, enabled: !form.schedule.enabled })}
                className={`relative w-10 h-5 rounded-full transition-colors ${form.schedule.enabled ? "bg-blue-500" : "bg-gray-200"}`}
              >
                <span className={`absolute top-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform ${form.schedule.enabled ? "translate-x-5" : "translate-x-0.5"}`} />
              </button>
            </div>
            {form.schedule.enabled && (
              <div className="space-y-3">
                <Dropdown value={form.schedule.frequency} onChange={v => set("schedule", { ...form.schedule, frequency: v })}
                  options={[
                    { label: "Daily",     value: "daily" },
                    { label: "Weekly",    value: "weekly" },
                    { label: "Monthly",   value: "monthly" },
                    { label: "Quarterly", value: "quarterly" },
                    { label: "Yearly",    value: "yearly" },
                  ]} />
                <div className="flex gap-2">
                  <input value={recipientInput} onChange={e => setRecipientInput(e.target.value)}
                    placeholder="Add recipient email..."
                    className="flex-1 px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-200" />
                  <button
                    onClick={() => {
                      if (recipientInput.includes("@")) {
                        set("schedule", { ...form.schedule, recipients: [...form.schedule.recipients, { email: recipientInput, name: "" }] });
                        setRecipientInput("");
                      }
                    }}
                    className="px-3 py-2 bg-blue-600 text-white rounded-xl text-xs font-bold hover:bg-blue-700 transition">
                    Add
                  </button>
                </div>
                {form.schedule.recipients.length > 0 && (
                  <div className="flex flex-wrap gap-1.5">
                    {form.schedule.recipients.map((r, i) => (
                      <span key={i} className="flex items-center gap-1 px-2.5 py-1 bg-blue-50 text-blue-700 border border-blue-200 rounded-full text-xs font-semibold">
                        {r.email}
                        <button onClick={() => set("schedule", { ...form.schedule, recipients: form.schedule.recipients.filter((_, j) => j !== i) })}
                          className="ml-0.5 hover:text-red-500 transition"><Ico d={IC.x} size={10} /></button>
                      </span>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        <div className="flex gap-3 px-6 py-4 border-t border-gray-100">
          <button onClick={onClose} className="flex-1 px-4 py-2.5 rounded-xl border border-gray-200 text-sm font-bold text-gray-600 hover:bg-gray-50 transition">Cancel</button>
          <button onClick={handleSubmit} disabled={creating || !form.reportName.trim()}
            className="flex-1 px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-sm font-extrabold transition disabled:opacity-50 flex items-center justify-center gap-2">
            {creating ? <><Ico d={IC.refresh} size={14} className="animate-spin" /> Creating...</> : "Create Report"}
          </button>
        </div>
      </div>
    </div>
  );
};

// ─── EXECUTE RESULT MODAL ─────────────────────────────────────────────────────
const ExecuteResultModal = ({ result, onClose }) => {
  if (!result) return null;
  const { report, data } = result;
  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[100] flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[85vh] overflow-hidden flex flex-col" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between p-6 border-b border-gray-100">
          <div>
            <h2 className="text-lg font-extrabold text-gray-900">Execution Result</h2>
            <p className="text-xs text-gray-400 mt-0.5">{report?.name} · {fmtDate(report?.executedAt)}</p>
          </div>
          <button onClick={onClose} className="p-2 rounded-xl hover:bg-gray-100 transition text-gray-400"><Ico d={IC.x} size={18} /></button>
        </div>
        <div className="p-6 space-y-4 overflow-y-auto flex-1">
          <div className="grid grid-cols-3 gap-3">
            {[
              { label: "Records", value: report?.recordCount?.toLocaleString() ?? "0" },
              { label: "Execution Time", value: report?.executionTime ? `${report.executionTime}ms` : "—" },
              { label: "Status", value: "Success" },
            ].map(c => (
              <div key={c.label} className="bg-gray-50 rounded-xl p-3 text-center">
                <p className="text-xs text-gray-400 font-semibold uppercase tracking-wide">{c.label}</p>
                <p className="text-lg font-extrabold text-gray-800 mt-0.5">{c.value}</p>
              </div>
            ))}
          </div>
          {data?.length > 0 && (
            <div>
              <p className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-2">Preview (first 5 records)</p>
              <div className="overflow-x-auto rounded-xl border border-gray-100">
                <table className="w-full text-xs">
                  <thead className="bg-black text-white">
                    <tr>
                      {Object.keys(data[0]).slice(0, 6).map(k => (
                        <th key={k} className="px-3 py-2 text-left font-bold uppercase tracking-wider whitespace-nowrap">{k}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">{data.slice(0, 5).map((row, i) => (
                    <tr key={i} className="hover:bg-gray-50 transition">{Object.values(row).slice(0, 6).map((v, j) => (
                      <td key={j} className="px-3 py-2 text-gray-600 font-mono whitespace-nowrap">
                        {typeof v === "object" ? JSON.stringify(v).slice(0, 40) : String(v ?? "—").slice(0, 40)}
                      </td>
                    ))}</tr>
                  ))}</tbody>
                </table>
              </div>
            </div>
          )}
          {(!data || data.length === 0) && (
            <div className="flex flex-col items-center gap-2 py-8 text-gray-400">
              <Ico d={IC.file} size={32} />
              <p className="text-sm font-semibold">No data returned</p>
            </div>
          )}
        </div>
        <div className="px-6 py-4 border-t border-gray-100 flex justify-end">
          <button
            onClick={() => {
              const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
              const url  = URL.createObjectURL(blob);
              const a    = document.createElement("a"); a.href = url; a.download = `${report?.name || "report"}.json`; a.click();
              URL.revokeObjectURL(url);
            }}
            className="flex items-center gap-2 px-4 py-2.5 bg-gray-900 text-white rounded-xl text-sm font-bold hover:bg-gray-800 transition"
          >
            <Ico d={IC.download} size={14} /> Download JSON
          </button>
        </div>
      </div>
    </div>
  );
};

// ─── SKELETON ─────────────────────────────────────────────────────────────────
const TableSkeleton = ({ rows = 5 }) => (
  <div className="divide-y divide-gray-50">
    {Array.from({ length: rows }).map((_, i) => (
      <div key={i} className="flex items-center gap-4 px-5 py-4 animate-pulse">
        <div className="flex-1 space-y-1.5">
          <div className="h-3.5 bg-gray-100 rounded w-48" />
          <div className="h-3 bg-gray-100 rounded w-32" />
        </div>
        <div className="h-6 bg-gray-100 rounded-full w-20" />
        <div className="h-6 bg-gray-100 rounded-full w-16" />
        <div className="h-5 bg-gray-100 rounded-full w-14" />
        <div className="h-3.5 bg-gray-100 rounded w-24" />
        <div className="h-3.5 bg-gray-100 rounded w-24" />
        <div className="flex gap-1.5">
          <div className="w-7 h-7 bg-gray-100 rounded-lg" />
          <div className="w-7 h-7 bg-gray-100 rounded-lg" />
          <div className="w-7 h-7 bg-gray-100 rounded-lg" />
        </div>
      </div>
    ))}
  </div>
);

// ─── ANALYTICS CHARTS (from live stats + hardcoded trend data) ────────────────
const TREND_MAIL = [
  { month: "Oct", totalMail: 38000, escrowUsed: 11000 },
  { month: "Nov", totalMail: 43000, escrowUsed: 13000 },
  { month: "Dec", totalMail: 47000, escrowUsed: 14500 },
  { month: "Jan", totalMail: 42000, escrowUsed: 13000 },
  { month: "Feb", totalMail: 47000, escrowUsed: 15000 },
  { month: "Mar", totalMail: 52000, escrowUsed: 16000 },
];
const TREND_REV = [
  { month: "Oct", total: 38000, escrow: 11000 },
  { month: "Nov", total: 44000, escrow: 13500 },
  { month: "Dec", total: 48000, escrow: 15000 },
  { month: "Jan", total: 41000, escrow: 13000 },
  { month: "Feb", total: 46000, escrow: 14500 },
  { month: "Mar", total: 53000, escrow: 16500 },
];
const TREND_PERF = [
  { day: "Mon", speed: 95.2, accuracy: 94.8, escrowOk: 95.5 },
  { day: "Tue", speed: 94.1, accuracy: 94.1, escrowOk: 94.3 },
  { day: "Wed", speed: 96.2, accuracy: 96.0, escrowOk: 96.4 },
  { day: "Thu", speed: 97.1, accuracy: 97.3, escrowOk: 96.9 },
  { day: "Fri", speed: 93.3, accuracy: 93.1, escrowOk: 93.6 },
  { day: "Sat", speed: 97.8, accuracy: 97.5, escrowOk: 98.0 },
  { day: "Sun", speed: 99.2, accuracy: 99.0, escrowOk: 99.3 },
];

// ─── MAIN PAGE ────────────────────────────────────────────────────────────────
const REPORT_TYPE_OPTIONS = [
  { label: "All Types",    value: "" },
  { label: "Financial",    value: "financial" },
  { label: "Operational",  value: "operational" },
  { label: "Audit",        value: "audit" },
  { label: "Performance",  value: "performance" },
  { label: "Custom",       value: "custom" },
];
const STATUS_OPTIONS = [
  { label: "All Statuses", value: "" },
  { label: "Active",       value: "active" },
  { label: "Inactive",     value: "inactive" },
  { label: "Draft",        value: "draft" },
];
const DATASOURCE_OPTIONS = [
  { label: "All Sources",      value: "" },
  { label: "Mail",             value: "mail" },
  { label: "Transactions",     value: "transactions" },
  { label: "Audit Logs",       value: "audit_logs" },
  { label: "Escrow Accounts",  value: "escrow_accounts" },
  { label: "Rate Configs",     value: "rate_configs" },
  { label: "Mail Processing",  value: "mail_processing" },
];
const LIMITS = [10, 25, 50];

const useDebounce = (v, delay = 400) => {
  const [d, setD] = useState(v);
  useEffect(() => { const t = setTimeout(() => setD(v), delay); return () => clearTimeout(t); }, [v, delay]);
  return d;
};

export default function ReportsPage() {
  const dispatch = useDispatch();
  const { reports, pagination, stats, templates, loading, creating, executing } = useSelector(s => s.reports);

  // Filters
  const [search,      setSearch]      = useState("");
  const [typeFilter,  setTypeFilter]  = useState("");
  const [statusFilter,setStatusFilter]= useState("");
  const [dsFilter,    setDsFilter]    = useState("");
  const [page,        setPage]        = useState(1);
  const [limit,       setLimit]       = useState(10);
  const [activeTab,   setActiveTab]   = useState("list"); // list | analytics

  // Modals
  const [showCreate,  setShowCreate]  = useState(false);
  const [execResult,  setExecResult]  = useState(null);
  const [deletingId,  setDeletingId]  = useState(null);

  const debouncedSearch = useDebounce(search);

  const loadData = useCallback(() => {
    dispatch(fetchReports({
      search: debouncedSearch,
      reportType: typeFilter,
      status: statusFilter,
      dataSource: dsFilter,
      page,
      limit,
    }));
  }, [dispatch, debouncedSearch, typeFilter, statusFilter, dsFilter, page, limit]);

  useEffect(() => { loadData(); }, [loadData]);
  useEffect(() => { dispatch(fetchReportStats()); dispatch(fetchReportTemplates()); }, [dispatch]);
  useEffect(() => { setPage(1); }, [debouncedSearch, typeFilter, statusFilter, dsFilter]);

  const hasFilter = search || typeFilter || statusFilter || dsFilter;
  const resetFilters = () => { setSearch(""); setTypeFilter(""); setStatusFilter(""); setDsFilter(""); };

  // ── Actions
  const handleCreate = async (data) => {
    await dispatch(createReport(data));
    setShowCreate(false);
    loadData();
    dispatch(fetchReportStats());
  };

  const handleExecute = async (id) => {
    const result = await dispatch(executeReport(id));
    if (result.payload) setExecResult(result.payload);
  };

  const handleDelete = async (id) => {
    setDeletingId(id);
    await dispatch(deleteReport(id));
    setDeletingId(null);
    loadData();
    dispatch(fetchReportStats());
  };

  const handleToggleStatus = async (report) => {
    const newStatus = report.status === "active" ? "inactive" : "active";
    await dispatch(updateReport({ id: report._id, reportData: { ...report, status: newStatus, lastModifiedBy: "admin" } }));
    loadData();
  };

  // ── Export
  const handleExport = () => {
    const header = "Name,Type,DataSource,Status,Format,LastRun,NextRun,CreatedBy,Created";
    const rows = reports.map(r => [
      r.reportName, r.reportType, r.dataSource, r.status, r.format,
      r.lastRun?.runAt ? fmtDateShort(r.lastRun.runAt) : "Never",
      r.schedule?.nextRun ? fmtDateShort(r.schedule.nextRun) : "—",
      r.createdBy, fmtDateShort(r.createdAt)
    ].join(","));
    const blob = new Blob([[header, ...rows].join("\n")], { type: "text/csv" });
    const url  = URL.createObjectURL(blob); const a = document.createElement("a");
    a.href = url; a.download = "reports.csv"; a.click(); URL.revokeObjectURL(url);
  };

  // ── Pagination
  const { page: curPage, pages: totalPages, total } = pagination || {};

  // ── Pie data from stats
  const typePie = [
    { name: "Financial",   value: stats?.financialReports    || 0 },
    { name: "Operational", value: stats?.operationalReports  || 0 },
    { name: "Audit",       value: stats?.auditReports        || 0 },
    { name: "Performance", value: stats?.performanceReports  || 0 },
    { name: "Custom",      value: stats?.customReports       || 0 },
  ].filter(d => d.value > 0);

  const statusBar = [
    { name: "Active",   value: stats?.activeReports   || 0 },
    { name: "Inactive", value: stats?.inactiveReports  || 0 },
    { name: "Draft",    value: stats?.draftReports     || 0 },
    { name: "Scheduled",value: stats?.scheduledReports || 0 },
  ];

  return (
    <div className="min-h-screen bg-gray-50" style={{ fontFamily: "'DM Sans','Segoe UI',sans-serif" }}>
      <div className="p-4 md:p-6 space-y-5">

        {/* ── HEADER ── */}
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-extrabold text-gray-900 tracking-tight">Reports & Analytics</h1>
            <p className="text-gray-400 text-sm mt-1 font-medium">Manage, schedule and execute reports across all data sources</p>
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            <button onClick={handleExport}
              className="flex items-center gap-2 px-4 py-2.5 bg-white border border-gray-200 hover:bg-gray-50 text-gray-700 rounded-xl text-sm font-bold shadow-sm transition">
              <Ico d={IC.download} size={14} /> Export CSV
            </button>
          </div>
        </div>

        {/* ── STAT CARDS ── */}
        <div className="grid grid-cols-2 xl:grid-cols-5 gap-3 md:gap-4">
          <StatCard label="Total Reports"   value={stats?.totalReports?.toLocaleString()}     sub="All report configurations" iconD={IC.file}   iconBg="bg-slate-100" iconColor="text-slate-600" loading={loading} />
          <StatCard label="Active"          value={stats?.activeReports?.toLocaleString()}    sub="Currently running"          iconD={IC.check}  iconBg="bg-emerald-50" iconColor="text-emerald-500" valueColor="text-emerald-600" loading={loading} />
          <StatCard label="Scheduled"       value={stats?.scheduledReports?.toLocaleString()} sub="Auto-run enabled"           iconD={IC.clock}  iconBg="bg-blue-50"   iconColor="text-blue-500"   valueColor="text-blue-600"   loading={loading} />
          <StatCard label="Drafts"          value={stats?.draftReports?.toLocaleString()}     sub="Not yet activated"          iconD={IC.edit}   iconBg="bg-amber-50"  iconColor="text-amber-500"  valueColor="text-amber-600"  loading={loading} />
          <StatCard label="Inactive"        value={stats?.inactiveReports?.toLocaleString()}  sub="Paused reports"             iconD={IC.alert}  iconBg="bg-red-50"    iconColor="text-red-400"    valueColor="text-red-500"    loading={loading} />
        </div>

        {/* ── TABS ── */}
        <div className="flex gap-1 bg-white border border-gray-100 rounded-2xl p-1.5 shadow-sm w-fit">
          {["list", "analytics"].map(tab => (
            <button key={tab} onClick={() => setActiveTab(tab)}
              className={`px-5 py-2 rounded-xl text-sm font-bold capitalize transition ${activeTab === tab ? "bg-gray-900 text-white shadow-sm" : "text-gray-500 hover:text-gray-700 hover:bg-gray-50"}`}>
              {tab === "list" ? "Report List" : "Analytics"}
            </button>
          ))}
        </div>

        {activeTab === "analytics" && (
          <div className="space-y-4">
            {/* Report Type Distribution */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
                <h3 className="font-bold text-gray-800 text-sm mb-4">Report Type Distribution</h3>
                {typePie.length > 0 ? (
                  <div className="flex items-center gap-6">
                    <ResponsiveContainer width={160} height={160}>
                      <PieChart>
                        <Pie data={typePie} cx="50%" cy="50%" innerRadius={50} outerRadius={75} paddingAngle={3} dataKey="value">
                          {typePie.map((_, i) => <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />)}
                        </Pie>
                        <Tooltip content={<CustomTooltip />} />
                      </PieChart>
                    </ResponsiveContainer>
                    <div className="space-y-2 flex-1">
                      {typePie.map((d, i) => (
                        <div key={d.name} className="flex items-center justify-between gap-2">
                          <div className="flex items-center gap-2">
                            <span className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ backgroundColor: PIE_COLORS[i % PIE_COLORS.length] }} />
                            <span className="text-xs text-gray-600 font-medium">{d.name}</span>
                          </div>
                          <span className="text-xs font-extrabold text-gray-800">{d.value}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center justify-center h-40 text-gray-300 text-sm">No report data yet</div>
                )}
              </div>

              <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
                <h3 className="font-bold text-gray-800 text-sm mb-4">Status Overview</h3>
                <ResponsiveContainer width="100%" height={190}>
                  <BarChart data={statusBar} margin={{ top: 4, right: 6, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
                    <XAxis dataKey="name" tick={{ fontSize: 10, fill: "#9ca3af" }} axisLine={false} tickLine={false} />
                    <YAxis tick={{ fontSize: 10, fill: "#9ca3af" }} axisLine={false} tickLine={false} />
                    <Tooltip content={<CustomTooltip />} />
                    <Bar dataKey="value" name="Count" radius={[6, 6, 0, 0]}>
                      {statusBar.map((_, i) => (
                        <Cell key={i} fill={[COLORS.green, COLORS.slate, COLORS.amber, COLORS.blue][i]} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Mail Volume Trend */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
                <h3 className="font-bold text-gray-800 text-sm mb-4">Mail Volume Trend (6 months)</h3>
                <ResponsiveContainer width="100%" height={190}>
                  <AreaChart data={TREND_MAIL} margin={{ top: 4, right: 6, left: -20, bottom: 0 }}>
                    <defs>
                      <linearGradient id="mailGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%"  stopColor={COLORS.green} stopOpacity={0.25} />
                        <stop offset="95%" stopColor={COLORS.green} stopOpacity={0} />
                      </linearGradient>
                      <linearGradient id="escrowGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%"  stopColor={COLORS.blue} stopOpacity={0.15} />
                        <stop offset="95%" stopColor={COLORS.blue} stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
                    <XAxis dataKey="month" tick={{ fontSize: 10, fill: "#9ca3af" }} axisLine={false} tickLine={false} />
                    <YAxis tick={{ fontSize: 10, fill: "#9ca3af" }} axisLine={false} tickLine={false} tickFormatter={v => `${v/1000}k`} />
                    <Tooltip content={<CustomTooltip />} />
                    <Legend iconType="plainline" wrapperStyle={{ fontSize: 10 }} />
                    <Area type="monotone" dataKey="totalMail"  name="Total Mail"  stroke={COLORS.green} strokeWidth={2} fill="url(#mailGrad)"   dot={{ r: 2.5, fill: COLORS.green }} />
                    <Area type="monotone" dataKey="escrowUsed" name="Escrow Used" stroke={COLORS.blue}  strokeWidth={2} fill="url(#escrowGrad)" dot={{ r: 2.5, fill: COLORS.blue }} strokeDasharray="5 3" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>

              <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
                <h3 className="font-bold text-gray-800 text-sm mb-4">Revenue Trend (6 months)</h3>
                <ResponsiveContainer width="100%" height={190}>
                  <BarChart data={TREND_REV} margin={{ top: 4, right: 6, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
                    <XAxis dataKey="month" tick={{ fontSize: 10, fill: "#9ca3af" }} axisLine={false} tickLine={false} />
                    <YAxis tick={{ fontSize: 10, fill: "#9ca3af" }} axisLine={false} tickLine={false} tickFormatter={v => `$${v/1000}k`} />
                    <Tooltip content={<CustomTooltip prefix="$" />} />
                    <Legend iconType="square" wrapperStyle={{ fontSize: 10 }} />
                    <Bar dataKey="total"  name="Total Revenue"  fill={COLORS.blue}  radius={[4, 4, 0, 0]} />
                    <Bar dataKey="escrow" name="Escrow Revenue" fill={COLORS.green} radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* System Performance */}
            <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
              <h3 className="font-bold text-gray-800 text-sm mb-4">System Performance Metrics (this week)</h3>
              <ResponsiveContainer width="100%" height={200}>
                <LineChart data={TREND_PERF} margin={{ top: 4, right: 6, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
                  <XAxis dataKey="day" tick={{ fontSize: 10, fill: "#9ca3af" }} axisLine={false} tickLine={false} />
                  <YAxis domain={[90, 100]} tick={{ fontSize: 10, fill: "#9ca3af" }} axisLine={false} tickLine={false} />
                  <Tooltip content={<CustomTooltip suffix="%" />} />
                  <Legend iconType="plainline" wrapperStyle={{ fontSize: 10 }} />
                  <Line type="monotone" dataKey="speed"    name="Processing Speed %"  stroke={COLORS.amber}  strokeWidth={2} dot={{ r: 3 }} strokeDasharray="5 3" />
                  <Line type="monotone" dataKey="accuracy" name="Accuracy %"          stroke={COLORS.green}  strokeWidth={2} dot={{ r: 3 }} strokeDasharray="5 3" />
                  <Line type="monotone" dataKey="escrowOk" name="Escrow Success %"    stroke={COLORS.blue}   strokeWidth={2} dot={{ r: 3 }} strokeDasharray="5 3" />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}

        {activeTab === "list" && (
          <>
            {/* ── FILTER BAR ── */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-3 md:p-4">
              <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center">
                <div className="flex-1 flex items-center gap-3 bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5">
                  <Ico d={IC.search} size={14} className="text-gray-400 flex-shrink-0" />
                  <input type="text" placeholder="Search report name or description..."
                    value={search} onChange={e => setSearch(e.target.value)}
                    className="bg-transparent outline-none text-sm text-gray-700 placeholder-gray-400 w-full font-medium" />
                  {search && <button onClick={() => setSearch("")} className="text-gray-300 hover:text-gray-500 transition"><Ico d={IC.x} size={13} /></button>}
                </div>
                <div className="flex gap-2 flex-wrap">
                  <Dropdown value={typeFilter}   onChange={setTypeFilter}   options={REPORT_TYPE_OPTIONS}  icon={IC.filter} />
                  <Dropdown value={statusFilter} onChange={setStatusFilter} options={STATUS_OPTIONS}        icon={IC.filter} />
                  <Dropdown value={dsFilter}     onChange={setDsFilter}     options={DATASOURCE_OPTIONS}   icon={IC.filter} />
                  {hasFilter && (
                    <button onClick={resetFilters}
                      className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold text-gray-500 hover:text-gray-700 bg-gray-50 border border-gray-200 rounded-xl hover:bg-gray-100 transition">
                      <Ico d={IC.x} size={12} /> Clear
                    </button>
                  )}
                </div>
              </div>
            </div>

            {/* ── TABLE ── */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead className="bg-black text-white">
                    <tr className="border-b border-slate-800">
                      {["REPORT", "TYPE", "SOURCE", "STATUS", "LAST RUN", "NEXT RUN", "SCHEDULE", "ACTIONS"].map(col => (
                        <th key={col} className="px-5 py-3.5 text-[11px] font-bold uppercase tracking-widest whitespace-nowrap">
                          {col}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {loading ? (
                      <tr><td colSpan={8}><TableSkeleton rows={limit} /></td></tr>
                    ) : reports.length === 0 ? (
                      <tr>
                        <td colSpan={8} className="py-20 text-center">
                          <div className="flex flex-col items-center gap-3">
                            <div className="w-14 h-14 rounded-2xl bg-gray-100 flex items-center justify-center">
                              <Ico d={IC.file} size={24} className="text-gray-400" />
                            </div>
                            <p className="text-gray-500 font-semibold">No reports found</p>
                            {hasFilter
                              ? <button onClick={resetFilters} className="text-sm font-bold text-blue-600 hover:text-blue-700 transition">Clear filters</button>
                              : <button onClick={() => setShowCreate(true)} className="flex items-center gap-1.5 text-sm font-bold text-blue-600 hover:text-blue-700 transition">
                                  <Ico d={IC.plus} size={13} /> Create your first report
                                </button>
                            }
                          </div>
                        </td>
                      </tr>
                    ) : (
                      reports.map(r => (
                        <tr key={r._id} className="hover:bg-gray-50/70 transition-colors group">
                          {/* Report Name */}
                          <td className="px-5 py-3.5 min-w-[200px]">
                            <p className="font-extrabold text-gray-900 text-sm">{r.reportName}</p>
                            {r.description && <p className="text-xs text-gray-400 mt-0.5 line-clamp-1">{r.description}</p>}
                            <p className="text-[10px] text-gray-300 font-mono mt-0.5">{r._id?.slice(-8)}</p>
                          </td>
                          {/* Type */}
                          <td className="px-5 py-3.5">
                            <TypeBadge type={r.reportType} />
                          </td>
                          {/* Source */}
                          <td className="px-5 py-3.5">
                            <span className="text-xs text-gray-500 font-semibold bg-gray-100 px-2.5 py-1 rounded-lg whitespace-nowrap">
                              {r.dataSource?.replace(/_/g, " ")}
                            </span>
                          </td>
                          {/* Status */}
                          <td className="px-5 py-3.5">
                            <StatusBadge status={r.status} />
                          </td>
                          {/* Last Run */}
                          <td className="px-5 py-3.5 min-w-[150px]">
                            <div className="space-y-0.5">
                              <RunStatusBadge status={r.lastRun?.status} />
                              {r.lastRun?.runAt && <p className="text-[10px] text-gray-400">{fmtDateShort(r.lastRun.runAt)}</p>}
                              {r.lastRun?.recordCount !== undefined && (
                                <p className="text-[10px] text-gray-400">{r.lastRun.recordCount?.toLocaleString()} records</p>
                              )}
                            </div>
                          </td>
                          {/* Next Run */}
                          <td className="px-5 py-3.5">
                            {r.schedule?.nextRun
                              ? <span className="text-xs text-gray-600 font-medium">{fmtDateShort(r.schedule.nextRun)}</span>
                              : <span className="text-xs text-gray-300">—</span>
                            }
                          </td>
                          {/* Schedule */}
                          <td className="px-5 py-3.5">
                            {r.schedule?.enabled
                              ? <span className="flex items-center gap-1 text-xs font-bold text-blue-600">
                                  <Ico d={IC.clock} size={11} /> {r.schedule.frequency}
                                </span>
                              : <span className="text-xs text-gray-300">Manual</span>
                            }
                          </td>
                          {/* Actions */}
                          <td className="px-5 py-3.5">
                            <div className="flex items-center gap-1 opacity-70 group-hover:opacity-100 transition-opacity">
                              {/* Execute */}
                              <button
                                onClick={() => handleExecute(r._id)}
                                disabled={executing}
                                title="Execute Report"
                                className="p-1.5 rounded-lg text-gray-400 hover:text-blue-600 hover:bg-blue-50 transition disabled:opacity-40"
                              >
                                {executing ? <Ico d={IC.refresh} size={14} className="animate-spin" /> : <Ico d={IC.play} size={14} />}
                              </button>
                              {/* Toggle status */}
                              <button
                                onClick={() => handleToggleStatus(r)}
                                title={r.status === "active" ? "Deactivate" : "Activate"}
                                className="p-1.5 rounded-lg text-gray-400 hover:text-amber-600 hover:bg-amber-50 transition"
                              >
                                <Ico d={r.status === "active" ? IC.alert : IC.check} size={14} />
                              </button>
                              {/* Delete */}
                              <button
                                onClick={() => handleDelete(r._id)}
                                disabled={deletingId === r._id}
                                title="Delete Report"
                                className="p-1.5 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 transition disabled:opacity-40"
                              >
                                {deletingId === r._id
                                  ? <Ico d={IC.refresh} size={14} className="animate-spin" />
                                  : <Ico d={IC.trash} size={14} />
                                }
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>

              {/* ── PAGINATION ── */}
              <div className="flex flex-col sm:flex-row items-center justify-between gap-3 px-5 py-4 border-t border-gray-100">
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-gray-400 font-medium">Rows:</span>
                    <select value={limit} onChange={e => { setLimit(Number(e.target.value)); setPage(1); }}
                      className="text-xs font-bold text-gray-700 bg-gray-50 border border-gray-200 rounded-lg px-2 py-1.5 focus:outline-none">
                      {LIMITS.map(l => <option key={l} value={l}>{l}</option>)}
                    </select>
                  </div>
                  <p className="text-xs text-gray-400 font-medium">
                    {total ? (
                      <><span className="font-bold text-gray-700">{Math.min((curPage - 1) * limit + 1, total)}–{Math.min(curPage * limit, total)}</span> of <span className="font-bold text-gray-700">{total?.toLocaleString()}</span></>
                    ) : "No results"}
                  </p>
                </div>
                <div className="flex items-center gap-1">
                  <button onClick={() => setPage(1)} disabled={page <= 1 || loading}
                    className="p-1.5 rounded-lg text-gray-400 hover:bg-gray-100 disabled:opacity-30 disabled:cursor-not-allowed transition text-xs font-bold">«</button>
                  <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page <= 1 || loading}
                    className="px-3 py-1.5 rounded-lg text-xs font-semibold text-gray-600 hover:bg-gray-100 disabled:opacity-30 disabled:cursor-not-allowed transition">← Prev</button>
                  {totalPages && Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                    let p;
                    if (totalPages <= 5) p = i + 1;
                    else if (curPage <= 3) p = i + 1;
                    else if (curPage >= totalPages - 2) p = totalPages - 4 + i;
                    else p = curPage - 2 + i;
                    return (
                      <button key={p} onClick={() => setPage(p)} disabled={loading}
                        className={`w-8 h-8 rounded-lg text-xs font-bold transition disabled:cursor-not-allowed ${curPage === p ? "bg-gray-900 text-white shadow-sm" : "text-gray-500 hover:bg-gray-100"}`}>
                        {p}
                      </button>
                    );
                  })}
                  <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page >= totalPages || loading}
                    className="px-3 py-1.5 rounded-lg text-xs font-semibold text-gray-600 hover:bg-gray-100 disabled:opacity-30 disabled:cursor-not-allowed transition">Next →</button>
                  <button onClick={() => setPage(totalPages)} disabled={page >= totalPages || loading}
                    className="p-1.5 rounded-lg text-gray-400 hover:bg-gray-100 disabled:opacity-30 disabled:cursor-not-allowed transition text-xs font-bold">»</button>
                </div>
              </div>
            </div>
          </>
        )}
      </div>

      {/* ── MODALS ── */}
      <CreateReportModal
        open={showCreate}
        onClose={() => setShowCreate(false)}
        onSubmit={handleCreate}
        templates={templates}
        creating={creating}
      />
      <ExecuteResultModal
        result={execResult}
        onClose={() => setExecResult(null)}
      />
    </div>
  );
}