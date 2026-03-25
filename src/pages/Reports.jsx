import { useState } from "react";
import {
  AreaChart, Area, BarChart, Bar, LineChart, Line,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
} from "recharts";

// ── Icons ─────────────────────────────────────────────────────────────────────
const Icon = ({ d, size = 18, color = "currentColor" }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
    <path d={d} />
  </svg>
);
const icons = {
  mail:      "M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z M22 6l-10 7L2 6",
  dollar:    "M12 1v22M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6",
  wallet:    "M20 12V8H4a2 2 0 01-2-2V6a2 2 0 012-2h16v4M20 12a2 2 0 000 4M20 12h2v8h-2a2 2 0 010-4",
  chart:     "M18 20V10M12 20V4M6 20v-6",
  dashboard: "M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z M9 22V12h6v10",
  inbox:     "M22 12h-6l-2 3h-4l-2-3H2M5.45 5.11L2 12v6a2 2 0 002 2h16a2 2 0 002-2v-6l-3.45-6.89A2 2 0 0016.76 4H7.24a2 2 0 00-1.79 1.11z",
  escrow:    "M21 16V8a2 2 0 00-1-1.73l-7-4a2 2 0 00-2 0l-7 4A2 2 0 003 8v8a2 2 0 001 1.73l7 4a2 2 0 002 0l7-4A2 2 0 0021 16z",
  tx:        "M4 6h16M4 10h16M4 14h8M4 18h8",
  audit:     "M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z M14 2v6h6",
  rate:      "M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z",
  reports:   "M18 20V10M12 20V4M6 20v-6",
  settings:  "M12 15a3 3 0 100-6 3 3 0 000 6z M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-2 2 2 2 0 01-2-2v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83-2.83l.06-.06A1.65 1.65 0 004.68 15a1.65 1.65 0 00-1.51-1H3a2 2 0 01-2-2 2 2 0 012-2h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 012.83-2.83l.06.06A1.65 1.65 0 009 4.68a1.65 1.65 0 001-1.51V3a2 2 0 012-2 2 2 0 012 2v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 2.83l-.06.06A1.65 1.65 0 0019.4 9a1.65 1.65 0 001.51 1H21a2 2 0 012 2 2 2 0 01-2 2h-.09a1.65 1.65 0 00-1.51 1z",
  download:  "M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4 M7 10l5 5 5-5 M12 15V3",
  calendar:  "M3 9h18M8 2v4M16 2v4M3 6a2 2 0 012-2h14a2 2 0 012 2v14a2 2 0 01-2 2H5a2 2 0 01-2-2V6z",
};

