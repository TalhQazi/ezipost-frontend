import { useState } from "react";

// ── Icons ─────────────────────────────────────────────────────────────────────
const Icon = ({ d, size = 18, color = "currentColor" }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
    <path d={d} />
  </svg>
);
const icons = {
  settings: "M12 15a3 3 0 100-6 3 3 0 000 6z M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-4 0v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83-2.83l.06-.06A1.65 1.65 0 004.68 15a1.65 1.65 0 00-1.51-1H3a2 2 0 010-4h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 012.83-2.83l.06.06A1.65 1.65 0 009 4.68a1.65 1.65 0 001-1.51V3a2 2 0 014 0v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 2.83l-.06.06A1.65 1.65 0 0019.4 9a1.65 1.65 0 001.51 1H21a2 2 0 010 4h-.09a1.65 1.65 0 00-1.51 1z",
  shield:   "M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z",
  bell:     "M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9 M13.73 21a2 2 0 01-3.46 0",
  database: "M12 2C6.48 2 2 4.24 2 7v10c0 2.76 4.48 5 10 5s10-2.24 10-5V7c0-2.76-4.48-5-10-5z M2 7c0 2.76 4.48 5 10 5s10-2.24 10-5 M2 12c0 2.76 4.48 5 10 5s10-2.24 10-5",
  key:      "M21 2l-2 2m-7.61 7.61a5.5 5.5 0 11-7.778 7.778 5.5 5.5 0 017.777-7.777zm0 0L15.5 7.5m0 0l3 3L22 7l-3-3m-3.5 3.5L19 4",
  users:    "M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2 M23 21v-2a4 4 0 00-3-3.87 M16 3.13a4 4 0 010 7.75 M9 7a4 4 0 100 8 4 4 0 000-8z",
  save:     "M19 21H5a2 2 0 01-2-2V5a2 2 0 012-2h11l5 5v11a2 2 0 01-2 2z M17 21v-8H7v8 M7 3v5h8",
  plus:     "M12 5v14M5 12h14",
  edit:     "M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7 M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z",
};

