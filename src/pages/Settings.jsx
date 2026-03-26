import { useState, useEffect, useCallback, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  fetchSettings,
  fetchSettingCategories,
  updateSetting,
  upsertSetting,
  bulkUpdateSettings,
  resetSettings,
  exportSettings,
  importSettings,
  validateSetting,
  deleteSetting,
} from "../redux/settingsSlice";

// ─── ICONS ────────────────────────────────────────────────────────────────────
const Ico = ({ d, size = 16, className = "" }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none"
    stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round"
    className={className}>
    {Array.isArray(d) ? d.map((p, i) => <path key={i} d={p} />) : <path d={d} />}
  </svg>
);

const IC = {
  settings:  "M12 15a3 3 0 100-6 3 3 0 000 6z M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-4 0v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83-2.83l.06-.06A1.65 1.65 0 004.68 15a1.65 1.65 0 00-1.51-1H3a2 2 0 010-4h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 012.83-2.83l.06.06A1.65 1.65 0 009 4.68a1.65 1.65 0 001-1.51V3a2 2 0 014 0v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 2.83l-.06.06A1.65 1.65 0 0019.4 9a1.65 1.65 0 001.51 1H21a2 2 0 010 4h-.09a1.65 1.65 0 00-1.51 1z",
  shield:    "M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z",
  bell:      "M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9 M13.73 21a2 2 0 01-3.46 0",
  database:  ["M12 2C6.48 2 2 4.24 2 7v10c0 2.76 4.48 5 10 5s10-2.24 10-5V7c0-2.76-4.48-5-10-5z", "M2 7c0 2.76 4.48 5 10 5s10-2.24 10-5", "M2 12c0 2.76 4.48 5 10 5s10-2.24 10-5"],
  key:       "M21 2l-2 2m-7.61 7.61a5.5 5.5 0 11-7.778 7.778 5.5 5.5 0 017.777-7.777zm0 0L15.5 7.5m0 0l3 3L22 7l-3-3m-3.5 3.5L19 4",
  users:     ["M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2", "M23 21v-2a4 4 0 00-3-3.87", "M16 3.13a4 4 0 010 7.75", "M9 7a4 4 0 100 8 4 4 0 000-8z"],
  save:      "M19 21H5a2 2 0 01-2-2V5a2 2 0 012-2h11l5 5v11a2 2 0 01-2 2z M17 21v-8H7v8 M7 3v5h8",
  plus:      "M12 5v14M5 12h14",
  x:         "M18 6L6 18M6 6l12 12",
  check:     "M20 6L9 17l-5-5",
  refresh:   "M23 4v6h-6 M1 20v-6h6 M3.51 9a9 9 0 0114.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0020.49 15",
  download:  "M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4 M7 10l5 5 5-5 M12 15V3",
  upload:    "M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4 M17 8l-5-5-5 5 M12 3v12",
  reset:     "M1 4v6h6 M23 20v-6h-6 M20.49 9A9 9 0 005.64 5.64L1 10m22 4l-4.64 4.36A9 9 0 013.51 15",
  alert:     "M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z M12 9v4M12 17h.01",
  eye:       "M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z M12 9a3 3 0 100 6 3 3 0 000-6z",
  eyeOff:    ["M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19m-6.72-1.07a3 3 0 11-4.24-4.24", "M1 1l22 22"],
  search:    "M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0",
  trash:     "M3 6h18M8 6V4h8v2M19 6l-1 14H6L5 6",
  edit:      "M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7 M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z",
  billing:   "M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z",
  monitor:   "M13 2H6a2 2 0 00-2 2v14a2 2 0 002 2h12a2 2 0 002-2V9z M13 2v7h7",
  ui:        "M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5",
  chevDown:  "M6 9l6 6 6-6",
};

