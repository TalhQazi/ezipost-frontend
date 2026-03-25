import { useMemo, useState } from "react";
import {
  Files,
  Landmark,
  TrendingUp,
  TrendingDown,
  BarChart3,
  ShieldAlert,
  BellRing,
  FileCheck,
  CheckCircle,
  Clock,
  Activity,
  Download,
  Printer,
  Calendar,
  MoreHorizontal,
  Bell,
  AlertCircle,
  AlertTriangle,
} from "lucide-react";
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";

// ─── DATA ────────────────────────────────────────────────────────────────────

const statCards = [
  {
    title: "Processed Today",
    value: "12,847",
    badge: "+12.5%",
    badgeUp: true,
    icon: Files,
    iconBg: "bg-blue-100",
    iconColor: "text-blue-500",
  },
  {
    title: "Escrow Debits",
    value: "3,421",
    badge: "26.6% of total",
    badgeUp: null,
    icon: Landmark,
    iconBg: "bg-green-100",
    iconColor: "text-green-500",
  },
  {
    title: "Revenue Today",
    value: "$28,432",
    badge: "+8.2%",
    badgeUp: true,
    icon: TrendingUp,
    iconBg: "bg-yellow-100",
    iconColor: "text-yellow-500",
  },
  {
    title: "Active Alerts",
    value: "3",
    badge: "Needs attention",
    badgeUp: false,
    icon: BellRing,
    iconBg: "bg-red-100",
    iconColor: "text-red-500",
  },
];

const hourlyData = [
  { time: "00:00", processed: 1100, escrow: 320 },
  { time: "02:00", processed: 950, escrow: 280 },
  { time: "04:00", processed: 820, escrow: 240 },
  { time: "06:00", processed: 1050, escrow: 310 },
  { time: "08:00", processed: 1800, escrow: 540 },
  { time: "10:00", processed: 2600, escrow: 780 },
  { time: "12:00", processed: 3200, escrow: 960 },
  { time: "14:00", processed: 3100, escrow: 930 },
  { time: "16:00", processed: 2500, escrow: 750 },
  { time: "18:00", processed: 2000, escrow: 600 },
  { time: "20:00", processed: 1600, escrow: 480 },
];

const revenueData = [
  { month: "Jan", total: 41000, escrow: 18000 },
  { month: "Feb", total: 47000, escrow: 21000 },
  { month: "Mar", total: 50000, escrow: 23000 },
  { month: "Apr", total: 54000, escrow: 25000 },
  { month: "May", total: 62000, escrow: 28000 },
  { month: "Jun", total: 68000, escrow: 31000 },
];

const mailDist = [
  { name: "Standard", value: 45, color: "#3b82f6" },
  { name: "Priority", value: 30, color: "#10b981" },
  { name: "Express", value: 15, color: "#f59e0b" },
  { name: "International", value: 10, color: "#ef4444" },
];

const systemStatus = [
  { name: "Postage Evaluation Engine", uptime: "99.98%", ok: true },
  { name: "Escrow Service", uptime: "99.95%", ok: true },
  { name: "Transaction Auth", uptime: "99.99%", ok: true },
  { name: "Rate Calculation", uptime: "99.97%", ok: true },
  { name: "Audit Logger", uptime: "100%", ok: true },
  { name: "Notification Service", uptime: "98.20%", ok: false },
];

const recentAlerts = [
  {
    icon: AlertTriangle,
    color: "text-yellow-500",
    bg: "bg-yellow-50",
    msg: "Low escrow balance for Account #4832",
    time: "5 min ago",
  },
  {
    icon: Activity,
    color: "text-blue-500",
    bg: "bg-blue-50",
    msg: "Rate table updated successfully",
    time: "23 min ago",
  },
  {
    icon: AlertTriangle,
    color: "text-yellow-500",
    bg: "bg-yellow-50",
    msg: "High transaction volume detected",
    time: "1 hour ago",
  },
  {
    icon: CheckCircle,
    color: "text-green-500",
    bg: "bg-green-50",
    msg: "System backup completed",
    time: "2 hours ago",
  },
];

// ─── CUSTOM TOOLTIP ───────────────────────────────────────────────────────────

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-white border border-slate-200 rounded-xl shadow-lg px-4 py-3 text-xs">
      <p className="font-semibold text-slate-700 mb-1">{label}</p>
      {payload.map((p, i) => (
        <p key={i} style={{ color: p.color }} className="font-medium">
          {p.name}: <span className="font-bold">{typeof p.value === "number" && p.value > 1000 ? p.value.toLocaleString() : p.value}</span>
        </p>
      ))}
    </div>
  );
};

