import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Eye, EyeOff, Mail, Lock, AlertCircle, Loader2 } from "lucide-react";

export default function Login() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: "", password: "" });
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    setError("");

    if (!form.email || !form.password) {
      setError("Please enter your email and password.");
      return;
    }

    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      if (form.email === "admin@ezpost.com" && form.password === "admin123") {
        localStorage.setItem("isAuth", "true");
        navigate("/dashboard");
      } else {
        setError("Invalid credentials. Try admin@ezpost.com / admin123");
      }
    }, 1200);
  };

  return (
    <div className="min-h-screen flex bg-[#060c17]">
      {/* ─── LEFT PANEL ─── */}
      <div className="hidden lg:flex flex-col justify-between w-[55%] p-12 relative overflow-hidden">
        {/* Background gradient blobs */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute -top-32 -left-32 w-96 h-96 bg-[#6571ff]/20 rounded-full blur-3xl" />
          <div className="absolute bottom-0 right-0 w-80 h-80 bg-emerald-500/10 rounded-full blur-3xl" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-[#6571ff]/5 rounded-full blur-3xl" />
        </div>

        {/* Grid overlay */}
        <div
          className="absolute inset-0 pointer-events-none opacity-[0.04]"
          style={{
            backgroundImage:
              "linear-gradient(#6571ff 1px, transparent 1px), linear-gradient(90deg, #6571ff 1px, transparent 1px)",
            backgroundSize: "48px 48px",
          }}
        />

        {/* Logo */}
        <div className="relative z-10">
          <h1 className="text-3xl font-black text-white uppercase tracking-tight">
            EzPost<span className="text-[#6571ff]">®</span>
          </h1>
          <p className="text-slate-500 text-sm font-medium mt-1 uppercase tracking-widest">
            Enterprise Portal
          </p>
        </div>

        {/* Hero text */}
        <div className="relative z-10 space-y-6">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-[#6571ff]/10 border border-[#6571ff]/20 rounded-full">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-xs font-semibold text-[#6571ff] uppercase tracking-wider">
              System Operational
            </span>
          </div>

          <h2 className="text-5xl font-black text-white leading-tight">
            Intelligent
            <br />
            <span className="text-[#6571ff]">Mail Operations</span>
            <br />
            Platform
          </h2>

          <p className="text-slate-400 text-base leading-relaxed max-w-md">
            Manage postage, escrow accounts, and mail processing with real-time
            insights. Built for enterprise-scale operations.
          </p>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-4 pt-4">
            {[
              { label: "Processed Today", value: "12,847" },
              { label: "Escrow Accounts", value: "328" },
              { label: "System Uptime", value: "99.98%" },
            ].map((s, i) => (
              <div
                key={i}
                className="bg-white/5 border border-white/10 rounded-2xl p-4"
              >
                <p className="text-2xl font-extrabold text-white">{s.value}</p>
                <p className="text-xs text-slate-500 font-medium mt-0.5">
                  {s.label}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="relative z-10">
          <p className="text-slate-600 text-xs">
            © 2026 EzPost® Inc. All rights reserved.
          </p>
        </div>
      </div>

      {/* ─── RIGHT PANEL (Login Form) ─── */}
      <div className="flex flex-1 items-center justify-center p-6 bg-white">
        <div className="w-full max-w-md">
          {/* Mobile logo */}
          <div className="lg:hidden mb-8 text-center">
            <h1 className="text-2xl font-black text-[#060c17] uppercase tracking-tight">
              EzPost<span className="text-[#6571ff]">®</span>
            </h1>
            <p className="text-slate-400 text-xs font-medium mt-1 uppercase tracking-widest">
              Enterprise Portal
            </p>
          </div>

          {/* Heading */}
          <div className="mb-8">
            <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight">
              Welcome back
            </h2>
            <p className="text-slate-400 text-sm mt-1.5">
              Sign in to your EzPost administrator account
            </p>
          </div>

          {/* Demo hint */}
          <div className="mb-6 p-3.5 bg-blue-50 border border-blue-100 rounded-xl flex items-start gap-2.5">
            <AlertCircle size={15} className="text-blue-500 flex-shrink-0 mt-0.5" />
            <p className="text-xs text-blue-700 font-medium leading-relaxed">
              Demo credentials:{" "}
              <span className="font-bold">admin@ezpost.com</span> /{" "}
              <span className="font-bold">admin123</span>
            </p>
          </div>

          {/* Error */}
          {error && (
            <div className="mb-5 p-3.5 bg-red-50 border border-red-100 rounded-xl flex items-center gap-2.5">
              <AlertCircle size={15} className="text-red-500 flex-shrink-0" />
              <p className="text-xs text-red-600 font-semibold">{error}</p>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Email */}
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">
                Email Address
              </label>
              <div className="relative">
                <Mail
                  size={16}
                  className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
                />
                <input
                  type="email"
                  placeholder="admin@ezpost.com"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-800 outline-none focus:border-[#6571ff] focus:bg-white focus:ring-2 focus:ring-[#6571ff]/10 transition placeholder:text-slate-400"
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="block text-sm font-semibold text-slate-700">
                  Password
                </label>
                <button
                  type="button"
                  className="text-xs text-[#6571ff] font-semibold hover:underline"
                >
                  Forgot password?
                </button>
              </div>
              <div className="relative">
                <Lock
                  size={16}
                  className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
                />
                <input
                  type={showPass ? "text" : "password"}
                  placeholder="••••••••"
                  value={form.password}
                  onChange={(e) =>
                    setForm({ ...form, password: e.target.value })
                  }
                  className="w-full pl-10 pr-11 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-800 outline-none focus:border-[#6571ff] focus:bg-white focus:ring-2 focus:ring-[#6571ff]/10 transition placeholder:text-slate-400"
                />
                <button
                  type="button"
                  onClick={() => setShowPass(!showPass)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition"
                >
                  {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            {/* Remember me */}
            <div className="flex items-center gap-2.5">
              <input
                id="remember"
                type="checkbox"
                className="w-4 h-4 rounded border-slate-300 accent-[#6571ff]"
              />
              <label
                htmlFor="remember"
                className="text-sm text-slate-600 font-medium"
              >
                Keep me signed in
              </label>
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 py-3.5 bg-[#060c17] hover:bg-slate-800 text-white rounded-xl font-extrabold text-sm shadow-lg transition disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {loading ? (
                <>
                  <Loader2 size={16} className="animate-spin" />
                  Signing in...
                </>
              ) : (
                "Sign In to Portal"
              )}
            </button>
          </form>

          {/* Footer note */}
          <p className="text-center text-xs text-slate-400 mt-8">
            Protected by enterprise-grade security.{" "}
            <span className="font-semibold">EzPost® v2.1</span>
          </p>
        </div>
      </div>
    </div>
  );
}
