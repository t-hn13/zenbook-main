// src/layouts/user/LayoutUser.jsx
import { motion } from "framer-motion";
import { Outlet } from "react-router-dom";
import HeaderUser from "../../components/user/HeaderUser";
import FooterUser from "../../components/user/FooterUser";

const LayoutUser = () => {
  return (
    <div className="min-h-screen flex flex-col bg-linear-to-b from-blue-50 to-white">
      <HeaderUser />

      <motion.main
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="flex-1 max-w-7xl mx-auto w-full px-4 py-6"
      >
        <Outlet />
      </motion.main>

      <FooterUser />
    </div>
  );
};

export default LayoutUser;
