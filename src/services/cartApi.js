// // src/services/cartApi.js
// import { api } from "../lib/axios";

// // collection
// const CART_PATH = "/cart";
// const PRODUCTS_PATH = "/products";

// const getEffectivePrice = (p) => {
//   const base = Number(p?.price || 0);
//   const sale = p?.sale;
//   if (sale && sale.active && Number(sale.percent) > 0) {
//     return Math.round(base * (1 - Number(sale.percent) / 100));
//   }
//   return base;
// };

// /**
//  * Lấy giỏ hàng theo userId
//  */
// export const getCart = async (userId) => {
//   if (!userId) return []; // chưa đăng nhập => giỏ rỗng ở client
//   const res = await api.get(CART_PATH, { params: { userId } });
//   return Array.isArray(res.data) ? res.data : [];
// };

// /**
//  * Thêm vào giỏ theo userId
//  */
// export const addToCartServer = async (product, userId) => {
//   if (!userId) throw new Error("Bạn cần đăng nhập để thêm vào giỏ.");

//   // lấy stock mới nhất
//   const pRes = await api.get(`${PRODUCTS_PATH}/${product.id}`);
//   const latest = pRes.data;
//   const stock = Number(latest?.stock ?? 0);
//   if (stock <= 0) throw new Error("Sản phẩm đã hết hàng!");

//   const unitPrice = getEffectivePrice(latest);
//   const cartId = `${userId}-${latest.id}`;

//   // đã có trong giỏ?
//   const found = await api.get(CART_PATH, {
//     params: { id: cartId, userId },
//   });
//   const exists = found.data?.[0];

//   if (exists) {
//     if ((exists.quantity || 1) >= stock) {
//       throw new Error(
//         `Bạn đã thêm tối đa (${stock}) sản phẩm này trong giỏ hàng.`
//       );
//     }
//     const updated = await api.patch(`${CART_PATH}/${cartId}`, {
//       quantity: (exists.quantity || 1) + 1,
//     });
//     return updated.data;
//   } else {
//     // Tạo item mới
//     const added = await api.post(CART_PATH, {
//       id: cartId, // cartId duy nhất
//       productId: latest.id, // giữ id sản phẩm riêng
//       userId,
//       title: latest.title,
//       price: unitPrice,
//       originalPrice: latest.price,
//       image: latest.image,
//       quantity: 1,
//     });
//     return added.data;
//   }
// };

// export const updateCartItem = async (cartId, newQuantity) => {
//   const res = await api.patch(`${CART_PATH}/${cartId}`, {
//     quantity: newQuantity,
//   });
//   return res.data;
// };

// export const deleteCartItem = async (cartId) => {
//   await api.delete(`${CART_PATH}/${cartId}`);
// };

// /**
//  * Xóa tất cả item của user trên server (ít dùng).
//  * Yêu cầu đăng nhập để xác định userId.
//  */
// export const clearCartServerByUser = async (userId) => {
//   if (!userId) return;
//   const res = await api.get(CART_PATH, { params: { userId } });
//   const items = Array.isArray(res.data) ? res.data : [];
//   await Promise.all(items.map((it) => api.delete(`${CART_PATH}/${it.id}`)));
// };
// src/services/cartApi.js
import axios from "axios";

const BASE_URL = "http://localhost:3000/cart";
const PRODUCT_URL = "http://localhost:3000/products";

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
  const res = await axios.get(BASE_URL);
  return res.data;
};

// =========================
// 2) THÊM VÀO GIỎ (giới hạn theo stock thật)
// =========================
export const addToCartServer = async (product) => {
  // lấy item cùng id trong giỏ
  const found = await axios.get(`${BASE_URL}?id=${product.id}`);
  const exists = found.data?.[0];

  // lấy sản phẩm mới nhất từ bảng products
  const pRes = await axios.get(`${PRODUCT_URL}/${product.id}`);
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
    const updated = await axios.patch(`${BASE_URL}/${exists.id}`, {
      quantity: (exists.quantity || 1) + 1,
      // giữ nguyên price đã lưu (đang là đơn giá sau sale từ lần đầu)
    });
    return updated.data;
  } else {
    const added = await axios.post(BASE_URL, {
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
  const res = await axios.patch(`${BASE_URL}/${id}`, { quantity: newQuantity });
  return res.data;
};

// =========================
// 4) XOÁ 1 MÓN
// =========================
export const deleteCartItem = async (id) => {
  await axios.delete(`${BASE_URL}/${id}`);
};

// =========================
// 5) XOÁ TOÀN BỘ GIỎ
// =========================
export const clearCart = async () => {
  const res = await axios.get(BASE_URL);
  for (const item of res.data) {
    await axios.delete(`${BASE_URL}/${item.id}`);
  }
};