// ─── CATEGORY CONFIG ──────────────────────────────────────────────────────────
const CAT_CFG = {
  general:       { icon: IC.settings, iconBg: "bg-blue-50",    iconColor: "text-blue-600",    label: "General",       desc: "Basic system configuration" },
  security:      { icon: IC.shield,   iconBg: "bg-red-50",     iconColor: "text-red-500",     label: "Security",      desc: "Security & encryption settings" },
  notifications: { icon: IC.bell,     iconBg: "bg-amber-50",   iconColor: "text-amber-500",   label: "Notifications", desc: "Alert & notification preferences" },
  integrations:  { icon: IC.database, iconBg: "bg-emerald-50", iconColor: "text-emerald-600", label: "Integrations",  desc: "External system integrations" },
  billing:       { icon: IC.billing,  iconBg: "bg-violet-50",  iconColor: "text-violet-600",  label: "Billing",       desc: "Billing & payment configuration" },
  system:        { icon: IC.monitor,  iconBg: "bg-slate-100",  iconColor: "text-slate-600",   label: "System",        desc: "Low-level system parameters" },
  ui:            { icon: IC.ui,       iconBg: "bg-pink-50",    iconColor: "text-pink-500",    label: "UI",            desc: "Interface & display preferences" },
};

// ─── HELPERS ──────────────────────────────────────────────────────────────────
const fmtDate = (d) => d ? new Date(d).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }) : "—";

