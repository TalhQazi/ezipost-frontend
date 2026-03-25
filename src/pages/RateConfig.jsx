import { useState } from "react";
import { DollarSign, CheckCircle, Clock, Package, Edit } from "lucide-react";
import Table from "../components/table";

const initialRates = [
  { id: "rate-001", name: "Standard Letter", mailClass: "First Class", weightTier: "Up to 1 oz", baseRate: 0.68, effectiveDate: "2026-01-15", status: "Active" },
  { id: "rate-002", name: "Standard Letter", mailClass: "First Class", weightTier: "1-2 oz", baseRate: 0.92, effectiveDate: "2026-01-15", status: "Active" },
  { id: "rate-003", name: "Standard Letter", mailClass: "First Class", weightTier: "2-3 oz", baseRate: 1.16, effectiveDate: "2026-01-15", status: "Active" },
  { id: "rate-004", name: "Priority Mail", mailClass: "Priority", weightTier: "Up to 1 lb", baseRate: 9.65, effectiveDate: "2026-01-15", status: "Active" },
  { id: "rate-005", name: "Priority Mail", mailClass: "Priority", weightTier: "1-2 lbs", baseRate: 12.50, effectiveDate: "2026-01-15", status: "Active" },
  { id: "rate-006", name: "Priority Mail Express", mailClass: "Express", weightTier: "Up to 0.5 lb", baseRate: 29.75, effectiveDate: "2026-01-15", status: "Active" },
  { id: "rate-007", name: "Priority Mail Express", mailClass: "Express", weightTier: "0.5-1 lb", baseRate: 35.50, effectiveDate: "2026-01-15", status: "Active" },
  { id: "rate-008", name: "Media Mail", mailClass: "Media", weightTier: "Up to 1 lb", baseRate: 3.19, effectiveDate: "2026-01-15", status: "Active" },
  { id: "rate-009", name: "Media Mail", mailClass: "Media", weightTier: "1-2 lbs", baseRate: 4.07, effectiveDate: "2026-01-15", status: "Active" },
];

const MAIL_CLASS_OPTIONS = ["First Class", "Priority", "Express", "Media"];

function groupByMailClass(rates) {
  return rates.reduce((acc, rate) => {
    if (!acc[rate.mailClass]) acc[rate.mailClass] = [];
    acc[rate.mailClass].push(rate);
    return acc;
  }, {});
}

