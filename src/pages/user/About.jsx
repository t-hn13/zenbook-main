// src/pages/user/About.jsx
import { motion } from "framer-motion";
import { BookOpen, Heart, Globe2 } from "lucide-react";
import { Link } from "react-router-dom";

const About = () => {
  return (
    <div className="flex flex-col">
      <motion.section
        initial={{ opacity: 0, y: -30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="relative bg-linear-to-r from-blue-100 via-blue-50 to-white text-center py-16 px-6"
      >
        <h1 className="text-4xl md:text-5xl font-extrabold text-blue-700 mb-4">
          Về ZenBooks
        </h1>
        <p className="text-gray-600 max-w-2xl mx-auto text-lg leading-relaxed">
          ZenBooks không chỉ là một cửa hàng sách – chúng tôi là nơi lan tỏa tri
          thức, kết nối cộng đồng yêu đọc và khơi gợi cảm hứng học tập mỗi ngày.
        </p>
      </motion.section>

      <motion.section
        initial={{ opacity: 0, y: 40 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6 }}
        className="max-w-5xl mx-auto px-6 py-16 text-center space-y-6"
      >
        <h2 className="text-3xl font-bold text-blue-700">
          Sứ mệnh của chúng tôi
        </h2>
        <p className="text-gray-600 leading-relaxed">
          ZenBooks được thành lập với mục tiêu đưa tri thức đến gần hơn với mọi
          người. Chúng tôi tin rằng mỗi cuốn sách là một hành trình khai mở tâm
          trí, giúp bạn phát triển bản thân và sống tốt hơn mỗi ngày.
        </p>
        <p className="text-gray-600 leading-relaxed">
          Với đội ngũ đam mê và tận tâm, ZenBooks không ngừng nỗ lực để mang đến
          trải nghiệm mua sắm sách thuận tiện, nhanh chóng và đầy cảm hứng — nơi
          mỗi người đọc đều cảm thấy được tôn trọng và truyền cảm hứng.
        </p>
      </motion.section>

      <motion.section
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 0.8 }}
        className="bg-blue-50 py-16"
      >
        <div className="max-w-6xl mx-auto px-6 text-center">
          <h2 className="text-3xl font-bold text-blue-700 mb-8">
            Giá trị cốt lõi
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <motion.div
              whileHover={{ scale: 1.05 }}
              className="bg-white rounded-xl shadow-md p-6 hover:shadow-lg transition-all"
            >
              <BookOpen className="text-blue-500 mx-auto mb-4" size={40} />
              <h3 className="text-lg font-semibold text-gray-800 mb-2">
                Tri thức
              </h3>
              <p className="text-gray-600 text-sm">
                Chúng tôi tin rằng tri thức là nền tảng của mọi sự phát triển
                bền vững.
              </p>
            </motion.div>

            <motion.div
              whileHover={{ scale: 1.05 }}
              className="bg-white rounded-xl shadow-md p-6 hover:shadow-lg transition-all"
            >
              <Heart className="text-pink-500 mx-auto mb-4" size={40} />
              <h3 className="text-lg font-semibold text-gray-800 mb-2">
                Chia sẻ
              </h3>
              <p className="text-gray-600 text-sm">
                Lan tỏa niềm yêu sách, giúp cộng đồng cùng phát triển qua từng
                trang đọc.
              </p>
            </motion.div>

            <motion.div
              whileHover={{ scale: 1.05 }}
              className="bg-white rounded-xl shadow-md p-6 hover:shadow-lg transition-all"
            >
              <Globe2 className="text-green-500 mx-auto mb-4" size={40} />
              <h3 className="text-lg font-semibold text-gray-800 mb-2">
                Kết nối
              </h3>
              <p className="text-gray-600 text-sm">
                Kết nối độc giả, tác giả và tri thức toàn cầu để tạo ra giá trị
                bền vững.
              </p>
            </motion.div>
          </div>
        </div>
      </motion.section>

      <motion.section
        initial={{ opacity: 0, scale: 0.95 }}
        whileInView={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.6 }}
        viewport={{ once: true }}
        className="py-16 text-center bg-linear-to-r from-blue-500 to-indigo-500 text-white"
      >
        <h2 className="text-3xl font-bold mb-4">
          Khám phá kho sách của ZenBooks ngay hôm nay!
        </h2>
        <p className="mb-8 text-white/90 max-w-2xl mx-auto">
          Hàng ngàn đầu sách đang chờ bạn khám phá — từ văn học, kỹ năng sống,
          kinh doanh đến giáo dục.
        </p>
        <Link
          to="/products"
          className="bg-white text-blue-600 font-semibold px-6 py-3 rounded-lg shadow-md hover:shadow-lg hover:bg-blue-50 transition-all"
        >
          Xem ngay
        </Link>
      </motion.section>
    </div>
  );
};

export default About;
