// src/pages/user/CheckOut.jsx
import { useEffect, useMemo, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { createOrderAndUpdateStock, clearCart } from "../../services/orderApi";
import { getCart } from "../../services/cartApi";
import { getProductById } from "../../services/productsApi";
import { setCart } from "../../features/cart/cartSlice";
import { useNavigate, useLocation } from "react-router-dom";

const CheckOut = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();

  const { items } = useSelector((s) => s.cart);
  const { currentUser } = useSelector((s) => s.auth);

  const buyNow = location.state?.buyNow || null;

  const [userInfo, setUserInfo] = useState({
    name: "",
    email: "",
    address: "",
    phone: "",
  });

  const [paymentMethod, setPaymentMethod] = useState("cod");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    (async () => {
      const data = await getCart();
      dispatch(setCart(data));
    })();
  }, [dispatch]);

  useEffect(() => {
    if (currentUser) {
      setUserInfo({
        name: currentUser.name || "",
        email: currentUser.email || "",
        address: "",
        phone: "",
      });
    } else {
      setUserInfo({ name: "", email: "", address: "", phone: "" });
    }
  }, [currentUser]);

  const handleChange = (e) =>
    setUserInfo({ ...userInfo, [e.target.name]: e.target.value });

  const handlePhoneChange = (e) => {
    const onlyDigits = e.target.value.replace(/\D/g, "");
    setUserInfo((prev) => ({ ...prev, phone: onlyDigits.slice(0, 11) }));
  };

  const getEffectivePrice = (p) => {
    const base = Number(p.price || 0);
    const sale = p.sale;
    if (sale && sale.active && Number(sale.percent) > 0) {
      return Math.round(base * (1 - Number(sale.percent) / 100));
    }
    return base;
  };

  const baseItems = useMemo(() => (buyNow ? [buyNow] : items), [buyNow, items]);

  const [pricedItems, setPricedItems] = useState(baseItems);
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const upgraded = await Promise.all(
          baseItems.map(async (it) => {
            try {
              const latest = await getProductById(it.id);
              const hasSale =
                !!latest?.sale?.active && Number(latest?.sale?.percent) > 0;
              const salePercent = Number(latest?.sale?.percent || 0);

              return {
                ...it,
                price: getEffectivePrice(latest),
                originalPrice: Number(
                  latest.price || it.originalPrice || it.price || 0
                ),
                salePercent,
                hasSale,
                title: latest.title || it.title,
                image: latest.image || it.image,
              };
            } catch {
              return {
                ...it,
                originalPrice: Number(it.originalPrice || it.price || 0),
                salePercent: Number(it.salePercent || 0),
                hasSale: Boolean(it.hasSale),
              };
            }
          })
        );
        if (!cancelled) setPricedItems(upgraded);
      } catch {}
    })();
    return () => {
      cancelled = true;
    };
  }, [JSON.stringify(baseItems)]);

  const total = pricedItems.reduce(
    (sum, i) => sum + Number(i.price || 0) * Number(i.quantity || 1),
    0
  );

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!pricedItems.length) {
      alert("Giỏ hàng trống!");
      return;
    }

    const name = userInfo.name.trim();
    const email = userInfo.email.trim();
    const address = userInfo.address.trim();
    if (!name) return alert("Vui lòng nhập họ tên.");
    const emailValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
    if (!emailValid) return alert("Email không hợp lệ.");
    if (!address) return alert("Vui lòng nhập địa chỉ giao hàng!");

    const digitsOnly = (userInfo.phone || "").replace(/\D/g, "");
    if (!/^0\d{9,10}$/.test(digitsOnly)) {
      alert("Số điện thoại phải bắt đầu bằng 0 và có 10–11 chữ số.");
      return;
    }

    try {
      setLoading(true);
      const PAYMENT_LABELS = {
        cod: "Thanh toán khi nhận hàng (COD)",
        pay_now: "Thanh toán khi đặt hàng",
      };

      const orderData = {
        id: Date.now().toString(),
        customerId: currentUser?.id || `guest-${Date.now()}`,
        customerName: currentUser?.name || name,
        customerEmail: currentUser?.email || email,
        items: pricedItems,
        total,
        address,
        phone: digitsOnly,
        createdAt: new Date().toISOString(),
        status: "Đang xử lý",
        paymentMethod,
        paymentMethodLabel: PAYMENT_LABELS[paymentMethod],
      };

      await createOrderAndUpdateStock(orderData);
      await clearCart();
      dispatch(setCart([]));

      setUserInfo({ name: "", email: "", address: "", phone: "" });

      navigate("/checkout-success", { state: { order: orderData } });
    } catch (err) {
      console.error("Lỗi thanh toán:", err);
      alert("Không thể hoàn tất thanh toán!");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto px-4 py-12">
      <h1 className="text-3xl font-bold text-center text-gray-800 mb-10">
        Thanh Toán
      </h1>

      <div className="grid md:grid-cols-2 gap-8">
        <form
          onSubmit={handleSubmit}
          className="bg-white shadow rounded-lg p-6 space-y-4"
        >
          <h2 className="text-lg font-semibold text-gray-700 mb-4">
            Thông tin giao hàng
          </h2>

          <input
            name="name"
            value={userInfo.name}
            onChange={handleChange}
            placeholder="Họ và tên"
            className="w-full border rounded-md p-2"
            required
          />
          <input
            name="email"
            type="email"
            value={userInfo.email}
            onChange={handleChange}
            placeholder="Email"
            className="w-full border rounded-md p-2"
            required
          />
          <input
            name="phone"
            value={userInfo.phone}
            onChange={handlePhoneChange}
            placeholder="Số điện thoại (bắt đầu bằng 0, 10–11 số)"
            className="w-full border rounded-md p-2"
            required
            inputMode="tel"
            pattern="^0[0-9]{9,10}$"
            title="Số điện thoại phải bắt đầu bằng 0 và có 10–11 chữ số"
          />
          <textarea
            name="address"
            value={userInfo.address}
            onChange={handleChange}
            placeholder="Địa chỉ giao hàng"
            className="w-full border rounded-md p-2 h-24"
            required
          />

          <div className="space-y-2">
            <p className="text-sm font-medium text-gray-700">
              Phương thức thanh toán
            </p>
            <label className="flex items-center gap-2 text-sm cursor-pointer">
              <input
                type="radio"
                name="paymentMethod"
                value="cod"
                checked={paymentMethod === "cod"}
                onChange={(e) => setPaymentMethod(e.target.value)}
              />
              Thanh toán khi nhận hàng (COD)
            </label>
            <label className="flex items-center gap-2 text-sm cursor-pointer">
              <input
                type="radio"
                name="paymentMethod"
                value="pay_now"
                checked={paymentMethod === "pay_now"}
                onChange={(e) => setPaymentMethod(e.target.value)}
              />
              Thanh toán khi đặt hàng
            </label>

            {paymentMethod === "pay_now" ? (
              <div className="mt-2 p-3 rounded-md bg-blue-50 text-xs text-slate-700">
                <p className="font-semibold mb-1">Hướng dẫn thanh toán:</p>
                <p>Ngân hàng: TP Bank</p>
                <p>STK: 57869403906</p>
                <p>Nội dung: Thanh toan don #{Date.now()}</p>
              </div>
            ) : null}
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 text-white py-2 rounded-md font-semibold hover:bg-blue-700 cursor-pointer"
          >
            {loading ? "Đang xử lý..." : "Xác nhận đặt hàng"}
          </button>
        </form>

        <div className="bg-white shadow rounded-lg p-6">
          <h2 className="text-lg font-semibold text-gray-700 mb-4">
            Tóm tắt đơn hàng
          </h2>

          <ul className="divide-y text-gray-600">
            {pricedItems.map((i) => {
              const qty = Number(i.quantity || 1);
              const unit = Number(i.price || 0);
              const sub = qty * unit;
              const hasSale = Boolean(i.hasSale);
              const original = Number(i.originalPrice || unit);
              const percent = Number(i.salePercent || 0);

              return (
                <li
                  key={i.id}
                  className="py-3 flex items-center justify-between gap-3"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    {i.image ? (
                      <img
                        src={i.image}
                        alt={i.title}
                        className="w-12 h-16 object-cover rounded border bg-slate-100 shrink-0"
                        onError={(e) => {
                          e.currentTarget.style.display = "none";
                        }}
                      />
                    ) : (
                      <div className="w-12 h-16 rounded border bg-slate-100 text-[10px] text-slate-400 flex items-center justify-center shrink-0">
                        No image
                      </div>
                    )}

                    <div className="min-w-0">
                      <p className="font-medium text-gray-800 truncate">
                        {i.title}
                      </p>

                      <div className="flex items-center gap-2 text-xs">
                        {hasSale ? (
                          <>
                            <span className="text-red-600 font-semibold">
                              {unit.toLocaleString("vi-VN")}₫
                            </span>
                            <span className="line-through text-slate-400">
                              {original.toLocaleString("vi-VN")}₫
                            </span>
                            <span className="px-1.5 py-0.5 rounded bg-red-100 text-red-600 font-semibold">
                              -{percent}%
                            </span>
                          </>
                        ) : (
                          <span className="text-slate-600">
                            {unit.toLocaleString("vi-VN")}₫/sp
                          </span>
                        )}
                      </div>

                      <p className="text-xs text-slate-500">× {qty}</p>
                    </div>
                  </div>

                  <div className="font-semibold text-gray-800">
                    {sub.toLocaleString("vi-VN")}₫
                  </div>
                </li>
              );
            })}
          </ul>

          <div className="mt-4 flex justify-between font-bold text-gray-800">
            <span>Tổng cộng:</span>
            <span className="text-blue-600">
              {total.toLocaleString("vi-VN")}₫
            </span>
          </div>
          <p className="mt-3 text-sm text-slate-500">
            Phương thức:{" "}
            {paymentMethod === "cod"
              ? "Thanh toán khi nhận hàng (COD)"
              : "Thanh toán khi đặt hàng"}
          </p>
        </div>
      </div>
    </div>
  );
};

export default CheckOut;
