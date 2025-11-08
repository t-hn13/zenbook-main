import { useEffect, useState } from "react";
import {
  getCategories,
  createCategory,
  deleteCategory,
} from "../../services/categoryApi";

const PAGE_LIMIT = 10; // Hiển thị 10 danh mục mỗi trang

const AdminCategories = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [newName, setNewName] = useState("");
  const [adding, setAdding] = useState(false);
  const [deletingId, setDeletingId] = useState(null);

  // Phân trang
  const [page, setPage] = useState(1); // Trang hiện tại
  const [totalPages, setTotalPages] = useState(1); // Tổng số trang
  const [currentCategories, setCurrentCategories] = useState([]); // Các danh mục hiển thị hiện tại

  const fetchData = async () => {
    try {
      setLoading(true);
      const data = await getCategories();
      const sorted = (data || []).sort(
        (a, b) => Number(a.id || 0) - Number(b.id || 0)
      );
      setCategories(sorted);

      // Tính số trang
      const total = Math.ceil(sorted.length / PAGE_LIMIT);
      setTotalPages(total);

      // Cắt danh sách các danh mục để chỉ hiển thị 10 danh mục mỗi trang
      const start = (page - 1) * PAGE_LIMIT;
      const current = sorted.slice(start, start + PAGE_LIMIT);
      setCurrentCategories(current);
    } catch (err) {
      console.error("Không lấy được danh mục:", err);
      alert("Không lấy được danh mục. Kiểm tra json-server nhé.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [page]);

  const handleAdd = async (e) => {
    e.preventDefault();
    const name = newName.trim();
    if (!name) {
      alert("Nhập tên danh mục đã!");
      return;
    }

    try {
      setAdding(true);
      const created = await createCategory({ name });
      setCategories((prev) =>
        [...prev, created].sort((a, b) => Number(a.id || 0) - Number(b.id || 0))
      );
      setNewName("");
    } catch (err) {
      console.error("Thêm danh mục lỗi:", err);
      alert("Thêm danh mục thất bại");
    } finally {
      setAdding(false);
    }
  };

  const handleDelete = async (cat) => {
    if (!window.confirm(`Xoá danh mục "${cat.name}" ?`)) return;
    try {
      setDeletingId(cat.id);
      await deleteCategory(cat.id);
      setCategories((prev) =>
        prev
          .filter((c) => c.id !== cat.id)
          .sort((a, b) => Number(a.id || 0) - Number(b.id || 0))
      );
    } catch (err) {
      console.error("Xoá danh mục lỗi:", err);
      alert("Xoá thất bại (có thể danh mục đang được sản phẩm dùng)");
    } finally {
      setDeletingId(null);
    }
  };

  // Handle pagination: chuyển trang
  const handlePageChange = (newPage) => {
    if (newPage < 1 || newPage > totalPages) return;
    setPage(newPage);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold text-slate-800">
          Quản lý danh mục
        </h2>
      </div>

      {/* Form Thêm hoặc Sửa */}
      <form
        onSubmit={handleAdd}
        className="bg-white border rounded-lg p-4 flex flex-wrap gap-3 items-center"
      >
        <input
          value={newName}
          onChange={(e) => setNewName(e.target.value)}
          placeholder="Tên danh mục mới..."
          className="border rounded-md px-3 py-2 flex-1 min-w-[200px]"
        />
        <button
          type="submit"
          disabled={adding}
          className="bg-blue-600 text-white px-4 py-2 rounded-md text-sm hover:bg-blue-700 disabled:opacity-60 cursor-pointer"
        >
          {adding ? "Đang thêm..." : "+ Thêm danh mục"}
        </button>
      </form>

      {/* Table danh sách danh mục */}
      <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-slate-100 text-slate-600">
            <tr>
              <th className="px-3 py-2 text-left w-14">STT</th>
              <th className="px-3 py-2 text-left w-32">ID</th>
              <th className="px-3 py-2 text-left">Tên danh mục</th>
              <th className="px-3 py-2 text-left w-32">Thao tác</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={4} className="py-8 text-center text-slate-400">
                  Đang tải danh mục...
                </td>
              </tr>
            ) : categories.length === 0 ? (
              <tr>
                <td colSpan={4} className="py-8 text-center text-slate-400">
                  Chưa có danh mục nào.
                </td>
              </tr>
            ) : (
              currentCategories.map((cat, idx) => (
                <tr key={cat.id} className="border-t hover:bg-slate-50/60">
                  <td className="px-3 py-2 text-slate-500">{idx + 1}</td>
                  <td className="px-3 py-2 text-slate-800 font-mono">
                    {cat.id}
                  </td>
                  <td className="px-3 py-2">{cat.name}</td>
                  <td className="px-3 py-2 space-x-2">
                    <button
                      onClick={() => handleDelete(cat)}
                      disabled={deletingId === cat.id}
                      className="text-red-500 text-xs hover:underline disabled:opacity-40 cursor-pointer"
                    >
                      {deletingId === cat.id ? "Đang xoá..." : "Xoá"}
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

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

export default AdminCategories;
