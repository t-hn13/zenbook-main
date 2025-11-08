// src/pages/user/Home.jsx
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { BookOpen, Truck, ShieldCheck, Star } from "lucide-react";

const Home = () => {
  const navigate = useNavigate();

  return (
    <div className="bg-gray-50 min-h-screen">
      <section
        className="relative bg-linear-to-r from-blue-500 via-indigo-500 to-purple-600 
                   text-white py-24 text-center overflow-hidden"
      >
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="max-w-3xl mx-auto px-4 relative z-10"
        >
          <h1 className="text-4xl md:text-5xl font-extrabold leading-tight">
            ZenBooks – Lan Tỏa Tri Thức, Nuôi Dưỡng Tâm Hồn
          </h1>
          <p className="mt-5 text-blue-100 text-lg leading-relaxed">
            Nơi khởi nguồn của tri thức, cảm hứng và niềm vui đọc sách mỗi ngày.
          </p>

          <button
            onClick={() => navigate("/products")}
            className="mt-8 bg-white text-blue-600 font-semibold px-8 py-3 
                       rounded-full shadow hover:bg-blue-50 transition cursor-pointer"
          >
            Khám phá ngay
          </button>
        </motion.div>

        <div
          className="absolute inset-0 
                     bg-[url('https://images.unsplash.com/photo-1524995997946-a1c2e315a42f')] 
                     bg-cover bg-center opacity-20"
        ></div>
      </section>

      <section className="max-w-6xl mx-auto px-4 py-20 text-center">
        <h2 className="text-2xl md:text-3xl font-bold text-gray-800 mb-12">
          Vì Sao Chọn ZenBooks?
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {[
            {
              icon: <BookOpen className="mx-auto text-blue-600" size={40} />,
              title: "Kho Sách Phong Phú",
              desc: "Hơn 10.000 đầu sách thuộc mọi lĩnh vực, từ học thuật đến đời sống.",
            },
            {
              icon: <Truck className="mx-auto text-blue-600" size={40} />,
              title: "Giao Hàng Nhanh",
              desc: "Dịch vụ vận chuyển toàn quốc, đảm bảo nhanh chóng và an toàn.",
            },
            {
              icon: <ShieldCheck className="mx-auto text-blue-600" size={40} />,
              title: "Chính Hãng 100%",
              desc: "Cam kết sản phẩm chính gốc, chất lượng được đảm bảo tuyệt đối.",
            },
            {
              icon: <Star className="mx-auto text-blue-600" size={40} />,
              title: "Được Tin Tưởng",
              desc: "Hàng ngàn độc giả trung thành, đánh giá cao và đồng hành mỗi ngày.",
            },
          ].map((item, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              className="bg-white p-6 rounded-xl shadow hover:shadow-lg transition"
            >
              {item.icon}
              <h3 className="mt-4 font-semibold text-gray-800 text-lg">
                {item.title}
              </h3>
              <p className="text-sm text-gray-600 mt-2 leading-relaxed">
                {item.desc}
              </p>
            </motion.div>
          ))}
        </div>
      </section>

      <section className="bg-linear-to-r from-blue-600 to-indigo-600 text-white py-16 text-center">
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-2xl md:text-3xl font-semibold mb-6"
        >
          Hãy bắt đầu hành trình tri thức cùng ZenBooks!
        </motion.h2>
        <motion.button
          onClick={() => navigate("/products")}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.97 }}
          className="bg-white text-blue-600 font-bold px-8 py-3 
                     rounded-full shadow hover:bg-blue-50 transition cursor-pointer"
        >
          Xem Sách Ngay
        </motion.button>
      </section>
    </div>
  );
};

export default Home;
