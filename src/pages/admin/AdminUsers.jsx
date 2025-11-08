// src/pages/admin/AdminUsers.jsx
import { useEffect, useState } from "react";
import { api } from "../../lib/axios";
import { Loader2, Trash2, Pencil } from "lucide-react";

const ROLE_BADGE = {
  admin: "bg-purple-100 text-purple-700",
  staff: "bg-blue-100 text-blue-700",
  user: "bg-slate-100 text-slate-700",
};

const ROLE_OPTIONS = ["admin", "staff", "user"];
const PAGE_LIMIT = 10; // ✅ 10 user / trang (giống AdminProducts)

const AdminUsers = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [changingId, setChangingId] = useState(null);
  const [deletingId, setDeletingId] = useState(null);

  // ===== PHÂN TRANG (client-side giống AdminProducts) =====
  const [page, setPage] = useState(1);
  const totalUsers = users.length;
  const totalPages = Math.max(1, Math.ceil(totalUsers / PAGE_LIMIT));
  const start = (page - 1) * PAGE_LIMIT;
  const currentUsers = users.slice(start, start + PAGE_LIMIT);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const res = await api.get("/users");
      const data = Array.isArray(res.data) ? res.data : [];

      // sort: ưu tiên createdAt (desc), fallback id (desc)
      const sorted = data.slice().sort((a, b) => {
        if (a.createdAt && b.createdAt) {
          return new Date(b.createdAt) - new Date(a.createdAt);
        }
        return String(b.id).localeCompare(String(a.id));
      });

      setUsers(sorted);
      setPage(1); // về trang 1 mỗi lần reload data (giống Products)
    } catch (err) {
      console.error("Không tải được users:", err);
      alert("Không tải được danh sách người dùng. Kiểm tra json-server.");
      setUsers([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  // Nếu xóa / thay đổi làm tổng trang giảm → kéo page về hợp lệ
  useEffect(() => {
    if (page > totalPages) {
      setPage(totalPages);
    }
  }, [totalPages, page]);

  const handleChangeRole = async (user, newRole) => {
    if (!user || !user.id) return;
    if (user.role === newRole) return;

    // Optimistic UI
    const prevRole = user.role;
    setUsers((prev) =>
      prev.map((u) => (u.id === user.id ? { ...u, role: newRole } : u))
    );

    try {
      setChangingId(user.id);
      const res = await api.patch(`/users/${user.id}`, { role: newRole });
      const updated = res.data;
      setUsers((prev) =>
        prev.map((u) => (u.id === user.id ? { ...u, ...updated } : u))
      );
    } catch (err) {
      console.error("Đổi quyền thất bại:", err);
      alert("Đổi quyền thất bại. Kiểm tra json-server.");
      // revert
      setUsers((prev) =>
        prev.map((u) => (u.id === user.id ? { ...u, role: prevRole } : u))
      );
    } finally {
      setChangingId(null);
    }
  };

  // 🟣 XOÁ USER + PHÁT TÍN HIỆU QUA localStorage
  const handleDelete = async (user) => {
    if (!user || !user.id) return;
    const ok = confirm(
      `Bạn có chắc muốn xoá user "${user.name || user.email}"?`
    );
    if (!ok) return;

    try {
      setDeletingId(user.id);
      await api.delete(`/users/${user.id}`);

      // Xoá khỏi bảng hiện tại (client-side)
      setUsers((prev) => {
        const next = prev.filter((u) => u.id !== user.id);
        // Sau khi xoá, nếu trang hiện tại rỗng và vẫn còn trang trước → lùi trang
        const nextTotalPages = Math.max(1, Math.ceil(next.length / PAGE_LIMIT));
        if ((page - 1) * PAGE_LIMIT >= next.length && page > 1) {
          setPage(nextTotalPages);
        }
        return next;
      });

      // 🔥 phát tín hiệu để các tab khác biết user này đã bị xoá
      localStorage.setItem(
        "force-logout",
        JSON.stringify({
          userId: String(user.id),
          at: Date.now(),
        })
      );
    } catch (err) {
      console.error("Xoá người dùng thất bại:", err);
      alert("Xoá người dùng thất bại. Kiểm tra json-server.");
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-semibold text-slate-800">
            Quản lý người dùng
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Tổng: {totalUsers} người dùng
          </p>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-slate-100 text-slate-600">
            <tr>
              <th className="px-3 py-2 text-left w-14">STT</th>
              <th className="px-3 py-2 text-left w-44">ID</th>
              <th className="px-3 py-2 text-left">Tên</th>
              <th className="px-3 py-2 text-left w-64">Email</th>
              <th className="px-3 py-2 text-left w-40">Quyền</th>
              <th className="px-3 py-2 text-left w-40">Ngày tạo</th>
              <th className="px-3 py-2 text-left w-32">Thao tác</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={7} className="py-10 text-center text-slate-400">
                  <div className="inline-flex items-center gap-2">
                    <Loader2 className="animate-spin" size={18} />
                    Đang tải người dùng...
                  </div>
                </td>
              </tr>
            ) : currentUsers.length === 0 ? (
              <tr>
                <td colSpan={7} className="py-10 text-center text-slate-400">
                  Chưa có người dùng nào.
                </td>
              </tr>
            ) : (
              currentUsers.map((u, index) => {
                const roleClass =
                  ROLE_BADGE[u.role] || "bg-slate-100 text-slate-700";
                return (
                  <tr key={u.id} className="border-t hover:bg-slate-50/70">
                    <td className="px-3 py-2 text-slate-500">
                      {(page - 1) * PAGE_LIMIT + index + 1}
                    </td>
                    <td className="px-3 py-2 font-mono text-xs text-slate-500">
                      {u.id}
                    </td>
                    <td className="px-3 py-2">
                      <p className="text-slate-800">
                        {u.name || u.fullname || "—"}
                      </p>
                    </td>
                    <td className="px-3 py-2">{u.email || "—"}</td>
                    <td className="px-3 py-2">
                      <div className="flex items-center gap-2">
                        <span
                          className={`px-2 py-1 rounded text-xs font-medium ${roleClass}`}
                        >
                          {u.role || "user"}
                        </span>
                        <select
                          value={u.role || "user"}
                          onChange={(e) => handleChangeRole(u, e.target.value)}
                          disabled={changingId === u.id}
                          className="text-xs border rounded px-1 py-0.5 cursor-pointer"
                        >
                          {ROLE_OPTIONS.map((r) => (
                            <option key={r} value={r}>
                              {r}
                            </option>
                          ))}
                        </select>
                      </div>
                    </td>
                    <td className="px-3 py-2 text-xs text-slate-500">
                      {u.createdAt
                        ? new Date(u.createdAt).toLocaleString("vi-VN")
                        : "—"}
                    </td>
                    <td className="px-3 py-2 space-x-2">
                      <button className="inline-flex items-center gap-1 text-blue-600 text-xs hover:underline cursor-pointer">
                        <Pencil size={14} /> Sửa
                      </button>
                      <button
                        onClick={() => handleDelete(u)}
                        disabled={deletingId === u.id}
                        className="inline-flex items-center gap-1 text-red-500 text-xs hover:underline disabled:opacity-50 cursor-pointer"
                      >
                        <Trash2 size={14} />
                        {deletingId === u.id ? "Đang xoá..." : "Xoá"}
                      </button>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* ===== Thanh phân trang (UI giống AdminProducts) ===== */}
      {!loading && totalPages > 1 && (
        <>
          <div className="flex justify-center mt-4 flex-wrap gap-2">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
              className={`px-3 py-1.5 rounded-md border text-sm ${
                page === 1
                  ? "text-gray-400 border-gray-200 cursor-not-allowed"
                  : "text-blue-600 border-blue-400 hover:bg-blue-50 cursor-pointer"
              }`}
            >
              ← Trước
            </button>

            {Array.from({ length: totalPages }).map((_, i) => (
              <button
                key={i}
                onClick={() => setPage(i + 1)}
                className={`px-3 py-1.5 rounded-md border text-sm ${
                  page === i + 1
                    ? "bg-blue-600 text-white border-blue-600"
                    : "text-blue-600 border-blue-400 hover:bg-blue-50 cursor-pointer"
                }`}
              >
                {i + 1}
              </button>
            ))}

            <button
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
              className={`px-3 py-1.5 rounded-md border text-sm ${
                page === totalPages
                  ? "text-gray-400 border-gray-200 cursor-not-allowed"
                  : "text-blue-600 border-blue-400 hover:bg-blue-50 cursor-pointer"
              }`}
            >
              Sau →
            </button>
          </div>

          <p className="text-center text-slate-500 text-sm">
            Trang <span className="font-semibold text-blue-600">{page}</span> /{" "}
            {totalPages}
          </p>
        </>
      )}
    </div>
  );
};

export default AdminUsers;
