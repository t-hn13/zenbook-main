import { NavLink } from "react-router-dom";
import {
  LayoutDashboard,
  Package,
  ShoppingBag,
  Users,
  Tags,
  Search,
  X,
} from "lucide-react";
import { motion } from "framer-motion";
const SidebarAdmin = ({ variant = "desktop", onClose }) => {
  const linkCls = ({ isActive }) =>
    `flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium transition
      ${
        isActive
          ? "bg-blue-600 text-white"
          : "text-slate-100/90 hover:bg-white/10"
      }`;
  const mobileVariants = {
    hidden: { x: "-100%" },
    visible: {
      x: 0,
      transition: { type: "spring", stiffness: 280, damping: 28 },
    },
    exit: {
      x: "-100%",
      transition: { duration: 0.18 },
    },
  };
  const Wrapper = variant === "mobile" ? motion.aside : "aside";
  return (
    <Wrapper
      {...(variant === "mobile"
        ? {
            variants: mobileVariants,
            initial: "hidden",
            animate: "visible",
            exit: "exit",
          }
        : {})}
      className={`h-full w-64 bg-slate-900 text-white flex flex-col z-50
        ${variant === "desktop" ? "fixed inset-y-0 left-0 hidden md:flex" : ""} 
        ${
          variant === "mobile" ? "flex md:hidden rounded-r-2xl shadow-2xl" : ""
        }`}
    >
      <div className="h-16 flex items-center justify-between px-4 border-b border-slate-800">
        <span className="text-xl font-bold tracking-tight">
          ZenBooks <span className="text-blue-400">Admin</span>
        </span>

        {variant === "mobile" && (
          <button
            onClick={onClose}
            className="md:hidden text-slate-200 hover:text-white cursor-pointer"
          >
            <X size={20} />
          </button>
        )}
      </div>
      <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
        <NavLink
          to="/admin"
          end
          className={linkCls}
          onClick={onClose ? onClose : undefined}
        >
          <LayoutDashboard size={18} />
          Dashboard
        </NavLink>
        <NavLink
          to="/admin/products"
          className={linkCls}
          onClick={onClose ? onClose : undefined}
        >
          <Package size={18} />
          Sản phẩm
        </NavLink>
        <NavLink
          to="/admin/categories"
          className={linkCls}
          onClick={onClose ? onClose : undefined}
        >
          <Tags size={18} />
          Danh mục
        </NavLink>
        <NavLink
          to="/admin/brands"
          className={linkCls}
          onClick={onClose ? onClose : undefined}
        >
          <Users size={18} />
          Tác giả
        </NavLink>
        <NavLink
          to="/admin/orders"
          className={linkCls}
          onClick={onClose ? onClose : undefined}
        >
          <ShoppingBag size={18} />
          Đơn hàng
        </NavLink>
        <NavLink
          to="/admin/order-lookup"
          className={linkCls}
          onClick={onClose ? onClose : undefined}
        >
          <Search size={18} />
          Tra cứu đơn
        </NavLink>
        <NavLink
          to="/admin/users"
          className={linkCls}
          onClick={onClose ? onClose : undefined}
        >
          <Users size={18} />
          Người dùng
        </NavLink>
      </nav>

      <div className="p-4 text-xs text-slate-400 border-t border-slate-800">
        © {new Date().getFullYear()} ZenBooks
      </div>
    </Wrapper>
  );
};

export default SidebarAdmin;
