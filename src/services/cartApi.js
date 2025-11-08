// src/services/cartApi.js
import { api } from "../lib/axios";

// collection
const CART_PATH = "/cart";
const PRODUCTS_PATH = "/products";

const getEffectivePrice = (p) => {
  const base = Number(p?.price || 0);
  const sale = p?.sale;
  if (sale && sale.active && Number(sale.percent) > 0) {
    return Math.round(base * (1 - Number(sale.percent) / 100));
  }
  return base;
};

/**
 * Lấy giỏ hàng theo userId
 */
export const getCart = async (userId) => {
  if (!userId) return []; // chưa đăng nhập => giỏ rỗng ở client
  const res = await api.get(CART_PATH, { params: { userId } });
  return Array.isArray(res.data) ? res.data : [];
};

/**
 * Thêm vào giỏ theo userId
 */
export const addToCartServer = async (product, userId) => {
  if (!userId) throw new Error("Bạn cần đăng nhập để thêm vào giỏ.");

  // lấy stock mới nhất
  const pRes = await api.get(`${PRODUCTS_PATH}/${product.id}`);
  const latest = pRes.data;
  const stock = Number(latest?.stock ?? 0);
  if (stock <= 0) throw new Error("Sản phẩm đã hết hàng!");

  const unitPrice = getEffectivePrice(latest);
  const cartId = `${userId}-${latest.id}`;

  // đã có trong giỏ?
  const found = await api.get(CART_PATH, {
    params: { id: cartId, userId },
  });
  const exists = found.data?.[0];

  if (exists) {
    if ((exists.quantity || 1) >= stock) {
      throw new Error(
        `Bạn đã thêm tối đa (${stock}) sản phẩm này trong giỏ hàng.`
      );
    }
    const updated = await api.patch(`${CART_PATH}/${cartId}`, {
      quantity: (exists.quantity || 1) + 1,
    });
    return updated.data;
  } else {
    // Tạo item mới
    const added = await api.post(CART_PATH, {
      id: cartId, // cartId duy nhất
      productId: latest.id, // giữ id sản phẩm riêng
      userId,
      title: latest.title,
      price: unitPrice,
      originalPrice: latest.price,
      image: latest.image,
      quantity: 1,
    });
    return added.data;
  }
};

export const updateCartItem = async (cartId, newQuantity) => {
  const res = await api.patch(`${CART_PATH}/${cartId}`, {
    quantity: newQuantity,
  });
  return res.data;
};

export const deleteCartItem = async (cartId) => {
  await api.delete(`${CART_PATH}/${cartId}`);
};

/**
 * Xóa tất cả item của user trên server (ít dùng).
 * Yêu cầu đăng nhập để xác định userId.
 */
export const clearCartServerByUser = async (userId) => {
  if (!userId) return;
  const res = await api.get(CART_PATH, { params: { userId } });
  const items = Array.isArray(res.data) ? res.data : [];
  await Promise.all(items.map((it) => api.delete(`${CART_PATH}/${it.id}`)));
};
