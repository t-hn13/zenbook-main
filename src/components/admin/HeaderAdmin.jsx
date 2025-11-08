// src/components/admin/HeaderAdmin.jsx
import { Menu } from "lucide-react";
import { motion } from "framer-motion";
const HeaderAdmin = ({ onOpenSidebar }) => {
  return (
    <motion.header
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.25 }}
      className="h-14 bg-white border-b flex items-center justify-between px-4 md:px-6 sticky top-0 z-30"
    >
      <div className="flex items-center gap-3">
        <button
          onClick={onOpenSidebar}
          className="md:hidden w-9 h-9 rounded-md border border-slate-200 flex items-center justify-center text-slate-700 hover:bg-slate-50 cursor-pointer"
        >
          <Menu size={18} />
        </button>
        <div>
          <p className="text-sm font-semibold text-slate-700">
            Bảng điều khiển
          </p>
          <p className="text-xs text-slate-400 hidden sm:block">
            ZenBooks Admin
          </p>
        </div>
      </div>
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2">
          <div className="hidden md:block leading-tight">
            <p className="text-xs text-slate-400">Admin</p>
            <p className="text-sm text-slate-700">Quản trị viên</p>
          </div>
        </div>
      </div>
    </motion.header>
  );
};

export default HeaderAdmin;
