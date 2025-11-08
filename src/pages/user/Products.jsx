// src/pages/user/Products.jsx
import { useEffect, useState } from "react";
import { Link, useSearchParams, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { useDispatch } from "react-redux";
import { ShoppingCart, RotateCcw } from "lucide-react";
import Swal from "sweetalert2";

import { setProducts } from "../../features/products/productsSlice";
import { addToCartRedux } from "../../features/cart/cartSlice";

// ✅ Dùng các service đã chuẩn (đang chạy OK ở Admin)
import { getProductById, getProducts } from "../../services/productsApi";
import { addToCartServer } from "../../services/cartApi";
import { getCategories } from "../../services/categoryApi";
import { getBrands } from "../../services/brandApi";

const LIMIT = 12;

// ===== SweetAlert2 UI =====
const modal = Swal.mixin({
  buttonsStyling: false,
  heightAuto: false,
  scrollbarPadding: false,
  returnFocus: false,
  backdrop: "rgba(2,6,23,0.45)",
  customClass: {
    popup: "rounded-2xl shadow-2xl",
    title: "text-xl font-semibold text-slate-800",
    htmlContainer: "text-slate-600",
    confirmButton:
      "px-4 py-2 rounded-lg bg-blue-600 text-white font-medium hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-300",
    cancelButton:
      "px-4 py-2 rounded-lg border border-slate-300 text-slate-700 hover:bg-slate-50 ml-2",
  },
});

const toast = Swal.mixin({
  toast: true,
  position: "top-end",
  showConfirmButton: false,
  timer: 1400,
  timerProgressBar: true,
  heightAuto: false,
});

const Products = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const [searchParams, setSearchParams] = useSearchParams();
  const pageFromUrl = parseInt(searchParams.get("page") || "1", 10);

  const [category, setCategory] = useState(
    searchParams.get("categoryId") || ""
  );
  const [brand, setBrand] = useState(searchParams.get("brandId") || "");
  const [sort, setSort] = useState(searchParams.get("sort") || "default");

  const [categories, setCategories] = useState([]);
  const [brands, setBrands] = useState([]);

  const [page, setPage] = useState(pageFromUrl);
  const [loading, setLoading] = useState(true);
  const [allProducts, setAllProducts] = useState([]);
  const [totalProducts, setTotalProducts] = useState(0);

  // ===== Lấy categories & brands qua service (như Admin) =====
  useEffect(() => {
    const fetchCatsAndBrands = async () => {
      try {
        const [cats, brs] = await Promise.all([getCategories(), getBrands()]);
        const categoriesData = Array.isArray(cats) ? cats.slice() : [];
        const brandsData = Array.isArray(brs) ? brs.slice() : [];
        categoriesData.sort((a, b) => Number(a.id || 0) - Number(b.id || 0));
        brandsData.sort((a, b) => Number(a.id || 0) - Number(b.id || 0));
        setCategories(categoriesData);
        setBrands(brandsData);
      } catch (err) {
        console.error("Không tải được categories/brands:", err);
      }
    };
    fetchCatsAndBrands();
  }, []);

  // ===== Đồng bộ page từ URL =====
  useEffect(() => {
    const urlPage = parseInt(searchParams.get("page") || "1", 10);
    if (urlPage !== page) setPage(urlPage);
  }, [searchParams]);

  // ===== Đồng bộ URL theo filter/sort/page =====
  useEffect(() => {
    const params = {};
    if (page > 1) params.page = page;
    if (category) params.categoryId = category;
    if (brand) params.brandId = brand;
    if (sort && sort !== "default") params.sort = sort;
    setSearchParams(params);
  }, [page, category, brand, sort, setSearchParams]);

  // ===== Lấy tất cả sản phẩm qua service và lọc/sort client =====
  useEffect(() => {
    let cancelled = false;

    const fetchAll = async () => {
      try {
        setLoading(true);
        const list = await getProducts(); // ✅ service đang dùng instance api (ENV)
        const raw = Array.isArray(list) ? list : [];

        // Lọc theo category/brand nếu có
        let filtered = raw;
        if (category)
          filtered = filtered.filter(
            (p) => String(p.categoryId) === String(category)
          );
        if (brand)
          filtered = filtered.filter(
            (p) => String(p.brandId) === String(brand)
          );

        // Sắp xếp
        if (sort === "price-asc") {
          filtered.sort((a, b) => Number(a.price) - Number(b.price));
        } else if (sort === "price-desc") {
          filtered.sort((a, b) => Number(b.price) - Number(a.price));
        } else {
          filtered.sort((a, b) => Number(a.id) - Number(b.id));
        }

        if (!cancelled) {
          setAllProducts(filtered);
          setTotalProducts(filtered.length);
          setPage(1);
        }
      } catch (err) {
        if (!cancelled) console.error("Lỗi tải sản phẩm:", err);
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    fetchAll();
    return () => {
      cancelled = true;
    };
  }, [category, brand, sort]);

  // ===== Cắt trang & push vào Redux (giữ hành vi cũ) =====
  useEffect(() => {
    const start = (page - 1) * LIMIT;
    const current = allProducts.slice(start, start + LIMIT);
    dispatch(setProducts(current));
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [page, allProducts, dispatch]);

  const totalPages = Math.max(1, Math.ceil(totalProducts / LIMIT));
  const start = (page - 1) * LIMIT;
  const visibleProducts = allProducts.slice(start, start + LIMIT);

  const handleReset = () => {
    setCategory("");
    setBrand("");
    setSort("default");
    setPage(1);
    setSearchParams({});
  };

  // ===== Toast/Modal =====
  const showOutOfStock = () =>
    modal.fire({
      icon: "warning",
      title: "Hết hàng",
      html: "Sản phẩm đã hết hàng. Bạn vui lòng chọn sản phẩm khác nhé!",
      confirmButtonText: "Đóng",
    });

  const showAddSuccess = () =>
    toast.fire({
      icon: "success",
      title: "Đã thêm vào giỏ hàng",
    });

  const showAddError = (msg) =>
    modal.fire({
      icon: "error",
      title: "Không thể thêm vào giỏ",
      html: msg || "Đã xảy ra lỗi. Vui lòng thử lại.",
      confirmButtonText: "Đã hiểu",
    });

  const handleAddToCart = async (e, product) => {
    e.stopPropagation();
    try {
      const latest = await getProductById(product.id);
      if (Number(latest.stock) <= 0) {
        showOutOfStock();
        return;
      }
      await addToCartServer(latest);
      dispatch(addToCartRedux(latest));
      showAddSuccess();
    } catch (err) {
      const serverMsg =
        err?.response?.data?.message ||
        err?.message ||
        "Không thể thêm quá số lượng tồn kho!";
      showAddError(serverMsg);
      console.error(err);
    }
  };

  const getBrandName = (id) => {
    if (!id) return "—";
    const found = brands.find((b) => String(b.id) === String(id));
    return found ? found.name : `ID: ${id}`;
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-12">
      <h1 className="text-3xl font-bold text-center text-gray-800 mb-10">
        Tất Cả Sản Phẩm
      </h1>

      <div className="flex flex-wrap justify-center gap-3 mb-8">
        <select
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          className="border rounded-lg px-3 py-1.5 text-sm cursor-pointer"
        >
          <option value="">-- Lọc theo danh mục --</option>
          {categories.map((cat) => (
            <option key={cat.id} value={cat.id}>
              {cat.name}
            </option>
          ))}
        </select>

        <select
          value={brand}
          onChange={(e) => setBrand(e.target.value)}
          className="border rounded-lg px-3 py-1.5 text-sm cursor-pointer"
        >
          <option value="">-- Lọc theo tác giả --</option>
          {brands.map((b) => (
            <option key={b.id} value={b.id}>
              {b.name}
            </option>
          ))}
        </select>

        <select
          value={sort}
          onChange={(e) => setSort(e.target.value)}
          className="border rounded-lg px-3 py-1.5 text-sm cursor-pointer"
        >
          <option value="default">— Sắp xếp mặc định —</option>
          <option value="price-asc">Giá: Thấp → Cao</option>
          <option value="price-desc">Giá: Cao → Thấp</option>
        </select>

        <button
          onClick={handleReset}
          className="inline-flex items-center gap-2 px-3 py-1.5 text-sm rounded-lg border border-gray-300 hover:bg-gray-50 cursor-pointer"
        >
          <RotateCcw size={16} />
          Đặt lại
        </button>
      </div>

      {loading ? (
        <p className="text-center text-gray-500">Đang tải dữ liệu...</p>
      ) : (
        <>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 max-sm:grid-cols-1">
            {visibleProducts.map((p) => {
              const isOut = Number(p.stock) <= 0;
              const hasSale = p.sale?.active;
              const salePercent = hasSale ? Number(p.sale.percent) : 0;
              const salePrice = hasSale
                ? Math.round(Number(p.price) * (1 - salePercent / 100))
                : Number(p.price);

              return (
                <motion.div
                  key={p.id}
                  whileHover={{ y: -4 }}
                  onClick={() => navigate(`/product/${p.id}`)}
                  className="bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-md transition flex flex-col cursor-pointer"
                >
                  <div className="relative flex items-center justify-center bg-slate-50 h-48">
                    <img
                      src={p.image}
                      alt={p.title}
                      className="max-h-40 w-auto object-cover"
                    />
                    {hasSale && (
                      <span className="absolute top-3 left-3 bg-red-500 text-white text-xs font-semibold px-2 py-0.5 rounded-full shadow">
                        -{salePercent}%
                      </span>
                    )}
                  </div>

                  <div className="p-4 flex flex-col flex-1">
                    <h3 className="font-semibold text-gray-800 mb-0.5 line-clamp-2 min-h-10">
                      {p.title}
                    </h3>
                    <p className="text-sm text-gray-500 mb-2">
                      {getBrandName(p.brandId)}
                    </p>

                    <div className="mb-2 min-h-8">
                      {hasSale ? (
                        <div className="flex items-baseline gap-2">
                          <p className="text-red-600 font-bold text-lg leading-tight">
                            {salePrice.toLocaleString()}₫
                          </p>
                          <p className="text-gray-400 text-sm line-through leading-tight">
                            {Number(p.price).toLocaleString()}₫
                          </p>
                        </div>
                      ) : (
                        <p className="text-blue-600 font-bold text-lg leading-tight">
                          {Number(p.price).toLocaleString()}₫
                        </p>
                      )}
                    </div>

                    <p
                      className={`text-xs mb-3 ${
                        isOut ? "text-red-500" : "text-gray-500"
                      }`}
                    >
                      {isOut
                        ? "Hết hàng"
                        : `Còn lại: ${Number(
                            p.stock
                          ).toLocaleString()} sản phẩm`}
                    </p>

                    <div className="mt-auto flex gap-2">
                      <button
                        onClick={(e) => handleAddToCart(e, p)}
                        disabled={isOut}
                        className={`flex-1 flex items-center justify-center gap-1 py-1.5 rounded-md text-sm font-medium cursor-pointer ${
                          isOut
                            ? "bg-gray-300 text-gray-600 cursor-not-allowed"
                            : "bg-blue-600 text-white hover:bg-blue-700"
                        }`}
                      >
                        <ShoppingCart size={16} />
                        {isOut ? "Hết hàng" : "Thêm giỏ"}
                      </button>

                      <Link
                        to={`/product/${p.id}`}
                        onClick={(e) => e.stopPropagation()}
                        className="flex-1 text-center py-1.5 text-sm text-blue-600 border border-blue-600 rounded-md hover:bg-blue-50 transition font-medium"
                      >
                        Chi tiết
                      </Link>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>

          {/* Phân trang */}
          <div className="flex justify-center mt-10 flex-wrap gap-2">
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

            {[...Array(totalPages)].map((_, i) => (
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

          <p className="text-center text-gray-500 mt-4">
            Trang <span className="font-semibold text-blue-600">{page}</span> /{" "}
            {totalPages}
          </p>
        </>
      )}
    </div>
  );
};

export default Products;
