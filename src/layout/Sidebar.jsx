import { ChevronDown, X, Menu, LogOut, ArrowLeft } from "lucide-react";
import { useState, useEffect } from "react";
import { menuItems } from "../data/menuItems";
import { NavLink, useLocation, useNavigate } from "react-router-dom";
import Swal from "sweetalert2";

export default function Sidebar({
  sidebarOpen,
  setSidebarOpen,
  mobileMenuOpen,
  setMobileMenuOpen,
}) {
  const location = useLocation();
  const navigate = useNavigate();
  const [openDropdown, setOpenDropdown] = useState(null);

  /* AUTO OPEN DROPDOWN BASED ON ROUTE */
  useEffect(() => {
    menuItems.forEach((item) => {
      if (
        item.type === "dropdown" &&
        item.children?.some((c) => location.pathname.startsWith(c.path))
      ) {
        setOpenDropdown(item.label);
      }
    });
  }, [location.pathname]);

  const handleLogout = () => {
    Swal.fire({
      title: "Are you sure?",
      text: "Do you want to logout?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#EF4444",
      cancelButtonColor: "#6B7280",
      confirmButtonText: "Yes, Logout!",
      cancelButtonText: "Cancel",
    }).then((result) => {
      if (result.isConfirmed) {
        localStorage.clear();
        Swal.fire({
          title: "Logged Out!",
          text: "You have been successfully logged out.",
          icon: "success",
          timer: 1500,
          showConfirmButton: false,
        });
        setTimeout(() => {
          navigate("/login");
        }, 1500);
      }
    });
  };

  return (
    <>
      {/* MOBILE OVERLAY */}
      {mobileMenuOpen && (
        <div
          className="fixed inset-0 bg-black/40 z-40 lg:hidden"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}

      {/* SIDEBAR */}
      <aside
        className={`fixed top-0 left-0 h-screen bg-[#101924] text-white
        shadow-xl z-50 transition-all duration-300
        ${sidebarOpen ? "w-72" : "w-72 lg:w-20 -translate-x-full lg:translate-x-0"}
        ${mobileMenuOpen ? "translate-x-0" : ""}`}
      >
        {/* HEADER */}
        <div className="relative flex items-center h-18 border-b border-white/10 bg-[#101924]">
          <div className={`flex items-center w-full px-6 transition-all duration-300 ${!sidebarOpen ? "justify-center px-0" : "gap-3"}`}>
             <button
              onClick={() => {
                setSidebarOpen(!sidebarOpen);
                if (window.innerWidth < 1024) {
                  setMobileMenuOpen(false);
                }
              }}
              className="p-1.5 rounded-lg text-slate-400 hover:bg-white/5 hover:text-white transition-all flex-shrink-0"
            >
              {sidebarOpen ? <ArrowLeft size={20} /> : <Menu size={20} />}
            </button>

            {sidebarOpen && (
              <div className="flex flex-col overflow-hidden whitespace-nowrap">
                <h1 className="text-2xl font-black text-white tracking-tight uppercase">
                  EzPost®
                </h1>
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-[0.2em] mt-0.5">
                  Enterprise Portal
                </span>
              </div>
            )}
          </div>
        </div>


        {/* MENU */}
        <div className="h-[calc(100vh-120px)] overflow-y-auto sidebar-scroll px-3 py-6 space-y-2 no-scrollbar">
          {menuItems.map((item, index) => {
            /* ===== HEADING ===== */
            if (item.type === "heading") {
              return (
                sidebarOpen && (
                  <p
                    key={index}
                    className="px-4 mt-8 mb-2 text-[11px] font-bold uppercase text-white/20 tracking-widest"
                  >
                    {item.label}
                  </p>
                )
              );
            }

            /* ===== NORMAL ITEM ===== */
            if (item.type === "item") {
              const Icon = item.icon;
              return (
                <NavLink
                  key={item.label}
                  to={item.path}
                  onClick={() => {
                    setMobileMenuOpen(false);
                    if (window.innerWidth < 1024) {
                      setSidebarOpen(false);
                    }
                  }}
                  className={({ isActive }) =>
                    `flex items-center gap-3 px-4 py-2 rounded-lg transition-all duration-200
                    ${
                      isActive
                        ? "text-[#6571ff] font-semibold bg-white/5"
                        : "text-slate-400 hover:text-white"
                    }
                    ${!sidebarOpen && "justify-center"}`
                  }
                >
                  {({ isActive }) => (
                    <>
                      <Icon size={18} className={isActive ? "text-[#6571ff]" : "text-slate-500"} />
                      {sidebarOpen && (
                        <span className="text-[14px]">{item.label}</span>
                      )}
                    </>
                  )}
                </NavLink>
              );
            }

            /* ===== DROPDOWN ===== */
            if (item.type === "dropdown") {
              const Icon = item.icon;
              const isOpen = openDropdown === item.label;

              return (
                <div key={item.label}>
                  <button
                    onClick={() =>
                      sidebarOpen &&
                      setOpenDropdown(isOpen ? null : item.label)
                    }
                    className={`w-full flex items-center justify-between px-4 py-2 rounded-lg transition-all
                    ${isOpen ? "text-[#6571ff]" : "text-slate-400 hover:text-white"}
                    ${!sidebarOpen && "justify-center"}`}
                  >
                    <div className="flex items-center gap-3">
                      <Icon size={18} className={isOpen ? "text-[#6571ff]" : "text-slate-500"} />
                      {sidebarOpen && (
                        <span className="text-[14px]">{item.label}</span>
                      )}
                    </div>

                    {sidebarOpen && (
                      <ChevronDown
                        size={14}
                        className={`transition ${isOpen ? "rotate-180" : ""}`}
                      />
                    )}
                  </button>

                  {sidebarOpen && isOpen && (
                    <div className="ml-9 mt-1 space-y-1">
                      {item.children.map((sub) => (
                        <NavLink
                          key={sub.path}
                          to={sub.path}
                          onClick={() => {
                            setMobileMenuOpen(false);
                            if (window.innerWidth < 1024) {
                              setSidebarOpen(false);
                            }
                          }}
                          className={({ isActive }) =>
                            `block px-3 py-1.5 rounded-lg text-[13px] transition-colors
                            ${
                              isActive
                                ? "text-[#6571ff]"
                                : "text-slate-500 hover:text-white"
                            }`
                          }
                        >
                          {sub.label}
                        </NavLink>
                      ))}
                    </div>
                  )}
                </div>
              );
            }

            return null;
          })}
        </div>

        {/* FOOTER */}
        <div className={`absolute bottom-6 w-full px-6 transition-all duration-300 ${!sidebarOpen ? "px-0 flex justify-center" : ""}`}>
          {sidebarOpen ? (
            <button
              onClick={handleLogout}
              className="w-full px-4 py-2 text-sm font-medium text-white/70 bg-white/5 rounded-lg hover:bg-red-500/10 hover:text-red-500 transition-all border border-white/5 flex items-center justify-center gap-2"
            >
              <LogOut size={16} />
              Logout
            </button>
          ) : (
            <button
              onClick={handleLogout}
              className="p-2 text-slate-400 hover:text-red-500 transition-all"
              title="Logout"
            >
              <LogOut size={20} />
            </button>
          )}
        </div>
      </aside>
    </>
  );
}