// ── Data ──────────────────────────────────────────────────────────────────────
const mailVolumeData = [
  { month: "Jan", totalMail: 42000, escrowUsed: 13000 },
  { month: "Feb", totalMail: 47000, escrowUsed: 15000 },
  { month: "Mar", totalMail: 49000, escrowUsed: 15500 },
  { month: "Apr", totalMail: 52000, escrowUsed: 16000 },
  { month: "May", totalMail: 58000, escrowUsed: 18000 },
  { month: "Jun", totalMail: 68000, escrowUsed: 20000 },
];
const revenueData = [
  { month: "Jan", totalRevenue: 41000, escrowRevenue: 13000 },
  { month: "Feb", totalRevenue: 46000, escrowRevenue: 14500 },
  { month: "Mar", totalRevenue: 49500, escrowRevenue: 15500 },
  { month: "Apr", totalRevenue: 53000, escrowRevenue: 16500 },
  { month: "May", totalRevenue: 61000, escrowRevenue: 19000 },
  { month: "Jun", totalRevenue: 67000, escrowRevenue: 21000 },
];
const weeklyMailData = [
  { day: "Mon", Standard: 2800, Priority: 1200, Express: 600,  International: 400 },
  { day: "Tue", Standard: 2600, Priority: 1100, Express: 500,  International: 370 },
  { day: "Wed", Standard: 4200, Priority: 2800, Express: 1300, International: 850 },
  { day: "Thu", Standard: 2100, Priority: 1000, Express: 480,  International: 350 },
  { day: "Fri", Standard: 2900, Priority: 1300, Express: 650,  International: 450 },
  { day: "Sat", Standard: 1800, Priority: 700,  Express: 300,  International: 200 },
  { day: "Sun", Standard: 1600, Priority: 650,  Express: 280,  International: 180 },
];
const performanceData = [
  { day: "Mon", processingSpeed: 95.2, accuracy: 94.8, escrowSuccess: 95.5 },
  { day: "Tue", processingSpeed: 94.1, accuracy: 94.1, escrowSuccess: 94.3 },
  { day: "Wed", processingSpeed: 96.2, accuracy: 96.0, escrowSuccess: 96.4 },
  { day: "Thu", processingSpeed: 97.1, accuracy: 97.3, escrowSuccess: 96.9 },
  { day: "Fri", processingSpeed: 93.3, accuracy: 93.1, escrowSuccess: 93.6 },
  { day: "Sat", processingSpeed: 97.8, accuracy: 97.5, escrowSuccess: 98.0 },
  { day: "Sun", processingSpeed: 99.2, accuracy: 99.0, escrowSuccess: 99.3 },
];
const topCustomers = [
  { name: "Enterprise Customer 001", items: "15,420 items", revenue: "$15,420" },
  { name: "Enterprise Customer 005", items: "12,830 items", revenue: "$12,830" },
  { name: "Enterprise Customer 012", items: "11,240 items", revenue: "$11,240" },
  { name: "Enterprise Customer 008", items: "9,650 items",  revenue: "$9,650"  },
];
const serviceLevels = [
  { name: "Postage Evaluation", metric: "Uptime", value: "99.98%", status: "excellent" },
  { name: "Escrow Service",     metric: "Uptime", value: "99.95%", status: "excellent" },
  { name: "Transaction Auth",   metric: "Uptime", value: "99.99%", status: "excellent" },
  { name: "Notification",       metric: "Uptime", value: "98.20%", status: "good"      },
];
const costSavings = [
  { label: "Labor Reduction",       value: "$124K", pct: 88, color: "#3b82f6" },
  { label: "Error Prevention",      value: "$89K",  pct: 70, color: "#22c55e" },
  { label: "Processing Efficiency", value: "$67K",  pct: 55, color: "#f59e0b" },
];
const innerNav = [
  { label: "Dashboard",       icon: "dashboard" },
  { label: "Mail Processing", icon: "inbox"     },
  { label: "Escrow Accounts", icon: "escrow"    },
  { label: "Transactions",    icon: "tx"        },
  { label: "Audit Logs",      icon: "audit"     },
  { label: "Rate Config",     icon: "rate"      },
  { label: "Reports",         icon: "reports",  active: true },
  { label: "Settings",        icon: "settings"  },
];

// ── Tooltip ───────────────────────────────────────────────────────────────────
const WeeklyTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  const colors = { Standard: "#3b82f6", Priority: "#22c55e", Express: "#f59e0b", International: "#ef4444" };
  return (
    <div className="bg-white border border-gray-200 rounded-xl shadow-xl p-3 text-sm min-w-[150px]">
      <p className="font-semibold text-gray-700 mb-1.5">{label}</p>
      {payload.map((p) => (
        <p key={p.name} style={{ color: colors[p.name] }} className="font-medium text-xs">
          {p.name} : {p.value.toLocaleString()}
        </p>
      ))}
    </div>
  );
};

// ── Stat Card ─────────────────────────────────────────────────────────────────
const StatCard = ({ title, value, change, iconBg, iconPath }) => (
  <div className="bg-white rounded-2xl p-4 flex items-center justify-between shadow-sm border border-gray-100 min-w-0">
    <div className="min-w-0 pr-2">
      <p className="text-[11px] text-gray-500 font-medium mb-1 leading-tight">{title}</p>
      <p className="text-lg sm:text-xl font-bold text-gray-800 truncate">{value}</p>
      <div className="flex items-center gap-1 mt-1">
        <svg className="w-3 h-3 text-emerald-500 flex-shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5}>
          <path d="M23 6l-9.5 9.5-5-5L1 18" />
        </svg>
        <span className="text-[11px] font-semibold text-emerald-500 truncate">{change}</span>
      </div>
    </div>
    <div className={`w-10 h-10 rounded-xl ${iconBg} flex items-center justify-center flex-shrink-0`}>
      <Icon d={iconPath} size={18} color="white" />
    </div>
  </div>
);