// ─── MAIN COMPONENT ───────────────────────────────────────────────────────────

const Dashboard = () => {
  const today = new Date().toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return (
    <div className="min-h-screen bg-slate-50 p-6 space-y-6">

      {/* ── HEADER ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">
            Dashboard Overview
          </h1>
          <p className="text-slate-400 text-sm mt-1">
            Real-time monitoring of EzPost® operations
          </p>
        </div>

        {/* <div className="flex items-center gap-3 flex-wrap">
          <div className="flex items-center gap-2 bg-white border border-slate-200 px-4 py-2 rounded-xl shadow-sm text-sm text-slate-600 font-medium">
            <Calendar size={15} className="text-slate-400" />
            {today}
          </div>
          <button className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 text-slate-600 rounded-xl text-sm font-semibold hover:bg-slate-100 transition shadow-sm">
            <Printer size={14} /> Print
          </button>
          <button className="flex items-center gap-2 px-4 py-2 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl text-sm font-bold shadow-md transition">
            <Download size={14} /> Download Report
          </button>
        </div> */}
      </div>

      {/* ── STAT CARDS ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        {statCards.map((card, i) => {
          const Icon = card.icon;
          return (
            <div
              key={i}
              className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5 flex items-center justify-between hover:shadow-md transition-shadow"
            >
              <div className="space-y-1">
                <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                  {card.title}
                </p>
                <p className="text-2xl font-extrabold text-slate-800">
                  {card.value}
                </p>
                {card.badgeUp === null ? (
                  <p className="text-xs text-slate-400 font-medium">{card.badge}</p>
                ) : card.badgeUp === false ? (
                  <p className="text-xs text-orange-500 font-semibold">{card.badge}</p>
                ) : (
                  <p className="text-xs text-emerald-500 font-semibold flex items-center gap-1">
                    <TrendingUp size={11} /> {card.badge}
                  </p>
                )}
              </div>
              <div className={`w-14 h-14 rounded-2xl ${card.iconBg} flex items-center justify-center`}>
                <Icon size={26} className={card.iconColor} />
              </div>
            </div>
          );
        })}
      </div>

      {/* ── CHARTS ROW 1 ── */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">

        {/* 24-Hour Processing Volume */}
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-bold text-slate-800 text-base">24-Hour Processing Volume</h2>
            <button className="text-slate-300 hover:text-slate-500 transition">
              <MoreHorizontal size={18} />
            </button>
          </div>
          <ResponsiveContainer width="100%" height={240}>
            <AreaChart data={hourlyData} margin={{ top: 4, right: 4, bottom: 0, left: 0 }}>
              <defs>
                <linearGradient id="gradProcessed" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.15} />
                  <stop offset="95%" stopColor="#3b82f6" stopOpacity={0.01} />
                </linearGradient>
                <linearGradient id="gradEscrow" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10b981" stopOpacity={0.35} />
                  <stop offset="95%" stopColor="#10b981" stopOpacity={0.02} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
              <XAxis dataKey="time" tick={{ fontSize: 11, fill: "#94a3b8" }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: "#94a3b8" }} axisLine={false} tickLine={false} />
              <Tooltip content={<CustomTooltip />} />
              <Area type="monotone" dataKey="processed" name="Total Processed" stroke="#3b82f6" strokeWidth={2} fill="url(#gradProcessed)" dot={false} />
              <Area type="monotone" dataKey="escrow" name="Escrow Used" stroke="#10b981" strokeWidth={2.5} fill="url(#gradEscrow)" dot={false} />
            </AreaChart>
          </ResponsiveContainer>
          <div className="flex items-center gap-5 mt-3 justify-center">
            <span className="flex items-center gap-1.5 text-xs text-slate-500">
              <span className="w-3 h-3 rounded-full bg-blue-400 inline-block"></span> Total Processed
            </span>
            <span className="flex items-center gap-1.5 text-xs text-slate-500">
              <span className="w-3 h-3 rounded-full bg-emerald-500 inline-block"></span> Escrow Used
            </span>
          </div>
        </div>

        {/* 6-Month Revenue Trend */}
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-bold text-slate-800 text-base">6-Month Revenue Trend</h2>
            <button className="text-slate-300 hover:text-slate-500 transition">
              <MoreHorizontal size={18} />
            </button>
          </div>
          <ResponsiveContainer width="100%" height={240}>
            <BarChart data={revenueData} margin={{ top: 4, right: 4, bottom: 0, left: 0 }} barGap={4}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
              <XAxis dataKey="month" tick={{ fontSize: 11, fill: "#94a3b8" }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: "#94a3b8" }} axisLine={false} tickLine={false} tickFormatter={(v) => `${v / 1000}k`} />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="total" name="Total Revenue" fill="#3b82f6" radius={[6, 6, 0, 0]} opacity={0.25} />
              <Bar dataKey="escrow" name="Escrow Revenue" fill="#10b981" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
          <div className="flex items-center gap-5 mt-3 justify-center">
            <span className="flex items-center gap-1.5 text-xs text-slate-500">
              <span className="w-3 h-3 rounded-full bg-blue-400 inline-block"></span> Total Revenue
            </span>
            <span className="flex items-center gap-1.5 text-xs text-slate-500">
              <span className="w-3 h-3 rounded-full bg-emerald-500 inline-block"></span> Escrow Revenue
            </span>
          </div>
        </div>
      </div>

      {/* ── BOTTOM ROW ── */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">

        {/* Mail Class Distribution */}
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
          <h2 className="font-bold text-slate-800 text-base mb-4">Mail Class Distribution</h2>
          <div className="flex justify-center">
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie
                  data={mailDist}
                  cx="50%"
                  cy="50%"
                  innerRadius={55}
                  outerRadius={85}
                  dataKey="value"
                  strokeWidth={2}
                  stroke="#fff"
                >
                  {mailDist.map((entry, index) => (
                    <Cell key={index} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(value, name) => [`${value}%`, name]}
                  contentStyle={{ borderRadius: 12, border: "1px solid #e2e8f0", fontSize: 12 }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="grid grid-cols-2 gap-2 mt-2">
            {mailDist.map((d, i) => (
              <div key={i} className="flex items-center gap-2 text-xs text-slate-600">
                <span className="w-3 h-3 rounded-full flex-shrink-0" style={{ background: d.color }}></span>
                <span>{d.name} ({d.value}%)</span>
              </div>
            ))}
          </div>
        </div>

        {/* System Status */}
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
          <h2 className="font-bold text-slate-800 text-base mb-4">System Status</h2>
          <div className="space-y-3">
            {systemStatus.map((s, i) => (
              <div key={i} className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  {s.ok ? (
                    <CheckCircle size={16} className="text-emerald-500 flex-shrink-0" />
                  ) : (
                    <Clock size={16} className="text-yellow-500 flex-shrink-0" />
                  )}
                  <span className="text-xs text-slate-600 font-medium">{s.name}</span>
                </div>
                <span className={`text-xs font-bold ${s.ok ? "text-emerald-600" : "text-yellow-600"}`}>
                  {s.uptime}
                </span>
              </div>
            ))}
          </div>
          <div className="mt-5 pt-4 border-t border-slate-100 flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse"></span>
            <span className="text-xs font-semibold text-emerald-600">All core services operational</span>
          </div>
        </div>

        {/* Recent Alerts */}
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-bold text-slate-800 text-base">Recent Alerts</h2>
            <span className="text-xs font-bold text-white bg-red-500 rounded-full px-2 py-0.5">3 new</span>
          </div>
          <div className="space-y-3">
            {recentAlerts.map((a, i) => {
              const Icon = a.icon;
              return (
                <div key={i} className="flex items-start gap-3">
                  <div className={`w-8 h-8 rounded-xl ${a.bg} flex items-center justify-center flex-shrink-0`}>
                    <Icon size={15} className={a.color} />
                  </div>
                  <div>
                    <p className="text-xs text-slate-700 font-semibold leading-snug">{a.msg}</p>
                    <p className="text-xs text-slate-400 mt-0.5">{a.time}</p>
                  </div>
                </div>
              );
            })}
          </div>
          <button className="mt-4 w-full text-xs font-semibold text-emerald-600 hover:text-emerald-700 border border-emerald-200 rounded-xl py-2 hover:bg-emerald-50 transition">
            View all alerts →
          </button>
        </div>

      </div>
    </div>
  );
};

export default Dashboard;