// src/pages/user/Contact.jsx
import { motion } from "framer-motion";
import { Mail, Phone, MapPin } from "lucide-react";
import { useState } from "react";

const Contact = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    message: "",
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log("Dữ liệu gửi đi:", formData);
    alert("Cảm ơn bạn đã liên hệ! Chúng tôi sẽ phản hồi sớm nhất.");
    setFormData({ name: "", email: "", message: "" });
  };

  return (
    <motion.div
      className="max-w-6xl mx-auto px-4 py-12 flex flex-col md:flex-row gap-10 items-center"
      initial={{ opacity: 0, y: 40 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
    >
      <div className="flex-1 space-y-6">
        <h1 className="text-4xl font-extrabold text-blue-600">
          Liên hệ với ZenBooks
        </h1>
        <p className="text-gray-600">
          Chúng tôi luôn sẵn lòng lắng nghe ý kiến và hỗ trợ bạn. Hãy để lại tin
          nhắn hoặc liên hệ trực tiếp qua thông tin bên dưới.
        </p>

        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <Mail className="text-blue-500" />
            <span className="text-gray-700">support@zenbooks.vn</span>
          </div>
          <div className="flex items-center gap-3">
            <Phone className="text-blue-500" />
            <span className="text-gray-700">+84 798 036 970</span>
          </div>
          <div className="flex items-center gap-3">
            <MapPin className="text-blue-500" />
            <span className="text-gray-700">
              L36/16/13 Cư Xá Phú Lâm A, Quận Phú Lâm, TP.HCM
            </span>
          </div>
        </div>
      </div>

      <div className="flex-1 bg-white shadow-lg rounded-2xl p-8 space-y-6 border border-gray-100">
        <h2 className="text-2xl font-bold text-gray-800 mb-2">
          Gửi tin nhắn cho chúng tôi
        </h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Họ và tên
            </label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="Nhập họ tên của bạn"
              className="w-full px-4 py-2 rounded-lg border border-gray-200 
                         focus:ring-2 focus:ring-blue-400 outline-none transition-all"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Email
            </label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="you@example.com"
              className="w-full px-4 py-2 rounded-lg border border-gray-200 
                         focus:ring-2 focus:ring-blue-400 outline-none transition-all"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Tin nhắn
            </label>
            <textarea
              name="message"
              value={formData.message}
              onChange={handleChange}
              rows="4"
              placeholder="Nhập nội dung bạn muốn gửi..."
              className="w-full px-4 py-2 rounded-lg border border-gray-200 
                         focus:ring-2 focus:ring-blue-400 outline-none transition-all 
                         resize-none"
              required
            ></textarea>
          </div>

          <motion.button
            type="submit"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.98 }}
            className="w-full bg-linear-to-r from-blue-500 to-indigo-500 
                       text-white py-2.5 rounded-lg font-semibold shadow-md 
                       hover:shadow-lg transition-all"
          >
            Gửi ngay
          </motion.button>
        </form>
      </div>
    </motion.div>
  );
};

export default Contact;
