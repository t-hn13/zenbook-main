// src/pages/user/Cart.jsx
import { useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  getCart,
  updateCartItem,
  deleteCartItem,
} from "../../services/cartApi";
import { getProductById } from "../../services/productsApi";
import { setCart } from "../../features/cart/cartSlice";
import { Trash2, Plus, Minus } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";

const getEffectivePrice = (p) => {
  const base = Number(p?.price || 0);
  const sale = p?.sale;
  if (sale && sale.active && Number(sale.percent) > 0) {
    return Math.round(base * (1 - Number(sale.percent) / 100));
  }
  return base;
};

const Cart = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { items } = useSelector((s) => s.cart);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const data = await getCart();
        dispatch(setCart(data));
      } catch (err) {
        console.error("Lỗi tải giỏ hàng:", err);
      }
    })();
  }, [dispatch]);

  const [pricedItems, setPricedItems] = useState(items);
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const upgraded = await Promise.all(
          (items || []).map(async (it) => {
            try {
              const latest = await getProductById(it.id);
              const hasSale =
                !!latest?.sale?.active && Number(latest?.sale?.percent) > 0;
              const salePercent = Number(latest?.sale?.percent || 0);
              return {
                ...it,
                price: getEffectivePrice(latest),
                originalPrice: Number(
                  latest.price ?? it.originalPrice ?? it.price ?? 0
                ),
                hasSale,
                salePercent,
                title: latest.title || it.title,
                image: latest.image || it.image,
              };
            } catch {
              return {
                ...it,
                originalPrice: Number(it.originalPrice || it.price || 0),
                hasSale: Boolean(it.hasSale),
                salePercent: Number(it.salePercent || 0),
              };
            }
          })
        );
        if (!cancelled) setPricedItems(upgraded);
      } catch (e) {
        console.error("Không đồng bộ giá giỏ hàng:", e);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [JSON.stringify(items)]);

  const total = useMemo(
    () =>
      (pricedItems || []).reduce(
        (sum, i) => sum + Number(i.price || 0) * Number(i.quantity || 0),
        0
      ),
    [pricedItems]
  );

  const handleIncrease = async (item) => {
    try {
      const product = await getProductById(item.id);
      if (item.quantity >= (product.stock ?? 0)) {
        alert(`Tối đa ${product.stock} sản phẩm có thể thêm!`);
        return;
      }
      const newQty = item.quantity + 1;
      await updateCartItem(item.id, newQty);
      const updated = await getCart();
      dispatch(setCart(updated));
    } catch (err) {
      console.error("Lỗi tăng số lượng:", err);
    }
  };

  const handleDecrease = async (item) => {
    try {
      if (item.quantity === 1) {
        const keep = window.confirm(
          "Số lượng không thể nhỏ hơn 1.\nBạn có muốn TIẾP TỤC mua sản phẩm này không?\n\nOK = Giữ lại (1)\nCancel = Xoá khỏi giỏ"
        );
        if (keep) {
          return;
        }
        await deleteCartItem(item.id);
        const updated = await getCart();
        dispatch(setCart(updated));
        return;
      }
      const newQty = item.quantity - 1;
      await updateCartItem(item.id, newQty);
      const updated = await getCart();
      dispatch(setCart(updated));
    } catch (err) {
      console.error("Lỗi giảm số lượng:", err);
    }
  };

  const handleRemove = async (item) => {
    try {
      setLoading(true);
      await deleteCartItem(item.id);
      const updated = await getCart();
      dispatch(setCart(updated));
    } catch (err) {
      console.error("Lỗi xóa sản phẩm:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleCheckout = () => {
    if (!pricedItems.length) {
      alert("Giỏ hàng của bạn đang trống!");
      return;
    }
    navigate("/checkout");
  };

  if (!pricedItems.length)
    return (
      <div className="text-center py-16">
        <h2 className="text-2xl font-bold text-gray-700 mb-3">
          Giỏ hàng trống
        </h2>
        <p className="text-gray-500 mb-5">
          Hãy thêm một vài cuốn sách yêu thích vào giỏ nhé
        </p>
        <Link
          to="/products"
          className="bg-blue-600 text-white px-5 py-2 rounded-md hover:bg-blue-700 transition"
        >
          Xem sản phẩm
        </Link>
      </div>
    );

  return (
    <div className="max-w-6xl mx-auto px-4 py-10">
      <h1 className="text-3xl font-bold text-gray-800 mb-8 text-center">
        Giỏ Hàng Của Bạn
      </h1>

      <div className="grid md:grid-cols-3 gap-6">
        <div className="md:col-span-2 bg-white rounded-lg shadow p-4 divide-y">
          {pricedItems.map((item) => {
            const qty = Number(item.quantity || 1);
            const unit = Number(item.price || 0);
            const original = Number(item.originalPrice || unit);
            const hasSale = Boolean(item.hasSale);
            const percent = Number(item.salePercent || 0);
            const sub = qty * unit;

            return (
              <div
                key={item.id}
                className="flex items-center justify-between py-4 gap-4"
              >
                <div className="flex items-center gap-4 min-w-0">
                  {item.image ? (
                    <img
                      src={item.image}
                      alt={item.title}
                      className="w-20 h-24 object-cover rounded-lg border bg-slate-100 shrink-0"
                      onError={(e) => (e.currentTarget.style.display = "none")}
                    />
                  ) : (
                    <div className="w-20 h-24 rounded-lg border bg-slate-100 text-[10px] text-slate-400 flex items-center justify-center shrink-0">
                      No image
                    </div>
                  )}

                  <div className="min-w-0">
                    <h3 className="font-semibold text-gray-800 truncate">
                      {item.title}
                    </h3>

                    <div className="flex items-center gap-2 text-sm mt-0.5">
                      {hasSale ? (
                        <>
                          <span className="text-red-600 font-semibold">
                            {unit.toLocaleString("vi-VN")}₫
                          </span>
                          <span className="line-through text-slate-400">
                            {original.toLocaleString("vi-VN")}₫
                          </span>
                          <span className="px-1.5 py-0.5 rounded bg-red-100 text-red-600 text-xs font-semibold">
                            -{percent}%
                          </span>
                        </>
                      ) : (
                        <span className="text-slate-700">
                          {unit.toLocaleString("vi-VN")}₫
                        </span>
                      )}
                    </div>

                    <p className="text-xs text-slate-500 mt-0.5">× {qty}</p>
                    <p className="text-xs text-slate-500">
                      Thành tiền:{" "}
                      <b className="text-slate-800">
                        {sub.toLocaleString("vi-VN")}₫
                      </b>
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <button
                    onClick={() => handleDecrease(item)}
                    disabled={loading}
                    className="p-2 border rounded hover:bg-gray-50 cursor-pointer"
                  >
                    <Minus size={16} />
                  </button>
                  <span className="font-medium text-gray-700">
                    {item.quantity}
                  </span>
                  <button
                    onClick={() => handleIncrease(item)}
                    disabled={loading}
                    className="p-2 border rounded hover:bg-gray-50 cursor-pointer"
                  >
                    <Plus size={16} />
                  </button>

                  <button
                    onClick={() => handleRemove(item)}
                    disabled={loading}
                    className="ml-4 text-red-500 hover:text-red-700 cursor-pointer"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        <div className="bg-white rounded-lg shadow p-6 h-fit">
          <h2 className="text-lg font-bold text-gray-800 mb-4">
            Tóm tắt đơn hàng
          </h2>

          <ul className="mb-3 space-y-2 text-sm text-slate-600">
            {pricedItems.map((i) => {
              const qty = Number(i.quantity || 1);
              const unit = Number(i.price || 0);
              const hasSale = Boolean(i.hasSale);
              const original = Number(i.originalPrice || unit);
              const percent = Number(i.salePercent || 0);

              return (
                <li key={i.id} className="flex justify-between gap-3">
                  <span className="truncate">
                    {i.title} × {qty}
                  </span>
                  <span className="flex items-center gap-2 whitespace-nowrap">
                    {hasSale ? (
                      <>
                        <b className="text-red-600">
                          {unit.toLocaleString("vi-VN")}₫
                        </b>
                        <span className="line-through text-slate-400">
                          {original.toLocaleString("vi-VN")}₫
                        </span>
                        <span className="px-1 py-0.5 rounded bg-red-100 text-red-600 text-[11px]">
                          -{percent}%
                        </span>
                      </>
                    ) : (
                      <b>{unit.toLocaleString("vi-VN")}₫</b>
                    )}
                  </span>
                </li>
              );
            })}
          </ul>

          <div className="flex justify-between text-gray-700 mb-3">
            <span>Tổng cộng:</span>
            <span className="font-semibold text-blue-600">
              {total.toLocaleString("vi-VN")}₫
            </span>
          </div>
          <button
            onClick={handleCheckout}
            disabled={!pricedItems.length}
            className="w-full bg-blue-600 text-white py-2 rounded-md font-semibold hover:bg-blue-700 transition"
          >
            Thanh toán
          </button>
        </div>
      </div>
    </div>
  );
};

export default Cart;
