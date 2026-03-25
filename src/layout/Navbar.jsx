import {
  Bell,
  Menu,
  LogOut,
  Key,
  BellRing,
  HelpCircle,
  Search,
  MoreHorizontal,
} from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { FaUserAstronaut } from "react-icons/fa";

export default function Navbar({
  sidebarOpen,
  setSidebarOpen,
  mobileMenuOpen,
  setMobileMenuOpen,
  handleLogout,
}) {
  const [profileOpen, setProfileOpen] = useState(false);
  const [activeTitle, setActiveTitle] = useState(null);
  const navigate = useNavigate();

  return (
    <nav className="fixed top-0 left-0 right-0 h-15 bg-white border-b border-slate-200 z-50">
      <div className="flex items-center h-full px-4 sm:px-6">
        {/* LEFT – TOGGLE */}
        <div className="flex items-center gap-4 flex-1">
          {/* DESKTOP TOGGLE */}
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="hidden lg:flex p-2 rounded-lg text-slate-500 hover:bg-slate-100 hover:text-[#6571ff] transition-all"
          >
            <Menu size={20} />
          </button>

          {/* MOBILE TOGGLE */}
          <button
            onClick={() => {
              setMobileMenuOpen(!mobileMenuOpen);
              if (!mobileMenuOpen) setSidebarOpen(true);
            }}
            className="lg:hidden p-2 rounded-lg text-slate-500 hover:bg-slate-100 transition"
          >
            <MoreHorizontal size={20} className="text-slate-700" />
          </button>
        </div>

        {/* CENTER – SEARCHBAR */}
        <div className="hidden sm:flex flex-1 justify-center items-center">
          <div className="flex items-center gap-2 px-4 py-2 bg-slate-50 border border-slate-100 rounded-xl w-full max-w-md group focus-within:bg-white focus-within:border-primary/30 transition-all">
             <Search size={16} className="text-slate-400 group-focus-within:text-primary" />
             <input 
                type="text" 
                placeholder="Search here..." 
                className="bg-transparent border-none outline-none text-sm w-full font-medium text-slate-600 placeholder:text-slate-400" 
             />
          </div>
        </div>

        {/* RIGHT – ICONS */}
        <div className="flex items-center gap-4 flex-1 justify-end relative">
          {/* Help & Support */}
          <div className="relative">
            <button
              onClick={() =>
                setActiveTitle(activeTitle === "help" ? null : "help")
              }
              className="p-2 rounded-lg hover:bg-slate-100 transition"
            >
              <HelpCircle size={18} className="text-slate-600" />
            </button>

            {activeTitle === "help" && (
              <div className="whitespace-nowrap absolute top-10 right-0 bg-black text-white text-xs px-1 py-1 rounded shadow">
                Help & Support
              </div>
            )}
          </div>

          {/* Reminder List */}
          <div className="relative">
            <button
              onClick={() =>
                setActiveTitle(activeTitle === "reminder" ? null : "reminder")
              }
              className="p-2 rounded-lg hover:bg-slate-100 transition"
            >
              <BellRing size={18} className="text-slate-600" />
            </button>

            {activeTitle === "reminder" && (
              <div className="whitespace-nowrap absolute top-10 right-0 bg-black text-white text-xs px-1 py-1 rounded shadow">
                Reminder List
              </div>
            )}
          </div>

          {/* Notifications */}
          <div className="relative">
            <button
              onClick={() =>
                setActiveTitle(activeTitle === "notify" ? null : "notify")
              }
              className="relative p-2 rounded-lg hover:bg-slate-100 transition"
            >
              <Bell size={18} className="text-slate-600" />
              <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] w-4 h-4 rounded-full flex items-center justify-center">
                3
              </span>
            </button>

            {activeTitle === "notify" && (
              <div className="whitespace-nowrap absolute top-10 right-0 bg-black text-white text-xs px-1 py-1 rounded shadow">
                Notifications
              </div>
            )}
          </div>

          {/* Profile */}
          <button
            onClick={() => {
              setProfileOpen(!profileOpen);
              setActiveTitle(null);
            }}
            className="relative flex items-center gap-2 p-1.5 rounded-full hover:bg-slate-100 transition"
          >
            <div className="w-10 h-10 rounded-full overflow-hidden border-2 border-slate-200 flex-shrink-0">
              <img
                src="/images/logoo.png"
                alt="Admin"
                className="w-full h-full object-cover"
              />
            </div>
          </button>
          
          {/* PROFILE DROPDOWN */}
          {profileOpen && (
            <div className="whitespace-nowrap absolute right-0 top-16 w-52 bg-white border border-slate-200 shadow-xl rounded-lg overflow-hidden">
              <button
                onClick={() => {
                  navigate("/admin-users");
                  setProfileOpen(false);
                }}
                className="flex items-center gap-2 w-full px-4 py-2 text-sm text-slate-700 hover:bg-slate-100"
              >
                <FaUserAstronaut size={16} />
                Manage Admin Users
              </button>

              <button
                onClick={() => {
                  navigate("/change-password");
                  setProfileOpen(false);
                }}
                className="flex items-center gap-2 w-full px-4 py-2 text-sm text-slate-700 hover:bg-slate-100"
              >
                <Key size={16} />
                Change Password
              </button>

              <div className="border-t border-slate-200" />

              <button
                onClick={handleLogout}
                className="flex items-center gap-2 w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50"
              >
                <LogOut size={16} />
                Logout
              </button>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}