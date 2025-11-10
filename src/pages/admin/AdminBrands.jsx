import { useEffect, useState } from "react";
import {
  getBrands,
  createBrand,
  updateBrand,
  deleteBrand,
} from "../../services/brandApi";
import Swal from "sweetalert2"; // Thêm SweetAlert2

const PAGE_LIMIT = 10;

const AdminBrands = () => {
  const [brands, setBrands] = useState([]);
  const [loading, setLoading] = useState(true);
  const [newName, setNewName] = useState("");
  const [editingBrand, setEditingBrand] = useState(null);
  const [adding, setAdding] = useState(false);
  const [deletingId, setDeletingId] = useState(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [currentBrands, setCurrentBrands] = useState([]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const data = await getBrands();
      setBrands(data);
      const total = Math.ceil(data.length / PAGE_LIMIT);
      setTotalPages(total);
      const start = (page - 1) * PAGE_LIMIT;
      const current = data.slice(start, start + PAGE_LIMIT);
      setCurrentBrands(current);
    } catch (err) {
      console.error("Không lấy được danh sách tác giả:", err);
      Swal.fire({
        icon: "error",
        title: "Lỗi!",
        text: "Không lấy được danh sách tác giả.",
      });
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
      Swal.fire({
        icon: "warning",
        title: "Cảnh báo!",
        text: "Nhập tên tác giả đã!",
      });
      return;
    }
    try {
      setAdding(true);
      const created = await createBrand(name);
      setBrands((prev) => [...prev, created]);
      setNewName("");
    } catch (err) {
      console.error("Thêm tác giả lỗi:", err);
      Swal.fire({
        icon: "error",
        title: "Lỗi!",
        text: "Thêm tác giả thất bại.",
      });
    } finally {
      setAdding(false);
    }
  };

  const handleEdit = async (e) => {
    e.preventDefault();
    const name = newName.trim();
    if (!name) {
      Swal.fire({
        icon: "warning",
        title: "Cảnh báo!",
        text: "Nhập tên tác giả đã!",
      });
      return;
    }
    try {
      setAdding(true);
      const updated = await updateBrand(editingBrand.id, name);
      setBrands((prev) =>
        prev.map((b) => (b.id === editingBrand.id ? updated : b))
      );
      setEditingBrand(null);
      setNewName("");
    } catch (err) {
      console.error("Cập nhật tác giả lỗi:", err);
      Swal.fire({
        icon: "error",
        title: "Lỗi!",
        text: "Cập nhật tác giả thất bại.",
      });
    } finally {
      setAdding(false);
    }
  };

  const handleDelete = async (brand) => {
    if (!window.confirm(`Xoá tác giả "${brand.name}" ?`)) return;
    try {
      setDeletingId(brand.id);
      await deleteBrand(brand.id);
      setBrands((prev) => prev.filter((b) => b.id !== brand.id));
      Swal.fire({
        icon: "success",
        title: "Thành công!",
        text: `Đã xoá tác giả "${brand.name}" thành công.`,
      });
    } catch (err) {
      console.error("Xoá tác giả lỗi:", err);
      Swal.fire({
        icon: "error",
        title: "Lỗi!",
        text: "Xoá tác giả thất bại.",
      });
    } finally {
      setDeletingId(null);
    }
  };

  const handlePageChange = (newPage) => {
    if (newPage < 1 || newPage > totalPages) return;
    setPage(newPage);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold text-slate-800">
          Quản lý tác giả
        </h2>
      </div>
      <form
        onSubmit={editingBrand ? handleEdit : handleAdd}
        className="bg-white border rounded-lg p-4 flex flex-wrap gap-3 items-center"
      >
        <input
          value={newName}
          onChange={(e) => setNewName(e.target.value)}
          placeholder="Tên tác giả..."
          className="border rounded-md px-3 py-2 flex-1 min-w-[200px]"
        />
        <button
          type="submit"
          disabled={adding}
          className="bg-blue-600 text-white px-4 py-2 rounded-md text-sm hover:bg-blue-700 disabled:opacity-60 cursor-pointer"
        >
          {adding
            ? editingBrand
              ? "Đang sửa..."
              : "Đang thêm..."
            : editingBrand
            ? "Sửa tác giả"
            : "+ Thêm tác giả"}
        </button>
      </form>
      <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-slate-100 text-slate-600">
            <tr>
              <th className="px-3 py-2 text-left w-14">STT</th>
              <th className="px-3 py-2 text-left w-32">ID</th>
              <th className="px-3 py-2 text-left">Tên tác giả</th>
              <th className="px-3 py-2 text-left w-32">Thao tác</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={4} className="py-8 text-center text-slate-400">
                  Đang tải dữ liệu...
                </td>
              </tr>
            ) : brands.length === 0 ? (
              <tr>
                <td colSpan={4} className="py-8 text-center text-slate-400">
                  Chưa có tác giả nào.
                </td>
              </tr>
            ) : (
              currentBrands.map((brand, idx) => (
                <tr key={brand.id} className="border-t hover:bg-slate-50/60">
                  <td className="px-3 py-2 text-slate-500">{idx + 1}</td>
                  <td className="px-3 py-2 text-slate-800 font-mono">
                    {brand.id}
                  </td>
                  <td className="px-3 py-2">{brand.name}</td>
                  <td className="px-3 py-2 space-x-2">
                    <button
                      onClick={() => {
                        setEditingBrand(brand);
                        setNewName(brand.name);
                      }}
                      className="text-yellow-500 text-xs hover:underline cursor-pointer"
                    >
                      Sửa
                    </button>
                    <button
                      onClick={() => handleDelete(brand)}
                      disabled={deletingId === brand.id}
                      className="text-red-500 text-xs hover:underline disabled:opacity-40 cursor-pointer"
                    >
                      {deletingId === brand.id ? "Đang xoá..." : "Xoá"}
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

export default AdminBrands;
