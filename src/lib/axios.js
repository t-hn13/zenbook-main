// src/lib/axios.js
import axios from "axios";

/**
 * Lấy baseURL theo môi trường:
 * - Production (deploy): dùng VITE_API_URL (đặt trong .env.production)
 * - Development (local): fallback về http://localhost:3000
 */
const fromEnv = (import.meta?.env?.VITE_API_URL || "").trim();
const fallback = "http://localhost:3000";

// Loại bỏ dấu "/" cuối để tránh lỗi double slash khi ghép URL
const normalize = (url) => (url.endsWith("/") ? url.slice(0, -1) : url);

const baseURL = normalize(fromEnv || fallback);

export const api = axios.create({
  baseURL,
  timeout: 8000, // giữ nguyên timeout bạn đang dùng
});

// (Tùy chọn) Nếu Render "ngủ", lần gọi đầu có thể chậm. Bạn có thể mở retry 1 lần:
// api.interceptors.response.use(
//   (res) => res,
//   async (err) => {
//     const cfg = err.config;
//     if (!cfg || cfg.__retried) throw err;
//     // Lỗi mạng hoặc 5xx → đợi 2s rồi thử lại 1 lần
//     if (err.code === "ERR_NETWORK" || (err.response && err.response.status >= 500)) {
//       cfg.__retried = true;
//       await new Promise((r) => setTimeout(r, 2000));
//       return api.request(cfg);
//     }
//     throw err;
//   }
// );
