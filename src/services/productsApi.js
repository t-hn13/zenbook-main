// src/services/productsApi.js
import { api } from "../lib/axios"; // chú ý đường dẫn: services -> lib (../)

const BASE_PATH = "/products";

/** Lấy tất cả sản phẩm */
export const getProducts = async () => {
  const res = await api.get(BASE_PATH);
  return res.data;
};

/** Lấy 1 sản phẩm theo id */
export const getProductById = async (id) => {
  const res = await api.get(`${BASE_PATH}/${id}`);
  return res.data;
};

/** Cập nhật tồn kho (chỉ field stock) */
export const updateProductStock = async (id, newStock) => {
  const res = await api.patch(`${BASE_PATH}/${id}`, { stock: newStock });
  return res.data;
};

/** Cập nhật 1 sản phẩm (partial update) */
export const updateProduct = async (id, payload) => {
  const res = await api.patch(`${BASE_PATH}/${id}`, payload);
  return res.data;
};

/** Xoá 1 sản phẩm */
export const deleteProduct = async (id) => {
  await api.delete(`${BASE_PATH}/${id}`);
};

/** Tạo sản phẩm mới (id tự tăng do json-server) */
export const createProductAutoId = async (payload) => {
  const body = {
    title: payload.title || "",
    author: payload.author || "", // giữ nguyên theo code của bạn
    price: Number(payload.price) || 0,
    stock: Number(payload.stock) || 0,
    image: payload.image || "",
    description: payload.description || "",
    categoryId: payload.categoryId || "",
    brandId: payload.brandId || "", // giữ đúng key bạn đang dùng
    sale: payload.sale ?? null,
  };

  const res = await api.post(BASE_PATH, body);
  return res.data;
};
