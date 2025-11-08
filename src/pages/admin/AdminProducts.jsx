import { useEffect, useState, useMemo } from "react";
import {
  getProducts,
  deleteProduct,
  updateProduct,
  createProductAutoId,
} from "../../services/productsApi.js";
import { getCategories } from "../../services/categoryApi.js";
import { getBrands } from "../../services/brandApi.js"; // Import brandApi để lấy danh sách tác giả (brands)
import { motion, AnimatePresence } from "framer-motion";
import { Trash2, Pencil, Plus, Loader2, X } from "lucide-react";

const PAGE_LIMIT = 10;

const AdminProducts = () => {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [brands, setBrands] = useState([]); // Thêm state để lưu danh sách tác giả (brands)
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState(null);

  const [page, setPage] = useState(1);

  const [isEditOpen, setIsEditOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [saving, setSaving] = useState(false);

  const [isAddOpen, setIsAddOpen] = useState(false);
  const [newProduct, setNewProduct] = useState({
    title: "",
    price: 0,
    stock: 0,
    author: "",
    image: "",
    description: "",
    saleActive: false,
    salePercent: 0,
    categoryId: "",
    brandId: "", // Thêm brandId vào state
  });

  const fetchData = async () => {
    try {
      setLoading(true);
      const [prods, cats, brnds] = await Promise.all([
        getProducts(),
        getCategories(),
        getBrands(),
      ]); // Lấy danh sách brands
      const sortedProds = Array.isArray(prods)
        ? prods.slice().sort((a, b) => Number(a.id || 0) - Number(b.id || 0))
        : [];
      setProducts(sortedProds);
      setCategories(
        Array.isArray(cats)
          ? cats.slice().sort((a, b) => Number(a.id || 0) - Number(b.id || 0))
          : []
      );
      setBrands(brnds); // Lưu brands vào state
      setPage(1);
    } catch (err) {
      console.error("Không tải được sản phẩm hoặc danh mục:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleDelete = async (id, title) => {
    const ok = window.confirm(`Bạn chắc chắn muốn xoá sản phẩm: "${title}" ?`);
    if (!ok) return;

    try {
      setDeletingId(id);
      await deleteProduct(id);
      await fetchData();
    } catch (err) {
      console.error("Xoá thất bại:", err);
      alert("Không xoá được sản phẩm!");
    } finally {
      setDeletingId(null);
    }
  };

  const handleOpenEdit = (product) => {
    setEditingProduct({
      id: product.id,
      title: product.title || "",
      author: product.author || "",
      price: product.price || 0,
      stock: product.stock ?? 0,
      image: product.image || "",
      description: product.description || "",
      saleActive: product.sale?.active ?? false,
      salePercent: product.sale?.percent ?? 0,
      categoryId: product.categoryId ? String(product.categoryId) : "",
      brandId: product.brandId || "", // Thêm brandId vào phần edit
    });
    setIsEditOpen(true);
  };

  const finalPrice = useMemo(() => {
    if (!editingProduct) return 0;
    if (!editingProduct.saleActive) return Number(editingProduct.price || 0);
    const p = Number(editingProduct.price || 0);
    const percent = Number(editingProduct.salePercent || 0);
    return Math.round(p * (1 - percent / 100));
  }, [editingProduct]);

  const handleSaveEdit = async (e) => {
    e.preventDefault();
    if (!editingProduct) return;

    const payload = {
      title: editingProduct.title.trim(),
      author: editingProduct.author.trim(), // Có thể vẫn giữ để hiển thị tên tác giả (nếu cần)
      price: Number(editingProduct.price) || 0,
      stock: Number(editingProduct.stock) || 0,
      image: editingProduct.image.trim(),
      description: editingProduct.description.trim(),
      ...(editingProduct.categoryId
        ? { categoryId: editingProduct.categoryId }
        : {}),
      ...(editingProduct.brandId ? { brandId: editingProduct.brandId } : {}), // Lưu brandId thay vì author
      sale: editingProduct.saleActive
        ? {
            active: true,
            percent: Number(editingProduct.salePercent) || 0,
          }
        : null,
    };

    try {
      setSaving(true);
      const updated = await updateProduct(editingProduct.id, payload);
      setProducts((prev) =>
        prev.map((p) => (p.id === editingProduct.id ? updated : p))
      );
      setIsEditOpen(false);
      setEditingProduct(null);
    } catch (err) {
      console.error("Cập nhật thất bại:", err);
      alert("Không cập nhật được sản phẩm!");
    } finally {
      setSaving(false);
    }
  };

  const handleAddProduct = async (e) => {
    e.preventDefault();
    if (!newProduct.title.trim()) {
      alert("Nhập tên sách");
      return;
    }

    const payload = {
      title: newProduct.title.trim(),
      author: newProduct.author.trim(), // Có thể vẫn giữ, nếu bạn muốn có thể sử dụng để hiển thị ở nơi khác
      price: Number(newProduct.price) || 0,
      stock: Number(newProduct.stock) || 0,
      image: newProduct.image.trim(),
      description: newProduct.description.trim(),
      ...(newProduct.categoryId ? { categoryId: newProduct.categoryId } : {}),
      ...(newProduct.brandId ? { brandId: newProduct.brandId } : {}), // Sử dụng brandId thay vì author
      sale: newProduct.saleActive
        ? {
            active: true,
            percent: Number(newProduct.salePercent) || 0,
          }
        : null,
    };

    try {
      await createProductAutoId(payload);
      await fetchData();
      setIsAddOpen(false);
      setNewProduct({
        title: "",
        price: 0,
        stock: 0,
        image: "",
        description: "",
        saleActive: false,
        salePercent: 0,
        categoryId: "",
        brandId: "", // Reset brandId
      });
    } catch (err) {
      console.error("Thêm thất bại:", err);
      alert("Không thêm được sản phẩm!");
    }
  };

  const getCategoryName = (id) => {
    if (!id) return "—";
    const found = categories.find((c) => String(c.id) === String(id));
    return found ? found.name : `ID: ${id}`;
  };

  const getBrandName = (id) => {
    if (!id) return "—";
    const found = brands.find((b) => String(b.id) === String(id));
    return found ? found.name : `ID: ${id}`;
  };

  const totalProducts = products.length;
  const totalPages = Math.max(1, Math.ceil(totalProducts / PAGE_LIMIT));
  const start = (page - 1) * PAGE_LIMIT;
  const currentProducts = products.slice(start, start + PAGE_LIMIT);

  useEffect(() => {
    if (page > totalPages) {
      setPage(totalPages);
    }
  }, [totalPages, page]);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-semibold text-slate-800">
            Quản lý sản phẩm
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Tổng: {products.length} sản phẩm
          </p>
        </div>
        <button
          onClick={() => setIsAddOpen(true)}
          className="inline-flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-md text-sm hover:bg-blue-700 cursor-pointer"
        >
          <Plus size={16} />
          Thêm sản phẩm
        </button>
      </div>

      <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm min-w-[920px]">
            <thead className="bg-slate-100 text-slate-600">
              <tr>
                <th className="px-3 py-2 text-left w-12">STT</th>
                <th className="px-3 py-2 text-left w-14">ID</th>
                <th className="px-3 py-2 text-left">Tên sách</th>
                <th className="px-3 py-2 text-left w-40">Danh mục</th>
                <th className="px-3 py-2 text-left w-40">Tác giả</th>{" "}
                {/* Thêm cột tác giả */}
                <th className="px-3 py-2 text-left w-40">Giá</th>
                <th className="px-3 py-2 text-left w-20">Tồn kho</th>
                <th className="px-3 py-2 text-left w-48">Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={7} className="py-10 text-center text-slate-400">
                    <div className="inline-flex items-center gap-2">
                      <Loader2 className="animate-spin" size={18} />
                      Đang tải dữ liệu...
                    </div>
                  </td>
                </tr>
              ) : currentProducts.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-10 text-center text-slate-400">
                    Chưa có sản phẩm nào.
                  </td>
                </tr>
              ) : (
                currentProducts.map((p, index) => {
                  const hasSale = p.sale?.active;
                  const salePercent = p.sale?.percent || 0;
                  const final =
                    hasSale && p.price
                      ? Math.round(p.price * (1 - salePercent / 100))
                      : p.price;

                  return (
                    <motion.tr
                      key={p.id}
                      initial={{ opacity: 0, y: 6 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.15 }}
                      className="border-t hover:bg-slate-50/70"
                    >
                      <td className="px-3 py-2 text-slate-500">
                        {(page - 1) * PAGE_LIMIT + index + 1}
                      </td>
                      <td className="px-3 py-2 text-slate-500">{p.id}</td>
                      <td className="px-3 py-2">
                        <div className="flex items-center gap-3">
                          <img
                            src={p.image}
                            alt={p.title}
                            className="w-10 h-14 object-cover rounded border bg-slate-100"
                          />
                          <div>
                            <p className="font-medium text-slate-800">
                              {p.title}
                            </p>
                            <p className="text-xs text-slate-400">
                              {p.author || "—"}
                            </p>
                            {hasSale ? (
                              <p className="text-[10px] inline-flex px-1 py-0.5 rounded bg-red-100 text-red-600 mt-1">
                                Sale {salePercent}%
                              </p>
                            ) : null}
                          </div>
                        </div>
                      </td>

                      <td className="px-3 py-2 text-slate-700">
                        {getCategoryName(p.categoryId)}
                      </td>

                      <td className="px-3 py-2 text-slate-700">
                        {getBrandName(p.brandId)} {/* Hiển thị tác giả */}
                      </td>

                      <td className="px-3 py-2">
                        {hasSale ? (
                          <div className="flex flex-col gap-0.5">
                            <span className="text-red-500 font-semibold">
                              {final.toLocaleString("vi-VN")}₫
                            </span>
                            <span className="text-xs text-slate-400 line-through">
                              {Number(p.price || 0).toLocaleString("vi-VN")}₫
                            </span>
                          </div>
                        ) : (
                          <span className="text-slate-700">
                            {Number(p.price || 0).toLocaleString("vi-VN")}₫
                          </span>
                        )}
                      </td>
                      <td
                        className={`px-3 py-2 ${
                          p.stock <= 3 ? "text-red-500" : "text-slate-700"
                        }`}
                      >
                        {p.stock}
                      </td>
                      <td className="px-3 py-2">
                        <div className="flex gap-2">
                          <button
                            className="inline-flex items-center gap-1 px-3 py-1.5 rounded-md border text-xs text-slate-700 hover:bg-slate-100 cursor-pointer"
                            onClick={() => handleOpenEdit(p)}
                          >
                            <Pencil size={14} />
                            Sửa
                          </button>
                          <button
                            onClick={() => handleDelete(p.id, p.title)}
                            disabled={deletingId === p.id}
                            className="inline-flex items-center gap-1 px-3 py-1.5 rounded-md bg-red-50 text-xs text-red-600 hover:bg-red-100 disabled:opacity-50 cursor-pointer"
                          >
                            <Trash2 size={14} />
                            {deletingId === p.id ? "Đang xoá..." : "Xoá"}
                          </button>
                        </div>
                      </td>
                    </motion.tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
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
      {/* ===== MODAL THÊM ===== */}
      <AnimatePresence>
        {isAddOpen && (
          <motion.div
            className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center z-60"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              initial={{ y: 30, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 30, opacity: 0 }}
              className="bg-white rounded-xl shadow-lg w-full max-w-lg p-6 space-y-4"
            >
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold">Thêm sản phẩm</h3>
                <button
                  onClick={() => setIsAddOpen(false)}
                  className="text-slate-400 hover:text-slate-700"
                >
                  <X size={20} />
                </button>
              </div>

              <form onSubmit={handleAddProduct} className="space-y-3">
                <div>
                  <label className="text-xs text-slate-500">Tên sách *</label>
                  <input
                    value={newProduct.title}
                    onChange={(e) =>
                      setNewProduct((p) => ({ ...p, title: e.target.value }))
                    }
                    className="w-full border rounded-md px-3 py-2 text-sm"
                    required
                  />
                </div>

                <div>
                  <label className="text-xs text-slate-500">
                    Thuộc danh mục
                  </label>
                  <select
                    value={newProduct.categoryId}
                    onChange={(e) =>
                      setNewProduct((p) => ({
                        ...p,
                        categoryId: e.target.value,
                      }))
                    }
                    className="w-full border rounded-md px-3 py-2 text-sm bg-white"
                  >
                    <option value="">-- Chọn danh mục --</option>
                    {categories.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="text-xs text-slate-500">Tác giả</label>
                  <select
                    value={newProduct.brandId}
                    onChange={(e) =>
                      setNewProduct((p) => ({ ...p, brandId: e.target.value }))
                    }
                    className="w-full border rounded-md px-3 py-2 text-sm bg-white"
                  >
                    <option value="">-- Chọn tác giả --</option>
                    {brands.map((b) => (
                      <option key={b.id} value={b.id}>
                        {b.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="flex gap-3">
                  <div className="flex-1">
                    <label className="text-xs text-slate-500">Giá</label>
                    <input
                      type="number"
                      min="0"
                      value={newProduct.price}
                      onChange={(e) =>
                        setNewProduct((p) => ({ ...p, price: e.target.value }))
                      }
                      className="w-full border rounded-md px-3 py-2 text-sm"
                    />
                  </div>
                  <div className="w-28">
                    <label className="text-xs text-slate-500">Tồn kho</label>
                    <input
                      type="number"
                      min="0"
                      value={newProduct.stock}
                      onChange={(e) =>
                        setNewProduct((p) => ({ ...p, stock: e.target.value }))
                      }
                      className="w-full border rounded-md px-3 py-2 text-sm"
                    />
                  </div>
                </div>
                <div>
                  <label className="text-xs text-slate-500">Ảnh (URL)</label>
                  <input
                    value={newProduct.image}
                    onChange={(e) =>
                      setNewProduct((p) => ({ ...p, image: e.target.value }))
                    }
                    className="w-full border rounded-md px-3 py-2 text-sm"
                  />
                </div>
                <div>
                  <label className="text-xs text-slate-500">Mô tả</label>
                  <textarea
                    rows={3}
                    value={newProduct.description}
                    onChange={(e) =>
                      setNewProduct((p) => ({
                        ...p,
                        description: e.target.value,
                      }))
                    }
                    className="w-full border rounded-md px-3 py-2 text-sm"
                  />
                </div>

                <div className="flex items-center gap-2">
                  <input
                    id="new-sale"
                    type="checkbox"
                    checked={newProduct.saleActive}
                    onChange={(e) =>
                      setNewProduct((p) => ({
                        ...p,
                        saleActive: e.target.checked,
                      }))
                    }
                  />
                  <label htmlFor="new-sale" className="text-sm text-slate-600">
                    Áp dụng khuyến mãi
                  </label>
                  {newProduct.saleActive && (
                    <input
                      type="number"
                      min="0"
                      max="90"
                      value={newProduct.salePercent}
                      onChange={(e) =>
                        setNewProduct((p) => ({
                          ...p,
                          salePercent: e.target.value,
                        }))
                      }
                      className="w-20 border rounded-md px-2 py-1 text-sm"
                      placeholder="%"
                    />
                  )}
                </div>

                <div className="flex justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setIsAddOpen(false)}
                    className="px-4 py-2 rounded-md border text-sm text-slate-700 hover:bg-slate-50"
                  >
                    Hủy
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 rounded-md bg-blue-600 text-white text-sm hover:bg-blue-700"
                  >
                    Lưu
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ===== MODAL SỬA ===== */}
      <AnimatePresence>
        {isEditOpen && editingProduct && (
          <motion.div
            className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center z-60"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              initial={{ y: 30, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 30, opacity: 0 }}
              className="bg-white rounded-xl shadow-lg w-full max-w-lg p-6 space-y-4"
            >
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-lg font-semibold">
                  Sửa sản phẩm #{editingProduct.id}
                </h3>
                <button
                  onClick={() => {
                    setIsEditOpen(false);
                    setEditingProduct(null);
                  }}
                  className="text-slate-400 hover:text-slate-700 cursor-pointer"
                >
                  <X size={20} />
                </button>
              </div>

              <form onSubmit={handleSaveEdit} className="space-y-3">
                <div>
                  <label className="text-xs text-slate-500">Tên sách</label>
                  <input
                    value={editingProduct.title}
                    onChange={(e) =>
                      setEditingProduct((p) => ({
                        ...p,
                        title: e.target.value,
                      }))
                    }
                    className="w-full border rounded-md px-3 py-2 text-sm"
                    required
                  />
                </div>
                <div>
                  <label className="text-xs text-slate-500">Tác giả</label>
                  <select
                    value={editingProduct.brandId || ""}
                    onChange={(e) =>
                      setEditingProduct((p) => ({
                        ...p,
                        brandId: e.target.value,
                      }))
                    }
                    className="w-full border rounded-md px-3 py-2 text-sm bg-white"
                  >
                    <option value="">-- Chọn tác giả --</option>
                    {brands.map((b) => (
                      <option key={b.id} value={b.id}>
                        {b.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-xs text-slate-500">
                    Thuộc danh mục
                  </label>
                  <select
                    value={editingProduct.categoryId || ""}
                    onChange={(e) =>
                      setEditingProduct((p) => ({
                        ...p,
                        categoryId: e.target.value,
                      }))
                    }
                    className="w-full border rounded-md px-3 py-2 text-sm bg-white"
                  >
                    <option value="">-- Chọn danh mục --</option>
                    {categories.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="flex gap-3">
                  <div className="flex-1">
                    <label className="text-xs text-slate-500">Giá gốc</label>
                    <input
                      type="number"
                      min="0"
                      value={editingProduct.price}
                      onChange={(e) =>
                        setEditingProduct((p) => ({
                          ...p,
                          price: e.target.value,
                        }))
                      }
                      className="w-full border rounded-md px-3 py-2 text-sm"
                    />
                  </div>
                  <div className="w-28">
                    <label className="text-xs text-slate-500">Tồn kho</label>
                    <input
                      type="number"
                      min="0"
                      value={editingProduct.stock}
                      onChange={(e) =>
                        setEditingProduct((p) => ({
                          ...p,
                          stock: e.target.value,
                        }))
                      }
                      className="w-full border rounded-md px-3 py-2 text-sm"
                    />
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <input
                    id="edit-sale"
                    type="checkbox"
                    checked={editingProduct.saleActive}
                    onChange={(e) =>
                      setEditingProduct((p) => ({
                        ...p,
                        saleActive: e.target.checked,
                      }))
                    }
                  />
                  <label htmlFor="edit-sale" className="text-sm text-slate-600">
                    Áp dụng khuyến mãi
                  </label>
                  {editingProduct.saleActive && (
                    <input
                      type="number"
                      min="0"
                      max="90"
                      value={editingProduct.salePercent}
                      onChange={(e) =>
                        setEditingProduct((p) => ({
                          ...p,
                          salePercent: e.target.value,
                        }))
                      }
                      className="w-20 border rounded-md px-2 py-1 text-sm"
                      placeholder="%"
                    />
                  )}
                  {editingProduct.saleActive && (
                    <span className="text-xs text-slate-400">
                      Giá sau KM:{" "}
                      <b className="text-red-500">
                        {finalPrice.toLocaleString("vi-VN")}₫
                      </b>
                    </span>
                  )}
                </div>

                <div>
                  <label className="text-xs text-slate-500">Ảnh (URL)</label>
                  <input
                    value={editingProduct.image}
                    onChange={(e) =>
                      setEditingProduct((p) => ({
                        ...p,
                        image: e.target.value,
                      }))
                    }
                    className="w-full border rounded-md px-3 py-2 text-sm"
                  />
                </div>
                <div>
                  <label className="text-xs text-slate-500">Mô tả</label>
                  <textarea
                    rows={3}
                    value={editingProduct.description}
                    onChange={(e) =>
                      setEditingProduct((p) => ({
                        ...p,
                        description: e.target.value,
                      }))
                    }
                    className="w-full border rounded-md px-3 py-2 text-sm"
                  />
                </div>

                <div className="flex justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => {
                      setIsEditOpen(false);
                      setEditingProduct(null);
                    }}
                    className="px-4 py-2 rounded-md border text-sm text-slate-700 hover:bg-slate-50"
                  >
                    Hủy
                  </button>
                  <button
                    type="submit"
                    disabled={saving}
                    className="px-4 py-2 rounded-md bg-blue-600 text-white text-sm hover:bg-blue-700 disabled:opacity-50"
                  >
                    {saving ? "Đang lưu..." : "Lưu thay đổi"}
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default AdminProducts;
