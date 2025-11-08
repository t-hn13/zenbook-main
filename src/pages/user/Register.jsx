// src/pages/user/Register.jsx
import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  registerUser,
  clearError,
  clearFlags,
} from "../../features/auth/authSlice"; // Đường dẫn tới các action trong authSlice
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Eye, EyeOff } from "lucide-react";

const schema = z.object({
  name: z.string().min(1, "Vui lòng nhập tên"),
  email: z.string().email("Email không hợp lệ. Chỉ chấp nhận Gmail."),
  password: z.string().min(1, "Mật khẩu tối thiểu 1 ký tự"),
});

const Register = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { error, registeredJustNow } = useSelector((s) => s.auth);

  const [lastSubmit, setLastSubmit] = useState(null);
  const [showPassword, setShowPassword] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm({
    resolver: zodResolver(schema),
    defaultValues: { name: "", email: "", password: "" },
  });

  const onSubmit = (values) => {
    setLastSubmit(values);
    dispatch(registerUser(values));
  };

  useEffect(() => {
    if (registeredJustNow) {
      reset({ name: "", email: "", password: "" });
      navigate("/login", { replace: true });
      dispatch(clearFlags());
    }
  }, [registeredJustNow, navigate, dispatch, reset]);

  useEffect(() => {
    return () => dispatch(clearError());
  }, [dispatch]);

  return (
    <motion.div
      className="max-w-md mx-auto px-4 py-10"
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
    >
      <h1 className="text-2xl font-bold text-blue-600 mb-6">Đăng ký</h1>

      {error && (
        <div className="mb-4 text-sm text-red-600 bg-red-50 p-3 rounded-lg shadow-sm">
          {error}
        </div>
      )}

      <form
        onSubmit={handleSubmit(onSubmit)}
        className="space-y-4 bg-white p-6 rounded-xl shadow"
        autoComplete="off"
      >
        <input
          type="text"
          name="fake-user"
          className="hidden"
          autoComplete="off"
        />
        <input
          type="password"
          name="fake-pass"
          className="hidden"
          autoComplete="new-password"
        />

        <div>
          <label className="block text-sm font-medium mb-1">Họ tên</label>
          <input
            type="text"
            {...register("name")}
            autoComplete="off"
            className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:ring-2 focus:ring-blue-400 outline-none"
            placeholder="Tên hiển thị"
          />
          {errors.name && (
            <p className="text-sm text-red-600 mt-1">{errors.name.message}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Gmail</label>
          <input
            type="email"
            {...register("email")}
            autoComplete="off"
            className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:ring-2 focus:ring-blue-400 outline-none"
            placeholder="ten.nguoidung@gmail.com"
          />
          {errors.email && (
            <p className="text-sm text-red-600 mt-1">{errors.email.message}</p>
          )}
        </div>

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
              title={showPassword ? "Ẩn mật khẩu" : "Hiện mật khẩu"}
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

        <motion.button
          type="submit"
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          className="w-full bg-linear-to-r from-blue-500 to-indigo-500 text-white py-2.5 rounded-lg font-semibold shadow cursor-pointer"
        >
          Đăng ký
        </motion.button>

        <p className="text-sm text-gray-600">
          Đã có tài khoản?{" "}
          <Link to="/login" className="text-blue-600 hover:underline">
            Đăng nhập
          </Link>
        </p>
      </form>
    </motion.div>
  );
};

export default Register;
