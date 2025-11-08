// src/layouts/admin/LayoutAdmin.jsx
import { useState } from "react";
import { Outlet } from "react-router-dom";
import HeaderAdmin from "../../components/admin/HeaderAdmin.jsx";
import SidebarAdmin from "../../components/admin/SidebarAdmin.jsx";
import FooterAdmin from "../../components/admin/FooterAdmin.jsx";

const LayoutAdmin = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen bg-slate-50 flex">
      <div className="hidden lg:block w-64 shrink-0">
        <SidebarAdmin variant="desktop" />
      </div>

      {sidebarOpen && (
        <div className="fixed inset-0 z-40 lg:hidden">
          <div
            className="absolute inset-0 bg-slate-900/40"
            onClick={() => setSidebarOpen(false)}
          />
          <div className="absolute inset-y-0 left-0 w-64 bg-slate-900">
            <SidebarAdmin
              variant="mobile"
              onClose={() => setSidebarOpen(false)}
            />
          </div>
        </div>
      )}

      <div className="flex-1 flex flex-col min-h-screen">
        <HeaderAdmin onOpenSidebar={() => setSidebarOpen(true)} />

        <main className="flex-1 p-4 md:p-6 bg-slate-50">
          <Outlet />
        </main>

        <FooterAdmin />
      </div>
    </div>
  );
};

export default LayoutAdmin;