// ── Main ──────────────────────────────────────────────────────────────────────
export default function ReportsPage() {
  const [activeNav, setActiveNav] = useState("Reports");

  return (
    <div
      className="flex" style={{ fontFamily: "'DM Sans','Segoe UI',sans-serif", height: "100%" }}>
    

      {/* Right Content */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">

        {/* Scrollable Body */}
        <main className="flex-1 overflow-y-auto px-4 sm:px-5 py-4 space-y-4">

          {/* Page Header */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div>
              <h1 className="text-lg sm:text-xl font-bold text-gray-800">Reports & Analytics</h1>
              <p className="text-[11px] text-gray-500 mt-0.5">Comprehensive insights and performance metrics</p>
            </div>
            <div className="flex items-center gap-2 flex-wrap">
              <button className="flex items-center gap-1.5 border border-gray-200 rounded-xl px-3 py-1.5 text-[11px] font-medium text-gray-600 bg-white hover:bg-gray-50 transition-colors">
                <Icon d={icons.calendar} size={12} />
                Last 6 Months
                <svg className="w-3 h-3 text-gray-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}><path d="M6 9l6 6 6-6"/></svg>
              </button>
              <button className="flex items-center gap-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl px-3 py-1.5 text-[11px] font-semibold transition-colors">
                <Icon d={icons.download} size={12} color="white" />
                Export Report
              </button>
            </div>
          </div>

          {/* Stat Cards */}
          <div className="grid grid-cols-2 xl:grid-cols-4 gap-3">
            <StatCard title="Total Mail Processed" value="326,000" change="+18.2%"         iconBg="bg-blue-500"    iconPath={icons.mail}   />
            <StatCard title="Total Revenue"         value="$326K"   change="+18.2%"         iconBg="bg-emerald-500" iconPath={icons.dollar}  />
            <StatCard title="Escrow Usage"          value="100,500" change="30.8% of total" iconBg="bg-amber-500"   iconPath={icons.wallet}  />
            <StatCard title="Avg Processing Time"   value="1.2s"    change="-15% faster"    iconBg="bg-violet-500"  iconPath={icons.chart}   />
          </div>

          {/* Trend Charts */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
              <h2 className="font-semibold text-gray-800 text-sm mb-3">Mail Volume Trend</h2>
              <ResponsiveContainer width="100%" height={190}>
                <AreaChart data={mailVolumeData} margin={{ top: 4, right: 6, left: -16, bottom: 0 }}>
                  <defs>
                    <linearGradient id="mg2" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%"  stopColor="#10b981" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#10b981" stopOpacity={0.02} />
                    </linearGradient>
                    <linearGradient id="eg2" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%"  stopColor="#10b981" stopOpacity={0.12} />
                      <stop offset="95%" stopColor="#10b981" stopOpacity={0.01} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis dataKey="month" tick={{ fontSize: 10, fill: "#9ca3af" }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 10, fill: "#9ca3af" }} axisLine={false} tickLine={false} tickFormatter={v => `${v/1000}k`} />
                  <Tooltip formatter={v => v.toLocaleString()} />
                  <Legend iconType="plainline" wrapperStyle={{ fontSize: 10 }} />
                  <Area type="monotone" dataKey="totalMail"  name="Total Mail"  stroke="#10b981" strokeWidth={2} fill="url(#mg2)" dot={{ r: 2.5, fill: "#10b981" }} />
                  <Area type="monotone" dataKey="escrowUsed" name="Escrow Used" stroke="#6ee7b7" strokeWidth={2} strokeDasharray="5 3" fill="url(#eg2)" dot={{ r: 2.5, fill: "#6ee7b7" }} />
                </AreaChart>
              </ResponsiveContainer>
            </div>

            <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
              <h2 className="font-semibold text-gray-800 text-sm mb-3">Revenue Trend</h2>
              <ResponsiveContainer width="100%" height={190}>
                <BarChart data={revenueData} margin={{ top: 4, right: 6, left: -16, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis dataKey="month" tick={{ fontSize: 10, fill: "#9ca3af" }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 10, fill: "#9ca3af" }} axisLine={false} tickLine={false} tickFormatter={v => `${v/1000}k`} />
                  <Tooltip formatter={v => `$${v.toLocaleString()}`} />
                  <Legend iconType="square" wrapperStyle={{ fontSize: 10 }} />
                  <Bar dataKey="totalRevenue"  name="Total Revenue"  fill="#3b82f6" radius={[4,4,0,0]} />
                  <Bar dataKey="escrowRevenue" name="Escrow Revenue" fill="#10b981" radius={[4,4,0,0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Weekly Distribution */}
          <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
            <h2 className="font-semibold text-gray-800 text-sm mb-3">Weekly Mail Class Distribution</h2>
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={weeklyMailData} margin={{ top: 4, right: 6, left: -16, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="day" tick={{ fontSize: 10, fill: "#9ca3af" }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 10, fill: "#9ca3af" }} axisLine={false} tickLine={false} />
                <Tooltip content={<WeeklyTooltip />} />
                <Legend iconType="square" wrapperStyle={{ fontSize: 10 }} />
                <Bar dataKey="Standard"      stackId="a" fill="#3b82f6" />
                <Bar dataKey="Priority"      stackId="a" fill="#22c55e" />
                <Bar dataKey="Express"       stackId="a" fill="#f59e0b" />
                <Bar dataKey="International" stackId="a" fill="#ef4444" radius={[4,4,0,0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Performance */}
          <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
            <h2 className="font-semibold text-gray-800 text-sm mb-3">System Performance Metrics</h2>
            <ResponsiveContainer width="100%" height={190}>
              <LineChart data={performanceData} margin={{ top: 4, right: 6, left: -16, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="day" tick={{ fontSize: 10, fill: "#9ca3af" }} axisLine={false} tickLine={false} />
                <YAxis domain={[90, 100]} tick={{ fontSize: 10, fill: "#9ca3af" }} axisLine={false} tickLine={false} />
                <Tooltip formatter={v => `${v}%`} />
                <Legend iconType="plainline" wrapperStyle={{ fontSize: 10 }} />
                <Line type="monotone" dataKey="processingSpeed" name="Processing Speed %" stroke="#f59e0b" strokeWidth={2} dot={{ r: 3, fill: "#f59e0b" }} strokeDasharray="5 3" />
                <Line type="monotone" dataKey="accuracy"        name="Accuracy %"         stroke="#10b981" strokeWidth={2} dot={{ r: 3, fill: "#10b981" }} strokeDasharray="5 3" />
                <Line type="monotone" dataKey="escrowSuccess"   name="Escrow Success %"   stroke="#3b82f6" strokeWidth={2} dot={{ r: 3, fill: "#3b82f6" }} strokeDasharray="5 3" />
              </LineChart>
            </ResponsiveContainer>
          </div>

          {/* Bottom Row */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pb-2">
            {/* Top Customers */}
            <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
              <h2 className="font-semibold text-gray-800 text-sm mb-3">Top Customers</h2>
              <div className="space-y-3">
                {topCustomers.map((c) => (
                  <div key={c.name} className="flex items-center justify-between gap-2">
                    <div className="min-w-0">
                      <p className="text-xs font-semibold text-gray-700 truncate">{c.name}</p>
                      <p className="text-[10px] text-gray-400">{c.items}</p>
                    </div>
                    <span className="text-xs font-bold text-gray-800 flex-shrink-0">{c.revenue}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Service Levels */}
            <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
              <h2 className="font-semibold text-gray-800 text-sm mb-3">Service Levels</h2>
              <div className="space-y-3">
                {serviceLevels.map((s) => (
                  <div key={s.name} className="flex items-center justify-between gap-2">
                    <div className="min-w-0">
                      <p className="text-xs font-semibold text-gray-700 truncate">{s.name}</p>
                      <p className="text-[10px] text-gray-400">{s.metric}</p>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <p className="text-xs font-bold text-gray-800">{s.value}</p>
                      <p className={`text-[10px] font-semibold ${s.status === "excellent" ? "text-emerald-500" : "text-amber-500"}`}>{s.status}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Cost Savings */}
            <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
              <h2 className="font-semibold text-gray-800 text-sm mb-3">Cost Savings</h2>
              <div className="space-y-3">
                {costSavings.map((c) => (
                  <div key={c.label}>
                    <div className="flex justify-between text-xs mb-1">
                      <span className="text-gray-600 font-medium">{c.label}</span>
                      <span className="font-bold text-gray-800">{c.value}</span>
                    </div>
                    <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                      <div className="h-full rounded-full" style={{ width: `${c.pct}%`, backgroundColor: c.color }} />
                    </div>
                  </div>
                ))}
                <div className="pt-2 border-t border-gray-100 flex justify-between items-center">
                  <span className="text-xs font-semibold text-gray-700">Total Savings</span>
                  <span className="text-sm font-bold text-emerald-500">$280K</span>
                </div>
              </div>
            </div>
          </div>

        </main>
      </div>
    </div>
  );
}