// ── Toggle Switch ─────────────────────────────────────────────────────────────
const Toggle = ({ checked, onChange }) => (
  <button
    onClick={() => onChange(!checked)}
    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-200 focus:outline-none flex-shrink-0
      ${checked ? "bg-gray-900" : "bg-gray-300"}`}
  >
    <span
      className={`inline-block h-4 w-4 transform rounded-full bg-white shadow-sm transition-transform duration-200
        ${checked ? "translate-x-6" : "translate-x-1"}`}
    />
  </button>
);

// ── Read-only Input ───────────────────────────────────────────────────────────
const ReadInput = ({ value, mono = false }) => (
  <div className={`w-full bg-gray-100 rounded-xl px-4 py-3 text-sm text-gray-600 ${mono ? "font-mono" : ""}`}>
    {value}
  </div>
);

// ── Password Input with Regenerate ────────────────────────────────────────────
const ApiKeyInput = ({ label }) => {
  const [val, setVal] = useState("●".repeat(32));
  return (
    <div>
      <label className="block text-sm font-bold text-gray-800 mb-2">{label}</label>
      <div className="flex gap-2">
        <div className="flex-1 bg-gray-100 rounded-xl px-4 py-3 text-sm text-gray-500 font-mono tracking-widest truncate">
          {val}
        </div>
        <button
          onClick={() => setVal("●".repeat(28 + Math.floor(Math.random() * 8)))}
          className="flex-shrink-0 border border-gray-200 bg-white hover:bg-gray-50 text-gray-700 font-medium text-sm px-4 py-2 rounded-xl transition-colors"
        >
          Regenerate
        </button>
      </div>
    </div>
  );
};

// ── Section Card ──────────────────────────────────────────────────────────────
const SectionCard = ({ children }) => (
  <div className="bg-white rounded-2xl border border-gray-200 p-6 space-y-6">
    {children}
  </div>
);

// ── Section Header ────────────────────────────────────────────────────────────
const SectionHeader = ({ iconBg, iconColor, iconPath, title, subtitle, action }) => (
  <div className="flex items-start justify-between gap-4">
    <div className="flex items-center gap-4">
      <div className={`w-11 h-11 rounded-2xl ${iconBg} flex items-center justify-center flex-shrink-0`}>
        <Icon d={iconPath} size={20} color={iconColor} />
      </div>
      <div>
        <h2 className="text-lg font-bold text-gray-900">{title}</h2>
        <p className="text-sm text-gray-500 mt-0.5">{subtitle}</p>
      </div>
    </div>
    {action}
  </div>
);

// ── Divider ───────────────────────────────────────────────────────────────────
const Divider = () => <hr className="border-gray-100" />;

// ── Toggle Row ────────────────────────────────────────────────────────────────
const ToggleRow = ({ label, description, checked, onChange }) => (
  <div className="flex items-center justify-between gap-4">
    <div>
      <p className="text-sm font-bold text-gray-800">{label}</p>
      <p className="text-xs text-gray-500 mt-0.5">{description}</p>
    </div>
    <Toggle checked={checked} onChange={onChange} />
  </div>
);

// ── User Row ──────────────────────────────────────────────────────────────────
const UserRow = ({ name, email, role }) => (
  <div className="flex items-center justify-between border border-gray-100 rounded-xl px-4 py-3">
    <div>
      <p className="text-sm font-bold text-gray-800">{name}</p>
      <p className="text-xs text-gray-500 mt-0.5">{email}</p>
    </div>
    <div className="flex items-center gap-4">
      <span className="text-sm text-gray-400">{role}</span>
      <button className="text-sm font-bold text-gray-800 hover:text-blue-600 transition-colors">Edit</button>
    </div>
  </div>
);

// ── Main ──────────────────────────────────────────────────────────────────────
export default function SettingsPage() {
  // General
  const [autoProcess, setAutoProcess]   = useState(true);
  const [realtime, setRealtime]         = useState(true);
  const [graceful, setGraceful]         = useState(true);

  // Security
  const [twoFA, setTwoFA]               = useState(true);
  const [rbac, setRbac]                 = useState(true);
  const [intrusion, setIntrusion]       = useState(false);
  const [keyRotation, setKeyRotation]   = useState(true);

  // Notifications
  const [lowBalance, setLowBalance]     = useState(true);
  const [failedTx, setFailedTx]         = useState(true);
  const [downtime, setDowntime]         = useState(true);
  const [dailySummary, setDailySummary] = useState(false);

  // Integrations
  const [webhooks, setWebhooks]         = useState(true);

  const [saved, setSaved] = useState(false);
  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div className="min-h-full bg-gray-50 px-4 sm:px-6 py-6 space-y-5" style={{ fontFamily: "'DM Sans','Segoe UI',sans-serif" }}>

      {/* Page Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">System Settings</h1>
        <p className="text-sm text-gray-500 mt-1">Configure EzPost® system parameters and preferences</p>
      </div>

      {/* ── General Settings ── */}
      <SectionCard>
        <SectionHeader
          iconBg="bg-blue-50" iconColor="#2563eb"
          iconPath={icons.settings}
          title="General Settings"
          subtitle="Basic system configuration options"
        />

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-bold text-gray-800 mb-2">System Name</label>
            <ReadInput value="EzPost® Enterprise" />
          </div>
          <div>
            <label className="block text-sm font-bold text-gray-800 mb-2">Deployment Region</label>
            <ReadInput value="US-East-1" />
          </div>
        </div>

        <div>
          <label className="block text-sm font-bold text-gray-800 mb-2">API Endpoint</label>
          <ReadInput value="https://api.ezpost.com/v1" mono />
        </div>

        <Divider />

        <div className="space-y-5">
          <ToggleRow label="Auto-Process Mail"       description="Automatically process incoming mail pieces"       checked={autoProcess}  onChange={setAutoProcess}  />
          <ToggleRow label="Real-time Processing"    description="Enable real-time transaction processing"         checked={realtime}     onChange={setRealtime}     />
          <ToggleRow label="Graceful Degradation"    description="Enable graceful degradation under high load"     checked={graceful}     onChange={setGraceful}     />
        </div>
      </SectionCard>

      {/* ── Security ── */}
      <SectionCard>
        <SectionHeader
          iconBg="bg-red-50" iconColor="#ef4444"
          iconPath={icons.shield}
          title="Security"
          subtitle="Security and encryption settings"
        />

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-bold text-gray-800 mb-2">Encryption Protocol</label>
            <ReadInput value="TLS 1.3" />
          </div>
          <div>
            <label className="block text-sm font-bold text-gray-800 mb-2">Encryption Algorithm</label>
            <ReadInput value="AES-256" />
          </div>
        </div>

        <Divider />

        <div className="space-y-5">
          <ToggleRow label="Two-Factor Authentication" description="Require 2FA for all administrative actions" checked={twoFA}       onChange={setTwoFA}       />
          <ToggleRow label="Role-Based Access Control" description="Enable RBAC policies"                       checked={rbac}        onChange={setRbac}        />
          <ToggleRow label="Intrusion Detection"       description="Monitor for security threats"               checked={intrusion}   onChange={setIntrusion}   />
          <ToggleRow label="Automatic Key Rotation"    description="Rotate keys every 90 days"                  checked={keyRotation} onChange={setKeyRotation} />
        </div>
      </SectionCard>

      {/* ── Notifications ── */}
      <SectionCard>
        <SectionHeader
          iconBg="bg-amber-50" iconColor="#f59e0b"
          iconPath={icons.bell}
          title="Notifications"
          subtitle="Configure alert and notification preferences"
        />

        <div className="space-y-5">
          <ToggleRow label="Low Balance Alerts"      description="Alert when escrow balance falls below threshold" checked={lowBalance}   onChange={setLowBalance}   />
          <ToggleRow label="Failed Transaction Alerts" description="Notify on transaction failures"               checked={failedTx}     onChange={setFailedTx}     />
          <ToggleRow label="System Downtime Alerts"  description="Alert on service interruptions"                 checked={downtime}     onChange={setDowntime}     />
          <ToggleRow label="Daily Summary Reports"   description="Receive daily processing summaries"             checked={dailySummary} onChange={setDailySummary} />
        </div>

        <Divider />

        <div>
          <label className="block text-sm font-bold text-gray-800 mb-2">Alert Email Recipients</label>
          <ReadInput value="admin@example.com, ops@example.com" />
        </div>
      </SectionCard>

      {/* ── Integrations ── */}
      <SectionCard>
        <SectionHeader
          iconBg="bg-emerald-50" iconColor="#10b981"
          iconPath={icons.database}
          title="Integrations"
          subtitle="External system integration settings"
        />

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-bold text-gray-800 mb-2">Mail Scanning System Endpoint</label>
            <ReadInput value="https://scanning.usps.gov/api" mono />
          </div>
          <div>
            <label className="block text-sm font-bold text-gray-800 mb-2">Rate Table API</label>
            <ReadInput value="https://rates.usps.gov/api/v2" mono />
          </div>
          <div>
            <label className="block text-sm font-bold text-gray-800 mb-2">Payment Gateway</label>
            <ReadInput value="https://payment.processor.com" mono />
          </div>
        </div>

        <Divider />

        <ToggleRow
          label="Enable Webhooks"
          description="Send event notifications to external systems"
          checked={webhooks}
          onChange={setWebhooks}
        />
      </SectionCard>

      {/* ── API Keys ── */}
      <SectionCard>
        <SectionHeader
          iconBg="bg-violet-50" iconColor="#8b5cf6"
          iconPath={icons.key}
          title="API Keys"
          subtitle="Manage API authentication keys"
        />

        <div className="space-y-4">
          <ApiKeyInput label="Production API Key" />
          <ApiKeyInput label="Test API Key" />
        </div>
      </SectionCard>

      {/* ── User Management ── */}
      <SectionCard>
        <SectionHeader
          iconBg="bg-indigo-50" iconColor="#6366f1"
          iconPath={icons.users}
          title="User Management"
          subtitle="Manage system users and roles"
          action={
            <button className="flex-shrink-0 border border-gray-200 bg-white hover:bg-gray-50 text-gray-800 font-semibold text-sm px-4 py-2 rounded-xl transition-colors">
              Add User
            </button>
          }
        />

        <div className="space-y-2">
          <UserRow name="Admin User"      email="admin@ezpost.com"     role="Administrator" />
          <UserRow name="System Operator" email="operator@ezpost.com"  role="Operator"      />
          <UserRow name="Analytics User"  email="analytics@ezpost.com" role="Analyst"       />
        </div>
      </SectionCard>

      {/* ── Save Button ── */}
      <div className="flex justify-end pb-4">
        <button
          onClick={handleSave}
          className={`flex items-center gap-2 text-sm font-bold px-6 py-3 rounded-2xl shadow-sm transition-all duration-200
            ${saved
              ? "bg-emerald-600 text-white scale-95"
              : "bg-gray-900 hover:bg-gray-800 text-white"}`}
        >
          <Icon d={icons.save} size={16} color="white" />
          {saved ? "Saved!" : "Save All Settings"}
        </button>
      </div>

    </div>
  );
}