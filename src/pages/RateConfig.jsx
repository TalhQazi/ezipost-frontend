import { useState, useEffect, useMemo } from "react";
import {
  DollarSign, CheckCircle, Clock, Package,
  Edit2, X, Plus, Trash2, RefreshCw, Search,
  AlertTriangle, Copy, ChevronDown,
} from "lucide-react";
import { useDispatch, useSelector } from "react-redux";
import {
  fetchRateConfigs,
  fetchRateConfigStats,
  createRateConfig,
  updateRateConfig,
  deleteRateConfig,
  cloneRateConfig,
} from "../redux/rateConfigSlice";

// ─── CONSTANTS ────────────────────────────────────────────────────────────────

const RATE_TYPE_OPTIONS = ["domestic", "international", "express", "standard", "bulk"];
const STATUS_OPTIONS    = ["active", "inactive", "draft", "expired"];
const CURRENCY_OPTIONS  = ["USD", "EUR", "GBP", "CAD", "AUD"];

const EMPTY_FORM = {
  serviceName:  "",
  rateType:     "domestic",
  baseRate:     "",
  currency:     "USD",
  effectiveDate:"",
  expiryDate:   "",
  status:       "active",
  priority:     1,
  createdBy:    "admin",
  weightRanges: [{ minWeight: 0, maxWeight: 1, ratePerUnit: 0 }],
  zoneRates:    [],
  additionalCharges: [],
  discounts:    [],
  restrictions: [],
};

// ─── HELPERS ──────────────────────────────────────────────────────────────────

const fmt = (n) =>
  Number(n || 0).toLocaleString("en-US", { style: "currency", currency: "USD", minimumFractionDigits: 2 });

function groupByRateType(configs) {
  return configs.reduce((acc, cfg) => {
    const key = cfg.rateType || "other";
    if (!acc[key]) acc[key] = [];
    acc[key].push(cfg);
    return acc;
  }, {});
}

// ─── STATUS BADGE ─────────────────────────────────────────────────────────────

const StatusBadge = ({ status }) => {
  const cfg = {
    active:   "bg-slate-900 text-white",
    inactive: "bg-slate-100 text-slate-500",
    draft:    "bg-amber-100 text-amber-700",
    expired:  "bg-red-100 text-red-600",
  }[status?.toLowerCase()] || "bg-slate-100 text-slate-500";
  return (
    <span className={`px-2.5 py-1 rounded-full text-xs font-bold capitalize ${cfg}`}>
      {status}
    </span>
  );
};

// ─── WEIGHT RANGES SUB-FORM ───────────────────────────────────────────────────

const WeightRangesField = ({ ranges, onChange }) => {
  const add = () =>
    onChange([...ranges, { minWeight: 0, maxWeight: 1, ratePerUnit: 0 }]);
  const remove = (i) => onChange(ranges.filter((_, idx) => idx !== i));
  const update = (i, key, val) => {
    const next = [...ranges];
    next[i] = { ...next[i], [key]: parseFloat(val) || 0 };
    onChange(next);
  };

  return (
    <div className="space-y-2">
      {ranges.map((r, i) => (
        <div key={i} className="flex gap-2 items-center">
          <input
            type="number" min="0" step="0.01"
            className="flex-1 border border-slate-200 rounded-lg px-3 py-2 text-xs outline-none focus:ring-2 focus:ring-indigo-200"
            placeholder="Min wt"
            value={r.minWeight}
            onChange={(e) => update(i, "minWeight", e.target.value)}
          />
          <span className="text-slate-400 text-xs">—</span>
          <input
            type="number" min="0" step="0.01"
            className="flex-1 border border-slate-200 rounded-lg px-3 py-2 text-xs outline-none focus:ring-2 focus:ring-indigo-200"
            placeholder="Max wt"
            value={r.maxWeight}
            onChange={(e) => update(i, "maxWeight", e.target.value)}
          />
          <input
            type="number" min="0" step="0.0001"
            className="flex-1 border border-slate-200 rounded-lg px-3 py-2 text-xs outline-none focus:ring-2 focus:ring-indigo-200"
            placeholder="Rate/unit"
            value={r.ratePerUnit}
            onChange={(e) => update(i, "ratePerUnit", e.target.value)}
          />
          <button
            type="button"
            onClick={() => remove(i)}
            className="w-7 h-7 flex items-center justify-center rounded text-red-400 hover:bg-red-50 transition"
          >
            <X size={13} />
          </button>
        </div>
      ))}
      <button
        type="button"
        onClick={add}
        className="text-xs font-semibold text-indigo-600 hover:text-indigo-800 flex items-center gap-1 mt-1"
      >
        <Plus size={12} /> Add Weight Range
      </button>
    </div>
  );
};

