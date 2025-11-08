// src/services/productsApi.js
import axios from "axios";

const BASE_URL = "http://localhost:3000/products";

export const getProducts = async () => {
  const res = await axios.get(BASE_URL);
  return res.data;
};

export const getProductById = async (id) => {
  const res = await axios.get(`${BASE_URL}/${id}`);
  return res.data;
};

export const updateProductStock = async (id, newStock) => {
  const res = await axios.patch(`${BASE_URL}/${id}`, { stock: newStock });
  return res.data;
};

export const updateProduct = async (id, payload) => {
  const res = await axios.patch(`${BASE_URL}/${id}`, payload);
  return res.data;
};

export const deleteProduct = async (id) => {
  await axios.delete(`${BASE_URL}/${id}`);
};

export const createProductAutoId = async (payload) => {
  const body = {
    title: payload.title || "",
    author: payload.author || "", // Có thể giữ lại để lưu tên tác giả (nếu cần)
    price: Number(payload.price) || 0,
    stock: Number(payload.stock) || 0,
    image: payload.image || "",
    description: payload.description || "",
    categoryId: payload.categoryId || "", // Thêm categoryId vào payload
    brandId: payload.brandId || "", // Thêm brandId vào payload
    sale: payload.sale || null,
  };

  const res = await axios.post(BASE_URL, body);
  return res.data;
};
