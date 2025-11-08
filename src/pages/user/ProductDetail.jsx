// src/pages/user/ProductDetail.jsx
import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { ShoppingCart } from "lucide-react";
import Swal from "sweetalert2";

import {
  addToCartRedux,
  setCart as setCartRedux,
} from "../../features/cart/cartSlice";
import { getProductById } from "../../services/productsApi";
import { addToCartServer, getCart } from "../../services/cartApi";

// ✅ SweetAlert2 mixins: UI đẹp, không phá layout
const modal = Swal.mixin({
  buttonsStyling: false,
  heightAuto: false, // không auto thay đổi chiều cao viewport
  scrollbarPadding: false, // không đẩy layout khi hiện/ẩn scrollbar
  returnFocus: false,
  backdrop: "rgba(2,6,23,0.45)", // #020617 ~ slate-950, mờ 45%
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

const ProductDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { items } = useSelector((state) => state.cart);
  const [product, setProduct] = useState(null);

  useEffect(() => {
    (async () => {
      const res = await getProductById(id);
      setProduct(res);
    })();
  }, [id]);

  if (!product)
    return <p className="text-center mt-10">Đang tải sản phẩm...</p>;

  const isOut = Number(product.stock) <= 0;

  const getEffectivePrice = (p) => {
    const base = Number(p.price || 0);
    const sale = p.sale;
    if (sale && sale.active && Number(sale.percent) > 0) {
      return Math.round(base * (1 - Number(sale.percent) / 100));
    }
    return base;
  };

  const isProductInCart = (productId) => {
    return items.some((item) => item.id === productId);
  };

  // ==== Popup helpers (đẹp & an toàn layout) ====
  const showOutOfStockPopup = () => {
    modal.fire({
      icon: "warning",
      title: "Hết hàng",
      html: "Sản phẩm đã hết hàng. Bạn vui lòng chọn sản phẩm khác nhé!",
      confirmButtonText: "Đóng",
    });
  };

  const showOverStockPopup = (msg) => {
    modal.fire({
      icon: "error",
      title: "Vượt quá số lượng tồn",
      html: msg || "Bạn đã thêm quá số lượng tồn kho cho sản phẩm này.",
      confirmButtonText: "Đã hiểu",
    });
  };

  const showSuccessToast = () => {
    toast.fire({
      icon: "success",
      title: "Đã thêm vào giỏ hàng",
    });
  };

  const handleAddToCart = async () => {
    try {
      const latest = await getProductById(product.id);
      if (Number(latest.stock) <= 0) {
        showOutOfStockPopup();
        return;
      }

      await addToCartServer(latest);
      const fresh = await getCart();
      dispatch(setCartRedux(fresh));

      // ✅ success dạng toast: gọn, không che layout
      showSuccessToast();
    } catch (err) {
      const serverMsg =
        err?.response?.data?.message ||
        err?.message ||
        "Không thể thêm quá số lượng tồn kho!";
      showOverStockPopup(serverMsg);
      console.error("Lỗi khi thêm giỏ:", err);
    }
  };

  const handleBuyNow = async () => {
    try {
      const latest = await getProductById(product.id);
      if (Number(latest.stock) <= 0) {
        showOutOfStockPopup();
        return;
      }
      navigate("/checkout", {
        state: {
          buyNow: {
            id: latest.id,
            title: latest.title,
            price: getEffectivePrice(latest),
            originalPrice: latest.price,
            image: latest.image,
            quantity: 1,
          },
        },
      });
    } catch (err) {
      console.error("Buy now error:", err);
      modal.fire({
        icon: "error",
        title: "Không thể chuyển sang thanh toán",
        html: "Vui lòng thử lại sau ít phút.",
        confirmButtonText: "Đóng",
      });
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-12 grid md:grid-cols-2 gap-8">
      <img
        src={product.image}
        alt={product.title}
        className="rounded-lg shadow-md object-cover w-full h-full"
      />

      <div>
        <h1 className="text-3xl font-bold text-gray-800 mb-2">
          {product.title}
        </h1>
        <p className="text-gray-600 mb-2">{product.author}</p>

        <div className="mb-3">
          {product.sale?.active ? (
            <div>
              <p className="text-red-600 text-3xl font-bold">
                {getEffectivePrice(product).toLocaleString()}₫
              </p>
              <p className="text-gray-400 text-lg line-through">
                {Number(product.price).toLocaleString()}₫
              </p>
              <p className="text-sm text-red-500 mt-1">
                Giảm {product.sale.percent}%
              </p>
            </div>
          ) : (
            <p className="text-blue-600 text-3xl font-bold">
              {Number(product.price).toLocaleString()}₫
            </p>
          )}
        </div>

        <p className="text-gray-700 mb-4">{product.description}</p>

        <p
          className={`text-sm mb-4 ${isOut ? "text-red-500" : "text-gray-600"}`}
        >
          {isOut
            ? "Hết hàng"
            : `Còn lại: ${Number(product.stock).toLocaleString()} sản phẩm`}
        </p>

        <div className="flex gap-4">
          <button
            onClick={handleAddToCart}
            disabled={isOut}
            className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-md text-white font-semibold transition cursor-pointer ${
              isOut
                ? "bg-gray-300 cursor-not-allowed"
                : "bg-blue-600 hover:bg-blue-700"
            }`}
          >
            <ShoppingCart size={18} />
            {isOut ? "Hết hàng" : "Thêm vào giỏ hàng"}
          </button>

          <button
            onClick={handleBuyNow}
            disabled={isOut}
            className={`flex-1 py-2 rounded-md border font-semibold transition cursor-pointer ${
              isOut
                ? "bg-gray-100 text-gray-500 cursor-not-allowed"
                : "border-blue-600 text-blue-600 hover:bg-blue-50"
            }`}
          >
            Mua ngay
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProductDetail;