// ─── MODAL ────────────────────────────────────────────────────────────────────

function Modal({ onClose, onSave, editConfig, saving }) {
  const [form, setForm] = useState(
    editConfig
      ? {
          ...editConfig,
          baseRate:      String(editConfig.baseRate),
          effectiveDate: editConfig.effectiveDate
            ? new Date(editConfig.effectiveDate).toISOString().split("T")[0]
            : "",
          expiryDate: editConfig.expiryDate
            ? new Date(editConfig.expiryDate).toISOString().split("T")[0]
            : "",
          weightRanges: editConfig.weightRanges?.length
            ? editConfig.weightRanges
            : [{ minWeight: 0, maxWeight: 1, ratePerUnit: 0 }],
        }
      : { ...EMPTY_FORM }
  );
  const [errors, setErrors] = useState({});

  const set = (key, val) => {
    setForm((f) => ({ ...f, [key]: val }));
    setErrors((e) => ({ ...e, [key]: undefined }));
  };

  const validate = () => {
    const e = {};
    if (!form.serviceName.trim()) e.serviceName = "Service name is required";
    if (!form.baseRate || isNaN(Number(form.baseRate)) || Number(form.baseRate) < 0)
      e.baseRate = "Valid base rate is required";
    if (!form.effectiveDate) e.effectiveDate = "Effective date is required";
    if (!form.createdBy?.trim()) e.createdBy = "Created by is required";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = () => {
    if (!validate()) return;
    onSave({
      ...form,
      baseRate: parseFloat(form.baseRate),
      priority: parseInt(form.priority) || 1,
    });
  };

  const inputCls = (field) =>
    `w-full border rounded-lg px-3 py-2.5 text-sm text-slate-800 bg-white outline-none transition focus:ring-2 ${
      errors[field]
        ? "border-red-400 focus:ring-red-200"
        : "border-slate-200 focus:ring-indigo-200 focus:border-indigo-400"
    }`;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-xl mx-4 overflow-hidden">
        {/* Header */}
        <div className="flex items-start justify-between px-6 pt-6 pb-4 border-b border-slate-100">
          <div>
            <h2 className="text-xl font-extrabold text-slate-900">
              {editConfig ? "Edit Rate Config" : "Add New Rate Config"}
            </h2>
            <p className="text-sm text-slate-400 mt-0.5">
              {editConfig ? "Update postage rate configuration" : "Create a new postage rate configuration"}
            </p>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-lg text-slate-400 hover:bg-slate-100 transition"
          >
            <X size={16} />
          </button>
        </div>

        {/* Body */}
        <div className="px-6 py-5 space-y-4 max-h-[65vh] overflow-y-auto">

          {/* Service Name + Rate Type */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1.5 uppercase tracking-wide">
                Service Name <span className="text-red-400">*</span>
              </label>
              <input
                className={inputCls("serviceName")}
                placeholder="e.g., Standard Letter"
                value={form.serviceName}
                onChange={(e) => set("serviceName", e.target.value)}
              />
              {errors.serviceName && <p className="text-xs text-red-500 mt-1">{errors.serviceName}</p>}
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1.5 uppercase tracking-wide">
                Rate Type <span className="text-red-400">*</span>
              </label>
              <select
                className={inputCls("rateType")}
                value={form.rateType}
                onChange={(e) => set("rateType", e.target.value)}
              >
                {RATE_TYPE_OPTIONS.map((t) => (
                  <option key={t} value={t} className="capitalize">{t}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Base Rate + Currency */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1.5 uppercase tracking-wide">
                Base Rate <span className="text-red-400">*</span>
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm font-medium">$</span>
                <input
                  className={`${inputCls("baseRate")} pl-7`}
                  placeholder="0.00"
                  type="number"
                  min="0"
                  step="0.01"
                  value={form.baseRate}
                  onChange={(e) => set("baseRate", e.target.value)}
                />
              </div>
              {errors.baseRate && <p className="text-xs text-red-500 mt-1">{errors.baseRate}</p>}
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1.5 uppercase tracking-wide">
                Currency
              </label>
              <select
                className={inputCls("currency")}
                value={form.currency}
                onChange={(e) => set("currency", e.target.value)}
              >
                {CURRENCY_OPTIONS.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Weight Ranges */}
          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1.5 uppercase tracking-wide">
              Weight Ranges <span className="text-slate-400 font-normal normal-case">(min / max / rate per unit)</span>
            </label>
            <WeightRangesField
              ranges={form.weightRanges}
              onChange={(val) => set("weightRanges", val)}
            />
          </div>

          {/* Effective Date + Expiry Date */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1.5 uppercase tracking-wide">
                Effective Date <span className="text-red-400">*</span>
              </label>
              <input
                className={inputCls("effectiveDate")}
                type="date"
                value={form.effectiveDate}
                onChange={(e) => set("effectiveDate", e.target.value)}
              />
              {errors.effectiveDate && <p className="text-xs text-red-500 mt-1">{errors.effectiveDate}</p>}
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1.5 uppercase tracking-wide">
                Expiry Date
              </label>
              <input
                className={inputCls("expiryDate")}
                type="date"
                value={form.expiryDate}
                onChange={(e) => set("expiryDate", e.target.value)}
              />
            </div>
          </div>

          {/* Status + Priority */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1.5 uppercase tracking-wide">
                Status
              </label>
              <select
                className={inputCls("status")}
                value={form.status}
                onChange={(e) => set("status", e.target.value)}
              >
                {STATUS_OPTIONS.map((s) => (
                  <option key={s} value={s} className="capitalize">{s}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1.5 uppercase tracking-wide">
                Priority
              </label>
              <input
                className={inputCls("priority")}
                type="number"
                min="1"
                value={form.priority}
                onChange={(e) => set("priority", e.target.value)}
              />
            </div>
          </div>

          {/* Created By */}
          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1.5 uppercase tracking-wide">
              Created By <span className="text-red-400">*</span>
            </label>
            <input
              className={inputCls("createdBy")}
              placeholder="e.g., admin"
              value={form.createdBy}
              onChange={(e) => set("createdBy", e.target.value)}
            />
            {errors.createdBy && <p className="text-xs text-red-500 mt-1">{errors.createdBy}</p>}
          </div>

          {/* Read-only ID in edit mode */}
          {editConfig && (
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1.5 uppercase tracking-wide">
                Config ID
              </label>
              <input
                className="w-full border border-slate-100 rounded-lg px-3 py-2.5 text-sm text-slate-400 bg-slate-50 cursor-not-allowed"
                value={editConfig._id}
                readOnly
              />
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-slate-100 flex items-center justify-end gap-3 bg-slate-50/50">
          <button
            onClick={onClose}
            className="px-4 py-2.5 text-sm font-semibold text-slate-600 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={saving}
            className="px-5 py-2.5 text-sm font-bold text-white bg-slate-900 rounded-lg hover:bg-slate-700 transition shadow-md disabled:opacity-60 flex items-center gap-2"
          >
            {saving && <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />}
            {editConfig ? "Update Rate" : "Add Rate"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── MAIN PAGE ────────────────────────────────────────────────────────────────

export default function RateConfig() {
  const [showModal, setShowModal] = useState(false);
  const [editConfig, setEditConfig] = useState(null);
  const [search, setSearch]         = useState("");
  const [rateTypeFilter, setRateTypeFilter] = useState("");
  const [statusFilter, setStatusFilter]     = useState("");
  const [confirmDelete, setConfirmDelete]   = useState(null); // holds config to delete

  const dispatch = useDispatch();
  const {
    configs = [],
    stats   = {},
    loading,
    creating,
    updating,
  } = useSelector((state) => state.rateConfig);

  // Fetch data
  useEffect(() => {
    dispatch(fetchRateConfigs({ search, rateType: rateTypeFilter, status: statusFilter }));
  }, [search, rateTypeFilter, statusFilter, dispatch]);

  useEffect(() => {
    dispatch(fetchRateConfigStats());
  }, [dispatch]);

  const handleRefresh = () => {
    dispatch(fetchRateConfigs({ search, rateType: rateTypeFilter, status: statusFilter }));
    dispatch(fetchRateConfigStats());
  };

  // ── CRUD ──
  const handleSave = async (form) => {
    let result;
    if (editConfig) {
      result = await dispatch(updateRateConfig({ id: editConfig._id, configData: form }));
      if (updateRateConfig.fulfilled.match(result)) {
        setShowModal(false);
        setEditConfig(null);
        dispatch(fetchRateConfigStats());
      }
    } else {
      result = await dispatch(createRateConfig(form));
      if (createRateConfig.fulfilled.match(result)) {
        setShowModal(false);
        dispatch(fetchRateConfigStats());
      }
    }
  };

  const handleDelete = async (cfg) => {
    const result = await dispatch(deleteRateConfig(cfg._id));
    if (deleteRateConfig.fulfilled.match(result)) {
      setConfirmDelete(null);
      dispatch(fetchRateConfigStats());
    }
  };

  const handleClone = async (cfg) => {
    await dispatch(cloneRateConfig({ id: cfg._id, cloneData: { createdBy: "admin" } }));
    dispatch(fetchRateConfigStats());
  };

  const openEdit = (cfg) => { setEditConfig(cfg); setShowModal(true); };
  const openAdd  = ()    => { setEditConfig(null); setShowModal(true); };

  // Group configs by rateType
  const grouped    = useMemo(() => groupByRateType(configs), [configs]);
  const rateTypes  = Object.keys(grouped);

  // Stat cards
  const statCards = [
    {
      icon: <DollarSign size={20} />,
      bg: "bg-indigo-50", fg: "text-indigo-600",
      label: "Active Configs",
      value: stats.activeConfigs ?? configs.filter(c => c.status === "active").length,
    },
    {
      icon: <Package size={20} />,
      bg: "bg-emerald-50", fg: "text-emerald-600",
      label: "Rate Types",
      value: rateTypes.length,
    },
    {
      icon: <CheckCircle size={20} />,
      bg: "bg-amber-50", fg: "text-amber-600",
      label: "Avg Base Rate",
      value: fmt(stats.averageBaseRate || 0),
    },
    {
      icon: <Clock size={20} />,
      bg: "bg-slate-50", fg: "text-slate-600",
      label: "Draft / Expired",
      value: `${stats.draftConfigs ?? 0} / ${stats.expiredConfigs ?? 0}`,
    },
  ];

  return (
    <div className="min-h-screen bg-slate-50 p-8 font-sans">

      {/* ── HEADER ── */}
      <div className="flex justify-between items-start mb-8">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Rate Configuration</h1>
          <p className="text-sm text-slate-500 mt-1">Manage postage rates and calculation rules</p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={handleRefresh}
            className="flex items-center gap-2 px-4 py-2.5 bg-white border border-slate-200 text-slate-600 rounded-xl text-sm font-semibold hover:bg-slate-50 transition shadow-sm"
          >
            <RefreshCw size={14} /> Refresh
          </button>
          <button
            onClick={openAdd}
            className="flex items-center gap-2 bg-slate-900 hover:bg-slate-700 text-white px-5 py-2.5 rounded-xl font-bold text-sm shadow-lg transition"
          >
            <Plus size={16} /> Add New Rate
          </button>
        </div>
      </div>

      {/* ── STAT CARDS ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {statCards.map(({ icon, bg, fg, label, value }) => (
          <div key={label} className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-4">
            <div className={`w-12 h-12 rounded-xl ${bg} ${fg} flex items-center justify-center flex-shrink-0`}>
              {icon}
            </div>
            <div>
              <div className="text-xs text-slate-400 uppercase font-semibold tracking-wider">{label}</div>
              <div className="text-2xl font-extrabold text-slate-900">{value}</div>
            </div>
          </div>
        ))}
      </div>

      {/* ── SEARCH & FILTERS ── */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-4 mb-6 flex flex-col sm:flex-row gap-3">
        <div className="flex-1 flex items-center gap-3 bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5">
          <Search size={15} className="text-slate-400 flex-shrink-0" />
          <input
            type="text"
            placeholder="Search by service name or rate type..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="bg-transparent outline-none text-sm text-slate-700 placeholder-slate-400 w-full font-medium"
          />
          {search && (
            <button onClick={() => setSearch("")} className="text-slate-300 hover:text-slate-500 transition">
              <X size={14} />
            </button>
          )}
        </div>

        {/* Rate Type Filter */}
        <select
          value={rateTypeFilter}
          onChange={(e) => setRateTypeFilter(e.target.value)}
          className="border border-slate-200 rounded-xl px-4 py-2.5 text-sm font-semibold text-slate-700 bg-slate-50 outline-none focus:ring-2 focus:ring-indigo-200 capitalize"
        >
          <option value="">All Rate Types</option>
          {RATE_TYPE_OPTIONS.map((t) => (
            <option key={t} value={t} className="capitalize">{t}</option>
          ))}
        </select>

        {/* Status Filter */}
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="border border-slate-200 rounded-xl px-4 py-2.5 text-sm font-semibold text-slate-700 bg-slate-50 outline-none focus:ring-2 focus:ring-indigo-200 capitalize"
        >
          <option value="">All Statuses</option>
          {STATUS_OPTIONS.map((s) => (
            <option key={s} value={s} className="capitalize">{s}</option>
          ))}
        </select>
      </div>

      {/* ── LOADING ── */}
      {loading ? (
        <div className="flex items-center justify-center py-20">
          <div className="flex flex-col items-center gap-3">
            <div className="w-8 h-8 border-4 border-slate-200 border-t-slate-700 rounded-full animate-spin" />
            <p className="text-sm text-slate-400 font-medium">Loading rate configurations...</p>
          </div>
        </div>
      ) : configs.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm py-20 flex flex-col items-center gap-3">
          <div className="w-14 h-14 rounded-full bg-slate-100 flex items-center justify-center">
            <DollarSign size={24} className="text-slate-300" />
          </div>
          <p className="font-bold text-slate-500">No rate configurations found</p>
          <p className="text-sm text-slate-400">Try adjusting your search or add a new rate</p>
          <button
            onClick={openAdd}
            className="mt-2 flex items-center gap-2 bg-slate-900 hover:bg-slate-700 text-white px-5 py-2.5 rounded-xl font-bold text-sm transition"
          >
            <Plus size={15} /> Add New Rate
          </button>
        </div>
      ) : (
        /* ── RATE TABLES grouped by rateType ── */
        rateTypes.map((rateType) => (
          <div key={rateType} className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden mb-6">
            {/* Section Header */}
            <div className="flex justify-between items-center px-6 py-4 border-b border-slate-100 bg-slate-50/50">
              <h2 className="text-lg font-bold text-slate-900 capitalize">{rateType} Rates</h2>
              <span className="bg-white border border-slate-200 rounded-full px-3 py-1 text-xs font-semibold text-slate-600 shadow-sm">
                {grouped[rateType].length} config{grouped[rateType].length !== 1 ? "s" : ""}
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-slate-100">
                    {[
                      "SERVICE NAME", "BASE RATE", "CURRENCY", "WEIGHT RANGES",
                      "EFFECTIVE DATE", "EXPIRY DATE", "PRIORITY", "STATUS", "ACTIONS",
                    ].map((col) => (
                      <th
                        key={col}
                        className="px-5 py-3 text-left text-xs font-bold text-slate-400 tracking-wider whitespace-nowrap"
                      >
                        {col}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {grouped[rateType].map((r, i) => (
                    <tr
                      key={r._id}
                      className={`border-b border-slate-50 hover:bg-slate-50/60 transition ${i % 2 !== 0 ? "bg-slate-50/30" : ""}`}
                    >
                      <td className="px-5 py-4 font-bold text-slate-900 whitespace-nowrap">{r.serviceName}</td>
                      <td className="px-5 py-4 font-bold text-slate-900">{fmt(r.baseRate)}</td>
                      <td className="px-5 py-4 text-slate-500">{r.currency}</td>
                      <td className="px-5 py-4 text-slate-400 text-xs">
                        {r.weightRanges?.length > 0 ? (
                          <div className="space-y-0.5">
                            {r.weightRanges.slice(0, 3).map((wr, wi) => (
                              <div key={wi} className="whitespace-nowrap">
                                {wr.minWeight}–{wr.maxWeight} @ ${wr.ratePerUnit}/unit
                              </div>
                            ))}
                            {r.weightRanges.length > 3 && (
                              <div className="text-indigo-400">+{r.weightRanges.length - 3} more</div>
                            )}
                          </div>
                        ) : (
                          <span className="text-slate-300">—</span>
                        )}
                      </td>
                      <td className="px-5 py-4 text-slate-400 whitespace-nowrap">
                        {r.effectiveDate ? new Date(r.effectiveDate).toLocaleDateString("en-US") : "—"}
                      </td>
                      <td className="px-5 py-4 text-slate-400 whitespace-nowrap">
                        {r.expiryDate ? new Date(r.expiryDate).toLocaleDateString("en-US") : <span className="text-slate-300">No expiry</span>}
                      </td>
                      <td className="px-5 py-4 text-slate-500 text-center font-semibold">{r.priority ?? 1}</td>
                      <td className="px-5 py-4"><StatusBadge status={r.status} /></td>
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-1">
                          {/* Edit */}
                          <button
                            onClick={() => openEdit(r)}
                            title="Edit"
                            className="flex items-center gap-1 text-xs font-semibold text-slate-600 hover:text-slate-900 border border-slate-200 hover:border-slate-400 px-2.5 py-1.5 rounded-lg transition"
                          >
                            <Edit2 size={12} /> Edit
                          </button>
                          {/* Clone */}
                          <button
                            onClick={() => handleClone(r)}
                            title="Clone"
                            className="flex items-center gap-1 text-xs font-semibold text-indigo-500 hover:text-indigo-700 border border-indigo-100 hover:border-indigo-300 px-2.5 py-1.5 rounded-lg transition"
                          >
                            <Copy size={12} />
                          </button>
                          {/* Delete */}
                          <button
                            onClick={() => setConfirmDelete(r)}
                            title="Delete"
                            className="flex items-center gap-1 text-xs font-semibold text-red-400 hover:text-red-600 border border-red-100 hover:border-red-300 px-2.5 py-1.5 rounded-lg transition"
                          >
                            <Trash2 size={12} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ))
      )}

      {/* ── ADD / EDIT MODAL ── */}
      {showModal && (
        <Modal
          onClose={() => { setShowModal(false); setEditConfig(null); }}
          onSave={handleSave}
          editConfig={editConfig}
          saving={creating || updating}
        />
      )}

      {/* ── DELETE CONFIRM DIALOG ── */}
      {confirmDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm mx-4 p-6">
            <div className="w-12 h-12 rounded-full bg-red-50 flex items-center justify-center mb-4">
              <AlertTriangle size={22} className="text-red-500" />
            </div>
            <h3 className="text-lg font-extrabold text-slate-900 mb-1">Delete Rate Config?</h3>
            <p className="text-sm text-slate-500 mb-5">
              This will permanently delete <span className="font-bold text-slate-700">"{confirmDelete.serviceName}"</span>. This action cannot be undone.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setConfirmDelete(null)}
                className="flex-1 px-4 py-2.5 text-sm font-semibold text-slate-600 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDelete(confirmDelete)}
                className="flex-1 px-4 py-2.5 text-sm font-bold text-white bg-red-600 hover:bg-red-700 rounded-lg transition shadow-md"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}