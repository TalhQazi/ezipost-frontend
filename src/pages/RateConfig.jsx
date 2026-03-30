import { useState, useEffect, useMemo } from "react";
import {
  DollarSign, CheckCircle, Clock, Package,
  Edit2, X, Plus, Trash2, RefreshCw, Search,
  AlertTriangle, Copy,
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

const RATE_TYPE_OPTIONS  = ["domestic", "international", "express", "standard", "bulk"];
const STATUS_OPTIONS     = ["active", "inactive", "draft", "expired"];
const CURRENCY_OPTIONS   = ["USD", "EUR", "GBP", "CAD", "AUD"];

const MAIL_CLASS_OPTIONS = [
  "First Class",
  "Priority Mail",
  "Priority Mail Express",
  "USPS Ground Advantage",
  "Media Mail",
  "Bound Printed Matter",
  "Library Mail",
  "Parcel Select",
];

const WEIGHT_TIER_OPTIONS = [
  "Up to 1 oz",
  "Up to 2 oz",
  "Up to 3 oz",
  "Up to 3.5 oz",
  "Up to 4 oz",
  "Up to 8 oz",
  "Up to 13 oz",
  "Up to 1 lb",
  "Up to 2 lbs",
  "Up to 5 lbs",
  "Up to 10 lbs",
  "Over 10 lbs",
];

const EMPTY_FORM = {
  serviceName:   "",
  baseRate:      "",
  mailClass:     "",
  weightTier:    "",
  effectiveDate: "",
  expiryDate:    "",
  rateType:      "domestic",
  currency:      "USD",
  status:        "active",
  priority:      1,
  createdBy:     "admin",
  weightRanges:  [{ minWeight: 0, maxWeight: 1, ratePerUnit: 0 }],
  zoneRates:     [],
  additionalCharges: [],
  discounts:     [],
  restrictions:  [],
};

// ─── HELPERS ──────────────────────────────────────────────────────────────────

const fmt = (n) =>
  Number(n || 0).toLocaleString("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
  });

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

// ─── MODAL ────────────────────────────────────────────────────────────────────

