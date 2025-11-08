// src/pages/NotFound.jsx

import { Link, useNavigate } from "react-router-dom"; // Điều hướng
import { motion } from "framer-motion"; // Hiệu ứng chuyển động
import { Home, ArrowLeft, ShoppingBag, LifeBuoy } from "lucide-react"; // Icon

const NotFound = () => {
  const navigate = useNavigate();

  return (
    <div className="relative min-h-[calc(100vh-80px)] flex items-center justify-center overflow-hidden">
      <div className="absolute inset-0 -z-10 bg-linear-to-b from-white via-[#f7fbff] to-[#eef4ff]" />

      <div className="pointer-events-none absolute -top-32 -left-24 h-72 w-72 rounded-full bg-blue-200/40 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-24 -right-24 h-72 w-72 rounded-full bg-indigo-200/40 blur-3xl" />

      <div className="max-w-3xl mx-auto px-6 py-16 text-center">
        <motion.div
          initial={{ y: -12, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.4 }}
          className="inline-flex items-center gap-2 rounded-full border border-blue-200 bg-white px-4 py-1.5 text-sm font-medium text-blue-700 shadow-sm"
        >
          <span className="inline-block h-2 w-2 rounded-full bg-blue-500" />
          404 · Trang không tồn tại
        </motion.div>

        <motion.div
          initial={{ scale: 0.96, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.45, delay: 0.05 }}
          className="mt-8"
        >
          <svg
            className="mx-auto h-40 w-40 md:h-48 md:w-48"
            viewBox="0 0 200 200"
            fill="none"
            aria-hidden="true"
          >
            <defs>
              <linearGradient id="g1" x1="0" x2="1" y1="0" y2="1">
                <stop offset="0%" stopColor="#60a5fa" />
                <stop offset="100%" stopColor="#a78bfa" />
              </linearGradient>
            </defs>
            <circle cx="100" cy="100" r="60" fill="url(#g1)" opacity="0.15" />
            <path
              d="M70 110c10-24 50-24 60 0"
              stroke="url(#g1)"
              strokeWidth="6"
              strokeLinecap="round"
            />
            <circle cx="80" cy="90" r="6" fill="#1f2937" />
            <circle cx="120" cy="90" r="6" fill="#1f2937" />
            <path
              d="M48 142c22 14 82 14 104 0"
              stroke="url(#g1)"
              strokeWidth="8"
              strokeLinecap="round"
              opacity="0.45"
            />
            <text
              x="100"
              y="170"
              textAnchor="middle"
              fontSize="20"
              fill="#3b82f6"
              fontWeight="700"
            >
              404
            </text>
          </svg>
        </motion.div>

        <motion.h1
          initial={{ y: 10, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.35, delay: 0.1 }}
          className="mt-6 text-3xl md:text-4xl font-extrabold tracking-tight text-gray-900"
        >
          Ôi! Không tìm thấy trang bạn cần
        </motion.h1>

        <motion.p
          initial={{ y: 8, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.35, delay: 0.16 }}
          className="mt-3 text-gray-600 leading-relaxed"
        >
          Có thể đường dẫn đã thay đổi hoặc trang đã bị xoá. Bạn có thể quay lại
          trang trước, về trang chủ, hoặc tiếp tục xem sản phẩm.
        </motion.p>

        <motion.div
          initial={{ y: 8, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.35, delay: 0.22 }}
          className="mt-8 flex flex-wrap items-center justify-center gap-3"
        >
          <button
            onClick={() => navigate(-1)}
            className="inline-flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50 active:scale-[0.99] transition"
          >
            <ArrowLeft size={18} />
            Quay lại
          </button>

          <Link
            to="/"
            className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-blue-700 shadow-sm active:scale-[0.99] transition"
          >
            <Home size={18} />
            Về trang chủ
          </Link>

          <Link
            to="/products"
            className="inline-flex items-center gap-2 rounded-lg bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-indigo-700 shadow-sm active:scale-[0.99] transition"
          >
            <ShoppingBag size={18} />
            Xem sản phẩm
          </Link>

          <Link
            to="/contact"
            className="inline-flex items-center gap-2 rounded-lg border border-indigo-200 bg-white px-4 py-2.5 text-sm font-medium text-indigo-700 hover:bg-indigo-50 active:scale-[0.99] transition"
          >
            <LifeBuoy size={18} />
            Liên hệ hỗ trợ
          </Link>
        </motion.div>

        <motion.div
          initial={{ y: 8, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.35, delay: 0.28 }}
          className="mx-auto mt-8 w-full max-w-xl rounded-xl border border-blue-100 bg-white p-4 text-left shadow-sm"
        >
          <p className="text-sm text-gray-600">
            <span className="font-semibold text-gray-800">Mẹo:</span> Nếu bạn đi
            từ một liên kết cũ, hãy thử tìm lại bằng thanh tìm kiếm ở phần đầu
            trang hoặc xem danh mục sản phẩm.
          </p>
        </motion.div>
      </div>
    </div>
  );
};

export default NotFound;
