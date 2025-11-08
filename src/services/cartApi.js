// src/services/cartApi.js
import axios from "axios";

const BASE_URL = "http://localhost:3000/cart";
const PRODUCT_URL = "http://localhost:3000/products";
const getEffectivePrice = (p) => {
  const base = Number(p.price || 0);
  const sale = p.sale;
  if (sale && sale.active && Number(sale.percent) > 0) {
    return Math.round(base * (1 - Number(sale.percent) / 100));
  }
  return base;
};
export const getCart = async () => {
  const res = await axios.get(BASE_URL);
  return res.data;
};
export const addToCartServer = async (product) => {
  const found = await axios.get(`${BASE_URL}?id=${product.id}`);
  const exists = found.data?.[0];
  const pRes = await axios.get(`${PRODUCT_URL}/${product.id}`);
  const latest = pRes.data;
  const stock = Number(latest?.stock ?? 0);
  if (stock <= 0) throw new Error("Sản phẩm đã hết hàng!");
  const unitPrice = getEffectivePrice(latest);

  if (exists) {
    if ((exists.quantity || 1) >= stock) {
      throw new Error(
        `Bạn đã thêm tối đa (${stock}) sản phẩm này trong giỏ hàng.`
      );
    }
    const updated = await axios.patch(`${BASE_URL}/${exists.id}`, {
      quantity: (exists.quantity || 1) + 1,
    });
    return updated.data;
  } else {
    const added = await axios.post(BASE_URL, {
      id: latest.id,
      title: latest.title,
      price: unitPrice,
      originalPrice: latest.price,
      image: latest.image,
      quantity: 1,
    });
    return added.data;
  }
};
export const updateCartItem = async (id, newQuantity) => {
  const res = await axios.patch(`${BASE_URL}/${id}`, { quantity: newQuantity });
  return res.data;
};
export const deleteCartItem = async (id) => {
  await axios.delete(`${BASE_URL}/${id}`);
};
export const clearCart = async () => {
  const res = await axios.get(BASE_URL);
  for (const item of res.data) {
    await axios.delete(`${BASE_URL}/${item.id}`);
  }
};