function Modal({ onClose, onAdd, editRate }) {
  const [form, setForm] = useState(
    editRate || { name: "", baseRate: "", mailClass: "First Class", weightTier: "", effectiveDate: "" }
  );
  const [errors, setErrors] = useState({});

  const validate = () => {
    const e = {};
    if (!form.name.trim()) e.name = "Rate name is required";
    if (!form.baseRate || isNaN(form.baseRate)) e.baseRate = "Valid base rate is required";
    if (!form.weightTier.trim()) e.weightTier = "Weight tier is required";
    if (!form.effectiveDate) e.effectiveDate = "Effective date is required";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = () => {
    if (!validate()) return;
    onAdd({ ...form, baseRate: parseFloat(form.baseRate) });
  };

  return (
    <div style={styles.overlay}>
      <div style={styles.modal}>
        <div style={styles.modalHeader}>
          <div>
            <h2 style={styles.modalTitle}>{editRate ? "Edit Rate" : "Add New Rate"}</h2>
            <p style={styles.modalSub}>
              {editRate ? "Update postage rate configuration" : "Create a new postage rate configuration"}
            </p>
          </div>
          <button onClick={onClose} style={styles.closeBtn}>✕</button>
        </div>

        <div style={styles.formGroup}>
          <label style={styles.label}>Rate Name</label>
          <input
            style={{ ...styles.input, ...(errors.name ? styles.inputError : {}) }}
            placeholder="e.g., Standard Letter"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
          />
          {errors.name && <span style={styles.errorText}>{errors.name}</span>}
        </div>

        <div style={styles.formRow}>
          <div style={{ flex: 1 }}>
            <label style={styles.label}>Base Rate ($)</label>
            <input
              style={{ ...styles.input, ...(errors.baseRate ? styles.inputError : {}) }}
              placeholder="0.68"
              type="number"
              step="0.01"
              value={form.baseRate}
              onChange={(e) => setForm({ ...form, baseRate: e.target.value })}
            />
            {errors.baseRate && <span style={styles.errorText}>{errors.baseRate}</span>}
          </div>
          <div style={{ flex: 1 }}>
            <label style={styles.label}>Mail Class</label>
            <select
              style={styles.input}
              value={form.mailClass}
              onChange={(e) => setForm({ ...form, mailClass: e.target.value })}
            >
              {MAIL_CLASS_OPTIONS.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>
        </div>

        <div style={styles.formGroup}>
          <label style={styles.label}>Weight Tier</label>
          <input
            style={{ ...styles.input, ...(errors.weightTier ? styles.inputError : {}) }}
            placeholder="Up to 1 oz"
            value={form.weightTier}
            onChange={(e) => setForm({ ...form, weightTier: e.target.value })}
          />
          {errors.weightTier && <span style={styles.errorText}>{errors.weightTier}</span>}
        </div>

        <div style={styles.formGroup}>
          <label style={styles.label}>Effective Date</label>
          <input
            style={{ ...styles.input, ...(errors.effectiveDate ? styles.inputError : {}) }}
            type="date"
            value={form.effectiveDate}
            onChange={(e) => setForm({ ...form, effectiveDate: e.target.value })}
          />
          {errors.effectiveDate && <span style={styles.errorText}>{errors.effectiveDate}</span>}
        </div>

        <button style={styles.submitBtn} onClick={handleSubmit}>
          {editRate ? "Update Rate" : "Add Rate"}
        </button>
      </div>
    </div>
  );
}


export default function RateConfig() {
  const [rates, setRates] = useState(initialRates);
  const [showModal, setShowModal] = useState(false);
  const [editRate, setEditRate] = useState(null);

  const grouped = groupByMailClass(rates);
  const mailClasses = Object.keys(grouped);

  const avgFirstClass =
    grouped["First Class"]
      ? (grouped["First Class"].reduce((s, r) => s + r.baseRate, 0) / grouped["First Class"].length).toFixed(2)
      : "0.00";

  const handleAdd = (form) => {
    if (editRate) {
      setRates((prev) => prev.map((r) => (r.id === editRate.id ? { ...r, ...form } : r)));
    } else {
      const newId = `rate-${String(rates.length + 1).padStart(3, "0")}`;
      setRates((prev) => [...prev, { ...form, id: newId, status: "Active" }]);
    }
    setShowModal(false);
    setEditRate(null);
  };

  const openEdit = (rate) => {
    setEditRate(rate);
    setShowModal(true);
  };

  return (
    <div className="min-h-screen bg-slate-50 p-8 font-sans">
      {/* Header */}
      <div className="flex justify-between items-start mb-8">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Rate Configuration</h1>
          <p className="text-sm text-slate-500 mt-1">Manage postage rates and calculation rules</p>
        </div>
        <button
          className="bg-slate-900 hover:bg-slate-700 text-white px-5 py-2.5 rounded-xl font-bold text-sm shadow-lg transition"
          onClick={() => { setEditRate(null); setShowModal(true); }}
        >
          + Add New Rate
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold text-lg">
            <DollarSign size={20} />
          </div>
          <div>
            <div className="text-xs text-slate-400 uppercase font-semibold tracking-wider">Active Rates</div>
            <div className="text-2xl font-extrabold text-slate-900">{rates.filter((r) => r.status === "Active").length}</div>
          </div>
        </div>
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
             <Package size={20} />
          </div>
          <div>
            <div className="text-xs text-slate-400 uppercase font-semibold tracking-wider">Mail Classes</div>
            <div className="text-2xl font-extrabold text-slate-900">{mailClasses.length}</div>
          </div>
        </div>
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
            <CheckCircle size={20} />
          </div>
          <div>
            <div className="text-xs text-slate-400 uppercase font-semibold tracking-wider">Avg. First Class</div>
            <div className="text-2xl font-extrabold text-slate-900">${avgFirstClass}</div>
          </div>
        </div>
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-slate-50 text-slate-600 flex items-center justify-center">
            <Clock size={20} />
          </div>
          <div>
            <div className="text-xs text-slate-400 uppercase font-semibold tracking-wider">Last Updated</div>
            <div className="text-2xl font-extrabold text-slate-900">3/21/2026</div>
          </div>
        </div>
      </div>

      {/* Rate Tables by Mail Class */}
      {mailClasses.map((mailClass) => (
        <div key={mailClass} className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden mb-6">
          <div className="flex justify-between items-center px-6 py-4 border-b border-slate-100 bg-slate-50/50">
            <h2 className="text-lg font-bold text-slate-900">{mailClass} Mail</h2>
            <span className="bg-white border border-slate-200 rounded-full px-3 py-1 text-xs font-semibold text-slate-600 shadow-sm">
              {grouped[mailClass].length} rates
            </span>
          </div>

          <div className="p-4">
            <Table
              data={grouped[mailClass]}
              onEdit={openEdit}
              columns={[
                {
                  key: "id",
                  label: "RATE ID",
                  render: (r) => <span className="font-bold text-slate-900">{r.id}</span>,
                },
                {
                  key: "name",
                  label: "NAME",
                },
                {
                  key: "weightTier",
                  label: "WEIGHT TIER",
                  render: (r) => <span className="text-slate-400">{r.weightTier}</span>,
                },
                {
                  key: "baseRate",
                  label: "BASE RATE",
                  render: (r) => <span className="font-bold text-slate-900">${r.baseRate.toFixed(2)}</span>,
                },
                {
                  key: "effectiveDate",
                  label: "EFFECTIVE DATE",
                  render: (r) => <span className="text-slate-400">{r.effectiveDate}</span>,
                },
                {
                  key: "status",
                  label: "STATUS",
                  render: (r) => (
                    <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                      r.status === "Active" ? "bg-slate-900 text-white" : "bg-slate-100 text-slate-500"
                    }`}>
                      {r.status}
                    </span>
                  ),
                },
              ]}
            />
          </div>
        </div>
      ))}

      {/* Modal */}
      {showModal && (
        <Modal
          onClose={() => { setShowModal(false); setEditRate(null); }}
          onAdd={handleAdd}
          editRate={editRate}
        />
      )}
    </div>
  );
}