// ─── TOGGLE ───────────────────────────────────────────────────────────────────
const Toggle = ({ checked, onChange, disabled }) => (
  <button onClick={() => !disabled && onChange(!checked)} disabled={disabled}
    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-200 focus:outline-none flex-shrink-0 disabled:opacity-40 disabled:cursor-not-allowed ${checked ? "bg-gray-900" : "bg-gray-200"}`}>
    <span className={`inline-block h-4 w-4 transform rounded-full bg-white shadow-sm transition-transform duration-200 ${checked ? "translate-x-6" : "translate-x-1"}`} />
  </button>
);

// ─── INPUT FIELD ──────────────────────────────────────────────────────────────
const SettingInput = ({ setting, value, onChange, disabled }) => {
  const [show, setShow] = useState(false);
  const isPassword = setting.key?.toLowerCase().includes("password") || setting.key?.toLowerCase().includes("secret") || setting.key?.toLowerCase().includes("api_key");

  if (setting.dataType === "boolean") {
    return <Toggle checked={!!value} onChange={onChange} disabled={disabled || !setting.isEditable} />;
  }

  if (setting.validationRules?.options?.length > 0) {
    return (
      <select value={value ?? ""} onChange={e => onChange(e.target.value)}
        disabled={disabled || !setting.isEditable}
        className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm text-gray-800 font-medium focus:outline-none focus:ring-2 focus:ring-gray-200 disabled:opacity-50 disabled:cursor-not-allowed">
        {setting.validationRules.options.map(o => <option key={o} value={o}>{o}</option>)}
      </select>
    );
  }

  if (setting.dataType === "number") {
    return (
      <input type="number" value={value ?? ""} onChange={e => onChange(Number(e.target.value))}
        disabled={disabled || !setting.isEditable}
        min={setting.validationRules?.min} max={setting.validationRules?.max}
        className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm text-gray-800 font-medium focus:outline-none focus:ring-2 focus:ring-gray-200 disabled:opacity-50 disabled:cursor-not-allowed" />
    );
  }

  if (isPassword) {
    return (
      <div className="relative">
        <input type={show ? "text" : "password"} value={value ?? ""} onChange={e => onChange(e.target.value)}
          disabled={disabled || !setting.isEditable}
          className="w-full px-3.5 py-2.5 pr-10 bg-gray-50 border border-gray-200 rounded-xl text-sm text-gray-800 font-mono focus:outline-none focus:ring-2 focus:ring-gray-200 disabled:opacity-50 disabled:cursor-not-allowed" />
        <button onClick={() => setShow(v => !v)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition">
          <Ico d={show ? IC.eyeOff : IC.eye} size={15} />
        </button>
      </div>
    );
  }

  if (setting.dataType === "object" || setting.dataType === "array") {
    return (
      <textarea value={typeof value === "string" ? value : JSON.stringify(value, null, 2)}
        onChange={e => { try { onChange(JSON.parse(e.target.value)); } catch { onChange(e.target.value); } }}
        disabled={disabled || !setting.isEditable}
        rows={3}
        className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm text-gray-800 font-mono focus:outline-none focus:ring-2 focus:ring-gray-200 resize-none disabled:opacity-50 disabled:cursor-not-allowed" />
    );
  }

  return (
    <input type="text" value={value ?? ""} onChange={e => onChange(e.target.value)}
      disabled={disabled || !setting.isEditable}
      className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm text-gray-800 font-medium focus:outline-none focus:ring-2 focus:ring-gray-200 disabled:opacity-50 disabled:cursor-not-allowed" />
  );
};

// ─── SETTING ROW ──────────────────────────────────────────────────────────────
const SettingRow = ({ setting, pendingValue, onChange, onReset, updating, isDirty }) => {
  const val = pendingValue !== undefined ? pendingValue : setting.value;
  const isBoolean = setting.dataType === "boolean";

  return (
    <div className={`flex flex-col sm:flex-row sm:items-start gap-4 py-4 rounded-xl px-3 -mx-3 transition-colors ${isDirty ? "bg-amber-50/50" : "hover:bg-gray-50/70"}`}>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <p className="text-sm font-bold text-gray-900">{setting.displayName}</p>
          {!setting.isEditable && <span className="text-[10px] font-bold text-slate-400 bg-slate-100 px-1.5 py-0.5 rounded">READ-ONLY</span>}
          {setting.requiresRestart && <span className="text-[10px] font-bold text-orange-500 bg-orange-50 border border-orange-200 px-1.5 py-0.5 rounded">RESTART REQ.</span>}
          {isDirty && <span className="text-[10px] font-bold text-amber-600 bg-amber-100 px-1.5 py-0.5 rounded">UNSAVED</span>}
        </div>
        {setting.description && <p className="text-xs text-gray-400 mt-0.5 leading-relaxed">{setting.description}</p>}
        <p className="text-[10px] text-gray-300 font-mono mt-0.5">{setting.category}.{setting.key}</p>
      </div>
      <div className={`flex items-center gap-2 ${isBoolean ? "flex-shrink-0 pt-1" : "w-full sm:w-72"}`}>
        <div className={isBoolean ? "" : "flex-1"}>
          <SettingInput setting={setting} value={val} onChange={onChange} disabled={updating} />
        </div>
        {isDirty && (
          <button onClick={onReset} className="text-gray-300 hover:text-gray-500 transition flex-shrink-0" title="Reset to current saved value">
            <Ico d={IC.x} size={14} />
          </button>
        )}
      </div>
    </div>
  );
};

// ─── SECTION CARD ─────────────────────────────────────────────────────────────
const SectionCard = ({ category, settings, pendingValues, onChangeSetting, onResetSetting, updating, expanded, onToggle }) => {
  const cfg = CAT_CFG[category] || { icon: IC.settings, iconBg: "bg-gray-100", iconColor: "text-gray-500", label: category, desc: "" };
  const dirtyCount = settings.filter(s => pendingValues[`${s.category}.${s.key}`] !== undefined).length;

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
      <button
        onClick={onToggle}
        className="w-full flex items-center justify-between p-5 hover:bg-gray-50/50 transition-colors"
      >
        <div className="flex items-center gap-4">
          <div className={`w-11 h-11 rounded-2xl ${cfg.iconBg} flex items-center justify-center flex-shrink-0`}>
            <Ico d={cfg.icon} size={18} className={cfg.iconColor} />
          </div>
          <div className="text-left">
            <div className="flex items-center gap-2">
              <h2 className="text-base font-extrabold text-gray-900">{cfg.label}</h2>
              {dirtyCount > 0 && (
                <span className="text-[10px] font-bold text-amber-600 bg-amber-100 px-2 py-0.5 rounded-full">{dirtyCount} unsaved</span>
              )}
            </div>
            <p className="text-xs text-gray-400 mt-0.5">{cfg.desc} · {settings.length} settings</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <Ico d={IC.chevDown} size={16} className={`text-gray-400 transition-transform ${expanded ? "rotate-180" : ""}`} />
        </div>
      </button>

      {expanded && (
        <div className="px-5 pb-5 border-t border-gray-50">
          {settings.length === 0 ? (
            <div className="py-8 text-center text-gray-400 text-sm">No settings in this category</div>
          ) : (
            <div className="divide-y divide-gray-50">
              {settings.map(s => {
                const pk = `${s.category}.${s.key}`;
                return (
                  <SettingRow
                    key={pk}
                    setting={s}
                    pendingValue={pendingValues[pk]}
                    onChange={val => onChangeSetting(pk, val)}
                    onReset={() => onResetSetting(pk)}
                    updating={updating}
                    isDirty={pendingValues[pk] !== undefined}
                  />
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

// ─── CONFIRM MODAL ────────────────────────────────────────────────────────────
const ConfirmModal = ({ open, title, message, onConfirm, onCancel, danger, loading }) => {
  if (!open) return null;
  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6">
        <div className={`w-12 h-12 rounded-2xl flex items-center justify-center mb-4 ${danger ? "bg-red-50" : "bg-amber-50"}`}>
          <Ico d={IC.alert} size={22} className={danger ? "text-red-500" : "text-amber-500"} />
        </div>
        <h3 className="text-base font-extrabold text-gray-900">{title}</h3>
        <p className="text-sm text-gray-500 mt-1.5">{message}</p>
        <div className="flex gap-3 mt-5">
          <button onClick={onCancel} className="flex-1 px-4 py-2.5 rounded-xl border border-gray-200 text-sm font-bold text-gray-600 hover:bg-gray-50 transition">Cancel</button>
          <button onClick={onConfirm} disabled={loading}
            className={`flex-1 px-4 py-2.5 rounded-xl text-sm font-extrabold text-white transition flex items-center justify-center gap-2 disabled:opacity-60 ${danger ? "bg-red-500 hover:bg-red-600" : "bg-gray-900 hover:bg-gray-800"}`}>
            {loading ? <><Ico d={IC.refresh} size={13} className="animate-spin" /> Working...</> : "Confirm"}
          </button>
        </div>
      </div>
    </div>
  );
};

// ─── IMPORT MODAL ─────────────────────────────────────────────────────────────
const ImportModal = ({ open, onClose, onImport, importing }) => {
  const [json, setJson]       = useState("");
  const [overwrite, setOverwrite] = useState(false);
  const [error, setError]     = useState("");

  if (!open) return null;

  const handleImport = () => {
    try {
      const parsed = JSON.parse(json);
      setError("");
      onImport({ settings: parsed.settings || parsed, importBy: "admin", overwrite });
    } catch {
      setError("Invalid JSON format");
    }
  };

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[100] flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between p-5 border-b border-gray-100">
          <h2 className="text-base font-extrabold text-gray-900">Import Settings</h2>
          <button onClick={onClose} className="p-2 rounded-xl hover:bg-gray-100 transition text-gray-400"><Ico d={IC.x} size={16} /></button>
        </div>
        <div className="p-5 space-y-4">
          <div>
            <label className="block text-xs font-bold text-gray-500 mb-1.5 uppercase tracking-wide">Settings JSON</label>
            <textarea value={json} onChange={e => { setJson(e.target.value); setError(""); }} rows={8}
              placeholder='{"general": {"system_name": {"value": "EzPost"}}, ...}'
              className="w-full px-3.5 py-3 bg-gray-50 border border-gray-200 rounded-xl text-xs text-gray-800 font-mono focus:outline-none focus:ring-2 focus:ring-gray-200 resize-none" />
            {error && <p className="text-xs text-red-500 font-semibold mt-1">{error}</p>}
          </div>
          <label className="flex items-center gap-2 cursor-pointer">
            <Toggle checked={overwrite} onChange={setOverwrite} />
            <span className="text-sm font-semibold text-gray-700">Overwrite existing settings</span>
          </label>
        </div>
        <div className="flex gap-3 px-5 py-4 border-t border-gray-100">
          <button onClick={onClose} className="flex-1 px-4 py-2.5 rounded-xl border border-gray-200 text-sm font-bold text-gray-600 hover:bg-gray-50 transition">Cancel</button>
          <button onClick={handleImport} disabled={importing || !json.trim()}
            className="flex-1 px-4 py-2.5 rounded-xl bg-gray-900 hover:bg-gray-800 text-white text-sm font-extrabold transition disabled:opacity-50 flex items-center justify-center gap-2">
            {importing ? <><Ico d={IC.refresh} size={13} className="animate-spin" /> Importing...</> : "Import"}
          </button>
        </div>
      </div>
    </div>
  );
};

// ─── TOAST ────────────────────────────────────────────────────────────────────
const Toast = ({ message, type = "success", onClose }) => {
  useEffect(() => { const t = setTimeout(onClose, 3000); return () => clearTimeout(t); }, [onClose]);
  return (
    <div className={`fixed bottom-5 right-5 z-[200] flex items-center gap-3 px-4 py-3 rounded-2xl shadow-2xl text-sm font-bold text-white transition-all
      ${type === "success" ? "bg-gray-900" : type === "error" ? "bg-red-500" : "bg-amber-500"}`}>
      <Ico d={type === "success" ? IC.check : IC.alert} size={16} />
      {message}
      <button onClick={onClose} className="ml-1 opacity-60 hover:opacity-100 transition"><Ico d={IC.x} size={13} /></button>
    </div>
  );
};

// ─── SKELETON ─────────────────────────────────────────────────────────────────
const SectionSkeleton = () => (
  <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 animate-pulse space-y-4">
    <div className="flex items-center gap-4">
      <div className="w-11 h-11 bg-gray-100 rounded-2xl" />
      <div className="space-y-1.5">
        <div className="h-4 bg-gray-100 rounded w-32" />
        <div className="h-3 bg-gray-100 rounded w-48" />
      </div>
    </div>
    {[1, 2, 3].map(i => (
      <div key={i} className="flex items-center justify-between gap-4 py-3 border-t border-gray-50">
        <div className="space-y-1.5 flex-1">
          <div className="h-3.5 bg-gray-100 rounded w-36" />
          <div className="h-3 bg-gray-100 rounded w-56" />
        </div>
        <div className="h-9 bg-gray-100 rounded-xl w-64" />
      </div>
    ))}
  </div>
);

// ─── MAIN PAGE ────────────────────────────────────────────────────────────────
export default function SettingsPage() {
  const dispatch = useDispatch();
  const { settings, categories, loading, updating, bulkUpdating, exporting, importing, resetting, error } = useSelector(s => s.settings);

  // Local state
  const [pendingValues,  setPendingValues]  = useState({}); // { "category.key": newValue }
  const [expandedCats,   setExpandedCats]   = useState({}); // { category: bool }
  const [search,         setSearch]         = useState("");
  const [toast,          setToast]          = useState(null);
  const [confirmReset,   setConfirmReset]   = useState(false);
  const [showImport,     setShowImport]     = useState(false);

  // Load settings
  const loadSettings = useCallback(() => {
    dispatch(fetchSettings({ search }));
  }, [dispatch, search]);

  useEffect(() => { loadSettings(); }, [loadSettings]);
  useEffect(() => { dispatch(fetchSettingCategories()); }, [dispatch]);

  // Auto-expand first category that has results
  useEffect(() => {
    if (settings && Object.keys(settings).length > 0 && Object.keys(expandedCats).length === 0) {
      const first = Object.keys(settings)[0];
      setExpandedCats({ [first]: true });
    }
  }, [settings]);

  const showToast = (message, type = "success") => setToast({ message, type });

  // All flat settings
  const allSettings = Object.values(settings).flat();
  const dirtyKeys = Object.keys(pendingValues);
  const dirtyCount = dirtyKeys.length;

  // ── Change handler
  const handleChangeSetting = (pk, val) => {
    setPendingValues(p => ({ ...p, [pk]: val }));
  };

  const handleResetPending = (pk) => {
    setPendingValues(p => { const n = { ...p }; delete n[pk]; return n; });
  };

  // ── Save: bulk update all pending
  const handleSaveAll = async () => {
    if (!dirtyCount) return;

    const updates = dirtyKeys.map(pk => {
      const [category, ...keyParts] = pk.split(".");
      const key = keyParts.join(".");
      return { category, key, value: pendingValues[pk] };
    });

    const result = await dispatch(bulkUpdateSettings({ settings: updates, lastModifiedBy: "admin" }));

    if (result.meta.requestStatus === "fulfilled") {
      setPendingValues({});
      loadSettings();
      const { updated = 0, errors = 0 } = result.payload || {};
      if (errors > 0) {
        showToast(`${updated} saved, ${errors} failed`, "warning");
      } else {
        showToast(`${updated} setting${updated !== 1 ? "s" : ""} saved successfully`);
      }
    } else {
      showToast("Failed to save settings", "error");
    }
  };

  // ── Save single (on blur or immediate toggle)
  const handleSaveSingle = async (category, key, value) => {
    const result = await dispatch(updateSetting({ category, key, settingData: { value, lastModifiedBy: "admin" } }));
    if (result.meta.requestStatus === "fulfilled") {
      const pk = `${category}.${key}`;
      setPendingValues(p => { const n = { ...p }; delete n[pk]; return n; });
      loadSettings();
      showToast("Setting saved");
    } else {
      showToast("Failed to save setting", "error");
    }
  };

  // ── Reset all to defaults
  const handleResetAll = async () => {
    const result = await dispatch(resetSettings({ resetBy: "admin" }));
    if (result.meta.requestStatus === "fulfilled") {
      setPendingValues({});
      loadSettings();
      setConfirmReset(false);
      showToast("Settings reset to defaults");
    } else {
      showToast("Reset failed", "error");
      setConfirmReset(false);
    }
  };

  // ── Export
  const handleExport = async () => {
    const result = await dispatch(exportSettings({ includePublic: "true" }));
    if (result.meta.requestStatus === "fulfilled") {
      const blob = new Blob([JSON.stringify(result.payload, null, 2)], { type: "application/json" });
      const url  = URL.createObjectURL(blob);
      const a    = document.createElement("a"); a.href = url; a.download = "settings-export.json"; a.click();
      URL.revokeObjectURL(url);
      showToast("Settings exported");
    } else {
      showToast("Export failed", "error");
    }
  };

  // ── Import
  const handleImport = async (data) => {
    const result = await dispatch(importSettings(data));
    if (result.meta.requestStatus === "fulfilled") {
      setShowImport(false);
      loadSettings();
      const { imported = 0, skipped = 0 } = result.payload || {};
      showToast(`${imported} imported, ${skipped} skipped`);
    } else {
      showToast("Import failed", "error");
    }
  };

  // ── Discard all pending
  const handleDiscardAll = () => {
    setPendingValues({});
    showToast("Changes discarded");
  };

  const toggleCategory = (cat) => {
    setExpandedCats(p => ({ ...p, [cat]: !p[cat] }));
  };

  const expandAll  = () => setExpandedCats(Object.fromEntries(Object.keys(settings).map(c => [c, true])));
  const collapseAll = () => setExpandedCats({});

  // Categorized settings from Redux store
  const categorizedSettings = settings; // already grouped by backend

  return (
    <div className="min-h-screen bg-gray-50" style={{ fontFamily: "'DM Sans','Segoe UI',sans-serif" }}>
      <div className="p-4 md:p-6 space-y-5">

        {/* ── HEADER ── */}
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-extrabold text-gray-900 tracking-tight">System Settings</h1>
            <p className="text-gray-400 text-sm mt-1 font-medium">
              Configure EzPost® system parameters and preferences
              {categories.length > 0 && <span className="ml-2 font-bold text-gray-600">· {categories.reduce((s, c) => s + (c.totalSettings || 0), 0)} total settings</span>}
            </p>
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            <button onClick={loadSettings} disabled={loading}
              className="flex items-center gap-2 px-4 py-2.5 bg-white border border-gray-200 hover:bg-gray-50 text-gray-700 rounded-xl text-sm font-bold shadow-sm transition">
              <Ico d={IC.refresh} size={14} className={loading ? "animate-spin" : ""} /> Refresh
            </button>
            <button onClick={handleExport} disabled={exporting}
              className="flex items-center gap-2 px-4 py-2.5 bg-white border border-gray-200 hover:bg-gray-50 text-gray-700 rounded-xl text-sm font-bold shadow-sm transition">
              <Ico d={IC.download} size={14} className={exporting ? "animate-pulse" : ""} />
              {exporting ? "Exporting..." : "Export"}
            </button>
            <button onClick={() => setShowImport(true)}
              className="flex items-center gap-2 px-4 py-2.5 bg-white border border-gray-200 hover:bg-gray-50 text-gray-700 rounded-xl text-sm font-bold shadow-sm transition">
              <Ico d={IC.upload} size={14} /> Import
            </button>
            <button onClick={() => setConfirmReset(true)}
              className="flex items-center gap-2 px-4 py-2.5 bg-white border border-red-200 hover:bg-red-50 text-red-500 rounded-xl text-sm font-bold shadow-sm transition">
              <Ico d={IC.reset} size={14} /> Reset Defaults
            </button>
          </div>
        </div>

        {/* ── CATEGORY OVERVIEW CARDS ── */}
        {categories.length > 0 && (
          <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-7 gap-3">
            {categories.map(cat => {
              const cfg = CAT_CFG[cat.category] || { icon: IC.settings, iconBg: "bg-gray-100", iconColor: "text-gray-500", label: cat.category };
              const dirty = Object.keys(pendingValues).filter(k => k.startsWith(cat.category + ".")).length;
              return (
                <button key={cat.category}
                  onClick={() => { setExpandedCats(p => ({ ...p, [cat.category]: true })); setTimeout(() => document.getElementById(`section-${cat.category}`)?.scrollIntoView({ behavior: "smooth", block: "start" }), 100); }}
                  className="bg-white border border-gray-100 rounded-2xl p-4 hover:shadow-md hover:border-gray-200 transition-all text-left group">
                  <div className={`w-9 h-9 rounded-xl ${cfg.iconBg} flex items-center justify-center mb-2`}>
                    <Ico d={cfg.icon} size={16} className={cfg.iconColor} />
                  </div>
                  <p className="text-xs font-extrabold text-gray-900 capitalize">{cfg.label}</p>
                  <p className="text-[10px] text-gray-400 mt-0.5">{cat.totalSettings} settings</p>
                  {dirty > 0 && <p className="text-[10px] font-bold text-amber-600 mt-0.5">{dirty} unsaved</p>}
                </button>
              );
            })}
          </div>
        )}

        {/* ── SEARCH + CONTROLS ── */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-3 md:p-4 flex flex-col sm:flex-row gap-3 items-stretch sm:items-center">
          <div className="flex-1 flex items-center gap-3 bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5">
            <Ico d={IC.search} size={14} className="text-gray-400 flex-shrink-0" />
            <input type="text" placeholder="Search settings by name, key, or description..."
              value={search} onChange={e => setSearch(e.target.value)}
              className="bg-transparent outline-none text-sm text-gray-700 placeholder-gray-400 w-full font-medium" />
            {search && <button onClick={() => setSearch("")} className="text-gray-300 hover:text-gray-500 transition"><Ico d={IC.x} size={13} /></button>}
          </div>
          <div className="flex gap-2">
            <button onClick={expandAll}   className="px-3.5 py-2 text-xs font-bold text-gray-500 bg-gray-50 border border-gray-200 rounded-xl hover:bg-gray-100 transition">Expand all</button>
            <button onClick={collapseAll} className="px-3.5 py-2 text-xs font-bold text-gray-500 bg-gray-50 border border-gray-200 rounded-xl hover:bg-gray-100 transition">Collapse all</button>
          </div>
        </div>

        {/* ── UNSAVED BANNER ── */}
        {dirtyCount > 0 && (
          <div className="bg-amber-50 border border-amber-200 rounded-2xl px-5 py-3.5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-xl bg-amber-100 flex items-center justify-center flex-shrink-0">
                <Ico d={IC.alert} size={15} className="text-amber-600" />
              </div>
              <div>
                <p className="text-sm font-extrabold text-amber-900">{dirtyCount} unsaved change{dirtyCount !== 1 ? "s" : ""}</p>
                <p className="text-xs text-amber-600">Save now or discard to revert</p>
              </div>
            </div>
            <div className="flex gap-2">
              <button onClick={handleDiscardAll} className="px-4 py-2 text-xs font-bold text-amber-700 bg-white border border-amber-200 rounded-xl hover:bg-amber-50 transition">
                Discard all
              </button>
              <button onClick={handleSaveAll} disabled={bulkUpdating}
                className="flex items-center gap-2 px-4 py-2 text-xs font-extrabold text-white bg-amber-600 hover:bg-amber-700 rounded-xl transition disabled:opacity-60">
                {bulkUpdating ? <><Ico d={IC.refresh} size={12} className="animate-spin" /> Saving...</> : <><Ico d={IC.save} size={12} /> Save {dirtyCount} change{dirtyCount !== 1 ? "s" : ""}</>}
              </button>
            </div>
          </div>
        )}

        {/* ── SETTINGS SECTIONS ── */}
        {loading && Object.keys(categorizedSettings).length === 0 ? (
          <div className="space-y-4">
            {[1, 2, 3].map(i => <SectionSkeleton key={i} />)}
          </div>
        ) : Object.keys(categorizedSettings).length === 0 ? (
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm py-20 flex flex-col items-center gap-3">
            <div className="w-14 h-14 rounded-2xl bg-gray-100 flex items-center justify-center">
              <Ico d={IC.settings} size={24} className="text-gray-400" />
            </div>
            <p className="text-gray-500 font-semibold">No settings found</p>
            {search && <button onClick={() => setSearch("")} className="text-sm font-bold text-blue-600 hover:text-blue-700 transition">Clear search</button>}
          </div>
        ) : (
          <div className="space-y-4">
            {Object.entries(categorizedSettings).map(([category, catSettings]) => (
              <div key={category} id={`section-${category}`}>
                <SectionCard
                  category={category}
                  settings={catSettings}
                  pendingValues={pendingValues}
                  onChangeSetting={handleChangeSetting}
                  onResetSetting={handleResetPending}
                  updating={updating || bulkUpdating}
                  expanded={!!expandedCats[category]}
                  onToggle={() => toggleCategory(category)}
                />
              </div>
            ))}
          </div>
        )}

        {/* ── STICKY SAVE BUTTON ── */}
        <div className="flex justify-end pb-4">
          <button
            onClick={handleSaveAll}
            disabled={!dirtyCount || bulkUpdating}
            className={`flex items-center gap-2 text-sm font-extrabold px-7 py-3 rounded-2xl shadow-lg transition-all duration-200
              ${dirtyCount > 0
                ? "bg-gray-900 hover:bg-gray-800 text-white cursor-pointer"
                : "bg-gray-100 text-gray-400 cursor-not-allowed"}`}
          >
            {bulkUpdating
              ? <><Ico d={IC.refresh} size={15} className="animate-spin" /> Saving...</>
              : <><Ico d={IC.save} size={15} /> {dirtyCount > 0 ? `Save ${dirtyCount} Change${dirtyCount !== 1 ? "s" : ""}` : "All Settings Saved"}</>
            }
          </button>
        </div>
      </div>

      {/* ── MODALS ── */}
      <ConfirmModal
        open={confirmReset}
        title="Reset All Settings"
        message="This will reset all settings to their default values. This action cannot be undone."
        danger
        loading={resetting}
        onConfirm={handleResetAll}
        onCancel={() => setConfirmReset(false)}
      />

      <ImportModal
        open={showImport}
        onClose={() => setShowImport(false)}
        onImport={handleImport}
        importing={importing}
      />

      {/* ── TOAST ── */}
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
    </div>
  );
}