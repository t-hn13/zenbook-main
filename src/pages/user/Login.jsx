// src/pages/user/Login.jsx
import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { loginUser, clearError } from "../../features/auth/authSlice";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Eye, EyeOff } from "lucide-react";

// Định nghĩa luật/điều kiện của form bằng zod
const schema = z.object({
  email: z.string().email("Email không hợp lệ"),
  password: z.string().min(1, "Mật khẩu không được để trống"),
});

const Login = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const { currentUser, error } = useSelector((s) => s.auth);

  const [showPassword, setShowPassword] = useState(false);

  // Khởi tạo form
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm({
    resolver: zodResolver(schema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  useEffect(() => {
    reset({ email: "", password: "" });
  }, [reset, location]);

  // Khi bấm nút Đăng nhập
  const onSubmit = (values) => {
    dispatch(loginUser(values));
  };

  // Nếu đăng nhập thành công → điều hướng về trang chủ
  useEffect(() => {
    if (currentUser) navigate("/");
  }, [currentUser, navigate]);

  // Xoá lỗi cũ khi rời trang
  useEffect(
    () => () => {
      dispatch(clearError());
    },
    [dispatch]
  );

  return (
    <motion.div
      className="max-w-md mx-auto px-4 py-10"
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
    >
      <h1 className="text-2xl font-bold text-blue-600 mb-6">Đăng nhập</h1>

      {/* nếu có lỗi từ redux gửi xuống thì hiện ở đây */}
      {error && (
        <div className="mb-4 text-sm text-red-600 bg-red-50 p-3 rounded-lg shadow-sm">
          {error}
        </div>
      )}

      {/* form chính */}
      <form
        onSubmit={handleSubmit(onSubmit)}
        className="space-y-4 bg-white p-6 rounded-xl shadow"
        autoComplete="off"
      >
        <input
          type="text"
          name="fake-user"
          className="hidden"
          autoComplete="username"
        />
        <input
          type="password"
          name="fake-pass"
          className="hidden"
          autoComplete="new-password"
        />

        {/* Email */}
        <div>
          <label className="block text-sm font-medium mb-1">Email</label>
          <input
            type="email"
            {...register("email")}
            autoComplete="off"
            className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:ring-2 focus:ring-blue-400 outline-none"
            placeholder="you@gmail.com"
          />
          {errors.email && (
            <p className="text-sm text-red-600 mt-1">{errors.email.message}</p>
          )}
        </div>

        {/* Mật khẩu + nút con mắt */}
        <div>
          <label className="block text-sm font-medium mb-1">Mật khẩu</label>
          <div className="relative">
            <input
              type={showPassword ? "text" : "password"}
              {...register("password")}
              autoComplete="new-password"
              className="w-full px-4 py-2 pr-11 rounded-lg border border-gray-200 focus:ring-2 focus:ring-blue-400 outline-none"
              placeholder="••••••"
            />
            <button
              type="button"
              onClick={() => setShowPassword((p) => !p)}
              className="absolute inset-y-0 right-2 flex items-center justify-center w-8 h-8 my-auto rounded-md hover:bg-gray-100 text-gray-500 cursor-pointer"
              aria-label={showPassword ? "Ẩn mật khẩu" : "Hiện mật khẩu"}
            >
              {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>
          {errors.password && (
            <p className="text-sm text-red-600 mt-1">
              {errors.password.message}
            </p>
          )}
        </div>

        {/* nút submit */}
        <motion.button
          type="submit"
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          className="w-full bg-linear-to-r from-blue-500 to-indigo-500 text-white py-2.5 rounded-lg font-semibold shadow cursor-pointer"
        >
          Đăng nhập
        </motion.button>

        <p className="text-sm text-gray-600">
          Chưa có tài khoản?{" "}
          <Link
            to="/register"
            className="text-blue-600 hover:underline cursor-pointer"
          >
            Đăng ký
          </Link>
        </p>
      </form>
    </motion.div>
  );
};

export default Login;
