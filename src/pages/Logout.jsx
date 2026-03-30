import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { LogOut, CheckCircle, ArrowLeft } from "lucide-react";

export default function Logout() {
  const navigate = useNavigate();

  // Auto-redirect to login after 3 seconds
  useEffect(() => {
    const timer = setTimeout(() => {
      navigate("/login");
    }, 3000);
    return () => clearTimeout(timer);
  }, [navigate]);

  return (
    <div className="min-h-screen bg-[#060c17] flex items-center justify-center p-6 relative overflow-hidden">
      {/* Background blobs */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-[#6571ff]/15 rounded-full blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl" />
        <div
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage:
              "linear-gradient(#6571ff 1px, transparent 1px), linear-gradient(90deg, #6571ff 1px, transparent 1px)",
            backgroundSize: "48px 48px",
          }}
        />
      </div>

      <div className="relative z-10 text-center max-w-sm w-full">
        {/* Icon */}
        <div className="flex justify-center mb-6">
          <div className="relative">
            <div className="w-24 h-24 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center">
              <CheckCircle size={44} className="text-emerald-400" />
            </div>
            {/* Pulse ring */}
            <div className="absolute inset-0 rounded-full border-2 border-emerald-400/30 animate-ping" />
          </div>
        </div>

        {/* Logo */}
        <p className="text-sm font-bold text-slate-500 uppercase tracking-[0.3em] mb-3">
          EzPost<span className="text-[#6571ff]">®</span> Enterprise
        </p>

        {/* Heading */}
        <h1 className="text-3xl font-extrabold text-white mb-3">
          Logged Out Successfully
        </h1>

        <p className="text-slate-400 text-sm leading-relaxed mb-8">
          Your session has been securely terminated.
          <br />
          Redirecting you to the login page…
        </p>

        {/* Progress bar */}
        <div className="w-full h-1 bg-white/10 rounded-full overflow-hidden mb-8">
          <div
            className="h-full bg-gradient-to-r from-[#6571ff] to-emerald-400 rounded-full"
            style={{ animation: "logout-progress 3s linear forwards" }}
          />
        </div>

        {/* Buttons */}
        <div className="flex flex-col gap-3">
          <button
            onClick={() => navigate("/login")}
            className="w-full flex items-center justify-center gap-2 py-3.5 bg-[#6571ff] hover:bg-[#5560e0] text-white rounded-xl font-extrabold text-sm transition shadow-lg shadow-[#6571ff]/20"
          >
            <LogOut size={16} />
            Back to Login
          </button>
          <button
            onClick={() => navigate("/dashboard")}
            className="w-full flex items-center justify-center gap-2 py-3 bg-white/5 hover:bg-white/10 text-slate-400 rounded-xl font-semibold text-sm transition border border-white/10"
          >
            <ArrowLeft size={15} />
            Return to Dashboard
          </button>
        </div>

        {/* Footer */}
        <p className="text-slate-600 text-xs mt-8">
          © 2026 EzPost® Inc. All rights reserved.
        </p>
      </div>

      <style>{`
        @keyframes logout-progress {
          from { width: 0% }
          to   { width: 100% }
        }
      `}</style>
    </div>
  );
}
