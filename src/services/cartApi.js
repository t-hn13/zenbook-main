// src/services/cartApi.js
import { api } from "../lib/axios"; // ✅ dùng axios instance có ENV

const CART_PATH = "/cart";
const PRODUCT_PATH = "/products";

// ✅ Tính đơn giá sau sale
const getEffectivePrice = (p) => {
  const base = Number(p.price || 0);
  const sale = p.sale;
  if (sale && sale.active && Number(sale.percent) > 0) {
    return Math.round(base * (1 - Number(sale.percent) / 100));
  }
  return base;
};

// =========================
// 1) LẤY GIỎ HÀNG
// =========================
export const getCart = async () => {
  const res = await api.get(CART_PATH);
  return res.data;
};

// =========================
// 2) THÊM VÀO GIỎ (giới hạn theo stock thật)
// =========================
export const addToCartServer = async (product) => {
  // lấy item cùng id trong giỏ
  const found = await api.get(`${CART_PATH}?id=${product.id}`);
  const exists = found.data?.[0];

  // lấy sản phẩm mới nhất từ bảng products
  const pRes = await api.get(`${PRODUCT_PATH}/${product.id}`);
  const latest = pRes.data;
  const stock = Number(latest?.stock ?? 0);
  if (stock <= 0) throw new Error("Sản phẩm đã hết hàng!");

  // đơn giá sau sale (chuẩn)
  const unitPrice = getEffectivePrice(latest);

  if (exists) {
    if ((exists.quantity || 1) >= stock) {
      throw new Error(
        `Bạn đã thêm tối đa (${stock}) sản phẩm này trong giỏ hàng.`
      );
    }
    const updated = await api.patch(`${CART_PATH}/${exists.id}`, {
      quantity: (exists.quantity || 1) + 1,
      // giữ nguyên price đã lưu (đang là đơn giá sau sale từ lần đầu)
    });
    return updated.data;
  } else {
    const added = await api.post(CART_PATH, {
      id: latest.id, // dùng id sản phẩm làm id trong giỏ (như bạn đang làm)
      title: latest.title,
      price: unitPrice, // ✅ LƯU GIÁ SAU SALE
      originalPrice: latest.price,
      image: latest.image,
      quantity: 1,
    });
    return added.data;
  }
};

// =========================
// 3) CẬP NHẬT SL
// =========================
export const updateCartItem = async (id, newQuantity) => {
  const res = await api.patch(`${CART_PATH}/${id}`, { quantity: newQuantity });
  return res.data;
};

// =========================
// 4) XOÁ 1 MÓN
// =========================
export const deleteCartItem = async (id) => {
  await api.delete(`${CART_PATH}/${id}`);
};

// =========================
// 5) XOÁ TOÀN BỘ GIỎ
// =========================
export const clearCart = async () => {
  const res = await api.get(CART_PATH);
  for (const item of res.data) {
    await api.delete(`${CART_PATH}/${item.id}`);
  }
};
