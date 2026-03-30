import { Outlet } from "react-router-dom";
import Navbar from "./Navbar";
import Footer from "./Footer";
import { useState } from "react";
import Sidebar from "./Sidebar";

export default function AdminLayout({ onLogout }) {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      {/* NAVBAR (fixed height = 64px / 4rem) */}
      <Navbar
        sidebarOpen={sidebarOpen}
        setSidebarOpen={setSidebarOpen}
        handleLogout={onLogout}
        mobileMenuOpen={mobileMenuOpen}
        setMobileMenuOpen={setMobileMenuOpen}
      />

      {/* PAGE BODY */}
      <div className="flex pt-16 flex-1 overflow-hidden">
        {/* SIDEBAR (fixed position) */}
        <Sidebar
          sidebarOpen={sidebarOpen}
          setSidebarOpen={setSidebarOpen}
          mobileMenuOpen={mobileMenuOpen}
          setMobileMenuOpen={setMobileMenuOpen}
        />

        {/* MAIN CONTENT + FOOTER */}
        <div
          className={`
            flex flex-col flex-1 transition-all duration-300 min-w-0
            ${sidebarOpen ? "lg:ml-72" : "lg:ml-20"}
          `}
        >
          {/* MAIN CONTENT */}
          <main className="flex-1 overflow-auto bg-[#f9fafb] p-6">
            <div className="max-w-[1600px] mx-auto w-full">
              <Outlet />
            </div>
          </main>

          {/* FOOTER */}
          <Footer />
        </div>
      </div>
    </div>
  );
}