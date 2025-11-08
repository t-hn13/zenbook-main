// src/components/user/FooterUser.jsx
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { Facebook, Instagram, Mail, MapPin, Phone } from "lucide-react";
const FooterUser = () => {
  return (
    <motion.footer
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      className="bg-linear-to-b from-blue-100 via-white to-blue-50 text-gray-700 mt-10 border-t border-gray-200"
    >
      <div className="max-w-7xl mx-auto px-6 py-10 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-8">
        <div>
          <h2 className="text-2xl font-extrabold bg-linear-to-r from-sky-500 to-indigo-600 text-transparent bg-clip-text mb-3">
            ZenBooks
          </h2>
          <p className="text-sm leading-relaxed text-gray-600">
            Nơi lan tỏa tri thức, kết nối cộng đồng yêu đọc và khơi gợi cảm hứng
            học tập mỗi ngày.
          </p>

          <div className="flex items-center gap-4 mt-4">
            <a
              href="#"
              aria-label="Facebook"
              className="text-blue-600 hover:scale-110 transition-transform"
            >
              <Facebook size={20} />
            </a>
            <a
              href="#"
              aria-label="Instagram"
              className="text-pink-500 hover:scale-110 transition-transform"
            >
              <Instagram size={20} />
            </a>
            <a
              href="mailto:support@zenbooks.vn"
              aria-label="Email"
              className="text-red-500 hover:scale-110 transition-transform"
            >
              <Mail size={20} />
            </a>
          </div>
        </div>
        <div>
          <h3 className="text-lg font-semibold text-blue-700 mb-3">
            Liên kết nhanh
          </h3>
          <ul className="space-y-2 text-sm">
            <li>
              <Link to="/" className="hover:text-blue-500 transition">
                Trang chủ
              </Link>
            </li>
            <li>
              <Link to="/products" className="hover:text-blue-500 transition">
                Sản phẩm
              </Link>
            </li>
            <li>
              <Link to="/about" className="hover:text-blue-500 transition">
                Giới thiệu
              </Link>
            </li>
            <li>
              <Link to="/contact" className="hover:text-blue-500 transition">
                Liên hệ
              </Link>
            </li>
          </ul>
        </div>
        <div>
          <h3 className="text-lg font-semibold text-blue-700 mb-3">Hỗ trợ</h3>
          <ul className="space-y-2 text-sm">
            <li>
              <Link to="#" className="hover:text-blue-500 transition">
                Chính sách đổi trả
              </Link>
            </li>
            <li>
              <Link to="#" className="hover:text-blue-500 transition">
                Chính sách bảo mật
              </Link>
            </li>
            <li>
              <Link to="#" className="hover:text-blue-500 transition">
                Câu hỏi thường gặp
              </Link>
            </li>
            <li>
              <Link to="#" className="hover:text-blue-500 transition">
                Hướng dẫn thanh toán
              </Link>
            </li>
          </ul>
        </div>
        <div>
          <h3 className="text-lg font-semibold text-blue-700 mb-3">Liên hệ</h3>
          <ul className="space-y-3 text-sm">
            <li className="flex items-start gap-2">
              <MapPin className="text-blue-500 mt-0.5" size={18} />
              <span>L36/16/13 Cư Xá Phú Lâm A, Quận Phú Lâm, TP.HCM</span>
            </li>
            <li className="flex items-center gap-2">
              <Phone className="text-blue-500" size={18} />
              <a
                href="tel:+84987654321"
                className="hover:text-blue-500 transition"
              >
                +84 798 036 970
              </a>
            </li>
            <li className="flex items-center gap-2">
              <Mail className="text-blue-500" size={18} />
              <a
                href="mailto:support@zenbooks.vn"
                className="hover:text-blue-500 transition"
              >
                support@zenbooks.vn
              </a>
            </li>
          </ul>
        </div>
      </div>

      <div className="border-t border-gray-200 py-4 text-center text-sm text-gray-500">
        © {new Date().getFullYear()} ZenBooks — All rights reserved.
      </div>
    </motion.footer>
  );
};

export default FooterUser;
