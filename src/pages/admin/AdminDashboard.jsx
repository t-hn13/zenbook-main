// src/pages/admin/AdminDashboard.jsx
import { useEffect, useState } from "react";
import { getAdminStats } from "../../services/adminApi";

const REFRESH_MS = 5000;

const AdminDashboard = () => {
  const [stats, setStats] = useState({
    products: 0,
    orders: 0,
    users: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [lastUpdated, setLastUpdated] = useState(null);

  useEffect(() => {
    let isMounted = true;
    let timer;

    const fetchStats = async () => {
      try {
        const data = await getAdminStats();
        if (!isMounted) return;
        setStats(data);
        setError("");
        setLastUpdated(new Date());
        setLoading(false);
      } catch (err) {
        if (!isMounted) return;
        console.error("Lỗi lấy thống kê admin:", err);
        setError("Không lấy được số liệu từ server.");
        setLoading(false);
      }
    };

    fetchStats();

    timer = setInterval(fetchStats, REFRESH_MS);

    return () => {
      isMounted = false;
      clearInterval(timer);
    };
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4">
        <h2 className="text-xl font-semibold text-slate-800">
          Tổng quan hệ thống
        </h2>
        {lastUpdated && (
          <p className="text-xs text-slate-400">
            Cập nhật: {lastUpdated.toLocaleTimeString("vi-VN")}
          </p>
        )}
      </div>

      {error && (
        <div className="bg-red-50 text-red-600 text-sm px-4 py-2 rounded-lg border border-red-100">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white rounded-lg p-4 shadow-sm border">
          <p className="text-slate-500 text-sm">Sản phẩm</p>
          <p className="text-3xl font-bold text-slate-800 mt-2">
            {loading ? "…" : stats.products}
          </p>
          <p className="text-xs text-slate-400 mt-1">
            Lấy từ /products (json-server)
          </p>
        </div>

        <div className="bg-white rounded-lg p-4 shadow-sm border">
          <p className="text-slate-500 text-sm">Đơn hàng</p>
          <p className="text-3xl font-bold text-slate-800 mt-2">
            {loading ? "…" : stats.orders}
          </p>
          <p className="text-xs text-slate-400 mt-1">Lấy từ /orders</p>
        </div>

        <div className="bg-white rounded-lg p-4 shadow-sm border">
          <p className="text-slate-500 text-sm">Người dùng</p>
          <p className="text-3xl font-bold text-slate-800 mt-2">
            {loading ? "…" : stats.users}
          </p>
          <p className="text-xs text-slate-400 mt-1">Lấy từ /users</p>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