function Modal({ onClose, onSave, editConfig, saving }) {
  const [form, setForm]     = useState(
    editConfig
      ? {
          ...EMPTY_FORM,
          ...editConfig,
          baseRate:      String(editConfig.baseRate ?? ""),
          mailClass:     editConfig.mailClass  || "",
          weightTier:    editConfig.weightTier || "",
          effectiveDate: editConfig.effectiveDate
            ? new Date(editConfig.effectiveDate).toISOString().split("T")[0]
            : "",
          expiryDate: editConfig.expiryDate
            ? new Date(editConfig.expiryDate).toISOString().split("T")[0]
            : "",
        }
      : { ...EMPTY_FORM }
  );
  const [errors, setErrors] = useState({});
  const [success, setSuccess] = useState(false);

  const set = (key, val) => {
    setForm((f) => ({ ...f, [key]: val }));
    setErrors((e) => ({ ...e, [key]: undefined }));
  };

  const validate = () => {
    const e = {};
    if (!form.serviceName.trim())  e.serviceName  = "Rate name is required";
    if (!form.baseRate || isNaN(Number(form.baseRate)) || Number(form.baseRate) < 0)
      e.baseRate = "Valid base rate is required";
    if (!form.effectiveDate)       e.effectiveDate = "Effective date is required";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) return;
    const result = await onSave({
      ...form,
      baseRate: parseFloat(form.baseRate),
      priority: parseInt(form.priority) || 1,
    });
    if (result !== false) {
      setSuccess(true);
    }
  };

  const inputCls = (field) =>
    `w-full rounded-xl px-4 py-3 text-sm text-slate-800 bg-slate-50 outline-none transition
     focus:ring-2 placeholder-slate-400
     ${errors[field]
       ? "border border-red-400 focus:ring-red-200"
       : "border border-slate-200 focus:ring-slate-900/20 focus:border-slate-400"}`;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden">

        {success ? (
          /* ── SUCCESS STATE ── */
          <div className="flex flex-col items-center justify-center px-8 py-14 text-center">
            <div className="relative mb-6">
              <div className="w-20 h-20 rounded-full bg-emerald-50 flex items-center justify-center">
                <div className="w-16 h-16 rounded-full bg-emerald-100 flex items-center justify-center">
                  <CheckCircle size={40} className="text-emerald-500" strokeWidth={1.8} />
                </div>
              </div>
              <span className="absolute inset-0 rounded-full bg-emerald-200 opacity-30 animate-ping" />
            </div>
            <h2 className="text-2xl font-extrabold text-slate-900 mb-2">
              {editConfig ? "Rate Updated!" : "Rate Added!"}
            </h2>
            <p className="text-slate-500 text-sm leading-relaxed mb-1">
              <span className="font-bold text-slate-800">{form.serviceName}</span>{" "}
              has been successfully {editConfig ? "updated" : "created"}.
            </p>
            {form.baseRate && (
              <p className="text-sm font-bold text-slate-700 bg-slate-100 rounded-xl px-4 py-2 mt-2 font-mono tracking-wide">
                Base Rate: {fmt(parseFloat(form.baseRate))}
              </p>
            )}
            <div className="w-full h-px bg-slate-100 my-6" />
            <button
              onClick={onClose}
              className="w-full py-3 bg-slate-900 hover:bg-slate-700 text-white rounded-xl text-sm font-bold transition"
            >
              Done
            </button>
          </div>
        ) : (
          <>
            {/* ── HEADER ── */}
            <div className="flex items-start justify-between px-7 pt-7 pb-5">
              <div>
                <h2 className="text-xl font-extrabold text-slate-900 leading-tight">
                  {editConfig ? "Edit Rate" : "Add New Rate"}
                </h2>
                <p className="text-slate-400 text-sm mt-0.5">
                  {editConfig
                    ? "Update postage rate configuration"
                    : "Create a new postage rate configuration"}
                </p>
              </div>
              <button
                onClick={onClose}
                className="w-8 h-8 flex items-center justify-center rounded-full bg-slate-100 hover:bg-slate-200 transition flex-shrink-0"
              >
                <X size={15} className="text-slate-500" />
              </button>
            </div>

            {/* ── DIVIDER ── */}
            <div className="h-px bg-slate-100 mx-7" />

            {/* ── FORM BODY ── */}
            <div className="px-7 py-6 space-y-5 max-h-[62vh] overflow-y-auto">

              {/* Rate Name */}
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">
                  Rate Name
                </label>
                <input
                  className={inputCls("serviceName")}
                  placeholder="e.g., Standard Letter"
                  value={form.serviceName}
                  onChange={(e) => set("serviceName", e.target.value)}
                />
                {errors.serviceName && (
                  <p className="text-xs text-red-500 mt-1.5">{errors.serviceName}</p>
                )}
              </div>

              {/* Base Rate + Mail Class */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2">
                    Base Rate ($)
                  </label>
                  <div className="relative">
                    <input
                      className={inputCls("baseRate")}
                      placeholder="0.68"
                      type="number"
                      min="0"
                      step="0.01"
                      value={form.baseRate}
                      onChange={(e) => set("baseRate", e.target.value)}
                    />
                  </div>
                  {errors.baseRate && (
                    <p className="text-xs text-red-500 mt-1.5">{errors.baseRate}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2">
                    Mail Class
                  </label>
                  <input
                    className={inputCls("mailClass")}
                    placeholder="First Class"
                    list="mail-class-list"
                    value={form.mailClass}
                    onChange={(e) => set("mailClass", e.target.value)}
                  />
                  <datalist id="mail-class-list">
                    {MAIL_CLASS_OPTIONS.map((m) => (
                      <option key={m} value={m} />
                    ))}
                  </datalist>
                </div>
              </div>

              {/* Weight Tier */}
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">
                  Weight Tier
                </label>
                <input
                  className={inputCls("weightTier")}
                  placeholder="Up to 1 oz"
                  list="weight-tier-list"
                  value={form.weightTier}
                  onChange={(e) => set("weightTier", e.target.value)}
                />
                <datalist id="weight-tier-list">
                  {WEIGHT_TIER_OPTIONS.map((w) => (
                    <option key={w} value={w} />
                  ))}
                </datalist>
              </div>

              {/* Effective Date */}
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">
                  Effective Date
                </label>
                <input
                  className={inputCls("effectiveDate")}
                  type="date"
                  value={form.effectiveDate}
                  onChange={(e) => set("effectiveDate", e.target.value)}
                />
                {errors.effectiveDate && (
                  <p className="text-xs text-red-500 mt-1.5">{errors.effectiveDate}</p>
                )}
              </div>

              {/* Extra fields only in edit mode */}
              {editConfig && (
                <>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-bold text-slate-700 mb-2">
                        Expiry Date
                      </label>
                      <input
                        className={inputCls("expiryDate")}
                        type="date"
                        value={form.expiryDate}
                        onChange={(e) => set("expiryDate", e.target.value)}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-slate-700 mb-2">
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
                  </div>

                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-2">
                      Config ID
                    </label>
                    <input
                      className="w-full border border-slate-100 rounded-xl px-4 py-3 text-sm text-slate-400 bg-slate-50 cursor-not-allowed font-mono"
                      value={editConfig._id}
                      readOnly
                    />
                  </div>
                </>
              )}
            </div>

            {/* ── FOOTER BUTTON ── */}
            <div className="px-7 pb-7 pt-2">
              <button
                onClick={handleSubmit}
                disabled={saving}
                className="w-full py-3.5 bg-slate-900 hover:bg-slate-700 disabled:bg-slate-300
                  disabled:cursor-not-allowed text-white rounded-xl font-extrabold text-sm
                  transition flex items-center justify-center gap-2"
              >
                {saving ? (
                  <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  editConfig ? "Update Rate" : "Add Rate"
                )}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

// ─── MAIN PAGE ────────────────────────────────────────────────────────────────

export default function RateConfig() {
  const [showModal, setShowModal]         = useState(false);
  const [editConfig, setEditConfig]       = useState(null);
  const [search, setSearch]               = useState("");
  const [rateTypeFilter, setRateTypeFilter] = useState("");
  const [statusFilter, setStatusFilter]   = useState("");
  const [confirmDelete, setConfirmDelete] = useState(null);

  const dispatch = useDispatch();
  const {
    configs  = [],
    stats    = {},
    loading,
    creating,
    updating,
  } = useSelector((state) => state.rateConfig);

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

  const handleSave = async (form) => {
    let result;
    if (editConfig) {
      result = await dispatch(updateRateConfig({ id: editConfig._id, configData: form }));
      if (updateRateConfig.fulfilled.match(result)) {
        dispatch(fetchRateConfigStats());
        return true;
      }
      return false;
    } else {
      result = await dispatch(createRateConfig(form));
      if (createRateConfig.fulfilled.match(result)) {
        dispatch(fetchRateConfigStats());
        return true;
      }
      return false;
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

  const grouped   = useMemo(() => groupByRateType(configs), [configs]);
  const rateTypes = Object.keys(grouped);

  const statCards = [
    {
      icon: <DollarSign size={20} />,
      bg: "bg-indigo-50", fg: "text-indigo-600",
      label: "Active Configs",
      value: stats.activeConfigs ?? configs.filter((c) => c.status === "active").length,
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
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">
            Rate Configuration
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Manage postage rates and calculation rules
          </p>
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
          <div
            key={label}
            className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-4"
          >
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
        <select
          value={rateTypeFilter}
          onChange={(e) => setRateTypeFilter(e.target.value)}
          className="border border-slate-200 rounded-xl px-4 py-2.5 text-sm font-semibold text-slate-700 bg-slate-50 outline-none focus:ring-2 focus:ring-indigo-200"
        >
          <option value="">All Rate Types</option>
          {RATE_TYPE_OPTIONS.map((t) => (
            <option key={t} value={t} className="capitalize">{t}</option>
          ))}
        </select>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="border border-slate-200 rounded-xl px-4 py-2.5 text-sm font-semibold text-slate-700 bg-slate-50 outline-none focus:ring-2 focus:ring-indigo-200"
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
        rateTypes.map((rateType) => (
          <div key={rateType} className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden mb-6">
            <div className="flex justify-between items-center px-6 py-4 border-b border-slate-100 bg-slate-50/50">
              <h2 className="text-lg font-bold text-slate-900 capitalize">{rateType} Rates</h2>
              <span className="bg-white border border-slate-200 rounded-full px-3 py-1 text-xs font-semibold text-slate-600 shadow-sm">
                {grouped[rateType].length} config{grouped[rateType].length !== 1 ? "s" : ""}
              </span>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-black text-white">
                  <tr className="border-b border-slate-800">
                    {[
                      "SERVICE NAME", "BASE RATE", "CURRENCY", "WEIGHT RANGES",
                      "EFFECTIVE DATE", "EXPIRY DATE", "PRIORITY", "STATUS", "ACTIONS",
                    ].map((col) => (
                      <th
                        key={col}
                        className="px-5 py-3.5 text-left text-[11px] font-bold uppercase tracking-widest whitespace-nowrap"
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
                        {r.expiryDate
                          ? new Date(r.expiryDate).toLocaleDateString("en-US")
                          : <span className="text-slate-300">No expiry</span>}
                      </td>
                      <td className="px-5 py-4 text-slate-500 text-center font-semibold">{r.priority ?? 1}</td>
                      <td className="px-5 py-4"><StatusBadge status={r.status} /></td>
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => openEdit(r)}
                            className="flex items-center gap-1 text-xs font-semibold text-slate-600 hover:text-slate-900 border border-slate-200 hover:border-slate-400 px-2.5 py-1.5 rounded-lg transition"
                          >
                            <Edit2 size={12} /> Edit
                          </button>
                          <button
                            onClick={() => handleClone(r)}
                            className="flex items-center gap-1 text-xs font-semibold text-indigo-500 hover:text-indigo-700 border border-indigo-100 hover:border-indigo-300 px-2.5 py-1.5 rounded-lg transition"
                          >
                            <Copy size={12} />
                          </button>
                          <button
                            onClick={() => setConfirmDelete(r)}
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

      {/* ── DELETE CONFIRM ── */}
      {confirmDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm mx-4 p-6">
            <div className="w-12 h-12 rounded-full bg-red-50 flex items-center justify-center mb-4">
              <AlertTriangle size={22} className="text-red-500" />
            </div>
            <h3 className="text-lg font-extrabold text-slate-900 mb-1">Delete Rate Config?</h3>
            <p className="text-sm text-slate-500 mb-5">
              This will permanently delete{" "}
              <span className="font-bold text-slate-700">"{confirmDelete.serviceName}"</span>.
              This action cannot be undone.
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